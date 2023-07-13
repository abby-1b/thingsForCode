import { logErrorToken } from "./compilerErrors.ts"

export const enum TokenType {
	NUM,
	STR,
	WORD,
	SYMBOL
}

export interface Token {
	val: string,
	type: TokenType,
	pos: number
}

const keywordChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
	, numChars = "0123456789"
	, specialChars: {[key: string]: string} = {
		"n": "\n",
		"t": "\t",
		"r": "\r",
		"0": "\0"
	}

export function tokenize(code: string): Token[] {
	// Parse special characters
	const specialChar = (n: string) =>
		n in specialChars ? specialChars[n] : n
	
	const tokens: Token[] = []
	let curr = ""
	for (let i = 0; i < code.length; i++) {
		if (numChars.includes(code[i]) || code[i] == ".") {
			// Capture numbers
			while (numChars.includes(code[i]) || code[i] == "." || code[i] == "_") {
				curr += code[i++]
			}

			if (curr.includes("....")) {
				// This isn't allowed...
				logErrorToken("Found illegal token", {
					val: curr, type: TokenType.SYMBOL, pos: i - curr.length
				})
			} else if (curr == "...") {
				// Make an exception for ellipsis (`...`)
				tokens.push({
					val: curr, type: TokenType.SYMBOL, pos: i - curr.length
				})
			} else if (curr.includes("..")) {
				// Make an exception for iterator separators (`..`)
				const spl = curr.split("..")
				if (spl[1].length == 0) {
					console.log({spl, curr, code})
					logErrorToken(spl[0].length == 0
						? "Please specify a start and end for this range"
						: "Please specify an end for this range", {
						val: curr,
						type: TokenType.SYMBOL,
						pos: i - curr.length	
					})
				}
				tokens.push({
					val: spl[0].length == 0 ? "0" : spl[0],
					type: TokenType.SYMBOL, pos: i - curr.length
				})
				tokens.push({
					val: "..", type: TokenType.SYMBOL, pos: i - curr.length
				})
				tokens.push({
					val: spl[1], type: TokenType.SYMBOL, pos: i - curr.length
				})
			} else {
				tokens.push({
					val: curr, type: TokenType.NUM, pos: i - curr.length
				})
			}
			curr = "", i--
		} else if (code[i] == '"' || code[i] == "'") {
			// Capture strings
			const initialCharacter = code[i++]
			while (code[i] != initialCharacter) {
				if (i >= code.length) throw new Error("String end not found!")
				curr += code[i] == '\\' ? specialChar(code[++i]) : code[i], i++
			}
			tokens.push({ val: curr, type: TokenType.STR, pos: i - curr.length }), curr = ""
		} else if (keywordChars.includes(code[i])) {
			// Capture words
			while (keywordChars.includes(code[i]) || numChars.includes(code[i]))
				curr += code[i++]
			tokens.push({ val: curr, type: TokenType.WORD, pos: i - curr.length}), curr = "", i--
		} else {
			// Capture other symbols
			if (code[i] == ' ') continue // Don't capture spaces
			tokens.push({ val: code[i], type: TokenType.SYMBOL, pos: i })
		}
	}

	return tokens
}
