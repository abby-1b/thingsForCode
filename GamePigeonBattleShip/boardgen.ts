
export const BOARD_SIZE = 10
const SHIP_LENGTHS = [ 4, 3, 3, 2, 2, 2, 1, 1, 1, 1 ]
const MAX_PLACEMENT_ITERS = 200
const MAX_PARTIAL_ITERS = 500

export const enum CellStatus {
	EMPTY = "EMPTY",
	SHOT = "SHOT",
	SHIP = "SHIP",
}

export type Shot = [number, number] // x, y
export type Board = CellStatus[]
export type FrequencyBoard = number[]

export type ShipRange = [number, number, number, number] // x, y, w, h

export function setCellStatus(board: Board, x: number, y: number, s: CellStatus) {
	if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return
	board[x + y * BOARD_SIZE] = s
}

function getCellStatus(board: Board, x: number, y: number) {
	if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return CellStatus.EMPTY
	return board[x + y * BOARD_SIZE]
}

function isRangeEmpty(board: Board, r: ShipRange, checkType: CellStatus, grow = 0) {
	for (let x = r[0] - grow; x < r[0] + r[2] + grow; x++) {
		for (let y = r[1] - grow; y < r[1] + r[3] + grow; y++) {
			const cs = getCellStatus(board, x, y)
			if (cs == checkType) return false
		}
	}
	return true
}

export function fillRange(board: Board, r: ShipRange, status: CellStatus, grow = 0) {
	for (let x = r[0] - grow; x < r[0] + r[2] + grow; x++) {
		for (let y = r[1] - grow; y < r[1] + r[3] + grow; y++) {
			setCellStatus(board, x, y, status)
		}
	}
}

export function emptyFrequencyBoard(val = 0): FrequencyBoard {
	return new Array(BOARD_SIZE ** 2).fill(val)
}

export function emptyBoard(val: CellStatus): Board {
	return new Array(BOARD_SIZE ** 2).fill(val)
}

function copyBoard(b: Board) {
	return [...b]
}

export function newBoard(
	takenShips: ShipRange[],
	shotsMissed: Shot[],
	shotsHit: Shot[]
): Board | undefined {
	let baseBoard = emptyBoard(CellStatus.EMPTY)

	for (const s of shotsMissed) {
		setCellStatus(baseBoard, s[0], s[1], CellStatus.SHOT)
	}

	let ships = [...SHIP_LENGTHS]

	if (takenShips) {
		for (const r of takenShips) {
			const sz = Math.max(r[2], r[3])
			for (let i = 0; i < ships.length; i++) {
				if (ships[i] == sz) ships.splice(i, 1)
			}
			fillRange(baseBoard, r, CellStatus.SHOT, 1)
			fillRange(baseBoard, r, CellStatus.SHIP, 0)
		}
	}

	// Shuffle the ships
	ships = ships
		.map(e => [ Math.random(), e ]).sort((a, b) => a[0] - b[0])
		.map(e => e[1])

	let partialIters = 0
	while (partialIters++ < MAX_PARTIAL_ITERS) {
		const board = copyBoard(baseBoard)
		for (const s of ships) {
			let i = 0
			while (i++ < MAX_PLACEMENT_ITERS) {
				const facesDown = Math.random() < 0.5
				const x = facesDown
					? Math.floor(Math.random() * BOARD_SIZE)
					: Math.floor(Math.random() * (BOARD_SIZE - (s - 1)))
				const y = facesDown
					? Math.floor(Math.random() * (BOARD_SIZE - (s - 1)))
					: Math.floor(Math.random() * BOARD_SIZE)
				
				const r: ShipRange = [
					x, y, facesDown ? 1 : s, facesDown ? s : 1
				]
				if (
					isRangeEmpty(board, r, CellStatus.SHIP, 1) &&
					isRangeEmpty(board, r, CellStatus.SHOT, 0)
				) {
					fillRange(board, r, CellStatus.SHIP)
					break
				}
			}
		}
		if (shotsHit.length != 0) {
			let partialsMet = true
			for (const partial of shotsHit) {
				const cs = getCellStatus(board, partial[0], partial[1])
				if (cs != CellStatus.SHIP) {
					partialsMet = false
					break
				}
			}
			if (partialsMet) {
				baseBoard = board
				break
			}
		} else {
			baseBoard = board
			break
		}
	}
	if (partialIters == MAX_PARTIAL_ITERS) {
		console.log(
			"%cPartial not possible! Please check your shot placements.",
			"color:red"
		)
	}

	for (const s of shotsHit) {
		setCellStatus(baseBoard, s[0], s[1], CellStatus.SHOT)
	}

	return baseBoard
}

export function printBoard(
	board: Board | FrequencyBoard,
	fn = (b: number | string): string => b.toString()
) {
	const clear = "\x1b[0m"
	let curr = ""
	let i = 0
	console.log("  0 1 2 3 4 5 6 7 8 9")
	let row = 0
	for (const b of board) {
		curr += fn(b)
		curr += " "
		if (++i == BOARD_SIZE) {
			console.log("0123456789"[row++] + " " + curr + clear)
			curr = "", i = 0
		}
	}
	console.log()
}