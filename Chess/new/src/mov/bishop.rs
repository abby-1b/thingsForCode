use super::super::Board;
use super::slide;

// const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
// const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;

trait Shift { fn shift() -> isize; }

#[inline(always)]
fn shift(a: u64, amt: i8) -> u64 {
    if amt > 0 { a << amt as usize } else { a >> (-amt) as usize }
}

pub fn gen_moves(b: &Board, _piece: u64, idx: u8) -> u64 {
	let p_shift_n = 8 * (7 - (idx as i8 % 8) - idx as i8 / 8);
	let p_shift_i = 8 * ((idx as i8 % 8) - idx as i8 / 8);
	let piece_pos = (idx % 8) as usize;

	(shift(unsafe {
		slide::SLIDE_TABLE[((
			// Calculate vertical bits
			(shift(b.b_o | b.w_o, p_shift_n) & 0x0102040810204080)
	
			// Move them to the lowest 8 bits (for the slide table)
			.overflowing_mul(0x0101010101010101).0 >> 56
		) as usize >> 1) & 0b111111][piece_pos] as u64
	}.overflowing_mul(0x0101010101010101).0 & 0x0102040810204080,
		-p_shift_n
	) | shift(unsafe {
		slide::SLIDE_TABLE[((
			// Calculate vertical bits
			(shift(b.b_o | b.w_o, p_shift_i) & 0x8040201008040201)
	
			// Move them to the lowest 8 bits (for the slide table)
			.overflowing_mul(0x0101010101010101).0 >> 56
		) as usize >> 1) & 0b111111][piece_pos] as u64
	}.overflowing_mul(0x0101010101010101).0 & 0x8040201008040201,
		-p_shift_i
	)) & !b.w_o
}
