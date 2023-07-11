import { genTokens } from "./genTokens.ts"
import { genAST } from "./genAST.ts"
import { genIns, logIns } from "./genIns.ts"
import { genBytesNew, logBytes } from "./genBytesNew.ts"
import { loadProgram, cycle, mem } from "./run.ts"

const run = false

const code = `fn fact:(){i8 t: 64};
fact()`
// const code = `fn fact:(){i8 t: 64}`
// const code = `i16 a: 32; i8 b: 255;i16 c: 64`

const tokens = genTokens(code)
// console.log(tokens)
// Deno.exit(0)

const ast = genAST(tokens)
console.log(ast)
Deno.exit(0)

const ins = genIns(ast, true)
logIns(ins)

const bytes = genBytesNew(ins)

if (run) {
	console.log("\n\n")
	loadProgram(bytes)
	while (!cycle());
	// for (let x = 0; x < 20; x++) cycle()
	logBytes(mem)
}
