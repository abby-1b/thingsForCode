
const d = JSON.parse(Deno.readTextFileSync("./starts.json")) as {
	s: string[],
	a: string[],
	e: string[]
}
const run = () => {
	return d.s[Math.floor(Math.random() * d.s.length)] + " "
		+ d.a[Math.floor(Math.random() * d.a.length)] + " "
		+ d.e[Math.floor(Math.random() * d.e.length)]
}
console.log(run())
Deno.writeTextFileSync("generated.js", `const d = ${
	JSON.stringify(d)
};
Script.setShortcutOutput((${run.toString()})())`)
