import { green, yellow } from "https://deno.land/std@0.173.0/fmt/colors.ts"
import { From, To } from "./genBytesNew.ts"

const encoder = new TextEncoder()

export const mem = new Uint8Array(128)
const reg = new Uint32Array([
	0, // 0x0 Math A
	0, // 0x1 Math B
	0, // 0x2 Math Op
	0, // 0x3 Math Out
	0, // 0x4 Addr
	0, // 0x5 Memory (8-bit)
	0, // 0x6 Memory (16-bit)
	0, // 0x7 Memory (32-bit)
	0, // 0x8 - 0xB General purpose
	0,
	0,
	0,
	// 0xC r - Pop a value from the built-in stack
	// 0xC  w- Push a value to the built-in stack
	// 0xD r - Read one byte
	// 0xD  w- Log number/character (implementation dependant)
	// 0xE r - Read two bytes
	// 0xE  w- Jump if not zero
	// 0xF r - Read four bytes
	// 0xF  w- Jump
])
const stack = new Uint32Array(32)
let sp = 0 // Stack pointer
let i = 0 // Instruction pointer

/**
 * Loads a program into memory
 * @param prg The bytes to load into a program
 */
export function loadProgram(prg: number[]) {
	if (prg.length > mem.length)
		throw new Error(`Program too big for memory! (${prg.length} > ${mem.length})`)
	let p = 0
	for (; p < prg.length; p++) mem[p] = prg[p]
	for (; p < mem.length; p++) mem[p] = 0
}

function logIns(ins: number) {
	const strNum = (n: number) => (n >> 4).toString(16) + (n & 15).toString(16)
	const padIns = (i: string) => i.length == 4 ? i : i + " "
	const r = [...reg]
	r[To.MEM1] = mem[reg[0x4]]
	console.log("[" + green(padIns(From[ins & 240])) + " > " + yellow(padIns(To[ins & 15])) + "]", green((ins >> 4).toString(16)) + yellow((ins & 15).toString(16)), "[" + [...mem].splice(i + 1, 4).map(strNum).join(" ") + "]", "[" + r.map(strNum).join(" ") + "]")
}

/**
 * Runs a cycle of the currently loaded program
 */
export function cycle() {
	const ins = mem[i]
		, t = ins & 15 // To reg
	let f = ins >> 4 // From reg
	logIns(ins)
	if (ins == 0) return true
	if (f >= 0xD) f = f == 0xD ? mem[++i]
		: f == 0xE ? mem[++i] << 8 | mem[++i]
		: mem[++i] << 24 | mem[++i] << 16 | mem[++i] << 8 | mem[++i]
	else if (f == 0x5) f = mem[reg[0x4]]
	else if (f == 0x6) f = mem[reg[0x4]] << 8 | mem[reg[0x4] + 1]
	else if (f == 0x7) f = mem[reg[0x4]] << 24 | mem[reg[0x4] + 1] << 16 | mem[reg[0x4] + 2] << 8 | mem[reg[0x4] + 3]
	else if (f == 0xC) f = stack[--sp]
	else f = reg[f]
	if (t == 0x5) mem[reg[0x4]] = f
	else if (t == 0x6) mem[reg[0x4]] = f >> 8, mem[reg[0x4] + 1] = f
	else if (t == 0x7) mem[reg[0x4]] = f >> 24, mem[reg[0x4] + 1] = f >> 16, mem[reg[0x4] + 2] = f >> 8, mem[reg[0x4] + 3] = f
	else if (t == 0xC) stack[sp++] = f
	else if (t == 0xD) Deno.stdout.writeSync(encoder.encode(String.fromCharCode(f)))
	else if (t == 0xE) i = reg[0x3] != 0 ? f - 1 : i
	else if (t == 0xF) i = f - 1
	else reg[t] = f
	if (t < 4) switch (reg[2]) {
		case  0: { reg[3] = reg[0] +  reg[1]         } break
		case  1: { reg[3] = reg[0] -  reg[1]         } break
		case  2: { reg[3] = reg[0] *  reg[1]         } break
		case  3: { reg[3] = reg[0] /  reg[1]         } break
		case  4: { reg[3] = reg[0] == reg[1] ? 1 : 0 } break
		case  5: { reg[3] = reg[0] != reg[1] ? 1 : 0 } break
		case  6: { reg[3] = reg[0] >  reg[1] ? 1 : 0 } break
		case  7: { reg[3] = reg[0] <  reg[1] ? 1 : 0 } break
		case  8: { reg[3] = reg[0] >= reg[1] ? 1 : 0 } break
		case  9: { reg[3] = reg[0] <= reg[1] ? 1 : 0 } break
		case 10: { reg[3] = reg[0] << reg[1]         } break
		case 11: { reg[3] = reg[0] >> reg[1]         } break
		case 12: { reg[3] = reg[0] & reg[1]          } break
		case 13: { reg[3] = reg[0] | reg[1]          } break
		case 14: { reg[3] = (reg[1] >> reg[0]) & 255 } break
		case 15: { reg[3] = (reg[0] >> reg[1]) & 255 } break
	}
	i++
}
