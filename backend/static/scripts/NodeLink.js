var sizeCircle = window.innerHeight-20;
var xValues = [];
var yValues = [];
var Nodes = [];
var size = 200;
var sizeNodes = 25;

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
    for (var i = 0; i < size; i++) {
        var phase = 2 * Math.PI * i / steps;
        xValues[i] = (centerX + radius * Math.cos(phase));
        yValues[i] = (centerY + radius * Math.sin(phase));
    }
}

function  drawNodes() {
    var overlap = false
    for (var i = 0; i < size-1; i++) {
        var other = Nodes[i+1];
        var d = dist(Nodes[i].x, Nodes[i].y, other.x, other.y);
        if (d < Nodes[i].r + other.r) {
            overlap = true;
            console.log(overlap);
        }
    }

    for (var i = 0; i < size; i++) {
        ellipse(Nodes[i].x, Nodes[i].y, sizeNodes, sizeNodes);
    }

}

