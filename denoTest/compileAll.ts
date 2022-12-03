
const supported = [
	"x86_64-unknown-linux-gnu",
	"x86_64-pc-windows-msvc",
	"x86_64-apple-darwin",
	"aarch64-apple-darwin"
]
const names = [
	"linux",
	"windows",
	"apple",
	"appleM1"
]

const p = Deno.run({ cmd: ["deno", "compile", "test.ts", "-o", "./builds/appleM1"] })
