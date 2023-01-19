import { Node, NodeInitVar, NodeType, NodeVar, Type } from "./genAST.ts"

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
	GEN4 = 0xC << 4,
	RED1 = 0xD << 4,
	RED2 = 0xE << 4,
	RED4 = 0xF << 4,
}

export enum To {
	MTHA = 0x0,
	MTHB = 0x1,
	MTOP = 0x2,
	MTOT = 0x3,
	ADDR = 0x4,
	MEM1 = 0x5,
	MEM2 = 0x6,
	MEM4 = 0x7,
	VALU = 0x8,
	GEN1 = 0x9,
	GEN2 = 0xA,
	GEN3 = 0xB,
	GEN4 = 0xC,
	OLOG = 0xD,
	JPNZ = 0xE,
	JUMP = 0xF,
}

const enum Op {
	ADD,
	SUB,
	MUL,
	DIV,
	EQ,
	NEQ,
	MT,
	LT,
	MEQ,
	LEQ,
	SHL,
	SHR,
	AND,
	OR,
	GBA,
	GBB,
}

/** The size of a pointer (in bytes) */
const pointerSize = 1

function isTypePointer(_type: Type) {
	return false
}

const typeSizes: {[key: string]: number} = {
	"i8": 1, "i16": 2, "i32": 4, "i64": 8,
	"f16": 2, "f32": 4, "f64": 8
}
function getTypeSize(type: Type): number {
	// If the type is a pointer, return the pointer size
	if (isTypePointer(type))
		return pointerSize

	// If the type is a primitive, return that primitive's size
	if (type.name in typeSizes)
		return typeSizes[type.name]

	// Otherwise, fallback to 1 and log it
	console.log(`Type not found: \`${type.name}\``)
	return 1
}

function getScopeOffset(scope: [string, number][], name: string) {
	let offs = 0
	for (let s = scope.length - 1; s >= 0; s--)
		if (scope[s][0] == name) return offs
		else offs += scope[s][1]
	throw new Error(`Variable \`${name}\` not found in scope`)
}

const stackPointerPos = 2
	, stackSize = 32

const ByteSecuences = {
	/** Puts the address of a variable into the ADDR register */
	GET_VAR: (p: number) => [
		From.RED1 | To.ADDR, stackPointerPos,
		From.MEM1 | To.MTHA,
		From.RED1 | To.MTHB, p,
		From.RED1 | To.MTOP, Op.ADD,
		From.MOUT | To.ADDR ],
}

export function genBytes(ast: Node[], pos: number, scope: [string, number][] = []) {
	const bytes: number[] = []

	if (pos == 0) bytes.push(
		From.RED1 | To.JUMP, stackSize + stackPointerPos * pointerSize + 2,
		...new Array(stackSize + stackPointerPos * pointerSize)
	)

	for (let i = 0; i < ast.length; i++) {
		const n = ast[i]
		switch (n.nodeType) {
		case NodeType.LITERAL_NUM: { // TODO: implement other int types + floats
			const num = parseInt(n.val as string)
			bytes.push(From.RED1 | To.VALU, num)
		} break
		case NodeType.INIT_VAR: {
			const name = (n as NodeInitVar).name
			scope.push([name, getTypeSize(n.type!)])
			const varPos = getScopeOffset(scope, name)
			if (n.val) bytes.push(
				...genBytes(
					[(n as NodeInitVar).val as Node],
					pos + bytes.length,
					scope), // Put value in the VAL register
				...ByteSecuences.GET_VAR(varPos),
				From.VALU | To.MEM1
			)
		} break
		case NodeType.VAR: {
			if (isTypePointer((n as NodeVar).type!))
				throw new Error("TODO: implement variable pointers")
			const varPos = getScopeOffset(scope, (n as NodeVar).name)
			bytes.push(
				...ByteSecuences.GET_VAR(varPos)
			)
			console.log(n)
		} break
		default:
			(n as unknown as {nodeType: string}).nodeType = NodeType[n.nodeType]
			throw new Error(`Node not found: ${JSON.stringify(n)}`)
		}
	}

	if (pos == 0) {
		console.log(scope)
		logBytes(bytes)
	}

	return bytes
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
