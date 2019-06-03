/**
 * @fileoverview Contains the tree node link visualization
 * P5
 * @author Fabienne van der Weide
  */

var TreeNodeLink2 = function () {
    Visualization.call(this, arguments);
    /**
     * Flag is true if visualization is done loading
     * @type {boolean}
     */
    this.loaded = true;

    this.nodes = [];
    this.tags = [];

    console.log("Constructor finished.")
};

TreeNodeLink2.prototype = Object.create(Visualization.prototype);
TreeNodeLink2.prototype.constructor = TreeNodeLink2;

/**
 * Updates the data.
 * @param {url} url the json url of the data
 */
TreeNodeLink2.prototype.setData = function (url) {
    console.log('Start setting data');
    let currentVisualization = this;
    P$.loadJSON(url, loadNodes);

    function loadNodes(data) {
        let weights = data["weights"];

        for (let node_index in weights) {
            let new_node = new Node(
                node_index, // node id
                data['tags'][node_index], // node name/label
                number,
                currentVisualization.canvas
            );
            currentVisualization.nodes.push(new_node); // put in array
            number++;
            if (number > currentVisualization.limit) {
                break; // stop adding nodes if the limit of nodes is reached
            }
        }

        // create the outgoing edges
        currentVisualization.nodes.forEach((node) => {
            let outgoing = weights[node.id];
            for (let i = 0; i < outgoing.length; i++) {
                let weight = outgoing[i];
                let toNode;
                // find corresponding node (not optimal)
                if (weight > 0) {
                    currentVisualization.nodes.forEach((some_node) => {
                        if (some_node.number === i) {
                            toNode = some_node;
                        }
                });
                    let edge = new OutGoingEdge(weight, toNode);
                    node.outGoingEdges.push(edge);
                }
            }
    });
        currentVisualization.currentActive = currentVisualization.nodes[0];
        currentVisualization.nodes[0].active = true;
    }

    /**
     * Draw the visualization.
     */

    TreeNodeLink.prototype.draw = function () {
        this.canvas.noFill();
        this.canvas.background(144,14,144);

        // draw each node
        this.nodes.forEach(node => {
            node.drawNode();
        });
    };


};

/**
 * The node which has to be drawn (This is kind of ugly right now)
 * @param id integer with with id of node
 * @param name of node
 * @param number which it is in circle
 * @param angle at which it is currently drawn
 * @param outsideCircleMiddle pVector with middle point around which to draw nodes
 * @constructor
 */
function Node(id, name, number, canvas) {
    this.number = number;
    this.id = id;
    this.name = name;

    this.radius = 10; // radius of node
    this.active = false;
    this.outGoingEdges = []; // set manually after making nodes

    this.canvas = canvas;

    this.locationX = P$.random(-2000, 2000);
    this.locationY = P$.random(-1000, 1000);

    this.drawNode = function() {
        this.canvas.stroke(0,0,0);
        this.canvas.circle(this.locationX(), this.locationY(), this.radius);
        // draw label
        this.canvas.push();
        // black color
        this.canvas.stroke(0,0,0);
        this.canvas.pop();
        // only draw edges of ac
        this.drawEdges();
    };

    this.drawEdges = function() {
        // draw edges
        for (let nodeIndex = 0; nodeIndex < this.outGoingEdges.length; nodeIndex++) {
            try {
                let toNode = this.outGoingEdges[nodeIndex].toNode;
                let edgeWeight = this.outGoingEdges[nodeIndex].weight;
                if (edgeWeight !== 0) {
                    this.canvas.noFill();
                    this.canvas.push();
                    this.canvas.stroke(0,0,0);
                    this.canvas.line(this.locationX(), this.locationY(), toNode.locationX(), toNode.locationY());
                    this.canvas.pop();
                }
            } catch(e) {
                console.log(e)
                // to_node is not defined (the case when to_node was not drawn due to lack of space)
            }
        }
    }
}

function OutGoingEdge(weight, toNode) {
    this.weight = weight;
    this.toNode = toNode;
}