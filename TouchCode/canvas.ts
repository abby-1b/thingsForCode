
// Setup global variables
let width = 0, height = 0
let frameCount = 0

// Get the canvas and its context
const cnv = document.querySelector("#cnv") as HTMLCanvasElement
	, ctx = cnv.getContext("2d")!
ctx.imageSmoothingEnabled = false

// Handle screen size/orientation change
function screenChanged() {
	width = window.innerWidth
	height = window.innerHeight
	if (height > width) {
		const v = (height - width) / 2
		;[width, height] = [height, width]
		cnv.style.cssText = `position:absolute;top:0;left:0;width:${width}px;height:${height}px;transform:rotate(90deg)translate(${v}px,${v}px)`
	} else {
		cnv.style.cssText = ""
	}
	cnv.width = width
	cnv.height = height
}
window.onresize = screenChanged
window.onorientationchange = screenChanged
screenChanged()

/// FILL + STROKE

function fill(r: number, g: number, b: number, a: number = 1) {
	ctx.fillStyle = `rgba(${r},${g},${b},${a})`
}
function noFill() {
	ctx.fillStyle = "transparent"
}
function stroke(r: number, g: number, b: number, a: number = 1) {
	ctx.strokeStyle = `rgba(${r},${g},${b},${a})`
}
function noStroke() {
	ctx.strokeStyle = "transparent"
}

/// SHAPES

function circle(x: number, y: number, r: number) {
	ctx.beginPath()
	ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI)
	ctx.fill()
	ctx.stroke()
}

