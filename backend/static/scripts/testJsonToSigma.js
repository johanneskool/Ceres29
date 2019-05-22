// these are just some preliminary settings
let g = {
    nodes: [],
    edges: []
};

function setup() {
    s = new sigma(
        {
            graph: g,
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
                edgeHoverExtremities: true
            }
        }
    );

    sigma.parsers.json(
        'http://localhost:5555/static/json/test.json',
        s,
        function () {
            // this below adds x, y attributes as well as size = degree of the node
            let i,
                nodes = s.graph.nodes(),
                len = nodes.length;

            for (i = 0; i < 100; i++) {
                nodes[i].x = Math.random();
                nodes[i].y = Math.random();
                nodes[i].size = s.graph.degree(nodes[i].id);
                nodes[i].color = nodes[i].center ? '#333' : '#666';
            }
        }
    );

    s.graph.read(g);
    s.refresh();
}