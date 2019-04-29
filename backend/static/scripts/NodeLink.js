var sizeCircle = window.innerHeight-20;
var xValues = [];
var yValues = [];
var Nodes = []
var size = 200;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSL, 360, 100, 100, 100);
    background(255);
    ellipse(width/2, height/2, sizeCircle, sizeCircle);
    generateInput();
}

//Code for random Input here
function generateInput() {
    var randomNodes = [];
    createCircleArea();

    for (var i = 0; i < size; i++) {
        randomNodes[i] = i;
    }

    for (var j = 0; j < size; j++) {
        Nodes[j] = new Node(randomNodes[i], random(0, 200), xValues[j], yValues[j]);
    }
    console.log(Nodes);
    setNodes();
}

//setting up each node
function Node(connected, weight, x, y) {
    this.connected = connected;
    this.weight = weight;
    this.x = x;
    this.y = y;
    ellipse(x, y, 20, 20);
}

function createCircleArea() {
    var centerX = width/2;
    var centerY = height/2;
    var radius = sizeCircle/2;
    var steps = 2*3.14;
    for (var i = 0; i < size; i++) {
        var phase = 2 * Math.PI * i / steps;
        xValues[i] = (centerX + radius * Math.cos(phase));
        yValues[i] = (centerY + radius * Math.sin(phase));
        console.log(xValues[i]);
        console.log(yValues[i]);
    }
}

function setNodes() {

}

