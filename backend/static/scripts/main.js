var NODE_COUNT = 500;
var NODE_SIZE = 10;
var nodes = [];
var matrix;

var matrixSize;
var matrixWidth;
var matrixHeight; //matrix is square so no real reason to differ between height and width
var defaultCanvas;
var body;
var zoomScale = 1;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {

    colorMode(HSL,100);
    createCanvas(window.innerWidth, window.innerHeight);
    //canvas.mouseWheel(zoom);

    //make matrix buffer graphics
    matrixSize = NODE_COUNT * NODE_SIZE;
    matrix = createGraphics(matrixSize, matrixSize);
    matrix.colorMode(HSL,100);

    frameRate(999);

    matrixWidth = ceil(min(windowHeight, windowWidth) / 1.5);

    imageMode(CENTER);
    matrix.imageMode(CENTER);
    rectMode(CENTER);
    noStroke();
    matrix.noStroke();

    generateMatrix();
    drawMatrix();
}

//function that generates random matrix values.
function generateMatrix () {
    for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node());
        for (var j = 0; j < NODE_COUNT; j++) {
            if (random(1) < 0.5) {
                nodes[i].outgoing.push(0);
            } else {
                nodes[i].outgoing.push(random(0,1));
            }
        }
    }
}

//invoke function for drawing the matrix to the buffer
function drawMatrix() {
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].drawOutgoing();
        matrix.translate(NODE_SIZE,0);
    }
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

function draw() {
    background(0,0,0);
    fill(0, 0, 0, 100);

    //push();
    resetMatrix();
    var matrixX = windowWidth / 2 + xOff;
    var matrixY = windowHeight / 2 + yOff;
    image(matrix,matrixX,matrixY,matrixWidth/zoomScale,matrixWidth/zoomScale);
    //pop();
}

//TODO make zooming go to center of screen.
function mouseWheel () {
    print(event.deltaY);
    if (event.deltaY > 0) {
        zoomScale = zoomScale / 2;
    } else {
        zoomScale = zoomScale * 2;
    }
    print(zoomScale);
}

/**
 * Class for managing Nodes
 * @constructor Node class
 */
function Node() {
    /** @lends Node */
    this.outgoing = [];
}

/** Draws matrix for node.*/
Node.prototype.drawOutgoing = function () {
    matrix.push();
    for (var i = 0; i < this.outgoing.length; i++) {
        var hue = map(this.outgoing[i],0,1,25,0);
        var opacity = map(this.outgoing[i],0,1,25,100);
        matrix.fill(hue,75,50,opacity);
        matrix.rect(0,0,NODE_SIZE,NODE_SIZE);
        matrix.translate(0,NODE_SIZE);
    }
    matrix.pop();
};

/**
 * Rescales the canvas when the windows has been changed
 */
window.onresize = function() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    resizeCanvas(w, h);
};