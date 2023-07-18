import { Lexer } from "./lex.ts"
import { parse } from "./parse.ts"

export function compile(code: string) {
	const tokens = new Lexer(code)
	const tree = parse(tokens)
	console.log(tree)
}

const code = `@a 10{ ... }`

const _compiled = compile(code)
