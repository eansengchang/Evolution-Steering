let mr = 0.3

function Vehicle(x, y, dna) {
	this.acceleration = createVector(0, 0);
	this.velocity = createVector(random(-2, 2), random(-2, 2))
	this.position = createVector(x, y)
	this.r = 4;
	this.MAXSPEED = 3
	this.maxSpeed = 3
	this.maxForce = 0.5
	this.health = 1

	this.healthDecrease = 0.003
	this.goodFoodHealth = 0.5
	this.badFoodHealth = -0.4

	this.dna = [];
	if (dna == undefined) {
		//food weight
		this.dna[0] = random(-2, 2);
		//poison weight
		this.dna[1] = random(-2, 2);
		//food perception
		this.dna[2] = random(0, 100);
		//poison perception
		this.dna[3] = random(0, 100);
	} else {
		//mutation
		this.dna[0] = dna[0];
		if (random(1) < mr) {
			this.dna[0] += random(-0.1, 0.1)
		}
		this.dna[1] = dna[1];
		if (random(1) < mr) {
			this.dna[1] += random(-0.1, 0.1)
		}
		this.dna[2] = dna[2];
		if (random(1) < mr) {
			this.dna[2] += random(-10, 10)
		}
		this.dna[3] = dna[3];
		if (random(1) < mr) {
			this.dna[3] += random(-10, 10)
		}
	}

	this.update = function () {
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed);
		this.position.add(this.velocity);
		this.acceleration.mult(0)
		// this.health = min(this.health, 1)
		this.health -= this.healthDecrease;
		this.maxSpeed = map(this.health, 0, 1, 0, this.MAXSPEED)
		this.maxSpeed = min(this.maxSpeed, this.MAXSPEED)
	}

	this.applyForce = function (force) {
		this.acceleration.add(force)
	}

	this.behaviors = function (good, bad) {
		let steerG = this.eat(good, this.goodFoodHealth, this.dna[2]);
		let steerB = this.eat(bad, this.badFoodHealth, this.dna[3]);

		steerG.mult(this.dna[0]);
		steerB.mult(this.dna[1]);

		this.applyForce(steerG);
		this.applyForce(steerB);
	}

	this.clone = function () {
		if (random() < 0.001) {
			return new Vehicle(this.position.x, this.position.y, this.dna)
		} else {
			return null;
		}
	}

	this.eat = function (list, nutrition, perception) {
		let record = Infinity;
		let closest = null;
		for (let i = list.length - 1; i >= 0; i--) {
			let d = this.position.dist(list[i])

			//eat
			if (d < this.MAXSPEED) {
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
			return this.seek(closest)
		}

		return createVector(0, 0)
	}

	this.seek = function (target) {
		let pos = this.position.copy()
		let desired = p5.Vector.sub(target, pos);

		desired.setMag(this.maxSpeed);

		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxForce);

		return steer;
	}

	this.dead = function () {
		return this.health < 0
	}

	this.display = function () {
		// Draw a triangle rotated in the direction of velocity
		var angle = this.velocity.heading() + PI / 2;


		push();
		translate(this.position.x, this.position.y);
		rotate(angle);

		if (debug) {
			noFill()
			strokeWeight(3)
			stroke(0, 255, 0);
			line(0, 0, 0, -this.dna[0] * 20)
			ellipse(0, 0, this.dna[2] * 2)

			strokeWeight(2)
			stroke(255, 0, 0);
			line(0, 0, 0, -this.dna[1] * 20)
			ellipse(0, 0, this.dna[3] * 2)
		}

		let col = color(0, 255, 0, map(this.health, 0, 1, 0, 255))

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

	this.boundaries = function () {
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
}