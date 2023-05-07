
// let a: u32 = 0
// if (a == 0) {
// 	a = a + 5
// }
const c = `
let v: u8 = (14 - 2) * 3
a = 0
fn test(a: u8, b: u8): u8 {
	return a + b
}
test(v, 2)
`

const enum TokenTypes {
	IDENTIFIER,
	KEYWORD,
	SYMBOL,
	NUMBER,
	STRING,
}
type Token = [string, number]
const symbols = new Set(";().,+-*/{}=:[]<>")
const keyWords = new Set(["let", "if", "fn", "return"])
function tokenize(code: string) {
	const tokens: Token[] = []
	let curr = ""
	function endToken(type = TokenTypes.IDENTIFIER) {
		if (curr.length == 0) return
		tokens.push([curr, type == TokenTypes.IDENTIFIER && keyWords.has(curr) ? TokenTypes.KEYWORD : type]), curr = ""
	}

	for (let i = 0; i < code.length; i++) {
		const c = code[i]
		if (c == ' ' || c == '\n' || c == '\t')
			endToken()
		else if (c >= '0' && c <= '9' && curr.length > 0)
			curr += c
		else if ((c >= '0' && c <= '9') || c == '.') {
			endToken()
			while ((code[i] >= '0' && code[i] <= '9') || code[i] == '.')
				curr += code[i++]
			i--
			endToken(curr == "." ? TokenTypes.SYMBOL : TokenTypes.NUMBER)
		} else if (c == '"') {
			while (code[++i] != '"')
				curr += code[i]
			endToken(TokenTypes.STRING)
		} else if (symbols.has(c))
			endToken(), curr = c, endToken(TokenTypes.SYMBOL)
		else
			curr += c
	}
	return tokens
}

interface Branch {
	i: string,
	type: DType,
	children?: Branch[],
	[key: string]: any
}

