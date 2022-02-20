
import { CharStream } from "./TSUtil/CharStream.ts"
import { ParseStates } from "./TSUtil/ParseStates.ts"
import { InsNode, BlockNode, FnNode, Tokens } from "./TSUtil/TreeNodes.ts"

function tokenize(code: string): Tokens {
	CharStream.from(code + ' ')

	let state = 0
	let hold = ''

	let tokens: Tokens = []

	while (CharStream.get()) {
		// console.log(CharStream.c, CharStream.n, state)

		if (state == -1) {
			hold = ''
			state = 0
		}

		// Space
		if (state == 0 && CharStream.c == ' ') state = -1

		// Comment
		if (state == 0 && CharStream.c == '/' && CharStream.n == '/') state = ParseStates.REM
		if (state == ParseStates.REM) {
			if (CharStream.n == '\n') state = -1
		}


		// Number
		if (state == 0 && "0123456789.".includes(CharStream.c)) state = ParseStates.NUM
		if (state == ParseStates.NUM) {
			hold += CharStream.c
			if (!("0123456789.".includes(CharStream.n))) {
				tokens.push([state, hold])
				state = -1
			}
		}

		// Variable init
		if (state == 0 && CharStream.c == '@') state = ParseStates.VAR
		if (state == ParseStates.VAR) {
			if (CharStream.c && CharStream.c != '@') hold += CharStream.c
			if (!("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789".includes(CharStream.n))) {
				tokens.push([state, hold])
				state = -1
			}
		}

		// Name
		if (state == 0 && "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_".includes(CharStream.c)) state = ParseStates.NAM
		if (state == ParseStates.NAM) {
			if (CharStream.c) hold += CharStream.c
			if (!("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789".includes(CharStream.n))) {
				tokens.push([state, hold])
				state = -1
			}
		}

		// Call
		if (state == 0 && CharStream.c == '#') state = ParseStates.CALL
		if (state == ParseStates.CALL) {
			if (CharStream.c) hold += CharStream.c
			if (!("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789.".includes(CharStream.n))) {
				tokens.push([state, hold])
				state = -1
			}
		}

		// Parenthesis
		if (state == 0 && CharStream.c == '(') tokens.push([ParseStates.PAR_O, '('])
		if (state == 0 && CharStream.c == ')') tokens.push([ParseStates.PAR_C, ')'])

		if (state == 0 && CharStream.c == ',') tokens.push([ParseStates.CMA, ','])

		// Operations
		if (state == 0 && "+-*/=!~%&|".includes(CharStream.c)) state = ParseStates.OPS
		if (state == ParseStates.OPS) {
			hold += CharStream.c
			if (!("+-*/=!~%&|".includes(CharStream.n))) {
				tokens.push([state, hold])
				state = -1
			}
		}

		// If, else
		if (state == 0 && CharStream.c == '?') tokens.push([ParseStates.IF, '?'])
		if (state == 0 && CharStream.c == ':') tokens.push([ParseStates.ELSE, ':'])
	}
	tokens = tokens.filter(e => e[1] != '')
	return tokens
}

function compile(code: string): string {
	let tree = new BlockNode(undefined, "module", [new FnNode(undefined, "main", true)])
	let tokens = tokenize(code)
	tree.takeTokens(tokens)
	tree.cnt.push(new InsNode(tree, `(export "main" (func $main))`))
	return tree.make()
}

function save(fileName: string, data: string): void { Deno.writeTextFile(fileName, data) }
function compileAndSave(fileName: string, data: string): void { save(fileName, compile(data)) }
function processFile(inName: string, outName: string): void { Deno.readTextFile(inName).then(t => {
	compileAndSave(outName, t)
}) }

// Deno.readTextFile(fileName)
// compile("0 @a (5 6 =) ? (69 ~a) : (34.5 ~a) a 2 * ~a #p(a,a)")
// compileAndSave("./out.wat", "#console.log(5) #console.log(10)") // 0 @a (5 6 =) ? (69 ~a)
processFile("./test.mil", "./out.wat")
// tokenize(`"hello!"`)
