const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;

const IS_2 : u64 = 0x00FF000000000000;
const IS_7 : u64 = 0x000000000000FF00;

pub fn gen_moves(piece: u64, t_o: u64, o_o: u64, side: bool) -> u64 {
	return if !side {
		((piece & NOT_A) >> 9 | (piece & NOT_H) >> 7)
		& t_o | (((piece & IS_2) >> 16) | piece >> 8) & !(t_o | o_o)
	} else {
		((piece & NOT_A) << 9 | (piece & NOT_H) << 7)
		& t_o | (((piece & IS_7) << 16) | piece << 8) & !(t_o | o_o)
	}
}
