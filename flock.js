class Flock {

	static align(boid, boids) {
		let perceptionRadius = 100;
		let total = 0
		let steering = createVector(0, 0);
		for (let other of boids) {
			let d = boid.position.dist(other.position);
			let vector = p5.Vector.sub(other.position, boid.position);
			let heading = vector.heading()
			let angleDiff = abs(heading - boid.velocity.heading()) % PI
			if (other != boid && d < perceptionRadius && angleDiff < PI * 3 / 5) {
				steering.add(other.velocity);
				total++;
			}
		}

		if (total > 0) {
			steering.div(total)
			steering.setMag(boid.maxSpeed)
			steering.sub(boid.velocity);
			steering.limit(boid.maxForce)
		}
		return steering
	}

	static separation(boid, boids) {
		let perceptionRadius = 30;
		let total = 0
		let steering = createVector(0, 0);
		for (let other of boids) {
			let d = boid.position.dist(other.position);
			if (d == 0) continue
			let vector = p5.Vector.sub(other.position, boid.position);
			let heading = vector.heading()
			let angleDiff = abs(heading - boid.velocity.heading()) % PI
			if (other != boid && d < perceptionRadius && angleDiff < PI * 5 / 5) {
				let diff = p5.Vector.sub(boid.position, other.position);
				diff.div(d);
				steering.add(diff);
				total++;
			}
		}

		if (total > 0) {
			steering.div(total)
			steering.setMag(boid.maxSpeed)
			steering.sub(boid.velocity);
			steering.limit(boid.maxForce)
		}
		return steering
	}


	static cohesion(boid, boids) {
		let perceptionRadius = 100;
		let total = 0
		let steering = createVector(0, 0);
		for (let other of boids) {
			let d = boid.position.dist(other.position);
			let vector = p5.Vector.sub(other.position, boid.position);
			let heading = vector.heading()
			let angleDiff = abs(heading - boid.velocity.heading()) % PI
			if (other != boid && d < perceptionRadius && angleDiff < PI * 3 / 5) {
				steering.add(other.position);
				total++;
			}
		}

		if (total > 0) {
			steering.div(total)
			steering.sub(boid.position)
			steering.setMag(boid.maxSpeed)
			steering.sub(boid.velocity);
			steering.limit(boid.maxForce)
		}
		return steering
	}

	static flock(boid, boids) {
		let alignment = this.align(boid, boids);
		let cohesion = this.cohesion(boid, boids);
		let separation = this.separation(boid, boids);

		alignment.mult(1)
		// cohesion.mult(1.4)
		separation.mult(1.4)

		boid.applyForce(alignment)
		boid.applyForce(cohesion)
		boid.applyForce(separation)
	}
}