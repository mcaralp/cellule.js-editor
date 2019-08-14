window.addEventListener('load', () => 
{
    let oldX     = localStorage.getItem('renderX');
    let oldY     = localStorage.getItem('renderY');
    let oldWidth = localStorage.getItem('renderWidth');

    let x, y, scale;

    let canvas  = document.getElementsByTagName('canvas')[0];
    let cursorX = 0;
    let cursorY = 0;
    let lastScale = 1;

    let mcMouse = new Hammer(document.body);
    mcMouse.on('pan', onPan.bind(this, 'mouse'));
    mcMouse.on('panstart', onPanStart);
    mcMouse.get('pan').set({ threshold: 0 });
    mcMouse.get('pan').set({ pointers: 1 });
    mcMouse.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let mcTouch = new Hammer(document.body);
    mcTouch.on('pan', onPan.bind(this, 'touch'));
    mcTouch.on('panstart', onPanStart);
    mcTouch.get('pan').set({ threshold: 0 });
    mcTouch.get('pan').set({ pointers: 2 });
    mcTouch.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    let mcPinch = new Hammer(document.body);
    mcPinch.on("pinch", onPinch);
    mcPinch.on('pinchstart', onPinchStart);
    mcPinch.get('pinch').set({ enable: true });

    // let mcTap = new Hammer(document.body);
    // mcPinch.on("tap", onDblClick);
    // mcPinch.get('tap').set({ taps: 2 });

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

    function onPinchStart()
    {
        lastScale = 1;
    }

    function onPinch(e)
    {        
        let centerX = (e.center.x - x) / scale;
        let centerY = (e.center.y - y) / scale;
        

        scale += (e.scale - lastScale) * 2;
        if(scale <= 0) scale = 0.01;
        lastScale = e.scale;

        x = -(centerX - e.center.x / scale) * scale;
        y = -(centerY - e.center.y / scale) * scale;

        updatecanvas();
    }

    function onPanStart()
    {
        cursorX = 0;
        cursorY = 0;
    }

    function onPan(type, e)
    {
        if(type != e.pointerType) return;

        x += e.deltaX - cursorX;
        y += e.deltaY - cursorY;

        cursorX = e.deltaX;
        cursorY = e.deltaY;

        updatecanvas();
    }

    function onWheel (e)
    {
        let mouseX = (e.clientX - x) / scale;
        let mouseY = (e.clientY - y) / scale;

        scale += 0.01 * e.deltaY;
        if(scale <= 0) scale = 0.01;

        x = -(mouseX - e.clientX / scale) * scale;
        y = -(mouseY - e.clientY / scale) * scale;

        updatecanvas();
    }
})