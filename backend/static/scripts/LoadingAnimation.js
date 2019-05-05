<!-- AUTHORS
Fabienne vd Weide
-->

var centerX = 200;
var centerY = 200;
var radius = 100;
let circle1;
let circle2;
let circle3;
let circle4;
let circle5;
let circle6;
let circle7;

class Circle {
  constructor(angle, r, g, b) {
    this.angle = radians(angle);
    this.r = r;
    this.g = g;
    this.b = b;
    this.speed = 0.02;
    this.x = centerX + radius
    this.y = centerY + radius
  }

  move() {
    this.x = centerX + radius * cos(this.angle);
	this.y = centerY + radius * sin(this.angle);
  }

  show() {
    fill(this.r, this.g, this.b);
    ellipse(this.x, this.y, 25);
    this.angle = this.angle + this.speed;


    if (this.x > centerX) {
      this.speed = 0.07;
        } else {
      this.speed = 0.04;
        }
  }
}

function setup() {
  createCanvas(400, 400);
  noStroke();
  circle1 = new Circle(-80, 0, 120, 100);
  circle2 = new Circle(-60, 0, 140, 125);
  circle3 = new Circle(-40, 0, 160, 150);
  circle4 = new Circle(-20, 0, 180, 175);
  circle5 = new Circle(0, 0, 200, 200);
  circle6 = new Circle(20, 0, 220, 225);
  circle7 = new Circle(40, 0, 230, 240);
}

function draw() {
  background(255);
  circle1.move();
  circle1.show();
  circle2.move();
  circle2.show();
  circle3.move();
  circle3.show();
  circle4.move();
  circle4.show();
  circle5.move();
  circle5.show();
  circle6.move();
  circle6.show();
  circle7.move();
  circle7.show();
}