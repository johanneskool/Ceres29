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
    this.loaded = false;
    this.maxSize = 3000;
};

MatrixVisualization.prototype = Object.create(Visualization.prototype);
MatrixVisualization.prototype.constructor = MatrixVisualization;

/***
 * Basic load function that draws the matrix to a buffer.
 */
MatrixVisualization.prototype.load = function () {
    console.log("start matrix loads");

    //update the node count.
    this.nodeCount = this.getArrayAtIndex(0).length;
    this.updateNodeSize();

    //create a matrix and the buffer graphics
    const matrixSize = this.nodeCount * this.nodeSize;
    this.matrix = createGraphics(matrixSize, matrixSize);
    this.matrix.colorMode(HSL, 100);
    this.matrix.textSize(this.nodeSize / 2);
    this.matrix.imageMode(CENTER);
    this.matrix.noStroke();

    //initial matrix size
    this.drawWidth = ceil(min(windowHeight, windowWidth) / 1.3);

    //draw the nodes from the data to the buffer
    this.drawMatrix(this.data);

    //where we can show selected nodes.
    this.overlayGraphics = createGraphics(matrixSize, matrixSize);
    this.overlayGraphics.imageMode(CORNER);
    this.overlayGraphics.colorMode(HSL, 100);
    this.overlayGraphics.noStroke();

    //unused since the later updates.
    this.overlayRatio =  1;
    this.loaded = true;
    visIsLoaded = true;

    console.log("matrix load done");
};

/**
 * Function to update the node size of the matrix.
 */
MatrixVisualization.prototype.updateNodeSize = function () {
    this.nodeSize = floor(this.maxSize / this.nodeCount);
};

/**
 * Updates the matrix data.
 * @param {url} url the json url of the data
 */
MatrixVisualization.prototype.setData = function (url) {
    print(url);
    loadJSON(url, loadNodes);

    //the json callback forgets what matrix called it.
    var currentMatrix = this;

    function loadNodes(data) {
        currentMatrix.data = data;
        currentMatrix.load();
    }

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

    //update the basic information based on the new data.
    this.nodeCount = this.getArrayAtIndex(1).length;
    this.updateNodeSize();

    //get the key to the weights
    let weights = this.getKeyAtIndex(1);

    //loop through all the edges and create a rectangle.
    for (let row = 0; row < this.nodeCount; row++) {
        this.matrix.push();
        for (let col = 0; col < this.nodeCount; col++) {
            let weight = this.data[weights][col][row];
            //use the weight to color the cell.
            var hue = map(log(weight), 0, 2, 65, 55);     //fixed variable oringal range TODO
            var brightness = map(log(weight), 0, 2, 22, 49);
            /*if (hue < 0) {
                hue += 100;
            }*/

            this.matrix.fill(hue, 100, brightness, 100);
            this.matrix.rect(0, 0, this.nodeSize, this.nodeSize);
            this.matrix.translate(0, this.nodeSize);
        }
        this.matrix.pop();
        this.matrix.translate(this.nodeSize, 0);
    }
};

/**
 * Draw the visualization.
 */
MatrixVisualization.prototype.draw = function () {
    //disregard draw calls that happen whilst it is still loading.
    if (!this.loaded) {
        return;
    }
    if (arguments.length === 0) {
        image(this.matrix, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
        image(this.overlayGraphics, this.position.x, this.position.y, this.drawWidth / this.zoomScale, this.drawWidth / this.zoomScale);
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
    var topLeft = createVector(this.position.x - (this.drawWidth / this.zoomScale)/2, this.position.y - (this.drawWidth / this.zoomScale)/2);
    var mouse = createVector(xCord, yCord);
    var cell = p5.Vector.sub(mouse, topLeft);
    var nodeSize = (this.drawWidth / this.zoomScale)/this.nodeCount;
    var x = floor(cell.x / nodeSize);
    var y = floor(cell.y / nodeSize);
    var cellVector = createVector(x, y);

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
        var x = cellVector.x;
        var y = cellVector.y;
    } catch (error) {
        document.getElementById('matrix-visualization-edge-info').style.display = 'none';
        throw new RangeError("clicked outside of visualization");
    }

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
};
