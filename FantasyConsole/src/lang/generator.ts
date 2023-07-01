import { Branch, DeclType } from "./treeifier.ts"
import { getTypeSize } from "./typeSizes.ts";

const Instruction = {
	EXIT: 0x00,
	
	// Add math (0x10-0x40)

	POINT: 0x50,
	PUT: 0x60,
	SET: 0x70,

	STACK: {
		PUSH_REG: 0x80,
		PUSH_VAL: 0x81,
		PUSH_AMT: 0x82,

		POP_REG : 0x84,
		POP_AMT : 0x85,
		POP_AMT_16 : 0x86,

		PUSH_INS: 0x88,
		POP_INS : 0x89
	},

	SEND_VAL: 0xB0,
	SEND_REG: 0xC0,

	JUMP: 0xD0,

	MOV: 0xE0,

	COPY: 0xF0
}


export function generate(tree: Branch) {
	console.log(tree)
	// const intermediate = genIntermediate(tree)
	// const bytes = genFinal(intermediate)
	// console.log(bytes)
}

const enum Intermediate {
	REG_PUSH = 0x00,
	OPR = 0x01,
	LET = 0x02,
}

type IntIns = { ins: Intermediate, args: any[] }
function genIntermediate(tree: Branch) {
	const out: IntIns[] = []
	if (tree.i == "CNT" || tree.i == "CNT_(") {
		tree.children!.map(e => out.push(...genIntermediate(e)))
	} else if (tree.i == "NUM") {
		out.push({
			ins: Intermediate.REG_PUSH,
			args: [ tree.value, tree.type ]
		})
	} else if (tree.i == "OPR") {
		// out.push({
		// 	ins: Intermediate.REG_PUSH,
		// 	args: [  ]
		// })
		out.push(...genIntermediate(tree.a))
		out.push(...genIntermediate(tree.b))
		out.push({
			ins: Intermediate.OPR,
			args: [ tree.value, tree.a.type, tree.b.type ] // the type of its two arguments
		})
	} else if (tree.i == "LET") {
		out.push(...genIntermediate(tree.value))

		const size = getTypeSize(tree.type)
		out.push({
			ins: Intermediate.LET,
			args: [ size, tree.name ]
		})

		// out.push({ ins: Instruction.STACK.PUSH_AMT, args: [ size ] })
	} else {
		console.log("AAAAAAAAAAAAAAAAA:", tree)
	}

	return out
}

const generalRegisters = [ 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xA, 0xB, 0xC, 0xD ]

function genFinal(inter: IntIns[]) {
	const ret: number[] = []
	let currRegister = 0
	function getRegister() { return generalRegisters[currRegister++] }
	function returnRegister() { return [--currRegister] }
	function getNumberAsBytes(
		val: string, type: DeclType
	): [number, number, number, number] {
		const n = parseInt(val)
		return [ n >> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255 ]
	}

	for (let i = 0; i < inter.length; i++) {
		const ins = inter[i]
		console.log(ins)
		switch (ins.ins) {
			case 0: {
				const reg = getRegister()
				ret.push(
					Instruction.SET, reg,
					...getNumberAsBytes(ins.args[0], ins.args[2])
				)
			} break
			case 1: {
				console.log(ins)
			} break
			case 2: {
				// console.log
			} break
		}
	}

	return ret
}
