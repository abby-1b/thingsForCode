
const NOT_A: u64 = 0xFEFEFEFEFEFEFEFE;
const NOT_H: u64 = 0x7F7F7F7F7F7F7F7F;

pub fn gen_moves(piece: u64, t_o: u64) -> u64 {
	// This can be optimized by pre-computing!
	return (
		(piece & NOT_H) >> 7 |
		(piece        ) >> 8 |
		(piece & NOT_A) >> 9 |
		(piece & NOT_A) >> 1 |
		(piece & NOT_A) << 7 |
		(piece        ) << 8 |
		(piece & NOT_H) << 9 |
		(piece & NOT_H) << 1
	) & !t_o;
}

// TODO: implement king check. that'll fix everything.

// Assume the position is represented by a struct with a bitboard for each piece type
// and a color to move.

// fn is_king_in_check(position: &Position) -> bool {
//     let king_bb = position.get_king_bb(position.color_to_move);
//     let enemy_color = position.color_to_move.other();

//     // Check for attacks by pawns
//     let pawn_bb = position.get_piece_bb(PieceType::Pawn, enemy_color);
//     let pawn_attacks_bb = pawn_bb.shift(Direction::NorthWest) | pawn_bb.shift(Direction::NorthEast);
//     if pawn_attacks_bb.intersects(king_bb) {
//         return true;
//     }

//     // Check for attacks by knights
//     let knight_bb = position.get_piece_bb(PieceType::Knight, enemy_color);
//     let knight_attacks_bb = knight_bb.knight_moves();
//     if knight_attacks_bb.intersects(king_bb) {
//         return true;
//     }

//     // Check for attacks by bishops and queens
//     let bishop_bb = position.get_piece_bb(PieceType::Bishop, enemy_color) | position.get_piece_bb(PieceType::Queen, enemy_color);
//     let bishop_attacks_bb = bishop_bb.bishop_moves(position.all_pieces());
//     if bishop_attacks_bb.intersects(king_bb) {
//         return true;
//     }

//     // Check for attacks by rooks and queens
//     let rook_bb = position.get_piece_bb(PieceType::Rook, enemy_color) | position.get_piece_bb(PieceType::Queen, enemy_color);
//     let rook_attacks_bb = rook_bb.rook_moves(position.all_pieces());
//     if rook_attacks_bb.intersects(king_bb) {
//         return true;
//     }

//     // Check for attacks by the enemy king (unlikely, but possible in some edge cases)
//     let enemy_king_bb = position.get_piece_bb(PieceType::King, enemy_color);
//     let enemy_king_moves_bb = enemy_king_bb.king_moves();
//     if enemy_king_moves_bb.intersects(king_bb) {
//         return true;
//     }

//     // No attacks found
//     false
// }

