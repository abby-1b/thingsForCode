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
	singleTag?: boolean
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
			if (tagIndent < indent) {
				i -= tagName.length + 2
				break
			}

			// Get the things that are a part of the tag: class, ID, and attributes. (+ the multi-line operator)
			let j = i, nest = 0
			while (true) {
				if ((src[j] == "\n" || src[j] == " ") && nest == 0) break
				if (src[j] == "(" || src[j] == "[" || src[j] == "{") nest++
				else if (src[j] == ")" || src[j] == "]" || src[j] == "}") nest--
				if (++j > src.length) error("Un-matched nest:", idxToPos(src, i))
			}
			const thingsString = src.slice(i, j); i = j
			const things = thingsString
				.trim().split(/(?<=.)(?=#|\(|\.)(?![^(]*\))/g)

			// Get the attributes
			const attrs: {[key: string]: string} = {}
			things.filter(t => t[0] == "(").forEach(a => {
				a.slice(1, -1).split(",").forEach(n => {
					const s = n.split("=")
					attrs[s[0].trim()] = s[1]?.trim()
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
		} else
			tagName += src[i]
	}
	return [els, i]
}

/** Converts elements to their HTML representation. */
function gen(els: Element[], indent = 0) {
	let out = "", i = 0
	for (const e of els) {
		out += (i++ == 0 ? "<" : "\n<") + e.tagName // Tag beginning

		// Append attributes
		if (e.attrs && Object.keys(e.attrs).length > 0)
			out += " " + Object.entries(e.attrs).map(n => n[0] + (n[1] ? "=" + n[1] : ""))

		// Append id & class
		if (e.id) out += ` id="${e.id}"`
		if (e.clss && e.clss.length > 0) out += ` class="${e.clss.join(" ")}"`
		out += ">" // Close the opening tag

		// Append innerText and children (recursively)
		const isTooLong = (e.innerText ?? "").length > 70
		if (e.innerText && e.innerText.length > 0)
			out += (isTooLong ? "\n\t" : "") + markDownToHtml(e.innerText) + (isTooLong ? "\n" : "")
		if (e.children && e.children.length > 0) out += "\n\t" + gen(e.children, indent + 1).split("\n").join("\n\t") + "\n"

		// Append closing tag
		if (
			(e.innerText && e.innerText.length > 0) ||
			(e.children && e.children.length > 0) ||
			!e.singleTag
		) out += `</${e.tagName}>`
	}
	return out
}

function modify(els: Element[]) {
	const hasTag = (el: Element, searchTag: string): boolean =>
		el.children ? !!el.children.find(e => e.tagName == searchTag) : false

	let htmlTag: Element
	const topTags = els.map(e => e.tagName)
	if (!topTags.includes("html")) {
		// Add <html> around everything
		els = [htmlTag = {
			tagName: "html",
			children: els
		} as Element]
	} else htmlTag = els[topTags.indexOf("html")]
	if (!hasTag(htmlTag, "body")) {
		// Add <body> around everything after <head>
		const headIdx = htmlTag.children!.findIndex(c => c.tagName == "head")
		const bodyEls = htmlTag.children!.splice(headIdx + 1)
		htmlTag.children!.push({
			tagName: "body",
			children: bodyEls
		} as Element)
	}

	// Crawls through the modified element tree, modifying things here and there.
	// Keep in mind this is depth-first, so things are parsed in the order they
	// appear in the oringal file (so sections can't be used before they're declared)
	const components: Record<string, Element[]> = {}
	function crawl(els: Element[]) {
		for (const el of els) {
			if (el.attrs && "@" in el.attrs) {
				// Is a component!
				components[el.tagName] = el.children ?? []
				els.splice(els.indexOf(el)) // Remove the component from the main tree
				continue
			}
			// TODO: repeatable components across a single file
			// TODO: repeatable components across multiple files
			// TODO: parse a few attributes into CSS

			// if (el.children) crawl(el.children)
		}
	}
	crawl(els)
	// Add <!DOCTYPE html> at the beginning of the document
	els.unshift({
		tagName: "!DOCTYPE html",
		singleTag: true
	} as Element)
	return els
}

export function compile(src: string) {
	return gen(modify(parse(src)[0]))
}

const f = Deno.readTextFileSync("index.pug")
const out = compile(f)
console.log(out)

// Deno.writeTextFileSync("index.html", out)
