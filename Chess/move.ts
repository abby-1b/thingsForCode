import { Piece, PieceType } from "./piece.ts"

const Weight = {
	CENTER_MULTIPLY: 0.002,
	DIST_MULTIPLY: 0.0004
}

export interface ExecutedMove {
	m: Move
	ate: PieceType
}

export class Move {
	static gettingColor = true
	static getMoves(px: number, py: number, grid: Piece[][]): Move[] {
		const m: Move[] = []
		const p = grid[py][px]
		if (p.color != this.gettingColor) return m
		if (p.type == PieceType.PAWN) {
			const dirMult = this.gettingColor ? 1 : -1
			if (this.tryMove(px, py - 1 * dirMult, grid)) {
				m.push(new Move(px, py, px, py - 1 * dirMult, grid))
				if (py == (this.gettingColor ? 6 : 1) && this.tryMove(px, py - 2 * dirMult, grid))
					m.push(new Move(px, py, px, py - 2 * dirMult, grid))
			}
			if (this.tryEat(px - 1, py - 1 * dirMult, grid))
				m.push(new Move(px, py, px - 1, py - 1 * dirMult, grid))
			if (this.tryEat(px + 1, py - 1 * dirMult, grid))
				m.push(new Move(px, py, px + 1, py - 1 * dirMult, grid))
		} else if (p.type == PieceType.KING) {
			m.push(...this.getAxisMoves(1, 0b11, px, py, grid))
		} else if (p.type == PieceType.KNIGHT) {
			if (this.tryMoveOrEat(px - 1, py - 2, grid)) m.push(new Move(px, py, px - 1, py - 2, grid))
			if (this.tryMoveOrEat(px + 1, py - 2, grid)) m.push(new Move(px, py, px + 1, py - 2, grid))
			if (this.tryMoveOrEat(px - 1, py + 2, grid)) m.push(new Move(px, py, px - 1, py + 2, grid))
			if (this.tryMoveOrEat(px + 1, py + 2, grid)) m.push(new Move(px, py, px + 1, py + 2, grid))
			if (this.tryMoveOrEat(px - 2, py - 1, grid)) m.push(new Move(px, py, px - 2, py - 1, grid))
			if (this.tryMoveOrEat(px + 2, py - 1, grid)) m.push(new Move(px, py, px + 2, py - 1, grid))
			if (this.tryMoveOrEat(px - 2, py + 1, grid)) m.push(new Move(px, py, px - 2, py + 1, grid))
			if (this.tryMoveOrEat(px + 2, py + 1, grid)) m.push(new Move(px, py, px + 2, py + 1, grid))
		} else if (p.type == PieceType.BISHOP) {
			m.push(...this.getAxisMoves(8, 0b01, px, py, grid))
		} else if (p.type == PieceType.ROOK) {
			m.push(...this.getAxisMoves(8, 0b10, px, py, grid))
		} else if (p.type == PieceType.QUEEN) {
			m.push(...this.getAxisMoves(8, 0b11, px, py, grid))
		}

		return m
	}

	/**
	 * Gets the moves across certain axes
	 * @param len How far along the moves will stem from [px, py]
	 * @param dir Directions (0b01 = axis-aligned, 0b10 = vertical)
	 * @param px Piece X
	 * @param py Piece Y
	 * @param grid The grid
	 */
	static getAxisMoves(
		len: number, dir: number,
		px: number, py: number,
		grid: Piece[][]
	): Move[] {
		const rt: Move[] = []
		const sx = px, sy = py
		const sc = dir == 3 ? 1 : 2 // Step change (both or not)
		for (let i = dir == 2 ? 1 : 0; i < 8; i += sc) {
			const sd = this.axisDirs[i]
			px = sx + sd[0], py = sy + sd[1]
			for (let m = 0; m < len; m++) {
				const tr = this.tryMove(px, py, grid)
				if (!tr && px >= 0 && px <= 7 && py >= 0 && py <= 7 && grid[py][px].color != this.gettingColor) {
					rt.push(new Move(sx, sy, px, py, grid))
					break
				}
				if (!tr) break
				rt.push(new Move(sx, sy, px, py, grid))
				px += sd[0], py += sd[1]
			}
		}
		return rt
	}
	static axisDirs = [
		[1, 1],
		[0, 1],
		[-1, 1],
		[-1, 0],
		[-1, -1],
		[0, -1],
		[1, -1],
		[1, 0]
	]

	static tryMoveOrEat(x: number, y: number, grid: Piece[][]) {
		if (x < 0 || x > 7 || y < 0 || y > 7) return false
		return grid[y][x].type == PieceType.NULL || grid[y][x].color != this.gettingColor
	}
	static tryMove(x: number, y: number, grid: Piece[][]) {
		if (x < 0 || x > 7 || y < 0 || y > 7) return false
		return grid[y][x].type == PieceType.NULL
	}
	static tryEat(x: number, y: number, grid: Piece[][]) {
		if (x < 0 || x > 7 || y < 0 || y > 7) return false
		return grid[y][x].type != PieceType.NULL && grid[y][x].color != this.gettingColor
	}

	from: number //[number, number]
	to: number //[number, number]
	value = 1 // Starts off at 0

	/**
	 * Constructs a move
	 * @param f From [x, y]
	 * @param t To [x, y]
	 * @param value How valuable a move is
	 */
	constructor(f0: number, f1: number, t0: number, t1: number, grid: Piece[][]) {
		this.from = f0 << 3 | f1
		this.to = t0 << 3 | t1

		if (f0 == -1) return
		this.value += ((f0 - t0) + (f1 - t1)) * Weight.DIST_MULTIPLY
		this.value -= Math.abs(3.5 - t0) * Weight.CENTER_MULTIPLY
		this.value -= Math.abs(3.5 - t1) * Weight.CENTER_MULTIPLY
		this.value += grid[t1][t0].type
	}

	execute(grid: Piece[][]): ExecutedMove {
		[grid[this.from & 7][this.from >> 3], grid[this.to & 7][this.to >> 3]] = [grid[this.to & 7][this.to >> 3], grid[this.from & 7][this.from >> 3]]
		// console.log(grid[this.from[1]][this.from[0]])
		// console.log(grid[this.to[1]][this.to[0]])
		const cpt = grid[this.from & 7][this.from >> 3].type
		grid[this.from & 7][this.from >> 3].type = PieceType.NULL
		return {
			m: this,
			ate: cpt
		}
	}
}
