import { TokenType, Token } from "./genTokens.ts"

const enum NodeType {
	LITERAL_NUM,
	LITERAL_STR,
	INIT_VAR,

	OP,
	PARENTHESIS,
	BLOCK,
}

interface Node {
	type: NodeType
	val: unknown
}

interface NodeInitVar {
	type: NodeType.INIT_VAR
	varType: Type
	name: string
	val: Node | undefined
}

interface NodeClause {
	type: NodeType.PARENTHESIS | NodeType.BLOCK
	val: Node[]
}

/// SCOPE
interface Type {
	name: string
	args: Type[]
}

interface Declaration {
	name: string
	type: Type
}

const enum ScopeType {
	NONE = 0,
	INNER,
	OUTER,
}

const types = ["i32", "i64", "f32", "f64", "str", "fn"]
const operatorPrecedence: {[key: string]: number} = {
	"+": 0, "-": 0,
	"*": 1, "/": 1,
	".": 2
}

export function genAST(tokens: Token[], outerScope: Declaration[] = [], singleNode = false) {
	// Check if a variable is in the scope
	function inScope(name: string): ScopeType {
		for (let i = scope.length - 1; i >= 0; i--)
			if (scope[i].name == name) return ScopeType.INNER
		for (let i = outerScope.length - 1; i >= 0; i--)
			if (outerScope[i].name == name) return ScopeType.OUTER
		return ScopeType.NONE
	}

	const ast: Node[] = []
	const operators: string[] = []
	const scope: Declaration[] = []
	while (tokens.length > 0) {
		let t = tokens.shift()!
		if (t.type == TokenType.NUM) { // Deal with literals
			ast.push({type: NodeType.LITERAL_NUM, val: t.val})
		} else if (t.type == TokenType.STR) {
			ast.push({type: NodeType.LITERAL_STR, val: t.val})
		} else if (t.type == TokenType.WORD) { // Deal with individual words
			if (types.includes(t.val)) {
				// We're making a variable!

				// Get its type
				const type = {name: t.val, args: getTypeArgs(tokens)}

				// Get its name
				t = tokens.shift()!
				if (t.type != TokenType.WORD)
					throw new Error("Expected word token after type initializer!")
				const name = t.val
				
				// Check if the variable is already defined
				if (inScope(name) == ScopeType.INNER)
					throw new Error(`Variable \`${name}\` already declared in this scope!`)

				// Get its value (if available)
				let val: Node | undefined
				if (tokens[0].val == ":") {
					tokens.shift()
					val = genAST(tokens, [...outerScope, ...scope], true)[0]
				}

				scope.push({name, type}) // Add declaration to scope
				ast.push({
					type: NodeType.INIT_VAR,
					varType: type,
					name,
					val
				} as NodeInitVar) // Add variable to AST
			}
		} else if (t.type == TokenType.SYMBOL) { // Deal with symbols
			if (singleNode && (t.val == ";" || t.val == ","))
				break

			// If it's an operator, do shunting yard
			if ("+-*/.".includes(t.val)) {
				const op = operatorPrecedence[t.val]
				let cp = operators.length == 0 ? -1 : operatorPrecedence[operators[operators.length - 1]]
				while (op <= cp) {
					ast.push({type: NodeType.OP, val: operators.pop()})
					cp = operators.length == 0 ? -1 : operatorPrecedence[operators[operators.length - 1]]
				}
				operators.push(t.val)
			}

			// If it's an opening brace
			if ("([{".includes(t.val)) {
				ast.push({
					type: NodeType.PARENTHESIS,
					val: genAST(tokens, [...outerScope, ...scope], false)
				} as NodeClause)
			}

			if ("}])".includes(t.val)) {
				console.log("Broke!", tokens, ast, operators)
				break
			}
		} else {
			// If a token type is not among these, then what the fuck.
			throw new Error("Token type not found: " + t.type)
		}
	}

	// Deal with remaining operators in op stack
	for (let o = 0; o < operators.length; o++) {
		ast.push({type: NodeType.OP, val: operators[o]})
	}
	console.log("Returned:", ast)
	return ast
}

function getTypeArgs(tokens: Token[]): Type[] {
	if ((tokens[0].val as unknown) != "<") return []
	tokens.shift()

	const args: Type[] = []
	while (tokens[0].val != ">") {
		args.push({
			name: tokens.shift()!.val,
			args: getTypeArgs(tokens)
		})
		if (tokens[0].val == ",") tokens.shift()
	}

	return args
}
