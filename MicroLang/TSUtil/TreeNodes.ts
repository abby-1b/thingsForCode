import { ParseStates } from "./ParseStates.ts"

const SUPRESS_WARNINGS = false
const NO_BLOCKS = true

const restrictedFnNames = [
	"if",
	"module"
]

export type Tokens = Array<[number, string]>

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

export class BlockNode extends Node {
	isFn = false
	name = ""
	returnType = ""
	locals: Array<[string, string]> = [] // "${name} ${type}"
	cnt: Array<Node> = []

	stack: Array<[string, Node]> = []

	constructor(parent: BlockNode | undefined, name: string, cnt: Array<Node> = []) {
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
		// console.log(this.stack)
		return (this.isFn ? `(func $${this.name}` : `(${this.name}`)
			+ `${this.returnType == "" ? "" : " (result " + this.returnType + ")"}\n`
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

	takeTokens(tokens: Tokens): Node {
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
					// this.stack.pop()
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
						// console.log("Stack:", this.stack)
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
						this.takeTokens(parenTokens)
					} else {
						this.cnt.push(new BlockNode(this, "block").takeTokens(parenTokens))
						let n = this.cnt[this.cnt.length - 1]
						this.stack.push([(n as BlockNode).returnType, n])
					}
				} break
				case ParseStates.PAR_C:
					this.err("Parenthesis found for some reason.")
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

				default:
					this.warn(`Token \`${token}\` not found.`)
					break
			}
		}
		this.returnType = (this.stack.pop() || [""])[0]
		return this
	}
}

export class FnNode extends BlockNode {
	constructor(parent: BlockNode | undefined, name: string, cnt: Array<Node> = []) {
		super(parent, name, cnt)
		if (restrictedFnNames.includes(name))
			this.err(`A function can't be named \`${name}\``)
	}
	isFn = true
}
