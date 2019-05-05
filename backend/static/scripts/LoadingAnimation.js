//Author: Fabiénne
var sketch = function (animation) {
  animation.centerX = window.innerWidth/2;
  animation.centerY = window.innerHeight/2;
  animation.radius = 100;
  animation.circleArray = [];

  animation.onresize = function() {
    animation.w = window.innerWidth;
    animation.h = window.innerHeight;
    animation.resizeCanvas(animation.w, animation.h);
    animation.centerX = window.innerWidth/2;
    animation.centerY = window.innerHeight/2;
  };

  animation.setup = function () {
    animation.animationCanvas = animation.createCanvas(window.innerWidth, window.innerHeight);
    animation.animationCanvas.parent('canvas');
    document.getElementById("defaultCanvas1").style.zIndex = 2;
    animation.noStroke();
    for (var i = 0; i < 7; i++) {
      animation.circleArray.push(new animation.Circle(-80 + 20*i, 0, 120 + i*20, 100 + i*25));
    }
  };

  animation.draw = function () {
    animation.clear();
    if(!visIsLoaded) {
      for (var i = 0; i < animation.circleArray.length; i++) {
        animation.circleArray[i].move();
        animation.circleArray[i].show();
      }
    }
  };

  animation.Circle = function (angle, r, g, b) {
    this.angle = animation.radians(angle);
    this.r = r;
    this.g = g;
    this.b = b;
    this.speed = 0.02;
    this.x = animation.centerX + animation.radius;
    this.y = animation.centerY + animation.radius;
    this.move = function () {
      this.x = animation.centerX + animation.radius * animation.cos(this.angle);
      this.y = animation.centerY + animation.radius * animation.sin(this.angle);
    };
    this.show = function () {
      animation.fill(this.r, this.g, this.b);
      animation.ellipse(this.x, this.y, 25,25);
      this.angle = this.angle + this.speed;


      if (this.x > animation.centerX) {
        this.speed = 0.07;
      } else {
        this.speed = 0.04;
      }
    };
  }
};

var loadingAnimation = new p5(sketch);

window.onresize = function() {
  loadingAnimation.onresize();
  console.log("resize");
};