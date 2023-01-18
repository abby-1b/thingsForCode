import { genTokens } from "./genTokens.ts"
import { genAST } from "./genAST.ts"
import { genBytes } from "./genBytes.ts"

const code = "i8 a: 5; i8 b: a"

const tokens = genTokens(code)

const ast = genAST(tokens)

const bytes = genBytes(ast, 0)

// console.log(bytes)
