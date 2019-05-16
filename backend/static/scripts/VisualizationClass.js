
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
    this.zoomScale;
    this.position = P$.createVector();
    this.vH;
    this.canvas;
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

Visualization.prototype.setZoomScale = function (zoomScale) {
    this.zoomScale = zoomScale;
};

Visualization.prototype.getZoomScale = function () {
    return this.zoomScale;
};

Visualization.prototype.getArrayAtKey = function (key) {
    return this.data[key];
};

Visualization.prototype.getKeyAtIndex = function (index) {
    return Object.keys(this.data)[index];
};

Visualization.prototype.setVH = function (vH) {
    this.vH = vH;
};

Visualization.prototype.getArrayAtIndex = function (x) {
    return this.data[Object.keys(this.data)[x]];
};

Visualization.prototype.moveVisualization = function (xOff, yOff) {
    let offset = P$.createVector(xOff, yOff);
    this.position.add(offset);
};

Visualization.prototype.getDataAtPosition = function (x,y) {
    return this.data[Object.keys(this.data)[x]][y];
};

/**
 * Function to find and return the minimum weight in the data set
 * @return {number} minimum weight
 */
Visualization.prototype.getMinWeight = function () {
    var array = this.data.weights;
    const min = P$.min(array.map(x = > P$.min(x))
)
    return min;
};

/**
 * Function to find and return the maximum weight in the data set
 * @return {number} maximum weight
 */
Visualization.prototype.getMaxWeight = function () {
    var array = this.data.weights;
    const max = P$.max(array.map(x = > P$.max(x))
)
    return max;
};

/**
 * Function that should be able to handle a click to the canvas with the given coords.
 * @param posX
 * @param posY
 * @throws RangeError if you click outside the visualization. !important.
 */
Visualization.prototype.click = function (posX, posY) {

};