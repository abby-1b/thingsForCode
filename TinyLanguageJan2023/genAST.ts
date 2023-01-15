import { TokenType, Token } from "./genTokens.ts"

const enum NodeType {
	LITERAL_NUM,
	LITERAL_STR,
	INIT_VAR,
}

interface Node {
	type: NodeType
	val: string
}

interface NodeBlock {
	val: Node[]
}

const types = ["i32", "i64", "f32", "f64", "str", "fn"]

export function genAST(tokens: Token[]) {
	const ast: Node[] = []
	while (tokens.length > 0) {
		const t = tokens.shift()!
		switch (t.type) {
		case TokenType.NUM: {
			ast.push({type: NodeType.LITERAL_NUM, val: t.val})
		} break
		case TokenType.STR: {
			ast.push({type: NodeType.LITERAL_STR, val: t.val})
		} break
		case TokenType.WORD: {
			if (types.includes(t.val)) {
				// We're making a variable
				ast.push({type: NodeType.INIT_VAR, val: })
			}
		} break
		case TokenType.SYMBOL: {

		} break
		default:
			throw new Error("Token type not found: " + tokens[t].type)
		}
	}
	return ast
}
