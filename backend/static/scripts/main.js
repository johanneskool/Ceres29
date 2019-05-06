/**
 * @fileoverview This is the main file of the visualization which handels the creating
 * and the canvas which displays the data.
 *
 * @author Samuel Oosterholt
 */

const zoomFactor = 1.5;
var zoomScale = 1;
var matrixVis;
let visIsLoaded = false;
var visualizations = [];
let canvas;
let ctx;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {
    colorMode(HSL,100);
    canvas = createCanvas(window.innerWidth, window.innerHeight);

    frameRate(999);
    imageMode(CENTER);
    rectMode(CENTER);

    //puts the canvas under the 'canvas' div
    canvas.parent('canvas');

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
    ctx = context.getContext('2d');
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
 * boolean to differentiate between a click and a click-drag.
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

        oldMouse.x = mouseX;
        oldMouse.y = mouseY;
        newMouse.x = mouseX;
        newMouse.y = mouseY;
    };
    document.getElementById("defaultCanvas0").onmouseup = function (event) {
        mouseFlag = false;
        if (!drag) {
            matrixVis.click(mouseX, mouseY);
        }
        drag = false;
    };
    document.getElementById("defaultCanvas0").onclick = function (event) {
    };
}

var drag = false;
function mouseDragged() {
    if (mouseFlag) {
        drag = true;
        print('dragged');
        newMouse.x = mouseX;
        newMouse.y = mouseY;

        xOff += newMouse.x - oldMouse.x;
        yOff += newMouse.y - oldMouse.y;

        oldMouse.x = mouseX;
        oldMouse.y= mouseY;
    }
};

function zoom(zoomIn, zoomFactor) {
    if (zoomIn) {
        xOff -= (mouseX - matrixX)*(zoomFactor - 1);
        yOff -= (mouseY - matrixY)*(zoomFactor - 1);
        zoomScale = zoomScale / zoomFactor;
    } else {
        xOff += (mouseX - matrixX)*(zoomFactor - 1)/zoomFactor;
        yOff += (mouseY - matrixY)*(zoomFactor - 1)/zoomFactor;
        zoomScale = zoomScale * zoomFactor;
    }
}

var matrixX, matrixY;

function draw() {
    background(0,0,100);
    fill(0, 0, 0, 100);
    showImage();
}

function showImage(){
    resetMatrix();
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
    canvas.resizeCanvas(w, h);
    loadingAnimation.onresize();
};