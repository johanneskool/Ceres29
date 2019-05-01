/***
 * Inheritance of all other visualizations.
 * @abstract
 * @constructor
 */
var Visualization = function () {
    if (this.constructor === Visualization) {
        throw new Error("Bruh.");
    }
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





