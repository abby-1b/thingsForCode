
function plot(n: number) {
	let a = new Array(140).fill('.')
	a[Math.round(-Math.log(n) * 4)] = '#'
	console.log(a.join(""), n)
}

const letts = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`1234567890-=~!@#$%^&*()_+[]\\{}|;':\",./<>?",
	buffer = new ArrayBuffer(8), intArr = new Uint32Array(buffer), fltArr = new Float64Array(buffer)
export function floatToBase(n: number) {
	fltArr[0] = n
	let r1 = "", r2 = "", v1 = intArr[0], v2 = intArr[1]
	for (let i = 0; i < 5; i++, r1 += letts[v1 % 94], v1 = Math.floor(v1 / 94), r2 += letts[v2 % 94], v2 = Math.floor(v2 / 94));
	return r1 + r2
}
export function baseToFloat(b: string) {
	let ns = b.split("").reverse()
	intArr[0] = 0, intArr[1] = 0
	ns.map((l, i) => intArr[+(i<5)] = intArr[+(i<5)] * 94 + letts.indexOf(l))
	return fltArr[0]
}

export class NN {
	size: number[]
	ws: number[][][]
	bs: number[][]
	amt = 2
	currentLoss = -1

	constructor(...size: number[]) {
		this.size = size
		this.ws = size.slice(1).map((e, i) => new Array(e).fill(0).map(n => new Array(size[i]).fill(0).map(m => Math.random())))
		this.bs = size.slice(1).map((e, i) => new Array(e).fill(0).map(m => Math.random()))
	}

	serialize(): string {
		return this.size.map(e => letts[e]).join("") + " "
			+ this.ws.map(a => a.map(b => b.map(c => floatToBase(c)))).flat(3).join("")
			+ this.bs.map(a => a.map(b => floatToBase(b))).flat(2).join("")
	}

	static from(f: string): NN {
		let sz = f.split(" ")[0].split("").map(e => letts.indexOf(e))
		let ns = f.split(" ")[1].match(/.{10}/g)?.map(e => baseToFloat(e)) as number[]
		let ret = new NN(...sz)
		ret.ws = ret.ws.map(a => a.map(b => b.map(c => ns.shift() as number)))
		ret.bs = ret.bs.map(a => a.map(b => ns.shift() as number))
		return ret
	}

	// activate(n: number): number { return 1 / (1 + Math.exp(-n)) } // Sigmoid
	activate(n: number): number { return Math.max(0.01 * n, n) } // Leaky ReLU

	forward(val: number[]): number[] {
		let cVal = val.map(e => e + 0)
		for (let l = 0; l < this.ws.length; l++)
			cVal = this.ws[l].map((n, i) => this.activate(this.bs[l][i] + n.map((e, i) => e * cVal[i]).reduce((a, b) => a + b)))
		return cVal
	}

	loss(dat: number[][], lab: number[][]): number {
		return dat.map(e => this.forward(e)).map((d, di) => d.map((n, i) => Math.pow(n - lab[di][i], 2))).flat(2).reduce((a, b) => a + b)
	}

	train(epochs: number, dat: number[][], lab: number[][], log = true): number {
		if (this.currentLoss == -1) this.currentLoss = this.loss(dat, lab)
		for (let e = 0; e < epochs; e++) {
			for (let l = 0; l < this.ws.length; l++) {
				let wrnd = this.ws[l].map(m => m.map(n => this.amt * (Math.random() - 0.5)))
				wrnd.map((m, mi) => m.map((n, ni) => this.ws[l][mi][ni] += n))
				let wla = this.loss(dat, lab)
				if (wla > this.currentLoss)
					wrnd.map((m, mi) => m.map((n, ni) => this.ws[l][mi][ni] -= n))
				else this.currentLoss = wla
			}

			for (let l = 0; l < this.ws.length; l++) {
				let brnd = this.bs[l].map(b => this.amt * (Math.random() - 0.5))
				brnd.map((b, bi) => this.bs[l][bi] += b)
				let bla = this.loss(dat, lab)
				if (bla > this.currentLoss)
					brnd.map((b, bi) => this.bs[l][bi] -= b)
				else this.currentLoss = bla
			}
			this.amt = this.currentLoss * 5
		}
		if (log) console.log("Loss:", this.currentLoss)
		return this.currentLoss
	}

	trainTo(toLoss: number, dat: number[][], lab: number[][], log = true): number {
		let t = performance.now()
		if (this.currentLoss == -1) this.currentLoss = this.loss(dat, lab)
		while (this.currentLoss > toLoss) {
			plot(this.train(10000, dat, lab, false))
			Deno.writeTextFileSync("char.nn", this.serialize())
		}
		if (log) {
			console.log("Loss:", this.currentLoss)		
			t = performance.now() - t
			console.log("Millis:", t)
			console.log("Minutes:", t / 60000)
		}
		return this.currentLoss
	}
}

	}
}
