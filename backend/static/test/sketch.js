let data = {"henry": [1,2,3,0,0],
            "jan": [2,5,9,0,0],
            "dave": [0,0,0,0,2],
            "bob": [1,0,0,0,3],
            "ellen": [2,2,0,0,0]};

let nodes = [];
let radius = 0;

let circleX = 0;
let circleY = 0;

let currentActive = null;

let limit = 100;

function preload() {
  // get json data
  let url = "http://localhost:5555/static/json/test.json";
  data = loadJSON(url);
}

function setup() {
  circleX = windowWidth/2;
  circleY = windowHeight/2;
  
  createCanvas(windowWidth, windowHeight);
  radius = Math.min(windowWidth/3, windowHeight/3);

  let number = 0;
  
  // create all nodes
  for (let entry in data) {
    let new_node = new Node(
      entry,
      number,
      number*2*Math.PI/Math.min(Object.keys(data).length, limit),
      radius,
      data[entry]
    );
        
    nodes.push(new_node);
    number++;
    if (number > limit) {
      break;
    }
  }
  
  // create the outgoing edges
  nodes.forEach((node) => {
    let outgoing = data[node.name];
    for (let i = 0; i < outgoing.length; i++) {
      let weight = outgoing[i];
      let to_node;
      // find corresponding node (not optimal)
      if (weight > 0) {
        nodes.forEach((some_node) => {
          if (some_node.number === i) {
            to_node = some_node;
          }
        });
        let edge = new DirectedEdge(to_node, weight);
        node.edges.push(edge);
      }
  }});
  
  currentActive = nodes[0];
  nodes[0].active = true;
  
}

function draw() {
    background(141,141,141);
    noFill();
    circle(circleX, circleY,2*radius);
    nodes.forEach(node => {
      node.draw_node();
      if (currentActive.angle > 0.05) {
        // rotate all nodes
        node.angle = (node.angle + 0.05) % (Math.PI*2);
      }
    });

}


function mouseClicked() {
    nodes.forEach(node => {
        if (dist(mouseX, mouseY, node.location_x(), node.location_y()) < node.radius) {
          currentActive.active = false;
          node.active = true;
          currentActive = node;
        }
    });
}



function Node(name, number, angle, outside_radius) {
  this.number = number;
  this.name = name;

  this.angle = angle;
  this.outside_radius = outside_radius;

  this.location_x = function() {
    return Math.cos(this.angle)*this.outside_radius + circleX;
  };
  this.location_y = function() {
    return Math.sin(this.angle)*this.outside_radius + circleY;
  };


  this.radius = 10;
  this.active = false;
  this.edges = [];
  
  this.draw_node = function() {
    circle(this.location_x(), this.location_y(), this.radius);
    // draw label
    push();
    stroke(0,0,0);
    this.outside_radius += this.radius; // hack to make the text go outward a bit, revert after drawing text
    translate(this.location_x(), this.location_y());
    rotate(this.angle);
    text(this.name, 0,0);
    this.outside_radius -= this.radius;
    pop();

    if (this.active) {
      this.drawEdges();
    }
  };
  this.drawEdges = function() {  
    // draw edges
    for (let i = 0; i < this.edges.length; i++) {
      try {
        let to_node = this.edges[i].to_node;
        noFill();
        bezier(this.location_x(), this.location_y(), circleX, circleY, to_node.location_x(), to_node.location_y(), to_node.location_x(), to_node.location_y());
      } catch(e) {
        console.log(e);
      }
    }
  }
}



function DirectedEdge(to, weight) {
  this.to_node = to;
  this.weigth = weight;
}
