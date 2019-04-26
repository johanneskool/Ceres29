var NODE_COUNT = 100;
var node_width = 500 / NODE_COUNT;
var nodes = [];
var matrix;

//basic setup and buffer for matrix to prevent redrawing.
function setup() {
    colorMode(HSL,100);
    createCanvas(window.innerWidth, window.innerHeight);

    //make matrix buffer graphics
    var matrixSize = NODE_COUNT * node_width;
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


function draw() {
    background(0,0,0);
    fill(0, 0, 0, 100);

    push();
    var width = window.innerWidth / 2 - (NODE_COUNT * node_width) / 2;
    var height = window.innerHeight / 2 - (NODE_COUNT * node_width) / 2;
    translate(width,height);
    image(matrix,0,0);
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