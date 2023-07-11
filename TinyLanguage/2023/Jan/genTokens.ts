
export const enum TokenType {
	NUM,
	STR,
	WORD,
	SYMBOL
}

export interface Token {
	val: string,
	type: TokenType,
}

const keywordChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
	, numChars = "0123456789"
	, specialChars: {[key: string]: string} = {
		"n": "\n",
		"t": "\t",
		"r": "\r",
		"0": "\0"
	}

export function genTokens(code: string) {
	// Parse special characters
	const specialChar = (n: string) =>
		n in specialChars ? specialChars[n] : n
	
	const tokens: Token[] = []
	let curr = ""
	for (let i = 0; i < code.length; i++) {
		if (numChars.includes(code[i]) || code[i] == ".") {
			// Capture numbers
			while (numChars.includes(code[i]) || code[i] == "." || code[i] == "_")
				curr += code[i++]
			tokens.push({val: curr, type: TokenType.NUM}), curr = "", i--
		} else if (code[i] == '"' || code[i] == "'") {
			// Capture strings
			const initialCharacter = code[i++]
			while (code[i] != initialCharacter) {
				if (i >= code.length) throw new Error("String end not found!")
				curr += code[i] == '\\' ? specialChar(code[++i]) : code[i], i++
			}
			tokens.push({val: curr, type: TokenType.STR}), curr = ""
		} else if (keywordChars.includes(code[i])) {
			// Capture words
			while (keywordChars.includes(code[i]) || numChars.includes(code[i]))
				curr += code[i++]
			tokens.push({val: curr, type: TokenType.WORD}), curr = "", i--
		} else {
			// Capture other symbols
			if (code[i] == ' ') continue // Don't capture spaces
			tokens.push({val: code[i], type: TokenType.SYMBOL})
		}
	}

	return tokens
}
