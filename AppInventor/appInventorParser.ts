
function error(e: string) { console.log(e) }

function parse(code: string) {
	let tokens = code.match(/('|"|'''|""").+?\1|-[0-9.]{1,}|[+\-*\/!<>=]=|[{}()\[\]+\-*\/=,|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}/gm) as string[]
	let ret: string[] = []

	function captureClause(tokens: string[]): string[] {
		let ret: string[] = []
		if (!"([{".includes(tokens[0])) {
			while (tokens.length > 0 && !["if", "global", ","].includes(tokens[0])) ret.push(tokens.shift() as string)
			return ret
		}
		let tk0 = tokens.shift() as string
		let ot = ")]}"["([{".indexOf(tk0)], n = 1
		while (tokens.length > 0) {
			if (tokens[0] == tk0) n++
			if (tokens[0] == ot) n--
			if (n == 0) break
			ret.push(tokens.shift() as string)
		}
		tokens.shift()
		return ret
	}

	function valFromTokens(tk: (string | string[])[]): (string | string[])[] {
		// console.log(tk)
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
		if (tk.length == 3) {
			[tk[0], tk[1]] = [tk[1], tk[0]]
			return tk
		}

		for (let i = 0; i < tk.length; i++) {
			if (typeof tk[i] !== "string") continue
			if ("*/".includes(tk[i] as string)) {
				tk[i - 1] = [tk[i] as string, tk[i - 1] as string, tk[i + 1] as string]
				tk.splice(i--, 2)
			}
		}
		for (let i = 0; i < tk.length; i++) {
			if (typeof tk[i] !== "string") continue
			if ("+-".includes(tk[i] as string)) {
				tk[i - 1] = [tk[i] as string, tk[i - 1] as string, tk[i + 1] as string]
				tk.splice(i--, 2)
			}
		}
		return tk
	}

	function translateVal(tk: string[]): string[] {
		let ret = (valFromTokens(tk) .flat(Infinity) as string[])
			.map(e => {
				if (e == "==") return "="
				else if (e[0] == '"') return e.slice(0, -1)
				else if (e[0].match(/[a-zA-Z_]/)) return "get global " + e
				return e
			})
		return ret
	}

	while (tokens.length > 0) {
		let tk = tokens.shift() as string
		if (tk == "global") {
			ret.push("initialize global")
			ret.push(".v" + tokens.shift())
			if (tokens.shift() != "=") error("Expected `=`")
			else ret.push(...translateVal(captureClause(tokens)))
			ret.push("_")
		} else if (tk == "if") {
			ret.push("if", ".s")
			ret.push(...translateVal(captureClause(tokens)), ".l", ".s")
			tokens.shift()
		} else if (tokens.length > 0 && tokens[0] == '=') {
			ret.push("set global " + tk)
			tokens.shift()
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
		} else {
			// console.log(":", tk, tokens[0])
		}
	}

	console.log(ret.join("\n"))
	return ret
}
parse(`
global a = "Hello,"
if (a == "Hello,") {
	a = join(a, "World!")
	if (a == "Hello,World!") {
		a = join(a, "Yeet!")
	}
}
`)

/*

initialize global
.va
10
_
initialize global
.vb
20
_
if
.s
=
get global a
10
.l
set global a
10
.l
set global a
35
.s
initialize global
88
.l
set global a
36
_
if


*/
