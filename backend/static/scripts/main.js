/**
 * @fileoverview This is the main file of the visualization which handles the creating
 * and the canvas which displays the data.
 *
 * @author Samuel Oosterholt
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

        //iniate the main handler
        v.visualizationHandler = GVH;

        //create a new matrix object
        v.visualizationHandler.newVisualization('forceLink', v);

        // fetch data
        v.current_URL = new URL(window.location.href);
        v.data_id = v.current_URL.searchParams.get("data");
        v.clustering_type = ((v.current_URL.searchParams.get("clustering") == null) ? 'fiedler' : v.current_URL.searchParams.get("clustering"));

        //update the VH data
        v.visualizationHandler.setData('/data/' + v.data_id + "?type=" + v.clustering_type, v);
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

    v.mouseDragged = function () {
        if (v.mouseFlag) {
            //update mouse vector
            v.newMouse.x = v.mouseX;
            v.newMouse.y = v.mouseY;

            //mouse was dragged, so update the dragFlag.
            if ((v.newMouse.x - v.oldMouse.x) != 0 || (v.newMouse.y - v.oldMouse.y) != 0) {
              v.dragFlag = true;

              v.visualizationHandler.moveSelected(v.newMouse.x - v.oldMouse.x, v.newMouse.y - v.oldMouse.y, v);

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
        v.zoomFactor = v.visualizationHandler.visDictionary.get(v).getZoomFactor();
        if (zoomIn) {
            //hard to explain in code, get some pen and paper and visualize the transformation.
            v.visualizationHandler.moveSelected(-(v.mouseX - v.visualizationHandler.getSelectedPosition(v).x) * (v.zoomFactor - 1),-(v.mouseY - v.visualizationHandler.getSelectedPosition(v).y) * (v.zoomFactor - 1), v);
            v.visualizationHandler.setSelectedZoomScale(v.visualizationHandler.getSelectedZoomScale(v) / v.zoomFactor, v);
        } else {
            //idem.
            v.visualizationHandler.moveSelected((v.mouseX - v.visualizationHandler.getSelectedPosition(v).x) * (v.zoomFactor - 1) / v.zoomFactor, (v.mouseY - v.visualizationHandler.getSelectedPosition(v).y) * (v.zoomFactor - 1) / v.zoomFactor, v);
            v.visualizationHandler.setSelectedZoomScale(v.visualizationHandler.getSelectedZoomScale(v) * v.zoomFactor, v);
        }
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
window.vis1 = new createVisCanvas('canvas1');


/**
 * Global namespace for p5 functions.
 * @type {p5}
 */
window.P$ = new p5(function (p){}, "global sketch");
