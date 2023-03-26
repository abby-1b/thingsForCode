#![allow(dead_code)]

use crate::mov;
use crate::positions;

use rand::Rng;

// HELPER FUNCTIONS (inline)

// Get a bit from a bitboard
#[inline(always)]
fn get_bit(b: u64, i: u8) -> bool {
	(b >> i) & 1 != 0
}

// Flip bytes in a u64
fn flip_u64(n: u64) -> u64 {
	(n << 56) |
	(n << 40 & 0x00FF000000000000) |
    (n << 24 & 0x0000FF0000000000) |
	(n <<  8 & 0x000000FF00000000) |
    (n >>  8 & 0x00000000FF000000) | 
	(n >> 24 & 0x0000000000FF0000) |
    (n >> 40 & 0x000000000000FF00) |
	(n >> 56)
}


pub struct Board {
	// Piece bitboards
	pub typ: Box<[u64]>,
	pub w_o: u64, // White occupancy bitboard
	pub b_o: u64, // Black occupancy bitboard

	// Analysis
	pub mvs: Vec<(u8, u8)>, // Current moves
	pub rmv: Vec<f32> // Move ratings
}

impl Board {
	pub fn new() -> Board {
		Board {
			typ: Box::new([
				// 0x0000000000000000, // [0] Pawn
				0x00FF00000000FF00, // [0] Pawn
				0x4200000000000042, // [1] Knight
				0x2400000000000024, // [2] Bishop
				0x8100000000000081, // [3] Rook
				0x0800000000000008, // [4] Queen
				0x1000000000000010  // [5] King
			]),
			w_o: 0xFFFF000000000000,
			b_o: 0x000000000000FFFF, 
			mvs: Vec::new(),
			rmv: Vec::new()
		}
	}

	pub fn print(b: &Board) {
		for y in 0..8 {
			print!("\x1b[0m\x1b[1m{}", 8 - y);
			for x in 0..8 {
				let i = x + y * 8;
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

	pub fn print_bitboard(b: u64) {
		for y in 0..8 {
			print!(" ");
			for x in 0..8 {
				print!(" {}", if get_bit(b, x + y * 8) { 1 } else { 0 });
			}
			print!("\n");
		}
	}

	pub fn print_moves(&self) {
		print!("[");
		for i in 0..self.mvs.len() {
			print!("({}, {}), ", positions::NAMES[self.mvs[i].0 as usize], positions::NAMES[self.mvs[i].1 as usize]);
		}
		print!("]");
	}

	// Gets the type of a piece at an index
	pub fn get_type(&self, idx: u8) -> usize {
		let from_idx = 1 << idx;
		for i in 0..6 {
			if self.typ[i] & from_idx != 0 { return i; }
		}
		panic!("Piece not found at index {}", idx);
	}

	// Moves a piece from one index to another
	pub fn mov(&mut self, from: u8, to: u8) -> u8 {
		let mut ate_type = 255;
		let to_change = 1 << to;
		let change = 1 << from | to_change;
		let typ = self.get_type(from);

		if self.b_o & change != 0 {
			// If the move eats a black piece
			self.b_o &= !change; // Remove the black piece from occupancy

			// Go through the pieces occupancies
			for p in 0..6 {
				if self.typ[p] & to_change != 0 {
					// When the correct type is found, remove it.
					ate_type = p as u8;
					self.typ[p] ^= to_change;
					break
				}
			}
		}

		self.typ[typ] ^= change;
		self.w_o ^= change;

		return ate_type;
	}

	pub fn undo_mov(&mut self, from: u8, to: u8, ate: u8) {
		let to_change = 1 << to;
		self.mov(to, from);
		if ate == 255 { return; }
		self.b_o |= to_change;
		self.typ[ate as usize] |= to_change;
	}

	pub fn mov_copy(&mut self, from: u8, to: u8) -> Board {
		let ate = self.mov(from, to);
		let ret = Board {
			typ: Box::new([
				flip_u64(self.typ[0]),
				flip_u64(self.typ[1]),
				flip_u64(self.typ[2]),
				flip_u64(self.typ[3]),
				flip_u64(self.typ[4]),
				flip_u64(self.typ[5])
			]),
			w_o: flip_u64(self.w_o),
			b_o: flip_u64(self.b_o), 
			mvs: Vec::new(),
			rmv: Vec::new()
		};
		self.undo_mov(from, to, ate);
		return ret
	}

	// Generate all moves possible on the current board
	pub fn gen_moves(&mut self) {
		if !self.mvs.is_empty() { panic!("Non-empty moveset found!"); }
		for y in 0..8 {
			for x in 0..8 {
				let from: u8 = x + y * 8;
				if !get_bit(self.w_o, from) { continue; }
				let mut piece_moves = mov::gen_moves(self, from);
				while piece_moves != 0 {
					let to: u8 = piece_moves.trailing_zeros() as u8;
					piece_moves ^= 1 << to;
					self.mvs.push((from, to));
					self.rmv.push(0f32);
				}
			}
		}
	}

	// pub fn rate_position(&mut self, ) {

	// }

	pub fn analyze(&mut self, mov_prc: f32, prc_dim: f32) {
		let mut ret_val = 0;
		for i in 0..self.mvs.len() {
			let mut nb = self.mov_copy(self.mvs[i].0, self.mvs[i].1);

			// Analyze board if random chance
			let n = rand::thread_rng().gen_range(0.0f32..1.0f32);
			if n < mov_prc {
				nb.gen_moves();
				ret_val += nb.analyze(mov_prc - prc_dim, prc_dim);
			}
		}
	}
}

