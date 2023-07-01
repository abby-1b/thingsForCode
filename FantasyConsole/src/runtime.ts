
const enum Register {
	ACCUMULATOR = 0x0,
	STACK_POSITION = 0xF,
	INTERNAL = 0x10
}

const MEM_SIZE = 256
const mem = new Uint8Array(MEM_SIZE)

const REG_SIZE = 16

/** 4 bytes for each register (32-bits) */
const registerBuffer = new ArrayBuffer((REG_SIZE + 1) * 4)
// The extra register is used internally and should not be accessed by any programs.

/** The base register array, accessing the real integer values */
const reg = new Uint32Array(registerBuffer)
/** The registers as f32 values */
const regF32 = new Float32Array(registerBuffer)
/** The registers as i32 values */
const regI32 = new Int32Array(registerBuffer)

function loadProgram(arr: number[] | Uint8Array) {
	for (let i = 0; i < arr.length; i++)
		mem[i] = arr[i]
	const end = arr.length + 1
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
		} else if (hi == 0x1) { // 0x1_
			reg[Register.INTERNAL] = mem[++i] << 24 | mem[++i] << 16 | mem[++i] <<  8 | mem[++i]
			switch (lo) {
				case 0x0: regI32[Register.ACCUMULATOR] += regI32[Register.INTERNAL]; break
				case 0x1: regI32[Register.ACCUMULATOR] -= regI32[Register.INTERNAL]; break
				case 0x2: regI32[Register.ACCUMULATOR] *= regI32[Register.INTERNAL]; break
				case 0x3: regI32[Register.ACCUMULATOR] /= regI32[Register.INTERNAL]; break
				case 0x4: regI32[Register.ACCUMULATOR] %= regI32[Register.INTERNAL]; break
				case 0x5: regI32[Register.ACCUMULATOR] &= regI32[Register.INTERNAL]; break
				case 0x6: regI32[Register.ACCUMULATOR] |= regI32[Register.INTERNAL]; break
				case 0x7: regI32[Register.ACCUMULATOR] &= regI32[Register.INTERNAL]; break
				case 0x8: regF32[Register.ACCUMULATOR] += regF32[Register.INTERNAL]; break
				case 0x9: regF32[Register.ACCUMULATOR] -= regF32[Register.INTERNAL]; break
				case 0xA: regF32[Register.ACCUMULATOR] *= regF32[Register.INTERNAL]; break
				case 0xB: regF32[Register.ACCUMULATOR] /= regF32[Register.INTERNAL]; break
				case 0xC: regF32[Register.ACCUMULATOR] %= regF32[Register.INTERNAL]; break
				case 0xD: reg[Register.ACCUMULATOR] <<= reg[Register.INTERNAL]; break
				case 0xE: reg[Register.ACCUMULATOR] >>= reg[Register.INTERNAL]; break
			}
		} else if (hi == 0x2) { // 0x2_
			reg[Register.INTERNAL] = mem[++i] << 24 | mem[++i] << 16 | mem[++i] <<  8 | mem[++i]
			switch (lo) {
				case 0x0: reg[Register.ACCUMULATOR] = regI32[Register.ACCUMULATOR] == regI32[Register.INTERNAL] ? 1 : 0; break
				case 0x1: reg[Register.ACCUMULATOR] = regI32[Register.ACCUMULATOR] <  regI32[Register.INTERNAL] ? 1 : 0; break
				case 0x2: reg[Register.ACCUMULATOR] = regI32[Register.ACCUMULATOR] >  regI32[Register.INTERNAL] ? 1 : 0; break
				case 0x3: reg[Register.ACCUMULATOR] = Math.sqrt(regI32[Register.ACCUMULATOR]); break
				// unused...
				case 0x7: regF32[Register.ACCUMULATOR] = regF32[Register.ACCUMULATOR] == regF32[Register.INTERNAL] ? 1 : 0; break
				case 0x8: regF32[Register.ACCUMULATOR] = regF32[Register.ACCUMULATOR] <  regF32[Register.INTERNAL] ? 1 : 0; break
				case 0x9: regF32[Register.ACCUMULATOR] = regF32[Register.ACCUMULATOR] >  regF32[Register.INTERNAL] ? 1 : 0; break
				case 0xA: regF32[Register.ACCUMULATOR] = Math.sqrt(regF32[Register.INTERNAL]); break
				case 0xB: regF32[Register.ACCUMULATOR] = Math.pow(regF32[Register.ACCUMULATOR], regF32[Register.INTERNAL]); break
				case 0xC: regF32[Register.ACCUMULATOR] = Math.sin(regF32[Register.ACCUMULATOR]); break
				case 0xD: regF32[Register.ACCUMULATOR] = Math.cos(regF32[Register.ACCUMULATOR]); break
				case 0xE: regF32[Register.ACCUMULATOR] = Math.tan(regF32[Register.ACCUMULATOR]); break
				case 0xF: regF32[Register.ACCUMULATOR] = Math.atan(regF32[Register.ACCUMULATOR]); break
			}
		} else if (hi == 0x3) { // 0x3_
			reg[Register.INTERNAL] = reg[mem[++i] % REG_SIZE]
			switch (lo) {
				case 0x0: regI32[Register.ACCUMULATOR] += regI32[Register.INTERNAL]; break
				case 0x1: regI32[Register.ACCUMULATOR] -= regI32[Register.INTERNAL]; break
				case 0x2: regI32[Register.ACCUMULATOR] *= regI32[Register.INTERNAL]; break
				case 0x3: regI32[Register.ACCUMULATOR] /= regI32[Register.INTERNAL]; break
				case 0x4: regI32[Register.ACCUMULATOR] %= regI32[Register.INTERNAL]; break
				case 0x5: regI32[Register.ACCUMULATOR] &= regI32[Register.INTERNAL]; break
				case 0x6: regI32[Register.ACCUMULATOR] |= regI32[Register.INTERNAL]; break
				case 0x7: regI32[Register.ACCUMULATOR] &= regI32[Register.INTERNAL]; break
				case 0x8: regF32[Register.ACCUMULATOR] += regF32[Register.INTERNAL]; break
				case 0x9: regF32[Register.ACCUMULATOR] -= regF32[Register.INTERNAL]; break
				case 0xA: regF32[Register.ACCUMULATOR] *= regF32[Register.INTERNAL]; break
				case 0xB: regF32[Register.ACCUMULATOR] /= regF32[Register.INTERNAL]; break
				case 0xC: regF32[Register.ACCUMULATOR] %= regF32[Register.INTERNAL]; break
				case 0xD: reg[Register.ACCUMULATOR] <<= reg[Register.INTERNAL]; break
				case 0xE: reg[Register.ACCUMULATOR] >>= reg[Register.INTERNAL]; break
			}
		} else if (hi == 0x4) { // 0x4_
			reg[Register.INTERNAL] = reg[mem[++i] % REG_SIZE]
			switch (lo) {
				case 0x0: reg[Register.ACCUMULATOR] = regI32[Register.ACCUMULATOR] == regI32[Register.INTERNAL] ? 1 : 0; break
				case 0x1: reg[Register.ACCUMULATOR] = regI32[Register.ACCUMULATOR] <  regI32[Register.INTERNAL] ? 1 : 0; break
				case 0x2: reg[Register.ACCUMULATOR] = regI32[Register.ACCUMULATOR] >  regI32[Register.INTERNAL] ? 1 : 0; break
				case 0x3: reg[Register.ACCUMULATOR] = Math.sqrt(regI32[Register.ACCUMULATOR]); break
				// unused...
				case 0x7: regF32[Register.ACCUMULATOR] = regF32[Register.ACCUMULATOR] == regF32[Register.INTERNAL] ? 1 : 0; break
				case 0x8: regF32[Register.ACCUMULATOR] = regF32[Register.ACCUMULATOR] <  regF32[Register.INTERNAL] ? 1 : 0; break
				case 0x9: regF32[Register.ACCUMULATOR] = regF32[Register.ACCUMULATOR] >  regF32[Register.INTERNAL] ? 1 : 0; break
				case 0xA: regF32[Register.ACCUMULATOR] = Math.sqrt(regF32[Register.INTERNAL]); break
				case 0xB: regF32[Register.ACCUMULATOR] = Math.pow(regF32[Register.ACCUMULATOR], regF32[Register.INTERNAL]); break
				case 0xC: regF32[Register.ACCUMULATOR] = Math.sin(regF32[Register.ACCUMULATOR]); break
				case 0xD: regF32[Register.ACCUMULATOR] = Math.cos(regF32[Register.ACCUMULATOR]); break
				case 0xE: regF32[Register.ACCUMULATOR] = Math.tan(regF32[Register.ACCUMULATOR]); break
				case 0xF: regF32[Register.ACCUMULATOR] = Math.atan(regF32[Register.ACCUMULATOR]); break
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
		} else if (mem[i] == 0x82) { // 0x82
			const spp = reg[Register.STACK_POSITION]
			const sp = (mem[spp] << 8 | mem[spp + 1]) + mem[++i]
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
			if (reg[Register.ACCUMULATOR] == 0) i = (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			)
		} else if (mem[i] == 0xD3) { // 0xD3
			if (reg[Register.ACCUMULATOR] == 0) i = reg[mem[++i]]
		} else if (mem[i] == 0xD4) { // 0xD4
			if (reg[Register.ACCUMULATOR] != 0) i = (
				mem[++i] << 24 | mem[++i] << 16 |
				mem[++i] <<  8 | mem[++i]
			)
		} else if (mem[i] == 0xD5) { // 0xD5
			if (reg[Register.ACCUMULATOR] != 0) i = reg[mem[++i]]
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
	0x70, 0x00, 0x00, 0x00, 0x00, 0xFF,
	0x80, 0x00,
	0x81, 0x20
])
run()

console.log(reg)
console.log(mem)
