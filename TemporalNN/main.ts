
import { NN } from "./nn.ts"

const nn = new NN(2, 1)

// console.log(nn.input([0, 0]))
// console.log(nn.input([0, 1]))
// console.log(nn.input([1, 0]))
// console.log(nn.input([1, 1]))
// console.log(nn.neurons.map(n => [n[0], n[3]]))

const dat = [
	[[0, 0], [0]],
	[[0, 1], [1]],
	[[1, 0], [1]],
	[[1, 1], [0]],
]

// const nums: number[] = []
// for (let i = 0; i < 100; i++)
// 	nums.push(new NN(2, 1).trainTo(dat, 0.5))

// console.log(nums)
// console.log(nums.reduce((a, b) => a + b) / nums.length)

console.log(nn.loss(dat))
console.log("Took", nn.trainTo(dat, 0.1), "epochs.")
console.log(nn.loss(dat))

console.log(nn.input([0, 0]))
console.log(nn.input([0, 1]))
console.log(nn.input([1, 0]))
console.log(nn.input([1, 1]))
