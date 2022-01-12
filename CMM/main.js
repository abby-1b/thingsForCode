
const clipboardy = require('clipboardy');

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

let initCommands = [
	"scoreboard objectives add UseStick minecraft.used:minecraft.warped_fungus_on_a_stick",
	"scoreboard objectives add Sneak minecraft.custom:minecraft.sneak_time",
	"tag CodeIGuess add StickUser"
]

let repeatCommands = `\
execute as @e[tag=!StickUser,scores={UseStick=1..}] run scoreboard players set @s UseStick 0
execute as @e[scores={Sneak=1..}] run tag @s add Sneaking
execute as @e[scores={Sneak=0}] run tag @s remove Sneaking
execute as @e[scores={Sneak=1..}] run scoreboard players remove @s Sneak 1
execute as @e[scores={UseStick=1..},tag=!Sneaking] at @s run tp @s ^ ^ ^3
execute as @e[scores={UseStick=1..},tag=Sneaking] at @s run tag @e[distance=..3] add TPWith
execute as @e[scores={UseStick=1..},tag=Sneaking] at @s run tp @e[tag=TPWith] ^ ^ ^20
tag @e[tag=TPWith] remove TPWith
execute as @e[scores={UseStick=1..}] run effect give @s minecraft:jump_boost 1 255 true
execute as @e[scores={UseStick=1..}] run scoreboard players set @s UseStick 0
item replace entity CodeIGuess armor.feet with minecraft:leather_boots{Unbreakable:1b,display:{color:8273333,Name:"Ab*y's Boots"},Enchantments:[{id:"minecraft:feather_falling",lvl:255},{id:"minecraft:protection",lvl:255},{id:"minecraft:thorns",lvl:10},{id:"minecraft:depth_strider",lvl:3}]}
`.split('\n').map(e => e.trim()).filter(e => e.length != 0)

let stackCommands = []
stackCommands.push(...initCommands.map(e => e))
stackCommands.push(...repeatCommands.map((e, i) => `setblock ~ ~-${i + 3} ~ ${i == 0 ? 'repeating' : 'chain'}_command_block[facing=down]{auto:1,Command:"${
	log(e.replace(/\"/g, '\\"'))
}"}`))
stackCommands.push(`setblock ~ ~-2 ~ command_block{auto:1,Command:"fill ~ ~ ~ ~ ~3 ~ air"}`)
let passengers = [
	`id:armor_stand,Health:0`,
	`id:"minecraft:falling_block",Time:1,BlockState:{Name:"minecraft:activator_rail"}`,
]
for (let c = 0; c < stackCommands.length; c++) {
	stackCommands[c] = stackCommands[c]
		.replace(/\\/g, '\\\\')
		.replace(/\"/g, '\\"')
	passengers.push(`id:"minecraft:command_block_minecart",Command:"${stackCommands[c]}"`)
}

passengers.push(`id:"minecraft:command_block_minecart",Command:"kill @e[type=command_block_minecart,distance=..1]"`)

let fc = `summon falling_block ~ ~2 ~ {
	BlockState:{
		Name:"minecraft:redstone_block"
	}, 
	Time:1,
	Passengers:[
		` + stackPass(passengers) + `
	]
}`
// fc = stackPass(passengers)
// console.log(fc)
clipboardy.writeSync(compile(fc))