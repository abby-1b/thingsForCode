
import { NN } from "./nn.ts"

let bot = new NN(2, 3, 1)
let t = performance.now()
bot.trainTo(0.1, [
	[0, 0],
	[0, 1],
	[1, 0],
	[1, 1]
], [
	[0],
	[1],
	[1],
	[0]
])
console.log(performance.now() - t)

// console.log(bot.forward([0, 0]))
// console.log(bot.forward([0, 1]))
// console.log(bot.forward([1, 0]))
// console.log(bot.forward([1, 1]))

console.log(bot.serialize())
