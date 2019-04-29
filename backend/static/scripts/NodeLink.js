var sizeCircle = window.innerHeight-20;
var xValues = [];
var yValues = [];

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
    var size = 100;
    createCircleArea();

    for (var i = 0; i < size; i++) {
        randomNodes.push(i);
    }

    for (var j = 0; j < size; j++) {
        Node[i] = new Node(randomNodes[floor(random(i))], random(0, 200));
    }

    setNodes();
}

//setting up each node
function Node(connected, weight) {
    this.connected = connected;
    this.weight = weight;
    ellipse(xValues[floor(random(Node.length))], yValues[floor(random(Node.length))], 50, 50);
}

function createCircleArea() {
    var centerX = width/2;
    var centerY = height/2;
    var radius = sizeCircle/2;
    var steps = 10;
    for (var i = 0; i < steps; i+=0.01) {
        xValues[i] = (centerX + radius * Math.cos(2 * Math.PI * i / steps));
        yValues[i] = (centerY + radius * Math.sin(2 * Math.PI * i / steps));
    }
}

function setNodes() {

}

