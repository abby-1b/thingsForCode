#![allow(dead_code)]

use std::sync::{Arc};
use std::sync::atomic::{AtomicI8, Ordering};
use std::thread;
use std::io::{self, Write};

mod tree;

mod board;
use crate::board::*;

mod positions;

mod mov;
use mov::*;

// (number).count_ones() // Counts the number of set bits

#[allow(unused_mut)]
fn main() {
	// PRECOMPUTE
	slide::precompute_slide_table();

	// let mut t = tree::MainTree::create();
	// t.b.typ[0] = 0;
	// t.b.typ[1] = 0x00_20_00_00_00_00_00_00;
	// t.b.typ[2] = 0;
	// t.b.typ[3] = 0;
	// t.b.typ[4] = 0;
	// t.b.typ[5] = 0x08_00_00_00_00_00_00_08;
	// t.b.w_o = 0x00_20_00_00_00_00_00_08;
	// t.b.b_o = 0x08_00_00_00_00_00_00_00;
	// t.gen_moves();
	// for _ in 0..1000 {
	// 	t.analyze(100, 5);
	// }
	// t.print();
	// t.b.print_moves();

	// t.do_move(positions::F2, positions::D1);
	// t.print();

	// t.b.rand_repeat(0);
	// Board::print(&t.b);

    self_play();
	// player_play();
	
	// let mut t = tree::MainTree::create();
	// for _ in 0..80 {
	// 	t.analyze(50, 10);
	// }

	// t.do_move(positions::D2, positions::D4);

	// t.print();
}

fn player_play() {
	let mut t = tree::MainTree::create();
	t.print();
	// let shared_var = Arc::new(Mutex::new(Board::new()));
	// let shared_var_clone = shared_var.clone();

	let ready_state = Arc::new(AtomicI8::new(0));
	let ready_state_lock = ready_state.clone();

	let _handle = thread::spawn(move || {
		loop {
			let ready = ready_state_lock.load(Ordering::Relaxed);
			if ready == 1 || ready == 2 {
				// Tell the main thread that we stopped
				if ready == 1 { ready_state_lock.store(2, Ordering::Relaxed); }

				// Sleep and check if the main thread is ready again
				thread::sleep(std::time::Duration::from_millis(100));
				continue;
			}

			// TODO: Analyze inside here

			// Wait a bit!
			thread::sleep(std::time::Duration::from_millis(10));
		}
	});

	loop {
		print!(" > ");
		io::stdout().flush().unwrap();

		// Get input from the user
		let mut m = String::new();
		io::stdin().read_line(&mut m).unwrap();
	
		// Get the move index
		let idx: (u8, u8) = positions::parse_move_str(m);

		// Tell the thread to stop looking for new moves
		ready_state.store(1, Ordering::Relaxed);

		// Wait for the thread to actually stop
		while ready_state.load(Ordering::Relaxed) != 2 {
			thread::sleep(std::time::Duration::from_millis(10));
		}

		// Do the player's move
		if !t.do_move(idx.0, idx.1) {
			println!("Move not valid, doing random move.");
			// continue
		}

		// Analyze 
		for _ in 0..1000 {
			t.analyze(30, 10);
		}
		t.do_best();
		t.print();

		// Do the move on the board
		// b = b.mov_copy(idx.0, idx.1);
		// b.gen_moves();
		// b.analyze_mm(1.0, 0.25);
		// let ixd = b.ixd << 0;
		// b = b.board_best_move();
		// b.ixd = ixd;

		// Once we're done, give the board back to the thread.
		ready_state.store(1, Ordering::Relaxed);
	}
}

fn self_play() {
	println!("Started.");
	let mut t = tree::MainTree::create();
	for _ in 0..128 {
		for _ in 0..30 {
			t.analyze(30, u16::MAX);
		}
		t.print();
		t.do_best();
	}
}
