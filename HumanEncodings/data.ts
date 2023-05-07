
export class Data {
	len(): number {
		return 0
	}
}

export class DataOptions<T> {
	/** The different options that can be chosen from */
	options: T[]
	/** The actual chosen options, in order */
	items: number[]

	constructor(options: T[], items: number[]) {
		this.options = options
		this.items = items
	}
}
