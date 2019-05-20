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
    this.loaded = true;

    /**
     * Where the drawRoundNodeLink should start drawing.
     * @type {number}
     */
    this.graph = {
        nodes: [],
        edges: []
    };
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
    loadJSON(url, loadNodes);

    function loadNodes(data) {
        //setup for sigma with setting for the graph
        s = new sigma(
            {
                graph: data,
                renderer: {
                    container: document.getElementById('sigma-container'),
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
                    edgeHoverExtremities: true,
                    "sigma.layout.forceAtlas2": {
                        edgeWeightInfluence  : 1000,
                        NodeRadius: 4.0,
                        ScalingRatio: 3.0,
                        adjustSizes: false
                    }
                }
            }
        );

        //adds nodes to the graph
        for (let index in data.tags) {
            graph.nodes.push({
                id: index,
                label: data.tags[index],
                x: random(-2000, 2000),
                y: random(-1000, 1000),
                size: random(2, 4),
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
                        weight: data.weights[indexNodes][indexEdges]/4,
                        size: data.weights[indexNodes][indexEdges]/4,
                        source: graph.nodes[indexNodes].id,
                        target: graph.nodes[indexEdges].id,
                        color: pickColor(data.weights[indexNodes][indexEdges]),
                        type: 'arrow'
                    });
                    i++
                }
            }
        }
    }
};