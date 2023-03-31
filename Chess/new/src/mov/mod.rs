use crate::board::Board;
use crate::positions;

pub mod pawn;
pub mod knight;
pub mod king;

pub mod slide;

pub mod bishop;
pub mod rook;
pub mod queen;

// Generates the moves for a given position in a board.
pub fn gen_moves(b: &Board, idx: u8, side: bool) -> u64 {
	let piece = 1 << idx;
	if b.typ[0] & piece != 0 {
		pawn::gen_moves(piece, if side { b.b_o } else { b.w_o }, if side { b.w_o } else { b.b_o }, side)
	} else if b.typ[1] & piece != 0 {
		knight::gen_moves(piece, if side { b.b_o } else { b.w_o })
	} else if b.typ[2] & piece != 0 {
		bishop::gen_moves(idx, if side { b.b_o } else { b.w_o }, if side { b.w_o } else { b.b_o })
	} else if b.typ[3] & piece != 0 {
		rook::gen_moves(idx, if side { b.b_o } else { b.w_o }, if side { b.w_o } else { b.b_o })
	} else if b.typ[4] & piece != 0 {
		queen::gen_moves(idx, if side { b.b_o } else { b.w_o }, if side { b.w_o } else { b.b_o })
	} else if b.typ[5] & piece != 0 {
		king::gen_moves(piece, if side { b.b_o } else { b.w_o })
	} else {
		panic!("A piece wasn't found at {}. Good luck.", positions::NAMES[idx as usize]);
	}
}
