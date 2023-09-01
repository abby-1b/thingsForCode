import { Shot } from "./boardgen.ts";
import { ShipRange } from "./boardgen.ts";

export function importJSON(
	takenShips: ShipRange[],
	shotsMissed: Shot[],
	fileName: string
) {
	const f = JSON.parse(
		Deno.readTextFileSync("games/" + fileName + ".json")
	) as {
		takenShips: ShipRange[],
		shotsMissed: Shot[]
	}

	if (takenShips.length > 0) takenShips.splice(0, takenShips.length)
	if (shotsMissed.length > 0) shotsMissed.splice(0, shotsMissed.length)

	takenShips.push(...f.takenShips)
	shotsMissed.push(...f.shotsMissed)
}

export function exportJSON(
	takenShips: ShipRange[],
	shotsMissed: Shot[],
	fileName: string
) {
	Deno.writeTextFileSync("games/" + fileName + ".json", JSON.stringify({
		takenShips,
		shotsMissed
	}))
}
