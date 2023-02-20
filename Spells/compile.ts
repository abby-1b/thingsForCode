
const nameChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXZY0123456789_-"

interface Element {
	tagName: string
	attrs?: {[key: string]: string}
	clss?: string[]
	id?: string

	children?: Element[]
	innerText?: string
}

function compile(src: string, indent = 0) {
	const els: Element[] = []
	let currTag = ""
	for (let i = 0; i < src.length; i++) {
		const c = src[i]
		if (!nameChars.includes(c)) {
			const attrs: {[key: string]: string} = {}
			const clss: string[] = []
			const children: Element[] = []
			let id: string | undefined
			let innerText: string | undefined
			els.push({
				tagName: currTag, attrs, clss, id, children, innerText
			}), currTag = ""
		}
	}
}

const f = Deno.readTextFileSync("index.pug")
const out = compile(f)
console.log(out)
