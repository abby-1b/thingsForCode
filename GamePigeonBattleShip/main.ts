import {
	BOARD_SIZE,
	CellStatus,
	ShipRange,
	Shot,
	emptyBoard,
	emptyFrequencyBoard,
	newBoard,
	printBoard,
	fillRange,
setCellStatus
} from "./boardgen.ts"
import { exportJSON, importJSON } from "./gameSaves.ts";

const BOARD_ITERS = 100000

const takenShips: ShipRange[] = []
const shotsMissed: Shot[] = []
const shotsHit: Shot[] = []

function getBestMove() {
	const freqBoard = emptyFrequencyBoard(0)
	const maskBoard = emptyBoard(CellStatus.EMPTY)
	for (const r of takenShips) {
		fillRange(maskBoard, r, CellStatus.SHIP, 0)
	}
	for (const s of shotsHit) {
		freqBoard[s[0] + s[1] * BOARD_SIZE] = -1
		maskBoard[s[0] + s[1] * BOARD_SIZE] = CellStatus.SHOT
	}

	for (let i = 0; i < BOARD_ITERS; i++) {
		const board = newBoard(takenShips, shotsMissed, shotsHit)
		if (!board) continue
		for (let i = 0; i < BOARD_SIZE ** 2; i++) {
			if (board[i] == CellStatus.SHIP && maskBoard[i] == CellStatus.EMPTY)
				freqBoard[i] += 1
		}
	}

	let max = 0
	let maxIdx = -1
	for (let i = 0; i < BOARD_SIZE ** 2; i++) {
		if (maskBoard[i] != CellStatus.EMPTY) continue
		if (freqBoard[i] > max) {
			max = freqBoard[i]
			maxIdx = i
		}
	}

	printBoard(freqBoard, (e: number | string) => {
		const val = (e as number) / max
		if (val < 0) {
			return `\x1b[48;2;0;255;0m `
		} else if (val == 0) {
			return `\x1b[48;2;0;0;0m `
		}
		return `\x1b[48;2;${Math.floor(val * 255)};70;${Math.floor(60 * Math.pow(val * 255, 1 / 5))}m `
	})

	const bestMove: Shot = [
		maxIdx % BOARD_SIZE,
		Math.floor(maxIdx / BOARD_SIZE)
	]
	console.log("Best move:", `[ ${bestMove[0]}, ${bestMove[1]} ]`)

	// shotsMissed.push(bestMove)
	// getBestMove()
}

const enum Action {
	HIT_SHIP,
	HIT_SHIP_PARTIAL,
	MISS_SHOT
}
const lastAction: Action[] = []

function printHelp() {
	console.log("%c> hXYWH", "color:green", "to indicate a hit ship.")
	console.log("%c> hXY", "color:green", "to indicate a partially hit ship.")
	console.log("%c> mXY", "color:green", "to indicate a missed shot.")
	console.log("%c> u", "color:green", "to undo your last move.")
	console.log("%c> r", "color:green", "to re-calculate the heatmap.")
	console.log("%c> l filename", "color:green", "to load a game from JSON.")
	console.log("%c> s filename", "color:green", "to save a game into JSON.")
	console.log("%c> h", "color:green", "to show this dialogue.")
}

function interactive() {
	printHelp()

	while (true) {
		getBestMove()
		while (true) {
			const inp = prompt(">") ?? " "
			if (inp[0] == "h" && inp.length == 5) {
				takenShips.push([
					parseInt(inp[1]),
					parseInt(inp[2]),
					parseInt(inp[3]),
					parseInt(inp[4])
				])
				lastAction.push(Action.HIT_SHIP)
				break
			} else if (inp[0] == "h" && inp.length == 3) {
				shotsHit.push([
					parseInt(inp[1]),
					parseInt(inp[2])
				])
				lastAction.push(Action.HIT_SHIP_PARTIAL)
				break
			} else if (inp[0] == "m" && inp.length == 3) {
				shotsMissed.push([
					parseInt(inp[1]),
					parseInt(inp[2])
				])
				lastAction.push(Action.MISS_SHOT)
				break
			} else if (inp[0] == "u") {
				const la = lastAction.pop()
				if (la === undefined) {
					console.log("No actions to undo.")
					continue
				}
				if (la == Action.HIT_SHIP) {
					takenShips.pop()
				} else if (la == Action.HIT_SHIP_PARTIAL) {
					/// NOPE
				} else if (la == Action.MISS_SHOT) {
					shotsMissed.pop()
				}
				break
			} else if (inp[0] == "r") {
				console.log("Re-calculating...")
				break
			} else if (inp[0] == "l") {
				importJSON(takenShips, shotsMissed, inp.slice(2))
				console.log("Imported!")
				break
			} else if (inp[0] == "s") {
				exportJSON(takenShips, shotsMissed, inp.slice(2))
				console.log("Saved!")
			} else if (inp[0] == "h") {
				printHelp()
			}
		}
	}
}

// importJSON(takenShips, shotsMissed, "emma")
// const b = newBoard(takenShips, shotsMissed, [[ 4, 8 ]])!
// printBoard(b, n => " ~#"[n])

interactive()
