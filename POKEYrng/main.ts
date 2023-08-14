
let n = 0b10111111010001100
function rng() {
	n >>= 1
	n |= (
		(n & 0b1) ^ ((n & 0b100000) >> 5)
	) << 16
	return n
}

const arr: number[] = []
for (let a = 0; a < 1024; a++)
	arr.push(rng() % 256)

console.log(arr.join(","))
