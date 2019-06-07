/**
 * @fileoverview Contains the tree node link visualization
 * Sigma
 * @author Fabienne van der Weide, Akam Bilbas
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
                type: 'canvas'
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
                    size: 10,
                    source: this.graph.nodes[indexNodes].id,
                    target: this.graph.nodes[indexEdges].id,
                    color: "#FFFFFF",
                    type: 'arrow'
                });
                i++
            }
        }
    }


    //moves the unused default canvas to the bottom, we cant remove it because
    //it gives the dynamic size.
    //only do it once ofcourse
    if (!this.loaded) {
        let parentElement = this.canvas.canvas.parentElement;
        parentElement.appendChild(this.canvas.canvas);
        this.loaded = true;
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
        let generationCount = 3;
        // Bind the events:
        s.bind('overNode outNode clickNode rightClickNode', function (e) {
            console.log(e.type, e.data.node.label, e.data.captor);
        });
        s.bind('doubleClickNode', function (e) {
            console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
            showNeighbours(e, generationCount, e.data.node.id);
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

function showNeighbours(e, generationCount, nodeID) {
    //hide all nodes
    s.graph.nodes().forEach(
        function(ee) {
            ee.hidden = true;
        });

    //Hide all edges
    s.graph.edges().forEach(
        function(ee) {
            ee.hidden = true;
        }
    );

    //Show the first generation
    let firstNode = s.graph.findNeighbors(nodeID);
    firstNode[nodeID] = e.data.node;
    showGeneration(e, firstNode, 0);

    let nextGeneration = firstNode;
    let nodes;

    for (let i = 1; i < generationCount; i++) {
        let nextGenerationNext = {};
        let nextGenerationNew = {};

        //Search the nodes in next Generation and put their neighbours in nextGenerationNew
        for (nodes in nextGeneration) {
            nextGenerationNext = s.graph.findNeighbors(nextGeneration[nodes].id);
            nextGenerationNew = Object.assign({}, nextGenerationNew, nextGenerationNext);
        }

        //Giving the nodes in nextGenerationNew the nodes (not sure if needed)
        for (nodes in nextGenerationNew) {
            nextGenerationNew[nextGenerationNew[nodes].id] = s.graph.nodes(nextGenerationNew[nodes].id);
        }

        //Show the generation
        console.log(nextGenerationNew);
        showGeneration(e, nextGenerationNew, i);

        //next generation will get the new nodes that are founded
        nextGeneration = nextGenerationNew;
    }

    //Place selected node in centre
    let centreNode = s.graph.nodes(e.data.node.id);
    centreNode.x = 0;
    centreNode.y = 0;
    centreNode.color = '#ff9900';
    e.data.node.id.hidden = false;
}

function showGeneration(e, generation, j) {
    //Show all nodes in the generation
    s.graph.nodes().forEach(function(n, i, a) {
        if (generation[n.id]) {
            n.hidden = false;
            n.x = (0.3 + 0.3*j) * Math.cos(Math.PI * 2 * i / a.length);
            n.y = (0.3 + 0.3*j) * Math.sin(Math.PI * 2 * i / a.length);
            console.log("test");
        }
    });

    //Unhide edges from centre to generation1
    s.graph.adjacentEdgesOut(e.data.node.id).forEach(
        function (ee) {
            if (ee.source === e.data.node.id) {
                ee.hidden = false;
            }
        }
    );
}

//finds and returns the neighbours of the given node ID
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
