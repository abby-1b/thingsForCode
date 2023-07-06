
const MIN_LEN = 3
const MAX_LEN = 15
const MONTE_CARLO_ITER = 1000

export function compress(code: string) {
	// Get unique characters
	const unique: number[] = []
	for (let i = 1; i < 256; i++) {
		if (!code.includes(String.fromCharCode(i))) {
			unique.push(i)
		}
	}
	const uniqueCount = unique.length
	console.log(uniqueCount)

	// Get strings which can be compacted down
	// { [snippet]: [[score], [repetitions], [length]] }
	const checked: Record<string, [number, number, number]> = {}
	for (let len = MIN_LEN; len <= MAX_LEN; len++) {
		for (let m = 0; m < MONTE_CARLO_ITER; m++) {
			// Get a random snippet of the code
			const i = Math.floor(Math.random() * (code.length - len))
			const snippet = code.slice(i, i + len)

			if (snippet in checked) {
				// If we already checked this snippet, skip it
				continue
			}

			// Check how many times it repeats
			let repetitions = 0
			let idx = 0
			while (idx < code.length - len) {
				const currIdx = code.indexOf(snippet, idx)
				if (currIdx == -1) break
				repetitions++
				idx = currIdx + 1
			}
			checked[snippet] = [repetitions * Math.pow(len, 1.5), repetitions, len]
		}
	}

	const sorted = Object.entries(checked)
		.sort((a, b) => b[1][0] - a[1][0])
	
	// Remove all the sub-strings downstream...
	for (let i = sorted.length - 1; i > 0; i--) {
		const checking = sorted[i][0]
		let found = false
		for (let c = 0; c < i; c++) {
			if (sorted[c][0].includes(checking) || checking.includes(sorted[c][0])) {
				found = true
				break
			}
		}
		if (!found) continue
		sorted.splice(i, 1) // i--, maybe?
	}

	let i = 0
	while (i < sorted.length && i < uniqueCount) {
		// Check if it's worth it
		const data = sorted[i][1]
		if (data[1] * (data[2] - 1) <= 0) { // TODO: do correct math here.
			// If it's either not worth it or neutral, stop
			break
		}
		i++
	}
	sorted.splice(i)
	console.log(sorted, i)
}

const code = Deno.readTextFileSync("./main.ts")
const comp = compress(code)
// console.log(comp)
