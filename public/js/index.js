
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
    <script src="/js/hammer/hammer.min.js"></script>
    <script src="/js/ca/ca.min.js"></script>
    <script src="/js/render.js"></script>
    <script>${code}</script>
</body>

</html>`;
}


let editorComponent = Vue.component('editor', 
{
    template: '#editortemplate',
    
    data: function () { return {
        closed: true,
        resizing: false,
        moving: false,
        name: 'New sketch',
        popupX: 0,
        popupY: 0,
        popupWidth: 0, 
        popupHeight: 0,
        stopped: false,
        hasUndo: false,
        hasRedo: false,
        isClean: true,
        lastUpdate: 0,
        autoRestart: false,
        secondTabType: 0,
        secondTab: false,
        render: '',
        hideFlashMessage: true
    } },

    props: ['sketch'],

    mounted: function()
    {
        this.$editor = ace.edit('text', {
            mode: "ace/mode/javascript",
            selectionStyle: "text",
        });
        this.$editor.setValue(this.sketch, -1);
        this.$editor.getSession().getUndoManager().reset();
        this.$editor.getSession().getUndoManager().markClean();
        this.$editor.on('input', this.edit);

        this.$mcResize = new Hammer(this.$refs.resize);
        this.$mcResize.on("pan", this.resize);
        this.$mcResize.get('pan').set({ threshold: 0 });
        this.$mcResize.get('pan').set({ direction: Hammer.DIRECTION_ALL });

        this.$mcMove = new Hammer(this.$refs.move);
        this.$mcMove.on("pan", this.move);
        this.$mcMove.get('pan').set({ threshold: 0 });
        this.$mcMove.get('pan').set({ direction: Hammer.DIRECTION_ALL });

        this.$cursorX  = 0;
        this.$cursorY  = 0;
        this.$resizing = false;
        this.$moving   = false;

        this.render = renderPage(this.sketch);

        let oldX      = localStorage.getItem('popupX');
        let oldY      = localStorage.getItem('popupY');
        let oldWidth  = localStorage.getItem('popupWidth');
        let oldHeight = localStorage.getItem('popupHeight');
        let oldClosed = localStorage.getItem('popupClosed');
 
        if(oldClosed && oldX != null && oldY != null && oldWidth != null && oldHeight != null)
        {
            this.popupX      = parseFloat(oldX);
            this.popupY      = parseFloat(oldY);

            this.popupWidth  = parseFloat(oldWidth);
            this.popupHeight = parseFloat(oldHeight);
            this.closed      = parseInt(oldClosed) == 1;

            setTimeout(() => this.$editor.resize(), 10);
        }
        else 
            this.resetPos();

        
    },

    beforeDestroy: function()
    {
        this.$editor.destroy();
    },

    methods: {
        openSettings: function()
        {
            this.secondTab = true;
            this.secondTabType = 0;
        },

        openPassword: function()
        {
            this.secondTab = true;
            this.secondTabType = 1;
        },

        openText: function()
        {
            this.secondTab = false;
        },

        fullscreen : function()
        {
            let width = window.innerWidth;
            let height = window.innerHeight;

            this.popupWidth = width;
            this.popupHeight = height - 100;
            this.popupX = 0;
            this.popupY = 0;

            localStorage.setItem('popupWidth',  this.popupWidth);
            localStorage.setItem('popupHeight', this.popupHeight);
            localStorage.setItem('popupX', this.popupX);
            localStorage.setItem('popupY', this.popupY);

            setTimeout(() => this.$editor.resize(), 10);
        },

        resetPos: function()
        {
            let popupWidth = 400;
            let margin = 20;
            
            if(window.innerWidth < popupWidth + margin * 2)
            {
                this.fullscreen();
                return;
            }

            this.popupX = margin;
            this.popupY = margin;
            this.popupWidth = popupWidth;
            this.popupHeight = popupWidth;

            localStorage.setItem('popupWidth',  this.popupWidth);
            localStorage.setItem('popupHeight', this.popupHeight);
            localStorage.setItem('popupX', this.popupX);
            localStorage.setItem('popupY', this.popupY);

            setTimeout(() => this.$editor.resize(), 10);
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

        resize: function(ev)
        {
            let difX = ev.deltaX - this.$cursorX;
            let difY = ev.deltaY - this.$cursorY;

            this.$cursorX = ev.deltaX;
            this.$cursorY = ev.deltaY;

            let newWidth  = this.popupWidth + difX;
            let newHeight = this.popupHeight + difY;
            if(newWidth  < 320) newWidth  = 320;
            if(newHeight < 20)  newHeight = 20;

            this.popupWidth  = newWidth;
            this.popupHeight = newHeight;

            this.$editor.resize();

            localStorage.setItem('popupWidth',  this.popupWidth);
            localStorage.setItem('popupHeight', this.popupHeight);
            
            if(ev.isFinal) 
            {
                this.resizing = false;
                this.$cursorX = 0;
                this.$cursorY = 0;
            }
            else this.resizing = true;
        },

        move: function(ev)
        {
            let difX = ev.deltaX - this.$cursorX;
            let difY = ev.deltaY - this.$cursorY;

            this.$cursorX = ev.deltaX;
            this.$cursorY = ev.deltaY;
            
            this.popupX = this.popupX + difX;
            this.popupY = this.popupY + difY;

            localStorage.setItem('popupX', this.popupX);
            localStorage.setItem('popupY', this.popupY);

            if(ev.isFinal) 
            {
                this.moving = false;
                this.$cursorX = 0;
                this.$cursorY = 0;
            }
            else this.moving = true;
           
        },

        stop: function()
        {
            this.moving = false;
            this.resizing = false;
        },

        closeEditor: function(e)
        {   
            this.closed = true;
            localStorage.setItem('popupClosed', 1);
            
        },

        openEditor: function(e)
        {   
            localStorage.setItem('popupClosed', 0);
            this.closed = false;
            this.resetPos();
        },

        copyLink: function()
        {
            navigator.clipboard.writeText(window.location.origin + '/#/src/' + btoa(this.$editor.getValue()));
            this.hideFlashMessage = false;
            setTimeout(() => this.hideFlashMessage = true, 100);
        }
        
    }

});

let checkComponent = Vue.component('check', 
{
    template: '#checktemplate',
    
    data: function () { return {
        sketch: localStorage.getItem('sketch'),
        height: 400
    } },

    mounted: function()
    {
        this.$editor = ace.edit('oldSketch', {
            mode: "ace/mode/javascript",
            selectionStyle: "text",
            readOnly: true
        });

        this.$editor.setValue(this.sketch, -1);
        this.$editor.getSession().getUndoManager().reset();
        this.$editor.getSession().getUndoManager().markClean();

        this.height =
                    this.$editor.getSession().getScreenLength()
                  * this.$editor.renderer.lineHeight
                  + this.$editor.renderer.scrollBar.getWidth();

        setTimeout(() => this.$editor.resize(), 10);
    },

    beforeDestroy: function()
    {
        this.$editor.destroy();
    },

    methods: {
        open: function()
        {
            localStorage.removeItem('sketch');
            this.$router.go();
        },

        cancel: function()
        {
            this.$router.push('/');
        }
    }

});

let urlSketchComponent = Vue.component('urlsketch', 
{
    template: '#urlsketchtemplate',
    data: function () { return {
        loading: true,
        check: false,
        sketch: ''
    } },
    
    components: {
        editor: editorComponent,
        check: checkComponent
    },

    created: function()
    {
        let oldSketch = localStorage.getItem('sketch');   
        this.sketch = atob(this.$route.params.src);
        if(oldSketch != null && oldSketch != this.sketch)
        {
            this.check = true;
        }
        this.loading = false;
    }
});


let newSketchComponent = Vue.component('newsketch', 
{
    template: '#newsketchtemplate',
    data: function () { return {
        loading: true,
        sketch: defaultSketch
    } },

    components: {
        editor: editorComponent
    },

    created: function()
    {
        let oldSketch = localStorage.getItem('sketch');   
        if(oldSketch != null)
            this.sketch = oldSketch;
        this.loading = false;
    }
});

const routes = [
    { path: '/',           component: newSketchComponent },
    { path: '/src/:src',   component: urlSketchComponent }
]


const router = new VueRouter({
    routes: routes
});

new Vue(
{
    el:'#container',
    router: router,
});
