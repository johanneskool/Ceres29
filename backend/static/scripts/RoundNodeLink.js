/**
 * @fileoverview Contains the round node link visualization class and the functions needed to draw it to the canvas
 * @author Tristan Trouwen
 */

var RoundNodeLink = function () {
    Visualization.call(this, arguments);
    /**
     * Flag is true if visualization is done loading
     * @type {boolean}
     */
    this.loaded = true;
    /**
     * Minimum and maximum weight of edge
     * Should be updated in useJSON
     */
    this.minWeight = 0;
    this.maxWeight = 1000;


    this.fullyconnected = false;

    /**
     * Minimum weight for edge to be shown
     * @type {number}
     */
    this.filterWeightMin = 0.5;
    this.filterWeightMax = 10000;

    this.nodes = {};
    this.tags = [];

    /**
     * Where the drawRoundNodeLink should start drawing.
     * @type {number}
     */
    this.startPosition = 0;

    /**
     * Determines how fast to spin and in which direction
     */
    this.rotationVector = 0.1;

    this.zoomScale = 1;

    /**
     * All variables that describe the circle around which the nodes are drawn
     */
    this.circleRadius = Math.min(P$.windowWidth / 3, P$.windowHeight / 3);
    this.setPosition(P$.createVector(P$.windowWidth / 2, P$.windowHeight / 2));
    this.circleLocation = this.getPosition();


    this.currentActive = null; // node which is clicked
    this.limit = 200; // at most 100 nodes can be put on the circle
    console.log("Constructor finished.")
};

RoundNodeLink.prototype = Object.create(Visualization.prototype);
RoundNodeLink.prototype.constructor = RoundNodeLink;

RoundNodeLink.prototype.select = (x,y) => {
    node.makeActive(x);
};


/**
 * Setter for this zoomScale
 * @param {number} zoomScale
 */
Visualization.prototype.setZoomScale = function (zoomScale) {
    this.zoomScale = zoomScale/100+0.2;
    this.zoomScale = Math.max(0.6, Math.min(15, zoomScale));
    try {
        var nodes1 = Object.values(this.nodes);
        for (var x = 0; x < nodes1.length; x++) {
            nodes1[x].zoom(this.zoomScale);
        }
    } catch (e) {
        console.log(e)

    }
};

/**
 * getter for this zoomscale
 * @return {number}
 */
Visualization.prototype.getZoomScale = function () {
    return this.zoomScale;
};

RoundNodeLink.prototype.useJSON = function (data) {
    // make sure everything resets
    this.nodes = {};
    this.tags = [];
    try {
        this.minEdgeWeightFilterSlider.remove();
        this.maxEdgeWeightFilterSlider.remove();
    } catch (e) {
        console.log(e)
    }



    let weights = data["weights"];
    this.minWeight = data['minWeight'];
    this.maxWeight = data['maxWeight'];
    this.fullyconnected = data['fullyconnected'];
    /**
     * Create sliders for filtering
     * @type {p5.slider}
     */
    this.minEdgeWeightFilterSlider = P$.createSlider(this.minWeight,this.maxWeight,(this.maxWeight-this.minWeight)/4, "any");
    this.minEdgeWeightFilterSlider.value(this.minWeight + 50*(this.maxWeight-this.minWeight)/100);
    this.minEdgeWeightFilterSlider.parent(document.getElementById("minEdgeWeightFilter"));
    // max
    this.maxEdgeWeightFilterSlider = P$.createSlider(this.minWeight,this.maxWeight,(3*(this.maxWeight-this.minWeight)/4), "any");
    this.maxEdgeWeightFilterSlider.value(this.minWeight + 51*(this.maxWeight-this.minWeight)/100);
    this.maxEdgeWeightFilterSlider.parent(document.getElementById("maxEdgeWeightFilter"));

    let number = 0;

    for (let node_index in weights) {
        let new_node = new Node(
            node_index, // node id
            data['tags'][node_index], // node name/label
            number,    // number in circle
            number * 2 * Math.PI / (Math.min(Object.keys(weights).length, this.limit) + 1),
            this,
        );
        this.nodes[node_index] = new_node; // put in array
        number++;
        if (number > this.limit) {
            break; // stop adding nodes if the limit of nodes is reached
        }
    }

    // create the outgoing edges
    Object.values(this.nodes).forEach((node) => {
        let outgoing = weights[node.id];
        for (let i = 0; i < outgoing.length; i++) {
            let weight = outgoing[i];
            let toNodeIndex;
            // find corresponding node (not optimal)
            if (weight > 0) {
                Object.values(this.nodes).forEach((some_node) => {
                    if (some_node.number === i) {
                        toNodeIndex = some_node.id;
                    }
                });
                let edge = new OutGoingEdge(weight, toNodeIndex);
                node.outGoingEdges.push(edge);
            }
        }
    });
    this.currentActive = this.nodes[0];
    this.nodes[0].active = true;
    console.log(this.currentActive);
};


/**
 * Draw the visualization.
 */
RoundNodeLink.prototype.draw = function () {
    this.canvas.noFill();

    try {
        this.filterWeightMin = this.minEdgeWeightFilterSlider.value();
        this.filterWeightMax = this.maxEdgeWeightFilterSlider.value();
    } catch {
        // not yet defined
    }

    // draw each node
    var nodes1 = Object.values(this.nodes);
    for (var x=0; x < nodes1.length; x++) {
        nodes1[x].drawNode();
    }
    // rotate all nodes if needed
    if (this.currentActive && this.currentActive.angle > 0.1) {
        for (var x=0; x < nodes1.length; x++) {
            nodes1[x].angle = ((nodes1[x].angle + this.rotationVector) % (Math.PI * 2) + Math.PI*2) % (Math.PI*2);
        }
    }
};


