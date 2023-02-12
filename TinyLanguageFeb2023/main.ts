
type ValueType = "NUM" | "CHR" | "STR" | "ARR"

interface Value { type: ValueType }
interface ValueNUM extends Value { num: number }
interface ValueCHR extends Value { chr: number }
interface ValueSTR extends Value { str: string }
interface ValueARR extends Value { arr: Value[] }

const enum TokenType {
	NUL = -1,
	NUM,
	OPR,
}

const stack: Value[] = []
function run(program: string) {
	// TODO: actually implement the thing.
}

// 2 / (5 + 2)
run("2 5 2+/")
console.log(stack)
