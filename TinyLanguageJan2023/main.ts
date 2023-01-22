import { genTokens } from "./genTokens.ts"
import { genAST } from "./genAST.ts"
import { genIns } from "./genIns.ts"
// import { genBytes, logBytes } from "./genBytes.ts"
// import { loadProgram, cycle, mem } from "./run.ts"

const code = "i16 a: 5 + 3"

const tokens = genTokens(code)

const ast = genAST(tokens)

const ins = genIns(ast)
console.log(ins)

// const bytes = genBytes(ast, 0)


// console.log("\n\n")
// loadProgram(bytes)
// while (!cycle());
// logBytes(mem)


// console.log(bytes)
