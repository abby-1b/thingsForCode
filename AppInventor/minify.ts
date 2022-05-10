import * as terser from "https://raw.githubusercontent.com/lumeland/terser-deno/main/deno/mod.js"

async function minify(code: string) {
	return (await terser.minify(code, {
		compress: {
			dead_code: true,
			drop_console: true,
			drop_debugger: true,
			keep_classnames: false,
			keep_fargs: false,
			keep_fnames: false,
			keep_infinity: false
		},
		mangle: {
			eval: true,
			keep_classnames: false,
			keep_fnames: false,
			toplevel: true,
			safari10: false
		},
		module: true,
		sourceMap: false,
		output: {
			comments: false
		}
	})).code
}

Deno.writeTextFileSync("appInventor.js", await minify(Deno.readTextFileSync("appInventor.max.js")))