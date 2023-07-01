import { Token, TokenTypes } from "./tokenizer.ts"

type Type = [ string, Type[]? ]
const BaseTypes: Record<string, Type> = {
	VOID: [ "void" ],
	UNSET: [ "unset" ],
	I32: [ "i32" ]
}

interface TreeNode {
	/** The tokens this TreeNode was made from */
	tokens: Token[]

	/** The type of node this is */
	nodeType: string,

	/** The type it returns/contains */
	type: Type,

	/** Its children */
	children?: TreeNode[]

	[key: string]: any
}
interface TreeNodeScaffolding {
	nodeType: string | ScaffoldingFunction,
	type: Type | ScaffoldingFunction,
	children?: (TreeNode | ScaffoldingFunction)[] | ScaffoldingFunction,
	[key: string]: any
}

const extraTokenTypes = {
	closingBracket: [ ")", "]", "}" ],
	operators: [ "+", "-", "*", "/", "%", "." ]
}

type Directive<T> = {
	/** The tokens that this directive will match */
	match: {
		t?: string,
		type?: TokenTypes,
		extra?: keyof typeof extraTokenTypes,
		notExtra?: keyof typeof extraTokenTypes,
		dontConsume?: true
	}[]

	/**
	 * If, upon matching this directive, there should be no output, and the
	 * treeifier will exit from its current scope. "consume" takes up the
	 * tokens it matches, "ignore" will exit without consuming them. 
	 */
	stop?: "consume" | "ignore"

	/** Functions to be ran before generating the ouput. */
	do?: ScaffoldingFunctionBase[]
	/** The output object, as scaffolding (a.k.a. with inline functions) */
	out?: T
}
type ScaffoldingFunctionBase = { fn: string, args?: string[] }
type ScaffoldingFunction = ScaffoldingFunctionBase & { scaffolding: true }

/**
 * The array of directives.
 */
const directives: Directive<TreeNodeScaffolding>[] = [
	{ match: [{ extra: "closingBracket" }], stop: "ignore" }, // )
	{
		match: [{ t: "," }],
		stop: "consume"
	},
	{
		match: [{ extra: "operators" }],
		out: {
			nodeType: "OPR_PRE",
			value: { scaffolding: true, fn: "getData", args: [ "0", "t" ] },
			type: BaseTypes.UNSET
		}
	},
	{
		match: [{ t: "(" }],
		do: [
			{ fn: "getTreeUntil", args: [ ")" ] }
		],
		out: {
			nodeType: "CNT_PAREN",
			children: { scaffolding: true, fn: "getThings", args: [ "1" ] },
			type: { scaffolding: true, fn: "getData", args: [ "1", "type" ] }
		}
	},

	{ // number
		match: [{ type: TokenTypes.NUMBER }],
		out: {
			nodeType: "NUM",
			value: { scaffolding: true, fn: "getData", args: [ "0", "t" ] },
			type: BaseTypes.I32
		}
	},
	{ // return arg
		match: [
			{ t: "return" },
			{ notExtra: "closingBracket" }
		],
		do: [{ fn: "getTree" }],
		out: {
			nodeType: "RET",
			value: { scaffolding: true, fn: "getThing", args: [ "1" ] },
			type: { scaffolding: true, fn: "getData", args: [ "1", "type" ] }
		}
	},
	{ // if
		match: [
			{ t: "if" },
		],
		do: [
			{ fn: "getTree" },
			{ fn: "getTree" }
		],
		out: {
			nodeType: "IF",
			condition: { scaffolding: true, fn: "getThing", args: [ "1" ] },
			code: { scaffolding: true, fn: "getThing", args: [ "2" ] },
			type: BaseTypes.UNSET
		}
	},
	{ // return
		match: [{ t: "return" }],
		out: {
			nodeType: "RET",
			type: BaseTypes.VOID
		}
	},
	{ // let name =
		match: [
			{ t: "let" },
			{ type: TokenTypes.IDENTIFIER },
			{ t: "=" }
		],
		do: [
			{ fn: "getTree" }
		],
		out: {
			nodeType: "LET",
			name: { scaffolding: true, fn: "getData", args: [ "1", "t" ] },
			type: { scaffolding: true, fn: "getData", args: [ "3", "type" ] },
			children: [{ scaffolding: true, fn: "getThing", args: [ "3" ] }],
		}
	},
	{ // let name: type =
		match: [
			{ t: "let" },
			{ type: TokenTypes.IDENTIFIER },
			{ t: ":" }
		],
		do: [
			{ fn: "getType" },
			{ fn: "ignoreTokens" },
			{ fn: "getTree" }
		],
		out: {
			nodeType: "LET",
			name: { scaffolding: true, fn: "getData", args: [ "1", "t" ] },
			type: { scaffolding: true, fn: "getThing", args: [ "3" ] },
			children: [{ scaffolding: true, fn: "getThing", args: [ "4" ] }],
		}
	},
]

