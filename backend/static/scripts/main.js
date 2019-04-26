var NODE_COUNT = 1000;
var node_width = 500 / NODE_COUNT;
var nodes = [];
var matrix;

var xOff = 0;
var yOff = 0;
var oldMouseX = 0;
var oldMouseY = 0;
var newMouseX = 0;
var newMouseY = 0;

var matrixSize;
var canvas;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {
    colorMode(HSL,100);
    createCanvas(window.innerWidth, window.innerHeight);

    node_width = ceil(min(window.innerWidth, window.innerHeight) / (1.5*NODE_COUNT));

    canvas = document.getElementsByTagName('canvas')[0];
    //make matrix buffer graphics
    matrixSize = NODE_COUNT * node_width;
    matrix = createGraphics(matrixSize, matrixSize);
    matrix.colorMode(HSL,100);

    frameRate(999);

    noStroke();
    matrix.noStroke();

    generate_matrix();
    draw_matrix();

}

//function that generates random matrix values.
function generate_matrix () {
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
function draw_matrix() {
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].drawOutgoing();
        matrix.translate(node_width,0);
    }
}

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

    push();
    var width = window.innerWidth / 2 - (NODE_COUNT * node_width) / 2;
    var height = window.innerHeight / 2 - (NODE_COUNT * node_width) / 2;
    translate(width + xOff,height + yOff);
    image(matrix,0,0,300,300);
    pop();
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
        matrix.rect(0,0,node_width,node_width);
        matrix.translate(0,node_width);
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