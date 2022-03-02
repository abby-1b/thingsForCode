// ┘┐┌└┼─├┤┴┬│ █

// Libraries
const { exec } = require("child_process")
const path = require("path")
const stats = require(path.resolve(__dirname, "./stats.js"))
const { readFileSync } = require("fs")

// Teminal
let width = process.stdout.columns
let height = process.stdout.rows

// Cursor
function hideCursor() { process.stdout.write("\033[?25l") }
function showCursor() { process.stdout.write("\033[?25h") }

// Sub-terminals
class Term {
	x = -1
	y = -1
	width = -1
	height = -1

	fileName = "[no file]"
	tabName = undefined
	fileModule = undefined

	text = []

	constructor(fileName, x, y, width, height) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.fileName = fileName
		let file = readFileSync("./" + fileName, "utf8")
		// console.log(file.match(/\[.*?\]/))
		if (file.startsWith("// [")) this.tabName = file.match(/\[.*?\]/)[0]
		else this.tabName = `[${this.fileName}]`

		this.fileModule = require("./" + this.fileName)
		this.fileModule.saveLog[0] = true
	}

	draw() {
		drawBox(this.x, this.y, this.width, this.height)
		pc(this.tabName + "", this.x + 1, this.y)
		while (this.fileModule._logs.length != 0) this.text.push(this.fileModule._logs.shift())
		if (this.text.length > this.height - 2) this.text.shift()
		for (let t = 0; t < this.text.length; t++)
			pc(this.text[t].slice(0, this.width - 2) + (" ".repeat(Math.max(0, this.text[t].length - 2))), this.x + 1, this.y + 1 + t)
	}
}
let subTerm = [new Term("../CCBot/bot.js", 0, 0, 40, 10)]
// let subTerm = [new Term("testLog.js", 0, 0, 80, 10)]

// Printing
const FULL = '█'
function move(x, y) { process.stdout.write("\033" + `[${y + 1};${x + 1}H`) }
function pc(c, x, y) {
	move(x, y)
	process.stdout.write(c)
}

const LS = {
	"0": 0b111101111,
	"1": 0b010010010,
	"2": 0b110010011,
	"3": 0b111011111,
	"4": 0b101111001,
	"5": 0b011010110,
	"6": 0b100111111,
	"7": 0b111001001,
	"8": 0b011111111,
	"9": 0b111111001,
	":": 0b010000010
}
function bigPrint(s, x, y) {
	x = Math.floor(x)
	y = Math.floor(y)
	for (let l = 0; l < s.length; l++) {
		if (s[l] in LS) {
			let c = LS[s[l]]
			for (let i = 0; i < 9; i++) {
				let cx = x + (2 - i % 3) * 2
				let cy = y + 2 - Math.floor(i / 3)
				if (c & 1) pc(FULL + FULL, cx, cy)
				else pc('░░', cx, cy)
				c = c >> 1
			}
		}
		x += 8
	}
}

function drawBox(xs, ys, w, h, selected=false) {
	xs = Math.floor(xs)
	ys = Math.floor(ys)
	w -= 1
	h -= 1
	pc((selected ? '═' : '─').repeat(w - 1), xs + 1, ys); pc((selected ? '═' : '─').repeat(w - 1), xs + 1, ys + h)
	for (let y = ys + 1; y < ys + h; y++) { pc(selected ? '║' : '│', xs, y); pc(selected ? '║' : '│', xs + w, y) }
	pc(selected ? '╔' : '┌', xs, ys); pc(selected ? '╗' : '┐', xs + w, ys); pc('└', xs, ys + h); pc('┘', xs + w, ys + h)
}
// function fillBox(xs, ys, w, h) {
// 	for (let x = xs; x < xs + w; x++)
// 		for (let y = ys; y < ys + h; y++)
// 			pc(FULL, x, y)
// }

hideCursor()
console.clear()
let frameCount = 0
setInterval(() => {
	drawBox(width / 2 - 28, height / 2 - 3, 58, 5)
	bigPrint(stats.getTime(), width / 2 - 30, height / 2 - 2)

	for (let t = 0; t < subTerm.length; t++) subTerm[t].draw()

	frameCount++
}, 100)

// process.stdin.resume()

// function exitHandler(options, exitCode) {
// 	if (options.cleanup) {
// 		showCursor()
// 		console.clear()
// 	}
// 	if (options.exit) process.exit()
// }

// process.on('exit', exitHandler.bind(null, { cleanup: true }))
// process.on('SIGINT', exitHandler.bind(null, { exit: true }))
// process.on('SIGUSR1', exitHandler.bind(null, { exit: true }))
// process.on('SIGUSR2', exitHandler.bind(null, { exit: true }))
// process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
