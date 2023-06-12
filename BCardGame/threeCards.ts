
type Hand = [ boolean, boolean, boolean ]

const pad = (n: number) => {
	const s = n.toString()
	return ' '.repeat(20 - s.length) + s
}

function makeRandomHand(): Hand {
	return [
		Math.random() < 0.5 ? true : false,
		Math.random() < 0.5 ? true : false,
		Math.random() < 0.5 ? true : false,
	]
}

function makeOptimizedHandA(from: Hand): Hand {
	return [
		from[2],
		from[0],
		from[1],
	]
}

function makeOptimizedHandB(from: Hand): Hand {
	(((1 * 3) * 3 + 1) << 3) | 0b001
	return [
		!from[1],
		from[0],
		from[1],
	]
}

function makeHandB(from: Hand, seed: number): Hand | undefined {
	const inv = seed & 0b111
	seed >>= 3
	const a = seed % 3; seed = Math.floor(seed / 3)
	const b = seed % 3; seed = Math.floor(seed / 3)
	const c = seed % 3
	if (a == 0 && b == 1 && c == 2) return
	const ret = [
		from[a],
		from[b],
		from[c],
	]
	return [
		inv & 1 ? !ret[0] : ret[0],
		inv & 2 ? !ret[0] : ret[0],
		inv & 4 ? !ret[0] : ret[0],
	]
}

const enum Method {
	RANDOM,
	A,
	B
}
function getSecondHand(from: Hand, method: Method, seed?: number): Hand | undefined {
	// if (!seed) {
	// 	if (method == Method.RANDOM) {
	// 		let h = makeRandomHand()
	// 		while (h[0] == from[0] && h[1] == from[1] && h[2] == from[2])
	// 			h = makeRandomHand()
	// 		return h
	// 	} else if (method == Method.A) {
	// 		const h = makeOptimizedHandA(from)
	// 		if (h[0] == from[0] && h[1] == from[1] && h[2] == from[2])
	// 			return undefined
	// 		return h
	// 	} else if (method == Method.B) {
	// 		const h = makeOptimizedHandB(from)
	// 		if (h[0] == from[0] && h[1] == from[1] && h[2] == from[2])
	// 			return undefined
	// 		return h
	// 	}
	// } else {
		const h = makeHandB(from, seed!)
		if (!h) return h
		if (h[0] == from[0] && h[1] == from[1] && h[2] == from[2])
			return undefined
		return h
	// }
}

function getWin(handA: Hand, handB: Hand): boolean {
	const arr = makeRandomHand() as boolean[]

	while (true) {
		if (handA[0] == arr[0] && handA[1] == arr[1] && handA[2] == arr[2]) {
			return false
		} else if (handB[0] == arr[0] && handB[1] == arr[1] && handB[2] == arr[2]) {
			return true
		}
		arr.shift(), arr.push(Math.random() < 0.5 ? true : false)
	}
}

// const COUNT = 300000
// const wins = [0, 0, 0]
// const losses = [0, 0, 0]
// for (let i = 0; i < wins.length; i++) {
// 	for (let c = 0; c < COUNT; c++) {
// 		let handA = makeRandomHand()
// 		let handB = getSecondHand(handA, i)
// 		while (!handB) {
// 			handA = makeRandomHand()
// 			handB = getSecondHand(handA, i)
// 		}
// 		const w = getWin(handA, handB)
// 		if (w) wins[i]++
// 		else losses[i]++
// 	}
// }
// console.log("Random W/L:", wins[0], "/", losses[0], ": ", Math.round((wins[0] / (wins[0] + losses[0])) * 1000) / 10)
// console.log("MethdA W/L:", wins[1], "/", losses[1], ": ", Math.round((wins[1] / (wins[1] + losses[1])) * 1000) / 10)
// console.log("MethdB W/L:", wins[2], "/", losses[2], ": ", Math.round((wins[2] / (wins[2] + losses[2])) * 1000) / 10)


const COUNT = 100000
const MAX_SEED_P1 = 216
const MAX_TRIES = 100
const IGNORE = 50
const wins = new Array(MAX_SEED_P1).fill(0)
const losses = new Array(MAX_SEED_P1).fill(0)
for (let i = 0; i < MAX_SEED_P1; i++) {
	let state = "OK"
	for (let c = 0; c < COUNT; c++) {
		let handA = makeRandomHand()
		let handB = getSecondHand(handA, 0, i)
		let max = 0
		while ((!handB) && max++ < MAX_TRIES) {
			handA = makeRandomHand()
			handB = getSecondHand(handA, 0, i)
		}
		if (!handB) {
			state = "+TRIES"
			break
		}
		const w = getWin(handA, handB)
		if (w) wins[i]++
		else losses[i]++
	}
	console.log(i, pad(wins[i] / (wins[i] + losses[i])), pad(wins[i]), pad(losses[i]), state)
}
const final = wins.map((e, i) => [i, e / (e + losses[i])])
// final.sort((a, b) => b[1] - a[1])
final.sort((a, b) => a[1] - b[1])

console.log(final.slice(0, 10))
