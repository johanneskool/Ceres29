/**
 * @fileoverview Contains the matrix visualization class and the functions needed to draw it to the canvas
 * @author Samuel Oosterholt
 * @author Tristan Trouwem
 * @author Rink Pieters
 * @author Johannes Kool
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
 * @override
 */
MatrixVisualization.prototype.load = function () {
    //update the node count
    this.nodeCount = this.dataJSON.tags.length;
    this.startPositon = 0;
    this.updateNodeSize();

    if (this.matrix === undefined) {
        //create a matrix and the buffer graphics
        const matrixSize = this.nodeCount * this.nodeSize;
        this.matrix = P$.createGraphics(matrixSize, matrixSize);
        this.matrix.colorMode(P$.HSL, 100);
        this.matrix.textSize(this.nodeSize / 2);
        this.matrix.imageMode(P$.CENTER);
        this.matrix.noStroke();

        //where we can show selected nodes.
        this.overlayGraphics = P$.createGraphics(matrixSize, matrixSize);
        this.overlayGraphics.imageMode(P$.CORNER);
        this.overlayGraphics.colorMode(P$.HSL, 100);
        this.overlayGraphics.noStroke();

        //unused since the later updates.
        this.overlayRatio = 1;
    }

    console.log(this.position);

    //initial matrix size
    this.drawWidth = P$.ceil(P$.min(P$.windowHeight, P$.windowWidth) / 1.3);
    this.matrix.background(0, 0, 0);
    //draw the nodes from the data to the buffer
    this.drawMatrix(this);
};

/**
 * Function to update the node size of the matrix.
 */
MatrixVisualization.prototype.updateNodeSize = function () {
    // this.nodeSize = P$.floor(this.maxSize / this.nodeCount);
    this.nodeSize = 1;
};

/**
 * Updates the matrix data.
 * @param {url} url the json url of the data
 * @override
 */
MatrixVisualization.prototype.setData = function (url) {
    P$.print(url);
    P$.loadJSON(url, loadNodes, loadFailed);

    //the json callback forgets what matrix called it.
    var currentMatrix = this;

    function loadNodes(dataJSON) {
        //data is new so send the json to load.
        currentMatrix.vH.jsonDictionary.put(url, dataJSON);

        //resolve waiting list for this data if applicable.
        currentMatrix.vH.resolveWaitingList(url);

        currentMatrix.useJSON(dataJSON);
    }

    function loadFailed() {
        errorMessage("There was an error getting the data. Perhaps we requested a non-existing data-type. If this issue persists, try uploading the file again.");
    }

};

/**
 * Function that loads the JSON into the matrix, should be used when json has already been get, else use setData.
 * @param {dataJSON} dataJSON the JSON to load.
 */
MatrixVisualization.prototype.useJSON = function (dataJSON) {
    console.groupCollapsed("Loading " + dataJSON.name);
    this.dataJSON = dataJSON;
    this.nodeCount = this.dataJSON.weights.length;
    this.minWeight = this.dataJSON.minWeight;
    this.maxWeight = this.dataJSON.maxWeight;
    this.updateNodeSize();
    this.load();

    console.groupEnd();
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
    this.matrix.fill(0, 0, 0);
    this.matrix.rect(0, 0, this.nodeCount * this.nodeSize, this.nodeCount * this.nodeSize);

    P$.colorMode(P$.HSB, 100);
    this.matrix.loadPixels();
    console.log(this.matrix.pixels);

    let d = P$.pixelDensity();

    //loop through all the edges and create a rectangle.
    for (let col = 0; col < this.nodeCount; col++) {
        for (let row = 0; row < this.nodeCount; row++) {
            if (this.dataJSON.weights[col][row] === 0) continue;
            let weight; //for use in the for-loop
            weight = this.dataJSON.weights[col][row];

            //use the weight to color the cell.
            let fillColor = P$.getWeightedColor(weight, this.dataJSON.minWeight, this.dataJSON.maxWeight, this.dataJSON.fullyconnected);


            for (let i = 0; i < d; i++) {
                for (let j = 0; j < d; j++) {
                    let index = 4 * ((row * d + j) * this.nodeCount * d + (col * d + i));
                    this.matrix.pixels[index] = P$.red(fillColor);
                    this.matrix.pixels[index + 1] = P$.green(fillColor);
                    this.matrix.pixels[index + 2] = P$.blue(fillColor);
                    this.matrix.pixels[index + 3] = 1000;
                }
            }


            // this.matrix.rect(this.nodeSize * col, this.nodeSize * row, this.nodeSize, this.nodeSize);
        }
    }

    this.matrix.updatePixels();
    this.loaded = true;
    this.vH.setLoadedVisualization(true);
};

/**
 * Draw the visualization.
 * @override
 */
