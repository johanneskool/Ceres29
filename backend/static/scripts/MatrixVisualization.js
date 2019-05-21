/**
 * @fileoverview Contains the matrix visualization class and the functions needed to draw it to the canvas
 * @author Samuel Oosterholt
 * @author Tristan Trouwem
 * @author Rink Pieters
 */


/***
 * The class for the MatrixVisualization, a child of the visualization.
 * @constructor
 */
var MatrixVisualization = function () {
    Visualization.call(this, arguments);
    /**
     * Flag is true if the matrix is done loading
     * @type {boolean}
     */
    this.loaded = false;

    /**
     * Max size of the buffer image
     * @type {number}
     */
    this.maxSize = 3000;

    /**
     * Where the drawMatrix should start drawing.
     * @type {number}
     */
    this.startPositon = 0;
};

MatrixVisualization.prototype = Object.create(Visualization.prototype);
MatrixVisualization.prototype.constructor = MatrixVisualization;

/***
 * Basic load function that draws the matrix to a buffer.
 */
MatrixVisualization.prototype.load = function () {
    console.log('load call');
    //update the node count
    this.nodeCount = this.data.tags.length;
    this.startPositon = 0;
    this.updateNodeSize();

    //create a matrix and the buffer graphics
    const matrixSize = this.nodeCount * this.nodeSize;
    this.matrix = P$.createGraphics(matrixSize, matrixSize);
    this.matrix.colorMode(P$.HSL, 100);
    this.matrix.textSize(this.nodeSize / 2);
    this.matrix.imageMode(P$.CENTER);
    this.matrix.noStroke();

    //initial matrix size
    this.drawWidth = P$.ceil(P$.min(P$.windowHeight, P$.windowWidth) / 1.3);

    //draw the nodes from the data to the buffer
    this.drawMatrix(this);

    //where we can show selected nodes.
    this.overlayGraphics = P$.createGraphics(matrixSize, matrixSize);
    this.overlayGraphics.imageMode(P$.CORNER);
    this.overlayGraphics.colorMode(P$.HSL, 100);
    this.overlayGraphics.noStroke();

    //unused since the later updates.
    this.overlayRatio =  1;
};

/**
 * Function to update the node size of the matrix.
 */
MatrixVisualization.prototype.updateNodeSize = function () {
    this.nodeSize = P$.floor(this.maxSize / this.nodeCount);
};

/**
 * Updates the matrix data.
 * @param {url} url the json url of the data
 */
MatrixVisualization.prototype.setData = function (data) {
    this.data = data;
    this.nodeCount = currentMatrix.data.weights.length;
    this.minWeight = currentMatrix.data.minWeight;
    this.maxWeight = currentMatrix.data.maxWeight;
    this.updateNodeSize();
    this.load();
};


/**
 * Generate random nodes.
 * @deprecated unused since we have a json.
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
 */
MatrixVisualization.prototype.drawMatrix = function () {
    let min; let max; let useLog = false; //because we need them outside the if-statement
    if (this.maxWeight <= 1) { //actually we don't need logarithmic scaling here
        min = Math.min(0, this.minWeight);
        max = this.maxWeight;
    } else {
        min = Math.log(this.minWeight/1.2); //excend the range a little since we are not sure whether there is a 0
        max = Math.log(this.maxWeight);
        useLog = true;
    }
    //loop through all the edges and create a rectangle.
    for (let col = this.startPositon; col < this.nodeCount; col++) {
        this.matrix.push();
        for (let row = 0; row < this.nodeCount; row++) {
            let weight; //for use in the for-loop
            if (useLog) weight = Math.log(this.data.weights[col][row]);
            else weight = this.data.weights[col][row];

            var ratio = P$.map(weight, min, max, 0, 1);
            P$.colorMode(P$.HSB, 100);
            let from = P$.color(65, 100, 10);
            let to = P$.color(40, 100, 100);
            //use the weight to color the cell.
            let fillColor = P$.lerpColor(from, to, ratio);

            this.matrix.fill(fillColor);
            this.matrix.rect(0, 0, this.nodeSize, this.nodeSize);
            this.matrix.translate(this.nodeSize, 0);
        }
        this.matrix.pop();
        this.matrix.translate(0, this.nodeSize);
    }

    this.loaded = true;
    this.vH.setLoadedVisualization(true);
};

/**
 * Draw the visualization.
 */
MatrixVisualization.prototype.draw = function () {
    //disregard draw calls that happen whilst it is still loading.
    if (!this.loaded) {
        //matrix can be unloaded without data
        if (this.data != null) {
            this.drawMatrix(this);
        }
    }

    //draw the image and the overlay
    if (this.matrix !== undefined) {
        this.canvas.image(this.matrix, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        this.canvas.image(this.overlayGraphics, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
    }
};

/**
 * Color the cell at the given coords
 * @param x the x cords of the matrix
 * @param y the y cords of the matrix
 */
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
 * @throws RangeError if you click a cell that is outside of the matrix, i.e. a bad click.
 */
MatrixVisualization.prototype.getCell = function (xCord, yCord) {
    // calculate which edge is pressed
    var topLeft = P$.createVector(this.position.x - (this.drawWidth / this.zoomScale)/2, this.position.y - (this.drawWidth / this.zoomScale)/2);
    var mouse = P$.createVector(xCord, yCord);
    var cell = p5.Vector.sub(mouse, topLeft);
    var nodeSize = (this.drawWidth / this.zoomScale)/this.nodeCount;
    var x = P$.floor(cell.x / nodeSize);
    var y = P$.floor(cell.y / nodeSize);
    var cellVector = P$.createVector(x, y);

    if (x < 0 || y < 0 || x > this.nodeCount ||  y > this.nodeCount) {
        throw new RangeError("clicked outside of visualization");
    }

    return cellVector
};

/**
 * Handles the clicking to the canvas.
 * @param xCord mouse x
 * @param yCord mouse y
 * @throws RangeError if you click outside of the matrix.
 */
MatrixVisualization.prototype.click = function (xCord, yCord) {
    // function gets executed when an edge is pressed
    try {
        var cellVector = this.getCell(xCord, yCord);
        var y = cellVector.y;
        var x = cellVector.x;
    } catch (error) {
        document.getElementById('matrix-visualization-edge-info').style.display = 'none';
        throw new RangeError("clicked outside of visualization");
    }

    // mark this cell
    this.colorCell(x, y);

    let from = this.data.tags[x];
    from = from.replace(/_/g,' ');
    let to = this.data.tags[y];
    to = to.replace(/_/g,' ');
    let weight = this.data.weights[y][x];  //we store it as weights[col][row], so get correct weight
    // show debugging info in console
    var text = "Edge from :" + from + " to " + to + " has a weight of: " + weight;
    console.log(text);
    console.log('x cord: ' + x + ', y cord: ' + y);

    // update sidebar with informatino
    document.getElementById('matrix-visualization-edge-info').style.display = 'inherit';
    document.getElementById('matrix-visualization-edge-info-from').innerHTML = from;
    document.getElementById('matrix-visualization-edge-info-to').innerHTML = to;
    document.getElementById('matrix-visualization-edge-info-weight').innerHTML = weight;
};
