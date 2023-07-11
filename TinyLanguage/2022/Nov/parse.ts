enum STATE {
	NONE,
	VAR,
	VAR_VAL,
}

enum PreOpCode {
	NEW_VAR,
}

const TYPES = [ "i32", "f32", "i64", "f64" ]
function parse(txt: string) {
	const opCodes: PreOpCode[] = []
	const varNames: [string, number][] = [] // Name, Type (index)
	let i = -1, state: STATE = STATE.NONE, curr = ""
	while (++i < txt.length) {
		if (txt[i] == "#") { while (txt[++i] != '\n') ""; continue }
		if (" \n,;".includes(txt[i])) {
			if (curr.length == 0) continue
			else if (state == STATE.VAR)
				state = STATE.VAR_VAL,
				varNames.includes(curr) ? 0 : varNames.push(curr),
				opCodes.push(varNames.indexOf(curr))
			else if (state == STATE.VAR_VAL)
				state = STATE.NONE
			else if (TYPES.includes(curr))
				state = STATE.VAR, opCodes.push(PreOpCode.NEW_VAR, TYPES.indexOf(curr))
			continue
		}
		curr += txt[i]
		console.log(STATE[state])
	}
}

parse(Deno.readTextFileSync("lang.txt"))
