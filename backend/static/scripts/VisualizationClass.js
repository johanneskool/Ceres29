/***
 * Inheritance of all other visualizations.
 * @abstract
 * @constructor
 */
var Visualization = function () {
    if (this.constructor === Visualization) {
        throw new Error("Bruh.");
    }
    /**
     * Current url used by the visualization
     * @type {json|null}
     */
    this.data = null;

    /**
     * zoomScale for the visualization
     * @type {number}
     */
    this.zoomScale;

    /**
     * Vector position of this visualization
     * @type {p5.Vector}
     */
    this.position = P$.createVector();

    /**
     * visualizationHandler linked to this visualization
     * @type {visualizationHandler}
     */
    this.vH;

    /**
     * Canvas on which the visualization is drawn
     * @type {p5.Element}
     */
    this.canvas;

    /**
     * Factor by which the zoomScale should increase / decrease
     * @type {number}
     */
    this.zoomFactor = 1.5;
};


/**
 * canvas getter
 * @return {canvas} current canvas on which the visualization is drawn.
 */
Visualization.prototype.getCanvas = function () {
    return this.canvas;
};

/**
 * Canvas setter
 * @param {canvas} p5canvas - canvas to draw the visualization on.
 */
Visualization.prototype.setCanvas = function (p5canvas) {
    this.canvas = p5canvas;
};

/**
 * Should return the cell that is at canvas coords
 * @param xPos
 * @param yPos
 * @abstract
 */
Visualization.prototype.getCell = function (xPos, yPos) {

};

/**
 * Function that handles the zooming, overwrite it if you need to change it or want to disable it.
 * @param zoomIn
 * @param mouseX
 * @param mouseY
 */
Visualization.prototype.zoom = function (zoomIn, mouseX, mouseY) {
    if (zoomIn) {
        //hard to explain in code, get some pen and paper and visualize the transformation.
        this.moveVisualization(-(mouseX - this.position.x) * (this.zoomFactor - 1), -(mouseY - this.position.y) * (this.zoomFactor - 1));
        this.setZoomScale(this.zoomScale / this.zoomFactor);
    } else {
        //idem.
        this.moveVisualization((mouseX - this.position.x) * (this.zoomFactor - 1) / this.zoomFactor, (mouseY - this.position.y) * (this.zoomFactor - 1) / this.zoomFactor);
        this.setZoomScale(this.zoomScale * this.zoomFactor);
    }
};

/**
 * A seperate function that is called by the canvas to drag the visualization in case you want to overwrite the dragging mechanic.
 * @param xOff
 * @param yOff
 */
Visualization.prototype.drag = function (xOff, yOff) {
    this.moveVisualization(xOff, yOff);
};

/**
 * zoomFactor setter
 * @param {number} zoomFactor new zoomFactor.
 */
Visualization.prototype.setZoomFactor = function (zoomFactor) {
    this.zoomFactor = zoomFactor;
};

/**
 * zoomFactor getter
 * @return {number} this visualization zoom factor.
 */
Visualization.prototype.getZoomFactor = function () {
    return this.zoomFactor;
};

/**
 * Should load the main visualization
 * @abstract
 */
Visualization.prototype.load = function () {
};

/**
 * Should update the visualization data from the json url.
 * Must also add the data / json combo to the jsondictionary for loading improvement.
 * @abstract
 * @param url
 */
Visualization.prototype.setData = function (url) {
    this.data = url;
};

/**
 * Should draw the image to this.canvas.
 * @abstract
 */
Visualization.prototype.draw = function () {
};

/**
 * Should update the image position.
 * @param {p5.Vector} position vector
 */
Visualization.prototype.setPosition = function (position) {
    this.position.set(position);
};

/**
 * Should return the image position
 * @return {p5.Vector}
 */
Visualization.prototype.getPosition = function () {
    return this.position;
};

/**
 * Setter for this zoomScale
 * @param {number} zoomScale
 */
Visualization.prototype.setZoomScale = function (zoomScale) {
    this.zoomScale = Math.max(0.01, Math.min(5, zoomScale));
};

/**
 * getter for this zoomscale
 * @return {number}
 */
Visualization.prototype.getZoomScale = function () {
    return this.zoomScale;
};

/**
 * visualizationHandler setter for this visualization
 * @param {VisualizationHandler} vH
 */
Visualization.prototype.setVH = function (vH) {
    this.vH = vH;
};

/**
 * Moves this visualization by the given offset.
 * @param xOff
 * @param yOff
 */
Visualization.prototype.moveVisualization = function (xOff, yOff) {
    let offset = P$.createVector(xOff, yOff);
    this.position.add(offset);
};

/**
 * Function that should be able to handle a click to the canvas with the given coords.
 * @param posX
 * @param posY
 * @throws RangeError if you click outside the visualization. !important.
 */
Visualization.prototype.click = function (posX, posY) {

};

/**
 * Function that should be able to deselect / decolor any selected nodes in the visualization.
 * @abstract
 */
Visualization.prototype.deselectCell = function () {
}


/**
 * Function that should be called when a json url has already been loaded.
 * @param {JSON} The data that should be loaded into this visualization.
 * @abstract
 */
Visualization.prototype.useJSON = function (JSON) {

};