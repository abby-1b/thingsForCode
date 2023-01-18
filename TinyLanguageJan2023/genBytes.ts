import { Node, NodeInitVar, NodeType, Type } from "./genAST.ts"

const enum From {
	MATH_A   = 0 << 4,
	MATH_B   = 1 << 4,
	MATH_OP  = 2 << 4,
	MATH_OUT = 3 << 4,
	ADDR     = 4 << 4,
	MEM      = 5 << 4,
	VAL      = 6 << 4,
	GEN_0    = 7 << 4,
	GEN_1    = 8 << 4,
	GEN_2    = 9 << 4,
	READ_1 = 0xD << 4,
	READ_2 = 0xE << 4,
	READ_4 = 0xF << 4,
}

const enum To {
	MATH_A   = 0,
	MATH_B   = 1,
	MATH_OP  = 2,
	MATH_OUT = 3,
	ADDR     = 4,
	MEM      = 5,
	VAL      = 6,
	GEN_0    = 7,
	GEN_1    = 8,
	GEN_2    = 9,
	LOG    = 0xA,
	JNZ    = 0xB,
	JMP    = 0xC,
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
		if (scope[s][0] == name) return scope[0]
		else offs += scope[s][1]
	throw new Error(`Variable \`${name}\` not found in scope`)
}

const stackPointerPos = 2
	, stackSize = 32

export function genBytes(ast: Node[], pos: number, outerScope?: [string, number][]) {
	const scope: [string, number][] = outerScope ?? []
	const bytes: number[] = []

	if (pos == 0)
		bytes.push(From.READ_1 | To.JMP, stackSize + stackPointerPos)

	for (let i = 0; i < ast.length; i++) {
		const n = ast[i]
		switch (n.nodeType) {
		case NodeType.LITERAL_NUM: { // TODO: implement other int types + floats
			const num = parseInt(n.val as string)
			bytes.push(From.READ_1 | To.VAL, num)
		} break
		case NodeType.INIT_VAR: {
			const name = (n as NodeInitVar).name
			scope.push([name, getTypeSize(n.type!)])
			const varPos = getScopeOffset(scope, name)[1]
			if (n.val) bytes.push(
				...genBytes([(n as NodeInitVar).val as Node], pos + bytes.length), // Put value in the VAL register
				From.READ_1 | To.ADDR, stackPointerPos,
				From.MEM | To.MATH_A,
				From.READ_1 | To.MATH_B, varPos,
				From.READ_1 | To.MATH_OP, 
			)
			console.log(n)
		} break
		default:
			(n as unknown as {nodeType: string}).nodeType = NodeType[n.nodeType]
			throw new Error(`Node not found: ${JSON.stringify(n)}`)
		}
	}

	console.log(scope)
	logBytes(bytes)

	return bytes
}

function logBytes(b: number[]) {
	if (b.length == 0) console.log("[no bytes to print]")
	const byteLen = 16
	let curr = ""
	for (let i = 0; i < b.length; i++) {
		curr += ((b[i] >> 4).toString(16) + (b[i] & 15).toString(16)).toUpperCase() + " "
		if (i % byteLen && i != 0) console.log(curr), curr = ""
	}
	if (curr != "") console.log(curr)
}
