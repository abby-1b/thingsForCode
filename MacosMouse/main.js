
// Robot
const robot = require("robotjs")
const { exec } = require("child_process")
let engaged = false

setInterval(() => {
	let mouse = robot.getMousePos()
	if (mouse.x == 1439 && mouse.y == 899 && !engaged)
		engage()
}, 500)

function engage() {
	engaged = true
	output("what do you want?")

	// Eventually do voice recognition or something here, idk
}

function disengage() {
	engaged = false
}

function output(t) {
	exec("say -v samantha " + t)
	exec("osascript -e 'tell app \"System Events\" to display dialog \"" + t + "\" default answer \"\"' with title \"XXXXXXX\"", (err, out) => {
		let response = out.split("OK, text returned:")[1]
		if (response) {
			console.log(t, ">", response)
		} else {
			console.log(t, ">", "(no response)")
		}
		disengage()
	})
	setTimeout(function() {
		executeAS(`
			tell application "System Events"
				set position of window 1 to {22, 22}
			end tell
		`)
	}, 500)
	console.log(":", t)
}

// console.log("Mouse is at x:" + mouse.x + " y:" + mouse.y)
// robot.mouseClick()

function executeAS(t) {
	// exec("osascript " + t.split(`\n`).map(e => "-e '" + e.replace(/'/g, "\\'") + "'").join(" "))
	exec("osascript <<END\n" + t + "\nEND", (e, out) => {
		// console.log("out:", out)
	})
}

engage()

/*
tell application "System Events"
	(processes whose name is "osascript")
end tell
*/