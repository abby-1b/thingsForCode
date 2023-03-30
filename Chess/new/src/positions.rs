#![allow(dead_code)]

pub const A8: u8 = 0;
pub const B8: u8 = 1;
pub const C8: u8 = 2;
pub const D8: u8 = 3;
pub const E8: u8 = 4;
pub const F8: u8 = 5;
pub const G8: u8 = 6;
pub const H8: u8 = 7;
pub const A7: u8 = 8;
pub const B7: u8 = 9;
pub const C7: u8 = 10;
pub const D7: u8 = 11;
pub const E7: u8 = 12;
pub const F7: u8 = 13;
pub const G7: u8 = 14;
pub const H7: u8 = 15;
pub const A6: u8 = 16;
pub const B6: u8 = 17;
pub const C6: u8 = 18;
pub const D6: u8 = 19;
pub const E6: u8 = 20;
pub const F6: u8 = 21;
pub const G6: u8 = 22;
pub const H6: u8 = 23;
pub const A5: u8 = 24;
pub const B5: u8 = 25;
pub const C5: u8 = 26;
pub const D5: u8 = 27;
pub const E5: u8 = 28;
pub const F5: u8 = 29;
pub const G5: u8 = 30;
pub const H5: u8 = 31;
pub const A4: u8 = 32;
pub const B4: u8 = 33;
pub const C4: u8 = 34;
pub const D4: u8 = 35;
pub const E4: u8 = 36;
pub const F4: u8 = 37;
pub const G4: u8 = 38;
pub const H4: u8 = 39;
pub const A3: u8 = 40;
pub const B3: u8 = 41;
pub const C3: u8 = 42;
pub const D3: u8 = 43;
pub const E3: u8 = 44;
pub const F3: u8 = 45;
pub const G3: u8 = 46;
pub const H3: u8 = 47;
pub const A2: u8 = 48;
pub const B2: u8 = 49;
pub const C2: u8 = 50;
pub const D2: u8 = 51;
pub const E2: u8 = 52;
pub const F2: u8 = 53;
pub const G2: u8 = 54;
pub const H2: u8 = 55;
pub const A1: u8 = 56;
pub const B1: u8 = 57;
pub const C1: u8 = 58;
pub const D1: u8 = 59;
pub const E1: u8 = 60;
pub const F1: u8 = 61;
pub const G1: u8 = 62;
pub const H1: u8 = 63;

pub const NAMES: [&str; 64] = ["A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8", "A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7", "A6", "B6", "C6", "D6", "E6", "F6", "G6", "H6", "A5", "B5", "C5", "D5", "E5", "F5", "G5", "H5", "A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "A3", "B3", "C3", "D3", "E3", "F3", "G3", "H3", "A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2", "A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1"];

pub fn parse_move_str(s: String) -> (u8, u8) {
	let m = s.to_lowercase();
	if m.len() >= 2 {
		let ff: u8 = (m.chars().nth(0).unwrap_or('a') as u32 - 97) as u8;
		let fr: u8 = (7 - (m.chars().nth(1).unwrap_or('8') as u32 - 49)) as u8;
		let tf: u8 = (m.chars().nth(2).unwrap_or('a') as u32 - 97) as u8;
		let tr: u8 = (7 - (m.chars().nth(3).unwrap_or('8') as u32 - 49)) as u8;
		(ff | fr * 8, tf | tr * 8)
	} else { (0, 0) }
}

pub fn print(from: u8, to: u8) {
	println!("{} -> {}", NAMES[from as usize], NAMES[to as usize]);
}
