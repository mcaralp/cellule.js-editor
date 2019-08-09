window.addEventListener('load', () => 
{
    let oldX     = localStorage.getItem('renderX');
    let oldY     = localStorage.getItem('renderY');
    let oldWidth = localStorage.getItem('renderWidth');

    let x, y, scale;

    let canvas  = document.getElementsByTagName('canvas')[0];
    let cursorX = 0;
    let cursorY = 0;

    if(oldY != null && oldX != null && oldWidth != null)
    {
        x     = parseFloat(oldX);
        y     = parseFloat(oldY);
        scale = parseFloat(oldWidth) / canvas.clientWidth;

        updatecanvas();
    }
    else
    {
        center();
    }

    document.body.addEventListener('wheel', onWheel);
    document.body.addEventListener('mousedown', onMouseDown);
    document.body.addEventListener('mouseup', onMouseUp);
    document.body.addEventListener('dblclick', onDblClick);
    

    function center()
    {
        scale = 1;
        let width  = canvas.clientWidth  * scale;
        let height = canvas.clientHeight * scale;
        let margin = 10;

        let scaleWidth  = (window.innerWidth - margin) / canvas.clientWidth;
        let scaleHeight = (window.innerHeight - margin) / canvas.clientHeight;

        if(height * scaleWidth < window.innerHeight && scaleHeight < scaleWidth)
            scale = scaleWidth;
        else if(width * scaleHeight < window.innerWidth)
            scale = scaleHeight;
        else 
            scale = scaleWidth;
        
        let newWidth = canvas.clientWidth * scale;
        let newHeight = canvas.clientHeight * scale;

        x = (window.innerWidth - newWidth) / 2;
        y = (window.innerHeight - newHeight) / 2;

        updatecanvas();
    }

    function updatecanvas ()
    {
        canvas.style.left      = x + 'px';
        canvas.style.top       = y + 'px';
        canvas.style.transform = `scale(${scale})`;

        localStorage.setItem('renderX', x);
        localStorage.setItem('renderY', y);
        localStorage.setItem('renderWidth', scale * canvas.clientWidth);
    };

    function onDblClick()
    {
        center();
    }

    function onMove(e)
    {
        x += e.clientX - cursorX;
        y += e.clientY - cursorY;

        cursorX = e.clientX;
        cursorY = e.clientY;

        updatecanvas();
    }

    function onMouseDown(e)
    {
        cursorX = e.clientX;
        cursorY = e.clientY;
        document.body.addEventListener('mousemove', onMove);
        document.body.style.cursor = 'move';
    }

    function onMouseUp()
    {
        document.body.removeEventListener('mousemove', onMove);
        document.body.style.cursor = 'default';
    }

    function onWheel (e)
    {
        let mouseX = (e.clientX - x) / scale;
        let mouseY = (e.clientY - y) / scale;

        let scaling = e.deltaY < 0 ? -1 : 1;
        scale += 0.01 * e.deltaY;
        if(scale <= 0) scale = 0.01;

        x = -(mouseX - e.clientX / scale) * scale;
        y = -(mouseY - e.clientY / scale) * scale;

        updatecanvas();
    }
})