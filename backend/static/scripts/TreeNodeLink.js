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


TreeNodeLink.prototype.useJSON = function (data) {
    this.graph = {
        nodes: [],
        edges: []
    };
    //setup for sigma with setting for the graph
    s = new sigma(
        {
            graph: data,
            renderer: {
                container: this.canvas.canvas.parentElement,
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
        this.graph.nodes.push({
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
                this.graph.edges.push({
                    id: i,
                    weight: data.weights[indexNodes][indexEdges]/2,
                    size: data.weights[indexNodes][indexEdges]/2,
                    source: this.graph.nodes[indexNodes].id,
                    target: this.graph.nodes[indexEdges].id,
                    color: "#FFFFFF",
                    type: 'arrow'
                });
                i++
            }
        }
    }

    bindEvents();

    // Load the graph in sigma to draw
    s.graph.read(this.graph);
    // Make circle lay-out
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

            //Hide all nodes
            s.graph.nodes().forEach(
                function(ee) {
                    ee.hidden = true;
                });

            //Show all first generation nodes
            let nodeId0 = e.data.node.id;
            let generation1 = s.graph.findNeighbors(nodeId0);
            console.log(generation1);
            generation1[nodeId0] = e.data.node;
            console.log(generation1);
            s.graph.nodes().forEach(function(n, i, a) {
                if (generation1[n.id]) {
                    n.hidden = false;
                    n.x = 0.3 * Math.cos(Math.PI * 2 * i / a.length);
                    n.y = 0.3 * Math.sin(Math.PI * 2 * i / a.length);
                }
            });

            //Hide all edges
            s.graph.edges().forEach(
                function(ee) {
                    ee.hidden = true;
                }
            );

            //Unhide edges from centre to generation1
            s.graph.adjacentEdgesOut(nodeId0).forEach(
                function (ee) {
                    if (ee.source === nodeId0) {
                        ee.hidden = false;
                    }
                }
            );
            /*
                            //Show all second generation nodes
                            s.graph.nodes().forEach( function(n){
                                if (n.id in generation1){
                                    console.log(n);
                                    let nodeId1 = n.data.node.id;
                                    let generation2 = s.graph.findNeighbors(nodeId1);
                                    generation2[nodeId1] = n.data.node;
                                    s.graph.nodes().forEach(function(nn, i, a) {
                                        if (generation2[nn.id]) {
                                            nn.hidden = false;
                                            n.x = 0.6 * Math.cos(Math.PI * 2 * i / a.length);
                                            n.y = 0.6 * Math.sin(Math.PI * 2 * i / a.length);
                                        }
                                    });
                                }
                            });
            */
            //Place selected node in centre
            let centreNode = s.graph.nodes(e.data.node.id);
            centreNode.x = 0;
            centreNode.y = 0;
            centreNode.color = '#ff9900';

            s.refresh();
        });
        s.bind('doubleClickStage', function (e) {
            console.log(e.type, e.data.captor);
            //Show all nodes in initial circle
            s.graph.nodes().forEach(
                function(n, i, a) {
                    n.x = Math.cos(Math.PI * 2 * i / a.length);
                    n.y = Math.sin(Math.PI * 2 * i / a.length);
                    n.color = '#0099ff';
                    n.hidden = false;
                });

            //Show all edges
            s.graph.edges().forEach(
                function(ee) {
                    ee.hidden = false;
                }
            );

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