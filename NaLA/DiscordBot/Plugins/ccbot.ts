
import { Message, Plugin } from "./../utils.ts"

export class CCBot extends Plugin {
	onMessage(msg: Message) {
		if (msg.content != "-cc") return false
		msg.channel.send("Sorry, CCBot commands have been disabled.")
		return true
	}
}
