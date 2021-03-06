let vehicles = [];
let food = []
let poison = []

let foodCount = 200
let poisonCount = 200
let vehicleCount = 200
let pointRadius = 6

let debug = false;

let predators = [];
let predatorNumber = 1

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');

    for (let i = 0; i < vehicleCount; i++) {
        let x = random(width);
        let y = random(height)
        vehicles.push(new Boid(x, y))
    }

    for (let i = 0; i < foodCount; i++) {
        let x = random(width);
        let y = random(height)
        food.push(createVector(x, y))
    }

    for (let i = 0; i < poisonCount; i++) {
        let x = random(width);
        let y = random(height)
        poison.push(createVector(x, y))
    }

    for (let i = 0; i < predatorNumber; i++) {
		predators.push(new Predator(random(width), random(height), color(255, 0, 0), 5))
	}
}

function draw() {
    background(51);

    if (random() > 0.90){//food.length / 100) {
        let x = random(width);
        let y = random(height)
        food.push(createVector(x, y))
    }

    if (random() < 0.02) {
        let x = random(width);
        let y = random(height)
        poison.push(createVector(x, y))
    }

    //draw food
    for (let i = 0; i < food.length; i++) {
        fill(0, 255, 0);
        noStroke();
        ellipse(food[i].x, food[i].y, pointRadius, pointRadius)
    }

    //draw poison
    for (let i = 0; i < poison.length; i++) {
        fill(255, 0, 0);
        noStroke();
        ellipse(poison[i].x, poison[i].y, pointRadius, pointRadius)
    }


    for (let i = vehicles.length - 1; i >= 0; i--) {
        let vehicle = vehicles[i]
        vehicle.update();
        vehicle.display()

        if (vehicle.dead()) {
            vehicles.splice(i, 1);
            food.push(createVector(vehicle.position.x, vehicle.position.y))
        }
    }

    for (let predator of predators) {
		predator.show()
		predator.update()
	}
}

function keyPressed() {
    if (keyCode === 32) {
        debug = !debug;
    } else if (keyCode === 49) {
        vehicles.push(new Boid(mouseX, mouseY))
    } else if (keyCode === 50) {
        food.push(createVector(mouseX, mouseY))
    } else if (keyCode === 51) {
        poison.push(createVector(mouseX, mouseY))
    } else if (keyCode == 82) {
        for (let i = 0; i < foodCount; i++) {
            let x = random(width);
            let y = random(height)
            food.push(createVector(x, y))
        }
    }
}
