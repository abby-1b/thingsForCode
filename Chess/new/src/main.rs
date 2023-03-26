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

    let mut b = Board::new();

	// for a in (0..100).rev() {
	// 	let mut t = 0f32;
	// 	for c in 0..10 {
	// 		t += b.analyze(1.0, (a as f32) / 100f32) as f32;
	// 	}
	// 	println!("{}, {}", (a as f32) / 100f32, (t as f32) / 100f32);
	// }
	// let t = b.analyze(1.0, 0.5);
	// println!("Total analysis: {}", t);

	// b.mov(positions::D1, positions::F6);
	// let m = gen_moves(&b, positions::F6);
	// Board::print_bitboard(m);

	// b.gen_moves();
	// b.print_moves();
}
