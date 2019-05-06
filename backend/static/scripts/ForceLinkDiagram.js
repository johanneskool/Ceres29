let graph = {
    nodes: [],
    edges: [],
};

const limit = 100;

function preload() {
    // get json data
    let url = "http://localhost:5555/static/json/test.json";
    data = loadJSON(url);
}

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    s = new sigma(
        {
            renderer: {
                container: document.getElementById('sigma-container'),
                type: 'canvas'
            },
            settings: {
                minEdgeSize: 1,
                maxEdgeSize: 4,
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

    let number = 0;

    for (let entry in data) {
        graph.nodes.push({
            id: number,
            label: entry,
            x: random(-500, 500),
            y: random(-500, 500),
            size: 1,
            color: '#0099ff'
        });

        number++;
        if (number > limit) {
            break; // stop adding nodes if the limit of nodes is reached
        }
    }

    graph.nodes.forEach((node) => {
        let outgoing = data[node.name];
        for (let i = 0; i < outgoing.length; i++) {
            let weight = outgoing[i];
            let to_node;

            if (weight > 0) {
                nodes.forEach((some_node) => {
                    if (some_node.number === i) {
                        to_node = some_node;
                        graph.edges.push({
                            id: i,
                            size: 1,
                            source: node,
                            target: to_node,
                            color: '#000000',
                            type: 'arrow',
                        });
                    }
                    graph.edges.push({
                        id: i,
                        size: 1,
                        source: node,
                        target: some_node,
                        color: '#000000',
                        type: 'arrow',
                    });
                });
            }
    }});

    // Load the graph in sigma
    s.graph.read(graph);
    // Ask sigma to draw it
    s.refresh();
}

function Node(name, number) {
    this.number = number;
    this.name = name;
}