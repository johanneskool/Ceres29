var NODE_COUNT = 10;
var NODE_SIZE; //also the render quality.
var nodes = [];
var matrix;

var matrixSize;
var matrixWidth;
var matrixHeight; //matrix is square so no real reason to differ between height and width
var defaultCanvas;
var body;
var zoomScale = 1;
var zoomFactor = 2;
var drawQuality = 1;
var bufferGraphics;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {

    colorMode(HSL,100);
    let canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent('canvas');
    //canvas.mouseWheel(zoom);
    //NODE_SIZE = floor(8000 / NODE_COUNT);
    NODE_SIZE = 20;
    //make matrix buffer graphics
    matrixSize = NODE_COUNT * NODE_SIZE;
    matrix = createGraphics(matrixSize, matrixSize);
    matrix.colorMode(HSL,100);
    matrix.textSize(NODE_SIZE/2);

    frameRate(999);

    matrixWidth = ceil(min(windowHeight, windowWidth) / 1.3);

    imageMode(CENTER);
    matrix.imageMode(CENTER);
    rectMode(CENTER);
    noStroke();
    matrix.noStroke();

    generateMatrix();
    drawMatrix();

    bufferGraphics = createGraphics(2000, 2000);
    bufferGraphics.imageMode(CORNER);
    bufferGraphics.image(matrix, 0, 0, 2000, 2000);

}

//function that generates random matrix values.
function generateMatrix () {
    for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node());
        for (var j = 0; j < NODE_COUNT; j++) {
            nodes[i].outgoing.push(((j+1)%(i+1))/(i+1));
        }
    }
}

//invoke function for drawing the matrix to the buffer
function drawMatrix() {
    for (var i = 0; i < nodes.length; i+= drawQuality) {
        nodes[i].drawOutgoing(i);
        matrix.translate(NODE_SIZE*drawQuality,0);
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

//TODO make zooming go to center of screen.
function mouseWheel () {
    if (event.deltaY < 0) {
        xOff -= mouseX - matrixX;
        yOff -= mouseY - matrixY;
        zoomScale = zoomScale / zoomFactor;
    } else {
        xOff += (mouseX - matrixX)/zoomFactor;
        yOff += (mouseY - matrixY)/zoomFactor;
        zoomScale = zoomScale * zoomFactor;
    }
    print(zoomScale);
}

var matrixX, matrixY;

function draw() {
    background(0,0,0);
    fill(0, 0, 0, 100);

    //push();
    showImage();
    //pop();
}

function showImage(){
    resetMatrix();
    matrixX = windowWidth / 2 + xOff;
    matrixY = windowHeight / 2 + yOff;
    image(bufferGraphics,matrixX,matrixY,matrixWidth/zoomScale,matrixWidth/zoomScale);
    //image(matrix,matrixX,matrixY,matrixWidth/zoomScale,matrixWidth/zoomScale);
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
Node.prototype.drawOutgoing = function (j) {
    matrix.push();
    for (var i = 0; i < this.outgoing.length; i += drawQuality) {
        var hue = map(this.outgoing[i],0,1,25,0);
        var opacity = map(this.outgoing[i],0,1,25,100);
        matrix.fill(hue,75,50,opacity);
        matrix.rect(0,0,NODE_SIZE*drawQuality,NODE_SIZE*drawQuality);
        matrix.fill(0,75,100,50);
        matrix.text(i+", "+j,0,NODE_SIZE-textSize());
        matrix.translate(0,NODE_SIZE*drawQuality);
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