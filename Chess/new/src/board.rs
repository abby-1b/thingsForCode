
// use crate::tree;

use std::collections::HashMap;

use crate::mov;
use crate::positions;

use rand::Rng;

const TYPE_VALUE: [u8; 5] = [
	1, // [0] Pawn
	3, // [1] Knight
	3, // [2] Bishop
	4, // [3] Rook
	9 // [4] Queen
];
const KING_COST: f32 = 99.0;
const KING_COST_HIGH: f32 = 999.0;

// HELPER FUNCTIONS (inline)

// Get a bit from a bitboard
#[inline(always)]
fn get_bit(b: u64, i: u8) -> bool {
	(b >> i) & 1 != 0
}

// Flip bytes in a u64
// fn flip_u64(n: u64) -> u64 {
// 	(n << 56) |
// 	(n << 40 & 0x00FF000000000000) |
//     (n << 24 & 0x0000FF0000000000) |
// 	(n <<  8 & 0x000000FF00000000) |
//     (n >>  8 & 0x00000000FF000000) | 
// 	(n >> 24 & 0x0000000000FF0000) |
//     (n >> 40 & 0x000000000000FF00) |
// 	(n >> 56)
// }

// fn flip_move(m: u8) -> u8 {
// 	(m & 7) | ((7 - (m >> 3)) << 3)
// }

/// BOARD
pub struct Board {
	// Piece bitboards
	pub typ: Box<[u64]>,
	pub w_o: u64, // White occupancy bitboard
	pub b_o: u64, // Black occupancy bitboard

	// Analysis
	pub mvs: Vec<(u8, u8)>, // Current moves

	pub val: f32, // The value (or rating) for this board
	pub tmv: bool // The side that has to move
}

