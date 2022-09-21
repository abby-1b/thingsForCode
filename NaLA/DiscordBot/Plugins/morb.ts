
import { Message, Plugin } from "./../utils.ts"

let amount = 0
export class CCBot extends Plugin {
	onMessage(msg: Message) {
		if (msg.author.username == "fool" || (msg.content.toLowerCase().includes("morbius") && Math.random() < 0.01)) {
			msg.addReaction("🇲")
			msg.addReaction("🇴")
			msg.addReaction("🇷")
			msg.addReaction("🇧")
			msg.addReaction("🇮")
			msg.addReaction("🇺")
			msg.addReaction("🇸")
			console.log("This has happened", ++amount, "times.")
			return true
		}
		return false
	}
}
