//http://localhost:5555/static/test/ForceLinkDiagram.html

let graph = {
    nodes: [],
    edges: [],
};

function preload() {
    // get json data
    let url = "http://localhost:5555/static/json/book1.json";
    data = loadJSON(url);
}

function setup() {
    //setup for sigma with setting for the graph
    s = new sigma(
        {
            graph: data,
            renderer: {
                container: document.getElementById('sigma-container'),
                type: 'canvas'
            },
            settings: {
                minEdgeSize: 1,
                maxEdgeSize: 2,
                minNodeSize: 1,
                maxNodeSize: 5,
                minArrowSize: 8,
                animationsTime: 1000,
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
                size: 1,
                color: '#0099ff'
            });
    }

    let i = 0;
    for (let indexNodes in data.tags) {
        for (let indexEdges in data.weights) {
            console.log(data.weights[indexNodes][indexEdges]);
            if (data.weights[indexNodes][indexEdges] > 0) {
                graph.edges.push({
                    id: i,
                    size: 1,
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
    //may the force be with you (start the physics).
    s.startForceAtlas2();
    //stops after 10 sec with the physics
    window.setTimeout(function() {s.killForceAtlas2()}, 10000);
}