import { Node, NodeLiteralNum, NodeInitVar, NodeType, NodeVar, NodeOp, Type } from "./genAST.ts"

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
enum InsType {
	SREG, // [reg,int] Sets a register to a literal value
	MOV,  // [reg,reg] Moves a value from one register to another
	PUSH, // [reg,i8 ] Pushes a register to the stack, i8 being the number of bytes to push from said register
	POP,  // [i8 ,reg] Pops a certain amount of bytes from the stack to a register
}
type Ins = number[]

function visitLiteralNum(node: NodeLiteralNum): Ins[] {
	return [[InsType.SREG, Registers.VALUE, parseInt(node.val)]]
}

function visitInitVar(node: NodeInitVar): Ins[] {
	return [
		...genIns([node.val as Node])
	]
}

function visitOp(node: NodeOp): Ins[] {
	const ins: Ins[] = []

	return ins
}

export function genIns(ast: Node[]): Ins[] {
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
		case NodeType.OP:
			ins.push(...visitOp(n as NodeOp))
			break
		case NodeType.LITERAL_NUM:
			ins.push(...visitLiteralNum(n as NodeLiteralNum))
			break
		default:
			(n as unknown as {nodeType: string}).nodeType = NodeType[n.nodeType]
			throw new Error(`Node not found: ${JSON.stringify(n)}`)
		}
	}

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
