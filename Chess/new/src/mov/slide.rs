
#![allow(arithmetic_overflow)]

// Feed [line occupancy][piece position] into this array to get a single u8
// containing the positions in that line that the piece can attack.
pub static mut SLIDE_TABLE: [[u8; 8]; 64] = [[0; 8]; 64];

pub fn precompute_slide_table() {
	unsafe {
		for f_pre in 0..64 {
			let f = f_pre << 1;
			for p in 0..8 {
				let mut i: u16 = 1 << (p + 1);
				let mut v: u16;
				let mut l: u16 = p + 1;
				
				v = (1 << {
					while i < 256 { if f & i != 0 { break }; l += 1; i <<= 1 }
					l
				} + 1) - 1;
				
				v ^= (1 << {
					if p == 0 {
						0
					} else {
						let mut l = p - 1; i = 1 << (p - 1);
						while i > 0 { if f & i != 0 { break }; i >>= 1; l = l.checked_sub(1).unwrap_or(0); }
						l
					}
				}) - 1;

				if (v as u8) != ((v & 255) as u8) { panic!("SHIT!"); }
				SLIDE_TABLE[f_pre as usize][p as usize] = v as u8;
			}
		}
	}
}
