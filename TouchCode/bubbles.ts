
const bubbles: Bubble[] = []

class Bubble {
	pos: [number, number]
	vel: [number, number]
	size: number = 60
	constructor(x: number, y: number) {
		this.pos = [x, y]
		this.vel = [0, 0]
	}

	moveTo(x: number, y: number) {
		this.pos[0] += (x - this.pos[0]) * 0.15
		this.pos[1] += (y - this.pos[1]) * 0.15
		this.vel[0] += (x - this.pos[0]) * 0.2
		this.vel[1] += (y - this.pos[1]) * 0.2
	}

	draw(atx: number, aty: number) {
		this.pos[0] += (this.vel[0] *= 0.9) + atx
		this.pos[1] += (this.vel[1] *= 0.9) + aty

		fill(255, 0, 0)
		circle(...this.pos, this.size)

		ctx.fillStyle = "white"
		ctx.font = "48px serif"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillText("the voices the voices", ...this.pos)


		this.pos[0] -= atx
		this.pos[1] -= aty
	}
}

bubbles.push(new Bubble(width / 2, height / 2))

// console.log(bubbles)
