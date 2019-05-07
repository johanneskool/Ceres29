/**
 * @fileoverview Contains the matrix visualization class and the functions needed to draw it to the canvas
 * @author Samuel Oosterholt
 * @author Tristan Trouwem
 */


/***
 * The class for the MatrixVisualization, a child of the visualization.
 * @constructor
 */
var MatrixVisualization = function () {
    Visualization.call(this, arguments);
    this.active = false;
    this.loaded = false;
    /*this.zoomScale;*/
};

MatrixVisualization.prototype = Object.create(Visualization.prototype);
MatrixVisualization.prototype.constructor = MatrixVisualization;

/***
 * Function that creates a matrix for the given dataset, random if no dataset given.
 */
MatrixVisualization.prototype.load = function () {
    console.log("start matrix loads");
    this.nodeCount = this.getArrayAtIndex(0).length;
    this.nodeSize = floor(8000 / this.nodeCount);
    const matrixSize = this.nodeCount * this.nodeSize;



    this.matrix = createGraphics(matrixSize, matrixSize);
    this.matrix.colorMode(HSL, 100);
    this.matrix.textSize(this.nodeSize / 2);
    this.matrix.imageMode(CENTER);
    this.matrix.noStroke();

    this.drawWidth = ceil(min(windowHeight, windowWidth) / 1.3);

    this.drawMatrix(this.data);

    this.overlayGraphics = createGraphics(matrixSize, matrixSize);
    this.overlayGraphics.imageMode(CORNER);
    this.overlayGraphics.colorMode(HSL, 100);
    this.overlayGraphics.noStroke();

    this.overlayRatio =  1;
    this.loaded = true;
    visIsLoaded = true;
    console.log("matrix load done");
};

MatrixVisualization.prototype.setData = function (url) {
    print(url);
    loadJSON(url, loadNodes);
    var currentMatrix = this;

    function loadNodes(data) {
        currentMatrix.data = data;
        currentMatrix.load();
    }

};


/**
 * Generate random nodes.
 */
MatrixVisualization.prototype.generateNodes = function () {
    for (var i = 0; i < this.nodeCount; i++) {
        this.nodes.push(new Node());
        for (var j = 0; j < this.nodeCount; j++) {
            this.nodes[i].outgoing.push(floor(random(1) * 10) / 10);
        }
    }
};

/**
 * Draws a matrix to the graphics based of the input nodes
 * @param data input JSON
 */
MatrixVisualization.prototype.drawMatrix = function () {
    this.nodeCount = this.getArrayAtIndex(1).length;
    this.nodeSize = floor(8000 / this.nodeCount);

    let weights = this.getKeyAtIndex(1);

    for (let i = 0; i < this.nodeCount; i++) {
        this.matrix.push();
        for (let j = 0; j < this.nodeCount; j++) {
            let weight = this.data[weights][i][j]
            var hue = map(log(weight), 0, 3, 0, -25);
            var brightness = map(log(weight), 0, 3, 0, 35);
            if (hue < 0) {
                hue += 100;
            }

            this.matrix.fill(hue, 100, brightness, 100);
            this.matrix.rect(0, 0, this.nodeSize, this.nodeSize);
            this.matrix.translate(0, this.nodeSize);
        }
        this.matrix.pop();
        this.matrix.translate(this.nodeSize, 0);
    }
};

/**
 * Draws the visualization to a new position and or zoomscale.
 * @param posX
 * @param posY
 * @param zoomScale
 */
MatrixVisualization.prototype.draw = function (posX, posY) {
    if (!this.loaded) {
        return;
    }
    if (arguments.length === 0) {
        image(this.matrix, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        image(this.overlayGraphics, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        return;
    }
    this.position.x = posX;
    this.position.y = posY;

    image(this.matrix, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
    image(this.overlayGraphics, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
};

MatrixVisualization.prototype.colorCell = function (x, y) {
    this.overlayGraphics.clear();
    this.overlayGraphics.fill(50,75,75);
    this.overlayGraphics.rect(x*this.overlayRatio*this.nodeSize, y*this.overlayRatio*this.nodeSize, this.overlayRatio*this.nodeSize, this.overlayRatio*this.nodeSize);

};

/**
 * Turns x and y cords into a cell.
 * @param xCord
 * @param yCord
 * @return {p5.Vector} vector of the cell at the given position.
 */
MatrixVisualization.prototype.getCell = function (xCord, yCord) {
    // calculate which edge is pressed
    var topLeft = createVector(this.position.x - (this.drawWidth / this.zoomScale)/2, this.position.y - (this.drawWidth / this.zoomScale)/2);
    var mouse = createVector(xCord, yCord);
    var cell = p5.Vector.sub(mouse, topLeft);
    var nodeSize = (this.drawWidth / this.zoomScale)/this.nodeCount;
    var x = floor(cell.x / nodeSize);
    var y = floor(cell.y / nodeSize);
    print(x, y);
    var cellVector = createVector(x, y);
    return cellVector
};

MatrixVisualization.prototype.click = function (xCord, yCord) {
    //     // function gets executed when an edge is pressed
    var cellVector = this.getCell(xCord, yCord);
    var x = cellVector.x;
    var y = cellVector.y;

    try {
        // mark this cell
        this.colorCell(x, y);

        let from = this.getArrayAtIndex(0)[x];
        from = from.replace(/_/g,' ');
        let to = this.getArrayAtIndex(0)[y];
        to = to.replace(/_/g,' ');
        let weight = this.getArrayAtIndex(1)[x][y];

        // show debugging info in console
        var text = "Edge from :" + from + " to " + to + " has a weight of: " + weight;
        console.log(text);

        // update sidebar with informatino
        document.getElementById('matrix-visualization-edge-info').style.display = 'inherit';
        document.getElementById('matrix-visualization-edge-info-from').innerHTML = from;
        document.getElementById('matrix-visualization-edge-info-to').innerHTML = to;
        document.getElementById('matrix-visualization-edge-info-weight').innerHTML = weight;

    } catch(error) {
        if (error instanceof TypeError) {
            // user clicked outside of box, hide edge info again
            document.getElementById('matrix-visualization-edge-info').style.display = 'none';
        }
        throw new RangeError("clicked outside of visualization");
    }
};

MatrixVisualization.prototype.setActive = function (boolean) {
    this.active = boolean;
};

MatrixVisualization.prototype.isActive = function () {
    return this.active;
};
