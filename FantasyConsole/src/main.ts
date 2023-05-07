
const enum Register {
	STACK_POSITION = 0xF
}

const MEM_SIZE = 256
const mem = new Uint8Array(MEM_SIZE)

const REG_SIZE = 16
const reg = new Uint32Array(REG_SIZE)

function loadProgram(arr: number[] | Uint8Array) {
	for (let i = 0; i < arr.length; i++)
		mem[i] = arr[i]
	let end = arr.length + 1
	reg[Register.STACK_POSITION] = end
	mem[end] = (end + 2) >> 8, mem[end + 1] = end + 2
}

function run() {
	let i = 0
	while (i < MEM_SIZE) {
		const hi = mem[i] >> 4
			, lo = mem[i] & 0b1111
		console.log((hi.toString(16) + lo.toString(16)).toUpperCase(), mem[i])
		if (hi == 0x0) { // 0x00
			return lo
		} else if (hi == 0x1 || hi == 0x3) { // 0x1_, 0x3_
			const arg = hi == 0x1 ? (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			) : reg[mem[++i]]
			switch (lo) {
				
			}
		} else if (hi == 0x2 || hi == 0x4) { // 0x2_, 0x4_           
			const arg = hi == 0x2 ? (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			) : reg[mem[++i]]
			switch (lo) {
				
			}
		} else if (hi == 0x5) { // 0x5_
			const r = mem[++i]
			reg[r] = mem[reg[r]]
		} else if (hi == 0x6) { // 0x6_
			const n = reg[mem[++i]]
			mem[reg[++i]] = n
		} else if (hi == 0x7) { // 0x7_
			const n = mem[++i]
			reg[n] = (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			)
		} else if (mem[i] == 0x80) { // 0x80
			const spp = reg[Register.STACK_POSITION]
			let sp = mem[spp] << 8 | mem[spp + 1]
			const n = reg[mem[++i]]
			// Push the register
			mem[sp++] = n >> 24, mem[sp++] = n >> 16
			mem[sp++] = n >>  8, mem[sp++] = n
			// Increment the pointer
			mem[spp] = sp >> 8, mem[spp + 1] = sp
		} else if (mem[i] == 0x81) { // 0x81
			const spp = reg[Register.STACK_POSITION]
			let sp = mem[spp] << 8 | mem[spp + 1]
			// Push the value
			mem[sp++] = mem[++i]
			// Increment the pointer
			mem[spp] = sp >> 8, mem[spp + 1] = sp
		} else if (mem[i] == 0x84) { // 0x84
			const spp = reg[Register.STACK_POSITION]
			let sp = mem[spp] << 8 | mem[spp + 1]
			reg[mem[++i]] = (
				mem[--sp] | mem[--sp] << 8 |
				mem[--sp] << 16 | mem[--sp] << 32
			)
			mem[spp] = sp >> 8, mem[spp + 1] = sp
		} else if (mem[i] == 0x85) { // 0x85
			const spp = reg[Register.STACK_POSITION]
			const sp = (mem[spp] << 8 | mem[spp + 1]) - mem[++i]
			mem[spp] = sp >> 8, mem[spp + 1] = sp
		} else if (mem[i] == 0x88) { // 0x88
			const spp = reg[Register.STACK_POSITION]
			let sp = mem[spp] << 8 | mem[spp + 1]
			// Push the register
			mem[sp++] = i >> 8, mem[sp++] = i
			// Increment the pointer
			mem[spp] = sp >> 8, mem[spp + 1] = sp
		} else if (mem[i] == 0x89) { // 0x89
			const spp = reg[Register.STACK_POSITION]
			let sp = mem[spp] << 8 | mem[spp + 1]
			i = mem[--sp] | mem[--sp] << 8
			mem[spp] = sp >> 8, mem[spp + 1] = sp
		} else if (mem[i] == 0xD0) { // 0xD0
			i = (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			)
		} else if (mem[i] == 0xD1) { // 0xD1
			i = reg[mem[++i]]
		} else if (mem[i] == 0xD2) { // 0xD2
			if (reg[0] == 0) i = (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			)
		} else if (mem[i] == 0xD3) { // 0xD3
			if (reg[0] == 0) i = reg[mem[++i]]
		} else if (mem[i] == 0xD4) { // 0xD4
			if (reg[0] != 0) i = (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			)
		} else if (mem[i] == 0xD5) { // 0xD5
			if (reg[0] != 0) i = reg[mem[++i]]
		} else if (mem[i] == 0xE0) { // 0xE0
			const t = mem[++i]
			reg[mem[++i]] = reg[t]
		} else if (mem[i] == 0xE1) { // 0xE0
			const f = mem[++i]
				, t = mem[++i]
			;[reg[f], reg[t]] = [reg[t], reg[f]]
		} // TODO: implement chunks

		i++
	}
}

loadProgram([
	0x70, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x80, 0x00,
	0x81, 0x20, 
])
run()

console.log(reg)
console.log(mem)
