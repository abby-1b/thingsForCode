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
		} else if ("[](){}.,".includes(str[0])) {
			if (c != "") tokens.push(c)
			tokens.push(str[0])
			c = ""
		} else {
			c += str[0]
		}
		str = str.slice(1)
	}
	
}

parse(`
var a = 10
if (true) {
	a = 20
}
`)
