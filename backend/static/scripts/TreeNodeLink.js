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
                size: 3,
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
        // Make circle lay-out
        var radius = 10;
        s.graph.nodes().forEach(function(n, i, a) {
            n.x = Math.cos(Math.PI * 2 * i / a.length);
            n.y = Math.sin(Math.PI * 2 * i / a.length);
        });
        // Ask sigma to draw it and refresh
        s.refresh();

        function bindEvents() {
        // Bind the events:
            s.bind('overNode outNode clickNode rightClickNode', function (e) {
                console.log(e.type, e.data.node.label, e.data.captor);
            });
            s.bind('doubleClickNode', function (e) {
                console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
                //Hides all nodes
                s.graph.nodes().forEach(
                    function(ee) {
                        ee.hidden = true;
                });

                //Shows all first generation nodes
                var nodeId = e.data.node.id,
			        generation1 = s.graph.findNeighbors(nodeId);
                console.log(generation1);
			        generation1[nodeId] = e.data.node;
			        let nr_of_nodes = generation1.length;
		        s.graph.nodes().forEach(function(n, i, a) {
			        if (generation1[n.id]) {
                        n.hidden = false;
                        n.x = 0.3 * Math.cos(Math.PI * 2 * i / a.length);
                        n.y = 0.3 * Math.sin(Math.PI * 2 * i / a.length);
                    }
		        });

		        //Places selected node in centre
                let centreNode = s.graph.nodes(e.data.node.id);
                centreNode.x = 0;
                centreNode.y = 0;

                s.refresh();
            });
            s.bind('doubleClickStage', function (e) {
                console.log(e.type, e.data.captor);
                //Shows all nodes in initial circle
                s.graph.nodes().forEach(
                    function(n, i, a) {
                        n.x = Math.cos(Math.PI * 2 * i / a.length);
                        n.y = Math.sin(Math.PI * 2 * i / a.length);
                        n.hidden = false;
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

sigma.classes.graph.addMethod('findNeighbors', function(nodeId) {
	var k,
		neighbors = {},
		index = this.allNeighborsIndex[nodeId] || {};

	for (k in index) {
        if (k !== nodeId) {
            neighbors[k] = this.nodesIndex[k];
        }
    }

	return neighbors;
});