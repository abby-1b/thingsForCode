
class Keywords {
	[k: string]: any

	static keywordTypes: {[key: string]: string[]} = {
		"dev": ["analysis"],
		"ending": ["goodbye", "exit", "stop", "bye"]
	}

	/**
	 * Checks if a string has any of the words from a category
	 * @param str String to check
	 * @param from Category to match against
	 */
	static isType(str: string, from: string) {
		return Keywords.keywordTypes[from].map(e => str.toLowerCase().includes(e)).some(e => e)
	}
}

export { Keywords }
