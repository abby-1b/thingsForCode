import { Piece } from "./piece.ts"
import { Move, ExecutedMove } from "./move.ts"

const DEEPER_ANALYSIS_CHANCE = 0.2

type Tuple8<T> = [T, T, T, T, T, T, T, T]

type PieceRow = Tuple8<Piece>
type PieceBoard = Tuple8<PieceRow>

interface Position {
	/** The move taken to arrive at this position. */
	move: Move

	/** How good this given position is. */
	value: number

	/** The options (moves) possible from this position. */
	options: Position[]
}

export class Board {
	grid: PieceBoard
	currMoves: Move[] = []
	moveHistory: ExecutedMove[] = []
	value = 0

	pos!: Position

	constructor() {
		this.grid = new Array(8).fill(0).map((_, y) => new Array(8).fill(0).map((_, x) =>
			Piece.atPos(x, y)
		) as PieceRow) as PieceBoard

		this.genPos()
	}

	genPos() {
		//@ts-ignore: <Maybe this helps with GC>
		delete this.pos
		this.pos = {
			move: new Move(-1, -1, -1, -1, this.grid),
			value: this.value,
			options: []
		}
	}

	findMoves() {
		this.currMoves = this.getMoves()
	}

	getMoves() {
		const m = []
		for (let x = 0; x < 8; x++)
			for (let y = 0; y < 8; y++)
				m.push(...Move.getMoves(x, y, this.grid))
		return m
	}

	doBestMove() {
		// if (this.currMoves.length == 0) return
		// let bm = this.currMoves[0].value,
		// 	bmi = 0
		// for (let m = 1; m < this.currMoves.length; m++) {
		// 	if (this.currMoves[m].value > bm)
		// 		bm = this.currMoves[m].value,
		// 		bmi = m
		// }
		// this.doMove(this.currMoves[bmi])
		let bestMoveScore = Move.gettingColor ? -Infinity : Infinity
		let bestMoveIdx = -1
		for (let i = 0; i < this.pos.options.length; i++) {
			const v = this.pos.options[i].value
			if (
				(Move.gettingColor && v > bestMoveScore) ||
				(!Move.gettingColor && v < bestMoveScore)
			) {
				bestMoveScore = v
				bestMoveIdx = i
			}
		}
		if (bestMoveIdx == -1) return
		this.doMove(this.pos.options[bestMoveIdx].move)
	}

	doMove(m: Move) {
		this.value += m.value * (Move.gettingColor ? 1 : -1)
		this.moveHistory.push(m.execute(this.grid))
		Move.gettingColor = !Move.gettingColor
	}

	undo() {
		Move.gettingColor = !Move.gettingColor
		const l = this.moveHistory[this.moveHistory.length - 1]
		this.grid[l.m.from & 7][l.m.from >> 3].color = Move.gettingColor
		this.grid[l.m.from & 7][l.m.from >> 3].type = this.grid[l.m.to & 7][l.m.to >> 3].type
		this.grid[l.m.to & 7][l.m.to >> 3].color = !Move.gettingColor
		this.grid[l.m.to & 7][l.m.to >> 3].type = l.ate

		this.value -= l.m.value * (Move.gettingColor ? 1 : -1)
		this.moveHistory.pop()
	}

	analyzePosition(d: number, p = this.pos): number {
		if (p.options.length != 0) return p.value
		const m = this.getMoves()
		let bestMoveScore = Move.gettingColor ? -Infinity : Infinity
		let bestMoveIdx = -1
		for (let i = 0; i < m.length; i++) {
			this.doMove(m[i])
			const np: Position = {
				move: m[i],
				value: this.value,
				options: []
			}
			if (
				(Move.gettingColor && this.value < bestMoveScore) ||
				(!Move.gettingColor && this.value > bestMoveScore)
			) {
				bestMoveScore = this.value
				bestMoveIdx = i
			}
			if (d > 0 && Math.random() < DEEPER_ANALYSIS_CHANCE)
				np.value = this.analyzePosition(d - 1, np)
			p.options.push(np)
			this.undo()
		}
		if (bestMoveIdx != -1 && p.options[bestMoveIdx].options.length == 0 && d > 0) {
			this.doMove(p.options[bestMoveIdx].move)
			this.analyzePosition(d - 1, p.options[bestMoveIdx])
			this.undo()
		}
		if (p.options.length == 0) return p.value
		let val = Move.gettingColor ? -Infinity : Infinity
		for (let i = 0; i < p.options.length; i++)
			if ((Move.gettingColor && p.options[i].value > val) ||
				(!Move.gettingColor && p.options[i].value < val)) {
				val = p.options[i].value
			}
			// totalSum += p.options[i].value
		p.value = val
		return val
	}

	print() {
		let b = ""
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++)
				b += this.grid[x][y] + " "
			b += "\n"
		}
		console.log(b + "\x1b[0m")
	}
}

const b = new Board()
// b.findMoves()
// console.log(b.currMoves)
// console.log(b.currMoves.length)
// for (let i = 0; i < 5; i++) {
// 	b.findMoves()
// 	b.doBestMove()
// }
// b.print()

// b.analyzePosition(3)
// // console.log(b.pos)
// b.doBestMove()
// b.print()

for (let i = 0; i < 100; i++) {
	b.analyzePosition(5)
	b.doBestMove()
	b.genPos()
	// console.log(b.pos)
	b.print()
}
