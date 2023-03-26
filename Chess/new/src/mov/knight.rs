use super::super::Board;

const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;
const NOT_AB: u64 = 0xFCFCFCFCFCFCFCFC;
const NOT_GH: u64 = 0x3F3F3F3F3F3F3F3F;

pub fn gen_moves(b: &Board, piece: u64) -> u64 {
	return (
		(piece & NOT_GH) >>  6 |
		(piece & NOT_A ) >> 17 |
		(piece & NOT_H ) >> 15 |
		(piece & NOT_AB) >> 10 |
		(piece & NOT_AB) <<  6 |
		(piece & NOT_A ) << 15 |
		(piece & NOT_H ) << 17 |
		(piece & NOT_GH) << 10
	) & !b.w_o;
}
