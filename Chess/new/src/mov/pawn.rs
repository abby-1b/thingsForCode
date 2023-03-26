use super::super::Board;

const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
const IS_2 : u64 = 0x00FF000000000000;

pub fn gen_moves(b: &Board, piece: u64) -> u64 {
	return (
		(piece & NOT_A) >> 9 |
		(piece & NOT_H) >> 7
	) & b.b_o | (piece & IS_2) >> 16 | piece >> 8;
}

#[allow(dead_code)]
pub fn gen_all_pawn_moves(b: &Board) -> u64 {
	let pieces = b.typ[0] & b.w_o;
	return (
		(pieces & NOT_A) >> 9 |
		(pieces & NOT_H) >> 7
	) | (pieces & IS_2) >> 16 | pieces >> 8;
}
