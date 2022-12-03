
type Float = [number, number]

// Mantissa = 8 bits
// Exponent = 8 bits

let a: Float = [0b1100_0000, 0b1000_0000]
let b: Float = [0b1010_0000, 0b0111_1111]

function toNum(f: Float): number {
	return f[0] / 2 ** (f[1] - 122)
}

function mult(a: Float, b: Float) {
	let vm = 0
	let am = a[0], bm = b[0]
	while (am % 2 == 0 && bm % 2 == 0) am >>= 1, bm >>= 1, vm += 2
	console.log(am * bm, vm)
}

console.log(toNum(a), toNum(b))
mult(a, b)
