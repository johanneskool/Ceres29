/**
 * @fileoverview Handler that serves as the communication between the canvasses and all the visualizations.
 * @author Samuel Oosterholt
 * @author Rink Pieters
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
    this.visDictionary = new dictionary();

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
     * Dictionary mapping url to jsons to prevent double loading.
     * @type {dictionary}
     */
    this.jsonDictionary = new dictionary();

    /**
     * Flag that is true if the Handler is actively showing a loaded visualization.
     * @type {boolean}
     */
    this.hasLoadedVisualization = false;

    /**
     * When loading multiple visualization with the same url, only the first will actually load the json,
     * the rest will be added to this list and resolved later to prevent double loading.
     * @type {dictionary}
     */
    this.jsonWaitingList = new dictionary();

    /**
     * Move the visualization mapped to the given canvas.
     * @param {number} xOff horizontal displacement
     * @param {number} yOff vertical displacement
     * @param {p5.Element} v
     */
    this.moveSelected = function (xOff, yOff, v) {
        let vis = this.visDictionary.get(v);
        vis.moveVisualization(xOff, yOff);
    };

    /**
     * Set the zoomScale of the selected visualization
     * @param {number} zoomScale
     * @param {p5.Element} v
     */
    this.setSelectedZoomScale = function (zoomScale, v) {
        let vis = this.visDictionary.get(v);
        vis.setZoomScale(zoomScale);
    };

    /**
     * Get the zoomscale of the selected visualization.
     * @param {p5.Element} v
     * return {number} zoomScale
     */
    this.getSelectedZoomScale = function (v) {
        let vis = this.visDictionary.get(v);
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
            let vis = this.visDictionary.get(v);
            vis.click(xPos, yPos);
            this.colorActiveCell(vis.getCell(xPos, yPos));
        } catch (e) {
            console.error(e);
            this.activeCell = null;
            //clicked nothing, unload active cell and clear overlay.
            for (let i = 0; i < this.visualizations.length; i++) {
                this.visualizations[i].deselectCell();
            }
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
        for (let i = 0; i < this.visualizations.length; i++) {
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
            console.error(error);
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
        window.history.replaceState({}, data_id, "/vis/" + data_id + "?vistype=" + GVH.mainvis_type + "&clustering=" + this.clustering_type + "&x=" + vector.x + "&y=" + vector.y);
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
        let vis = this.visDictionary.get(v);
        vis.drag(xOff, yOff);
    };

    /**
     * Create a new visualization and add it to the handler
     * @param visualization the visualization to add.
     * @param v
     */
    this.newVisualization = function (visualization, v) {
        console.log(visualization);
        switch (visualization) {
            case "matrix":
                let newMatrixVisualization = new MatrixVisualization();
                this._createVis(newMatrixVisualization, v);
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
            case "treeNodeLink":
                let newTreeNodeLink = new TreeNodeLink();
                this._createVis(newTreeNodeLink, v);
                break;
            case "treeNodeLink2":
                let newTreeNodeLink2 = new TreeNodeLink2();
                this._createVis(newTreeNodeLink2, v);
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
        this.visDictionary.put(v, visualizationObject);

        visualizationObject.setCanvas(v);
        visualizationObject.setVH(this);

        this.setSelectedZoomScale(1, v);
        this.centerSelected(v);
    };

    /**
     *
     * @param zoomIn {boolean} true if it is zooming in
     * @param mouseX {number} x cordinate of the mouse
     * @param mouseY {number} y cordinate of the mouse
     * @param v {p5.Element} canvas which called the function
     */
    this.zoomSelected = function (zoomIn, mouseX, mouseY, v) {
        let vis = this.visDictionary.get(v);
        vis.zoom(zoomIn, mouseX, mouseY);
    };

    /**
     * Returns the selected position as a p5 vector
     * @param {p5.Element} v
     * @returns {p5.Vector}
     */
    this.getSelectedPosition = function (v) {
        let vis = this.visDictionary.get(v);
        return vis.getPosition();
    };

    /**
     * Set the data for a selected visualization
     * @param url url of the json to set.
     * @param {p5.Element} v the selected canvas.
     */
    this.setData = function (url, v) {
        let vis = this.visDictionary.get(v);
        if (this.jsonDictionary.contains(url)) {
            //data was already called
            vis.useJSON(this.jsonDictionary.get(url));
        } else if (this.jsonWaitingList.contains(url)) {
            //data is being called
            this.jsonWaitingList.pushData(url, v);
        } else {
            //create waiting list for this url
            this.jsonWaitingList.put(url, []);
            vis.setData(url);
        }
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
        let vis = this.visDictionary.get(v);
        let container = v.canvas.parentElement;
        //use the container width / height otherwise it wont be centered.
        let position = P$.createVector(container.offsetWidth / 2, container.offsetHeight / 2);
        vis.setPosition(position);
    };

    this.centerAll = function () {
        for (let i = 0; i < this.visDictionary.size(); i++) {
            this.centerSelected(this.visDictionary.keys()[i]);
        }
    }

    /**
     * Draw visualization mapped to the canvas
     * @param v
     */
    this.drawSelected = function (v) {
        let vis = this.visDictionary.get(v);
        vis.draw();
    };

    /**
     * Draws all the visualization handled by this VH.
     */
    this.drawAll = function () {
        for (let i = 0; i < this.visualizations.length; i++) {
            this.visualizations[i].draw();
        }
    };

    /**
     * Loops through the waining visualizations
     */
    this.resolveWaitingList = function (data) {
        //loop through all visualizations that were waiting on JSON
        if (this.jsonWaitingList.contains(data)) {
            for (let i = 0; i < this.jsonWaitingList.get(data).length; i++) {
                this.visDictionary.get(this.jsonWaitingList.get(data)[i]).useJSON(this.jsonDictionary.get(data));
            }
            //wipe waitinglist
            this.jsonWaitingList.remove(data);
        }
        updateLoadingState(false);
    }
};

/**
 * My own key-value pair dictionary.
 * (implemented most java dictionary functions)
 * @constructor
 */
var dictionary = function () {
    /**
     * Key-value pairs in the dictionary
     * @type {array} the data
     * @private
     * data[0] are the keys
     * data[1] are the values
     */
    this._data = [[],[]];

     /**
     * All the keys in the dictionary.
     * @type {array}
     */
    this._keys = this._data[0];

     /**
     * All the values in the dictionary
     * @type {array}
     */
    this._values = this._data[1];

     /**
     * Returns the elements in the dictionary as an array.
     * @return {array} values
     */
    this.elements = function () {
        return this._values;
    };

     /**
     * Returns the keys in the dictionary as an array.
     * @return {array}
     */
    this.keys = function () {
        return this._keys;
    };

     /**
     * Returns the value to which the key is mapped in this dictionary
     * @param k
     * @return {value} the value mapped to the key
     */
    this.get = function (k) {
        let index = this._keys.indexOf(k);
        if (index < 0) {
            throw new ReferenceError(k + ' is not a valid key');
        }
        return this._values[index];
    };

     /**
     * Tests if this dictionary maps no keys to value.
     * @return {boolean}
     */
    this.isEmpty = function () {
        return this._keys.length === 0 || this._values.length === 0;
    };

     /**
     * Maps the specified key to the specified value in this dictionary.
     * @param {*} k the key
     * @param {*} v the value
     */
    this.put = function (k, v) {
        //new key
        if (this._keys.indexOf(k) < 0) {
            this._keys.push(k);
            this._values.push(v);
        } else {
            //if not new key update v.
            let index = this._keys.indexOf(k);
            this._values[index] = v;
            return v;
        }
    };

    /**
     * Checks if the dictionary contains key k
     * @param k
     * @returns {boolean}
     */
    this.contains = function (k) {
        return this._keys.indexOf(k) > -1;
    };

     /**
     * Removes key-value pair from dictionary
     * @param {*} k key to remove
     * @throws {ReferenceError} if key is not in dictionary
     */
    this.remove = function (k) {
        let index = this._keys.indexOf(k);
        if (index > -1) {
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
        } else {
            throw new ReferenceError(k + ' is not a valid key');
        }
    };

    /**
     * Function that adds a value to a key if the key points to a array/list.
     * @param k
     * @param v
     */
    this.pushData = function (k, v) {
        let index = this._keys.indexOf(k);
        if (index > -1) {
            this._values[index].push(v);
        } else {
            throw new ReferenceError(k + ' is not a valid key');
        }
    };

     /**
     * Size of the dictionary
     * @return {number}
     */
    this.size = function () {
        return this._keys.length;
    }
};
