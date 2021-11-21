
const robot = require("robotjs")
const { exec } = require("child_process");
let engaged = false

setInterval(() => {
	let mouse = robot.getMousePos()
	if (mouse.x == 1439 && mouse.y == 899 && !engaged)
		engage()
}, 500)

function engage() {
	engaged = true
	exec("say -v samantha what the fuck do you want?")

	// Eventually do voice recognition or something here, idk
}

function disengage() {
	engaged = false
}

// console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y)
// robot.mouseClick()
