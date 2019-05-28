/**
 * @fileoverview Contains the tree node link visualization
 * Sigma
 * @author Fabienne van der Weide
  */

var TreeNodeLink = function () {
    Visualization.call(this, arguments);
    /**
     * Flag is true if visualization is done loading
     * @type {boolean}
     */
    this.loaded = false;

    console.log("ok");
};

TreeNodeLink.prototype = Object.create(Visualization.prototype);
TreeNodeLink.prototype.constructor = TreeNodeLink;

/**
* Updates the matrix data.
* @param {url} url the json url of the data
*/
TreeNodeLink.prototype.setData = function (url) {
    let currentVisualization = this;
    P$.loadJSON(url, loadNodes);

    function loadNodes(data) {
        currentVisualization.data = url;
        currentVisualization.graph = {
            nodes: [],
            edges: []
        };
        //setup for sigma with setting for the graph
        s = new sigma(
            {
                graph: data,
                renderer: {
                    container: document.getElementById(currentVisualization.canvas.parent),
                    type: 'webGL'
                },
                settings: {
                    minEdgeSize: 0.01,
                    maxEdgeSize: 0.2,
                    minNodeSize: 2,
                    maxNodeSize: 5,
                    minArrowSize: 4,
                    animationsTime: 1000,
                    enableHovering: true,
                    doubleClickEnabled: false,
                    edgeHoverExtremities: true
                }
            }
        );

        //adds nodes to the graph
        for (let index in data.tags) {
            currentVisualization.graph.nodes.push({
                id: index,
                label: data.tags[index],
                x: P$.random(-2000, 2000),
                y: P$.random(-1000, 1000),
                size: P$.random(2, 4),
                color: '#0099ff'
            });
        }

        //add edges to the graph
        let i = 0;
        for (let indexNodes in data.tags) {
            for (let indexEdges in data.weights) {
                if ((data.weights[indexNodes][indexEdges]) > 0.6) {
                    currentVisualization.graph.edges.push({
                        id: i,
                        weight: data.weights[indexNodes][indexEdges]/2,
                        size: data.weights[indexNodes][indexEdges]/2,
                        source: currentVisualization.graph.nodes[indexNodes].id,
                        target: currentVisualization.graph.nodes[indexEdges].id,
                        color: "#FFFFFF",
                        type: 'arrow'
                    });
                    i++
                }
            }
        }

        bindEvents();

        // Load the graph in sigma to draw
        s.graph.read(currentVisualization.graph);
        // Ask sigma to draw it and refresh
        s.refresh();

        function bindEvents() {
            let nodeId = "0";

        // Bind the events:
            s.bind('overNode outNode clickNode rightClickNode', function (e) {
                console.log(e.type, e.data.node.label, e.data.captor);
            });
            s.bind('doubleClickNode', function (e) {
                console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
                nodeId = e.data.node.id;
                s.graph.nodes().forEach(
                    function(ee) {
                        ee.hidden = true;
                });
                s.graph.nodes(e.data.node.id).x = 0;
                s.graph.nodes(e.data.node.id).y = 0;
                s.graph.nodes(e.data.node.id).hidden = false;
                s.graph.childOf(nodeId).forEach(
                    function (ee) {
                        console.log(ee)
                        s.graph.nodes(ee.data.node.id).hidden = false;
                });
                s.refresh();
            });
            s.bind('doubleClickStage', function (e) {
                console.log(e.type, e.data.captor);
                s.graph.nodes().forEach(
                    function(e) {
                        e.hidden = false;
                });
                s.refresh();
            });
            s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function (e) {
                console.log(e.type, e.data.edge, e.data.captor);
            });
            s.bind('clickStage', function (e) {
                console.log(e.type, e.data.captor);
            });
            s.bind('rightClickStage', function (e) {
                console.log(e.type, e.data.captor);
            });
        }

    }
};

//Method for finding the nodes which the current node links to
//Return them in an array
sigma.classes.graph.addMethod('childOf', function(id) {
    if (typeof id !== 'string')
        throw 'childOf: the node id must be a string.';
    let a = this.allNeighborsIndex[id],
        target,
        nodes = [];
    for(target in a) {
        nodes.push(target);
    }
    console.log(nodes);
    return nodes;
});