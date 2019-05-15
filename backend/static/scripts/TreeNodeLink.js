/**
 * @fileoverview Contains the tree node link visualization
 * @author Fabienne van der Weide
 *
 * http://localhost:5555/static/test/TreeNodeLink.html
 */

let graph = {
    nodes: [],
    edges: [],
};

let url;

function preload() {
    // get json data
    url = "http://localhost:5555/static/json/default.json";
    data = loadJSON(url);
}

function setup() {
    //setup for sigma with setting for the graph
    s = new sigma(
        {
            graph: data,
            renderer: {
                container: document.getElementById('sigma-container'),
                type: 'WebGL'
            },
            settings: {
                minEdgeSize: 1,
                maxEdgeSize: 2,
                minNodeSize: 2,
                maxNodeSize: 5,
                minArrowSize: 4,
                enableHovering: true,
                doubleClickEnabled: false,
                edgeHoverExtremities: true,
            }
        }
    );

    //adds nodes to the graph
    for (let index in data.tags) {
            graph.nodes.push({
                id: index,
                label: data.tags[index],
                x: random(),
                y: random(),
                size: random(2, 4),
                color: '#0099ff'
            });
    }

    //add edges to the graph
    let i = 0;
    for (let indexNodes in data.tags) {
        for (let indexEdges in data.weights) {
            //console.log(data.weights[indexNodes][indexEdges]);
            if ((data.weights[indexNodes][indexEdges]) > 0.5) {
                graph.edges.push({
                    id: i,
                    size: data.weights[indexNodes][indexEdges]/4,
                    source: graph.nodes[indexNodes].id,
                    target: graph.nodes[indexEdges].id,
                    color: '#000000',
                    type: 'arrow',
                });
                i++
            }
        }
    }

    // Load the graph in sigma
    s.graph.read(graph);
    // Ask sigma to draw it
    s.refresh();
}