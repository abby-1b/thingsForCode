
// npm install @discordjs/voice

const {Client, Intents} = require('discord.js')
const {joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus} = require("@discordjs/voice")

const levenshteinDistance = (str1 = '', str2 = '') => {
	const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
	for (let i = 0; i <= str1.length; i += 1) { track[0][i] = i }
	for (let j = 0; j <= str2.length; j += 1) { track[j][0] = j }
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
			track[j][i] = Math.min(
				track[j][i - 1] + 1,
				track[j - 1][i] + 1,
				track[j - 1][i - 1] + indicator,
			)
		}
	}
	return track[str2.length][str1.length]
}

const lines = {
	"delicious": "Voice_delicious.ogg",
	"divine": "Voice_divine.ogg",
	"frogtastic": "Voice_Frogtastic.ogg",
	"frog": "Voice_Frogtastic.ogg",
	"moonstruck": "Voice_Moonstruck.ogg",
	"moon": "Voice_Moonstruck.ogg",
	"sugar crush": "Voice_sugar_crush.ogg",
	"sweet": "Voice_sweet.ogg",
	"tasty": "Voice_tasty.ogg"
}

const replyLines = [
	"Sweet",
	"Delicious",
	"Divine",
	"Sugar Crush",
	"Tasty",
	"Frogtastic",
	"Moonstruck"
]

const player = createAudioPlayer()
player.addListener('stateChange', (e) => {
	if (e.status == "playing") {
		setTimeout(() => {
			connection.disconnect()
			isReady = true
		}, e.resource.playbackDuration - 500)
	}
})

var bot = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, "GUILD_VOICE_STATES"]})
var connection = null
var isReady = true

let postMsgFrom = null
let postMsgTo = null

bot.on('ready', () => {
    console.log(`${bot.user.username} ready`)
	
	bot.user.setActivity('with ur mom')
    let guilds = bot.guilds.cache.map(guild => guild.id)
	// let guilds = bot.guilds.map(guild => guild.id)
	for (let g = 0; g < guilds.length; g++) {
		let guild = bot.guilds.cache.get(guilds[g])
		if (guild.name == "The Council") postMsgFrom = guild.channels.cache.find(e => e.name == "the-to-do-list")
		if (guild.name == "~{ Abeyance }~") postMsgTo = guild.channels.cache.find(e => e.name == "homework")
	}
	// console.log(postMsgFrom, postMsgTo)

	// postMsgFrom.send('Your mom lol')
	// postMsgTo.send('your mom lmao')
})

bot.on('messageCreate', message => {
	if (message.author == bot.user) return
	if (message.channelId == postMsgFrom.id) {
		postMsgTo.send(message.content)
	}
	if (isReady && message.content.startsWith('-cc')) {
		let arg = message.content.split(" ")
		if (arg.length > 1) {
			arg = arg.slice(1).join(" ")
			if (arg in lines) { arg = lines[arg] } 
			else {
				let ks = Object.keys(lines)
				let clo = "delicious"
				let dst = 999
				for (let i = 0; i < ks.length; i++) {
					let c = levenshteinDistance(ks[i], arg)
					if (c < dst) { dst = c; clo = ks[i] }
				}
				arg = lines[clo]
			}
		} else {
			arg = Object.keys(lines)
			arg = lines[arg[Math.floor((Math.random() * 100)) % arg.length]]
		}
		let channel = message.member.voice.channel
		if (!channel) {
			message.reply("You're... not in a voice channel.")
			return
		}
		isReady = false
		connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guild.id,
			adapterCreator: channel.guild.voiceAdapterCreator,
		})
		connection.on(VoiceConnectionStatus.Ready, () => {
			let resource = createAudioResource("lines/" + arg)
			player.play(resource)
			connection.subscribe(player)
		})
		return
	}
	let cnt = message.content
	for (let i = 0; i < replyLines.length; i++) {
		if (cnt.toLowerCase().includes(replyLines[i].toLowerCase())) {
			message.channel.send(replyLines[i] + '.')
		}
	}
})

bot.login(require("fs").readFileSync("TOKEN", "utf8"))
