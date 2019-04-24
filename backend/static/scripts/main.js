var ellipseList = [];
var size = 80;

function setup() {
    colorMode(HSL,100);
    createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
    background(0,0,100);

    var ellipses = {
        x : mouseX,
        y : mouseY,
        a : 100
    };


    if (mouseIsPressed) {
        ellipseList.push(ellipses);
    }

    for (var i = 0; i < ellipseList.length; i++) {
        fill(0,0,0,ellipseList[i].a);
        ellipseList[i].a -= 1;
        noStroke();
        ellipse(ellipseList[i].x, ellipseList[i].y, size, size);
    }
}