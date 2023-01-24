import { green, red, yellow, cyan } from "https://deno.land/std@0.173.0/fmt/colors.ts"
import { Node, NodeLiteralNum, NodeInitVar, NodeType, NodeVar, NodeOp, NodeFunction } from "./genAST.ts"

enum Registers {
	MATH_A = 0x0,
	MATH_B = 0x1,
	MATH_OP = 0x2,
	MATH_OUT = 0x3,
	ADDRESS = 0x4,
	MEMORY = 0x5,
	VALUE = 0x8, // Used for storing a value
	GENERAL1 = 0x9,
	GENERAL2 = 0xA,
	GENERAL3 = 0xB,
	GENERAL4 = 0xC,
	READ = 0xD,
}
export enum InsType {
	/** [int,i8 ] Sets a variable to the value in the VALUE register, i8 being the number of bytes to use  */
	SVAR,
	/** [int,i8 ] Gets a variable and puts it in the VALUE register, i8 being the number of bytes to use  */
	GVAR,
	/** [reg,int] Sets a register to a literal value  */
	SREG,
	/** [reg,reg] Moves a value from one register to another  */
	MOV,
	/** [reg] Pushes a register to the stack  */
	PUSH,
	/** [reg] Pops a value from the stack to a register  */
	POP,
	/** [reg,int] Sets a register to the address of a function */
	FNDR,

	/** An 'instruction' that stores all the function addresses */
	ALL_FNS
}
export type Ins = number[]

/// FUNCTIONS
export interface InsFunction {
	name: string
	ins: Ins[]
}

/// SCOPES
type Scope = [string, number][]
const scope: Scope = [] // TODO: implement scopes
const _outerScopes: Scope[] = []

function getScopeData(name: string): [string, number, number] { // [name, size, offset]
	let offs = 0
	for (let s = 0; s < scope.length; s++)
		if (scope[s][0] == name) return [...scope[s], offs]
		else offs += scope[s][1]
	console.log(red(`Variable \`${name}\` not found in scope`))
	Deno.exit(1)
}

/// TYPES
const pointerSize = 1
const typeSizes: {[key: string]: number} = {
	"i8": 1, "i16": 2, "i32": 4, "i64": 8,
	"f16": 2, "f32": 4, "f64": 8
}

function isTypePointer(node: Node): boolean {
	if (node.type!.name == "fn") return true
	return false // TODO: actually check if a type is a pointer
}

function getTypeSize(node: Node): number {
	// If the type is a pointer, return the pointer size
	if (isTypePointer(node)) return pointerSize

	// If the type is a primitive, return that primitive's size
	if (node.type!.name in typeSizes) return typeSizes[node.type!.name]

	// Otherwise, fallback to 1 and log it
	console.log(yellow(`Type not found: \`${node.type!.name}\``))
	return 1
}

/// VISITING (AKA CODE GEN)
function visitLiteralNum(node: NodeLiteralNum): Ins[] {
	return [[InsType.SREG, Registers.VALUE, parseInt(node.val)]]
}

function visitInitVar(node: NodeInitVar): Ins[] {
	scope.push([node.name, getTypeSize(node)])
	const d = getScopeData(node.name)
	return [
		...genIns([node.val as Node]),
		[InsType.SVAR, d[2], d[1]]
	]
}

function visitVar(node: NodeVar): Ins[] {
	const d = getScopeData(node.name)
	return [
		[InsType.GVAR, d[2], d[1]]
	]
}

function visitOp(node: NodeOp): Ins[] {
	return [
		...genIns([node.operands[0]]),
		[InsType.PUSH, Registers.VALUE],
		...genIns([node.operands[1]]),
		[InsType.POP, Registers.MATH_A],
		[InsType.MOV, Registers.VALUE, Registers.MATH_B],
		[InsType.MOV, Registers.MATH_OUT, Registers.VALUE]
	]
}

function visitFunction(node: NodeFunction): Ins[] {
	functions.push(genIns(node.body))
	return [
		[InsType.FNDR, Registers.ADDRESS, functions.length - 1]
	]
}

