import { Token } from "./tokenize.ts"

export function logError(message: string) {
	console.log("\x1b[0;31m" + message)
	Deno.exit()
}

export function logErrorToken(message: string, token: Token) {
	console.log("\x1b[0;31m" + message)
	console.log(token.val)
	Deno.exit()
}
