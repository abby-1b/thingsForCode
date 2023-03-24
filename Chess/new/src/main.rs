mod board;
use crate::board::*;

mod positions;

fn main() {
    let mut b = Board::new();
	b.mov(positions::A8, positions::F4);
	
	Board::print(b);
}
