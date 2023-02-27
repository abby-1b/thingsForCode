
// prompt()
const cwd = Deno.cwd()

const file = `
deno run -A ${cwd}/spells.ts "$@"
`

try {
	Deno.writeTextFileSync("/usr/local/bin/spells", file)
	Deno.run({ cmd: ["chmod", "+x", "/usr/local/bin/spells"] })
} catch (err) {
	console.log("Please run the installer with sudo.")
}
