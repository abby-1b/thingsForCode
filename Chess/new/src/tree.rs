#![allow(dead_code)]

use rand::Rng;
use crate::board::*;
use crate::positions;

pub struct Tree {
	pub mvf: u8, // The move executed to get here (from)
	pub mvt: u8, // The move executed to get here (to)
	pub wns: u32, // How many wins from this position
	pub lss: u32, // How many losses from this position

	// The moves possible from here, expressed as indices into
	// an array of `Tree` structs.
	pub mvs: Option<Vec<usize>>,
	pub prt: usize // The parent of this move
}

impl Tree {
	#[must_use]
	pub fn new(from: u8, to: u8, parent: usize) -> Self {
		Tree {
			mvf: from,
			mvt: to,
			wns: 1, // Start 1-1 to avoid divide by zero error
			lss: 1,

			mvs: None,
			prt: parent
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

	pub fn pick(&self) -> usize {
		#[cfg(debug_assertions)]
		if self.mvs.is_none() {
			panic!("No moves found!");
		}

		self.mvs.as_ref().unwrap()[
			rand::thread_rng().gen_range(0..self.mvs.as_ref().unwrap().len())
		]
	}

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
	pub t: usize, // The main tree branch for the current board
	pub b: Board, // The current active board

	pub branches: Vec<Tree>, // The array of branches
	available: Vec<bool>, // Array of available branches

	pub count: u64
}

impl MainTree {
	#[must_use]
	pub fn create() -> Self {
		let mut r = MainTree {
			t: 0,
			b: Board::new(),

			branches: vec!(Tree::new(0, 0, usize::MAX)),
			available: vec!(false),
			count: 1
		};
		r.b.gen_moves();
		r.gen_self_moves(0);
		r
	}

	#[inline]
	fn get_branch(&self, idx: usize) -> &Tree {
		#[cfg(debug_assertions)]
		if self.available[idx] {
			panic!("Tried accessing a branch that has been removed! {}", idx);
		} else if idx > self.available.len() {
			panic!("Tried accessing a branch that's higher than our branch count! {}", idx);
		}
		&self.branches[idx]
	}

	#[inline]
	fn get_branch_mut(&mut self, idx: usize) -> &mut Tree {
		#[cfg(debug_assertions)]
		if self.available[idx] {
			panic!("Tried accessing a branch that has been removed! {}", idx);
		} else if idx > self.available.len() {
			panic!("Tried accessing a branch that's higher than our branch count! {}", idx);
		}
		&mut self.branches[idx]
	}

	fn del_branch(&mut self, idx: usize, except: usize) {
		// If you don't want to spare a branch with `except`, just pass `usize::MAX`.
		#[cfg(debug_assertions)]
		if self.available[idx] {
			panic!("Tried removing a branch that has been removed! {} (!{})", idx, except);
		}

		self.count -= 1;

		// Delete the children (but spare the `except`!)
		// print!("({}) {{", idx);
		self.available[idx] = true;
		if self.branches[idx].mvs.is_some() {
			for a in 0..self.branches[idx].mvs.as_ref().unwrap().len() {
				let inner_branch = self.branches[idx].mvs.as_ref().unwrap()[a];
				if inner_branch == except {
					continue
				}
				self.del_branch(inner_branch, except);
			}
		}
		// print!("}},");
	}

	fn new_branch(&mut self, branch: Tree) -> usize {
		self.count += 1;

		for t in 0..self.available.len() {
			if self.available[t] {
				// Found an empty spot!
				self.branches[t] = branch;
				self.available[t] = false;
				return t
			}
		}

		// No empty spots found, make a new one
		self.branches.push(branch);
		self.available.push(false);

		return self.available.len() - 1
	}

	pub fn gen_self_moves(&mut self, branch: usize) {
		let mut mov_vec: Vec<usize> = Vec::new();

		// Copy them (as trees)
		for a in 0..self.b.mvs.len() {
			let n = Tree::new(self.b.mvs[a].0, self.b.mvs[a].1, branch);
			mov_vec.push(self.new_branch(n));
		}
		let t = self.get_branch_mut(branch);
		#[cfg(debug_assertions)]
		if t.mvs.is_some() {
			panic!("Tried re-generating moves for a branch!");
		}
		t.mvs = Some(mov_vec);
	}

	pub fn gen_moves(&mut self, board: &mut Board, branch: usize) {
		board.gen_moves();

		let mut mov_vec: Vec<usize> = Vec::new();

		// Copy them (as trees)
		for a in 0..board.mvs.len() {
			let n = Tree::new(board.mvs[a].0, board.mvs[a].1, branch);
			mov_vec.push(self.new_branch(n));
		}
		let t = self.get_branch_mut(branch);
		#[cfg(debug_assertions)]
		if t.mvs.is_some() {
			panic!("Tried re-generating moves for a branch!");
		}
		t.mvs = Some(mov_vec);
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
		self.b.gen_moves();

		// Check if the move has been analyzed
		mov_valid = 255;

		if self.get_branch_mut(self.t).mvs.is_some() {
			// Check if any moves have been analyzed
			for m in 0..self.get_branch(self.t).mvs.as_ref().unwrap().len() {
				let b = self.get_branch_mut(self.get_branch(self.t).mvs.as_ref().unwrap()[m]);
				if  b.mvf == from && b.mvt == to {
					mov_valid = m as u8; // There won't ever be more than 254 moves
					break;
				}
			}
		}

		let st = self.get_branch_mut(self.t);

		if mov_valid == 255 {
			// If the move hasn't been analyzed, just
			// make a new tree with this move
			self.del_branch(self.t, usize::MAX);
			self.t = self.new_branch(Tree::new(from, to, usize::MAX));

			// Also generate its moves
			println!("Branch is brand-new, generate moves for it!");
			self.gen_self_moves(self.t);
		} else {
			// If the move has been analyzed, move the branch to be the main one
			// If there's a memory leak, it sure as hell happens here

			// Get the new branch that we're moving to be the main branch
			let new_branch = st.mvs.as_ref().unwrap()[mov_valid as usize];

			#[cfg(debug_assertions)]
			if new_branch == self.t {
				panic!("SAME MOVE!");
			}

			// Delete the main branch, which also removes all its children, but
			// tell the function to exclude our new branch (and its children)
			self.del_branch(self.t, new_branch);

			// Move the branch down to be the main branch
			self.t = new_branch;

			// Set its parent to the max usize, which we're taking as an `undefined`.
			self.get_branch_mut(self.t).prt = usize::MAX;

			// Don't generate this mf's moves unless it doesn't have them
			if self.get_branch(self.t).mvs.is_none() {
				self.gen_self_moves(self.t);
			}
		}

		return true
	}

	pub fn analyze(&mut self, runs: u32, max_mvs: u16, branch_chance: f32) {
		let mut ib = self.b.copy();

		// if self.t.mvs.len() == 0 {
		// 	return
		// }
		// self.t.print(0);

		// Select a random leaf
		let mut curr_branch_idx = self.get_branch(self.t).pick();
		loop {
			let br = self.get_branch(curr_branch_idx);
			if br.mvs.is_none() {
				break
			}
			ib.mov(br.mvf, br.mvt);
			curr_branch_idx = br.pick();
		}

		// Advance the final branch's step + add leaves to the chosen branch
		let mut curr_branch = if rand::thread_rng().gen_range(0.0..1.0) < branch_chance {
			let curr_branch = self.get_branch(curr_branch_idx);
			ib.mov(curr_branch.mvf, curr_branch.mvt);

			self.gen_moves(&mut ib, curr_branch_idx);
			self.get_branch_mut(self.get_branch(curr_branch_idx).pick())
		} else {
			self.get_branch_mut(curr_branch_idx)
		};

		// Run x amount of games on the board
		let old_wns = curr_branch.wns;
		let old_lss = curr_branch.lss;
		for _ in 0..runs {
			let mut b = ib.copy();
			b.mvs.clear();
			b.rand_repeat(max_mvs);
			if b.val == 0.0 {
				b.rate_position();
			}
			if b.val > 10.0 {
				curr_branch.wns += 1
			} else if b.val < -10.0 {
				curr_branch.lss += 1
			}
		}
		let add_wns = curr_branch.wns - old_wns;
		let add_lss = curr_branch.lss - old_lss;

		// Descend back to the main branch
		let mut prt = curr_branch.prt;
		while prt != usize::MAX {
			let cb = self.get_branch_mut(prt);
			cb.wns += add_wns;
			cb.lss += add_lss;
			prt = cb.prt;
		}
	}

	pub fn do_best(&mut self) {
		let move_tree = self.get_branch(self.t);
		let mut best_idx: usize = 0;
		let mut best: f32 = if self.b.tmv { f32::INFINITY } else { f32::NEG_INFINITY };
		for b in 0..move_tree.mvs.as_ref().unwrap().len() {
			let t = self.get_branch(move_tree.mvs.as_ref().unwrap()[b]);
			let v = t.wns as f32 / t.lss as f32;
			if (self.b.tmv && v < best) || (!self.b.tmv && v > best) {
				best = v;
				best_idx = b;
			}
		}
		let m = self.get_branch(move_tree.mvs.as_ref().unwrap()[best_idx]);
		let f = m.mvf; let t = m.mvt;
		if !self.do_move(f, t) {
			panic!("MOVE NOT VALID! {} -> {} (out of {})", positions::NAMES[f as usize], positions::NAMES[t as usize], self.b.mvs.len());
		}
	}

	pub fn print(&mut self) {
		// self.print_branch(self.t, 0);
		Board::print(&self.b);
	}

	pub fn print_branch(&self, idx: usize, depth: u8) {
		let t = self.get_branch(idx);
		let pad = "  ".repeat(depth as usize);
		print!(
			"{}({} -> {} [{:05.2}% {} / {}]){}\n", pad,
			positions::NAMES[t.mvf as usize],
			positions::NAMES[t.mvt as usize],
			(t.wns as f32 / t.lss as f32) * 100.0, t.wns, t.lss,
			if t.mvs.is_none() || t.mvs.as_ref().unwrap().len() == 0 { "" } else { " {" }
		);
		if t.mvs.is_some() && t.mvs.as_ref().unwrap().len() != 0 {
			if depth < 1 {
				for b in t.mvs.as_ref().unwrap() {
					self.print_branch(*b, depth + 1);
				}
			}
			println!("{}}},\n", pad);
		}
	}
}
