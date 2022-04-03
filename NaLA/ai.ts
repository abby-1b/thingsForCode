
import { Intent } from "./Intent.ts"
import { Reply } from "./Reply.ts"

class NaLA {
	// STATE
	static STATE_REPLY	= 1
	static STATE_DEV	= 2
	static STATE_EMOTE	= 4
	state = NaLA.STATE_REPLY | NaLA.STATE_EMOTE

	// PRE-WRITTEN

	// CONSTRUCTOR
	constructor(options: {[key: string]: boolean}) {
		if (options["emote"] !== false) this.state |= NaLA.STATE_EMOTE
	}

	// PARSING
	/**
	 * Parses a string, returning a Reply object that can then be built.
	 * @param str 
	 * @returns 
	 */
	parse(str: string): Reply {
		console.log(this.state)
		if (!(this.state & NaLA.STATE_REPLY))
			return new Reply("Reply off.")

		const intent = new Intent(str)
		console.log(intent.toString())
		
		return new Reply("No reply.")
	}

	// REPLYING
	endConversation(): Reply {
		// this.state ^= NaLA.STATE_REPLY
		return new Reply("Ending reply")
			.stateChanged("end")
	}

	// EVENTS / INTERFACE
	/**
	 * Starts the input loop, which runs until it doesn't.
	 */
	async startLoop() {
		while (this.state & NaLA.STATE_REPLY) {
			const input = prompt(' >') ?? ""
			const reply = this.parse(input)
			console.log(reply.toString())
		}
	}
}

export { NaLA }
