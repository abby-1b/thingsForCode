
const targetValue = Math.PI

// This is inefficient!
// A better approach would be to add 1 to B and then add or subtract 1 to a
// until it reaches the "sweet-spot" where it's above and below the target value.
const fractMax = 10000 // The maximum number allowed on the fractions, plus one.
let closestDist = 1 // The current closest distance from the fraction (stored below) to the target value.
let closestA = 0, // Numerator
	closestB = 1  // Denominator

for (let a = 1; a < fractMax; a++) {
	if (a % 10000 == 0) console.log("Step:", a)
	if (a / fractMax > targetValue) {
		console.log("Ended:", a)
		break
	}
	for (let b = 1; b < fractMax; b++) {
		const v = a / b
			, d = Math.abs(targetValue - v)
		if (d < closestDist) {
			closestDist = d, closestA = a, closestB = b
			console.log(closestA, "/", closestB, "  Distance: ", closestDist)
		}
	}
}

const fractValue = closestA / closestB

// Log the fraction
console.log("\nDistance from fraction to target value:", closestDist)
console.log(closestA, "/", closestB)

// Log the values (in decimal) until they stop being equal
let tvStr = "", fvStr = ""
let p = 1
while (p < 99 && tvStr == fvStr) {
	tvStr = targetValue.toPrecision(p)
	fvStr = fractValue.toPrecision(p)
	p++
}

// Print the incorrect digit
console.log(fvStr)
console.log(" ".repeat(fvStr.length - 1) + "^")
console.log(tvStr)
