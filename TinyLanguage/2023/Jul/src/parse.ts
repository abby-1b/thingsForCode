import { logError } from "./compilerErrors.ts"
import { Lexer, Token, TokenType } from "./lex.ts"

const enum NodeType {
	PROGRAM,
	LOOP
}

interface Node {
	type: NodeType
	parent?: Node
	children?: Node[]
}

export function parse(lexer: Lexer): Node {
	let node: Node = {
		type: NodeType.PROGRAM,
		children: []
	}
	function newNode(type: NodeType) {
		node = { type, parent: node }
	}
	function parentNode() {
		if (!node.parent) logError("Failed getting node parent.")
		node = node.parent!
	}

	while (!lexer.done) {
		const t = lexer.getToken()
		if (t == undefined) break

		if (t.val == "@" && t.type == TokenType.SYMBOL) {
			// This is a loop!
			newNode(NodeType.LOOP)
			const t1 = lexer.getToken()
			if (t1?.type == TokenType.WORD) {
				// For loop
				
			}
		}
	}

	for (let t = lexer.getToken(); t != undefined; t = lexer.getToken())
		console.log(t)

	return node
}
