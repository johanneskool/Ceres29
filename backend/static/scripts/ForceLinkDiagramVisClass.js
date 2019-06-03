/**
 * @fileoverview Contains the force link diagram visualization class and the functions needed to draw it to the sigma canvas
 * @author Akam Bilbas
 */

var ForceLink = function () {
    Visualization.call(this, arguments);
    /**
     * Flag is true if visualization is done loading
     * @type {boolean}
     */
    this.loaded = false;

    console.log("ok");
};

ForceLink.prototype = Object.create(Visualization.prototype);
ForceLink.prototype.constructor = ForceLink;

/**
 * Updates the matrix data.
 * @param {url} url the json url of the data
 */
ForceLink.prototype.useJSON = function (data) {
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
                minEdgeSize: 0.2,
                maxEdgeSize: 1,
                minNodeSize: 2,
                maxNodeSize: 5,
                animationTime: 1000,
                defaultNodeColor: '#0099ff',
                minArrowSize: 6,
                enableHovering: true,
                doubleClickEnabled: false,
                defaultEdgeType: 'arrow'
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
            size: P$.random(2, 4)
        });
    }

    //add edges to the graph
    let i = 0;
    for (let indexNodes in data.tags) {
        for (let indexEdges in data.weights) {
            if ((data.weights[indexNodes][indexEdges]) > 0) {
                this.graph.edges.push({
                    id: i,
                    weight: data.weights[indexNodes][indexEdges],
                    size: data.weights[indexNodes][indexEdges],
                    source: this.graph.nodes[indexNodes].id,
                    target: this.graph.nodes[indexEdges].id,
                    color: "#FFFFFF",
                    __proto__: null
                });
                i++
            }
        }
    }

    bindEvents();

    // Load the graph in sigma to draw
    s.graph.read(this.graph);
    // Ask sigma to draw it and refresh
    s.refresh();

    //configuring Force Atlas
    const forceAtlas2Config = {
        strongGravityMode: true,
        gravity: 0.1,
        worker: true,
        scalingRatio: 1,
        slowDown: 4,
        barnesHutOptimize: true,
        barnesHutTheta: 0.1,
        nodeSize: 'original',
        autoStop: true
    };
    s.configForceAtlas2(forceAtlas2Config);

    //Starting Force Atlas and stops after 8 seconds
    s.startForceAtlas2(forceAtlas2Config);
    window.setTimeout(function () {
        s.killForceAtlas2();
    }, 12000);
};

function bindEvents() {
    let nodeId = "0";
    let oldNode;
    // Bind the events:
    s.bind('overNode outNode rightClickNode', function (e) {
        console.log(e.type, e.data.node.label, e.data.captor);
    });
    s.bind('clickNode', function (e) {
        //colors the edges when clicked on a node
        s.graph.adjacentEdgesOut(nodeId).forEach(
            function (ee) {
                ee.color = "#FFFFFF";
            }
        );
        console.log(e.type, e.data.node.label, e.data.captor);
        nodeId = e.data.node.id;
        s.graph.adjacentEdgesOut(nodeId).forEach(
            function (ee) {
                if (ee.color === '#ff9900' && ee.source === nodeId) {
                    ee.color = "#FFFFFF";
                } else if (ee.source === nodeId) {
                    ee.color = '#ff9900';
                }
            }
        );

        //colors the selected node orange
        if (oldNode != null) {
            oldNode.color = "#0099ff";
        }

        if (e.data.node.isSelected) {
            e.data.node.color = "#0099ff";
            e.data.node.isSelected = false;
        } else {
            e.data.node.color = "#ff9900";
            oldNode = e.data.node;
            e.data.node.isSelected = true;
        }
        s.refresh();
    });
    s.bind('doubleClickNode', function (e) {
        //show the neighbours of the node double clicked on
        console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
        s.killForceAtlas2();
        let filter = new sigma.plugins.filter(s);
        filter.neighborsOf(e.data.node.id);
        filter.apply();
        filter.undo();
        s.refresh();
    });
    s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function (e) {
        console.log(e.type, e.data.edge, e.data.captor);
    });
    s.bind('clickStage', function (e) {
        console.log(e.type, e.data.captor);
    });
    s.bind('doubleClickStage rightClickStage', function (e) {
        console.log(e.type, e.data.captor);
    });
};

//Method for finding the adjacent edges return them in an array
sigma.classes.graph.addMethod('adjacentEdgesOut', function(id) {
    if (typeof id !== 'string')
        throw 'adjacentEdgesOut: the node id must be a string.';
    let a = this.allNeighborsIndex[id],
        eid,
        target,
        edges = [];
    for(target in a) {
        for(eid in a[target]) {
            edges.push(a[target][eid]);
        }
    }
    return edges;
});