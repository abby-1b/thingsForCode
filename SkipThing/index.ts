
type Move = [number | Pos, number | Pos]
type Pos = [number, number]

class Board {
	moves = 0
	score: number

	pastMoves: Move[] = []

	b: [
		[number, number, number, number, number],
		[number, number, number, number],
		[number, number, number],
		[number, number],
		[number]
	] = [[1,1,1,1,0],[1,1,1,1],[1,1,1],[1,1],[1]]


	constructor(score = 14, from?: Board) {
		this.score = score
		if (!from) return
		from.b.map((e, i) => e.map((g, j) => {
			this.b[i][j] = g
		}))
	}

	print() {
		const ordA = [0, 0, 1, 0, 1, 0, 2, 1, 0, 2, 1, 3, 2, 3, 4]
			, ordB = [0, 1, 0, 2, 1, 3, 0, 2, 4, 1, 3, 0, 2, 1, 0]
		let o = 0
		for (let i = 0; i < 9; i++) {
			let n = Math.floor(3 - Math.abs((i - 4) / 2)),
				c: string[] = new Array(n).fill(n)
					.map((e, i) => this.b[ordA[o + i]][ordB[o + i]] + "")
			o += n
			console.log(c.map(e => "       " + e).join("").slice(i % 2 ? 3 : 7))
		}
	}

	idxToPos(idx: number): Pos {
		if (idx < 0 || idx > 14) throw new Error()
		return [
			[0, 1, 0, 2, 1, 3, 0, 2, 4, 1, 3, 0, 2, 1, 0][idx],
			[0, 0, 1, 0, 1, 0, 2, 1, 0, 2, 1, 3, 2, 3, 4][idx],
		]
	}
	posToIdx(pos: Pos): number {
		if (pos[1] < 0 || pos[1] > 4 || pos[0] < 0 || pos[0] > 4 - pos[1]) throw new Error()
		return [[0,1,2,3,4],[5,6,7,8],[9,10,11],[12,13],[14]][pos[1]][pos[0]]
	}
	isPosTaken(pos: Pos) {
		return this.isPosClear(pos) == false
	}
	isPosClear(pos: Pos): boolean {
		if (pos[0] < 0 || pos[0] > 4 || pos[1] < 0 || pos[1] > 4 - pos[0]) throw new Error("[dw]")
		return this.b[pos[1]][pos[0]] == 0
	}

	getMoves() {
		let ret: Move[] = []
		function forPos(fn: (x: number, y: number) => (void | undefined)) {
			for (let y = 0; y < 5; y++) for (let x = 0; x < 5 - y; x++) try {
				fn(y, x)
			} catch (e) {
				if (typeof e === "object" && !(e as Error).message.includes("[dw]")) throw e
				else "" //console.log("Skipped:", y, x)
			}
		}
		// diagonal down from left
		forPos((x, y) => { if (this.isPosClear([x, y]) && this.isPosTaken([x - 1, y]) && this.isPosTaken([x - 2, y])) ret.push([[x - 2, y], [x, y]]) })
		// diagonal down from right
		forPos((x, y) => { if (this.isPosClear([x, y]) && this.isPosTaken([x + 1, y - 1]) && this.isPosTaken([x + 2, y - 2])) ret.push([[x + 2, y - 2], [x, y]]) })
		// diagonal up from left
		forPos((x, y) => { if (this.isPosClear([x, y]) && this.isPosTaken([x - 1, y + 1]) && this.isPosTaken([x - 2, y + 2])) ret.push([[x - 2, y + 2], [x, y]]) })
		// diagonal up from right
		forPos((x, y) => { if (this.isPosClear([x, y]) && this.isPosTaken([x + 1, y]) && this.isPosTaken([x + 2, y])) ret.push([[x + 2, y], [x, y]]) })
		// up
		forPos((x, y) => { if (this.isPosClear([x, y]) && this.isPosTaken([x, y + 1]) && this.isPosTaken([x, y + 2])) ret.push([[x, y + 2], [x, y]]) })
		// down
		forPos((x, y) => { if (this.isPosClear([x, y]) && this.isPosTaken([x, y - 1]) && this.isPosTaken([x, y - 2])) ret.push([[x, y - 2], [x, y]]) })
		return ret
	}

	doMove(m: Move): Board {
		let f = typeof m[0] !== "number" ? m[0] : this.idxToPos(m[0])
		let s = typeof m[1] !== "number" ? m[1] : this.idxToPos(m[1])
		let mid = [(f[0] + s[0]) / 2, (f[1] + s[1]) / 2]
		let ret = new Board(this.score - 1, this)
		ret.b[f[1]][f[0]] = 0
		ret.b[mid[1]][mid[0]] = 0
		ret.b[s[1]][s[0]] = 1
		return ret
	}
}

let c = 0
let min = 9e9
function doAllMoves(b: Board, moves: Move[]) {
	// console.log(++c)
	c++
	if (b.score < min) console.log(min = b.score)
	if (b.score == 1) {
		console.log(b, c)
		console.log(moves.map(e => [b.posToIdx(e[0] as Pos).toString(16), b.posToIdx(e[1] as Pos).toString(16)].join("").toUpperCase()))
		throw new Error()
	}
	let m = b.getMoves()
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
	if (m.length == 0) return []
	for (let i = 0; i < m.length; i++) {
		doAllMoves(b.doMove(m[i]), [...moves, m[i]])
	}
}

try {
	doAllMoves(new Board(), [])
} catch (e) { }

