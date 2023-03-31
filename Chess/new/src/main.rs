#![allow(dead_code)]

use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicI8, Ordering};
use std::thread;
use std::io::{self, Write};

mod tree;

mod board;
// use crate::board::*;

mod positions;

mod mov;
use mov::*;

// (number).count_ones() // Counts the number of set bits

#[allow(unused_mut)]
fn main() {
	// PRECOMPUTE
	slide::precompute_slide_table();

	// let mut t = tree::MainTree::create();
	// // 4rrk1/ppp2pb1/3p1npp/8/PQ1Pp3/1P2P1Pq/2P1bP1P/R1B1KR2 w
	// t.from_fen("8/8/2P5/4pk2/8/4K3/1nb3r1/b3n3 b");
	// // Board::print(&t.b);
	// for _ in 0..1000 {
	// 	t.analyze(100, 5, 0.3);
	// }
	// t.print();
	// t.do_best_new();

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
	let shared_var = Arc::new(Mutex::new(tree::MainTree::create()));
	let shared_var_lock = shared_var.clone();

	{
		// Print the board
		shared_var.lock().unwrap().print();
	}

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

			// Analyze the board inside here
			let mut t = shared_var_lock.lock().unwrap();

			// If it's too long, stop analyzing
			if t.count > 10000 {
				continue;
			}
			t.analyze(50, 30, 0.15);
			// println!("size: {}", t.count);

			// Wait a bit!
			// thread::sleep(std::time::Duration::from_millis(10));
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

		let mut t = shared_var.lock().unwrap();

		// Do the player's move
		let bef = t.count;
		if !t.do_move(idx.0, idx.1) {
			println!("Move not valid.");
			continue
		}
		let aft = t.count;
		for _ in 0..500 {
			t.analyze(50, 30, 0.15);
		}
		let re = t.count;

		// Analyze
		t.do_best_new();
		t.print();
		println!("bef: {}  aft: {}  re: {}", bef, aft, re);

		// Do the move on the board
		// b = b.mov_copy(idx.0, idx.1);
		// b.gen_moves();
		// b.analyze_mm(1.0, 0.25);
		// let ixd = b.ixd << 0;
		// b = b.board_best_move();
		// b.ixd = ixd;

		// Once we're done, give the board back to the thread.
		ready_state.store(0, Ordering::Relaxed);
	}
}

fn self_play() {
	println!("Started.");
	let mut t = tree::MainTree::create();
	for _ in 0..128 {
		for _ in 0..200 {
			t.analyze(30, 30, 0.15);
		}
		println!("\nsize: {} {}", t.count, t.branches.len());
		println!("0: {} -> {}", t.branches[0].mvf, t.branches[0].mvt);

		t.do_best_new();
		t.b.rate_position();
		t.print();
	}
}
