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

	// The moves possible from here, expressed as indices into
	// an array of `Tree` structs.
	mvs: Option<Vec<usize>>,
	prt: usize // The parent of this move
}

impl Tree {
	pub fn new(from: u8, to: u8) -> Tree {
		Tree {
			mvf: from,
			mvt: to,
			wns: 1, // Start 1-1 to avoid divide by zero error
			lss: 1,

			mvs: Some(Vec::new()),
			prt: 0
		}
	}

	// pub fn gen_mvs(&mut self, mvs: &Vec<(u8, u8)>) {
	// 	#[cfg(debug_assertions)]
	// 	if self.mvs.is_some() {
	// 		panic!("Tried re-generating moves for a given tree!");
	// 	}

	// 	// Copy them (as trees)
	// 	for a in 0..mvs.len() {
	// 		// let b = Box::from(Tree::new(mvs[a].0, mvs[a].1));
	// 		// self.mvs.push(Box::into_raw(b));
	// 	}
	// }

	// pub fn pick(&self) -> usize {
	// 	#[cfg(debug_assertions)]
	// 	if self.mvs.is_none() {
	// 		panic!("No moves found!");
	// 	}
	// 	self.mvs.unwrap()[rand::thread_rng().gen_range(0..self.mvs.unwrap().len())]
	// }

	// pub fn print(&self, depth: u8) {
	// 	let pad = "  ".repeat(depth as usize);
	// 	print!(
	// 		"{}({} -> {} [{:05.2}% {} / {}]){}\n", pad,
	// 		positions::NAMES[self.mvf as usize],
	// 		positions::NAMES[self.mvt as usize],
	// 		(self.wns as f32 / self.lss as f32) * 100.0, self.wns, self.lss,
	// 		if self.mvs.is_none() || self.mvs.unwrap().len() == 0 { "" } else { " {" }
	// 	);
	// 	if self.mvs.is_some() && self.mvs.unwrap().len() != 0 {
	// 		for b in 0..self.mvs.unwrap().len() {
	// 			let t = unsafe { self.mvs[b].as_ref() };
	// 			if t.is_some() {
	// 				t.unwrap().print(depth + 1);
	// 			} else {
	// 				print!("{}***FUCK***\n", pad);
	// 			}
	// 		}
	// 		println!("{}}},\n", pad);
	// 	}
	// }
}

pub struct MainTree {
	pub t: usize,
	pub b: Board,

	pub a: Vec<Tree> // The array of trees
}

impl MainTree {
	pub fn create() -> MainTree {
		let mut r = MainTree {
			t: 0,
			b: Board::new(),

			a: Vec::new()
		};
		r.gen_moves();
		r
	}

	pub fn gen_moves(&mut self) {
		let t: &Tree = &self.a[0];
		self.b.gen_moves();

		#[cfg(debug_assertions)]
		if t.mvs.is_some() {
			panic!("Tried re-generating moves for a given tree!");
		}

		t.mvs = Some(Vec::new());

		// Copy them (as trees)
		for a in 0..self.b.mvs.len() {
			t.mvs.unwrap().push(self.a.len());
			self.a.push(Tree::new(self.b.mvs[a].0, self.b.mvs[a].1));
		}
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
			// self.t.prt = NULL_MUT;
		}

		self.b.gen_moves();
		if self.t.mvs.len() == 0 {
			self.t.gen_mvs(&self.b.mvs);
		}

		return true
	}

	pub fn analyze(&mut self, runs: u32, max_mvs: u16) {
		let mut ib = self.b.copy();
		// Select a random leaf
		if self.t.mvs.len() == 0 {
			return
		}
		self.t.print(0);
		let mut ct: *mut Tree = self.t.pick();
		println!("Before full pick");
		unsafe {
			dbg!(ct);
			while (&mut *ct).mvs.len() > 0 {
				ib.mov((&mut *ct).mvf, (&mut *ct).mvt);
				ct = (&mut *ct).pick();
			}
		}
		// println!("After full pick");
		unsafe { ib.mov((&mut *ct).mvf, (&mut *ct).mvt); }

		// TODO: add leaves to the chosen branch
		ib.gen_moves();
		unsafe {
			dbg!(ct);
			(&mut *ct).gen_mvs(&ib.mvs);
		// 	println!("MOVES: {}", (&mut *ct).mvs.len());
		// 	ct = (&mut *ct).pick();
		}

		// TODO: backpropagate the new wins/losses

		// Run x amount of games on the board
		// let old_wns = unsafe { (&mut *ct).wns };
		// let old_lss = unsafe { (&mut *ct).lss };
		for _ in 0..runs {
			let mut b = ib.copy();
			b.mvs.clear();
			b.rand_repeat(max_mvs);
			if b.val == 0.0 {
				b.rate_position();
				Board::print(&b);
			}
			if b.val > 10.0 {
				unsafe { (&mut *ct).wns += 1 }
			} else if b.val < -10.0 {
				unsafe { (&mut *ct).lss += 1 }
			}
		}
		unsafe { while (&mut *ct).prt != NULL_MUT {
			ct = (&mut *ct).prt;
		} }
	}

	pub fn do_best(&mut self) {
		let mut best_idx: usize = 0;
		let mut best: f32 = if self.b.tmv { f32::INFINITY } else { f32::NEG_INFINITY };
		for b in 0..self.t.mvs.len() {
			let t = unsafe { self.t.mvs[b].as_ref().unwrap() };
			let v = t.wns as f32 / t.lss as f32;
			if if self.b.tmv { v < best } else { v > best } {
				best = v;
				best_idx = b;
			}
		}
		let m = unsafe { self.t.mvs[best_idx].as_ref().unwrap() };
		println!(" >>> ");
		self.do_move(m.mvf, m.mvt);
	}

	pub fn print(&mut self) {
		// self.t.print(0);
		Board::print(&self.b);
	}
}
