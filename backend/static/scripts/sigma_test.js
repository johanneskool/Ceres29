var sizeCircle = (window.innerHeight - 125);
var xValues = [];
var yValues = [];
var Nodes = [];
var colors = [];
var s;
var end = 1;
var nbEdge;
var nbNode;
var graph = {
    nodes: [],
    edges: []
};

//Changing the amount of nodes:
var inputSize = 600;
//max weight of the dataset?
var maxWeight = 1000;


function setup() {
    colorArray();
    createCircleArea(); //creates coordinates for circle
    nbNode = inputSize;
    nbEdge = floor(inputSize/4);

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
                autoRescale: ['nodePosition', 'nodeSize', 'edgeSize'],
                animationsTime: 1000,
                enableHovering: true,
                doubleClickEnabled: false,
                enableEdgeHovering: true,
                edgeHoverColor: 'edge',
                defaultEdgeHoverColor: '#009C05',
                edgeHoverSizeRatio: 1,
                edgeHoverExtremities: true,
                scalingMode: 'outside'
            }
        }
    );

// Generate a random graph:
    for (var i = 0; i < nbNode; i++) {
        graph.nodes.push({
            id: i,
            label: 'Node ' + i,
            labelAlignment: "left",
            x: xValues[i],
            y: yValues[i],
            size: 1,
            color: '#0099ff'
        });
    }

    for (var i = 0; i < nbEdge; i++) {
        var edgeWeight = floor(random(maxWeight));
        var edgeSize = map(edgeWeight, 0, maxWeight, 0, colors.length);
        var pickColor = colors[floor(edgeSize)]
        graph.edges.push({
            id: i,
            size: edgeSize,
            source: '' + (Math.random() * nbNode | 0),
            target: '' + (Math.random() * nbNode | 0),
            color: pickColor,
            type: 'arrow',
            hover_color: '#000000'
        });
    }
    //binding events
    animateGraph();
    // Load the graph in sigma
    s.graph.read(graph);
    // Ask sigma to draw it
    s.refresh();
}

//Creates array with x and y for a circle
function createCircleArea() {
    var phase = 0;
    var radius = sizeCircle/2;
    for (var i = 0; i < inputSize; i++) {
        phase = i * 2 * Math.PI /inputSize;
        xValues[i] = (radius * Math.cos(phase));
        yValues[i] = (radius * Math.sin(phase));
    }
}

//Array for edge colors
function colorArray() {
    colors.push("#ff8566");
    colors.push("#ff704d");
    colors.push("#ff5c33");
    colors.push("#ff5c33");
    colors.push("#ff3300");
    colors.push("#e62e00");
    colors.push("#cc2900");
    colors.push("#b32400");
    colors.push("#991f00");
}

function animateGraph() {
// Bind the events:
    s.bind('overNode outNode doubleClickNode rightClickNode', function(e) {
        console.log(e.type, e.data.node.label, e.data.captor);
    });
    s.bind('clickNode', function(e) {
        console.log(e.type, e.data.node.label, e.data.captor);
        //spin(parseInt(e.data.node.id));
    });
    s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function(e) {
        console.log(e.type, e.data.edge, e.data.captor);
    });
    s.bind('clickStage', function(e) {
        console.log(e.type, e.data.captor);
    });
    s.bind('doubleClickStage rightClickStage', function(e) {
        console.log(e.type, e.data.captor);
    });
}

//Spin the circle
function spin(startNode) {
    while (startNode !== 300) {
        var popElement = graph.nodes.pop();
        graph.nodes.push(popElement);
        console.log(graph.nodes);
        startNode++;
    }
    s.refresh();
}