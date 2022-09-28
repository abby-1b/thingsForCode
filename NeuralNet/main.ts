
import { NN, RNN } from "./nn.ts"


const letts = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,.!?()[]_@"
function lett(l: string): number[] {
	let i = (letts.indexOf(l) + 1).toString(2)
	while (i.length < 6) i = "0" + i
	return i.split("").map(e => parseInt(e))
}
function str(s: string, withZeroes: boolean = false): number[][] {
	return [...s.split("").map(l => lett(l)), ...(withZeroes ? [[0, 0, 0, 0, 0, 0]] : [])]
}
function toStr(arr: number[]) {
	return String.fromCharCode(arr.map(e => Math.round(e)).reverse().map((e, i) => Math.max(0, Math.min(e, 1)) * (1 << i)).reduce((a, b) => a + b))
}

const zeroes = (vals: number[]): boolean => {
	for (let i = 0; i < vals.length; i++) if (Math.round(vals[i]) != 0) return false
	return true
}

// console.log(str("Hey!", true))

let bot = new RNN([6, 8, 8, 6], [6, 6, 6, 6])
bot.trainRNN(1000, [
	str("Hey!"),
	str("Hi!")
], [
	str("Hi!", true),
	str("Hey!", true)
], zeroes)
console.log(bot.forwardRNN(str("Hey!"), zeroes).map(l => toStr(l)))
console.log(bot.forwardRNN(str("Hi!"), zeroes).map(l => toStr(l)))
// console.log(bot.lossRNN([
// 	str("Hey!"),
// 	str("Hi!")
// ], [
// 	str("Hi!", true),
// 	str("Hey!", true)
// ], zeroes))

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
