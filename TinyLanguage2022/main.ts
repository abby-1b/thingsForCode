import { writeAllSync } from "https://deno.land/std@0.156.0/streams/conversion.ts"

const mem: Uint8Array = new Uint8Array(0x200)

const toHex = (n: number, p: number = 2) => "0".repeat(p - 1 - Math.floor(Math.log(Math.max(1, n)) / Math.log(16))) + n.toString(16).toUpperCase()
function printMem() {
	for (let i = 0; i < mem.length; i += 32)
		console.log([...mem.slice(i, i + 32)].map(n =>toHex(n)).join(" "))
}

function putCodeInMem(code: string) {
	const regs: {[key: string]: number} = { "x": 0, "y": 1, "a": 2, "b": 3 }
	const finalReserved = 0xFF
	let memWritePos = 0
	function putInMem(...vals: number[]) { vals.forEach(v => mem[memWritePos++] = v) }
	function putInMemx16(...vals: number[]) { vals.forEach(v => { mem[memWritePos++] = v >> 8, mem[memWritePos++] = v & 255 }) }
	
	let i = -1
	while (++i < code.length) {
		if (memWritePos >= mem.length - finalReserved) { console.log("ERROR: Exceeded available program space!"); break }
		if      (code[i] == 'x') putInMem(1 | regs[code[++i]] << 4), putInMemx16(parseInt(code.slice(++i, i += 4), 16))
		else if (code[i] == 'c') putInMem(2 | regs[code[++i]] << 4 | regs[code[++i]] << 6)
		else if (code[i] == 'w') putInMem(4 | regs[code[++i]] << 4 | regs[code[++i]] << 6)
		else if (code[i] == 'a') putInMem(5), putInMemx16(parseInt(code.slice(++i, i += 4), 16)), putInMem(parseInt(code.slice(i, i += 2), 16))
		else if (code[i] == 'm') putInMem(6 | parseInt(code[++i], 16) << 4)
		else if (code[i] == 'j') putInMem(7 | regs[code[++i]] << 4)
		else if (code[i] == 'z') putInMem(10 | regs[code[++i]] << 4 | regs[code[++i]] << 6)
		else if (code[i] == 'p') putInMem(12 | regs[code[++i]] << 4)
		else if (code[i] == 'o') putInMem(13 | regs[code[++i]] << 4)
		else if (code[i] == 's') { const vs = code.slice(++i, i += 4); putInMem(14, regs[vs[0]] << 6 | regs[vs[1]] << 4 | regs[vs[2]] << 2 | regs[vs[3]]) }
		else if (code[i] != ' ') console.log("oops: '" + code[i] + "'")
	}

	return memWritePos
}

/// Instructions:
///  x 3[reg i16] Puts a number in a register
///  c 1[reg reg] Copies the first register into the second one
///  a 4[i16 i8 ] Sets a memory position to a value
///  m 1[i2 ] Does math, putting the result in the General register
///  j 1[reg] Jumps to the address at the specified register
///  z 1[reg reg] Jumps to the address at the specified register if another register is zero
///  p 1[reg] Prints a register's number (with newline)
///  o 1[reg] Prints a register's number as a character (without newline)
///  s 2[reg reg reg ret] Swizzles registers from their XYAB order (eg putting `aAYBA` swaps B and A, and puts A into X.)

// putCodeInMem(`xx0008 xa0000 xb0001 pa m0 cba cyb jx`)
// putCodeInMem(`xx01FF xb0001 xy00FF wyx cya m1 syxxb m1 syxab xa00E0 zay xa0008 ja`)
const pos = putCodeInMem(`xx01FF xb0001 xy0001 wyx cya m1 syxxb m1 syxab xa00E0 zay xa0008 ja`)
for (let i = 0; i < pos; i++) {
	console.log(`mem[${i}] = 0x${toHex(mem[i])};`)
}
if (true) Deno.exit(0)

