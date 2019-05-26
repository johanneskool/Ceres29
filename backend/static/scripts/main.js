/**
 * @fileoverview This is the main file of the visualization which handles the creating
 * and the canvas which displays the data.
 *
 * @author Samuel Oosterholt
 * @author Rink Pieters
 */


/**
 * Main handler for the visualization canvas.
 * @type {VisualizationHandler}
 */
var GVH = new VisualizationHandler();


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

    /**
     * Set the visualization canvas parent
     * @param {div} parent
     */
    v.setParent = function (parent) {
        v.parent = parent;
    };

    //basic setup and buffer for matrix to prevent redrawing.
    v.setup = function () {
        v.colorMode(v.HSL, 100);
        v.visualizationCanvas = v.createCanvas(window.innerWidth, window.innerHeight);

        v.frameRate(999);
        v.imageMode(v.CENTER);
        v.rectMode(v.CENTER);

        //puts the canvas under the 'canvas' div
        v.visualizationCanvas.parent(v.parent);

        //initiate the main handler
        v.visualizationHandler = GVH;

        //create a new matrix object
        v.current_URL = new URL(window.location.href);
        v.visualizationHandler.mainvis_type = ((v.current_URL.searchParams.get("vistype") == null) ? 'matrix' : v.current_URL.searchParams.get("vistype"));
        v.visualizationHandler.newVisualization(v.visualizationHandler.mainvis_type, v);

        // fetch data
        v.data_id = data_id;
        v.visualizationHandler.clustering_type = ((v.current_URL.searchParams.get("clustering") == null) ? 'cluster' : v.current_URL.searchParams.get("clustering"));
        //window.history.replaceState({}, data_id, "/vis/" + data_id + "?vistype=" + v.visualizationHandler.mainvis_type + "&clustering=" + v.visualizationHandler.clustering_type); //change URL but don't fill history
        if (v.current_URL.searchParams.get("x") != null && v.current_URL.searchParams.get("y") != null) v.visualizationHandler.activeCell = P$.createVector(v.current_URL.searchParams.get("x"), v.current_URL.searchParams.get("y"));

        //update the VH data
        v.visualizationHandler.setData('/data/' + v.data_id + "?type=" + v.visualizationHandler.clustering_type, v);
        //makes the current matrix the one to show.

        //disable the anti-aliasing.
        v.ctx = v.canvas.getContext('2d');
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
        v.canvas.onwheel = function (event) {
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
        v.canvas.onmousewheel = function (event) {
            if (event.deltaY < 0) {
                v.zoom(true);
            } else {
                v.zoom(false);
            }
            event.preventDefault();
        };
        //on click
        v.canvas.onmousedown = function (event) {
            v.mouseFlag = true;
            v.dragFlag = false;

            //fix that prevents the visualization from moving when the window regains focus.
            v.oldMouse.x = v.mouseX;
            v.oldMouse.y = v.mouseY;
            v.newMouse.x = v.mouseX;
            v.newMouse.y = v.mouseY;
        };
        //on release
        v.canvas.onmouseup = function (event) {
            v.mouseFlag = false;

            //if mouse has not been dragged, send click to visualization.
            if (!v.dragFlag) {
                v.visualizationHandler.clickSelected(v.mouseX, v.mouseY, v);
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

    /**
     * Calls the drag function for this canvas
     * the xOff and yOff are the difference in the mouse positions from this and the last frame.
     * The drag function is only called for non 0 situaions.
     */
    v.mouseDragged = function () {
        if (v.mouseFlag) {
            //update mouse vector
            v.newMouse.x = v.mouseX;
            v.newMouse.y = v.mouseY;

            let xOff = v.newMouse.x - v.oldMouse.x;
            let yOff = v.newMouse.y - v.oldMouse.y;

            //mouse was dragged, so update the dragFlag.
            if (xOff != 0 || yOff != 0) {
                v.dragFlag = true;

                v.visualizationHandler.dragSelected(xOff, yOff, v);

                //update old mouse vector positions.
                v.oldMouse.x = v.mouseX;
                v.oldMouse.y = v.mouseY;
            }
        }
    };

    /**
     * Function that handles the zooming.
     * Updates the Zoomscale by the zoomfactor and transform the visualization such
     * that the mouse does not change position relative to the visualization.
     * @param zoomIn {boolean} true if the function should zoom in, false if it should zoom out.
     */
    v.zoom = function (zoomIn) {
        v.visualizationHandler.zoomSelected(zoomIn, v.mouseX, v.mouseY, v);
    };

    v.draw = function () {
        //wipe background
        v.background(66, 35, 22);
        v.fill(0, 0, 0, 100);
        v.visualizationHandler.drawSelected(v);
    };


    /**
     * Rescales the canvas when the windows has been changed
     */
    window.onresize = function () {
        v.w = window.innerWidth;
        v.h = window.innerHeight;
        v.resizeCanvas(v.w, v.h);
    };

};

/**
 * Create a new visualization and add it to a div
 * @param {div} div to add the visualization to.
 * @return {p5}
 */
var createVisCanvas = function (div) {
    var sketch = new p5(visualizationSketch);
    sketch.setParent(div);
    return sketch;
};

window.vis0 = new createVisCanvas('canvas');
//window.vis1 = new createVisCanvas('canvas1');


let globalthing;

/**
 * Global namespace for p5 functions.
 * @type {p5}
 */
window.P$ = new p5(function (p) {
    p.setup = function () {
        p.canvas = p.createCanvas(0, 0);
        p.canvas.style('display', 'none');
        p.canvas.id("P$");
        i
    };
}, "global sketch");
