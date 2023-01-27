import * as clipboard from 'https://deno.land/x/clipboard/mod.ts'
// const fs = import('fs')
// const clipboardy = import('clipboardy')

function log(t) {
	console.log(t)
	return t
}

function compile(c) {
	// return c
	return c.split("\n").map(e => e.trim()).join("")
}

function stackPass(pss) {
	let r = "{" + pss.shift()
	let e = "}"
	for (let p = 0; p < pss.length; ) {
		r += ",Passengers:[{" + pss.shift()
		e = "}]" + e
	}
	return r + e
}

let fl = Deno.readTextFileSync("CodeIGuess.mcfunction", "utf-8").split("# Repeat")
	.map(s => s.split('\n').map(e => e.trim()).filter(e => e.length != 0 && e[0] != '#'))

let initCommands = fl[0]
let repeatCommands = fl[1]

// let initCommands = []
// let repeatCommands = [`item replace entity @p weapon with warped_fungus_on_a_stick{display:{Name:'{"text":"Ab*y\'s Stick"}'},Enchantments:[{id:"minecraft:knockback",lvl:25}]}`]

let stackCommands = []
stackCommands.push(...initCommands.map(e => e)) // change the first one to 'repeating'
stackCommands.push(...repeatCommands.map((e, i) => `setblock ~ ~-${i + 4} ~ ${i == 0 ? 'chain' : 'chain'}_command_block[facing=down]{auto:1,Command:"${
	e.replace(/\"/g, '\\"')
}"}`))
stackCommands.push(`setblock ~ ~-2 ~ command_block{auto:1,Command:"fill ~ ~ ~ ~ ~3 ~ air"}`)
stackCommands.push(`setblock ~ ~-3 ~ command_block{Command:"fill ~ ~ ~ ~ ~-${repeatCommands.length} ~ air"}`)
let passengers = [
	`id:armor_stand,Health:0`,
	`id:"minecraft:falling_block",Time:1,BlockState:{Name:"minecraft:redstone_block"}`,
	`id:armor_stand,Health:0`,
	`id:"minecraft:falling_block",Time:1,BlockState:{Name:"minecraft:activator_rail"}`,
]

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

for (let c = 0; c < stackCommands.length; c++) {
	stackCommands[c] = stackCommands[c]
		.replace(/\\/g, '\\\\')
		.replace(/\"/g, '\\"')
		.replace(/\'/g, "\\'")
	passengers.push(`id:"minecraft:command_block_minecart",Command:"${stackCommands[c]}"`)
}

passengers.push(`id:"minecraft:command_block_minecart",Command:"kill @e[type=command_block_minecart,distance=..1]"`)

let fc = `summon falling_block ~ ~2 ~ {BlockState:{Name:"minecraft:stone"},Time:1,Passengers:[` + stackPass(passengers) + `]}`
// fc = stackPass(passengers)
// console.log(fc)
await clipboard.default.writeText(compile(fc))