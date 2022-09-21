import { GameEvent } from "./events.ts"
import { Player } from "./player.ts"
import { Island } from "./island.ts"

export enum RushType {
	SIDE,
	DIA_GEN,
	MID_SIDE,
}

export class GameMap {
	static maps: (typeof GameMap)[] = []
	static random(): GameMap {
		if (GameMap.maps.length == 0) console.log("No maps found!"), Deno.exit()
		const n = Math.floor(Math.random() * GameMap.maps.length * 5) % (GameMap.maps.length - 1)
		return new GameMap.maps[Number.isNaN(n) ? 0 : n]()
	}
	static diaTime = 40
	static emsTime = 60

	players: Player[] = []
	rush!: RushType
	islands: Island[] = []

	constructor() {
		for (let t = 0; t < 8; t++) {
			this.players.push(new Player(t))
		}
	}

	selfPrint() {
		if (this.rush == RushType.SIDE) {

		}
	}

	state() {
		// Print map in graphics mode
		this.selfPrint()
		console.log("\x1B[8A" + this.players.map(e => e.toString(true)).join("\n"))
	}
}

export class Map1 extends GameMap {
	static { GameMap.maps.push(this) }
	rush = RushType.SIDE
}
