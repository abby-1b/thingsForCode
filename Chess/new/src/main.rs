use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicI8, Ordering};
use std::thread;
use std::io::{self, Write};

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

    player_play();
}

fn player_play() {
	let mut b = Board::new();
	Board::print(&b);
	// let shared_var = Arc::new(Mutex::new(Board::new()));
	// let shared_var_clone = shared_var.clone();

	let ready_state = Arc::new(AtomicI8::new(0));
	let ready_state_lock = ready_state.clone();
	// let mut ready = false;

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
		m = m.to_lowercase();
		let idx: (u8, u8) = if m.len() >= 2 {
			let ff = m.chars().nth(0).unwrap_or('a') as u32 - 97;
			let fr = 7 - (m.chars().nth(1).unwrap_or('8') as u32 - 49);
			let tf = m.chars().nth(2).unwrap_or('a') as u32 - 97;
			let tr = 7 - (m.chars().nth(3).unwrap_or('8') as u32 - 49);
			((ff | fr * 8) as u8, (tf | tr * 8) as u8)
		} else {
			(0, 0)
		};

		// Tell the thread to stop looking for new moves
		ready_state.store(1, Ordering::Relaxed);

		// Wait for the thread to actually stop
		while ready_state.load(Ordering::Relaxed) != 2 {
			thread::sleep(std::time::Duration::from_millis(10));
		}

		// Do the move on the board
		b = b.mov_copy(idx.0, idx.1);
		b.gen_moves();
		b.analyze(1.0, 0.25);
		let ixd = b.ixd << 0;
		b = b.board_best_move();
		b.ixd = ixd;
		Board::print(&b);

		// Once we're done, give the board back to the thread.
		ready_state.store(1, Ordering::Relaxed);
	}
}

#[allow(dead_code)]
fn self_play() {
	println!("Started.");
	let mut b = Board::new();
	let mut f = false;
	for _ in 0..128 {
		b.gen_moves();
		let t = b.analyze(1.0, 0.24);
		b = b.board_best_move();
		f = !f;
		if f {
			Board::print_flip(&b);
		} else {
			Board::print(&b);
		}
	}
}
