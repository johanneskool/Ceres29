/**
 * @fileoverview Contains the force link diagram visualization class and the functions needed to draw it to the sigma canvas
 * @author Akam Bilbas
 * @author Tristan Trouwen
 */


var ForceLink = function () {
    Visualization.call(this, arguments);
    /**
     * Flag is true if visualization is done loading
     * @type {boolean}
     */
    this.loaded = false;

    this.s = null;
};

ForceLink.prototype = Object.create(Visualization.prototype);
ForceLink.prototype.constructor = ForceLink;

ForceLink.prototype.setData = function (url) {
    P$.print(url);
    P$.loadJSON(url, loadForce, loadFailed);

    //the json callback forgets what matrix called it.
    var currentForce = this;

    function loadForce(dataJSON) {
        //data is new so send the json to load.
        currentForce.vH.jsonDictionary.put(url, dataJSON);

        //resolve waiting list for this data if applicable.
        currentForce.vH.resolveWaitingList(url);

        currentForce.useJSON(dataJSON);
    }

    function loadFailed(response) {
        errorMessage("There was an error getting the data. Perhaps we requested a non-existing data-type. If this issue persists, try uploading the file again.");
    }

};

/**
 * Updates the matrix data.
 * @param {url} url the json url of the data
 */
ForceLink.prototype.useJSON = function (data) {
    if (this.s !== undefined && this.s !== null) {
        this.s.graph.clear();
        this.s.refresh();
    }
    this.graph = {
        nodes: [],
        edges: []
    };
    //setup for sigma with setting for the graph
    this.s = new sigma(
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
                maxNodeSize: 7,
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
            size: P$.random(5, 6)
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

    //moves the unused default canvas to the bottom, we cant remove it because
    //it gives the dynamic size.
    //only do it once ofcourse
    if (!this.loaded) {
        let parentElement = this.canvas.canvas.parentElement;
        parentElement.appendChild(this.canvas.canvas);
        this.loaded = true;
    }
    this.bindEvents();

// Initialize the dragNodes plugin:
/*    var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);
    dragListener.bind('startdrag', function(event) {
        console.log(event);
    });
    dragListener.bind('drag', function(event) {
        console.log(event);
    });
    dragListener.bind('drop', function(event) {
        console.log(event);
    });
    dragListener.bind('dragend', function(event) {
        console.log(event);
    });*/

    // Load the graph in sigma to draw
    this.s.graph.read(this.graph);
    // Ask sigma to draw it and refresh
    this.s.refresh();

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
    this.s.configForceAtlas2(forceAtlas2Config);

    //Starting Force Atlas and stops after 8 seconds
    this.s.startForceAtlas2(forceAtlas2Config);
    window.setTimeout(function () {
        this.s.killForceAtlas2();
    }, 12000);
};

ForceLink.prototype.bindEvents = function()  {
    let nodeId = "0";
    let oldNode;
    // Bind the events:
    this.s.bind('overNode outNode rightClickNode', function (e) {
        console.log(e.type, e.data.node.label, e.data.captor);
    });
    this.s.bind('clickNode', function (e) {
        //colors the edges when clicked on a node
        this.s.graph.adjacentEdgesOut(nodeId).forEach(
            function (ee) {
                ee.color = "#FFFFFF";
            }
        );
        console.log(e.type, e.data.node.label, e.data.captor);
        nodeId = e.data.node.id;
        this.s.graph.adjacentEdgesOut(nodeId).forEach(
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
        this.s.refresh();
    });
    this.s.bind('doubleClickNode', function (e) {
        //show the neighbors of the node double clicked on
        console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
        this.s.killForceAtlas2();
        let filter = new sigma.plugins.filter(s);
        filter.neighborsOf(e.data.node.id);
        filter.apply();
        filter.undo();
        this.s.refresh();
    });
    this.s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function (e) {
        console.log(e.type, e.data.edge, e.data.captor);
    });
    this.s.bind('clickStage, rightClickStage', function (e) {
        console.log(e.type, e.data.captor);
    });
    this.s.bind('doubleClickStage', function (e) {
        this.s.graph.nodes().forEach(
            function(n, i, a) {
                n.color = '#0099ff';
                n.hidden = false;
            });

        //Show all edges
        this.s.graph.edges().forEach(
            function(ee) {
                ee.hidden = false;
                ee.color = "#FFFFFF";
            }
        );
        this.s.refresh();
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

/**
 * Moves this visualization by the given offset.
 * @param xOff
 * @param yOff
 */
ForceLink.prototype.moveVisualization = function (xOff, yOff) {
};

ForceLink.prototype.setPosition = function (position) {
};

ForceLink.prototype.drag = function (xOff, yOff) {
};