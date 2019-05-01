/***
 * The class for the MatrixVisualization, a child of the visualization.
 * @constructor
 */
var MatrixVisualization = function () {
    Visualization.call(this, arguments);
    this.nodes = [];
    this.NODE_COUNT = 200;
    this.bufferWidth = 2000;
    /*this.NODE_SIZE;
    this.matrix;
    this.bufferGraphics;
    this.posX;
    this.posY;
    this.zoomScale;
    this.drawWidth;*/
    this.active = false;
    this.loaded = false;
    this.globalMAX = 0;
};

MatrixVisualization.prototype = Object.create(Visualization.prototype);
MatrixVisualization.prototype.constructor = MatrixVisualization;

/***
 * Function that creates a matrix for the given dataset, random if no dataset given.
 */
MatrixVisualization.prototype.load = function () {
    this.NODE_COUNT = this.nodes.length;
    this.NODE_SIZE = floor(8000 / this.NODE_COUNT);
    const MATRIX_SIZE = this.NODE_COUNT * this.NODE_SIZE;

    this.matrix = createGraphics(MATRIX_SIZE, MATRIX_SIZE);
    this.matrix.colorMode(HSL, 100);
    this.matrix.textSize(this.NODE_SIZE / 2);
    this.matrix.imageMode(CENTER);
    this.matrix.noStroke();

    this.drawWidth = ceil(min(windowHeight, windowWidth) / 1.3);

    //if there aren't any nodes we make our own.
    //this.generateNodes();
    this.drawMatrix(this.nodes);

    this.bufferGraphics = createGraphics(this.bufferWidth, this.bufferWidth);
    this.bufferGraphics.imageMode(CORNER);
    this.bufferGraphics.colorMode(HSL, 100);
    this.bufferGraphics.noStroke();
    this.bufferGraphics.image(this.matrix, 0, 0, 2000, 2000);

    this.overlayGraphics = createGraphics(2000, 2000);
    this.overlayGraphics.imageMode(CORNER);
    this.overlayGraphics.colorMode(HSL, 100);
    this.overlayGraphics.noStroke();

    this.overlayRatio =  this.bufferWidth / MATRIX_SIZE;
    this.loaded = true;
    print("done loading");
};


MatrixVisualization.prototype.setData = function (url) {
    print(url);
    loadJSON(url, loadNodes);
    var currentMatrix = this;

    function loadNodes(data) {
        currentMatrix.data = data;
        currentMatrix.nodes = [];
        for (key in data) {
            var newNode = new Node();
            newNode.name = key;
            for (number in data[key]) {
                if (number > currentMatrix.globalMAX) {
                    currentMatrix.globalMAX = number;
                }
                newNode.outgoing.push(number);
            }
            currentMatrix.nodes.push(newNode);
        }
        currentMatrix.load();
    }
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
            var hue = map(nodes[i].outgoing[j], 0, this.globalMAX, 25, 0);
            var opacity = map(nodes[i].outgoing[j], 0, this.globalMAX, 100, 25);
            this.matrix.fill(hue, 75, 50, opacity);
            this.matrix.rect(0, 0, this.NODE_SIZE, this.NODE_SIZE);
            this.matrix.fill(0, 75, 50, 100);
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
    if (!this.loaded) {
        return;
    }
    if (arguments.length === 0) {
        image(this.bufferGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        image(this.overlayGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        return;
    }
    this.posX = posX;
    this.posY = posY;
    this.zoomScale = zoomScale;
    image(this.bufferGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
    image(this.overlayGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
};

MatrixVisualization.prototype.colorCell = function (x, y) {
    this.overlayGraphics.fill(50,75,75);
    this.overlayGraphics.rect(x*this.overlayRatio*this.NODE_SIZE, y*this.overlayRatio*this.NODE_SIZE, this.overlayRatio*this.NODE_SIZE, this.overlayRatio*this.NODE_SIZE);

};

MatrixVisualization.prototype.click = function (xCord, yCord) {
    var topLeft = createVector(this.posX - (this.drawWidth / this.zoomScale)/2, this.posY - (this.drawWidth / this.zoomScale)/2);
    var mouse = createVector(xCord, yCord);
    var cell = p5.Vector.sub(mouse, topLeft);
    var nodeSize = (this.drawWidth / this.zoomScale)/this.NODE_COUNT;
    var x = floor(cell.x / nodeSize);
    var y = floor(cell.y / nodeSize);
    this.colorCell(x, y);
    console.log("Edge from :" + this.nodes[x].name + " to " + this.nodes[y].name + " has a weight of: " + this.nodes[x].outgoing[y]);
};

/**
 * Updates the bufferGraphics
 * @deprecated Very slow, use overlay Graphics to print over the matrix instead.
 */
MatrixVisualization.prototype.updateBuffer = function () {
    this.bufferGraphics.image(this.matrix, 0, 0, 2000, 2000);
};

MatrixVisualization.prototype.setActive = function (boolean) {
    this.active = boolean;
};

MatrixVisualization.prototype.isActive = function () {
    return this.active;
};