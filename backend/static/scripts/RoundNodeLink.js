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
     * Where the drawRoundNodeLink should start drawing.
     * @type {number}
     */
    this.startPosition = 0;

    this.nodes = [];
    this.tags = [];

    /**
     * Determines how fast to spin and in which direction
     */
    this.rotationVector = 0.1;

    /**
     * All variables that describe the circle around which the nodes are drawn
     */
    this.circleRadius = Math.min(P$.windowWidth / 3, P$.windowHeight / 3);
    this.setPosition(P$.createVector(P$.windowWidth / 2, P$.windowHeight / 2));
    this.circleLocation = this.getPosition();

    this.currentActive = null; // node which is clicked
    this.limit = 100; // at most 100 nodes can be put on the circle
    console.log("Constructor finished.")
};

RoundNodeLink.prototype = Object.create(Visualization.prototype);
RoundNodeLink.prototype.constructor = RoundNodeLink;

RoundNodeLink.prototype.useJSON = function (data) {
    let weights = data["weights"];
    console.log(data['minWeight'], data['maxWeight']);

    let number = 0;

    for (let node_index in weights) {
        let new_node = new Node(
            node_index, // node id
            data['tags'][node_index], // node name/label
            number,    // number in circle
            number * 2 * Math.PI / (Math.min(Object.keys(weights).length, this.limit) + 1),
            this.circleLocation,
            this.canvas,
            data['minWeight'],
            data['maxWeight']
        );
        this.nodes.push(new_node); // put in array
        number++;
        if (number > this.limit) {
            break; // stop adding nodes if the limit of nodes is reached
        }
    }

    // create the outgoing edges
    this.nodes.forEach((node) => {
        let outgoing = weights[node.id];
        for (let i = 0; i < outgoing.length; i++) {
            let weight = outgoing[i];
            let toNode;
            // find corresponding node (not optimal)
            if (weight > 0) {
                this.nodes.forEach((some_node) => {
                    if(some_node.number === i
            )
                {
                    toNode = some_node;
                }
            });
                let edge = new OutGoingEdge(weight, toNode);
                node.outGoingEdges.push(edge);
            }
        }
    });
    this.currentActive = this.nodes[0];
    this.nodes[0].active = true;

};


/**
 * Draw the visualization.
 */
RoundNodeLink.prototype.draw = function () {
    this.canvas.noFill();
    this.canvas.background(144, 14, 144);

    // draw each node
    this.nodes.forEach(node => {
        node.drawNode();
    });
    // rotate all nodes if needed
    if (this.currentActive && this.currentActive.angle > 0.1) {
        this.nodes.forEach(node => {
            node.angle = ((node.angle + this.rotationVector) % (Math.PI * 2) + Math.PI*2) % (Math.PI*2);
        })
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
    // calculate which edge is pressed not implemented
    throw new RangeError("clicked outside of visualization");

    return cellVector;
};

/**
 * Handles the clicking to the canvas.
 * @param xCord mouse x
 * @param yCord mouse y
 * @throws RangeError if you click outside of the matrix.
 */
RoundNodeLink.prototype.click = function (xCord, yCord) {
    this.nodes.forEach( (node) => {
        if (P$.dist(node.locationX(), node.locationY(), xCord, yCord) < node.radius) {
            // set new node active
            this.currentActive.active = false;
            this.currentActive = node;
            this.currentActive.active = true;

            // update rotationVector direction
            if (this.currentActive.isOnBottom()) {
                this.rotationVector = -Math.abs(this.rotationVector);
            } else {
                this.rotationVector = Math.abs(this.rotationVector);
            }
        }
    });
};


RoundNodeLink.prototype.zoom = function (a,b,c) {}; // no zoom (maybe later)



/**
 * The node which has to be drawn (This is kind of ugly right now)
 * @param id integer with with id of node
 * @param name of node
 * @param number which it is in circle
 * @param angle at which it is currently drawn
 * @param outsideCircleMiddle pVector with middle point around which to draw nodes
 * @constructor
 */
function Node(id, name, number, angle, outsideCircleMiddle, canvas, minWeightValue, maxWeightValue) {
    this.number = number;
    this.id = id;
    this.name = name;

    this.minWeightValue = minWeightValue;
    this.maxWeightValue = maxWeightValue;

    this.angle = angle;
    this.outsideCircleMiddle = outsideCircleMiddle;

    this.radius = 10; // radius of node
    this.active = false;
    this.outGoingEdges = []; // set manually after making nodes

    this.canvas = canvas;


    this.outsideRadius = function (text = false) {
        if (text === true) {
            return (Math.min(this.canvas.width, this.canvas.height) / 3 + 10);
        } else {
            return Math.min(this.canvas.width, this.canvas.height) / 3;
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
        this.canvas.stroke(0, 0, 0);
        this.canvas.circle(this.locationX(), this.locationY(), this.radius);
        // draw label
        this.canvas.push();
        // black color
        this.canvas.stroke(0, 0, 0);
        this.canvas.translate(this.locationX(text = true), this.locationY(text = true));
        this.canvas.rotate(this.angle);
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
                if (edgeWeight !== 0) {
                    this.canvas.push();
                    this.canvas.noFill();
                    if (solid) {
                        this.canvas.stroke('#000000');
                        this.canvas.stroke(P$.getWeightedColor(edgeWeight, this.minWeightValue, this.maxWeightValue))
                    } else {
                        this.canvas.stroke('#CCCCCC');
                    }
                    this.canvas.bezier(this.locationX(), this.locationY(), this.outsideCircleMiddle.x, this.outsideCircleMiddle.y,
                        toNode.locationX(), toNode.locationY(), toNode.locationX(), toNode.locationY());
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
