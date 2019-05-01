/***
 * The class for the MatrixVisualization, a child of the visualization class.
 * @constructor
 */
var MatrixVisualization = function () {
    Visualization.call(this, arguments);
    this.nodes = [];
    this.NODE_COUNT = 1000;
    this.NODE_SIZE;
    this.matrix;
    this.bufferGraphics;
    this.posX;
    this.posY;
    this.zoomScale;
    this.drawWidth;
    this.active = false;
};

MatrixVisualization.prototype = Object.create(Visualization.prototype);
MatrixVisualization.prototype.constructor = MatrixVisualization;

/***
 * Function that creates a matrix for the given dataset, random if no dataset given.
 */
MatrixVisualization.prototype.load = function () {
    this.NODE_SIZE = 16000/this.NODE_COUNT;
    const MATRIX_SIZE = this.NODE_COUNT * this.NODE_SIZE;

    this.matrix = createGraphics(MATRIX_SIZE, MATRIX_SIZE);
    this.matrix.colorMode(HSL, 100);
    this.matrix.textSize(this.NODE_SIZE / 2);
    this.matrix.imageMode(CENTER);
    this.matrix.noStroke();

    this.drawWidth = ceil(min(windowHeight, windowWidth) / 1.3);

    //if there aren't any nodes we make our own.
    this.generateNodes();
    this.drawMatrix(this.nodes);

    this.bufferGraphics = createGraphics(2000, 2000);
    this.bufferGraphics.imageMode(CORNER);
    this.bufferGraphics.image(this.matrix, 0, 0, 2000, 2000);
};

/**
 * Generate random nodes.
 */
MatrixVisualization.prototype.generateNodes = function () {
    for (var i = 0; i < this.NODE_COUNT; i++) {
        this.nodes.push(new Node());
        for (var j = 0; j < this.NODE_COUNT; j++) {
            this.nodes[i].outgoing.push(floor(random(1) * 10) / 10);
        }
    }
};

/**
 * Draws a matrix to the graphics based of the input nodes
 * @param nodes input nodes
 */
MatrixVisualization.prototype.drawMatrix = function (nodes) {
    for (let i = 0; i < nodes.length; i++) {
        this.matrix.push();
        for (let j = 0; j < nodes[i].outgoing.length; j++) {
            var hue = map(nodes[i].outgoing[j], 0, 1, 25, 0);
            var opacity = map(nodes[i].outgoing[j], 0, 1, 25, 100);
            this.matrix.fill(hue, 75, 50, opacity);
            this.matrix.rect(0, 0, this.NODE_SIZE, this.NODE_SIZE);
            this.matrix.fill(0, 75, 100, 50);
            //this.matrix.text(i + ", " + j, 0, this.NODE_SIZE - textSize());
            this.matrix.translate(0, this.NODE_SIZE);
        }
        this.matrix.pop();
        this.matrix.translate(this.NODE_SIZE, 0);
    }
};

/**
 * Draws the visualization to a new position and or zoomscale.
 * @param posX
 * @param posY
 * @param zoomScale
 */
MatrixVisualization.prototype.draw = function (posX, posY, zoomScale) {
    if (arguments.length === 0) {
        image(this.bufferGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        return;
    }
    this.posX = posX;
    this.posY = posY;
    this.zoomScale = zoomScale;
    image(this.bufferGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
};


MatrixVisualization.prototype.setActive = function (boolean) {
    this.active = boolean;
};

MatrixVisualization.prototype.isActive = function () {
    return this.active;
};