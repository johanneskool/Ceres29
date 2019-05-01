var sizeCircle = (window.innerHeight - 125);
var xValues = [];
var yValues = [];
var Nodes = [];
var size = 157;
var sizeNodes = 8;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSL, 360, 100, 100, 100);
    background(255);
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

    drawNodes();
}

//setting up each node
function Node(connected, weight, x, y) {
    this.connected = connected;
    this.weight = weight;
    this.x = x;
    this.y = y;
    this.r = sizeNodes/2;
}

function createCircleArea() {
    var centerX = width/2;
    var centerY = height/2;
    var radius = sizeCircle/2;
    var steps = 2*3.14;
    for (var i = 0; i < 157; i++) {
        var phase = 2 * Math.PI * i / steps;
        xValues[i] = (centerX + radius * Math.cos(phase));
        yValues[i] = (centerY + radius * Math.sin(phase));
    }
}

function  drawNodes() {
    for (var i = 0; i < size; i++) {
        ellipse(Nodes[i].x, Nodes[i].y, 2 * Nodes[i].r, 2 * Nodes[i].r);
    }

}

