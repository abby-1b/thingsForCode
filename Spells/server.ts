import { extname } from "https://deno.land/std@0.165.0/path/mod.ts"
import { contentType } from "https://deno.land/std@0.177.0/media_types/mod.ts"
import { compile } from "./compile.ts"

const PORT = 8000

/** Text to be served, which overrides file access. */
export const serveText: {[key: string]: {data: () => any, type: string}} = {}

// Handles a single connection to the server
async function handleConnection(conn: Deno.Conn) {
	const httpConn = Deno.serveHttp(conn)
	for await (const requestEvent of httpConn) {
		const { request } = requestEvent
		const url = new URL(request.url)
		let path = url.pathname.substring(1)
		if (path.length == 0) path = "index.pug"
		console.log("GET", path)
		if (path in serveText) {
			const headers = new Headers()
			headers.set("Content-Type", serveText[path].type)
			requestEvent.respondWith(new Response(serveText[path].data() + "", { headers }))
		} else {
			try {
				let sct = contentType(extname(path)) ?? "text/plain"
				let file: Uint8Array | string = await Deno.readFile(path)

				// Replace .pug files with compiled HTML!
				if (path.endsWith(".pug"))
					sct = "text/html",
					file = compile(new TextDecoder().decode(file))

				const headers = new Headers()
				headers.set("Content-Type", sct)
				requestEvent.respondWith(new Response(file, { headers }))
			} catch {
				requestEvent.respondWith(new Response("Not Found", { status: 404 }))
				console.log(" > 404")
			}
		}
	}
}

// Start the server (non-blocking)
const listener = Deno.listen({ port: PORT })
console.log(`Server running at http://localhost:${PORT}/`)
;(async () => {
	for await (const conn of listener)
		handleConnection(conn)
})()
