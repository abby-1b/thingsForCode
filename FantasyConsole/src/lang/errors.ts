import { getFile, getName } from "./fileStorage.ts"
import { HalfToken, Token } from "./tokenizer.ts"

const MAX_DISPLAY_LINES = 3

export function logError(token: Token | HalfToken, error?: string) {
	if (error) console.log("\x1b[0;31mERROR:", error)
	const lines = getFile(token.fileIndex).split("\n")
	const displayLines: string[] = []
	let lineIndex = 1

	const tokenPos = ((token as Token).pos ?? (token as HalfToken).startPos) + 1
	const tokenLen = ((
		(token as Token).t
			? ((token as Token).pos + (token as Token).t.length)
			: (token as HalfToken).endPos
	) - tokenPos) + 1
	
	let charIndex = 0
	for (const l of lines) {
		displayLines.push(l)
		if (displayLines.length > MAX_DISPLAY_LINES) {
			lineIndex++
			displayLines.shift()
		}

		charIndex += l.length + 1
		if (charIndex >= tokenPos) {
			charIndex -= l.length
			break
		}
	}
	const maxLen = (lineIndex + displayLines.length - 1).toString().length

	console.log(`File: \`${getName(token.fileIndex)}\``)
	for (let l = 0; l < displayLines.length; l++) {
		const n = (l + lineIndex).toString()
		console.log(" ".repeat(maxLen - n.length) + n, "|", displayLines[l])
	}
	console.log(' '.repeat(tokenPos - charIndex + maxLen + 3) + '^'.repeat(tokenLen))
	// console.log(displayLines, charIndex)

	Deno.exit()
}

export function logErrorSimple(error: string) {
	console.log("\x1b[0;31mERROR:", error)
	Deno.exit()
}
