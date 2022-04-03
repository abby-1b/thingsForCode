
import { green } from "https://deno.land/std/fmt/colors.ts"
import { Tagger, Token } from "./Tagger.ts"

export type IntentType = "none"
	| "compound"
	| "command"
	| "statement"
	| "question"

// const POSTypes = await Deno.readTextFileSync("")
// console.log(POSTypes)

class Intent {
	type: IntentType = "none"
	tokens: Token[] = []

	constructor(text: string) {
		this.tokens = Tagger.tag(text)
		this.type = this.getType()
	}

	private getType(): IntentType {
		const posString = this.tokens.map(e => e[1]).join("")
		console.log(green(posString))
		// if (this.tokens[0][1] == "") {

		// }
		return "none"
	}

	toString() {
		return `Intent { [${this.type}]\n\t${
			this.tokens
		}\n}`
	}
}

export { Intent }
