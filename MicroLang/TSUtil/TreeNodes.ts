import { ParseStates } from "./ParseStates.ts"

const SUPRESS_WARNINGS = false
const NO_BLOCKS = true

const restrictedFnNames = [
	"if",
	"module"
]

export type Tokens = [number, string][]

function indent(str: string, amount = 1): string {
	return str.split('\n').filter(e => e != '').map(e => "  ".repeat(amount) + e).join("\n")
}

function getParen(tokens: Tokens): Tokens {
	let parenTokens: Tokens = []
	let levels = 1
	while (levels > 0) {
		if (tokens.length == 0) {
			return []
		}
		let t = tokens.shift() || [0, ""]
		if (t[0] == ParseStates.PAR_O) levels++
		if (t[0] == ParseStates.PAR_C) levels--
		parenTokens.push(t)
	}
	parenTokens.pop()
	return parenTokens
}

function tokenCommas(tokens: Tokens): Tokens[] {
	let splitTokens: Tokens[] = []
	let commaTokens: Tokens = []
	let level = 0
	while (tokens.length > 0) {
		let t = tokens.shift() || [0, ""]
		if (t[0] == ParseStates.CMA && level == 0) {
			splitTokens.push([...commaTokens])
			commaTokens = []
			continue
		}
		if (t[0] == ParseStates.PAR_O) level++
		if (t[0] == ParseStates.PAR_C) level--
		commaTokens.push(t)
	}
	splitTokens.push(commaTokens)
	return splitTokens
}

class Node {
	parent: BlockNode | undefined

	after = ""

	make() { return "" }
	takeTokens(tokens: Tokens): Node { return this }

	err(why: string) {
		console.log("ERROR:", why)
		Deno.exit(1)
	}

	warn(why: string) {
		if (!SUPRESS_WARNINGS) console.log("WARNING:", why)
	}

	changeType(to: string) {
		if (to == "i32") this.after += " i32.trunc_s/f32"
		else if (to == "f32") this.after += " f32.convert_s/i32"
		else this.err(`Type ${to} not recognized.`)
	}
}

export class InsNode extends Node {
	ins = ""
	constructor(ins: string) {
		super()
		this.ins = ins
	}

	make() {
		return this.ins + this.after
	}
	takeTokens(...args: any): this { return this }
}

export class ConstNode extends Node {
	type = ""
	value = ""

	constructor(type: string, value: string) {
		super()
		this.type = type
		this.value = value
	}

	changeType(to: string) {
		if (to == "i32") this.value = Math.floor(parseFloat(this.value)) + ''
		this.type = to
	}

	make() {
		return `${this.type}.const ${this.value}` + this.after
	}
}

export class BlockNode extends Node {
	isFn = false
	name = ""
	returnType = ""

	imports: [string[], string][] = [] // 

	locals: [string, string][] = [] // "${name} ${type}"
	cnt: Node[] = []

	stack: [string, Node][] = []

	constructor(parent: BlockNode | undefined, name: string, cnt: Node[] = []) {
		super()
		this.parent = parent
		this.name = name
		cnt.map(n => n.parent = this)
		this.cnt = cnt
		for (let n = 0; n < this.cnt.length; n++) {
			this.cnt[n].parent = this
		}
	}

	make() {
		if (this.name == "if") {
			let returnTypes = this.cnt.map(e => (e as BlockNode).returnType)
			if (!returnTypes.every((a, b, c) => a == c[0]))
				this.err(`If statement returns different types: ${returnTypes.map(e => '[' + e + ']').join(", ")}`)
			this.returnType = (this.cnt[0] as BlockNode).returnType
			for (let n = 0; n < this.cnt.length; n++)
				(this.cnt[n] as BlockNode).returnType = ""
		}
		return (this.isFn ? `(func $${this.name}` : `(${this.name}`)
			+ `${this.returnType == "" ? "" : " (result " + this.returnType + ")"}\n`
			+ indent(this.imports.map(i => `(import ${i[0].map(e => '"' + e + '"').join(' ')} (func $FN_${i[0][1]} (param ${i[1]})))`).join('\n')) + (this.imports.length == 0 ? "" : "\n")
			+ indent(this.locals.map(l => `(local $${l[0]} ${l[1]})`).join('\n')) + (this.locals.length == 0 ? "" : "\n")
			+ indent(this.cnt.map(n => n.make()).join('\n'))
			+ '\n)' + this.after
	}

	setLocal(name: string, sVal: [string, Node]): void {
		if (!(this instanceof FnNode))
			return this.parent?.setLocal(name, sVal)
		let idx = this.locals.map(l => l[0]).indexOf(name)
		if (idx != -1 && this.locals[idx][1] != sVal[0]) {
			this.warn(`Variable \`${name}\` is changed from [${sVal[0]}] to [${this.locals[idx][1]}]`)
			sVal[1].changeType(this.locals[idx][1])
		} else if (idx == -1) {
			this.locals.push([name, sVal[0]])
		}
	}

