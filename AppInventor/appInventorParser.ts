
type SVar = {name: string, level: number}

function error(e: string) { console.log(e) }

function parse(code: string) {
	let tokens = code.match(/('|"|'''|""").*?\1|-[0-9.]{1,}|[+\-*\/!<>=]=|[{}()\[\]+\-*\/=,|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}|\n/gm) as string[]
	// console.log(tokens)
	let ret: string[] = []

	function captureClause(tokens: string[]): string[] {
		let ret: string[] = []
		if (!"([{".includes(tokens[0])) {
			while (tokens.length > 0 && tokens[0] != "\n") ret.push(tokens.shift() as string)
			return ret
		}
		let tk0 = tokens.shift() as string
		let ot = ")]}"["([{".indexOf(tk0)], n = 1
		while (tokens.length > 0) {
			if (tokens[0] == tk0) n++
			if (tokens[0] == ot) n--
			if (n == 0) break
			if (tokens[0] != "\n") ret.push(tokens.shift() as string)
		}
		tokens.shift()
		return ret
	}

	function valFromTokens(tk: (string | string[])[]): (string | string[])[] {
		// Deal with parentheses
		for (let p = 0; p < tk.length; p++) {
			if (tk[p] == '(') {
				tk[p++] = []
				let n = 1
				while (n > 0) {
					if (tk[p] == '(') n++
					if (tk[p] == ')') n--
					(tk[p - 1] as string[]).push(tk.splice(p, 1)[0] as string)
				}
				(tk[--p] as string[]).splice(-1)
				valFromTokens(tk[p] as string[])
			}
		}
		// Deal with operations
		["^", "*/", "+-", ["=="]].forEach(currSymbols => {
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

	function translateVal(tk: string[]): string[] {
		// console.log(tk)
		let ret = valFromTokens(tk)
			.flat(Infinity)
			.filter(e => e != ",")
			.map(e => {
				if (e[0] == '"') return e.slice(0, -1)
				if (e == "==") return "="
				if ((e as string).match(/[a-zA-Z_]/) && vars.map(v => v.name).includes(e as string))
					return "get " + ((getVar(e as string) as SVar).level == 0 ? "global " : "") + e
				return e
			})
		return ret as string[]
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
			else ret.push(...translateVal(captureClause(tokens)))
			ret.push("_")
		} else if (tk == "local") {
			let n = tokens.shift() as string
			vars.push({name: n, level: varLevel})
			ret.push("initialize local in do", ".s", ".n" + n)
			if (tokens.shift() != "=") error("Expected `=`")
			else {
				let cc = captureClause(tokens)
				ret.push(...translateVal(cc))
			}
			ret.push(".l")
		} else if (tk == "if") {
			ret.push("if", ".s")
			ret.push(...translateVal(captureClause(tokens)), ".l", ".s")
			varLevel++
			tokens.shift()
		} else if (tokens.length > 0 && tokens[0] == '=') {
			ret.push("set " + ((getVar(tk) as SVar).level == 0 ? "global " : "") + tk, ".s")
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
	return ret
}

// Test
export {}
console.log(parse(`
local a = 10
if (a == 10) {
	a = a + 5
}
`))
// global a = "Hello,"
// if (a == "Hello,") {
// 	local b = (join(a, "World!"))
// 	if (a == "Hello,World!") {
// 		a = join(a, "Yeet!")
// 	}
// }
