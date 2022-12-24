
const text = "According to all known laws of aviation, there is no way a bee should be able to fly."

// Bit reading modes:
//   00 - Read two bits
//   01 - Read three bits
//   10 - Read four bits
//   11 - Repeat mode search with next two bits, but add 16 to the number
//     e.g. 11 10 => read 4 bits and add 16 to the result
//          11 11 01 => read 11 (4+4+3) bits

const verbose = true
const encodeBits = 8

function compress(inp: string) {
	if (verbose) console.log("Compressing!")
	const startSize = (inp.length + 1) * encodeBits

	// Turn string into number array
	if (verbose) console.log("Encoding to number array")
	let data = [...new TextEncoder().encode("\0" + inp)]

	// Binary writing functions
	const binOut: number[] = []
	let currBin = 1
	const writeBit = (b: 0 | 1) => {
		currBin = currBin << 1 | b
		if (currBin >= 2 ** encodeBits) binOut.push(currBin & (2 ** encodeBits - 1)), currBin = 1
	}
	, writeNum = (n: number, bits: number) => {
		for (bits--; bits >= 0; bits--) writeBit(n & (2 ** bits) ? 1 : 0)
	}

	// Write encoded number
	const writeEncodedNum = (n: number) => {
		const remNum = 0 | (n / 16)
		n = n & 15
		const mode = n < 4 ? 0 : n < 8 ? 1 : 2
		for (let i = 0; i < remNum; i++) writeNum(3, 2)
		writeNum(mode, 2), writeNum(n, 2 + mode)
	}

	let lastSize = startSize

	if (verbose) console.log("Starting optimization loop...")
	while (1) {
		// Get each element's occurrence count
		if (verbose) console.log("Getting element occurrence counts")
		const ocs: {[key: string]: number} = {}
		for (let i = 0; i < data.length; i++) {
			if (data[i] in ocs) ocs[data[i]]++
			else ocs[data[i]] = 1
		}

		// Store the most common value
		if (verbose) console.log("Getting most common value")
		const sortedOcs = Object.keys(ocs).map((k): [number, number] => [parseInt(k), ocs[k]])
		sortedOcs.sort((a, b) => b[1] - a[1])
		if (sortedOcs[0][1] < 7) break // If it doesn't repeat enough, stop trying
		const val = sortedOcs[0][0]
		
		// Get indexes
		if (verbose) console.log("Getting indexes")
		const indexes = [] as number[]
		let last = -1
		let rmNum = 0
		for (let i = 0; i < data.length; i++) {
			if (verbose && (i % 1000) == 0) console.log(Math.floor((i / data.length) * 1000) / 10, "% getting idxs")
			if (data[i] == val)
				indexes.push(indexes.length == 0 ? i - rmNum : i - rmNum - last),
				last = i - rmNum,
				rmNum++
		}
		data = data.filter(d => d != val)

		// Write the character we're optimizing and the length of the indexes
		writeEncodedNum(val), writeEncodedNum(indexes.length)

		// Write each index (encoded)
		if (verbose) console.log("Writing indexes")
		for (let i = 0; i < indexes.length; i++) writeEncodedNum(indexes[i])

		// Get the new size of the data
		const newSize = binOut.length * encodeBits + Math.floor(Math.log2(currBin)) + data.length * encodeBits

		// If it's bigger than the last one, we definitely have to stop
		if (newSize >= lastSize) {
			console.log("Oops!")
			lastSize = newSize
			break
		}

		// Print
		console.log(lastSize, "=>", newSize, "(" + JSON.stringify(String.fromCharCode(val)).slice(1, -1) + ")", val)

		lastSize = newSize
	}

	// Write all the un-optimized values, not including the optimized ones
	if (verbose) console.log("Writing un-optimized (final) values")
	for (let i = 0; i < data.length; i++) {
		writeNum(data[i], encodeBits)
	}

	// Write final value and finish writing remaining bits
	while (currBin != 1) writeBit(0)

	// Say output message
	console.log("Finally:", inp.length, "=>", binOut.length, " (" + Math.floor((binOut.length / inp.length) * 1000) / 10 + "%)")

	return binOut
}

function decompress(inp: number[]) {
	if (verbose) console.log("Decompressing")

	// Bit reading things
	let currBinBit = 0
		, currBinIdx = 0
	const readBit = () => {
		const ret = (inp[currBinIdx] & (2 ** (encodeBits - 1 - currBinBit))) == 0 ? 0 : 1
		if (++currBinBit == encodeBits) currBinBit = 0, currBinIdx++
		return ret
	}
	, readNum = (bits: number) => {
		let n = 0
		for (bits--; bits >= 0; bits--) n = n << 1 | readBit()
		return n
	}
	, checkZero = (bits: number): boolean => {
		const n = readNum(bits)
		currBinBit -= bits
		while (currBinBit < 0) currBinBit += encodeBits, currBinIdx--
		return n == 0
	}
	, readEncodedNum = () => {
		let n = 0
		let mode = readNum(2)
		while (mode == 3) n += 16, mode = readNum(2)
		n += readNum(mode + 2)
		return n
	}

	// Get all conversions
	if (verbose) console.log("Getting conversions")
	const convs = [] as [number[], number][]
	while (!checkZero(encodeBits)) {
		const val = readEncodedNum()
			, len = readEncodedNum()
			, idxs = [] as number[]

		for (let i = 0; i < len; i++) idxs.push(readEncodedNum())
		
		convs.push([idxs, val])
	}

	readNum(encodeBits) // Remove starting NULL

	// Get data to convert
	if (verbose) console.log("Getting raw data")
	const data: number[] = []
	while (currBinIdx < inp.length)
		data.push(readNum(encodeBits))

	if (data[data.length - 1] == 0) data.splice(-1, 1)

	// Apply conversions
	if (verbose) console.log("Applying conversions:")
	for (let c = convs.length - 1; c >= 0; c--) {
		if (verbose) console.log("Applying conversion:", c)

		const val = convs[c][1]
			, arr = convs[c][0]

		let idx = 0
		for (let i = 0; i < arr.length; i++)
			idx += arr[i] + 1, arr[i] = idx

		for (let i = 0; i < arr.length; i++)
			data.splice(arr[i] - 2, 0, val)

		// let idx = 0
		// for (let i = 0; i < convs[c][0].length; i++)
		// 	idx += convs[c][0][i] + 1, data.splice(idx - 2, 0, convs[c][1])
	}

	return data.map(e => String.fromCharCode(e)).join("")
}

const comp = compress(text)
const decomp = decompress(comp)

console.log(text.length, "=>", comp.length)

console.log(text.length, decomp.length)
console.log(text == decomp)
