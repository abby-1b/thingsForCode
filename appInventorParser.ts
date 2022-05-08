
function error(reason: string) {
	console.log("!!!", reason)
}

let nodeNum = 0
function addNode(name: string, args: string[] = []): number {
	console.log(" :", name, args)
	return nodeNum++
}

function sAttach(n1: number, n2: number): number {
	console.log(" ><", n1, n2)
	return nodeNum++
}

function removeNest(tks: string[]) {
	let n = 1
	tks.shift()
	while (n != 0) {
		if (tks.length == 0) break
		const t = tks.shift() ?? ""
		if ("({[".includes(t)) n++
		else if (")}]".includes(t)) n--
	}
}

function untilSemi(tks: string[]): string[] {
	let r = []
	while (tks[0] != ';') r.push(tks.shift() as string)
	return r
}

const fns: {[key: string]: Function} = {
	"console": (tks: string[]) => {
		if (tks[0] != ".") return
		tks.splice(0, 2)
		removeNest(tks)
	},
	"var": (tks: string[]) => {
		console.log(tks)
		let n1 = addNode("initialize global", [tks.shift() as string])
		if (tks.shift() != "=") error("`=` not found after var declaration.")
		let n2: number = -1
		let val = untilSemi(tks)
		console.log(val)
		sAttach(n1, n2)
	}
}

// TODO: escape strings!
function parse(str: string) {
	const tokens = []
	let c = ""
	let inStr = false
	while (str.length > 0) {
		if (str[0] == '"') {
			inStr = !inStr
			if (!inStr) {
				tokens.push(`"${c}"`)
				c = ""
			}
		} else if (inStr) {
			c += str[0]
		} else if (" \t\n".includes(str[0])) {
			if (c != "") tokens.push(c)
			c = ""
		} else if ("[](){}.,;".includes(str[0])) {
			if (c != "") tokens.push(c)
			tokens.push(str[0])
			c = ""
		} else {
			c += str[0]
		}
		str = str.slice(1)
	}

	while (tokens.length > 0) {
		if (tokens[0] in fns) fns[tokens.shift() as string](tokens)
		else tokens.shift()
	}
}

parse(`
console.log(10);
var a = 10;
if (true) {
	a = 20;
}
`)