impl Board {
	pub fn new() -> Board {
		Board {
			typ: Box::new([
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
			val: 0.0,
			tmv: false
		}
	}

	pub fn from_fen(&mut self, fen: &str) {
		self.typ[0] = 0; self.typ[1] = 0;
		self.typ[2] = 0; self.typ[3] = 0;
		self.typ[4] = 0; self.typ[5] = 0;
		self.w_o = 0; self.b_o = 0;
		let mut map = HashMap::new();
		map.insert('p', 0b0_000); map.insert('P', 0b1_000);
		map.insert('n', 0b0_001); map.insert('N', 0b1_001);
		map.insert('b', 0b0_010); map.insert('B', 0b1_010);
		map.insert('r', 0b0_011); map.insert('R', 0b1_011);
		map.insert('q', 0b0_100); map.insert('Q', 0b1_100);
		map.insert('k', 0b0_101); map.insert('K', 0b1_101);
		let mut idx: u8 = 0;
		for c in fen.chars() {
			let n = c as u8;
			if idx == 64 {
				idx += 1;
				continue
			} else if idx == 65 {
				self.tmv = c == 'b';
				break
			}
			if n > 48 && n < 58 {
				idx += n - 48;
			} else if c == '/' {
				// Ignore slashes
			} else if c == ' ' {
				idx = 64;
			} else {
				let pp: u64 = 1 << idx;
				let s = *map.get(&c).unwrap();
				self.typ[s & 0b111] |= pp;
				if s & 0b1_000 == 0 {
					self.b_o |= pp;
				} else {
					self.w_o |= pp;
				}
				idx += 1;
			}
		}
		self.gen_moves();
	}

	pub fn copy(&self) -> Board {
		Board {
			typ: self.typ.clone(),
			w_o: self.w_o,
			b_o: self.b_o,
			mvs: self.mvs.to_vec(),
			val: self.val,
			tmv: self.tmv
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
		print!("\x1b[0m\x1b[1m  a b c d e f g h\x1b[0m [{}] {}\n", if b.tmv {"blk"} else {"wht"}, b.val);
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
		print!("[\n");
		for i in 0..self.mvs.len() {
			print!("    ({}, {}),\n", positions::NAMES[self.mvs[i].0 as usize], positions::NAMES[self.mvs[i].1 as usize]);
		}
		println!("] len: {}", self.mvs.len());
	}

	// Gets the type of a piece at an index
	pub fn get_type(&self, idx: u8) -> usize {
		let from_idx = 1 << idx;
		for i in 0..6 {
			if self.typ[i] & from_idx != 0 { return i; }
		}
		Board::print(self);
		panic!("Piece not found at index {}", positions::NAMES[idx as usize]);
	}

	// Moves a piece from one index to another
	pub fn mov(&mut self, from: u8, to: u8) -> u8 {
		let ate_type = 255;
		let from_change = 1 << from;
		let to_change = 1 << to;
		let change = from_change | to_change;
		let typ = self.get_type(from);

		if self.tmv {
			if to_change & self.w_o != 0 {
				let eat_typ = self.get_type(to);
				self.typ[eat_typ] ^= to_change;
				self.w_o ^= to_change;
			}
			self.b_o ^= change;
		} else {
			if to_change & self.b_o != 0 {
				let eat_typ = self.get_type(to);
				self.typ[eat_typ] ^= to_change;
				self.b_o ^= to_change;
			}
			self.w_o ^= change;
		}
		self.typ[typ] ^= change;

		// Clear moves and switch side to move
		self.mvs.clear();
		self.tmv = !self.tmv;

		return ate_type;
	}

	pub fn mov_rand(&mut self) {
		let m = self.mvs[rand::thread_rng().gen_range(0..self.mvs.len())];
		self.mov(m.0, m.1);
	}

	// Generate all moves possible on the current board
	pub fn gen_moves(&mut self) {
		// Warn if in debug
		// #[cfg(debug_assertions)]
		// if !self.mvs.is_empty() { panic!("Non-empty moveset found!"); }
		self.mvs.clear();

		// Get the current bitboard
		let bb = if self.tmv { self.b_o } else { self.w_o };

		// If our king is dead, there are no moves
		if self.typ[5] & self.b_o == 0 {
			self.val = KING_COST_HIGH;
			return
		} else if self.typ[5] & self.w_o == 0 {
			self.val = -KING_COST_HIGH;
			return
		}

		// Loop through all positions
		for y in 0..8 {
			for x in 0..8 {
				// TODO: don't include illegal moves (check)
				let from: u8 = x + y * 8;
				if !get_bit(bb, from) { continue; }
				let mut piece_moves = mov::gen_moves(self, from, self.tmv);
				while piece_moves != 0 {
					let to: u8 = piece_moves.trailing_zeros() as u8;
					piece_moves ^= 1 << to;
					self.mvs.push((from, to));
				}
			}
		}
	}

	pub fn rate_position(&mut self) {
		// let self_moves = self.mvs.len();
		// self.tmv = !self.tmv;
		// self.mvs.clear();
		// self.gen_moves();
		// let other_moves = self.mvs.len();
		// self.tmv = !self.tmv;
		// self.mvs.clear();

		self.val =
			if self.typ[5] & self.w_o == 0 { -KING_COST } else { 0.0 } +
			if self.typ[5] & self.b_o == 0 { KING_COST } else { 0.0 } + ((
			(self.typ[0] & self.w_o).count_ones() as u8 * TYPE_VALUE[0] +
			(self.typ[1] & self.w_o).count_ones() as u8 * TYPE_VALUE[1] +
			(self.typ[2] & self.w_o).count_ones() as u8 * TYPE_VALUE[2] +
			(self.typ[3] & self.w_o).count_ones() as u8 * TYPE_VALUE[3] +
			(self.typ[4] & self.w_o).count_ones() as u8 * TYPE_VALUE[4]
		) as f32 - (
			(self.typ[0] & self.b_o).count_ones() as u8 * TYPE_VALUE[0] +
			(self.typ[1] & self.b_o).count_ones() as u8 * TYPE_VALUE[1] +
			(self.typ[2] & self.b_o).count_ones() as u8 * TYPE_VALUE[2] +
			(self.typ[3] & self.b_o).count_ones() as u8 * TYPE_VALUE[3] +
			(self.typ[4] & self.b_o).count_ones() as u8 * TYPE_VALUE[4]
		) as f32) as f32 + (
			(self.w_o & 0x00003C3C3C3C0000).count_ones() as f32 -
			(self.b_o & 0x00003C3C3C3C0000).count_ones() as f32
		) * 0.1 + (
			(self.w_o & 0x007E7E7E7E7E7E00).count_ones() as f32 -
			(self.b_o & 0x007E7E7E7E7E7E00).count_ones() as f32
		) * 0.05
		//  + (
		// 	self_moves as f32
		// ) * 0.01 - (
		// 	other_moves as f32
		// ) * 0.01
	}

	pub fn rand_repeat(&mut self, max: u16) {
		let mut i = 0;
		self.gen_moves();
		while self.mvs.len() > 0 {
			self.mov_rand();
			self.gen_moves();

			// Stop if reached max
			if i >= max {
				if self.val == 0.0 {
					self.rate_position()
				}
				break
			}
			i += 1;
		}
	}
}
