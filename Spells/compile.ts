import { error } from "./logging.ts"
import { markDownToHtml } from "./mdc.ts"

const nameChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXZY0123456789_-"

interface Element {
	tagName: string
	attrs?: {[key: string]: string}
	clss?: string[]
	id?: string
	innerText?: string
	children?: Element[]
}

function idxToPos(src: string, idx: number): string {
	const matches = [ ...src.matchAll(/\n/g) ]
		, lineNum = matches.findIndex(m => m.index! > idx) ?? 0
		, colNum = idx - matches[lineNum - 1].index!
	return lineNum + ":" + colNum
}

function parse(src: string, indent = 0, startI = 0): [Element[], number] {
	src += "\n"
	const els: Element[] = []
	let tagIndent = 0, tagName = "", i = startI
	for (; i < src.length; i++) {
		const c = src[i]
		if (!nameChars.includes(c)) {
			if (c == "\t") tagIndent++
			if (tagName.length == 0) continue
			if (tagIndent < indent) { i -= tagName.length + 2; break }

			// Get the things that are a part of the tag: class, ID, and attributes. (+ the multi-line operator)
			let j = i, nest = 0
			while (true) {
				if ((src[j] == "\n" || src[j] == " ") && nest == 0) break
				if (src[j] == "(" || src[j] == "[" || src[j] == "{") nest++
				else if (src[j] == ")" || src[j] == "]" || src[j] == "}") nest--
				if (++j > src.length) error("Un-matched nest:", idxToPos(src, i))
			}
			const thingsString = src.slice(i, j); i = j
			const things = thingsString.replace(/ |\n/g, "").split(/(?<=.)(?=#|\(|\.)/g)

			// Get the attributes
			const attrs: {[key: string]: string} = {}
			things.filter(t => t[0] == "(").forEach(a => {
				a.slice(1, -1).split(",").forEach(n => {
					const s = n.split("=")
					attrs[s[0]] = s[1]
				})
			})

			// Get innerText / children
			const children: Element[] = []
			let innerText: string | undefined
			if (things[things.length - 1] == ".") {
				const endIndex = [ ...src.matchAll(new RegExp(`^\t{0,${indent}}(?!\t)`, "gm")) ]
					.find(m => m.index! >= i)!.index! - 1
				innerText = src.slice(i + 1, endIndex).split("\n").map(l => l.trim()).join(" ")
				i = endIndex
			} else {
				// If the string isn't multiline, it could still have some text!
				const until = src.indexOf("\n", i)
				innerText = src.slice(i + 1, until)
				i = until

				// If it's not multline, it can always have children!
				const [elements, finishI] = parse(src, indent + 1, i)
				children.push(...elements)
				i = finishI
			}

			// Finally, push the element!
			els.push({
				tagName, attrs,
				clss: things.filter(t => t[0] == "." && t.length > 1).map(c => c.slice(1)),
				id: things.filter(t => t[0] == "#")[0]?.slice(1),
				innerText, children
			}), tagName = "", tagIndent = 0
		} else tagName += src[i]
	}
	return [els, i]
}

function gen(els: Element[]) {
	let out = ""
	for (const e of els) {
		out += "<" + e.tagName
		if (e.attrs && Object.keys(e.attrs).length > 0)
			out += " " + Object.entries(e.attrs).map(n => n[0] + (n[1] ? "=" + n[1] : ""))
		if (e.id) out += ` id="${e.id}"`
		if (e.clss && e.clss.length > 0) out += ` class="${e.clss.join(" ")}"`
		out += ">"
		if (e.innerText) out += markDownToHtml(e.innerText)
		if (e.children && e.children.length > 0) out += "\n\t" + gen(e.children).split("\n").join("\t\n")
		out += `</${e.tagName}>\n`
	}
	return out
}

const f = Deno.readTextFileSync("index.pug")
const out = parse(f)[0]
const g = gen(out)
console.log(g)

Deno.writeTextFileSync("index.html", g)
