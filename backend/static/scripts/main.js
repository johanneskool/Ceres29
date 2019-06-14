/**
 * @fileoverview This is the main file of the visualization which handles the creating
 * and the canvas which displays the data.
 *
 * @author Samuel Oosterholt
 * @author Rink Pieters
 * @author Tristan Trouwen
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
        type = gType.pop();
        v.visualizationCanvas = v.createCanvas(window.innerWidth, window.innerHeight);
        //append sketch to given container
        container = pipeline.pop();
        container.appendChild(v.canvas);
        v.canvas.style.visibility = "visible";
        v.colorMode(v.HSL, 100);

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

        //use argument defined type if specified.
        if (type != null) {
            v.visualizationHandler.newVisualization(type, v);
        } else {
            v.visualizationHandler.newVisualization(v.visualizationHandler.mainvis_type, v);
        }

        // fetch data
        v.data_id = data_id;
        v.visualizationHandler.clustering_type = ((v.current_URL.searchParams.get("clustering") == null) ? 'default' : v.current_URL.searchParams.get("clustering"));
        //window.history.replaceState({}, data_id, "/vis/" + data_id + "?vistype=" + v.visualizationHandler.mainvis_type + "&clustering=" + v.visualizationHandler.clustering_type); //change URL but don't fill history
        if (v.current_URL.searchParams.get("x") != null && v.current_URL.searchParams.get("y") != null) v.visualizationHandler.activeCell = P$.createVector(v.current_URL.searchParams.get("x"), v.current_URL.searchParams.get("y"));

        //update the VH data
        let data_identifier = '/data/' + v.data_id + "?type=" + v.visualizationHandler.clustering_type;
        v.visualizationHandler.setData(data_identifier, v);
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
var createVisCanvas = function (type, div) {
    console.log(gType);
    gType.push(type);
    canvasContainer = document.createElement("div");
    canvasContainer.id = div;

    pipeline.push(canvasContainer);

    var sketch = new p5(visualizationSketch);

    let parent = document.getElementById("parentofcanvas");
    parent.appendChild(canvasContainer);
    canvasContainer.style.overflow = "hidden";
    GVH.centerAll();
};

/**
 * Function that gets called when the div parentofcanvas is made.
 * Initializes the visualization loading.
 * Here we can add the standart visualization.
 */
var parentLoad = function () {
    new createVisCanvas(null, 'canvas1');
    // new createVisCanvas(null, 'canvas');
};

/**
 * Because we can't pass arguments to the creation of the canvas,
 * the requested type is a global variable (sadly)
 * @type {array}
 */
var gType = [];

/**
 * Prevents the canvas from being appended to the wrong parent.
 * @type {Array}
 */
var pipeline = [];

/**
 * Function that creates a new visualization, name is the div name containing the canvas.
 * Type null means that it uses the type from the url.
 * @param type
 * @param name
 */
var addVisualization = function (type, name) {
    new createVisCanvas(type, name)
}


/**
 * Removes a visualization based on name
 * @param name
 */
var removeVisualization = function (name) {
    let node = document.getElementById(name);

    while (node.hasChildNodes()) {
        let canvas = node.lastChild;
        for (let i = 0; i < GVH.visDictionary.size(); i++) {
            let key = GVH.visDictionary.keys()[i];
            if (key.canvas == canvas) {
                //key.noLoop();
                GVH.visDictionary.remove(GVH.visDictionary.keys()[i]);
            }
        }
        node.removeChild(node.lastChild);
    }
    node.parentElement.removeChild(node);

    GVH.centerAll();
};


/**
 * Global namespace for p5 functions.
 * @type {p5.Element}
 */
window.P$ = new p5(function (p) {
    /**
     * Create and hide the global namespace / canvas
     */
    p.setup = function () {
        p.canvas = p.createCanvas(0, 0);
        p.canvas.style('display', 'none');
        p.canvas.id("P$");
    };

    p.colorMode(p.HSB, 100);
    p.PRIMARY_COLOR = p.color(65, 100, 10);
    p.SECONDARY_COLOR = p.color(40, 100, 100);

    /**
     * Global function that makes a color corresponding to the weight.
     * @param weight
     * @param minWeight
     * @param maxWeight
     * @param fullyconnected
     * @return {p5.Color}
     */
    p.getWeightedColor = function (weight, minWeight, maxWeight, fullyconnected) {
        let weight1 = Math.log(weight);
        let min;
        let max;
        if (fullyconnected) {
            min = Math.log(minWeight);
        } else {
            min = Math.log(minWeight) - 1;
        }
        max = Math.log(maxWeight);
        var ratio = P$.map(weight1, min, max, 0, 1);

        //use the weight to color the cell.
        return P$.lerpColor(p.PRIMARY_COLOR, p.SECONDARY_COLOR, ratio);
    };

    /**
     * Changes the primary color used, note that this does not update the visualizations.
     * @param primaryColor
     */
    p.setPrimaryColor = function (primaryColor) {
        p.PRIMARY_COLOR = primaryColor;
    };

    /**
     * Changes the primary color used, note that this does not update the visualizations.
     * @param primaryColor
     */
    p.setSecondaryColor = function (secondaryColor) {
        p.SECONDARY_COLOR = secondaryColor;
    }

}, "global sketch");
