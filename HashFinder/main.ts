
// const arr = [
// 	"Monday",
// 	"Tuesday",
// 	"Wednesday",
// 	"Thursday",
// 	"Friday",
// 	"Saturday",
// 	"Sunday"
// ]
// const arr = "hey there i love you so much".split(" ")
// const arr = [...new Set('break as any switch case if throw else var number string get module type instanceof typeof public private enum export finally for while void null super this new in return true false any extends static let package implements interface function new try yield const continue do catch'.split(" "))]
const arr = [...new Set('abstract any as assert asserts async await bigint boolean break case catch class con constructor continue debugger declare de delete do else enum export extends false finally for from function get global if implements import in infer instanceof interface intrinsic is keyof let module namespace never new null number object of out override package private protected public readonly require return set static string super switch symbol this throw true try type typeof undefined unique unknown var void while with yield'.split(" "))]

type HashFunction = (element: string) => number
function findHashFunction(arr: string[]): [HashFunction, number] {
	if (new Set(arr).size != arr.length) {
		throw "Multiple ocurrences of a value found."
	}

	const lenArr = arr.map(e => e.length)
	const minLen = Math.min(...lenArr)
	const maxLen = Math.max(...lenArr)

	function tryFunction(code: string): [HashFunction, number] | undefined {
		let fn = new Function("e", "return " + code) as (element: string) => number
		let min = Infinity
		let max = 0
		const m: Set<number> = new Set()
		for (const el of arr) {
			const v = fn(el)
			if (m.has(v)) return
			else {
				if (v < min) min = v
				if (v > max) max = v
				m.add(v)
			}
		}
		if (min != 0) fn = new Function("e", "return (" + code + ")-" + min) as (element: string) => number
		return [fn, (max - min) + 1]
	}

	// Try using the length
	let bestFn: [HashFunction | undefined, number] = tryFunction(`e.length`) as [HashFunction, number]
	if (bestFn) return bestFn as [HashFunction, number]

	bestFn = [undefined, Infinity]

	// Try using any single character...
	for (let charNum = 0; charNum < minLen; charNum++) {
		const fn = tryFunction(`e.charCodeAt(${charNum})%${arr.length}`)
		if (fn && fn[1] < bestFn[1]) bestFn = fn
	}

	// Monte-carlo that shit (single character)
	for (let i = 0; i < 1000; i++) {
		const a = Math.floor(Math.random() * maxLen * 2) + 2
		const b = arr.length + Math.floor(Math.random() * (i / 100))
		const fn = tryFunction(`e.charCodeAt(${a}%e.length)%${b}`)
		if (fn && fn[1] < bestFn[1]) bestFn = fn
	}

	// Monte-carlo that shit (multiple characters)
	let maxNum = Math.floor(arr.length * 1.4)
	let i = 0
	while (!bestFn[0] || i < 10000) {
		const charNum = 1 + Math.floor(Math.random() * (maxLen - 1))
		const a = new Array(charNum).fill(0).map(_ => Math.floor(Math.random() * maxLen * 2) + 2)
		const b = Math.floor(Math.random() * maxNum)
		const fn = tryFunction(`(${a.map(e => `e.charCodeAt(${e}%e.length)`).join('+')})%${b}`)
		if (i++ % 1000 == 0) {
			maxNum++
			console.log(maxNum, i)
		}
		if (fn && fn[1] < bestFn[1]) bestFn = fn
	}

	return bestFn as [ HashFunction, number ]
}

const fn = findHashFunction(arr)
console.log(fn[0].toString())
// console.log(fn.toString())
console.log(arr)
console.log(arr.map(fn[0]))
console.log((arr.length / fn[1] * 100).toFixed(2) + "% fill rate")
