enum INS {
	SET_VAR = "SET_VAR",
	GET_VAR = "GET_VAR",
	NUM = "NUM",
	STOP = "STOP",
	IF = "IF",
	ELSE = "ELSE",
	BLK_START = "BLK_START",
	BLK_END = "BLK_END",
	M_BOOL = "M_BOOL",
	INC = "INC",
	DEC = "DEC",

	WHAT = 999
}
interface Ins {
	num: number | string,
	name?: string,
	val?: Ins[],
	code?: Ins[],
}

function getClause(tokens: string[], remove: number, otherVars: string[] = []): Ins[] {
	for (let i = 0; i < remove; i++) tokens.shift()
	const root: Ins[] = [], spaceFn: INS[] = [], vars: string[] = [...otherVars]
	while (tokens.length > 0) {
		if (tokens[0] == "$") { vars.push(tokens[1]), root.push({ num: INS.SET_VAR, name: tokens[1], val: getClause(tokens, 3, vars) }) }
		else if (tokens[0] == " ") { if (spaceFn.length == 0) { tokens.shift(); break } root.push({ num: spaceFn.pop()! }), tokens.shift() }
		else if ("0123456789".includes(tokens[0][0])) { root.push({ num: INS.NUM, name: tokens.shift() }) }
		else if (tokens[0] == "?") { root.push({ num: INS.IF, val: getClause(tokens, 1, vars), code: getClause(tokens, 0, vars) }), spaceFn.push(INS.BLK_END, INS.BLK_START) }
		else if (tokens[0] == ":") { tokens.shift(); root.push((tokens[0] as string) == " " ? { num: INS.ELSE, code: getClause(tokens, 1, vars) } : { num: INS.ELSE, val: getClause(tokens, 0, vars), code: getClause(tokens, 0, vars) }); spaceFn.push(INS.BLK_END) }
		else if (vars.includes(tokens[0])) { root.push({ num: INS.GET_VAR, name: tokens.shift() }) }
		else if (["=", "!="].includes(tokens[0])) { root.push({ num: INS.M_BOOL, name: tokens.shift() }) }
		else if (tokens[0] == "++" || tokens[0] == "--") { root.push({ num: tokens[0] == "++" ? INS.INC : INS.DEC, val: getClause(tokens, 1, vars) }) }
		else { root.push({ num: INS.WHAT, name: tokens.shift() }) }
	}
	return root
}

function parse(code: string) {
	const tokens: string[] = []
	const whitespace = " \t", symbols = "$()[]{}?;:+-|&*/=<>\n" //, repeats = ["==", "!=", ">=", "<=", "++", "--"]
	let curr = "", currType = -1
	for (let i = 0, thisType; thisType = whitespace.includes(code[i]) ? 0 : symbols.includes(code[i]) ? 2 : 1, i < code.length; i++) {
		if (thisType == 0 || thisType != currType) {
			if (curr.length != 0) tokens.push(curr); curr = code[i], currType = thisType
		} else curr += code[i]
	}

	const root: Ins[] = getClause(tokens, 0)
	return root
}

function toJS(ins: Ins[], indent = false, separator = "\n"): string {
	return (indent ? "    " : "") + ins.map(i => {
		if (i.num == INS.SET_VAR) return `let ${i.name!} = ${toJS(i.val!)}`
		else if ([INS.NUM, INS.GET_VAR].includes(i.num as INS)) return i.name!
		else if (i.num == INS.M_BOOL) return {"=": "==", "!=": "!="}[i.name!]
		else if (i.num == INS.IF) return `if (${toJS(i.val!, false, " ")}) {\n${toJS(i.code!, true)}\n}`
		else if (i.num == INS.ELSE) return `else${i.val ? " if (" + toJS(i.val!, false, " ")+ ")" : ""} {\n${toJS(i.code!, true)}\n}`
		else if (i.num == INS.INC || i.num == INS.DEC) return `(${toJS(i.val!, false, "")})${i.num == INS.INC ? "++" : "--"}`
		else console.log(i)
	}).join(separator + (indent ? "    " : ""))
}

console.log(toJS(parse(`$i=0 ?i=0 ++i  :i=1 --i  |i`)))
