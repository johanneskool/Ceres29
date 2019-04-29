function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSL, 360, 100, 100, 100);
    background(0);
    var particles = [];
}

function draw() {
    noStroke();
    addCircle();

    if (mouseIsPressed) {
        background(0);
    }
}

function addCircle() {
    fill(0,50, 50, 50);
    ellipse(random(0, window.innerWidth), random(0, window.innerHeight), 45, 45);
}