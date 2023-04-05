
// The main function, which gets called every frame
function main() {
	ctx.clearRect(0, 0, width, height)

	if (touchCount > 0) {
		for (const t in touches) {
			sp[0] += touches[t].dx
			sp[1] += touches[t].dy

			touches[t].dx = touches[t].dy = 0
		}
	}

	// bubbles[0].moveTo(mouseX, mouseY)

	// Draw all the bubbles on the screen
	for (const b of bubbles)
		b.draw(...sp)

	frameCount++
	ctx.setTransform(1, 0, 0, 1, 0, 0)

	// console.log(touches)
}
setInterval(main, 1000 / 45)
