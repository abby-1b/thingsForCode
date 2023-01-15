import { genTokens } from "./genTokens.ts"
import { genAST } from "./genAST.ts"

const code = "i32 a: 10"

const tokens = genTokens(code)

const ast = genAST(tokens)


