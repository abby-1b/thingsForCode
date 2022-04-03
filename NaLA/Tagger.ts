
import { yellow } from "https://deno.land/std/fmt/colors.ts"
import levenshtein from "https://deno.land/x/levenshtein@v1.0.1/mod.ts"

// The token itself, and then its type
export type Token = [string, string]

class Tagger {
	static POS: {[key: string]: string} = {}
	static {
		const file = Deno.readTextFileSync("POS.bsv").split("|")
		for (let e = 0; e < file.length; e += 2)
			Tagger.POS[file[e]] = file[e + 1]
	}

	private static tagToken(tkn: string, lastType: string): string {
		let selector = ""
		
		// Selector with lastType
		selector = `{${lastType}}${tkn}`
		if (selector in Tagger.POS) return Tagger.POS[selector]

		// Selector with only token
		selector = `${tkn}`
		if (selector in Tagger.POS) return Tagger.POS[selector]

		const closest = Object.keys(Tagger.POS)
			.map(e => [e, levenshtein(e, tkn)])
			.reduce((a, b) => a[1] < b[1] ? a : b)[0]

		console.log(yellow(`'${tkn}' not found. Using '${closest}'`))
		return Tagger.POS[closest]
	}

	// [token, type][]
	static tag(str: string): Token[] {
		const tokens = str
			.split(/( |(?=[!?,.'])|(?<=[!?,.]))/g)
			.filter(e => e != ' ' && e != '')

		const tagged: Token[] = []
		for (let t = 0; t < tokens.length; t++)
			tagged.push([
				tokens[t],
				Tagger.tagToken(tokens[t].toLowerCase(),
					(tagged[t - 1] ?? [0, ""])[1])
			])

		return tagged
	}
}

export { Tagger }
