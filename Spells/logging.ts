
export function error(...err: any[]) {
	console.log(
		"%c" + err.map(e =>
			typeof e === "string" ? e : JSON.stringify(e)
		).join(" ") + "\n"
		+ new Error().stack!
			.split("\n").slice(2).join("\n"),
		"color: red"
	)
	Deno.exit(1)
}

export function warning(...wrn: any[]) {
	console.log(
		"%c" + wrn.map(e => JSON.stringify(e)).join(" "),
		"color: yellow"
	)
}
