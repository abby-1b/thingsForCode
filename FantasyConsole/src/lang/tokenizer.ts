export const enum TokenTypes {
	IDENTIFIER,
	KEYWORD,
	SYMBOL,
	NUMBER,
	STRING,
}

export interface Token {
    /** The actual token */
    t: string,

    /** The token's type, with some context */
    type: TokenTypes,

    /** The token's start position (character) */
    pos: number,

	/** The index of the file this token came from */
    fileIndex: number
}

/** A token, but only containing the bare minimum. */
export interface HalfToken {
	startPos: number,
	endPos: number,
	fileIndex: number
}

const symbols = new Set(".;,()=+-*/{}:<>[]!?")
const keyWords = new Set(["let", "if", "fn", "return"])

export function tokenize(code: string, fileIndex: number) {
	const tokens: Token[] = []
	let curr = "", i = 0
	function endToken(type = TokenTypes.IDENTIFIER) {
		if (curr.length == 0) return
		tokens.push({
            t: curr,
            type: type == TokenTypes.IDENTIFIER && keyWords.has(curr) ? TokenTypes.KEYWORD : type,
            pos: i - curr.length + 1,
            fileIndex
        }), curr = ""
	}

	for (; i < code.length; i++) {
		const c = code[i]
		if (c == ' ' || c == '\n' || c == '\t')
			i--, endToken(), i++
		else if (c >= '0' && c <= '9' && curr.length > 0)
			curr += c
		else if ((c >= '0' && c <= '9') || c == '.') {
			i--, endToken(), i++
			while ((code[i] >= '0' && code[i] <= '9') || code[i] == '.')
				curr += code[i++]
			i--
			endToken(curr == "." ? TokenTypes.SYMBOL : TokenTypes.NUMBER)
		} else if (c == '"') {
			while (code[++i] != '"')
				curr += code[i]
			endToken(TokenTypes.STRING)
		} else if (symbols.has(c)) {
			i--, endToken(), i++
			curr = c
			endToken(TokenTypes.SYMBOL)
		} else
			curr += c
	}
	endToken()

	// Join some of 'em together
	for (let i = 0; i < tokens.length; i++) {
		// Join `=`
		if (i > 0 && tokens[i].t == '=' && '+-*/%&|^=!'.includes(tokens[i - 1].t)) {
			tokens[i - 1].t += '='
			tokens.splice(i--, 1)
		}
		// Join `-` + NUMBER
		if (
			i < tokens.length - 1 &&
			tokens[i].t == "-" && tokens[i + 1].type == TokenTypes.NUMBER &&
			tokens[i].pos + 1 == tokens[i + 1].pos
		) {
			tokens[i + 1].t = "-" + tokens[i + 1].t
			tokens.splice(i, 1)
		}
	}

	// TODO: implement comments!

	return tokens
}

/**
 * Pretty slow, only used for debugging.
 * Combines multiple tokens into one.
 * Missing characters in the position data are replaced by spaces.
 * @param tokens The tokens to be combined.
 */
// export function combineTokens(...tokens: Token[]): Token {
// 	let startPos = Infinity
// 	let endPos = 0
// 	for (const t of tokens) {
// 		const s = t.pos
// 		const e = t.pos + t.t.length
// 		if (s < startPos) startPos = s
// 		if (e > endPos) endPos = e
// 	}
// 	return {
// 		pos,
// 		endPos,
// 		fileIndex: tokens[0].fileIndex
// 	}
// }
