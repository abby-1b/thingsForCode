import {
	Node,
	NodeType,
	Type,
	NodeInitVar,
	NodeOp,
NodeClause,
} from "./genAST.ts"

function genType(t: Type): string {
	return t.name + (t.args?.length != 0 ? "<" + t.args!.map(genType).join(", ") + ">" : "")
}

export function genCode(ast: Node[]) {
	let ret = ""
	for (let o = 0; o < ast.length; o++) {
		const n = ast[o]
		switch (n.nodeType) {
		case NodeType.LITERAL_NUM: {
			ret += n.val
		} break
		case NodeType.INIT_VAR: {
			ret += genType((n as NodeInitVar).varType) + " "
				+ (n as NodeInitVar).name
				+ ((n as NodeInitVar).val ? ": " + genCode([(n as NodeInitVar).val!]) : "")
		} break
		case NodeType.OP: {
			ret += genCode([(n as NodeOp).operands[0]]) + " "
				+ (n as NodeOp).val + " "
				+ genCode([(n as NodeOp).operands[1]])
		} break
		case NodeType.PARENTHESIS: {
			ret += "(" + genCode((n as NodeClause).val) + ")"
		} break
		}
	}
	return ret
}
