/**
 * @fileoverview This is the main file of the visualization which handels the creating
 * and the canvas which displays the data.
 *
 * @author Samuel Oosterholt
 */

/**
 * Factor by which the scale should change
 * @type {number}
 */
const zoomFactor = 1.5;

/**
 * Current Scale at which the visualization is drawn
 * @TODO make this a property of the current active visualization instead of a global.
 * @type {number}
 */
var zoomScale = 1;

/**
 * A matrix visualization object
 * @TODO should be created from a menu instead of hardcoded.
 * @type {Visualization}
 */
var matrixVis;

/**
 * Flag is true if the matrix has been loaded
 * @TODO make this a property of the current loading visualization instead of a global.
 * @type {boolean}
 */
let visIsLoaded = false;

/**
 * Array of al the currently iniated visualizations.
 * @type {Array}
 */
var visualizations = [];

/**
 * Canvas which shows the current visualization(s)
 * @type {canvas}
 */
let visualizationCanvas;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {
    colorMode(HSL,100);
    visualizationCanvas = createCanvas(window.innerWidth, window.innerHeight);

    frameRate(999);
    imageMode(CENTER);
    rectMode(CENTER);

    //puts the canvas under the 'canvas' div
    visualizationCanvas.parent('canvas');

    //create a new matrix object
    matrixVis = new MatrixVisualization();

    //add the matrix to the list of visualizations.
    visualizations.push(matrixVis);

    // fetch data
    var file_name = new URL(window.location.href).searchParams.get("data");

    //update the matrix data
    matrixVis.setData('/static/json/'+ file_name);

//     outdated:
//     fetch('/static/json/'+ file_name)
//     .then(res => res.json())
//     .then((out_json_data) => {
//         /*console.log(out_json_data);*/
// /*        matrixVis.setData('/static/json/'+ file_name);*/
//     })
//     .catch(err => { throw err });

    //makes the current matrix the one to show.
    matrixVis.setActive(true);

    //disable the anti-aliasing.
    let context = document.getElementById("defaultCanvas0");
    let ctx = context.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    setupListeners();

    //I can only create vectors in a function. (or I would have to namespace main.js, and I wont.)
    oldMouse = createVector();
    newMouse = createVector();
}

/**
 * x offset from dragging the visualization
 * @type {number}
 */
var xOff = 0;

/**
 * y offset from draggin the visualization
 * @type {number}
 */
var yOff = 0;

/**
 * Mouse position vector at the begin of the loop.
 * @Type {vector}
 */
var oldMouse;

/**
 * Mouse position vector at the end of the loop.
 * @Type {vector}
 */
var newMouse;

/**
 * Flag is true if mouse is (currently) clicked.
 * @type {boolean}
 */
var mouseFlag = false;

/**
 * Setup for the canvas listeners, zooming scrolling and clicking.
 */
function setupListeners () {
    //for zooming
    document.getElementById( "defaultCanvas0" ).onwheel = function(event){
        if (event.deltaY < 0) {
            //zoom in
            zoom(true, zoomFactor);
        } else {
            //else zoom out
            zoom(false, zoomFactor);
        }
        //prevent the page from scrolling
        event.preventDefault();
    };
    //onmousewheel has different support than onwheel for some reason.
    document.getElementById( "defaultCanvas0" ).onmousewheel = function(event){
        if (event.deltaY < 0) {
            zoom(true, zoomFactor);
        } else {
            zoom(false, zoomFactor);
        }
        event.preventDefault();
    };
    //on click
    document.getElementById( "defaultCanvas0" ).onmousedown = function(event){
        mouseFlag = true;

        //fix that prevents the visualization from moving when the window regains focus.
        oldMouse.x = mouseX;
        oldMouse.y = mouseY;
        newMouse.x = mouseX;
        newMouse.y = mouseY;
    };
    //on release
    document.getElementById("defaultCanvas0").onmouseup = function (event) {
        mouseFlag = false;

        //if mouse has not been dragged, send click to visualization.
        if (!dragFlag) {
            //TODO update this function to be ambigous, not only for matrixVis. i.e. create a handler.
            matrixVis.click(mouseX, mouseY);
        }

        //reset dragFlag flag.
        dragFlag = false;
    };
}

/**
 * Flag is true if mouse has been dragged since click. Else false.
 * @type {boolean}
 */
var dragFlag = false;

function mouseDragged() {
    if (mouseFlag) {
        //mouse was dragged, so update the dragFlag.
        dragFlag = true;

        //update mouse vector
        newMouse.x = mouseX;
        newMouse.y = mouseY;

        //Add the difference between old and new mouse to the offset.
        xOff += newMouse.x - oldMouse.x;
        yOff += newMouse.y - oldMouse.y;

        //update old mouse vector positions.
        oldMouse.x = mouseX;
        oldMouse.y= mouseY;
    }
}

/**
 * Function that handles the zooming.
 * Updates the Zoomscale by the zoomfactor and transform the visualization such
 * that the mouse does not change position relative to the visualization.
 * @param zoomIn {boolean} true if the function should zoom in, false if it should zoom out.
 * @param zoomFactor {number} factor by which the zoomScale should change.
 */
function zoom(zoomIn, zoomFactor) {
    if (zoomIn) {
        //hard to explain in code, get some pen and paper and visualize the transformation.
        xOff -= (mouseX - matrixX)*(zoomFactor - 1);
        yOff -= (mouseY - matrixY)*(zoomFactor - 1);
        zoomScale = zoomScale / zoomFactor;
    } else {
        //idem.
        xOff += (mouseX - matrixX)*(zoomFactor - 1)/zoomFactor;
        yOff += (mouseY - matrixY)*(zoomFactor - 1)/zoomFactor;
        zoomScale = zoomScale * zoomFactor;
    }
}

/**
 * x position where the matrix should be drawn
 * @Type {number}
 */
let matrixX;

/**
 * y position where the matrix should be drawn
 * @Type {number}
 */
let matrixY;

function draw() {
    //wipe background
    background(0,0,100);
    fill(0, 0, 0, 100);

    showImage();
}

/**
 * @function Draws the Image to the correct position on the canvas
 * @TODO make it ambiguous for all types of visualizations, not just the matrix.
 */
function showImage(){
    matrixX = document.getElementById("canvas").offsetWidth / 2 + xOff;
    matrixY = document.getElementById("canvas").offsetHeight / 2 + yOff;

    for (let i = 0; i < visualizations.length; i++) {
        if (visualizations[i].isActive()) {
            visualizations[i].draw(matrixX, matrixY, zoomScale);
            matrixVis.draw(matrixX, matrixY, zoomScale);
        }  else {
            visualizations[i].draw();
        }
    }
}

/**
 * Rescales the canvas when the windows has been changed
 */
window.onresize = function() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    visualizationCanvas.resizeCanvas(w, h);
    loadingAnimation.onresize();
};