const functions: Ins[][] = []
export function genIns(ast: Node[], genFns = false): Ins[] {
	const ins: Ins[] = []

	for (let i = 0; i < ast.length; i++) {
		let n = ast[i]

		// Precompile operations
		if (n.nodeType == NodeType.OP) n = preCompOp(n as NodeOp)

		// Sequentially compile nodes
		switch (n.nodeType) {
		case NodeType.INIT_VAR:
			ins.push(...visitInitVar(n as NodeInitVar))
			break
		case NodeType.VAR:
			ins.push(...visitVar(n as NodeVar))
			break
		case NodeType.OP:
			ins.push(...visitOp(n as NodeOp))
			break
		case NodeType.LITERAL_NUM:
			ins.push(...visitLiteralNum(n as NodeLiteralNum))
			break
		case NodeType.FUNCTION:
			ins.push(...visitFunction(n as NodeFunction))
			break
		default:
			(n as unknown as {nodeType: string}).nodeType = NodeType[n.nodeType]
			console.log(red(`Node not found:`), n)
			Deno.exit(1)
		}
	}

	// Return current instructions if we don't need to provide functions
	if (!genFns) return ins

	const pos: number[] = [InsType.ALL_FNS]

	// Add functions to instructions
	for (let i = 0; i < functions.length; i++) {
		pos.push(ins.length)
		ins.push(...functions[i])
	}

	ins.push(pos)
	
	return ins
}

function preCompOp(node: NodeOp): Node {
	// Pre-compile both operands
	for (let i = 0; i < node.operands.length; i++) {
		const co = node.operands[i]
		if (co.nodeType == NodeType.OP)
			node.operands[i] = preCompOp(co as NodeOp)
	}

	let ret: Node = node

	// If they're both literal numbers, do the operations
	if (node.operands[0].nodeType == NodeType.LITERAL_NUM
		&& node.operands[1].nodeType == NodeType.LITERAL_NUM) {
		const o0 = node.operands[0]
			, o1 = node.operands[1]
		ret = {nodeType: NodeType.LITERAL_NUM, val: "", type: o0.type}
		if (node.val == "+") ret.val = (parseFloat(o0.val as string) + parseFloat(o1.val as string)).toString()
		if (node.val == "-") ret.val = (parseFloat(o0.val as string) - parseFloat(o1.val as string)).toString()
		if (node.val == "*") ret.val = (parseFloat(o0.val as string) * parseFloat(o1.val as string)).toString()
		if (node.val == "/") ret.val = (parseFloat(o0.val as string) / parseFloat(o1.val as string)).toString()
	}

	return ret
}

export function logIns(ins: Ins[], currFn = ":MAIN") {
	const hasFunctions = ins[ins.length - 1][0] == InsType.ALL_FNS
		, fnName = ":FN_"
		, insTypes: {[key: string]: string[]} = {
			SREG: ["r", "i"],
			MOV : ["r", "r"],
			PUSH: ["r"],
			POP : ["r"],
			FNDR: ["r", "f"]
		}
	const fnPos = hasFunctions ? ins[ins.length - 1].slice(1) : []
	let fnIdx = 0

	// Print ":MAIN"
	if (hasFunctions) console.log(cyan(currFn))
	for (let i = 0; i < ins.length - (hasFunctions ? 1 : 0); i++) {
		if (i == fnPos[0]) console.log(cyan(":FN_" + fnIdx++)), fnPos.shift()
		const t = InsType[ins[i][0]]
			, p = !(t in insTypes) ? ins[i].slice(1) :
				ins[i].slice(1).map((n, i) => 
					insTypes[t][i] == "r" ? Registers[n] :
					insTypes[t][i] == "f" ? cyan(fnName + n) :
					n)
		console.log(`${t == "ALL_FNS" ? '' : '\t'}${green(t)} ${p.map(i => yellow(i.toString())).join(", ")}`)
	}

	// If not the main call, don't print functions
	if (currFn != ":MAIN") return
	
	// Print functions
	// for (let i = 0; i < functions.length; i++)
	// 	logIns(functions[i], fnName + i)
}