MatrixVisualization.prototype.draw = function () {
    //disregard draw calls that happen whilst it is still loading.
    if (!this.loaded) {
        //matrix can be unloaded without data
        if (this.dataJSON != null) {
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
 * @override
 */
MatrixVisualization.prototype.select = function (x, y) {
    this.overlayGraphics.clear();
    this.overlayGraphics.fill(50, 75, 75);
    console.log("draw at " + x + y);
    this.overlayGraphics.rect(x * this.overlayRatio * this.nodeSize, y * this.overlayRatio * this.nodeSize, this.overlayRatio * this.nodeSize, this.overlayRatio * this.nodeSize);

};

/**
 * Turns x and y cords into a cell.
 * @param xCord
 * @param yCord
 * @return {p5.Vector} vector of the cell at the given position.
 * @throws RangeError if you click a cell that is outside of the matrix, i.e. a bad click.
 * @override
 */
MatrixVisualization.prototype.getCell = function (xCord, yCord) {
    // calculate which edge is pressed
    var topLeft = P$.createVector(this.position.x - (this.drawWidth / this.zoomScale) / 2, this.position.y - (this.drawWidth / this.zoomScale) / 2);
    var mouse = P$.createVector(xCord, yCord);
    //Fixed bug where it wouldnt recognize the p5.Vector.sub function.
    var cell = mouse.copy();
    cell.sub(topLeft);
    var nodeSize = (this.drawWidth / this.zoomScale) / this.nodeCount;
    var x = P$.floor(cell.x / nodeSize);
    var y = P$.floor(cell.y / nodeSize);

    if (x < 0 || y < 0 || x > this.nodeCount || y > this.nodeCount) {
        throw new RangeError("clicked outside of visualization");
    }

    return [x, y];
};

/**
 * Handles the clicking to the canvas.
 * @param xCord mouse x
 * @param yCord mouse y
 * @throws RangeError if you click outside of the matrix.
 * @override
 */
MatrixVisualization.prototype.click = function (xCord, yCord) {
    // function gets executed when an edge is pressed
    try {
        var cellVector = this.getCell(xCord, yCord);
        var x = cellVector[0];
        var y = cellVector[1];
    } catch (error) {
        // document.getElementById('matrix-visualization-edge-info').style.display = 'none';
        throw error;
    }
    current_URL = new URL(window.location.href);

    from = this.dataJSON.tags[x];
    from = from.replace(/_/g, ' ');
    to = this.dataJSON.tags[y];
    to = to.replace(/_/g, ' ');
    let weight = this.dataJSON.weights[x][y];  //we store it as weights[col][row], so get correct weight
    // show debugging info in console
    var text = "Edge from '" + from + "' to '" + to + "' has a weight of: '" + weight + "'";
    console.groupCollapsed(text);
    console.log('x cord: ' + x + ', y cord: ' + y);
    console.groupEnd();

    //make this a scope variable
    let currentMatrix = this;
    if (currentMatrix.vH.clustering_type === 'cluster_graph' && current_URL.searchParams.get("trace") == null) {
        from = '<button type="button" id="cluster0" value="' + "cluster #" + x + '">' + "cluster #" + x + '</button>';
        to = '<button type="button" id="cluster1" value="' + "cluster #" + y + '">' + "cluster #" + y + '</button>';
    }

    // update sidebar with information
    document.getElementById('matrix-visualization-edge-info').style.display = 'inherit';
    document.getElementById('matrix-visualization-edge-info-from').innerHTML = from;
    document.getElementById('matrix-visualization-edge-info-to').innerHTML = to;
    document.getElementById('matrix-visualization-edge-info-weight').innerHTML = weight;
    // Handle the buttons for the clusters
    if (currentMatrix.vH.clustering_type === 'cluster_graph' && current_URL.searchParams.get("trace") == null) {
        var clusterbutton0 = document.getElementById('cluster0');
        clusterbutton0.addEventListener('click', function () {
            // currentMatrix.vH.setData("/data/1?type=default", currentMatrix.canvas);
            let id = data_id;
            let clustering = currentMatrix.vH.clustering_type;
            let url = "/data/" + id + "?&type=" + clustering + "&trace=" + x;
            console.log("trying to get ", url);

            history.pushState({}, "", current_URL + "&trace=" + x);
            currentMatrix.vH.setData(url, currentMatrix.canvas);
        });
        var clusterbutton1 = document.getElementById('cluster1');
        clusterbutton1.addEventListener('click', function () {
            let id = data_id;
            let clustering = currentMatrix.vH.clustering_type;
            let url = "/data/" + id + "?&type=" + clustering + "&trace=" + y;
            console.log("trying to get ", url);
            history.pushState({}, "", current_URL + "&trace=" + x);
            currentMatrix.vH.setData(url, currentMatrix.canvas);

        });
    }
};

/**
 * Function that deselects the cell by coloring the cell -1, -1
 * @override
 */
MatrixVisualization.prototype.deselect = function () {
    this.select(-1, -1);
};
