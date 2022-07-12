class Predator extends Boid {
	constructor(x, y, col, r) {
		super(x, y)
		this.maxForce = 0.4;
		this.maxSpeed = 4
		this.col = col
	}

	chase(list, perception) {
		let record = Infinity;
		let closest = null;
		for (let i = list.length - 1; i >= 0; i--) {
			let d = this.position.dist(list[i].position)

			//eat
			if (d < this.maxSpeed) {
				list.splice(i, 1)
			} else {
				if (d < record) {
					record = d;
					closest = list[i];
				}
			}
		}

		if (closest != null) {
			if (closest.position.dist(this.position) < perception) {
				return this.seek(closest.position)
			}
		}

		return createVector(0, 0)
	}

	show() {
		var angle = this.velocity.heading() + PI / 2;


		push();
		translate(this.position.x, this.position.y);
		rotate(angle);

		stroke(255);
		fill(this.col);
		noStroke()
		beginShape();
		vertex(0, -this.r * 2);
		vertex(-this.r, this.r * 2);
		vertex(this.r, this.r * 2)
		endShape(CLOSE);

		pop()
	}

	update() {
		super.edges()
		this.position.add(this.velocity);
		this.velocity.add(this.acceleration);
		this.velocity.limit(this.maxSpeed)
		this.acceleration.mult(0)
		let steering = this.chase(vehicles, 200)
		this.applyForce(steering)
	}
}