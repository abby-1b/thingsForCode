import { Ins } from "./ins.ts"

// TODO: implement different number types! We have to convert them to bytes.

const LABEL_STORAGE_BYTES = 2

export function load(path: string): number[] {
	const machineCode: number[] = []
	const ins = Deno.readTextFileSync(path)
		.replace(/(\/|#).*?$/g, "")
		.split(/\s/g)
		.filter(e => e.length > 0)

	const labels: Record<string, number> = {}
	let idxOffset = 0
	for (let i = 0; i < ins.length; i++) {
		const cins = ins[i]
		// Deal with label usage (:label)
		if (cins.startsWith(":")) {
			idxOffset += LABEL_STORAGE_BYTES - 1
			continue
		}

		// Deal label definitions (@label)
		if (!cins.startsWith("@")) continue
		if (cins in labels) {
			throw new Error(`Label \`${cins}\` redefined!`)
		} else {
			labels[cins.slice(1)] = i + idxOffset
			ins.splice(i, 1)
		}
	}

	for (const i of ins) {
		if (i.startsWith(":")) {
			// Labels are all the same size in bytes!
			const bytes: number[] = []
				, n = labels[i.slice(1)]
			for (let b = 0; b < LABEL_STORAGE_BYTES; b++) {
				bytes.push((n >> (8 * b)) & 0xFF)
			}
			machineCode.push(...bytes)
			continue
		}

		// Add the instruction/number directly
		if (i in Ins) machineCode.push(Ins[i as keyof typeof Ins])
		else machineCode.push(parseInt(i))
	}

	// console.log(machineCode)
	return machineCode
}
