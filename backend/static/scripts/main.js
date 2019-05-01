let nodes = [];
let defaultCanvas;
let body;
const zoomFactor = 1.5;
var zoomScale = 1;
var matrixVis;

var visualizations = [];

//basic setup and buffer for matrix to prevent redrawing.
function setup() {
    colorMode(HSL,100);
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('canvas');


    // fetch data
    var file_name = window.location.search.split('=')[1];
    fetch('/static/json/'+ file_name)
    .then(res => res.json())
    .then((out_json_data) => {
      console.log(out_json_data);
    })
    .catch(err => { throw err });

    frameRate(999);

    matrixVis = new MatrixVisualization();
    visualizations.push(matrixVis);

    matrixVis.load();
    matrixVis.setActive(true);

    imageMode(CENTER);
    rectMode(CENTER);
    var context = document.getElementById("defaultCanvas0");
    var ctx = context.getContext('2d');
    ctx.imageSmoothingEnabled = false;
}

var xOff = 0;
var yOff = 0;
var oldMouseX = 0;
var oldMouseY = 0;
var newMouseX = 0;
var newMouseY = 0;

function mousePressed() {
    print('clicked');
    oldMouseX = mouseX;
    oldMouseY = mouseY;
    newMouseX = mouseX;
    newMouseY = mouseY;
}

function mouseDragged() {
    print('dragged');
    newMouseX = mouseX;
    newMouseY = mouseY;

    xOff += newMouseX - oldMouseX;
    yOff += newMouseY - oldMouseY;

    oldMouseX = mouseX;
    oldMouseY = mouseY;
}

function mouseWheel () {
    if (event.deltaY < 0) {
        zoom(true, zoomFactor);
    } else {
        zoom(false, zoomFactor);
    }
}

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
    background(0,0,0);
    fill(0, 0, 0, 100);

    showImage();
}

function showImage(){
    resetMatrix();
    matrixX = windowWidth / 2 + xOff;
    matrixY = windowHeight / 2 + yOff;

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
 * Class for managing Nodes
 * @constructor Node class
 */
function Node() {
    /** @lends Node */
    this.outgoing = [];
}

/**
 * Rescales the canvas when the windows has been changed
 */
window.onresize = function() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    resizeCanvas(w, h);
};