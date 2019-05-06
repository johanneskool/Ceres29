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
};

/**
 * @Abstract
 */
Visualization.prototype.load = function () {
    return "load";
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

Visualization.prototype.getArrayAtKey = function (key) {
    return this.data[key];
};

Visualization.prototype.getKeyAtIndex = function (index) {
    return Object.keys(this.data)[index];
};

Visualization.prototype.getArrayAtIndex = function (x) {
    return this.data[Object.keys(this.data)[x]];
};

Visualization.prototype.getDataAtPosition = function (x,y) {
    return this.data[Object.keys(this.data)[x]][y];
};


