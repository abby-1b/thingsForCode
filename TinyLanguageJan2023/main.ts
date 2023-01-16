import { genTokens } from "./genTokens.ts"
import { genAST } from "./genAST.ts"

const code = "i32 a: (1 + 2) * 3 - 4;"

const tokens = genTokens(code)

const ast = genAST(tokens)

console.log(ast)
