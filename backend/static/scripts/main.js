var ellipseList = [];
var size = 80;
var newMouseVector;

function setup() {
    colorMode(HSL,100);
    canvas = createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
    background(0,0,100);
    fill(0, 0, 0, 100);

    var mouseVector = createVector(mouseX,mouseY);
    var jitter = createVector(random(-2,2),random(-2,2));

    var speedVector = p5.Vector.sub(mouseVector,newMouseVector).add(jitter);
    newMouseVector = createVector(mouseX,mouseY);

    var ellipses = {
        speed : speedVector,
        acceleration: p5.Vector.mult(speedVector,-0.2),
        position : createVector(mouseX,mouseY),
        a : 100
    };

    ellipses.update = function () {
        if (this.speed.mag()/1.5 > this.acceleration.mag()) {
            this.speed.add(this.acceleration);
        }
        this.position.add(this.speed);
    };

    if (mouseIsPressed) {
        ellipseList.push(ellipses);
    }

    for (var i = 0; i < ellipseList.length; i++) {
        if (ellipseList[i].a > 0) {
            fill(map(ellipseList[i].position.x,0,innerWidth,0,100), 50, 50, ellipseList[i].a);
            ellipseList[i].a -= ellipseList.length/200;
            noStroke();
            ellipse(ellipseList[i].position.x, ellipseList[i].position.y, size, size);
            ellipseList[i].update();
        } else {
            ellipseList.shift();
        }
    }
}


window.onresize = function() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.size(w,h);
};