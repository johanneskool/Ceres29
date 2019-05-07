/**
 * @fileoverview Handler that serves as the communication between the canvasses and all the visualizations.
 * @author Samuel Oosterholt
 */

/**
 * Main VisualizationHandler (VH) class
 * @constructor
 */
var VisualizationHandler = function () {
    /**
     * Main array containing all the visualizations handled by this handler.
     * @type {Array}
     */
    this.visualizations = [];

    /**
     * Canvas on which this handler works
     * @type {canvas}
     */
    this.visualizationCanvas;

    /**
     * The active visualization is the visualization that is being interacted with.
     * @type {Visualization}
     */
    this.active;

    /**
     * The vector of the currently selected node, vector representation in the matrix.
     * @type {p5.Vector}
     */
    this.activeCell;

    /**
     * Url of the current json used by this VH
     * @type {url}
     */
    this.data = null;

    /**
     * Active setter
     * @returns {Visualization}
     */
    this.getActive = function () {
        return active;
    };

    /**
     * Active getter
     * @param active
     */
    this.setActive = function (active) {
        this.active = active;
    };

    /**
     * Draw the active function to the canvas
     */
    this.drawActive = function () {
        this.active.draw();
    };

    /**
     * Move the active visualization.
     * @param xOff horizontal displacement
     * @param yOff vertical displacement
     */
    this.moveActive = function (xOff, yOff) {
        this.active.moveVisualization(xOff, yOff);
    };

    /**
     * Set the zoomScale of the active visualization
     * @param zoomScale
     */
    this.setActiveZoomScale = function (zoomScale) {
        this.active.setZoomScale(zoomScale);
    };

    /**
     * Get the zoomscale of the active visualization.
     */
    this.getActiveZoomScale = function () {
        this.active.getZoomScale();
    };

    /**
     * Function that handles a click on a canvas.
     * If there is no active visualization on the position of the click
     * any visualization on that spot will then be set to active.
     * (i.e. click on a visualization to make it active.)
     * @param xPos x position of the click
     * @param yPos y position of the click
     */
    this.click = function (xPos, yPos) {
        //If the active visualization throws an error
        try {
            this.active.click(xPos, yPos);
            this.colorCell(this.active.getCell(xPos, yPos));
        } catch (error) {
            //check if we have clicked on another vis, we do this by running through the array and checking for click errors.
            if (error instanceof RangeError) {
                for (let i = 0; i < this.visualizations.length; i++) {
                    try {
                        this.visualizations[i].click(xPos, yPos);
                    } catch (error) {
                        console.log(error);
                        continue
                    }
                    this.setActive(this.visualizations[i]);
                    return;
                }
            }
        }
        //clicked nothing, unload active cell.
        this.activeCell = null;
    };

    /**
     * Colro a cell in all the visualization in the VH
     * @param {P5.Vector} vector the vector of the cell.
     */
    this.colorCell = function (vector) {
        this.activeCell = vector;
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].colorCell(vector.x, vector.y);
        }
    };

    /**
     * Sets the current canvas
     * @param {canvas} canvas on which the VH should work.
     */
    this.setCanvas = function (canvas) {
        this.visualizationCanvas = canvas;
    };

    /**
     * Create a new visualization and add it to the handler
     * @param visualization the visualization to add.
     */
    this.newVisualization = function (visualization) {
        switch (visualization) {
            case "matrix":
                let newMatrixVisualization = new MatrixVisualization();
                this.visualizations.push(newMatrixVisualization);
                this.active = newMatrixVisualization;

                //if this VH has data
                if (this.data != null) {
                    newMatrixVisualization.setData(this.data);
                }

                if (this.activeCell != null) {
                    newMatrixVisualization.colorCell(this.activeCell.x, this.activeCell.y);
                }

                this.active.setZoomScale(1);
                this.centerActive();
                break;
        }
    };

    /**
     * Set the position of the active visualization
     * @param position
     */
    this.setActivePosition = function (position) {
        this.active.setPosition(position);
    };

    /**
     * Returns the active position as a p5 vector
     * @returns {p5.Vector}
     */
    this.getActivePosition = function () {
        return this.active.getPosition();
    };


    /**
     * Set the data for each visualization handled by this VH
     * @param url url of the json to set.
     */
    this.setData = function (url) {
        this.data = url;
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].setData(url);
        }
    };

    /**
     * Centers the active visualization, does not reset zoomScale.
     */
    this.centerActive = function () {
        //id of the current canvas
        let id = this.visualizationCanvas.id();

        //container of the canvas
        let container = document.getElementById(id).parentElement;

        //use the container width / height otherwise it wont be centered.
        let position = createVector(container.offsetWidth / 2, container.offsetHeight / 2);

        this.active.setPosition(position);
    };

    /**
     * Draws all the visualization handled by this VH.
     */
    this.drawAll = function () {
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].draw();
        }
    };

};
