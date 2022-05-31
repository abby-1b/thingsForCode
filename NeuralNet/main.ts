
import { NN, RNN } from "./nn.ts"


const letts = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,.!?()[]_@"
function lett(l: string): number[] {
	let i = (letts.indexOf(l) + 1).toString(2)
	while (i.length < 6) i = "0" + i
	return i.split("").map(e => parseInt(e))
}
function str(s: string): number[][] {
	return s.split("").map(l => lett(l))
}

let bot = new RNN([6, 6, 6], [6, 6, 6])
console.log(bot.forwardUntil(str("AH"), (vals: number[]): boolean => {
	for (let i = 0; i < vals.length; i++) if (Math.round(vals[i]) == 0) return false
	return true
}))


// let bot = NN.from(Deno.readTextFileSync("XOR.nn"))
// bot.trainTo(0.1, [
// 	[0, 0],
// 	[0, 1],
// 	[1, 0],
// 	[1, 1]
// ], [
// 	[0],
// 	[1],
// 	[1],
// 	[0]
// ])

// console.log(bot.forward([0, 0])[0])
// console.log(bot.forward([0, 1])[0])
// console.log(bot.forward([1, 0])[0])
// console.log(bot.forward([1, 1])[0])

// console.log(bot.serialize())
