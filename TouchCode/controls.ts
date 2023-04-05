
interface PointerTouch {
	sx: number, // Start position
	sy: number,
	x: number, // Current position
	y: number,
	dx: number, // Change in position (since reset)
	dy: number,
}

// Handle the mouse (for debug only!)
let touchCount = 0
let touches: {[key: number]: PointerTouch} = []
window.onpointerdown = (e: PointerEvent) => {
	touches[e.pointerId] = {
		sx: e.clientX, sy: e.clientY,
		x: e.clientX, y: e.clientY,
		dx: 0, dy: 0,
	}
	touchCount++
}
window.onpointermove = (e: PointerEvent) => {
	if (!(e.pointerId in touches)) return
	const o = touches[e.pointerId]
	const ix = o.x, iy = o.y
	o.dx += (o.x = e.clientX) - ix
	o.dy += (o.y = e.clientY) - iy
}
window.onpointerup = (e: PointerEvent) => {
	delete touches[e.pointerId]
	touchCount--
}

// Position in the space
let sp: [number, number] = [0, 0]

