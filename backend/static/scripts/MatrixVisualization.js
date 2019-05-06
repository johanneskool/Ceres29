// authors: Samuel Oosterholt, Tristan Trouwen

/***
 * The class for the MatrixVisualization, a child of the visualization.
 * @constructor
 */
var MatrixVisualization = function () {
    Visualization.call(this, arguments);
    this.nodes = [];
    this.NODE_COUNT = 200;
    /*this.NODE_SIZE;
    this.matrix;
    this.matrix;
    this.posX;
    this.posY;
    this.zoomScale;
    this.drawWidth;*/
    this.active = false;
    this.loaded = false;
    this.globalMAX = 10;
};

MatrixVisualization.prototype = Object.create(Visualization.prototype);
MatrixVisualization.prototype.constructor = MatrixVisualization;

/***
 * Function that creates a matrix for the given dataset, random if no dataset given.
 */
MatrixVisualization.prototype.load = function () {
    this.NODE_COUNT = this.nodes[0].outgoing.length;
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

    this.overlayGraphics = createGraphics(MATRIX_SIZE, MATRIX_SIZE);
    this.overlayGraphics.imageMode(CORNER);
    this.overlayGraphics.colorMode(HSL, 100);
    this.overlayGraphics.noStroke();

    this.overlayRatio = 1;
    this.loaded = true;
    visIsLoaded = true;
};


MatrixVisualization.prototype.setData = function (url) {
    print(url);
    loadJSON(url, loadNodes);
    var currentMatrix = this;

    function loadNodes(data) {
        currentMatrix.nodes = [];
        for (var i = 0; i < data.tags.length; i++) {
            var newNode = new Node();
            newNode.name = data.tags[i];
            newNode.outgoing = data.weights[i];
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
            var hue = map(log(nodes[i].outgoing[j]), 0, 3, 0, -25);
            var saturation;
            var brightness = map(log(nodes[i].outgoing[j]), 0, 3, 0, 35);
            if (hue < 0) {
                hue += 100;
            }
            //var opacity = map(nodes[i].outgoing[j], 0, this.globalMAX, 100, 25);
            this.matrix.fill(hue, 100, brightness, 100);
            this.matrix.rect(0, 0, this.NODE_SIZE, this.NODE_SIZE);

            //this.matrix.fill(0, 75, 50, 100);
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
        image(this.matrix, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        image(this.overlayGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        return;
    }
    this.posX = posX;
    this.posY = posY;
    this.zoomScale = zoomScale;
    image(this.matrix, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
    image(this.overlayGraphics, this.posX, this.posY, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
};

MatrixVisualization.prototype.colorCell = function (x, y) {
    this.overlayGraphics.clear();
    this.overlayGraphics.fill(50, 75, 75);
    this.overlayGraphics.rect(x * this.overlayRatio * this.NODE_SIZE, y * this.overlayRatio * this.NODE_SIZE, this.overlayRatio * this.NODE_SIZE, this.overlayRatio * this.NODE_SIZE);

};

MatrixVisualization.prototype.click = function (xCord, yCord) {
    // function gets executed when an edge is pressed

    // calculate which edge is pressed
    var topLeft = createVector(this.posX - (this.drawWidth / this.zoomScale) / 2, this.posY - (this.drawWidth / this.zoomScale) / 2);
    var mouse = createVector(xCord, yCord);
    var cell = p5.Vector.sub(mouse, topLeft);
    var nodeSize = (this.drawWidth / this.zoomScale) / this.NODE_COUNT;
    var x = floor(cell.x / nodeSize);
    var y = floor(cell.y / nodeSize);
    print(x, y);

    try {
        // mark this cell
        this.colorCell(x, y);

        // show debugging info in console
        var text = "Edge from :" + this.nodes[x].name + " to " + this.nodes[y].name + " has a weight of: " + this.nodes[x].outgoing[y];
        console.log(text);

        // update sidebar with informatino
        document.getElementById('matrix-visualization-edge-info').style.display = 'inherit';
        document.getElementById('matrix-visualization-edge-info-from').innerHTML = this.nodes[x].name;
        document.getElementById('matrix-visualization-edge-info-to').innerHTML = this.nodes[y].name;
        document.getElementById('matrix-visualization-edge-info-weight').innerHTML = this.nodes[x].outgoing[y];
    } catch (error) {
        if (error instanceof TypeError) {
            // user clicked outside of box, hide edge info again
            document.getElementById('matrix-visualization-edge-info').style.display = 'none';
        } else {
            throw error
        }
    }
};

MatrixVisualization.prototype.setActive = function (boolean) {
    this.active = boolean;
};

MatrixVisualization.prototype.isActive = function () {
    return this.active;
};
