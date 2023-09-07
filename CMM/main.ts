import * as clipboard from "https://deno.land/x/clipboard@v0.0.2/mod.ts"

function compile(c: string) {
	// return c
	return c.split("\n").map(e => e.trim()).join("")
}

function stackPass(pss: string[]) {
	let r = "{" + pss.shift()
	let e = "}"
	for (; 0 < pss.length;) {
		r += ",Passengers:[{" + pss.shift()
		e = "}]" + e
	}
	return r + e
}

const fl = Deno.readTextFileSync("CodeIGuess.mcfunction").split("## REPEAT")
	.map(s => s.split('\n').map(e => e.trim()).filter(e => e.length != 0 && e[0] != '#'))

const initCommands = fl[0]
const repeatCommands = fl[1]

const stackCommands: string[] = []
stackCommands.push(...initCommands.map(e => e))
// change the first one to 'repeating'
stackCommands.push(...repeatCommands.map((e, i) => `setblock ~ ~-${i + 4} ~ ${i == 0 ? 'repeating' : 'chain'}_command_block[facing=down]{auto:1,Command:"${
	e.replace(/\"/g, '\\"')
}"}`))
stackCommands.push(`setblock ~ ~-2 ~ command_block{auto:1,Command:"fill ~ ~ ~ ~ ~3 ~ air"}`)
stackCommands.push(`setblock ~ ~-3 ~ command_block{Command:"fill ~ ~ ~ ~ ~-${repeatCommands.length} ~ air"}`)
const passengers: string[] = [
	`id:armor_stand,Health:0`,
	`id:"minecraft:falling_block",Time:1,BlockState:{Name:"minecraft:redstone_block"}`,
	`id:armor_stand,Health:0`,
	`id:"minecraft:falling_block",Time:1,BlockState:{Name:"minecraft:activator_rail"}`,
]

for (let c = 0; c < stackCommands.length; c++) {
	stackCommands[c] = stackCommands[c]
		.replace(/\\/g, '\\\\')
		.replace(/\"/g, '\\"')
		.replace(/\'/g, "\\'")
	passengers.push(`id:"minecraft:command_block_minecart",Command:"${stackCommands[c]}"`)
}

passengers.push(`id:"minecraft:command_block_minecart",Command:"kill @e[type=command_block_minecart,distance=..1]"`)

const fc = `summon falling_block ~ ~2 ~ {BlockState:{Name:"minecraft:stone"},Time:1,Passengers:[` + stackPass(passengers) + `]}`
await clipboard.default.writeText(compile(fc))
