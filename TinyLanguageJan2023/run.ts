const encoder = new TextEncoder()

const mem = new Uint8Array(256)
const reg = new Uint32Array([
	0, // 0x0 Math A
	0, // 0x1 Math B
	0, // 0x2 Math Op
	0, // 0x3 Math Out
	0, // 0x4 Addr
	0, // 0x5 Memory
	0, // 0x6 - 0x9 General purpose
	0,
	0,
	0,
	// 0xA - Log number/character (implementation dependant)
	// 0xB - Jump if not zero
	// 0xC - Jump
	// 0xD - Read one byte
	// 0xE - Read two bytes
	// 0xF - Read four bytes
])
let i = 0 // Instruction pointer

/**
 * Loads a program into memory
 * @param prg The bytes to load into a program
 */
export function loadProgram(prg: number[]) {
	let p = 0
	for (; p < prg.length; p++) mem[p] = prg[p]
	for (; p < mem.length; p++) mem[p] = 0
}

/**
 * Runs a cycle of the currently loaded program
 */
export function cycle() {
	const ins = mem[i]
		, t = ins & 15 // To reg
	let f = ins >> 4 // From reg
	// console.log(i, ins, f, t, " " + reg[3])
	if (f >= 0xD) f = f == 0xD ? mem[++i] : f == 0xE ? mem[++i] << 8 | mem[++i] : mem[++i] << 16 | mem[++i] << 8 | mem[++i]
	else if (f == 0x5) f = mem[reg[0x4]]
	else f = reg[f]
	if (t == 0x5) mem[reg[4]] = f 
	else if (t == 0xA) Deno.stdout.writeSync(encoder.encode(String.fromCharCode(f)))
	else if (t == 0xB) i = reg[0x3] != 0 ? f - 1 : i
	else if (t == 0xC) i = f - 1
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
