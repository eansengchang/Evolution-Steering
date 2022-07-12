let mr = 0.3

class Boid {

	constructor(x, y, dna) {
		this.dna = {};
		if (dna == undefined) {
			this.dna["foodWeight"] = random(-2, 2);
			this.dna["poisonWeight"] = random(-2, 2);
			this.dna["foodPerception"] = random(0, 100);
			this.dna["poisonPerception"] = random(0, 100);
			this.dna["MAXSPEED"] = random(2, 4);
			this.dna["alignScale"] = random(0, 2);
			this.dna["cohesionScale"] = random(0, 2);
			this.dna["separateScale"] = random(0, 2);
		} else {
			//mutation
			this.dna["foodWeight"] = dna["foodWeight"] + (random(1) < mr ? random(-0.1, 0.1) : 0);
			this.dna["poisonWeight"] = dna["poisonWeight"] + (random(1) < mr ? random(-0.1, 0.1) : 0);
			this.dna["foodPerception"] = dna["foodPerception"] + (random(1) < mr ? random(-10, 10) : 0);
			this.dna["poisonPerception"] = dna["poisonPerception"] + (random(1) < mr ? random(-10, 10) : 0);
			this.dna["MAXSPEED"] = dna["MAXSPEED"] + (random(1) < mr ? random(-0.1, 0.1) : 0);
		}

		this.acceleration = createVector(0, 0);
		this.velocity = createVector(random(-2, 2), random(-2, 2))
		this.position = createVector(x, y)
		this.r = 4;
		this.MAXSPEED = this.dna["MAXSPEED"]
		this.maxSpeed = 3
		this.maxForce = 0.1
		this.health = 1

		this.healthDecrease = 0.001
		this.goodFoodHealth = 0.7
		this.badFoodHealth = -0.4


	}

	update() {
		//boundaries
		// this.boundaries()

		// if (this.health < 1){
		let steerG = this.eat(food, this.goodFoodHealth, this.dna["foodPerception"]);
		steerG.mult(this.dna["foodWeight"]);
		this.applyForce(steerG);
		// } 
		let steerB = this.eat(poison, this.badFoodHealth, this.dna["poisonPerception"]);
		steerB.mult(this.dna["poisonWeight"]);
		this.applyForce(steerB);

		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.position.add(this.velocity);
		this.acceleration.mult(0)

		//health stuff
		this.health = min(this.health, 3)
		this.health -= this.healthDecrease;
		//set max speed depending on health but not more than MAX SPEED
		this.maxSpeed = min(map(this.health, 0, 1, 0, this.MAXSPEED), this.MAXSPEED)

		this.attemptReproduce()

		//flee stuff
		let flee = this.survive(predators, 150)
		flee.mult(3)
		this.applyForce(flee)

		if (this.health > 1) {
			Flock.flock(this, vehicles)
		}

		//loop
		this.edges()
	}

	applyForce(force) {
		this.acceleration.add(force)
	}

	attemptReproduce() {
		if (random() < 0.0003) {
			let newVehicle = new Boid(this.position.x, this.position.y, this.dna)
			vehicles.push(newVehicle)
		}
	}

	eat(list, nutrition, perception) {
		let record = Infinity;
		let closest = null;
		for (let i = list.length - 1; i >= 0; i--) {
			let d = this.position.dist(list[i])

			//eat
			if (d < this.r) {
				list.splice(i, 1)
				this.health += nutrition
			} else {
				if (d < record && d < perception) {
					record = d;
					closest = list[i];
				}
			}
		}

		if (closest != null) {
			return this.seek(closest).mult(1.3)
		}

		return createVector(0, 0)
	}

	seek(target) {
		let pos = this.position.copy()
		let desired = p5.Vector.sub(target, pos);

		desired.setMag(this.maxSpeed);

		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxForce);

		return steer;
	}

	dead() {
		return this.health < 0
	}

	display() {
		// Draw a triangle rotated in the direction of velocity
		var angle = this.velocity.heading() + PI / 2;


		push();
		translate(this.position.x, this.position.y);
		rotate(angle);

		if (debug) {
			noFill()
			strokeWeight(3)
			stroke(0, 255, 0);
			line(0, 0, 0, -this.dna["foodWeight"] * 20)
			ellipse(0, 0, this.dna["foodPerception"] * 2)

			strokeWeight(2)
			stroke(255, 0, 0);
			line(0, 0, 0, -this.dna["poisonWeight"] * 20)
			ellipse(0, 0, this.dna["poisonPerception"] * 2)
		}

		let col = color(255, 255, 255, map(this.health, 0, 1, 0, 255))

		stroke(255);
		fill(col);
		noStroke()
		beginShape();
		vertex(0, -this.r * 2);
		vertex(-this.r, this.r * 2);
		vertex(this.r, this.r * 2)
		endShape(CLOSE);

		pop()
	}

	flee(target) {
		return this.seek(target).mult(-0.9)
	}

	survive(list, perception) {
		let record = Infinity;
		let closest = null;
		for (let i = list.length - 1; i >= 0; i--) {
			let d = this.position.dist(list[i].position)

			if (d < record) {
				record = d;
				closest = list[i];
			}

		}

		if (closest != null) {
			if (closest.position.dist(this.position) < perception) {
				return this.flee(closest.position)
			}
		}

		return createVector(0, 0)
	}

	boundaries() {
		var d = 10;

		var desired = null;

		if (this.position.x < d) {
			desired = createVector(this.maxSpeed, this.velocity.y);
		} else if (this.position.x > width - d) {
			desired = createVector(-this.maxSpeed, this.velocity.y);
		}

		if (this.position.y < d) {
			desired = createVector(this.velocity.x, this.maxSpeed);
		} else if (this.position.y > height - d) {
			desired = createVector(this.velocity.x, -this.maxSpeed);
		}

		if (desired !== null) {
			desired.normalize();
			desired.mult(this.maxSpeed);
			var steer = p5.Vector.sub(desired, this.velocity);
			steer.limit(this.maxForce);
			this.applyForce(steer);
		}
	}

	edges() {
		if (this.position.x > width) {
			this.position.x = 0;
		} else if (this.position.x < 0) {
			this.position.x = width;
		}

		if (this.position.y > height) {
			this.position.y = 0;
		} else if (this.position.y < 0) {
			this.position.y = height;
		}
	}
}