/// <reference path="../interface.ts" />

class BaseController {
	/** This is our interface */
	inter = new Interface()

	constructor() {
		this.inter.onStateChange(state => {
			this.stateChanged(state)
		})
	}

	/** Converts a xx:xx:xx time string into milliseconds */
	private static timeToMillis(time: string): number {
		const split = time.split(":")
		return parseInt(split[split.length - 1])
			+ (split.length > 1 ? parseInt(split[split.length - 2]) : 0) * 60
			+ (split.length > 2 ? parseInt(split[split.length - 3]) : 0) * 3600
	}

	/** This runs whenever we get a state change. */
	private stateChanged(state: State) {
		console.log("State changed:", state)
	}

	/** Skips to this time! */
	private skipTo(time: number) {
		const t = BaseController.timeToMillis(this.getPlayerTimestamp())
		let diff = Math.round((time - t) / 1000)
		if (Math.abs(diff) > this.skipTime) {
			// We're far away enough to use the skip buttons
			const times = Math.floor(Math.abs(diff) / this.skipTime)
			if (diff > 0) for (let i = 0; i < times; i++) this.skipForward()
			if (diff < 0) for (let i = 0; i < times; i++) this.skipBackward()
			
			// Set the diff to the new real value
			diff += Math.sign(diff) * this.skipTime * times
		}
	}

	/** Gets the player's timestamp */
	getPlayerTimestamp(): string {
		return "0"
	}

	/** The time that skipping forward actually skips by (in seconds) */
	skipTime = 5

	/** Skips the player forward */
	skipForward(): void { }

	/** Skips the player backward */
	skipBackward(): void {  }
}

const c = new BaseController()
