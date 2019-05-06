const sizeCircle = (window.innerHeight - 125);
let xValues = [];
let yValues = [];
let Nodes = [];
let colors = [];
let s;
let test = 0;
let end = 1;
let nbEdge;
let nbNode;
let graph = {
    nodes: [],
    edges: [],
    phase: []
};

//Changing the amount of nodes:
const inputSize = 100;
//max weight of the dataset?
const maxWeight = 1000;


function setup() {
    colorArray();
    createCircleArea(); //creates coordinates for circle
    nbNode = inputSize;
    nbEdge = floor(inputSize/8);

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
    for (let i = 0; i < nbNode; i++) {
        graph.nodes.push({
            id: i,
            label: 'Node ' + i,
            x: xValues[i],
            y: yValues[i],
            size: 1,
            color: '#0099ff'
        });
    }

    for (let i = 0; i < nbEdge; i++) {
        let edgeWeight = floor(random(maxWeight));
        let edgeSize = map(edgeWeight, 0, maxWeight, 0, colors.length);
        let pickColor = colors[floor(edgeSize)]
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
    let radius = sizeCircle/2;
    for (let i = 0; i <= inputSize; i++) {
        graph.phase[i] = i * 2 * Math.PI /inputSize;
        xValues[i] = (radius * Math.cos(graph.phase[i]));
        yValues[i] = (radius * Math.sin(graph.phase[i]));
    }
}

function moveNodeX(angle) {
    let radius = sizeCircle/2;
    return radius * Math.cos(angle);
}

function moveNodeY(angle) {
    let radius = sizeCircle/2;
    return radius * Math.sin(angle);
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
    s.bind('overNode outNode doubleClickNode rightClickNode', function (e) {
        console.log(e.type, e.data.node.label, e.data.captor);
    });
    s.bind('clickNode', function (e) {
        console.log(e.type, e.data.node.label, e.data.captor);
        let startNode = parseInt(e.data.node.id);
        while (startNode != floor(inputSize / 2)) {
            let i = test;
            s.graph.nodes().forEach(function (n) {
                n.x = moveNodeX(graph.phase[(i + 1) % inputSize]);
                n.y = moveNodeY(graph.phase[(i + 1) % inputSize]);
                n.phase = (i + 1) * 2 * Math.PI / inputSize
                i++;
            });
            startNode = (startNode + 1) % inputSize;
            test++;
            setTimeout(function () {
                s.refresh();
            }, 100);
        }
        s.bind('overEdge outEdge clickEdge doubleClickEdge rightClickEdge', function (e) {
            console.log(e.type, e.data.edge, e.data.captor);
        });
        s.bind('clickStage', function (e) {
            console.log(e.type, e.data.captor);
        });
        s.bind('doubleClickStage rightClickStage', function (e) {
            console.log(e.type, e.data.captor);
        });
    })
}