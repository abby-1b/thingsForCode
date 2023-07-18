import { logErrorToken } from "./compilerErrors.ts"

export const enum TokenType {
	SYMBOL,
	WORD,
	NUM,
	STR,
}

export interface Token {
	val: string,
	type: TokenType,
	pos: number,
}

const keywordChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
	, numChars = "0123456789"
	, specialChars: {[key: string]: string} = {
		"n": "\n",
		"t": "\t",
		"r": "\r",
		"0": "\0"
	}

export class Lexer {
	private code: string
	private curr = ""
	private idx = 0
	private tokenCache: Token[] = []

	done = false

	/**
	 * Gets a lexer object from a string. This basically gets tokens when they
	 * are needed, meaning errors will pop up faster on large files, as they
	 * don't need to be fully tokenized first.
	 */
	constructor(code: string) {
		this.code = code
	}

	/** Gets a single token */
	getToken(): Token | undefined {
		// TODO: implement comments (`#`, `//`, and `/* */`)
		for (; this.idx < this.code.length && this.tokenCache.length == 0; this.idx++) {
			if (numChars.includes(this.code[this.idx]) || this.code[this.idx] == ".") {
				// Capture numbers
				while (numChars.includes(this.code[this.idx]) || this.code[this.idx] == "." || this.code[this.idx] == "_") {
					this.curr += this.code[this.idx++]
				}

				if (this.curr.includes("....")) {
					// This isn't allowed...
					logErrorToken("Found illegal token", {
						val: this.curr, type: TokenType.SYMBOL, pos: this.idx - this.curr.length
					})
				} else if (this.curr == "...") {
					// Make an exception for ellipsis (`...`)
					this.tokenCache.push({
						val: this.curr, type: TokenType.SYMBOL, pos: this.idx - this.curr.length
					})
				} else if (this.curr.includes("..")) {
					// Make an exception for iterator separators (`..`)
					const spl = this.curr.split("..")
					if (spl[1].length == 0) {
						logErrorToken(spl[0].length == 0
							? "Please specify a start and end for this range"
							: "Please specify an end for this range", {
							val: this.curr,
							type: TokenType.SYMBOL,
							pos: this.idx - this.curr.length	
						})
					}
					this.tokenCache.push({
						val: spl[0].length == 0 ? "0" : spl[0],
						type: TokenType.SYMBOL, pos: this.idx - this.curr.length
					})
					this.tokenCache.push({
						val: "..", type: TokenType.SYMBOL, pos: this.idx - this.curr.length
					})
					this.tokenCache.push({
						val: spl[1], type: TokenType.SYMBOL, pos: this.idx - this.curr.length
					})
				} else {
					this.tokenCache.push({
						val: this.curr, type: TokenType.NUM, pos: this.idx - this.curr.length
					})
				}
				this.curr = "", this.idx--
			} else if (this.code[this.idx] == '"' || this.code[this.idx] == "'") {
				// Capture strings
				const initialCharacter = this.code[this.idx++]
				while (this.code[this.idx] != initialCharacter) {
					if (this.idx >= this.code.length) throw new Error("String end not found!")
					this.curr += this.code[this.idx] == '\\' ? this.specialChar(this.code[++this.idx]) : this.code[this.idx], this.idx++
				}
				this.tokenCache.push({ val: this.curr, type: TokenType.STR, pos: this.idx - this.curr.length }), this.curr = ""
			} else if (keywordChars.includes(this.code[this.idx])) {
				// Capture words
				while (keywordChars.includes(this.code[this.idx]) || numChars.includes(this.code[this.idx]))
					this.curr += this.code[this.idx++]
				this.tokenCache.push({ val: this.curr, type: TokenType.WORD, pos: this.idx - this.curr.length}), this.curr = "", this.idx--
			} else {
				// Capture other symbols
				if (this.code[this.idx] == ' ') continue // Don't capture spaces
				this.tokenCache.push({ val: this.code[this.idx], type: TokenType.SYMBOL, pos: this.idx })
			}
		}
		if (this.tokenCache.length == 0) this.done = true
		return this.tokenCache.shift()
	}

	/** Parse special characters */
	private specialChar(n: string) {
		return n in specialChars ? specialChars[n] : n
	}
}