	takeTokens(tokens: Tokens, commasAllowed = false): Node {
		if (this.name == "module" && !(this instanceof FnNode)) return this.cnt[0].takeTokens(tokens)
		while (tokens.length > 0) {
			let token = tokens.shift() || [-1, ""]
			switch (token[0]) {
				case ParseStates.NUM:
					this.stack.push(["f32", this.cnt[ this.cnt.push(new ConstNode("f32", token[1])) - 1 ]])
					break
				case ParseStates.VAR:
					if (this.stack.length == 0) this.err("No values on the stack!")
					// if (this.stack[this.stack.length - 1][0] != "f32")
					// 	this.stack[this.stack.length - 1][1].after += " f32.convert_s/i32"
					this.setLocal(token[1], this.stack.pop() || ["", this])
					this.cnt.push(new InsNode(`local.set $${token[1]}`))
					break
				case ParseStates.NAM:
					this.stack.push(["f32", this.cnt[ this.cnt.push(new InsNode(`local.get $${token[1]}`)) - 1 ]])
					break
				case ParseStates.OPS:
					if (this.stack.length == 0) this.err("No values on the stack!")
					// i32.trunc_s/f32
					let opType = "f32"
					if ("&|".includes(token[1])) {
						opType = "i32"
						this.stack[this.stack.length - 1][1].changeType("i32")
						this.stack[this.stack.length - 2][1].changeType("i32")
					}
					this.cnt.push(new InsNode(opType + '.' + {
						"+": "add", "-": "sub",
						"*": "mul", "/": "div_u",
						"=": "eq" , "!": "eqz",
						"~": "ne" , "%": "rem_s",
						"&": "and", "|": "or"
					}[token[1]]))
					if ("=".includes(token[1])) opType = "i32"
					this.stack.pop()
					this.stack.pop()
					this.stack.push([opType, this.cnt[this.cnt.length - 1]])
					break
				case ParseStates.PAR_O: {
					let parenTokens = getParen(tokens)
					if (NO_BLOCKS) {
						this.takeTokens(parenTokens, true)
					} else {
						this.cnt.push(new BlockNode(this, "block").takeTokens(parenTokens))
						let n = this.cnt[this.cnt.length - 1]
						this.stack.push([(n as BlockNode).returnType, n])
					}
				} break
				case ParseStates.PAR_C:
					this.err("Parenthesis found, for some reason.")
					break

				case ParseStates.IF: {
					tokens.shift()
					let parenTokens = getParen(tokens)
					let ifBlock = new BlockNode(this, "if")
					let thenBlock = new BlockNode(ifBlock, "then")
					ifBlock.cnt.push(thenBlock)
					thenBlock.takeTokens(parenTokens)
					ifBlock.returnType = thenBlock.returnType
					this.stack.push([ifBlock.returnType, ifBlock])
					this.cnt.push(ifBlock)
				} break
				case ParseStates.CALL: {
					tokens.shift()
					let parenTokens = getParen(tokens)
					let commaBlocks = tokenCommas([...parenTokens]).map(pt => new BlockNode(this, "block").takeTokens(pt)) as BlockNode[]
					if (NO_BLOCKS) {
						this.cnt.push(...(new BlockNode(undefined, "block").takeTokens(parenTokens, true) as BlockNode).cnt)
					} else {
						this.cnt.push(...commaBlocks)
						// let v = commaBlocks.map((b): [string, BlockNode] => [b.returnType, b])
						// this.stack.push(...v)
						// console.log(this.stack)
					}

					this.cnt.push(new CallNode(this, token[1], commaBlocks.map(b => b.returnType)))
				} break
				case ParseStates.ELSE: {
					tokens.shift()
					let parenTokens = getParen(tokens)
					let lastNode = this.cnt[this.cnt.length - 1] as BlockNode
					if (lastNode.name != "if") {
						this.err("Found `:` (else) after non-if node.")
					}
					let elseBlock = new BlockNode(lastNode, "else")
					lastNode.cnt.push(elseBlock)
					elseBlock.takeTokens(parenTokens)
				} break

				case ParseStates.CMA:
					if (!commasAllowed) this.err("Found comma for some reason.")
					break

				default:
					this.warn(`Token \`${token}\` not found.`)
					break
			}
		}
		// console.log(this.name, this.stack.map(e => e[0]))
		this.returnType = this.stack.map(e => e[0]).join(" ")
		return this
	}

	importFn(fnPath: [string, string], fnParams: string): void {
		if (this.name != "module") return this.parent?.importFn(fnPath, fnParams)
		this.imports.push([fnPath, fnParams])
	}

	hasFn(fnPath: [string, string]): boolean {
		if (this.name != "module") return this.parent?.hasFn(fnPath) || false
		for (let i = 0; i < this.imports.length; i++)
			if (this.imports[i][0][0] == fnPath[0] && this.imports[i][0][1] == fnPath[1])
				return true
		return false
	}
}

export class CallNode extends BlockNode {
	callFn: [string, string] = ["", ""]
	paramTypes: string[] = []
	constructor(parent: BlockNode | undefined, path: string, params: string[]) {
		super(parent, "call")
		this.callFn = ["import_fns", path.slice(1).split(".").join("_")]
		this.paramTypes = params
		if (!this.hasFn(this.callFn))
			this.importFn(this.callFn, this.paramTypes.join(" "))
	}

	make() {
		return `call $FN_${this.callFn[1]}`
	}
}

export class FnNode extends BlockNode {
	constructor(parent: BlockNode | undefined, name: string, cnt: Node[] = []) {
		super(parent, name, cnt)
		if (restrictedFnNames.includes(name))
			this.err(`A function can't be named \`${name}\``)
	}
	isFn = true
}
