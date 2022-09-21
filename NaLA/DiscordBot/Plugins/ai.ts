
import { Message, Plugin } from "./../utils.ts"

function unpack(txt: string): string {
	let ts = [""]
	let scope = 0
	for (let i = 0; i < txt.length; i++) {
		if (txt[i] == "{") scope++
		if (txt[i] == "}") scope--
		if (scope == 0 && txt[i] == "|") {
			ts.push("")
		} else {
			ts[ts.length - 1] += txt[i]
		}
	}
	let ret = ts[Math.floor(Math.random() * 100) % ts.length]
	return ret.includes("|") ? unpack(ret) : ret
}

function from(arr: string[]): string {
	return arr[Math.floor(Math.random() * 10 * arr.length) % arr.length]
}

export class CCBot extends Plugin {
	importance = 1

	onMessage(msg: Message) {
		if (msg.author.username == "CodeIGuess" && Math.random() < 0.01) {
			msg.reply(from(["shut up", "shut the fuck up"]))
			return true
		}
		return false
	}
}
