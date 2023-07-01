import { logError } from "./errors.ts"
import { HalfToken, Token, TokenTypes } from "./tokenizer.ts"

export interface Branch {
	tokens: (Token | HalfToken)[]
	
	/** The type of branch this is */
	i: string,

	/** The type it returns */
	type: DeclType,

	/** Its children */
	children?: Branch[],

	[key: string]: any
}

export type DeclType = [string, DeclType[]?] // Type name, type options
type Decl = [string, DeclType] // Declaration name, type
const DECL_VOID: DeclType = [ "void" ]
const DECL_UNSET: DeclType = [ "unset" ]
const operatorOrder: Set<string>[] = [
	["."],
	["("],
	["*", "/"],
	["+", "-"]
].map(a => new Set(a))

export function treeify(tokens: Token[], outerScope: Decl[], single = false, containerType = "CNT", singleContainer = false): Branch {
	const curr: Branch = { tokens: [], i: containerType, children: [], type: DECL_VOID }
	const scope: Decl[] = [...outerScope]
	let s: Token | undefined = undefined
	let hasOperator = false
	while (tokens.length > 0) {
		if (
			single && curr.children!.length > 0 && tokens[0].type != TokenTypes.SYMBOL
			&& (!s || s.type != TokenTypes.SYMBOL)
		) break // Break if single (with no operator)
		if (single && tokens[0].t == ",")
			break // Break if a comma is found in a single capture
		if (tokens[0].t == ")" && containerType != "CNT_(") break
		if (tokens[0].t == "]" && containerType != "CNT_[") break
		if (tokens[0].t == "}" && containerType != "CNT_{") break
		s = tokens.shift()!
		if (s.type == TokenTypes.KEYWORD) {
			if (s.t == "let") {
				const name = tokens.shift()!.t
				let type: DeclType = tokens[0].t == ':' ? getType(tokens) : ["unset"]
				scope.push([name, type])
				const eq = tokens.shift()!
				if (eq.t != "=")
					logError(eq, `Expected \`=\`, found \`${eq.t}\``)
				const value = treeify(tokens, scope, true)
				if (typesAreEqual(type, DECL_UNSET)) {
					type = [...value.type] // copy it!
				} else if (!typesAreEqual(type, value.type)) {
					logError(eq, `Expected \`${typeToStr(type)}\`, found \`${typeToStr(value.type)}\``)
				}
				curr.children!.push({
					tokens: [ s ],
					i: "LET",
					name,
					type,
					value
				})
			} else if (s.t == "fn") {
				const name = tokens.shift()!.t
				// TODO: take arguments properly
				const args: Decl[] = []
				tokens.shift()
				while (tokens[0].t != ")") {
					const n = tokens.shift()!.t
					const t = getType(tokens)
					args.push([n, t])
					if (tokens[0].t == ",") tokens.shift()
				}
				tokens.shift()
				// const args = treeify(tokens, scope, true, "ARGS", true).children![0].children
				const type: DeclType = (tokens[0].t as unknown) == ":" ? getType(tokens) : [ "nil" ]
				scope.push([name, ["fn", [type]]])
				const body = treeify(tokens, [...scope, ...args], true, "CNT", true)
				curr.children!.push({
					tokens: [ s ],
					i: "FNC",
					name,
					args,
					type,
					body,
				})
			} else if (s.t == "if") {
				// TODO: if
			} else if (s.t == "return") {
				const value = treeify(tokens, scope, true)
				if (value.type != DECL_VOID)
					curr.type = value.type
				curr.children!.push({
					tokens: [ s ],
					i: "RET",
					value,
					type: value.type
				})
				// if (!curr.retType)
			} else {
				throw "Unknown keyword: " + s.t
			}
		} else if (s.type == TokenTypes.NUMBER) {
			curr.children!.push({
				tokens: [ s ],
				i: "NUM",
				value: s.t,
				type: getNumType(s.t)
			})
		} else if (s.type == TokenTypes.SYMBOL) {
			if (s.t == "(" || s.t == "{" || s.t == "[") {
				hasOperator = true
				curr.children!.push(treeify(tokens, scope, false, "CNT_" + s.t))
				if (single && singleContainer) break
			} else if (s.t == ")" || s.t == "}" || s.t == "]") {
				break
			} else {
				curr.children!.push({
					tokens: [ s ],
					i: "OPR",
					value: s.t,
					type: DECL_VOID
				})
				hasOperator = true
			}
		} else if (inScope(scope, s.t)) { // Check if in scope!
			curr.children!.push({
				tokens: [ s ],
				i: "VAR",
				name: s.t,
				type: inScope(scope, s.t)!
			})
		} else {
			logError(s, "Token not recognized")
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
						tokens: curr.children![i - 1].tokens,
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
		for (const c of curr.children! ?? []) {
			if (c.i == "OPR" && !c.a) {
				logError(c.tokens[0], `Unexpected operator: \`${c.value}\``)
			}
		}
		// Remove commas, as they're only used as separators.
		for (let i = curr.children!.length - 1; i >= 0; i--)
			if (curr.children![i].i == "OPR" && curr.children![i].value == ",")
				curr.children!.splice(i, 1)
	}
	// console.log(curr.children, tokens)
	curr.type = curr.children![curr.children!.length - 1].type
	return curr
}

/** Check if two types are equal */
export function typesAreEqual(typeA: DeclType, typeB: DeclType): boolean {
	// Simple types
	if (typeA[0] != typeB[0]) return false
	if (typeA.length != typeB.length) return false
	if (typeA.length == 1) return true

	// Compound types
	if (typeA.length == 2 && typeA[1]!.length != typeB[1]!.length) return false
	for (let i = 0; i < typeA.length; i++)
		if (!typesAreEqual(typeA[1]![i], typeB[1]![i])) return false
	return true
}

function getType(tokens: Token[]): DeclType {
	if (tokens[0].t == ":") tokens.shift()
	const currType = tokens.shift()!.t
	if (tokens.length > 0 && tokens[0].t == "<") {
		const extras: DeclType[] = []
		while (tokens[0].t == "<" || tokens[0].t == ",")
			tokens.shift(), extras.push(getType(tokens))
		if ((tokens[0].t as string) == ">") tokens.shift()
		return [currType, extras]
	}
	return [currType]
}

function getNumType(_num: string): DeclType {
	// TODO: implement number typing
	// keep in mind that the default integer type is i32 and the default float is f32
	return [ "u32" ]
}

function inScope(scope: Decl[], name: string): DeclType | undefined {
	for (let i = 0; i < scope.length; i++)
		if (scope[i][0] == name)
			return scope[i][1]
}

function typeToStr(type: DeclType): string {
	let ret = type[0]
	if (type[1] && type[1].length > 0) {
		ret += "<"
		type[1].map(typeToStr).join(",")
		ret += ">"
	}
	return ret
}
