//Author: Fabiénne

const centerX = window.innerWidth/2;
const centerY = window.innerHeight/2;
const radius = 100;
let circleArray = [];

class Circle {
  constructor(angle, r, g, b) {
    this.angle = radians(angle);
    this.r = r;
    this.g = g;
    this.b = b;
    this.speed = 0.02;
    this.x = centerX + radius;
    this.y = centerY + radius;
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
  createCanvas(window.innerWidth, window.innerHeight);
  noStroke();
  for (let i = 0; i < 7; i++) {
    circleArray.push(new Circle(-80 + 20*i, 0, 120 + i*20, 100 + i*25));
  }
}

function draw() {
  background(255);
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].move();
    circleArray[i].show();
  }
}