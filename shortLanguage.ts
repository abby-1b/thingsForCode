
/*
# Why?

As with creating any new programming language, a fundamental question must be
asked: why? What's the need for another new programming language?

The point of this is to have a language that isn't fast on its own, but is very
fast to _write_. This implies many typing optimizations (like shortening `if`s
and `let`s to single characters with no spaces.)

# Quirks

Think of this as something like TypeScript or Rust (yes, I just angered
3/4 of the programming community by comparing these two languages.)

Spaces are very important in this language. A space after a special operator
signifies an opening bracket, while a space after a non-special operator
signifies a closing bracket. 

`let a = 0` => `#a=0`
`let a: string` => `#a:str`
`if (a == b) { ... }` => `?a=b ...`
`print(a)` => `.a`

# Types

`str` A string
`int` An integer (32 bit, signed)
`flt` A floating point value (32 bit)
`arr` An array (dynamic)
`fn`  A function, which just executes code

*/

function error(...problem: any[]) {
	console.log(...problem)
	Deno.exit()
}

function expect<T>(val: T, ...equals: any[]) {
	if (equals.includes(val)) return true
	if (equals.length == 1)
		error(`Expected \`${val}\` to be \`${equals[0]}\``)
	else
		error(`Expected \`${val}\` to be \`${equals.slice(0, -1).join("`, `")}\` or \`${equals.slice(-1)}\``)
}


interface Token {
	val: string
	type: "OPR" | "NUM" | "NAM" | "SPC"
}

const operators = "#=.?:"
	, varLetts = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
	, varLettsSecond = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789"
	, varNums = "0123456789."
function genTokens(program: string) {
	const tokens: Token[] = []
	let i = 0
	while (i < program.length) {
		const isOpr = operators.includes(program[i])
			, isNum = varNums.includes(program[i])
			, isNam = varLetts.includes(program[i])
			, isSpc = program[i] == " "
		if (isOpr)
			tokens.push({ val: program[i], type: "OPR" })
		else if (isNum) {
			let val = ""
			while (varNums.includes(program[i]))
				val += program[i++]
			i--
			tokens.push({ val, type: "NUM" })
		} else if (isNam) {
			let val = ""
			while (varLettsSecond.includes(program[i]))
				val += program[i++]
			i--
			tokens.push({ val, type: "NAM" })
		} else if (isSpc)
			tokens.push({ val: " ", type: "SPC" })
		i++
	}
	return tokens
}

interface Type {
	name: string
	args?: Type[]
}
const Primitive = {
	/** A type for when there is NO type. */
	NOT: {name: "not"} as Type,

	/** A nil type means the value is not defined. */
	NIL: {name: "nil"} as Type,

	I32: {name: "i32"} as Type
}

interface Scope {
	vars: {[key: string]: Type}
	soft: boolean
}
function getVarType(scope: Scope[], name: string, throwErr = false): Type {
	for (let i = scope.length - 1; i >= 0; i--) {
		if (name in scope[i].vars)
			return scope[i].vars[name]
		if (!scope[i].soft) break
	}
	if (throwErr) error(`Variable \`${name}\` not found.`)
	return Primitive.NOT // This will never run, but TS complains without it.
}

interface Node {
	kind: string // The kind of node this node is.
	type: Type // The type of this node's *value*
}
interface NodeLet extends Node {
	kind: "LET"
	name: string
	value?: Node
}
interface NodeVarGet extends Node {
	kind: "GET"
	name: string
}
interface NodeNum extends Node {
	kind: "NUM"
	type: {name: "i32" | "f32"}
	value: string
}
interface NodeOp extends Node {
	kind: "OPR"
	value: string
}
interface NodeCondition extends Node {
	condition: Node
	executes: Node[]
}
interface NodeIf extends NodeCondition {
	kind: "IF"
}

const precedence: {[key: string]: number} = {
	"+": 0, "-": 0,
	"*": 1, "/": 1,
	".": 2,
	"=": 3
}

/**
 * Generates an Abstract Syntax Tree
 * @param tokens A series of tokens to analyze. Keep in mind these tokens will be shifted off the array (0-index first)
 * @param multiple Wether or not to return multiple nodes from this operation. 
 * @returns 
 */
