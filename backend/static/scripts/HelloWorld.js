function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
    if (mouseIsPressed) {
        ellipse(mouseX, mouseY, 80, 80);
        fill(random(0, 255), random(0, 255), random(0, 255));
    }
}