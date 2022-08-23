
const date = new Date()
const cycle = [1, 4].includes(date.getDate()) ? 1 : 0 // Wether or not the cycle is LJ
const time = date.getMinutes() + date.getHours() * 60

const classes = [
	["Morning", "English", "Sociology", "Lunch", "Free", "Spanish", "Health",     "Done"],
	["Morning", "Physics", "Calculus",  "Lunch", "Fase", "Spanish", "Statistics", "Done"]
][cycle]
const times = [0, 60 * 7 + 30, 60 * 9 + 10, 60 * 10 + 50, 60 * 11 + 50, 60 * 14 + 30, 60 * 16 + 10]

const onClass = (() => {
	let i = 0
	while (times[i] < time + 30) i++
	return i
})()

const classString = classes[onClass] + " > " + classes[onClass + 1]
