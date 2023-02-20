// These are here to let JSX code be converted into a relatively simple
// interface, without having to actually add React as a project.

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[key: string]: any
		}
	}
}

export interface Element {
	tagName: string,
	attributes?: {[key: string]: string}
	children: (string | Element)[]
}

export const React = {
	createElement: (
		tagName: string,
		attributes: {[key: string]: string},
		...children: (string | Element)[]
	): Element => {
		return { tagName, attributes, children }
	}
}