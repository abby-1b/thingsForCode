use crate::board::Board;

pub mod pawn;
pub mod knight;
pub mod king;

pub mod slide;

pub mod bishop;
pub mod rook;
pub mod queen;

// Generates the moves for a given position in a board.
pub fn gen_moves(b: &Board, idx: u8) -> u64 {
	let piece = 1 << idx;
	if b.typ[0] & piece != 0 {
		return pawn::gen_moves(b, piece);
	} else if b.typ[1] & piece != 0 {
		return knight::gen_moves(b, piece);
	} else if b.typ[2] & piece != 0 {
		return bishop::gen_moves(b, piece, idx);
	} else if b.typ[3] & piece != 0 {
		return rook::gen_moves(b, piece, idx);
	} else if b.typ[4] & piece != 0 {
		return queen::gen_moves(b, piece, idx);
	} else if b.typ[5] & piece != 0 {
		return king::gen_moves(b, piece);
	}
	// TODO: implement remaining piece types.

	panic!("A piece wasn't found at index {}. Good luck.", idx);
}
