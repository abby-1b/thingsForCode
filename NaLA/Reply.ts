
class Reply {
	name: string
	constructor(name = "") {
		this.name = name
	}

	settings: {[key: string]: string} = {}

	// STATE
	stateChanged(to: string): this {
		this.settings["toState"] = to
		return this
	}

	toString(): string {
		return `Reply {\n\t${
			Object.keys(this.settings)
			.map(e => e + ": \"" + this.settings[e] + "\"")
			.join(",\n  ")}\n} ${this.name}`
	}
}

export { Reply }
