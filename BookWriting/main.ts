
const lines = eval(Deno.readTextFileSync("./book.json"))

const a = (() => { while (true) {
	const count = 5
	const allowedCloseness = 4
	const indices = new Array(lines.length - 1).fill(0).map((_, i) => i)
		.map(e => [Math.random(), e]).sort((a, b) => a[0] - b[0]).map(e => e[1])
		.slice(0, count * 2)
	for (let tries = 0; tries < 100; tries++) {
		let tooClose = -1
		for (let i = 0; i < count - 1; i++) {
			if (Math.abs(indices[i] - indices[i + 1]) < allowedCloseness) {
				tooClose = i + (Math.random() < 0.5 ? 1 : 0)
				return indices.slice(0, count).map(e => lines[e])
			}
		}
		if (tooClose == -1) break
		const otherIndex = Math.floor(Math.random() * count)
		;[indices[tooClose], indices[otherIndex]] = [indices[otherIndex], indices[tooClose]]
	}
} })()