/// Interpreter
const reg = new Uint16Array(4) // Addr (X), General (Y), Math A (A), Math B (B)
const math = [
	(a: number, b: number) => { return a + b },
	(a: number, b: number) => { return a - b },
	(a: number, b: number) => { return a * b },
	(a: number, b: number) => { return a / b },

	(a: number, b: number) => { return a == b ? 1 : 0 },
	(a: number, b: number) => { return a != b ? 1 : 0 },
	(a: number, b: number) => { return a > b  ? 1 : 0 },
	(a: number, b: number) => { return a < b  ? 1 : 0 },

	(a: number, b: number) => { return a >= b ? 1 : 0 },
	(a: number, b: number) => { return a <= b ? 1 : 0 },
]
function interpret() {
	reg[0] = 0
	reg[1] = 0
	reg[2] = 0
	reg[3] = 0

	const encoder = new TextEncoder()
	// let reps = 0
	let ptr = -1
	while (mem[++ptr] != 0) {
		// if (reps++ > 500) break
		// const ins = mem[ptr] & 15
		switch (mem[ptr] & 15) {
			/* 2 */ case 1: reg[mem[ptr] >> 4] = mem[++ptr] << 8 | mem[++ptr]; break // Set register
			/* 0 */ case 2: reg[mem[ptr] >> 6] = reg[(mem[ptr] >> 4) & 3]; break // Copy register value
			/* 0 */ case 3: reg[mem[ptr] >> 6] = mem[reg[(mem[ptr] >> 4) & 3]]; break // Read memory at a register to a register
			/* 0 */ case 4: mem[reg[mem[ptr] >> 6]] = reg[(mem[ptr] >> 4) & 3]; break // Writes the value of a register to the memory another register points to.
			/* 3 */ case 5: mem[mem[++ptr] << 8 | mem[++ptr]] = mem[++ptr]; break // Write the memory at an address to a value
			/* 0 */ case 6: reg[1] = math[mem[ptr] >> 4](reg[2], reg[3]) & 65535; break // Do math and put answer in the General register
			/* 0 */ case 7: ptr = reg[mem[ptr] >> 4]; break // Jump to the memory at a specified register
			/* 0 */ case 8: ptr += mem[ptr] >> 4; break // Jump forward some amount (nybble)
			/* 0 */ case 9: ptr -= (mem[ptr] >> 4) - 1; break // Jump backward some amount (nybble)
			/* 0 */ case 10: ptr = reg[mem[ptr] >> 6] != 0 ? ptr : reg[(mem[ptr] >> 4) & 3]; break // Jump to a register if another register is 0
			/* 0 */ case 11: ptr = reg[mem[ptr] >> 6] == 0 ? ptr : reg[(mem[ptr] >> 4) & 3]; break // Jump to a register if another register isn't 0
			/* 0 */ case 12: console.log(reg[mem[ptr] >> 4]); break // Prints a numeric value (with a newline) to the console.
			/* 0 */ case 13: writeAllSync(Deno.stdout, encoder.encode(String.fromCharCode(reg[mem[ptr] >> 4]))); break // Prints a character (without a newline) to the console.
			/* 1 */ case 14: { const swaps = mem[++ptr]; [reg[0], reg[1], reg[2], reg[3]] = [reg[swaps >> 6], reg[swaps >> 4 & 3], reg[swaps >> 2 & 3], reg[swaps & 3]] } break // Swaps multiple registers at once.
		}
		// console.log([...reg].map(r => toHex(r, 4)).join(" "))
	}
	// console.log()
}

function time(fn: () => void, n: number) {
	console.log("Starting...")
	const t = performance.now()
	for (let i = 0; i < n; i++) fn()
	const ft = performance.now()
	const total = ft - t
	console.log("Total time:", total, "ms")
	console.log("Time per iteration:", total / n, "ms")
	console.log("Max per second:", 1 / (total / n))
}

time(() => interpret(), 1000000)

// printMem()
 