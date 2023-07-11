import { yellow } from "https://deno.land/std@0.173.0/fmt/colors.ts"
import { Ins, InsType } from "./genIns.ts"

const stackSize = 32
	, pointerSize = 1

let stackPointerPos = -1

export enum From {
	MATA = 0x0 << 4,
	MATB = 0x1 << 4,
	MOPR = 0x2 << 4,
	MOUT = 0x3 << 4,
	ADDR = 0x4 << 4,
	MEM1 = 0x5 << 4,
	MEM2 = 0x6 << 4,
	MEM4 = 0x7 << 4,
	VALU = 0x8 << 4,
	GEN1 = 0x9 << 4,
	GEN2 = 0xA << 4,
	GEN3 = 0xB << 4,
	POP  = 0xC << 4,
	RED1 = 0xD << 4,
	RED2 = 0xE << 4,
	RED4 = 0xF << 4,
}

export enum To {
	MATA = 0x0,
	MATB = 0x1,
	MOPR = 0x2,
	MOUT = 0x3,
	ADDR = 0x4,
	MEM1 = 0x5,
	MEM2 = 0x6,
	MEM4 = 0x7,
	VALU = 0x8,
	GEN1 = 0x9,
	GEN2 = 0xA,
	GEN3 = 0xB,
	PUSH = 0xC,
	OLOG = 0xD,
	JPNZ = 0xE,
	JUMP = 0xF,
}

const enum Op {
	ADD, SUB, MUL, DIV, EQ, NEQ, MT, LT, MEQ, LEQ, SHL, SHR, AND, OR, GBA, GBB
}

export function genBytesNew(ins: Ins[]): number[] {
	// Create header
	const bytes: number[] = [
		...readTo(stackSize + pointerSize + 5, To.JUMP, 4)
	]
	stackPointerPos = bytes.length
	bytes.push(...genPointer(bytes.length + 1), ...new Array(stackSize).fill(0))

	// Check for ALL_FNS information
	const fnCalls: [number, number][] = []
	// if (ins[ins.length - 1] == InsType.ALL_FNS) {}

	// Loop through instructions
	for (let x = 0; x < ins.length; x++) {
		const i = ins[x]
		switch (i[0]) {
		case InsType.MOV: {
			bytes.push(i[1] << 4 | i[2])
		} break
		case InsType.SREG: {
			bytes.push(...readTo(i[2], i[1]))
		} break
		case InsType.SVAR: {
			bytes.push(...varAddr(i[1]))
			bytes.push(writeMem(From.VALU, i[2]))
		} break
		case InsType.GVAR: {
			bytes.push(...varAddr(i[1]))
			bytes.push(readMem(To.VALU, i[2]))
		} break
		case InsType.PUSH: {
			bytes.push(i[1] << 4 | To.PUSH)
		} break
		case InsType.POP: {
			bytes.push(From.POP | i[1])
		} break
		case InsType.FNDR: {
			bytes.push(...readTo(0, i[1], pointerSize))
			fnCalls.push([bytes.length - pointerSize, i[2]])
		} break
		case InsType.ALL_FNS: break
		default:
			(i as unknown as [string])[0] = InsType[i[0]]
			console.log(yellow(`Instruction not found:`), i)
			break
		}
	}

	// console.log(fnCalls)

	return bytes // Finally, return
}

function genPointer(to: number): number[] {
	return [to] // TODO: generate pointer properly
}

function readTo(num: number, to: To, bl?: number): number[] {
	let byteLen = bl ?? Math.ceil(num.toString(16).length / 2)
	if (byteLen == 3) byteLen = 4
	const offs = byteLen == 4 ? 2 : byteLen - 1
	const ret = [((From.RED1 >> 4) + offs) << 4 | to]
	for (let i = 0; i < byteLen; i++) ret.push((num >> (8 * i)) & 255)
	return ret
}

function readMem(to: To, bytes: number): number {
	return (((From.MEM1 >> 4) + (bytes == 4 ? 2 : bytes - 1)) << 4) | to
}
function writeMem(from: From, bytes: number): number {
	return from | (To.MEM1 + (bytes == 4 ? 2 : bytes - 1))
}

function varAddr(offs: number): number[] {
	const ret = [
		...readTo(stackPointerPos, To.ADDR),
		readMem(To.MATA, pointerSize),
		...readTo(offs, To.MATB),
		...readTo(Op.ADD, To.MOPR),
		From.MOUT | To.ADDR
	]
	return ret
}

export function logBytes(b: number[] | Uint8Array) {
	if (b.length == 0) console.log("[no bytes to print]")
	const byteLen = 16
	let curr = ""
	for (let i = 0; i < b.length; i++) {
		if (i % byteLen == 0 && i != 0) console.log(curr), curr = ""
		curr += ((b[i] >> 4).toString(16) + (b[i] & 15).toString(16)).toUpperCase() + " "
	}
	if (curr != "") console.log(curr)
}
