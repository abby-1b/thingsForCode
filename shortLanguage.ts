
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

function error(...problem: string[]) {
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

interface Node {
	kind: string // The kind of node this node is.
	type: Type // The type of this node's *value*
}
interface NodeLet {
	kind: "LET"
	type: Type
	name: string
	value?: Node
}

function getType(tokens: Token[]): Type {
	return {
		name: tokens.shift()!.val
	}
}

/**
 * Generates an Abstract Syntax Tree
 * @param tokens A series of tokens to analyze. Keep in mind these tokens will be shifted off the array (0-index first)
 * @param multiple Wether or not to return multiple nodes from this operation. 
 * @returns 
 */
function genAST(tokens: Token[], multiple = false): Node[] {
	console.log("Starting:", tokens)
	const ast: Node[] = []
	while (tokens.length > 0) {
		if (ast.length == 1 && !multiple) return ast
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
					value = genAST(tokens)[0]
				}

				if (!value && !type) error(`\`let\` not provided a type nor a value.`)
				if (!type) type = value!.type

				ast.push({
					kind: "LET",
					name: name.val,
					type,
					value
				} as NodeLet)
			}
		} else if (t.type == "NUM") {

		}
	}
	return ast
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
const program = "#lmao=0 .?lmao=0 i  :lmao=1 lmao+1  : lmao"
const t = genTokens(program)
console.log(t)

const a = genAST(t)
console.log(a)
