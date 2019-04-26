function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    background(0);
}

function draw() {
    noStroke();
    ellipse(random(0, window.innerWidth), random(0, window.innerHeight), 45, 45);
    fill(random(25, 240), random(25, 240), random(25, 240), 100);

    if (mouseIsPressed) {
        background(0);
    }
}