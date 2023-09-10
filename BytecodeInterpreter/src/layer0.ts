import { Ins } from "./ins.ts"

type MemoryManager = Record<number, [
	(val: number, curr: number) => number, // Setter
	(curr: number) => number, // Getter
]>

// All registers are doubles!
const reg = [
	0, // X [0]
	0, // A [1]
	0, // B [2]
	0, // C [3]
]

// All the GPIO things
const gpio = new Array(16)

const conversionBuffer = new ArrayBuffer(8)
const bytesInput = new Uint8Array(8)
const bytesToF32 = new Float32Array(conversionBuffer)
const bytesToF64 = new Float64Array(conversionBuffer)

export function run(mem: number[], manager: MemoryManager = {}) {
	
	let cycles = 0
	let i = 0
	let isRunning = true

	while (isRunning) {
		cycles++
		// if (cycles >= 50) break

		const insIdx = i

		switch (mem[i++]) {
			case Ins.STX_I8 : { reg[0] = mem[i++] << 24 >> 24 } break
			case Ins.STX_U8 : { reg[0] = mem[i++] } break
			case Ins.STX_I16: { reg[0] = (mem[i++] | mem[i++] << 8) << 16 >> 16 } break
			case Ins.STX_U16: { reg[0] = mem[i++] | mem[i++] << 8 } break
			case Ins.STX_I32: { reg[0] = mem[i++] | mem[i++] << 8 | mem[i++] << 16 | mem[i++] << 24 } break
			case Ins.STX_U32: { reg[0] = mem[i++] | mem[i++] << 8 | mem[i++] << 16 | mem[i++] * (1 << 24) } break
			case Ins.STX_F32: { bytesInput[0] = mem[i++]; bytesInput[1] = mem[i++]; bytesInput[2] = mem[i++]; bytesInput[3] = mem[i++]; reg[0] = bytesToF32[0] } break
			case Ins.STX_F64: { bytesInput[0] = mem[i++]; bytesInput[1] = mem[i++]; bytesInput[2] = mem[i++]; bytesInput[3] = mem[i++]; bytesInput[4] = mem[i++]; bytesInput[5] = mem[i++]; bytesInput[6] = mem[i++]; bytesInput[7] = mem[i++]; reg[0] = bytesToF64[0] } break

			case Ins.LDX_I8 : { reg[0] = mem[reg[0]] << 24 >> 24 } break
			case Ins.LDX_U8 : { reg[0] = mem[reg[0]] } break
			case Ins.LDX_I16: { reg[0] = (mem[reg[0]] | mem[reg[0] + 1] << 8) << 16 >> 16 } break
			case Ins.LDX_U16: { reg[0] = mem[reg[0]] | mem[reg[0] + 1] << 8 } break
			case Ins.LDX_I32: { reg[0] = mem[reg[0]] | mem[reg[0] + 1] << 8 | mem[reg[0] + 2] << 16 | mem[reg[0] + 3] << 24 } break
			case Ins.LDX_U32: { reg[0] = mem[reg[0]] | mem[reg[0] + 1] << 8 | mem[reg[0] + 2] << 16 | mem[reg[0] + 3] * (1 << 24) } break
			case Ins.LDX_F32: { bytesInput[0] = mem[reg[0]]; bytesInput[1] = mem[reg[0] + 1]; bytesInput[2] = mem[reg[0] + 2]; bytesInput[3] = mem[reg[0] + 3]; reg[0] = bytesToF32[0] } break
			case Ins.LDX_F64: { bytesInput[0] = mem[reg[0]]; bytesInput[1] = mem[reg[0] + 1]; bytesInput[2] = mem[reg[0] + 2]; bytesInput[3] = mem[reg[0] + 3]; bytesInput[4] = mem[reg[0] + 4]; bytesInput[5] = mem[reg[0] + 5]; bytesInput[6] = mem[reg[0] + 6]; bytesInput[7] = mem[reg[0] + 7]; reg[0] = bytesToF64[0] } break

			case Ins.PUT_I8 : { mem[reg[0]] = reg[1] & 0xFF } break
			case Ins.PUT_U8 : { mem[reg[0]] = reg[1] & 0xFF } break
			case Ins.PUT_I16: { const v = reg[1] & 0xFFFF; mem[reg[0]] = v & 0xFF; mem[reg[0] + 1] = v >> 8 } break
			case Ins.PUT_U16: { const v = reg[1] & 0xFFFF; mem[reg[0]] = v & 0xFF; mem[reg[0] + 1] = v >> 8 } break
			case Ins.PUT_I32: { const v = reg[1] & 0xFFFFFFFF; mem[reg[0]] = v & 0xFF; mem[reg[0] + 1] = (v >> 8) & 0xFF; mem[reg[0] + 2] = (v >> 16) & 0xFF; mem[reg[0] + 3] = (v >> 24) & 0xFF } break
			case Ins.PUT_U32: { const v = reg[1] & 0xFFFFFFFF; mem[reg[0]] = v & 0xFF; mem[reg[0] + 1] = (v >> 8) & 0xFF; mem[reg[0] + 2] = (v >> 16) & 0xFF; mem[reg[0] + 3] = (v >> 24) & 0xFF } break
			case Ins.PUT_F32: { bytesToF32[0] = reg[1]; mem[reg[0]] = bytesInput[0]; mem[reg[0] + 1] = bytesInput[1]; mem[reg[0] + 2] = bytesInput[2]; mem[reg[0] + 3] = bytesInput[3] } break
			case Ins.PUT_F64: { bytesToF64[0] = reg[1]; mem[reg[0]] = bytesInput[0]; mem[reg[0] + 1] = bytesInput[1]; mem[reg[0] + 2] = bytesInput[2]; mem[reg[0] + 3] = bytesInput[3]; mem[reg[0] + 4] = bytesInput[4]; mem[reg[0] + 5] = bytesInput[5]; mem[reg[0] + 6] = bytesInput[6]; mem[reg[0] + 7] = bytesInput[7] } break

			case Ins.MVX: { reg[0] = reg[reg[0]] } break

			case Ins.STA: { reg[1] = reg[0] } break
			case Ins.STB: { reg[2] = reg[0] } break
			case Ins.STC: { reg[3] = reg[0] } break

			case Ins.ADD: { reg[1] = reg[1] + reg[2] } break
			case Ins.SUB: { reg[1] = reg[1] - reg[2] } break
			case Ins.MLT: { reg[1] = reg[1] * reg[2] } break
			case Ins.DIV: { reg[1] = reg[1] / reg[2] } break
			case Ins.INC: { reg[1] += 1 } break
			case Ins.DEC: { reg[1] -= 1 } break
			case Ins.AND: { reg[1] = reg[1] & reg[2] } break
			case Ins.OR : { reg[1] = reg[1] | reg[2] } break
			case Ins.XOR: { reg[1] = reg[1] & reg[2] } break
			case Ins.SHL: { reg[1] = reg[1] << reg[2] } break
			case Ins.SHR: { reg[1] = reg[1] >> reg[2] } break
			case Ins.NOT: { reg[1] = ~reg[1] } break
			case Ins.BOL: { reg[1] = reg[1] == 0 ? 0 : 1 } break
			case Ins.NEG: { reg[1] = reg[1] < 0 ? 1 : 0 } break
			case Ins.JMP: { i = reg[0] } break
			case Ins.JNZ: { if (reg[1] != 0) i = reg[0] } break
			case Ins.JZE: { if (reg[1] == 0) i = reg[0] } break

			case Ins.GOA: { gpio[reg[0]] = manager[reg[0]] ? manager[reg[0]][0](reg[1], gpio[reg[0]]) : 0 } break
			case Ins.GOB: { gpio[reg[0]] = manager[reg[0]] ? manager[reg[0]][0](reg[2], gpio[reg[0]]) : 0 } break
			case Ins.GOC: { gpio[reg[0]] = manager[reg[0]] ? manager[reg[0]][0](reg[3], gpio[reg[0]]) : 0 } break

			case Ins.GIX: { reg[0] = manager[reg[0]] ? manager[reg[0]][1](gpio[reg[0]]) : 0 } break
			case Ins.GIA: { reg[1] = manager[reg[0]] ? manager[reg[0]][1](gpio[reg[0]]) : 0 } break
			case Ins.GIB: { reg[2] = manager[reg[0]] ? manager[reg[0]][1](gpio[reg[0]]) : 0 } break
			case Ins.GIC: { reg[3] = manager[reg[0]] ? manager[reg[0]][1](gpio[reg[0]]) : 0 } break

			case Ins.END: { isRunning = false } break
		}

		// console.log(BackwardIns[mem[insIdx] as keyof typeof BackwardIns], insIdx, reg)
	}
	console.log("Took", cycles, "cycles!")
}

// run(mem)
// console.log(mem.slice(99))

// let i = 100
// let v = mem[i]
// if (v == 0) return
// v *=
// mem[i] = v
