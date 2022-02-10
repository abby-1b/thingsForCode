
export class CharStream {
	static l = ''
	static c = ''
	static n = ''

	static str = ""

	private static idx = -1
	static from(str: string) {
		this.str = str
		this.idx = -1
	}

	static get() {
		this.idx++
		this.l = this.c
		this.c = this.n
		this.n = this.str[this.idx]

		return this.l !== undefined
	}
}
