
import { NN } from "./nn.ts"

// let n = Math.PI
// let b = floatToBase(n)
// let sn = baseToFloat(b)

// console.log()
// console.log(b)
// console.log(sn)
// console.log(n)

let bot = NN.from(Deno.readTextFileSync("XOR.nn"))
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

console.log(bot.forward([0, 0])[0])
console.log(bot.forward([0, 1])[0])
console.log(bot.forward([1, 0])[0])
console.log(bot.forward([1, 1])[0])

// console.log(bot.serialize())
