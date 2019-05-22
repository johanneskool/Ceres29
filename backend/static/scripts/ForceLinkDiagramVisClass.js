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
ForceLink.prototype.setData = function (url) {
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
                    maxEdgeSize: 1,
                    minNodeSize: 2,
                    maxNodeSize: 5,
                    animationTime: 1000,
                    minArrowSize: 12,
                    enableHovering: true,
                    doubleClickEnabled: false,
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
                if ((data.weights[indexNodes][indexEdges]) > 0) {
                    graph.edges.push({
                        id: i,
                        weight: data.weights[indexNodes][indexEdges],
                        size: data.weights[indexNodes][indexEdges],
                        source: graph.nodes[indexNodes].id,
                        target: graph.nodes[indexEdges].id,
                        color: "#FFFFFF",
                        type: 'arrow',
                        __proto__: null
                    });
                    i++
                }
            }
        }

        // Load the graph in sigma to draw
        s.graph.read(graph);
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
            nodeSize: 'original'
        };
        s.configForceAtlas2(forceAtlas2Config);

        //Starting Force Atlas and stops after 8 seconds
        s.startForceAtlas2(forceAtlas2Config);
        window.setTimeout(function () {
            s.killForceAtlas2();
        }, 8000);
    };
}