type DType = [string, DType[]?] // Type name, type options
type Decl = [string, DType] // Declaration name, type
const VOID: DType = [ "void" ]
const operatorOrder: Set<string>[] = [
	["."],
	["("],
	["*", "/"],
	["+", "-"]
].map(a => new Set(a))
function treeify(tokens: Token[], outerScope: Decl[], single = false, containerType = "CNT", singleContainer = false): Branch {
	const curr: Branch = { i: containerType, children: [], type: VOID }
	const scope: Decl[] = [...outerScope]
	let s: Token | undefined = undefined
	let hasOperator = false
	while (tokens.length > 0) {
		if (
			single && curr.children!.length > 0 && tokens[0][1] != TokenTypes.SYMBOL
			&& (!s || s[1] != TokenTypes.SYMBOL)
		) break // Break if single (with no operator)
		if (single && tokens[0][0] == ",")
			break // Break if a comma is found in a single capture
		if (tokens[0][0] == ")" && containerType != "CNT_(") break
		if (tokens[0][0] == "]" && containerType != "CNT_[") break
		if (tokens[0][0] == "}" && containerType != "CNT_{") break
		s = tokens.shift()!
		if (s[1] == TokenTypes.KEYWORD) {
			if (s[0] == "let") {
				const name = tokens.shift()![0]
				const type: DType = tokens.shift()![0] == ':' ? getType(tokens) : ["i32"]
				scope.push([name, type])
				if (tokens.shift()![0] != "=")
					throw "Expected `=`"
				const value = treeify(tokens, scope, true)
				curr.children!.push({
					i: "LET",
					name,
					type,
					value
				})
			} else if (s[0] == "fn") {
				const name = tokens.shift()![0]
				// TODO: take arguments properly
				const args: Decl[] = []
				tokens.shift()
				while (tokens[0][0] != ")") {
					const n = tokens.shift()![0]
					const t = getType(tokens)
					args.push([n, t])
					if (tokens[0][0] == ",") tokens.shift()
				}
				tokens.shift()
				// const args = treeify(tokens, scope, true, "ARGS", true).children![0].children
				const type: DType = tokens[0][0] as unknown == ":" ? getType(tokens) : [ "nil" ]
				scope.push([name, ["fn", [type]]])
				const body = treeify(tokens, [...scope, ...args], true, "CNT", true)
				curr.children!.push({
					i: "FNC",
					name,
					args,
					type,
					body,
				})
			} else if (s[0] == "if") {
				// TODO: if
			} else if (s[0] == "return") {
				const value = treeify(tokens, scope, true)
				if (value.type != VOID)
					curr.type = value.type
				curr.children!.push({
					i: "RET",
					value,
					type: value.type
				})
				// if (!curr.retType)
			} else {
				throw "Unknown keyword: " + s[0]
			}
		} else if (s[1] == TokenTypes.NUMBER) {
			curr.children!.push({
				i: "NUM",
				value: s[0],
				type: getNumType(s[0])
			})
		} else if (s[1] == TokenTypes.SYMBOL) {
			if (s[0] == "(" || s[0] == "{" || s[0] == "[") {
				hasOperator = true
				curr.children!.push(treeify(tokens, scope, false, "CNT_" + s[0]))
				if (single && singleContainer) break
			} else if (s[0] == ")" || s[0] == "}" || s[0] == "]") {
				break
			} else {
				curr.children!.push({
					i: "OPR",
					value: s[0],
					type: VOID
				})
				hasOperator = true
			}
		} else if (inScope(scope, s[0])) { // Check if in scope!
			curr.children!.push({
				i: "VAR",
				name: s[0],
				type: inScope(scope, s[0])!
			})
		} else {
			console.log("What?", single, s)
		}
	}
	if (hasOperator) {
		// Go through operators
		for (let o = 0; o < operatorOrder.length; o++) {
			const co = operatorOrder[o]
			for (let i = 0; i < curr.children!.length; i++) {
				// Process calls ("CNT_(" operators!)
				if (curr.children![i].i == "CNT_(" && co.has("(") // Check if it's a parenthesis
					&& i > 0 && (curr.children![i - 1].i == "VAR" // Check if the one before is a var
					|| (curr.children![i - 1].i == "OPR" // OR, check if its a `.` acces inside a var
						&& curr.children![i - 1].value == "."
					))) {
					// It's a call!
					if (curr.children![i - 1].type[0] != "fn")
						throw `Expected type \`fn<...>\`, got \`${typeToStr(curr.children![i - 1].type)}\``
					curr.children![i - 1] = {
						i: "CALL",
						to: curr.children![i - 1],
						using: curr.children!.splice(i, 1)[0].children,
						type: curr.children![i - 1].type[1]![0]
					}
					continue
				}
				// Process "OPR" operators
				if (curr.children![i].i != "OPR" || !co.has(curr.children![i].value)) continue
				const a = curr.children!.splice(i - 1, 1)[0]
					, b = curr.children!.splice(i--, 1)[0]
				curr.children![i].a = a, curr.children![i].b = b
				curr.children![i].type = a.type // TODO: Figure out real type
			}
		}
		// Remove commas, as they're only used as separators.
		for (let i = curr.children!.length - 1; i >= 0; i--)
			if (curr.children![i].i == "OPR" && curr.children![i].value == ",")
				curr.children!.splice(i, 1)
	}
	console.log(curr.children, tokens)
	curr.type = curr.children![curr.children!.length - 1].type
	return curr
}
function getType(tokens: Token[]): DType {
	if (tokens[0][0] == ":") tokens.shift()
	const currType = tokens.shift()![0]
	if (tokens.length > 0 && tokens[0][0] == "<") {
		const extras: DType[] = []
		while (tokens[0][0] == "<" || tokens[0][0] == ",")
			tokens.shift(), extras.push(getType(tokens))
		if ((tokens[0][0] as string) == ">") tokens.shift()
		return [currType, extras]
	}
	return [currType]
}
function getNumType(num: string): DType {
	// TODO: implement number typing
	return [ "u8" ]
}
function inScope(scope: Decl[], name: string): DType | undefined {
	for (let i = 0; i < scope.length; i++)
		if (scope[i][0] == name)
			return scope[i][1]
}
function typeToStr(type: DType): string {
	let ret = type[0]
	if (type[1] && type[1].length > 0) {
		ret += "<"
		type[1].map(typeToStr).join(",")
		ret += ">"
	}
	return ret
}

const tokens = tokenize(c)
// console.log(tokens)
const tree = treeify(tokens, [])
console.log(Deno.inspect(tree, {
	colors: true,
	compact: true,
	depth: 12
}))
// console.log(tree)

