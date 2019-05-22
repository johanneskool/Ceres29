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
        this.graph = {
            nodes: [],
            edges: []
        };
        //setup for sigma with setting for the graph
        s = new sigma(
            {
                graph: data,
                renderer: {
                    container: this.canvas,
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
            graph.nodes.push({
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
                    graph.edges.push({
                        id: i,
                        weight: data.weights[indexNodes][indexEdges]/2,
                        size: data.weights[indexNodes][indexEdges]/2,
                        source: graph.nodes[indexNodes].id,
                        target: graph.nodes[indexEdges].id,
                        color: "#FFFFFF",
                        type: 'arrow'
                    });
                    i++
                }
            }
        }

        function animateGraph() {
        // Bind the events:
            s.bind('overNode outNode clickNode rightClickNode', function (e) {
                console.log(e.type, e.data.node.label, e.data.captor);
            });
            s.bind('doubleClickNode', function (e) {
                console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
                let filter1 = new sigma.plugins.filter(s);
                let filter2 = new sigma.plugins.filter(s);
                let filter3 = new sigma.plugins.filter(s);
                filter1.neighborsOf(e.data.node.id);
                //gen1 = filter1.neighborsOf(e.data.node.id);
                //for (node_gen2 in gen1) {
                //    filter2.neighborsOf(node_gen2);
                //}
                filter1.apply();
                //filter2.apply();
                filter1.undo();
                //filter2.undo();
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
        }

        // Load the graph in sigma to draw
        s.graph.read(graph);
        // Ask sigma to draw it and refresh
        s.refresh();
        animateGraph();
    }
};