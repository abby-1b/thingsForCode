
import { TOKEN } from "./config.ts"
import { Client, Message, GatewayIntents } from 'https://deno.land/x/harmony/mod.ts'
import { Plugin } from "./utils.ts"

// Make bot instance
const bot = new Client()

// On bot ready
bot.on('ready', () => {
	console.log(`'${bot.user?.username}' ready.`)

	for (let p of plugins) p.onReady()
})

// On recieve message
bot.on('messageCreate', (msg: Message): void => {
	if (msg.author == bot.user) return

	for (let p of plugins)
		if (p.onMessage(msg)) break

	// if (msg.content === '!ping') {
	// 	// msg.channel.send(`Pong! WS Ping: ${client.gateway.ping}`)
	// 	msg.reply(`Pong! WS Ping: ${bot.gateway.ping}`)
	// }
})

// Get all plugins
const plugins: Plugin[] = []
await (async () => {
	console.log("Getting plugin names...")
	const files = await Deno.readDirSync("Plugins")

	for (const f of files) {
		if (!f.isFile) continue
		const n = f.name
		console.log(`Importing \`${n}\`...`)
		const p = await import(`./Plugins/${n}`)
		const cls = Object.keys(p)[0]
		if (!cls) continue
		plugins.push(new p[cls]())
	}
})()
plugins.sort((a, b) => a.importance - b.importance)

// Connect
console.log("Connecting...")
bot.connect(TOKEN, [
	GatewayIntents.DIRECT_MESSAGES,
	GatewayIntents.GUILDS,
	GatewayIntents.GUILD_MESSAGES
])
