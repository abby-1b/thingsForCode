#![allow(dead_code)]

use rand::Rng;
use crate::board::*;
use crate::positions;

pub const NULL_MUT: *mut Tree = std::ptr::null_mut();

pub struct Tree {
	mvf: u8, // The move executed to get here (from)
	mvt: u8, // The move executed to get here (to)
	wns: u32, // How many wins from this position
	lss: u32, // How many losses from this position

	mvs: Vec<*mut Tree>, // The moves possible from here
	prt: *mut Tree // The parent of this move
}

impl Tree {
	pub fn new(from: u8, to: u8) -> Tree {
		Tree {
			mvf: from,
			mvt: to,
			wns: 0,
			lss: 0,

			mvs: Vec::new(),
			prt: NULL_MUT
		}
	}

	pub fn gen_mvs(&mut self, mvs: &Vec<(u8, u8)>) {
		for a in 0..mvs.len() {
			let b = Box::from(Tree::new(mvs[a].0, mvs[a].1));
			self.mvs.push(Box::into_raw(b));
		}
	}

	pub fn pick(&self) -> *mut Tree {
		self.mvs[rand::thread_rng().gen_range(0..self.mvs.len())]
		// self.mvs[0] // TODO: change this into random!
	}

	// pub fn print(&self) {
	// 	print!("{{");
	// 	for i in self.mvs {

	// 	}
	// 	print!("}}\n");
	// }
}

pub struct MainTree {
	t: Tree,
	b: Board
}

impl MainTree {
	pub fn create() -> MainTree {
		let mut r = MainTree {
			t: Tree::new(0, 0),
			b: Board::new()
		};
		r.b.gen_moves();
		r.t.gen_mvs(&r.b.mvs);
		r
	}

	pub fn do_move(&mut self, from: u8, to: u8) -> bool {
		// Check if the move is valid
		let mut mov_valid: u8 = 0;
		for m in 0..self.b.mvs.len() {
			if self.b.mvs[m].0 == from && self.b.mvs[m].1 == to {
				mov_valid = 1;
				break;
			}
		}
		// Return false if it's not valid
		if mov_valid == 0 { return false; }

		// Change the board
		self.b.mov(from, to);

		// Check if the move has been analyzed
		mov_valid = 255;
		for m in 0..self.t.mvs.len() {
			if unsafe { (*self.t.mvs[m]).mvf == from && (*self.t.mvs[m]).mvt == to } {
				mov_valid = m as u8; // There won't ever be more than 254 moves
				break;
			}
		}
		if mov_valid == 255 {
			// If the move hasn't been analyzed, just
			// make a new tree with this move
			self.t = Tree::new(from, to)
		} else {
			// If the move has been analyzed, move the branch down
			// If there's a memory leak, it sure as hell happens here
			let ptr = self.t.mvs[mov_valid as usize];
			let it = unsafe { std::ptr::read(ptr) };
			for i in 0..self.t.mvs.len() {
				unsafe { Box::from_raw(self.t.mvs[i]) };
			}
			self.t = it;

			// delete the parent pointer, deleting the parent node
			self.t.prt = NULL_MUT;
		}

		self.b.gen_moves();
		if self.t.mvs.len() == 0 {
			self.t.gen_mvs(&self.b.mvs);
		}

		return true
	}

	pub fn analyze(&mut self, runs: u32, max_mvs: u16) {
		let ib = self.b.copy();
		// Select a random leaf
		let mut ct: *mut Tree = self.t.pick();
		unsafe { while (&mut *ct).mvs.len() > 0 {
			// ib = ib.mov_copy((&mut *ct).mvf, (&mut *ct).mvt);
			ct = (&mut *ct).pick();
		} }

		// TODO: add a leaf to the chosen one
		// TODO: backpropagate the new wins/losses

		// Run x amount of games on the board
		// let old_wns = unsafe { (&mut *ct).wns };
		// let old_lss = unsafe { (&mut *ct).lss };
		for _ in 0..runs {
			let mut b = ib.copy();
			b.mvs.clear();
			b.rand_repeat(max_mvs);
			if b.val > 0.0 {
				unsafe { (&mut *ct).wns += 1 }
			} else {
				unsafe { (&mut *ct).lss += 1 }
			}
		}
		unsafe { while (&mut *ct).prt != NULL_MUT {
			ct = (&mut *ct).prt;
		} }
	}

	pub fn do_best(&mut self) {
		let mut best_idx: usize = 0;
		let mut best: f32 = f32::NEG_INFINITY;
		for b in 0..self.t.mvs.len() {
			let t = unsafe { self.t.mvs[b].as_ref().unwrap() };
			let v = t.wns as f32 / t.lss as f32;
			if v < best {
				best = v;
				best_idx = b;
			}
		}
		let m = unsafe { self.t.mvs[best_idx].as_ref().unwrap() };
		self.do_move(m.mvf, m.mvt);
	}

	pub fn print(&self) {
		// Board::print(&self.b);
		print!("{{\n");
		for b in 0..self.t.mvs.len() {
			let t = unsafe { self.t.mvs[b].as_ref().unwrap() };
			print!("  ({} -> {}  [{:05.2}% {} / {}]),\n", positions::NAMES[t.mvf as usize], positions::NAMES[t.mvt as usize], (t.wns as f32 / t.lss as f32) * 100.0, t.wns, t.lss);
		}
		println!(" }}");
		Board::print(&self.b);
	}
}
