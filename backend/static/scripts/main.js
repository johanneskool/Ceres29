let nodes = [];
let defaultCanvas;
let body;
const zoomFactor = 1.5;
var zoomScale = 1;
var matrixVis;

var visualizations = [];

var ctx;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {
    colorMode(HSL,100);
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('canvas');


    // fetch data
    var file_name = new URL(window.location.href).searchParams.get("data");;
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

    context = document.getElementById("defaultCanvas0");
    ctx = context.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    setupListeners();
}

var xOff = 0;
var yOff = 0;
var oldMouseX = 0;
var oldMouseY = 0;
var newMouseX = 0;
var newMouseY = 0;


var mouseFlag = false;
/**
 * Setup for the canvas listeners, zooming scrolling and clicking.
 */
function setupListeners () {
    document.getElementById( "defaultCanvas0" ).onwheel = function(event){
        if (event.deltaY < 0) {
            zoom(true, zoomFactor);
        } else {
            zoom(false, zoomFactor);
        }
        event.preventDefault();
    };
    document.getElementById( "defaultCanvas0" ).onmousewheel = function(event){
        if (event.deltaY < 0) {
            zoom(true, zoomFactor);
        } else {
            zoom(false, zoomFactor);
        }
        event.preventDefault();
    };
    document.getElementById( "defaultCanvas0" ).onmousedown = function(event){
        mouseFlag = true;
        print('click');
        oldMouseX = mouseX;
        oldMouseY = mouseY;
        newMouseX = mouseX;
        newMouseY = mouseY;
    };
    document.getElementById("defaultCanvas0").onmouseup = function (event) {
        mouseFlag = false;
    };
    document.getElementById("defaultCanvas0").onclick = function (event) {
        print(mouseX, mouseY);
    };
}

function mouseDragged() {
    if (mouseFlag) {
        print('dragged');
        newMouseX = mouseX;
        newMouseY = mouseY;

        xOff += newMouseX - oldMouseX;
        yOff += newMouseY - oldMouseY;

        oldMouseX = mouseX;
        oldMouseY = mouseY;
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
    matrixX = width / 2 + xOff;
    matrixY = height / 2 + yOff;

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
