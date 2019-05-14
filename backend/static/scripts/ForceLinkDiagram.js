//http://localhost:5555/static/test/ForceLinkDiagram.html

let graph = {
    nodes: [],
    edges: [],
};

let url;

function preload() {
    // get json data
    url = "http://localhost:5555/static/json/f.json";
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
                minEdgeSize: 0.001,
                maxEdgeSize: 0.2,
                minNodeSize: 2,
                maxNodeSize: 5,
                minArrowSize: 4,
                animationsTime: 1000,
                enableHovering: true,
                doubleClickEnabled: false,
                edgeHoverExtremities: true,
                'sigma.layout.forceAtlas2': {
                    edgeWeightInfluence  : true,
                    NodeRadius: 5.0,
                    ScalingRatio: 2.0,
                    adjustSizes: true
                }
            }
        }
    );

    //function to fix the overlaps
    let noverlapListener = s.configNoverlap({
        nodeMargin: 1,
        scaleNodes: 1.05,
        gridSize: 75,
        easing: 'quadraticInOut', // animation transition function
        duration: 1000,
    });

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
    //setup events
    animateGraph();
    //may the force be with you (start the physics).
    s.startForceAtlas2();
    //stops after 10 sec with the physics
    window.setTimeout(function() {s.killForceAtlas2(); s.startNoverlap();}, 8000);
}

function animateGraph() {
// Bind the events:
    s.bind('overNode outNode doubleClickNode rightClickNode', function (e) {
        console.log(e.type, e.data.node.label, e.data.captor);
    });
    s.bind('clickNode', function (e) {
        console.log(e.type, e.data.node.label, e.data.captor, e.data.node.id);
        //colors the node when clicked on
        if (e.data.node.isSelected) {
            e.data.node.color = "#0099ff";
            e.data.node.isSelected = false;
        } else {
            e.data.node.color = "#ff9900";
            e.data.node.isSelected = true;
        }
        s.killForceAtlas2();
        let filter = new sigma.plugins.filter(s);
        filter.neighborsOf(e.data.node.id);
        filter.apply();
        filter.undo();
        //newGraph(e.data.node.id);
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

//clicking on a new should show its neighbours
function newGraph(startIndex) {
    //this.startIndex = startIndex;
    s.killForceAtlas2();
    let filter = new sigma.plugins.filter(s);
    filter.neighborsOf(startIndex);
}

function keyPressed() {
    if(keyCode === BACKSPACE) {
        let filter = new sigma.plugins.filter(s);
        filter.undo();
        filter.apply();
        s.refresh();
    }
}