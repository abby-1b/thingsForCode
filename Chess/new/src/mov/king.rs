use super::super::Board;

const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;

pub fn gen_moves(b: &Board, piece: u64) -> u64 {
	return (
		(piece & NOT_H) >> 7 |
		(piece        ) >> 8 |
		(piece & NOT_A) >> 9 |
		(piece & NOT_A) >> 1 |
		(piece & NOT_A) << 7 |
		(piece        ) << 8 |
		(piece & NOT_H) << 9 |
		(piece & NOT_H) << 1
	) & !b.w_o;
}
