import { genTokens } from "./genTokens.ts"
import { genAST } from "./genAST.ts"
import { genIns, logIns } from "./genIns.ts"
import { genBytesNew, logBytes } from "./genBytesNew.ts"
// import { genBytes, logBytes } from "./genBytes.ts"
import { loadProgram, cycle, mem } from "./run.ts"

const code = "i16 a: 32; i16 b: a + 5"

const tokens = genTokens(code)

const ast = genAST(tokens)

console.log(ast)

const ins = genIns(ast)
// logIns(ins)

const bytes = genBytesNew(ins)


// console.log("\n\n")
loadProgram(bytes)
while (!cycle());
// for (let x = 0; x < 20; x++) cycle()
logBytes(mem)


// console.log(bytes)
