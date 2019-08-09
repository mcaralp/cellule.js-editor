
let defaultSketch = `function setup()
{

}

function construct()
{

}

function loop()
{

}`;

function renderPage(code)
{
    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Render at "${(new Date()).toString()}"</title>
    <link rel="stylesheet" href="/css/render.css">
</head>

<body>
    <script src="/js/ca/ca.min.js"></script>
    <script src="/js/render.js"></script>
    <script>${code}</script>
</body>

</html>`;
}

let appComponent = Vue.component('app', 
{
    template: '#apptemplate',
    
    data: function () { return {
        closed: false,
        resizing: false,
        moving: false,
        name: 'New sketch',
        popupX: 50,
        popupY: 50,
        popupWidth: 400, 
        popupHeight: 400,
        stopped: false,
        hasUndo: false,
        hasRedo: false,
        isClean: true,
        lastUpdate: 0,
        autoRestart: false,
        sketch: defaultSketch,
        render: renderPage(defaultSketch)
    } },

    created: function()
    {
        let oldSketch = localStorage.getItem('sketch');
        let oldX      = localStorage.getItem('popupX');
        let oldY      = localStorage.getItem('popupY');
        let oldWidth  = localStorage.getItem('popupWidth');
        let oldHeight = localStorage.getItem('popupHeight');
        
        if(oldSketch != null)
        {
            this.sketch = oldSketch;
            this.render = renderPage(oldSketch);
        }

        if(oldX != null && oldY != null)
        {
            this.popupX      = parseFloat(oldX);
            this.popupY      = parseFloat(oldY);
        }

        if(oldWidth != null && oldHeight != null)
        {
            this.popupWidth  = parseFloat(oldWidth);
            this.popupHeight = parseFloat(oldHeight);
        }
    },

    mounted: function()
    {
        this.$resizing = false;
        this.$moving   = false;

        this.$editor = ace.edit('text', {
            mode: "ace/mode/javascript",
            selectionStyle: "text"
        });

        this.$editor.commands.addCommand({
            name: "refresh",
            bindKey: {win: "Ctrl-r", mac: "Command-r"},
            exec: this.refresh
        });

        this.$editor.on('input', this.edit);
        this.$editor.setValue(this.sketch, -1);
        this.$editor.getSession().getUndoManager().reset();
        this.$editor.getSession().getUndoManager().markClean();
        
    },

    methods: {
        resetPos: function()
        {
            this.popupX = 50;
            this.popupY = 50;
            this.popupWidth = 400;
            this.popupHeight = 400;
        },

        redo: function()
        {
            this.$editor.getSession().getUndoManager().redo();
        },

        undo: function()
        {
            this.$editor.getSession().getUndoManager().undo();
        },

        edit: function(e)
        {
            this.hasUndo = this.$editor.getSession().getUndoManager().hasUndo();
            this.hasRedo = this.$editor.getSession().getUndoManager().hasRedo();
            this.isClean = this.$editor.getSession().getUndoManager().isClean();

            localStorage.setItem('sketch', this.$editor.getValue());

            if(!this.autoRestart) return;

            clearTimeout(this.$autoRestartTimeout);
            this.$autoRestartTimeout = setTimeout(this.refresh, 2000);
            
        },

        refresh: function()
        {
            this.sketch = this.$editor.getValue();
            this.render = renderPage(this.sketch);
        },

        toggleAutoRestart: function()
        {
            this.autoRestart = !this.autoRestart;
        },

        toggleStopped: function(e)
        {
            this.sketch = this.$editor.getValue();
            this.render = renderPage(this.sketch);
            this.stopped = !this.stopped;
        },

        move: function(e)
        {
            let difX = e.pageX - this.$cursorX;
            let difY = e.pageY - this.$cursorY;

            this.$cursorX = e.pageX;
            this.$cursorY = e.pageY;
            
            if(this.moving)
            {
                this.popupX = this.popupX + difX;
                this.popupY = this.popupY + difY;

                localStorage.setItem('popupX', this.popupX);
                localStorage.setItem('popupY', this.popupY);
            }
            if(this.resizing)
            {
                let newWidth  = this.popupWidth + difX;
                let newHeight = this.popupHeight + difY;
                if(newWidth  < 320) newWidth  = 320;
                if(newHeight < 20)  newHeight = 20;

                this.popupWidth  = newWidth;
                this.popupHeight = newHeight;

                this.$editor.resize();

                localStorage.setItem('popupWidth',  this.popupWidth);
                localStorage.setItem('popupHeight', this.popupHeight);
            }
        },

        stop: function()
        {
            this.moving = false;
            this.resizing = false;
        },

        startMoveEditor: function(e)
        {
            if(this.$lastClick != undefined)
            {
                let now = Date.now();
                if(now - this.$lastClick < 300)
                {
                    this.$lastClick = undefined;
                    this.resetPos();
                    return;
                }
            }
            this.$lastClick = Date.now();

            this.moving = true;

            this.$cursorX = e.pageX;
            this.$cursorY = e.pageY;
        },

        startResizeEditor: function(e)
        {
            this.resizing = true;

            this.$cursorX = e.pageX;
            this.$cursorY = e.pageY;
        },

        closeEditor: function(e)
        {   
            this.closed = true;
        }
        
    }

});


new Vue(
{
    el:'#container',
    components: 
    {
        appComponent: appComponent
    }
});
