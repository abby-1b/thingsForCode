import { writeAllSync } from "https://deno.land/std@0.201.0/streams/write_all.ts"
import { run } from "./layer0.ts"
import { load } from "./sml-loading.ts"

const mem: number[] = load("./test-projects/test-print.sm")

const textEncoder = new TextEncoder()

run(mem, {
	0: [ (val: number) => {
		writeAllSync(Deno.stdout, textEncoder.encode(String.fromCharCode(val)))
		return 0
	}, () => {
		return 0
	} ]
})
