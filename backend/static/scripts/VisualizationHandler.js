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
     * Dictionary mapping visualization to canvas.
     * @type {dictionary}
     */
    this.visDictionary = new Object();

    /**
     * The vector of the currently selected node, vector representation in the matrix.
     * @type {p5.Vector}
     */
    this.activeCell;

    /**
     * Url of the current json usd by this VH
     * @type {url}
     */
    this.data = null;

    /**
     * Flag that is true if the Handler is actively showing a loaded visualization.
     * @type {boolean}
     */
    this.hasLoadedVisualization = false;

    /**
     * Move the visualization mapped to the given canvas.
     * @param {number} xOff horizontal displacement
     * @param {number} yOff vertical displacement
     * @param {p5.Element} v
     */
    this.moveSelected = function (xOff, yOff, v) {
        let vis = this.visDictionary[v];
        vis.moveVisualization(xOff, yOff);
    };

    /**
     * Set the zoomScale of the selected visualization
     * @param {number} zoomScale
     * @param {p5.Element} v
     */
    this.setSelectedZoomScale = function (zoomScale, v) {
        let vis = this.visDictionary[v];
        vis.setZoomScale(zoomScale);
    };

    /**
     * Get the zoomscale of the selected visualization.
     * @param {p5.Element} v
     * return {number} zoomScale
     */
    this.getSelectedZoomScale = function (v) {
        let vis = this.visDictionary[v];
        return vis.getZoomScale()
    };

    /**
     * Function that handles the canvas click.
     * Every visualization should throw an error if a click
     * was unsuccessful but should also have a function to identify which cell was clicked (or edge)
     *
     * @param xPos x position of the click
     * @param yPos y position of the click
     * @param {p5.Element} v
     */
    this.clickSelected = function (xPos, yPos, v) {
        try {
            let vis = this.visDictionary[v];
            vis.click(xPos, yPos);
            this.colorActiveCell(vis.getCell(xPos, yPos));
        } catch (e) {
            console.log(e);
        }
    };

    /**
     * Function that handles a click on a canvas.
     * If there is no active visualization on the position of the click
     * any visualization on that spot will then be set to active.
     * (i.e. click on a visualization to make it active.)
     * @param xPos x position of the click
     * @param yPos y position of the click
     * @deprecated
     */
    this.click = function (xPos, yPos) {
        //first try to see if any other visualization on top are a click.
        for (let i = 0; i <this.visualizations.length; i++) {
            let index = this.visualizations.length - i;
            if (this.visualizations[index] !== this.active) {
                try {
                    this.visualizations[index].getCell(xPos, yPos);
                } catch (e) {
                   continue;
                }
                this.setActive(this.visualizations[index]);
                return;
            }
        }

        //If the active visualization throws an error
        try {
            this.active.click(xPos, yPos);
            this.colorActiveCell(this.active.getCell(xPos, yPos));
            return;
        } catch (error) {
            console.log(error);
            //check if we have clicked on another vis, we do this by running through the array and checking for click errors.
            if (error instanceof RangeError) {
                for (let i = 0; i <= this.visualizations.length; i++) {
                    //look from back to front.
                    let index = this.visualizations.length - i;
                    try {
                        this.visualizations[index].getCell(xPos, yPos);
                    } catch (error) {
                        continue
                    }
                    this.setActive(this.visualizations[index]);
                    return;
                }
            }
        }
        //clicked nothing, unload active cell and clear overlay.
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].colorActiveCell(-1, -1);
        }
        this.activeCell = null;
    };

    /**
     * Color a cell in all the visualization in the VH
     * @param {p5.Vector} vector the vector of the cell.
     */
    this.colorActiveCell = function (vector) {
        this.activeCell = vector;
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].colorActiveCell(vector.x, vector.y);
        }
        window.history.replaceState({}, data_id, "/vis/" + data_id + "?clustering=" + this.clustering_type + "&x=" + vector.x + "&y=" + vector.y);
    };


    /**
     * Delete the active visualization from the handler.
     * @deprecated
     */
    this.deleteActive = function () {
        let activeIndex = this.visualizations.indexOf(this.active);
        console.log(activeIndex);
        if (activeIndex > -1) {
            this.visualizations.splice(activeIndex,1)
        }
        if (this.visualizations.length > 0) {
            this.active = this.visualizations[activeIndex - 1];
        } else {
            this.hasLoadedVisualization = false;
        }
        console.log(this.visualizations);
    };

    /**
     * Getter for hasLoadedVisualization.
     * @return {boolean}
     */
    this.getLoadedVisualization = function () {
        return this.hasLoadedVisualization;
    };

    /**
     * Setter of HasLoadedVisualization
     * @param boolean
     */
    this.setLoadedVisualization = function (boolean) {
        this.hasLoadedVisualization = boolean;
    };

    this.dragSelected = function (xOff, yOff, v) {
        let vis = this.visDictionary[v];
        vis.drag(xOff, yOff);
    };

    /**
     * Create a new visualization and add it to the handler
     * @param visualization the visualization to add.
     * @param v
     */
    this.newVisualization = function (visualization, v) {
        switch (visualization) {
            case "matrix":
                let newMatrixVisualization = new MatrixVisualization();
                this._createVis(newMatrixVisualization, v);
                this.centerSelected(v);
                break;
            case "roundNodeLink":
                let newRoundNodeLink = new RoundNodeLink();
                this._createVis(newRoundNodeLink, v);
                this.active.setZoomScale(1);
                break;
            case "forceLink":
                let newForceLink = new ForceLink();
                this._createVis(newForceLink, v);
                //this.centerSelected(v);
                break;
        }
    };


    /**
     * Create vis Object
     * @private
     */
    this._createVis = function (visualizationObject, v) {
        this.visualizations.push(visualizationObject);
        this.active = visualizationObject;

        //add the visualization-canvas pair to the dictionary.
        this.visDictionary[v] = visualizationObject;
        //if this VH has data
        if (this.data != null) {
            visualizationObject.setData(this.data);
        }

        visualizationObject.setCanvas(v);
        visualizationObject.setVH(this);

        this.active.setZoomScale(1);
    };

    /**
     *
     * @param zoomIn {boolean} true if it is zooming in
     * @param mouseX {number} x cordinate of the mouse
     * @param mouseY {number} y cordinate of the mouse
     * @param v {p5.Element} canvas which called the function
     */
    this.zoomSelected = function (zoomIn, mouseX, mouseY, v) {
        let vis = this.visDictionary[v];
        vis.zoom(zoomIn, mouseX, mouseY);
    };

    /**
     * Set the position of the active visualization
     * @param position
     * @deprecated
     */
    this.setActivePosition = function (position) {
        this.active.setPosition(position);
    };

    /**
     * Returns the active position as a p5 vector
     * @returns {p5.Vector}
     * @deprecated
     */
    this.getActivePosition = function () {
        return this.active.getPosition();
    };

    /**
     * Returns the selected position as a p5 vector
     * @param {p5.Element} v
     * @returns {p5.Vector}
     */
    this.getSelectedPosition = function (v) {
        let vis = this.visDictionary[v];
        return vis.getPosition();
    };

    /**
     * Set the data for a selected visualization
     * @param url url of the json to set.
     * @param {p5.Element} v the selected canvas.
     */
    this.setData = function (url, v) {
        let vis = this.visDictionary[v];
        vis.setData(url);
    };

    /**
     * Updates all the visualization data.
     * @param url url of the json to set.
     */
    this.updateData = function (url) {
        this.data = url;
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].setData(url);
        }
    };


    this.centerSelected = function (v) {
        let vis = this.visDictionary[v];
        let id = v.parent;
        let container = document.getElementById(id);

        //use the container width / height otherwise it wont be centered.
        let position = P$.createVector(container.offsetWidth / 2, container.offsetHeight / 2);

        vis.setPosition(position);
    };


    /**
     * Draw visualization mapped to the canvas
     * @param v
     */
    this.drawSelected = function (v) {
        let vis = this.visDictionary[v];
        vis.draw();
    };

    /**
     * Draws all the visualization handled by this VH.
     * @deprecated
     */
    this.drawAll = function () {
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].draw();
        }
    };

};
