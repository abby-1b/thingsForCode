
import { IntentType } from "./Intent.ts"

type BaseTypes = { [key: string]: string[] }

const sentences: BaseTypes = (() => {
	const sentenceString = Deno.readTextFileSync("BaseTypes.json")
	return JSON.parse(sentenceString)
})()

let out = ""
for (let k in sentences) {
	out += `,${k},`
		+ sentences[k].join("|")
}
out = out.slice(1)

let re = Object.assign({}, ...out.split(",").map(
	(e, i, a) => i % 2 == 0 ? {[e]: a[i + 1].split("|")} : {}
))

console.log(JSON.stringify(sentences))
console.log(JSON.stringify(re))
console.log(out)