const scaffoldingFunctions: Record<string, (
	treesNodes: TreeNode[],
	tokens: Token[],
	things: DirThing[],
	args?: string[]
) => any> = {
	getTree: (_, tokens) => { return treeify(tokens) },
	getTreeUntil: (_1, tokens, _3, args) => {
		const trees: TreeNode[] = []
		
		while (true) {
			const t = treeify(tokens)
			if (t.length > 1)
				logError(t[1].tokens![0], "Expected separator before token!")
			trees.push(t[0])
			if (args!.includes(tokens[0].t) || tokens.length == 0)
				break
		}
		return trees
	},

	getNameAndType: (_1, tokens, _3) => {
		if (tokens[0].type != TokenTypes.IDENTIFIER)
			logError(tokens[0], `Expected identifier, found \`${tokens[0].t}\``)
		const name = tokens.shift()
		if (tokens[0].t == ":") {
			return [ name, scaffoldingFunctions.getType([], tokens, []) ]
		}
		return [ name, BaseTypes.UNSET ]
	},

	getType: (_1, tokens, _3): [Type] => {
		if (tokens[0].t == ":") tokens.shift()
		const currType = tokens.shift()!.t
		if (tokens.length > 0 && tokens[0].t == "<") {
			const extras: Type[] = []
			while (tokens[0].t == "<" || tokens[0].t == ",")
				tokens.shift(), extras.push(scaffoldingFunctions.getType([], tokens, [])[0])
			if ((tokens[0].t as string) == ">") tokens.shift()
			return [[currType, extras]]
		}
		return [[ currType ]]
	},

	getThing: (_1, _2, things, args) => { return things[parseInt(args![0])] },
	getThings: (_1, _2, things, args) => {
		return args!.length > 1
			? things.slice(parseInt(args![0]), parseInt(args![1]))
			: things.slice(parseInt(args![0]))
	},
	getData: (_1, _2, things, args) => {
		const idx = parseInt(args![0])
		if (idx >= things.length)
			logErrorSimple(`Tried accessing element #${idx + 1}, but only ${things.length} are present!`)
		return things[idx][args![1] as keyof DirThing]
	},

	ignoreTokens: (_1, tokens, _3, args) => { tokens.splice(0, args ? parseInt(args[0]) : 1); return [] },

	orderOfOperations: (treeNodes, _2, _3) => {
		scaffoldingFunctions.oopOperator(treeNodes, _2, _3, [ "." ])
		scaffoldingFunctions.oopOperator(treeNodes, _2, _3, [ "**" ])
		scaffoldingFunctions.oopOperator(treeNodes, _2, _3, [ "*", "/" ])
		scaffoldingFunctions.oopOperator(treeNodes, _2, _3, [ "+", "-" ])
	},
	oopOperator: (treeNodes, _2, _3, args) => {
		for (let i = 0; i < treeNodes.length; i++) {
			if (treeNodes[i].nodeType == "OPR_PRE") {
				if (!args!.includes(treeNodes[i].value)) continue
				treeNodes[i - 1] = {
					nodeType: "OPR",
					value: treeNodes[i].value,
					children: [
						treeNodes[i - 1],
						treeNodes[i + 1]
					],
					type: BaseTypes.UNSET, // TODO: figure out operation output type
					tokens: [
						...treeNodes[i - 1].tokens,
						...treeNodes[i].tokens,
						...treeNodes[i + 1].tokens
					]
				}
				treeNodes.splice(i, 2)
			}
		}
	},
}

