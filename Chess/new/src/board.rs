
// Get a bit from a bitboard
#[inline(always)]
fn get_bit(b: u64, i: i32) -> bool {
	(b >> i) & 1 != 0
}

pub struct Board {
	// Piece bitboards
	typ: Box<[u64]>,
	w_o: u64, // White occupancy bitboard
	b_o: u64, // Black occupancy bitboard
}

impl Board {
	pub fn new() -> Board {
		Board {
			typ: Box::new([
				0x00FF00000000FF00,
				0x4200000000000042,
				0x2400000000000024,
				0x8100000000000081,
				0x0800000000000008,
				0x1000000000000010
			]),
			w_o: 0xFFFF000000000000,
			b_o: 0x000000000000FFFF
		}
	}

	pub fn print(b: Board) {
		for y in 0..8 {
			print!("\x1b[0m\x1b[1m{}", 8 - y);
			for x in 0..8 {
				let i = x + y * 8;
				let color: String;
				if get_bit(b.w_o, i) {
					// Print white
					let color = String::from("\x1b[1;32m");
					if      get_bit(b.typ[0], i) { print!(" {}♟︎", color); }
					else if get_bit(b.typ[1], i) { print!(" {}♞", color); }
					else if get_bit(b.typ[2], i) { print!(" {}♝", color); }
					else if get_bit(b.typ[3], i) { print!(" {}♜", color); }
					else if get_bit(b.typ[4], i) { print!(" {}♛", color); }
					else if get_bit(b.typ[5], i) { print!(" {}♚", color); }
				} else if get_bit(b.b_o, i) {
					// Print black
					let color = String::from("\x1b[1;31m");
					if      get_bit(b.typ[0], i) { print!(" {}♟︎", color); }
					else if get_bit(b.typ[1], i) { print!(" {}♞", color); }
					else if get_bit(b.typ[2], i) { print!(" {}♝", color); }
					else if get_bit(b.typ[3], i) { print!(" {}♜", color); }
					else if get_bit(b.typ[4], i) { print!(" {}♛", color); }
					else if get_bit(b.typ[5], i) { print!(" {}♚", color); }
				} else {
					// Print empty square and continue
					print!(" \x1b[0m•");
					continue;
				}
			}
			print!("\n");
		}
		print!("\x1b[0m\x1b[1m  a b c d e f g h\n");
	}

	// Gets the type of a piece at an index
	pub fn get_type(&self, idx: i32) -> usize {
		let from_idx = 1 << idx;
		for i in 0..5 {
			if self.typ[i] & from_idx != 0 { return i; }
		}
		return (-1).try_into().unwrap();
	}

	// Moves a piece from one index to another
	pub fn mov(&mut self, from: i32, to: i32) {
		let change = 1 << from | 1 << to;
		let typ = self.get_type(from);

		self.typ[typ] ^= change;
		if self.b_o & (1 << from) != 0 {
			self.b_o ^= change;
		} else {
			self.w_o ^= change;
		}
	}
}

