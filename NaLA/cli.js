
const ai = require("./ai")
ai.load("db")

const rl = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function input(message) {
	return new Promise((resolve) => {
		rl.question(message, (answer) => {
			resolve(answer)
		})
	})
}

async function main() {
	while (true) {
		let ans = await input(" > ")
		if (ans == '') break
		console.log(ai.getResponse(ans) + "\n")
	}
	rl.close()
	ai.save("db")
}

main()
