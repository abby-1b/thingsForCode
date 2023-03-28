
const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;

pub fn gen_moves(piece: u64, t_o: u64) -> u64 {
	// This can be optimized by pre-computing!
	return (
		(piece & NOT_H) >> 7 |
		(piece        ) >> 8 |
		(piece & NOT_A) >> 9 |
		(piece & NOT_A) >> 1 |
		(piece & NOT_A) << 7 |
		(piece        ) << 8 |
		(piece & NOT_H) << 9 |
		(piece & NOT_H) << 1
	) & !t_o;
}
