import { extname } from "https://deno.land/std@0.165.0/path/mod.ts"
import { contentType } from "https://deno.land/std@0.177.0/media_types/mod.ts"
import { compile } from "./compile.ts"

/** Text to be served, which overrides file access. */
export const serveText: {
	[key: string]: {
		data: () => string,
		type: string
	}
} = {}

// Handles a single connection to the server
async function handleConnection(conn: Deno.Conn) {
	const httpConn = Deno.serveHttp(conn)
	for await (const requestEvent of httpConn) {
		const { request } = requestEvent
		const url = new URL(request.url)
		let path = url.pathname.substring(1)

		// Default to `index.pug`
		if (path.length == 0)
			path = "index.pug"

		console.log(
			// The path that's being gotten
			"/" + path + " ",

			// The current time as a string
			new Date().toTimeString().replace(/ \(.*/g, "")
		)

		if (path in serveText) {
			const headers = new Headers()
			headers.set("Content-Type", serveText[path].type)
			requestEvent.respondWith(new Response(
				serveText[path].data() + "",
				{ headers }
			))
		} else {
			try {
				let file: Uint8Array | string = await Deno.readFile(path)
				let sct = contentType(extname(path)) ?? "text/plain"

				// Replace .pug files with compiled HTML
				if (path.endsWith(".pug")) {
					file = compile(new TextDecoder().decode(file))
					sct = "text/html"
				}

				// Send the file over
				const headers = new Headers()
				headers.set("Content-Type", sct)
				requestEvent.respondWith(new Response(file, { headers }))
			} catch {
				requestEvent.respondWith(new Response("Not Found", { status: 404 }))
			}
		}
	}
}

// Start the server (non-blocking)
export async function startServer(port: number) {
	const listener = Deno.listen({ port })
	console.log(`Server running at http://localhost:${port}/`)
	for await (const conn of listener)
		handleConnection(conn)
}

// Start if this isn't an import
if (import.meta.main)
	startServer(8080)
