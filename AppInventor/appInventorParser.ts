
const MAX_ITER = 999

type SVar = {name: string, level: number, macro?: string[]}
type Func = {color: string, translate?: boolean, transName?: string}
type Funcs = {[key: string]: Func}

const fnc = {
	"str": "#B32D5E",
	"arr": "#49A6D4",
	"var": "#D05F2D",
	"col": "#333333",
	"set": "#266643",
}
const libFns: Funcs = {
	"rgb": {color: fnc.col, translate: true, transName: "make color"},
	"len": {color: fnc.arr,translate: true, transName: "length of list"},
	"strlen": {color: fnc.str, translate: true, transName: "length"},
	"join": {color: fnc.str},
	"trim": {color: fnc.str},
	"empty": {color: fnc.str, translate: true, transName: "is empty"},
	"uppercase": {color: fnc.str, translate: true, transName: "upcase"},
	"lowercase": {color: fnc.str, translate: true, transName: "downcase"},
	"includes": {color: fnc.str, translate: true, transName: "contains"},
	"split": {color: fnc.str},
	"replace": {color: fnc.str, translate: true, transName: "replace all"},
	"reverse": {color: fnc.str},
	"copy": {color: fnc.arr, translate: true, transName: "copy list"},
	"set": {color: fnc.set},
	"get": {color: fnc.set},
}
const mathFunctions = ["rand", "randi", "min", "max", "sqrt", "abs", "neg", "round", "ceil", "floor", "mod", "sin", "cos", "tan", "asin", "acos", "atan", "atan2"]
const mathFunctionMap: {[key: string]: string} = {
	"rand": "random fraction",
	"randi": "random integer",
	"sqrt": "square root",
	"ceil": "ceiling",
	"abs": "absolute",
	"mod": "modulo of"
}

function error(e: string, ret: any = undefined) { console.log(e); return ret }

