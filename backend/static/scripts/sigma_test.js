var sizeCircle = (window.innerHeight - 125);
var xValues = [];
var yValues = [];
var Nodes = [];
//Changing the amount of nodes:
//factorCircle should be:
// 32 -> 2512 nodes
// 16 -> 1256 nodes
// 8  -> 628 nodes
//etc...
var inputSize = 1256;
var factorCircle = 16;

function setup() {
    createCircleArea(); //creates coordinates for circle
    var s = new sigma(
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
                minArrowSize: 10,
                defaultLabelAlignment: 'left'
            }
        }
    );

// Generate a random graph:
    var nbNode = inputSize;
    var nbEdge = floor(inputSize/3);
    var graph = {
        nodes: [],
        edges: []
    };

    for (var i = 0; i < nbNode; i++) {
        graph.nodes.push({
            id: i,
            label: 'Node ' + i,
            x: xValues[i],
            y: yValues[i],
            size: 1,
            color: '#EE651D',
        });
    }

    for (var i = 0; i < nbEdge; i++) {
        graph.edges.push({
            id: i,
            source: '' + (Math.random() * nbNode | 0),
            target: '' + (Math.random() * nbNode | 0),
            color: '#202020',
            type: 'curvedArrow',
        });
    }

    // Load the graph in sigma
    s.graph.read(graph);
    // Ask sigma to draw it
    s.refresh();
}

function createCircleArea() {
    var centerX = width/2;
    var centerY = height/2;
    var radius = sizeCircle/2;
    var steps = factorCircle * 3.14;
    for (var i = 0; i < inputSize; i++) {
        var phase = 2 * Math.PI * i / steps;
        xValues[i] = (centerX + radius * Math.cos(phase));
        yValues[i] = (centerY + radius * Math.sin(phase));
    }
}