type DirThing = Token | TreeNode

// TODO: implement `single`!
export function treeify(tokens: Token[], single = true): TreeNode[] {
	const ret: TreeNode[] = []
	let keepGoing = true
	while (tokens.length > 0 && keepGoing) {
		let found = false
		// Loop through the directives
		for (const d of directives) {
			// Check if the directive matches
			if (d.match.length > tokens.length) continue
			let isGood = true
			for (let i = 0; i < d.match.length; i++) {
				const tokenCheck = d.match[i]
				// console.log(tokenCheck, tokens[i])
				if (
					(tokenCheck.extra && !extraTokenTypes[tokenCheck.extra].includes(tokens[i].t)) ||
					(tokenCheck.notExtra && extraTokenTypes[tokenCheck.notExtra].includes(tokens[i].t)) ||
					(tokenCheck.t && tokenCheck.t != tokens[i].t) ||
					(tokenCheck.type && tokenCheck.type != tokens[i].type)
				) {
					isGood = false
					break
				}
			}

			if (isGood) {
				if (d.stop == "ignore") {
					found = true, keepGoing = false
					break
				}

				// Setup the 'things' array
				const thingsArray: DirThing[] = []
				for (const m of d.match) {
					if ("notExtra" in m || "dontConsume" in m) continue
					thingsArray.push(tokens.splice(0, 1)[0])
				}
				const usedTokens: Token[] = [ ...thingsArray as Token[] ]

				if (d.stop == "consume") {
					found = true, keepGoing = false
					break
				}

				// Run all the directive's functions
				for (const f of d.do ?? []) {
					if (!(f.fn in scaffoldingFunctions)) {
						logError(thingsArray[0] as Token, `The directive that matched this has an undefined ScaffoldingFunction: \`${f.fn}\``)
						break
					}
					thingsArray.push(...scaffoldingFunctions[f.fn](ret, tokens, thingsArray, f.args))
				}
				
				// Build the output from the scaffolding.
				const finalOutput = buildFromScaffolding(d.out, thingsArray)
				finalOutput.tokens = usedTokens
				ret.push(finalOutput)

				found = true
				break
			}
		}
		if (!found) {
			logError(tokens[0], `No directives found for this token.`)
			break
		}
	}

	scaffoldingFunctions.orderOfOperations(ret, [], [])

	return ret
}

const typesWithNoScaffolding = [ "string", "number" ]
type BuiltScaffoldType = Record<string, any> | any[]
function buildFromScaffolding(obj: any, things: (Token | TreeNode)[]): any {
	const ret: BuiltScaffoldType = Array.isArray(obj) ? [] : {}
	for (const p in obj) {
		if (typesWithNoScaffolding.includes(typeof obj[p])) {
			// Can't have scaffolding
			ret[p as keyof BuiltScaffoldType] = structuredClone(obj[p])
		} else if ("scaffolding" in obj[p]) {
			// Has scaffolding
			ret[p as keyof BuiltScaffoldType] = scaffoldingFunctions[obj[p].fn]([], [], things, obj[p].args)
		} else {
			// May have scaffolding
			ret[p as keyof BuiltScaffoldType] = buildFromScaffolding(obj[p], things)
		}
	}
	return ret as TreeNode
}

/// TESTING ///
import { tokenize } from "./tokenizer.ts"
import { storeFile, storeName } from "./fileStorage.ts"
import { logError, logErrorSimple } from "./errors.ts";

const code = `
let a = 5
let b = 4
`

storeFile(code, storeName("test"))

const tokens = tokenize(code, 0)
const t = treeify(tokens)
console.log("Tokens:", tokens)
console.log(t)
// console.log(Deno.inspect(t, {
// 	colors: true,
// 	compact: true,
// 	depth: 12
// }))
