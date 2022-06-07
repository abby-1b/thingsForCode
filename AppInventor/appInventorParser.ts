
const MAX_ITER = 999

type SVar = {name: string, level: number, macro?: string[]}

const mathFunctions = ["rand", "randi", "min", "max", "sqrt", "abs", "neg", "round", "ceil", "floor", "mod", "sin", "cos", "tan", "asin", "acos", "atan", "atan2"]
const mathFunctionMap: {[key: string]: string} = {
	"rand": "random fraction",
	"randi": "random integer",
	"sqrt": "square root",
	"ceil": "ceiling",
	"abs": "absolute"
}

function error(e: string, ret: any = undefined) { console.log(e); return ret }

function parse(code: string) {
	let tokens = code.match(/('|"|'''|""").*?\1|-[0-9.]{1,}|[+\-*\/!<>=&|^]=|\+\+|\-\-|&&|\|\||[{}()\[\]+\-*\/=,<>|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}|\n/gm) as string[]
	// console.log(tokens)
	let ret: string[] = []

	function captureClause(tokens: string[], untilNewline = false): string[] {
		let ret: string[] = []
		if (untilNewline) {
			while (tokens[0] != "\n" && tokens.length > 0) ret.push(tokens.shift() as string)
			return ret
		}
		let isFn = false
		if (tokens.length > 1 && tokens[1] == '(')
			isFn = true, ret.push(tokens.shift() as string, "(")
		if (!"([{".includes(tokens[0])) {
			while (tokens.length > 0 && tokens[0] != "\n") ret.push(tokens.shift() as string)
			return ret
		}
		let tk0 = tokens.shift() as string
		let ot = ")]}"["([{".indexOf(tk0)], n = 1, i = MAX_ITER
		while (tokens.length > 0) {
			if (tokens[0] == tk0) n++
			if (tokens[0] == ot) n--
			if (n == 0) break
			if (i-- < 0) return error("Couldn't find matching parenthesis!", [])
			if (tokens[0] != "\n") ret.push(tokens.shift() as string)
		}
		tokens.shift()
		if (isFn) {
			ret.push(")")
		}
		return ret
	}

	function valFromTokens(tk: (string | string[])[]): (string | string[])[] {
		// Deal with parentheses
		for (let p = 0; p < tk.length; p++) {
			if (tk[p] == '(') {
				tk[p++] = []
				let n = 1, i = MAX_ITER
				while (n > 0) {
					if (tk[p] == '(') n++
					if (tk[p] == ')') n--
					if (i-- < 0) return error("Couldn't find matching parenthesis!", [])
					;(tk[p - 1] as string[]).push(tk.splice(p, 1)[0] as string)
				}
				(tk[--p] as string[]).splice(-1)
				valFromTokens(tk[p] as string[])
			}
			if (p > 0 && mathFunctions.includes(tk[p - 1] as string)) {
				(tk[p--] as string[]).unshift(tk.splice(p, 1)[0] as string)
			}
		}
		// Deal with operations
		;["^", "*/", "+-", ["==", "<", ">"], ["&", "|", "&&", "||"]].forEach(currSymbols => {
			for (let i = 0; i < tk.length; i++) {
				if (typeof tk[i] !== "string") continue
				if (currSymbols.includes(tk[i] as string)) {
					tk[i - 1] = [tk[i] as string, tk[i - 1] as string, tk[i + 1] as string]
					tk.splice(i--, 2)
				}
			}
		})
		return tk
	}

	function flattenTransVal(val: (string | string[])[]) {
		return val.flat(Infinity)
			.filter(e => e != ",")
			.map(e => {
				if (e[0] == '"') return e.slice(0, -1)
				if (e == "==") return "="
				if (e == "&") return "bitwise and"
				if (e == "&&") return "and"
				if (e == "|") return "bitwise or"
				if (e == "||") return "or"
				if (mathFunctions.includes(e as string)) {
					if ((e as string) in mathFunctionMap) return mathFunctionMap[e as string]
					return e
				}
				if ((e as string).match(/[a-zA-Z_]/) && vars.map(v => v.name).includes(e as string)) {
					let vr = getVar(e as string) as SVar
					if (vr.macro != undefined) return vr.macro
					return "get " + (vr.level == 0 ? "global " : "") + e
				}
				return e
			})
			.flat(2)
	}

	function translateVal(tk: string[]): string[] {
		return flattenTransVal(valFromTokens(tk))
	}

	function getVar(varName: string): SVar | undefined {
		for (let v = vars.length - 1; v >= 0; v--) {
			if (vars[v].name == varName) return vars[v]
		}
		return undefined
	}

	let varLevel = 1
	let vars: SVar[] = []
	while (tokens.length > 0) {
		let tk = tokens.shift() as string
		if (tk == "global") {
			let n = tokens.shift() as string
			vars.push({name: n, level: 0})
			ret.push("initialize global", ".v" + n)
			if (tokens.shift() != "=") error("Expected `=`")
			else ret.push(...translateVal(captureClause(tokens, true)))
			ret.push("_")
		} else if (tk == "local") {
			let n = tokens.shift() as string
			vars.push({name: n, level: varLevel})
			ret.push("initialize local in do", ".s", ".n" + n)
			if (tokens.shift() != "=") error("Expected `=`")
			else ret.push(...translateVal(captureClause(tokens, true)))
			ret.push(".l")
		} else if (tk == "macro") {
			let n = tokens.shift() as string
			vars.push({name: n, level: varLevel})
			if (tokens.shift() != "=") error("Expected `=`")
			else vars[vars.length - 1].macro = translateVal(captureClause(tokens, true))
		} else if (tk == "if") {
			ret.push("if", ".s")
			ret.push(...translateVal(captureClause(tokens)), ".l", ".s")
			varLevel++
			tokens.shift()
		} else if (tk == "while") {
			ret.push("while", ".s")
			ret.push(...translateVal(captureClause(tokens)), ".l", ".s")
			varLevel++
			tokens.shift()
		} else if (tk == "for") {
			let cls = valFromTokens(captureClause(tokens))
			if (cls[3] == "to") {
				ret.push("for each number from", ".s", ".f" + cls[0],
					...flattenTransVal([cls[2]]), ".l", ".s", ...flattenTransVal([cls[4]]), ".l", ".s")
				if (cls.length == 5) ret.push("1", ".l", ".s")
				else ret.push(...flattenTransVal([cls[6]]), ".l", ".s")
			}
			// TODO: implement list and dictionary for
			varLevel++
			tokens.shift()
		} else if (tk == "when") {
			let cls = captureClause(tokens)
			ret.push("when " + cls.join(""), ".s")
			varLevel++
			tokens.shift()
		} else if (tokens.length > 0 && tokens[0] == '=') {
			ret.push("set" + ((getVar(tk) as SVar).level == 0 ? " global" : "") + tk, ".s")
			tokens.shift()
			ret.push(...translateVal(captureClause(tokens)), ".l")
		} else if (tokens.length > 0 && tokens[0] == '(') {
			ret.push(tk)
			let c = captureClause(tokens)
			let h: string[][] = []
			while (c.length > 0) {
				h.push(captureClause(c))
				c.splice(0, 1)
			}
			ret.push(...h.map(translateVal).flat())
		} else if (tk == "}") {
			ret.push(".l")
			varLevel--
			vars = vars.filter(v => v.level <= varLevel)
		} else if (tk != "\n") {
			console.log("Didn't find:", tk, tokens[0])
		}
	}
	console.log(ret)
	return ret
}

// Test
export {}
parse(`
while (Screen1.Initialize) {}
`)


// for (num = a to b) { }
// for (num = a to b step s) { }
// for (item in list) { }

/*
TODO:
 - "When" instructions
 - while
 - Test variable removal scopes
 - Explicitly written instructions
 - Dot functions (Switch1.BackgroundColor = 'red')
 - Comments
 - Ternary operations
 - Functions
*/

