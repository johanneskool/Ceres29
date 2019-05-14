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
     * All variables that describe the circle around which the nodes are drawn
     */
    this.circleRadius = Math.min(windowWidth/3, windowHeight/3);
    this.circleLocation = createVector(windowWidth/2, windowHeight/2);

    this.currentActive = null; // node which is clicked
    this.limit = 100; // at most 100 nodes can be put on the circle
    console.log("ok")
};

RoundNodeLink.prototype = Object.create(Visualization.prototype);
RoundNodeLink.prototype.constructor = RoundNodeLink;


/**
 * Updates the matrix data.
 * @param {url} url the json url of the data
 */
RoundNodeLink.prototype.setData = function (url) {
    loadJSON(url, loadNodes);

    function loadNodes(data) {
        let weights = data["weights"];
        let number = 0;

        let currentVisualization = this;

        for (let node_index in weights) {
            let new_node = new Node(
                node_index, // node id
                number,    // number in circle
                number*2*Math.PI/(Math.min(Object.keys(data).length, currentVisualization.limit)+1),
                currentVisualization.circleLocation,
                currentVisualization.circleRadius
            );
            print(currentVisualization.circleLocation);
            currentVisualization.nodes.push(new_node); // put in array
            number++;
            if (number > limit) {
                break; // stop adding nodes if the limit of nodes is reached
            }
        }

        // create the outgoing edges
        nodes.forEach((node) => {
            let outgoing = weights[node.id];
            for (let i = 0; i < outgoing.length; i++) {
                let weight = outgoing[i];
                let toNode;
                // find corresponding node (not optimal)
                if (weight > 0) {
                    nodes.forEach((some_node) => {
                        if (some_node.number === i) {
                            toNode = some_node;
                        }
                    });
                    let edge = new OutGoingEdge(weight, toNode);
                    node.outGoingEdges.push(edge);
                }
            }});

        currentActive = nodes[0];
        nodes[0].active = true;
    }
};

/**
 * Draw the visualization.
 */
MatrixVisualization.prototype.draw = function () {
    background(141,141,141);
    noFill();

    // draw each node
    nodes.forEach(node => {
        node.drawNode();
    });

    // rotate all nodes if needed
    if (currentActive.angle > 0.1) {
        nodes.forEach(node => {
            node.angle = (node.angle + 0.1) % (Math.PI * 2);
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
MatrixVisualization.prototype.getCell = function (xCord, yCord) {
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
MatrixVisualization.prototype.click = function (xCord, yCord) {
    //nothing implemented yet;
};


/**
 * The node which has to be drawn (This is kind of ugly right now)
 * @param id integer with with id of node
 * @param number which it is in circle
 * @param angle at which it is currently drawn
 * @param outsideRadius of on which the node are drawn
 * @param outsideCircleMiddle pVector with middle point around which to draw nodes
 * @constructor
 */
function Node(id, number, angle, outsideRadius, outsideCircleMiddle) {
    this.number = number;
    this.id = id;

    this.angle = angle;
    this.outsideRadius = outsideRadius;
    this.outsideCircleMiddle = outsideCircleMiddle;

    this.radius = 10; // radius of node
    this.active = false;
    this.outGoingEdges = []; // set manually after making nodes

    this.locationX = function() {
        return Math.cos(this.angle)*this.outsideRadius + this.outsideCircleMiddle.x;
    };
    this.locationY = function() {
        return Math.sin(this.angle)*this.outsideRadius + this.outsideCircleMiddle.y;
    };

    this.drawNode = function() {
        stroke(0,0,0);
        circle(this.locationX(), this.locationY(), this.radius);
        // draw label
        push();
        // black color
        stroke(0,0,0);
        this.outsideRadius += this.radius; // hack to make the text go outward a bit, revert after drawing text
        translate(this.locationX(), this.locationY());
        rotate(this.angle);
        text(this.name, 0,0);
        this.outsideRadius -= this.radius;
        pop();
        // only draw edges of ac
        if (this.active) {
            this.drawEdges();
        }
    };

    this.drawEdges = function() {
        // draw edges
        for (let nodeIndex = 0; nodeIndex < this.outGoingEdges.length; nodeIndex++) {
            try {
                let edgeWeight = this.outGoingEdges[i];
                if (edgeWeight !== 0) {
                    noFill();
                    push();
                    stroke(this.outGoingEdges[i].outGoingEdges*10,this.outGoingEdges[i].weight*10,0);
                    bezier(this.locationX(), this.locationY(), this.outsideCircleMiddle.x, this.outsideCircleMiddle.y,
                        toNode.locationX(), toNode.locationY(), toNode.locationX(), toNode.locationY());
                    pop();
                }
            } catch(e) {
                // to_node is not defined (the case when to_node was not drawn due to lack of space)
            }
        }
    }
}

function outGoingEdge(weight, toNode) {
    this.weight = weight;
    this.toNode = toNode;
}
