import { ParseStates } from "./ParseStates.ts"

const SUPRESS_WARNINGS = false
const NO_BLOCKS = false

export type Tokens = [number, string][]

function indent(str: string, amount = 1): string {
	return str.split('\n').filter(e => e != '').map(e => "\t".repeat(amount) + e).join("\n")
}

function getParen(tokens: Tokens): Tokens {
	let parenTokens: Tokens = []
	let levels = 1
	while (levels > 0) {
		if (tokens.length == 0) return []
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

	constructor(parent: BlockNode | undefined) { this.parent = parent }

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
		if (to != "i32" && to != "f32") this.err(`Type ${to} not recognized.`)
		this.after += {"i32": " i32.trunc_s/f32", "f32": " f32.convert_s/i32"}[to]
	}
}

export class InsNode extends Node {
	ins = ""
	constructor(parent: BlockNode | undefined, ins: string) {
		super(parent)
		this.ins = ins
	}

	make() {
		return this.ins + this.after
	}
	takeTokens(...args: any): this { return this }
}

export class LocalGetNode extends Node {
	name = ""

	constructor(parent: BlockNode | undefined, name: string) {
		super(parent)
		this.name = name
	}

	make() {
		return `local.get $${this.name}` + this.after
	}
}

export class ConstNode extends Node {
	type = ""
	value = ""

	constructor(parent: BlockNode | undefined, type: string, value: string) {
		super(parent)
		this.type = type
		this.value = value
	}

	changeType(to: string) {
		if (to == "i32") this.value = Math.floor(parseFloat(this.value)) + ''
		this.type = to
	}

	make() { return `${this.type}.const ${this.value}` + this.after }
}

export class CallNode extends Node {
	callFn: [string, string] = ["", ""]
	paramTypes: string[] = []

	constructor(parent: BlockNode | undefined, path: string, params: string[]) {
		super(parent)
		this.callFn = ["import_fns", path.slice(1).split(".").join("_")]
		this.paramTypes = params
		if (!this.parent?.hasFn(this.callFn)) {
			this.parent?.importFn(this.callFn, this.paramTypes.join(" "))
		} else {
			let fn = this.parent?.getFn(this.callFn)
			if (fn != undefined) {
				this.parent?.stack.push(fn.returnStackVal())
			}
		}
	}

	make() { return `call $FN_${this.callFn[1]}` }
}

export class BlockNode extends Node {
	name = ""
	returnType = ""

	imports: [string[], string][] = [] // 

	locals: [string, string][] = [] // "${name} ${type}"
	cnt: Node[] = []

	stack: [string, Node][] = []

	constructor(parent: BlockNode | undefined, name: string, cnt: Node[] = []) {
		super(parent)
		this.name = name
		cnt.map(n => n.parent = this)
		this.cnt = cnt
		for (let n = 0; n < this.cnt.length; n++) {
			this.cnt[n].parent = this
		}
	}

	protected getHeader() { return `(${this.name}` }

