
// Generate two random cards
// 

const ALL_CARDS: Map<string | number, number | string> = new Map()
ALL_CARDS.set(":", -1) , ALL_CARDS.set(-1, ":")
ALL_CARDS.set("0", 0) , ALL_CARDS.set(0, "0")
ALL_CARDS.set("1", 1) , ALL_CARDS.set(1, "1")
ALL_CARDS.set("2", 2) , ALL_CARDS.set(2, "2")
ALL_CARDS.set("3", 3) , ALL_CARDS.set(3, "3")
ALL_CARDS.set("4", 4) , ALL_CARDS.set(4, "4")
ALL_CARDS.set("5", 5) , ALL_CARDS.set(5, "5")
ALL_CARDS.set("6", 6) , ALL_CARDS.set(6, "6")
ALL_CARDS.set("7", 7) , ALL_CARDS.set(7, "7")
ALL_CARDS.set("8", 8) , ALL_CARDS.set(8, "8")
ALL_CARDS.set("9", 9) , ALL_CARDS.set(9, "9")
ALL_CARDS.set("T", 10), ALL_CARDS.set(10, "T") // 10
ALL_CARDS.set("-", 11), ALL_CARDS.set(11, "-") // Negative
ALL_CARDS.set("!", 12), ALL_CARDS.set(12, "!") // Break

const DIFFERENT_CARDS = 13
const DECK_SIZE = 60

class Deck {
	cards: number[] = []
	constructor() {
		for (let i = 0; i < DECK_SIZE; i++) {
			this.cards.push(Math.floor(Math.random() * DIFFERENT_CARDS * 10) % DIFFERENT_CARDS)
		}
	}
}

interface BoardNode {
	id: number
	leftChild?: BoardNode
	rightChild?: BoardNode
}
/*
  0
 1 2
3 4 5
*/
class Board {
	nt: BoardNode
	constructor() {
		const mid: BoardNode = {id: -1}
		this.nt = {
			id: -1,
			leftChild : { id: -1, leftChild: {id: -1}, rightChild: mid },
			rightChild: { id: -1, leftChild: mid, rightChild: {id: -1} }
		}
	}

	log() {
		console.log(`  ${ALL_CARDS.get(this.nt.id)}\n ${ALL_CARDS.get(this.nt.leftChild!.id)} ${ALL_CARDS.get(this.nt.rightChild!.id)}\n${ALL_CARDS.get(this.nt.leftChild!.leftChild!.id)} ${ALL_CARDS.get(this.nt.leftChild!.rightChild!.id)} ${ALL_CARDS.get(this.nt.rightChild!.rightChild!.id)}`)
	}
}

const d = new Deck()
const b = new Board()

b.log()
