function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(0);
}

function draw() {
    noStroke();
    ellipse(random(0,window.innerWidth), random(0,window.innerHeight), 50, 50);
    fill(random(20, 235), random(20, 235), random(20, 235), 100);

    if (mouseIsPressed) {
        background(0);
    }
}