function genAST(tokens: Token[], inScope: Scope[], soft: boolean, multiple = false): Node[] {
	const scope = [...inScope, {
		vars: {},
		soft
	}]
	const operators: string[] = []
	const ast: Node[] = []
	while (tokens.length > 0) {
		if ((tokens[0].type == "SPC" && !multiple) || (tokens.length > 0 && tokens[0].type == "SPC")) break
		const t = tokens.shift()!
		if (t.type == "OPR") {
			if (t.val == "#") {
				// It's a let declaration!
				const name = tokens.shift()!
				let f = tokens.shift()!
				expect(f.val, "=", ":")
				let type: Type | undefined,
					value: Node | undefined
				if (f.val == ":") {
					// It has a type
					type = getType(tokens)
					f = tokens.shift()!
				}
				if (f.val == "=") {
					// It has a value
					value = genAST(tokens, scope, true)[0]
				}

				if (!value && !type) error(`\`let\` not provided a type nor a value.`) // Throw error if nothing is provided
				if (value && type && value.type != type) error(`\`let\` value doesn't match type.`)
				if (!type) type = value!.type // If no type is provided, say `fuck it`

				// Add declaration to AST
				ast.push({
					kind: "LET",
					name: name.val,
					type,
					value
				} as NodeLet)
				
				// Add variable to scope
				scope[scope.length - 1].vars[name.val] = type
			} else if (t.val == "?") {
				const condition = genAST(tokens, scope, true)
					, code = genAST(tokens, scope, true, true)
				ast.push({
					kind: "IF",
					condition: condition[0],
					executes: code,
					type: code.length > 0 ? code[code.length - 1].type : Primitive.NIL
				} as NodeIf)
			} else if (t.val in precedence) {
				const op = precedence[t.val]
				let cp = operators.length == 0 ? -1 : precedence[operators[operators.length - 1]]
				while (op < cp) {
					ast.push({
						kind: "OPR",
						value: operators.pop()!
					} as NodeOp)
					cp = operators.length == 0 ? -1 : precedence[operators[operators.length - 1]]
				}
				operators.push(t.val)
			}
		} else if (t.type == "NUM") {
			ast.push({
				kind: "NUM",
				value: t.val,
				type: {name: "i32"}
			} as NodeNum)
		} else if (t.type == "NAM") {
			ast.push({
				kind: "GET",
				name: t.val,
				type: getVarType(scope, t.val)
			} as NodeVarGet)
		} else {
			error(`Token not found:`, t)
		}
	}

	for (let o = operators.length - 1; o >= 0; o--) {
		ast.push({
			kind: "OPR",
			value: operators[o]
		} as NodeOp)
	}

	console.log("OPERATORS:", operators)
	for (let o = 0; o < ast.length; o++) {
		if (ast[o].kind != "OPR") continue
		ast[o - 2] = {
			kind: "OPR",
			value: (ast[o] as NodeOp).value,
			opA: ast[o - 2],
			opB: ast[o - 1],
			type: getResultingType(ast[o - 2], ast[o - 1], (ast[o] as NodeOp).value)
		} as NodeOp
	}

	console.log("Returned:", ast)

	if (tokens.length > 0 && tokens[0].type == "SPC") tokens.shift()
	return ast
}

function getType(tokens: Token[]): Type {
	// TODO: get `type`, `type<arg>`, `type<arg,>`, `type<arg, arg>`, ect.
	return {
		name: tokens.shift()!.val
	}
}

function getResultingType(opA: Node, opB: Node, opr: string): Type {
	if (opA.type.name == "i32" && opB.type.name == "i32") return Primitive.I32
	return Primitive.NIL
}

/*
Compiles to:
	let i = 0
	if (i == 0) {
		print(i)
	} else if (i == 1) {
		print(i + 1)
	}
*/
// const program = "#lmao=0 #out=?lmao=0 lmao  :lmao=1 lmao+1  : lmao"
const program = "#lmao=0+1 "
const t = genTokens(program)
// console.log(t)

const a = genAST(t, [], true)
console.log(a[0])
