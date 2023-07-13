import { tokenize } from "./tokenize.ts"

export function compile(code: string) {
	console.log(tokenize(code))
}

// TODO: implement comments (`#`, `//`, and `/* */`)
const code = `@a 10{ ... }`

const _compiled = compile(code)