function parse(code: string) {
	let tokens = code.match(/('|"|'''|""").*?\1|-[0-9.]{1,}|[+\-*\/!<>=&|^]=|\+\+|\-\-|&&|\|\||[~{}()\[\]+\-*\/=,<>|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}|\n/gm) as string[]
	// console.log(tokens)
	let ret: string[] = []

	function captureClause(tokens: string[], removeFL = false): string[] {
		let ret: string[] = []
		let n = 0, i = MAX_ITER
		while (tokens.length > 0) {
			if ("([{".includes(tokens[0])) n++
			if ("}])".includes(tokens[0])) n--
			if (n < 0 || (n == 0 && "=".includes(tokens[0]))) break

			if ("([{".includes(tokens[0]) && "}])".includes(ret[ret.length - 1])) break
			if (i-- < 0) return error("Couldn't find matching parenthesis!", [])
			if (n == 0 && (tokens[0] == "," || tokens[0] == "\n")) break
			if (tokens[0] != "\n") ret.push(tokens.shift() as string)
			else tokens.shift()
		}
		if (tokens[0] == ",") tokens.shift()
		if (removeFL) return ret.slice(1, -1)
		return ret
	}

	function valFromTokens(tk: (string | string[])[]): (string | string[])[] {
		// Parentheses
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
				tk[p] = valFromTokens(tk[p] as string[]) as string[]
			}
			if (tk[p] == '[') {
				let isVar = typeof tk[p - 1] === "string" && vars.map(e => e.name).includes(tk[p - 1] as string)
				tk[p++] = []
				let n = 1, i = MAX_ITER
				while (n > 0) {
					if (tk[p] == '[') n++
					if (tk[p] == ']') n--
					if (i-- < 0) return error("Couldn't find matching bracket!", [])
					let ct = tk.splice(p, 1)[0] as string
					if (ct != "\n") (tk[p - 1] as string[]).push(ct)
				}
				;(tk[--p] as string[]).splice(-1)
				tk[p] = valFromTokens(tk[p] as string[]) as string[]
				tk[p] = ["[" + tk[p].length, ...tk[p]]
				if (isVar) {
					let vr = tk.splice(--p, 1)[0] as string
					(tk[p] as string[])[0] = "$" + vr
				}
			}
			if (p > 0 && mathFunctions.includes(tk[p - 1] as string)) { // (function)
				(tk[p--] as string[]).unshift(tk.splice(p, 1)[0] as string)
			}
			if (p > 0 && (tk[p - 1] as string) in fns) { // (function)
				let n = tk.splice(p - 1, 1)[0] as string
				if (fns[n].translate) n = (fns[n].transName as string)
				;(tk[p - 1] as string[]).unshift(n)
				console.log(tk)
			}
			if (tk[p] == ".") tk[p - 1] += "." + tk[p + 1], tk.splice(p--, 2) // Dot access (value)
		}

		// Operations (yes, this is how I did OOP. Stop me. Bet you won't.)
		;["^", "*/", "+-", ["==", "<", ">"], ["&", "|", "&&", "||"]].forEach(currSymbols => {
			for (let i = 0; i < tk.length; i++) {
				if (typeof tk[i] !== "string") continue
				if (currSymbols.includes(tk[i] as string)) {
					tk[i - 1] = [tk[i] as string, tk[i - 1] as string, tk[i + 1] as string]
					tk.splice(i--, 2)
				}
			}
		})
		return tk.filter(t => t != ",")
	}

	function flattenTransVal(val: (string | string[])[]) {
		let ret = val.flat(Infinity)
		return ret
			.filter(e => e != ",") // Removes commas!
			.map(e => {
				if (e[0] == '$') return ["select list item", translateVal([e.slice(1) as string])]
				if (e[0] == "[") return [".e" + e.slice(1)]
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
		for (let v = vars.length - 1; v >= 0; v--)
			if (vars[v].name == varName) return vars[v]
		return undefined
	}

	
	let varLevel = 1
	let vars: SVar[] = []
	let fns: Funcs = {}
	Object.assign(fns, libFns)
	let nestExits: string[] = []

	while (tokens.length > 0) {
		let tk = tokens.shift() as string
		if (tk == "global") {
			let n = tokens.shift() as string
			vars.push({name: n, level: 0})
			ret.push("initialize global", ".v" + n)
			if (tokens.shift() != "=") error("Expected `=`")
			else ret.push(...translateVal(captureClause(tokens)))
			ret.push("_")
		} else if (tk == "local") {
			let n = tokens.shift() as string
			vars.push({name: n, level: varLevel})
			ret.push("initialize local in do", ".s", ".n" + n)
			if (tokens.shift() != "=") error("Expected `=`")
			else ret.push(...translateVal(captureClause(tokens)))
			ret.push(".l")
		} else if (tk == "macro") {
			let n = tokens.shift() as string
			vars.push({name: n, level: varLevel})
			if (tokens.shift() != "=") error("Expected `=`")
			else vars[vars.length - 1].macro = translateVal(captureClause(tokens))
		} else if (tk == "if") {
			ret.push("if", ".s")
			ret.push(...translateVal(captureClause(tokens, true)), ".l", ".s")
			varLevel++
			nestExits.push(".l")
			tokens.shift()
		} else if (tk == "while") {
			ret.push("while", ".s")
			ret.push(...translateVal(captureClause(tokens, true)), ".l", ".s")
			varLevel++
			nestExits.push(".l")
			tokens.shift()
		} else if (tk == "for") {
			let cls = valFromTokens(captureClause(tokens, true))
			varLevel++
			if (cls[3] == "to") {
				ret.push("for each number from", ".s", ".f" + cls[0],
					...flattenTransVal([cls[2]]), ".l", ".s", ...flattenTransVal([cls[4]]), ".l", ".s")
				if (cls.length == 5) ret.push("1", ".l", ".s")
				else ret.push(...flattenTransVal([cls[6]]), ".l", ".s")
				vars.push({name: cls[0] as string, level: varLevel})
			}
			nestExits.push(".l")
			tokens.shift()
		} else if (tk == "when") {
			let cls = captureClause(tokens, true)
			ret.push("when " + cls.join(""), ".s")
			varLevel++
			nestExits.push("_")
			tokens.shift()
		} else if (tokens.length > 0 && tokens[0] == '=') {
			ret.push("set " + ((getVar(tk) as SVar).level == 0 ? "global " : "") + tk, ".s")
			tokens.shift()
			ret.push(...translateVal(captureClause(tokens)), ".l")
		} else if (tokens.length > 0 && tokens[0] == '[') {
			let list = translateVal([tk])
			let idx = translateVal(captureClause(tokens, true))
			let op = (tokens.shift() as string)[0]
			ret.push("replace list item", ".s", ".s", ...list, ".l", ...idx, ".l")
			let val = translateVal(captureClause(tokens))
			if (op == '=') ret.push(...val)
			else ret.push(op[0], "select list item", ...list, ...idx, ...val)
		} else if (tokens.length > 0 && ["+=", "-=", "*=", "/=", "&=", "|=", "^="].includes(tokens[0])) {
			ret.push("set " + ((getVar(tk) as SVar).level == 0 ? "global " : "") + tk, ".s")
			let op = (tokens.shift() as string)[0]
			let cls = captureClause(tokens)
			cls.unshift(tk, op, "(")
			cls.push(")")
			ret.push(...translateVal(cls), ".l")
		} else if (tokens.length > 0 && ["++", "--"].includes(tokens[0])) {
			ret.push("set " + ((getVar(tk) as SVar).level == 0 ? "global " : "") + tk, ".s")
			let op = (tokens.shift() as string)[0]
			ret.push(...translateVal([tk, op, "1"]), ".l")
		} else if (tokens.length > 3 && tokens[0] == '.' && tokens[2] == '=') {
			ret.push("set " + tk + tokens.splice(0, 2).join(""))
			tokens.shift()
			ret.push(...translateVal(captureClause(tokens)))
			// ret.push(...captureClause(tokens).filter(e => e[0] == '"').map(e => e.slice(1, -1)))
		} else if (tk == "~" && tokens.length > 0 && tokens[0] == '(') {
			ret.push(...captureClause(tokens, true).filter(e => e[0] == '"').map(e => e.slice(1, -1)))
		} else if (tk == "set" && tokens.length > 0 && tokens[0] == '(') {
			let cls = captureClause(tokens, true)
			let p = captureClause(cls).join("")
			let comp = translateVal(captureClause(cls))
			let val = translateVal(captureClause(cls))
			console.log(p, comp, val)
			ret.push("set " + p, ".s", ...comp, ".l", ".s", ...val, ".l")
		} else if (tokens.length > 0 && tokens[0] == '(') {
			if ((tk in fns) && fns[tk].translate) {
				ret.push(fns[tk].transName as string)
			} else ret.push(tk)
			let c = captureClause(tokens, true)
			let h: string[][] = []
			while (c.length > 0) {
				h.push(captureClause(c))
				c.splice(0, 1)
			}
			ret.push(...h.map(translateVal).flat())
		} else if (tk == "}") {
			ret.push(nestExits.pop() as string)
			varLevel--
			vars = vars.filter(v => v.level <= varLevel) // Remove variables out of scope
		} else if (tk != "\n") {
			console.log("Didn't find:", tk, tokens[0])
		}
	}
	console.log(ret)
	return ret
} // 283

// Test
export {}
parse(`
global sliders = [10]
set(Slider.ThumbPosition, sliders[1], 10)
`)


// for (num = a to b) { }
// for (num = a to b step s) { }
// for (item in list) { }

/*
DONE:
 - For
 - "When" instructions
 - while
 - += -= *= /= ^= &= |= ++ --
 - Test variable removal scopes
 - Explicitly written instructions
 - Dot functions (Switch1.BackgroundColor = 'red')
 - LISTS

TODO: (by priority)
 - DICTIONARIES
 - implement list and dictionary for
 - Functions
 - Make dot functions work for any X component
 - Ternary operations
 - Comments
*/

/*
global sliders = [
	Slider1, Slider2,
	Slider3, Slider4,
	Slider5, Slider6,
	Slider7, Slider8,
	Slider9, Slider10
]
when (Clock1.Timer) {
	for (sl = 2 to len(sliders)) {
		local a = sliders[sl]
		set(Slider.ColorLeft,
			sliders[sl],
			rgb([randi(0, 255),
				randi(0, 255),
				randi(0, 255)]))
		set(Slider.ThumbPosition,
			sliders[sl],
			get(Slider.ThumbPosition, sliders[sl - 1]) * 0.1
			+ get(Slider.ThumbPosition, sliders[sl]) * 0.9
		)
	}
}
*/

