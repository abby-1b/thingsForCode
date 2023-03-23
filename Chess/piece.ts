import { Move } from "./move.ts"

/** Also doubles as piece value */
export const enum PieceType {
	NULL = 0,

	PAWN = 1,
	KNIGHT = 3,
	BISHOP = 4,
	ROOK = 5,
	QUEEN = 10,

	KING = 9e9,
}

export class Piece {
	type: PieceType = 0
	/** White: false, Black: true */
	color: boolean

	constructor(t: PieceType, c: boolean) {
		this.type = t
		this.color = c
	}

	toString() {
		if (this.type == PieceType.NULL)
			return "\x1b[0m•"
		const c = this.color ? "\x1b[1;32m" : "\x1b[1;31m"
		if (this.type == PieceType.PAWN  ) return c + "i"
		if (this.type == PieceType.KING  ) return c + "W"
		if (this.type == PieceType.KNIGHT) return c + "k"
		if (this.type == PieceType.BISHOP) return c + "j"
		if (this.type == PieceType.ROOK  ) return c + "H"
		if (this.type == PieceType.QUEEN ) return c + "Q"
	}

	static atPos(x: number, y: number): Piece {
		if (y == 6) return new Piece(PieceType.PAWN, true)
		if (y == 1) return new Piece(PieceType.PAWN, false)
		if (y > 0 && y < 7) return new Piece(PieceType.NULL, false)
		if (x == 0 || x == 7) return new Piece(PieceType.ROOK, y > 4)
		if (x == 1 || x == 6) return new Piece(PieceType.KNIGHT, y > 4)
		if (x == 2 || x == 5) return new Piece(PieceType.BISHOP, y > 4)
		if (x == 3) return new Piece(PieceType.KING, y > 4)
		if (x == 4) return new Piece(PieceType.QUEEN, y > 4)
		return new Piece(PieceType.NULL, false)
	}
}