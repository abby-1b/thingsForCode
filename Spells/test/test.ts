import { spellbook } from "../src/spellbook.ts"
import { spell } from "../src/spell.ts"

spellbook.has(
	spell.section.title()
		.settings({
			title: "SpellBook: an intuitive library for creating sites."
		}),
)
spellbook.init()
