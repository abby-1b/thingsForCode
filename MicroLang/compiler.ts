
import { ByteTypes } from "./TSUtil/ByteTypes.ts"
import { CharStream } from "./TSUtil/CharStream.ts"
import { ParseStates } from "./TSUtil/ParseStates.ts"
import { InsNode, BlockNode, FnNode, Tokens } from "./TSUtil/TreeNodes.ts"

function tokenize(code: string): Tokens {
	CharStream.from(code + ' ')

	let state = 0
	let hold = ''

	let tokens: Tokens = []

	while (CharStream.get()) {
		// console.log(CharStream.c, state)

		if (state == -1) {
			hold = ''
			state = 0
		}

		// Space
		if (state == 0 && CharStream.c == ' ') state = -1

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

		// Parenthesis
		if (state == 0 && CharStream.c == '(') tokens.push([ParseStates.PAR_O, '('])
		if (state == 0 && CharStream.c == ')') tokens.push([ParseStates.PAR_C, ')'])

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
	let tree = new BlockNode(undefined, "module", [new FnNode(undefined, "main")])
	tree.takeTokens(tokenize(code))
	tree.cnt.push(new InsNode(`(export "main" (func $main))`))
	return tree.make()
}

function save(fileName: string, data: string): void { Deno.writeTextFile(fileName, data) }
function compileAndSave(fileName: string, data: string): void { save(fileName, compile(data)) }

// Deno.readTextFile(fileName)
// compile("0 @a (5 6 =) ? (69 ~a) : (34.5 ~a) a 2 * ~a #p(a,a)")
compileAndSave("./out.wat", "5 @a (5 a =) ? (69) : (69)") // 0 @a (5 6 =) ? (69 ~a)