	make() {
		if (NO_BLOCKS && this.name == "block") {
			return this.cnt.map(n => n.make()).join('\n') + this.after
		}
		return this.getHeader()
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

	takeTokens(tokens: Tokens, commasAllowed = false, takeOne = false): Node {
		if (this.name == "module" && !(this instanceof FnNode)) return this.cnt[0].takeTokens(tokens)
		let breakWhile = false
		while (tokens.length > 0) {
			if (breakWhile) break
			let token = tokens.shift() || [-1, ""]
			switch (token[0]) {
				case ParseStates.NUM:
					this.stack.push(["f32", this.cnt[ this.cnt.push(new ConstNode(this, "f32", token[1])) - 1 ]])
					if (takeOne) breakWhile = true
					break
				case ParseStates.VAR: {
					let lastNode = this.cnt[this.cnt.length - 1]
					if (lastNode instanceof InlineFnReference) {
						if (lastNode.refFn != undefined) lastNode.refFn.name = "FN_" + token[1]
						break
					}
					if (this.stack.length == 0) this.err("No values on the stack! (var)")
					// if (this.stack[this.stack.length - 1][0] != "f32")
					// 	this.stack[this.stack.length - 1][1].after += " f32.convert_s/i32"
					this.setLocal(token[1], this.stack.pop() || ["", this])
					this.cnt.push(new InsNode(this, `local.set $${token[1]}`))
				} break
				case ParseStates.NAM:
					this.stack.push(["f32", this.cnt[ this.cnt.push(new LocalGetNode(this, token[1])) - 1 ]])
					break
				case ParseStates.OPS:
					if (this.stack.length == 0) this.err("No values on the stack! (operation)")
					// i32.trunc_s/f32
					let opType = "f32"
					if ("&|".includes(token[1])) {
						opType = "i32"
						this.stack[this.stack.length - 1][1].changeType("i32")
						this.stack[this.stack.length - 2][1].changeType("i32")
					}
					this.cnt.push(new InsNode(this, opType + '.' + {
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
					this.cnt.push(new BlockNode(this, "block").takeTokens(parenTokens, true))
					let n = this.cnt[this.cnt.length - 1]
					this.stack.push([(n as BlockNode).returnType, n])
				} break
				case ParseStates.PAR_C:
					this.err("Parenthesis found, for some reason.")
					break

				case ParseStates.IF: {
					// Check stack before anything.
					let lastStack = this.stack.pop()
					if (lastStack == undefined) {
						this.err("No values on stack for if statement.")
						break
					}
					if (lastStack[0] != "i32") lastStack[1].changeType("i32")

					// Make blocks
					let ifBlock = new IfNode(this)
					let thenBlock = new BlockNode(ifBlock, "then")

					ifBlock.cnt.push(thenBlock) // Push `then` block into `if` block
					if (tokens[0][0] == ParseStates.PAR_O) {
						tokens.shift()
						thenBlock.takeTokens(getParen(tokens), false, true)
					} else {
						thenBlock.takeTokens(tokens, false, true)
					}
					ifBlock.returnType = thenBlock.returnType

					this.stack.push([ifBlock.returnType, ifBlock])
					this.cnt.push(ifBlock)
				} break
				case ParseStates.ELSE: {
					tokens.shift()
					let parenTokens = getParen(tokens)
					let lastNode = this.cnt[this.cnt.length - 1] as BlockNode
					if (lastNode.name == "if") {
						// An actual else block
						let elseBlock = new BlockNode(lastNode, "else")
						lastNode.cnt.push(elseBlock)
						elseBlock.takeTokens(parenTokens)
					} else {
						// Function declaration
						let fn = new FnNode(this, "no_fn_name", true)
						fn.takeTokens(parenTokens)
						fn.addArgs(lastNode.cnt.map(v => (v as LocalGetNode).name))
						this.cnt[this.cnt.length - 1] = new InlineFnReference(this, fn)
						this.addFn(fn)
						this.stack.pop()
					}
				} break

				case ParseStates.CALL: {
					tokens.shift()
					let parenTokens = getParen(tokens)
					let commaBlocks = tokenCommas([...parenTokens]).map(pt => new BlockNode(this, "block").takeTokens(pt)) as BlockNode[]
					this.cnt.push(...commaBlocks)
					// let v = commaBlocks.map((b): [string, BlockNode] => [b.returnType, b])
					// this.stack.push(...v)
					// console.log(this.stack)

					this.cnt.push(new CallNode(this, token[1], commaBlocks.map(b => b.returnType)))
					if (takeOne) breakWhile = true
				} break

				case ParseStates.CMA:
					if (!commasAllowed) this.err("Found comma for some reason.")
					break

				default:
					this.warn(`Token \`${token}\` not found.`)
					break
			}
		}
		this.returnType = this.stack.map(e => e[0]).join(" ")
		// console.log(this.name, this.returnType)
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
		for (let i = 0; i < this.cnt.length; i++)
			if ((this.cnt[i] as BlockNode).name == "FN_" + fnPath[1]) return true
		return false
	}

	getFn(fnPath: [string, string]): FnNode | undefined {
		if (this.name != "module") return this.parent?.getFn(fnPath)
		for (let i = 0; i < this.cnt.length; i++) {
			if ((this.cnt[i] as BlockNode).name == "FN_" + fnPath[1]) {
				// console.log(this.cnt[i])
				// console.log("returning:", this.cnt[i] as FnNode)
				return this.cnt[i] as FnNode
			}
		}
		return undefined
	}

	addFn(fn: FnNode): void {
		if (this.name != "module") return this.parent?.addFn(fn)
		this.cnt.push(fn)
	}

	returnStackVal(): [string, Node] {
		return [this.returnType, this]
	}

	changeType(t: string) {
		if (this.cnt.length == 0)
			this.cnt.push(new ConstNode(this, "f32", "0"))
		this.cnt[this.cnt.length - 1].changeType(t)
		this.returnType = t
	}
}

export class IfNode extends BlockNode {
	constructor(parent: BlockNode | undefined) {
		super(parent, "if")
	}

	make() {
		let returnTypes = this.cnt.map(e => (e as BlockNode).returnType)
		if (!returnTypes.every((a, b, c) => a == c[0]))
			this.err(`If statement returns different types: ${returnTypes.map(e => '[' + e + ']').join(", ")}`)
		this.returnType = (this.cnt[0] as BlockNode).returnType
		for (let n = 0; n < this.cnt.length; n++)
			(this.cnt[n] as BlockNode).returnType = ""
		return super.make()
	}
}

export class InlineFnReference extends Node {
	refFn: FnNode | undefined = undefined
	constructor(parent: BlockNode | undefined, refFn: FnNode) {
		super(parent)
		this.refFn = refFn
	}
}

export class FnNode extends BlockNode {
	isExported = false
	args: string[] = []

	constructor(parent: BlockNode | undefined, name: string, isExported = false) {
		super(parent, name, [])
		this.isExported = isExported
	}

	getHeader() { return `(func $${this.name}` + this.args.map(a => ` (param $${a} f32)`).join("") }

	addArgs(args: string[]) {
		this.args = args
	}
}
