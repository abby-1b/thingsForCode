import { tokenize } from "./tokenizer.ts"
import { treeify } from "./treeifier.ts"
import { generate } from "./generator.ts"
import { fileNameExists, getNameIndex, storeFile, storeName } from "./fileStorage.ts"

export function compile(code: string, file?: string) {
	const fileIndex: number = ((): number => {
		if (!file) {
			const fileName = Math.floor(Math.random() * (1 << 30) + (1 << 30)).toString(36)
			return storeFile(code, storeName(fileName)) // Store the code and the name
		}

		if (fileNameExists(file))
			return getNameIndex(file)

		return storeName(file)
	})()

	const tokens = tokenize(code, fileIndex)
	
	const tree = treeify(tokens, [])
	// console.log(Deno.inspect(tree, {
	// 	colors: true,
	// 	compact: true,
	// 	depth: 12
	// }))
	
	const generated = generate(tree)
}


// let a: u32 = 0
// if (a == 0) {
// 	a = a + 5
// }

// let v: u8 = (14 - 2) * 3
// fn test(a: u8, b: u8): u8 {
// 	return a + b
// }
// test(v, 2)

const code = `


=let v = 3
`
compile(code)

