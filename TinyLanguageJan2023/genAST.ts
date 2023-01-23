import { red, yellow } from "https://deno.land/std@0.173.0/fmt/colors.ts"
import { TokenType, Token } from "./genTokens.ts"

export enum NodeType {
	LITERAL_NUM,
	LITERAL_STR,
	INIT_VAR,
	VAR,

	PRE_OP,
	OP,
	PARENTHESIS,
	ARRAY,
	BLOCK,
}

export interface Node {
	/** The type of node this is */
	nodeType: NodeType

	/** The value of the node */
	val: unknown

	/** The type of the values inside this node */
	type: Type | undefined
}

export interface NodeLiteralNum extends Node {
	val: string
}

export interface NodeVar extends Node {
	name: string
}

export interface NodeInitVar extends Node {
	nodeType: NodeType.INIT_VAR
	name: string
	val: Node | undefined
}

export interface NodeClause extends Node {
	nodeType: NodeType.PARENTHESIS | NodeType.BLOCK
	val: Node[]
}

export interface NodeOp extends Node {
	nodeType: NodeType.OP
	val: string
	operands: [Node, Node]
}

/// SCOPE
export interface Type {
	name: string
	args?: Type[]
}

export interface Declaration {
	name: string
	type: Type
}

const typeNames = ["i8", "i16", "i32", "i64", "f16", "f32", "f64", "str", "fn"]
const operatorPrecedence: {[key: string]: number} = {
	"+": 0, "-": 0,
	"*": 1, "/": 1,
	".": 2
}

/**
 * Gets the type of a number
 * @param _num 
 * @returns i32, i64, f32, or f64
 */
function getNumberType(num: string): Type {
	return {name: num.includes(".") ? "f32" : "i32"} // TODO: get actual number type
}

function getResultingType(a: Node, b: Node, _op: string): Type | undefined {
	// If one side is unknown, then the whole operation is unknown
	if (a.type == undefined || b.type == undefined) return undefined
	return {name: "i32"} // TODO: get actual return type
}

function getTypeArgs(tokens: Token[]): Type[] | undefined {
	if (tokens[0].val as unknown != "<") return undefined
	tokens.shift()

	const args: Type[] = []
	while (tokens[0].val != ">") {
		args.push({
			name: tokens.shift()!.val,
			args: getTypeArgs(tokens)
		})
		if (tokens[0].val == ",") tokens.shift()
	}
	tokens.shift()
	
	return args
}

export function genAST(tokens: Token[], outerScope: Declaration[] = [], singleNode = false) {
	/**
	 * Check if a variable is in the scope
	 * @param name The name of the variable to check
	 */
	function inScope(name: string): boolean {
		for (let i = scope.length - 1; i >= 0; i--)
			if (scope[i].name == name) return true
		return false
	}

	/**
	 * Gets a variable from the scope
	 * @param name The name of the variable to get
	 */
	function getVar(name: string) {
		for (let i = scope.length - 1; i >= 0; i--)
			if (scope[i].name == name) return scope[i]
		throw new Error(`Variable \`${name}\` not found in this scope!`)
	}

	const ast: Node[] = []
	const operators: string[] = []
	const scope: Declaration[] = [...outerScope]
	while (tokens.length > 0) {
		let t = tokens.shift()!
		if (t.type == TokenType.NUM) { // Deal with literals
			ast.push({
				nodeType: NodeType.LITERAL_NUM,
				val: t.val,
				type: getNumberType(t.val)
			})
		} else if (t.type == TokenType.STR) {
			ast.push({
				nodeType: NodeType.LITERAL_STR,
				val: t.val,
				type: {name: "str"}
			})
		} else if (t.type == TokenType.WORD) { // Deal with individual words
			if (typeNames.includes(t.val) || t.val == "let") {
				// We're making a variable!

				// Get its type
				let type: Type = {name: t.val, args: getTypeArgs(tokens)}

				// Get its name
				t = tokens.shift()!
				if (t.type != TokenType.WORD)
					throw new Error("Expected word token after type initializer!")
				const name = t.val
				
				// Check if the variable is already defined
				if (inScope(name))
					throw new Error(`Variable \`${name}\` already declared in this scope!`)

				// Get its value (if available)
				let val: Node | undefined
				if (tokens.length != 0 && tokens[0].val == ":") {
					tokens.shift()
					val = genAST(tokens, [...outerScope, ...scope], true)[0]
					if (type.name == "let") type = val.type!
					if (val.nodeType == NodeType.LITERAL_NUM) val.type = type
				} else if (type.name == "let") {
					console.log(red(`Can't infer type of variable \`${name}\``))
					Deno.exit(1)
				}

				scope.push({name, type}) // Add declaration to scope
				ast.push({
					nodeType: NodeType.INIT_VAR,
					name,
					val,
					type
				} as NodeInitVar) // Add variable to AST
			} else if (inScope(t.val)) {
				// A variable is being pulled
				const name = t.val
				ast.push({
					nodeType: NodeType.VAR,
					name,
					type: getVar(name).type
				} as NodeVar)
			}
		} else if (t.type == TokenType.SYMBOL) { // Deal with symbols
			if (singleNode && (t.val == ";" || t.val == ","))
				break

			// If it's an operator, do shunting yard
			if ("+-*/.".includes(t.val)) {
				const op = operatorPrecedence[t.val]
				let cp = operators.length == 0 ? -1 : operatorPrecedence[operators[operators.length - 1]]
				while (op <= cp) {
					ast.push({
						nodeType: NodeType.PRE_OP,
						val: operators.pop(),
						type: undefined
					})
					cp = operators.length == 0 ? -1 : operatorPrecedence[operators[operators.length - 1]]
				}
				operators.push(t.val)
			}

			// If it's an opening brace, add it to 
			if ("([{".includes(t.val)) {
				const braceAST = genAST(tokens, [...outerScope, ...scope], false)
				ast.push({
					nodeType: t.val == "(" ? NodeType.PARENTHESIS
						: t.val == "{" ? NodeType.BLOCK
						: NodeType.ARRAY,
					val: braceAST,
					type: braceAST[braceAST.length - 1].type
				} as NodeClause)
			}

			// I 
			if ("}])".includes(t.val))
				break

			
		} else {
			// If a token type is not among these, then what the fuck.
			throw new Error("Token type not found: " + t.type)
		}
	}

	// Deal with remaining operators in op stack
	for (let o = operators.length - 1; o >= 0; o--)
		ast.push({nodeType: NodeType.PRE_OP, val: operators[o], type: undefined})

	// Give operators their operands
	for (let o = 0; o < ast.length; o++) {
		if (ast[o].nodeType != NodeType.PRE_OP) continue

		ast[o - 2] = {
			nodeType: NodeType.OP,
			val: ast[o].val,
			operands: [ast[o - 2], ast[o - 1]],
			type: getResultingType(ast[o - 2], ast[o - 1], ast[o].val as string)
		} as NodeOp
		ast.splice(o - 1, 2)
		o -= 2
	}
	return ast
}
