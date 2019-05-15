/**
 * @fileoverview This is the main file of the visualization which handles the creating
 * and the canvas which displays the data.
 *
 * @author Samuel Oosterholt
 */


var visualizationSketch = function (v) {

    /**
     * Canvas which shows the current visualization(s)
     * @type {canvas}
     */
    v.visualizationCanvas;

    /**
     * Main handler for the visualization canvas.
     * @type {VisualizationHandler}
     */
    v.visualizationHandler;

    //basic setup and buffer for matrix to prevent redrawing.
    v.setup = function () {
        v.colorMode(v.HSL, 100);

        v.visualizationCanvas = v.createCanvas(window.innerWidth, window.innerHeight);

        v.frameRate(999);
        v.imageMode(v.CENTER);
        v.rectMode(v.CENTER);

        //puts the canvas under the 'canvas' div
        v.visualizationCanvas.parent('canvas');

        //iniate the main handler
        v.visualizationHandler = new VisualizationHandler();
        v.visualizationHandler.setCanvas(this);
        v.visualizationHandler.setDiv(v.visualizationCanvas);

        //create a new matrix object
        v.visualizationHandler.newVisualization('matrix');

        // fetch data
        v.data_id = new URL(window.location.href).searchParams.get("data");

        console.log(v.data_id);

        //update the VH data
        v.visualizationHandler.setData('/data/' + v.data_id + "?type=fiedler");
        //makes the current matrix the one to show.

        //disable the anti-aliasing.
        v.context = document.getElementById("defaultCanvas0");
        v.ctx = v.context.getContext('2d');
        v.ctx.imageSmoothingEnabled = false;

        v.setupListeners();

        //I can only create vectors in a function. (or I would have to namespace main.js, and I wont.)
        v.oldMouse = v.createVector();
        v.newMouse = v.createVector();
    };

    /**
     * Mouse position vector at the begin of the loop.
     * @Type {vector}
     */
    v.oldMouse;

    /**
     * Mouse position vector at the end of the loop.
     * @Type {vector}
     */
    v.newMouse;

    /**
     * Flag is true if mouse is (currently) clicked.
     * @type {boolean}
     */
    v.mouseFlag = false;

    /**
     * Setup for the canvas listeners, zooming scrolling and clicking.
     */
    v.setupListeners = function () {
        //for zooming
        document.getElementById("defaultCanvas0").onwheel = function (event) {
            if (event.deltaY < 0) {
                //zoom in
                v.zoom(true);
            } else {
                //else zoom out
                v.zoom(false);
            }
            //prevent the page from scrolling
            event.preventDefault();
        };
        //onmousewheel has different support than onwheel for some reason.
        document.getElementById("defaultCanvas0").onmousewheel = function (event) {
            if (event.deltaY < 0) {
                v.zoom(true);
            } else {
                v.zoom(false);
            }
            event.preventDefault();
        };
        //on click
        document.getElementById("defaultCanvas0").onmousedown = function (event) {
            v.mouseFlag = true;
            v.dragFlag = false;

            //fix that prevents the visualization from moving when the window regains focus.
            v.oldMouse.x = v.mouseX;
            v.oldMouse.y = v.mouseY;
            v.newMouse.x = v.mouseX;
            v.newMouse.y = v.mouseY;
        };
        //on release
        document.getElementById("defaultCanvas0").onmouseup = function (event) {
            v.mouseFlag = false;

            //if mouse has not been dragged, send click to visualization.
            if (!v.dragFlag) {
                v.visualizationHandler.click(v.mouseX, v.mouseY);
            }

            //reset dragFlag flag.
            v.dragFlag = false;
        };
    };

    /**
     * Flag is true if mouse has been dragged since click. Else false.
     * @type {boolean}
     */
    v.dragFlag = false;

    v.mouseDragged = function () {
        if (v.mouseFlag) {
            //mouse was dragged, so update the dragFlag.
            v.dragFlag = true;

            //update mouse vector
            v.newMouse.x = v.mouseX;
            v.newMouse.y = v.mouseY;

            v.visualizationHandler.moveActive(v.newMouse.x - v.oldMouse.x, v.newMouse.y - v.oldMouse.y);

            //update old mouse vector positions.
            v.oldMouse.x = v.mouseX;
            v.oldMouse.y = v.mouseY;
        }
    };

    /**
     * Function that handles the zooming.
     * Updates the Zoomscale by the zoomfactor and transform the visualization such
     * that the mouse does not change position relative to the visualization.
     * @param zoomIn {boolean} true if the function should zoom in, false if it should zoom out.
     */
    v.zoom = function (zoomIn) {
        v.zoomFactor = v.visualizationHandler.active.getZoomFactor();
        if (zoomIn) {
            //hard to explain in code, get some pen and paper and visualize the transformation.
            v.visualizationHandler.moveActive(-(v.mouseX - v.visualizationHandler.getActivePosition().x) * (v.zoomFactor - 1), -(v.mouseY - v.visualizationHandler.getActivePosition().y) * (v.zoomFactor - 1));
            v.visualizationHandler.setActiveZoomScale(v.visualizationHandler.active.getZoomScale() / v.zoomFactor);
        } else {
            //idem.
            v.visualizationHandler.moveActive((v.mouseX - v.visualizationHandler.getActivePosition().x) * (v.zoomFactor - 1) / v.zoomFactor, (v.mouseY - v.visualizationHandler.getActivePosition().y) * (v.zoomFactor - 1) / v.zoomFactor);
            v.visualizationHandler.setActiveZoomScale(v.visualizationHandler.active.getZoomScale() * v.zoomFactor);
        }
    };

    v.draw = function () {
        //wipe background
        v.background(66, 35, 22);
        v.fill(0, 0, 0, 100);
        if (v.visualizationHandler.active.matrix !== undefined) {
            v.visualizationCanvas.image(v.visualizationHandler.active.matrix, v.width/2, v.height/2);
        }
        v.visualizationHandler.drawAll();
    };


    /**
     * Rescales the canvas when the windows has been changed
     */
    window.onresize = function () {
        v.w = window.innerWidth;
        v.h = window.innerHeight;
        //visualizationCanvas.resizeCanvas(w, h);
        v.loadingAnimation.onresize();
    };

};

window.vis0 = new p5(visualizationSketch);

window.P$ = new p5(function (p){}, "global sketch");