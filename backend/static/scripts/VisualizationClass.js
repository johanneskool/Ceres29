/***
 * Inheritance of all other visualizations.
 * @abstract
 * @constructor
 */
var Visualization = function () {
    if (this.constructor === Visualization) {
        throw new Error("Bruh.");
    }
    this.data;
    this.zoomScale;
    this.position = createVector();
};

/**
 * @Abstract
 */
Visualization.prototype.load = function () {
    return "load";
};

Visualization.prototype.setData = function (url) {
    this.data = url;
};

Visualization.prototype.draw = function () {
    return "draw";
};

Visualization.prototype.setActive = function (boolean) {
    return "active";
};

Visualization.prototype.isActive = function (boolean) {
    return "active";
};

Visualization.prototype.setPosition = function (position) {
    this.position.set(position);
};

Visualization.prototype.getPosition = function (position) {
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

Visualization.prototype.getArrayAtIndex = function (x) {
    return this.data[Object.keys(this.data)[x]];
};

Visualization.prototype.moveVisualization = function (xOff, yOff) {
    let offset = createVector(xOff, yOff);
    this.position.add(offset);
};

Visualization.prototype.getDataAtPosition = function (x,y) {
    return this.data[Object.keys(this.data)[x]][y];
};