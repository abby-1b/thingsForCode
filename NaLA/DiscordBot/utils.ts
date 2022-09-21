
import { Client, Message } from 'https://deno.land/x/harmony/mod.ts'

export class Plugin {
	importance = 0

	onReady(): boolean {
		return false
	}

	onMessage(msg: Message): boolean {
		return false
	}
}

export { Message, Client }