/**
 * Turns x and y cords into a cell.
 * @param xCord
 * @param yCord
 * @return {p5.Vector} vector of the cell at the given position.
 * @throws RangeError if you click a cell that is outside of the matrix, i.e. a bad click.
 */
RoundNodeLink.prototype.getCell = function (xCord, yCord) {
    var nodes1 = Object.values(this.nodes);
    for (var x=0; x < nodes1.length; x++) {
        if (P$.dist(nodes1[x].locationX(), nodes1[x].locationY(), xCord, yCord) < nodes1[x].radius) {
            return [nodes1[x].id, 0];

        }
    }
};

/**
 * Handles the clicking to the canvas.
 * @param xCord mouse x
 * @param yCord mouse y
 * @throws RangeError if you click outside of the matrix.
 */
RoundNodeLink.prototype.click = function (xCord, yCord) {
    var nodes1 = Object.values(this.nodes);
    for (var x=0; x < nodes1.length; x++) {
        if (P$.dist(nodes1[x].locationX(), nodes1[x].locationY(), xCord, yCord) < nodes1[x].radius) {
            this.makeActive(nodes1[x].id);
        }
    }
};

/**
 * Make active
 * @param nodeIndex
 */
RoundNodeLink.prototype.makeActive = function (nodeIndex) {
    this.currentActive.active = false;
    this.currentActive = this.nodes[nodeIndex];
    this.currentActive.active = true;
    // update rotationVector direction
    if (this.currentActive.isOnBottom()) {
        this.rotationVector = -Math.abs(this.rotationVector);
    } else {
        this.rotationVector = Math.abs(this.rotationVector);
    }
};

/**
 * The node which has to be drawn (This is kind of ugly right now)
 * @param id integer with with id of node
 * @param name of node
 * @param number which it is in circle
 * @param angle at which it is currently drawn
 * @param nodelink instance
 * @constructor
 */
function Node(id, name, number, angle, nodelink) {
    this.number = number;
    this.id = id;
    this.name = name;

    this.angle = angle;
    this.outsideCircleMiddle = nodelink.circleLocation;

    this.radius = 10; // radius of node
    this.active = false;
    this.outGoingEdges = []; // array with node id's (set manually)

    this.canvas = nodelink.canvas;
    this.nodelink = nodelink;

    this.outsideRad = (Math.min(this.canvas.width, this.canvas.height) / 4);

    this.zoom = function(zoomScale) {
        this.textSize = 8*(1+zoomScale/2);
        this.outsideRad = 100*zoomScale;
        this.radius = 1 + (zoomScale*9)
    };

    this.outsideRadius = function (text = false) {
        if (text === true) {
            return this.outsideRad + this.radius;
        } else {
            return this.outsideRad;
        }
    };


    this.locationX = function (text = false) {
        return Math.cos(this.angle) * this.outsideRadius(text) + this.outsideCircleMiddle.x;
    };
    this.locationY = function (text = false) {
        return Math.sin(this.angle) * this.outsideRadius(text) + this.outsideCircleMiddle.y;
};

    this.isOnBottom = function () {
        // returns true if node is on the bottom half of the circle
        return !(this.angle > Math.PI);
    };

    this.isOnLeft = function () {
        // returns true if node is on left half of circle
        return (this.angle > (Math.PI/2) && this.angle < (3*(Math.PI/2)));
    };

    this.drawNode = function () {
        this.canvas.stroke(255,255, 255);
        this.canvas.fill(255,255,255);
        if (this.active) {
            this.canvas.fill(0,0,255);
        }
        this.canvas.circle(this.locationX(), this.locationY(), this.radius);
        // draw label
        this.canvas.push();
        // black color
        this.canvas.stroke(255, 255, 255);
        this.canvas.translate(this.locationX(text = true), this.locationY(text = true));
        this.canvas.rotate(this.angle);
        this.canvas.textSize(this.textSize);
        this.canvas.text(this.name, 0, 0);
        this.canvas.pop();
        // only draw edges of ac
        if (this.active) {
            this.drawEdges(solid=true);
        } else {
            this.drawEdges()
        }
    };

    this.drawEdges = function (solid=false) {
        // draw edges
        for (let nodeIndex = 0; nodeIndex < this.outGoingEdges.length; nodeIndex++) {
            try {
                let toNode = this.outGoingEdges[nodeIndex].toNode;
                let edgeWeight = this.outGoingEdges[nodeIndex].weight;
                if (edgeWeight >= this.nodelink.filterWeightMin && edgeWeight <= this.nodelink.filterWeightMax) {
                    this.canvas.push();
                    this.canvas.noFill();
                    if (solid) {
                        this.canvas.stroke('#000000');
                        this.canvas.stroke(P$.getWeightedColor(edgeWeight, this.nodelink.minWeight, this.nodelink.maxWeight, this.nodelink.fullyconnected))
                    } else {
                        this.canvas.stroke('#CCCCCC');
                    }
                    this.canvas.bezier(this.locationX(), this.locationY(), this.outsideCircleMiddle.x, this.outsideCircleMiddle.y,
                        this.nodelink.nodes[toNode].locationX(), this.nodelink.nodes[toNode].locationY(),
                        this.nodelink.nodes[toNode].locationX(), this.nodelink.nodes[toNode].locationY());
                    this.canvas.pop();
                }
            } catch (e) {
                // to_node is not defined (the case when to_node was not drawn due to lack of space)
            }
        }
    }
}

function OutGoingEdge(weight, toNode) {
    this.weight = weight;
    this.toNode = toNode;
}
