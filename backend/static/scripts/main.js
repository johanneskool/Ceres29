/**
 * @fileOverview P5.js example file
 * @author SAJ
 */

var circlesList = [];
var newMouseVector;
var inc;
var startHue;

var startRange = 99;
var range = 20;

/**
 * Size of the circles
 * @const {number}
 */
var SIZE = 80;

//basic setup
function setup() {
    colorMode(HSL,100);
    createCanvas(window.innerWidth, window.innerHeight);
    frameRate(999);
    imageMode(CENTER);
    noStroke();

    startHue = random(100);
}

function draw() {
    background(0,0,0);
    fill(0, 0, 0, 100);

    inc = circlesList.length/200; //animation speed is based on the amount of circles


    var mouseVector = createVector(mouseX,mouseY);
    var jitter = createVector(random(-2,2),random(-2,2)); //random jitter vector

    var speedVector = p5.Vector.sub(mouseVector,newMouseVector).add(jitter); //make vector from last and current mouse pos.
    newMouseVector = createVector(mouseX,mouseY);                            //update last mouse pos.

    //add a circle if mouse is pressed
    if (mouseIsPressed) {
        circlesList.push(new Circles(speedVector));
    }


    for (var i = 0; i < circlesList.length; i++) {
        //remove circle if opacity < 0
        if (circlesList[i].a <= 0) {
            circlesList.shift(); //circle to be removed must be first circle in array
        } else {
            //base the color on age of circle
            circlesList[i].startRange = Mod(startRange + circlesList[i].a, 100);
            var color = map(circlesList[i].startRange, 0, 100, 0, 75);
            fill(startHue, color, color, circlesList[i].a);

            circlesList[i].a -= inc;    //decrease age

            circlesList[i].update();
        }
    }
}

/**
 * Computing the modulo
 * @return {number} - the remained after division
 * @param {number} x   - the dividend
 * @param {number} mod - the divisor
 */
function Mod(x, mod){
    if (mod >= x) {
        return x;
    } else {
        return  x - mod *floor(x/mod);
    }
}

/**
 * Class for managing the circles
 * @constructor Circle class
 * @param {p5.Vector} speedVector - The circles initial speed.
 */
function Circles(speedVector) {
    /** @lends Circle */
    this.speed = speedVector;
    this.startRange = startRange;
    this.acceleration = p5.Vector.mult(speedVector,-0.2);
    this.position = createVector(mouseX,mouseY);
    this.a = 80;
}

/**
 * Updates the position and draws the circle
 */
Circles.prototype.update = function () {
    if (this.speed.mag()/1.5 > this.acceleration.mag()) {
        this.speed.add(this.acceleration);
    }
    this.position.add(this.speed);
    ellipse(this.position.x, this.position.y, SIZE, SIZE);
};

/**
 * Rescales the canvas when the windows has been changed
 */
window.onresize = function() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    resizeCanvas(w, h);
};