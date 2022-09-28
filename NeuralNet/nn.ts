
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

// Math.random = (): number => 1

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

	stringShape(): string {
		let ret = `[Input: ${this.size[0]} nodes]\n`
		this.size.map(e => ret += "* ".repeat(e) + "\n")
		return ret + `[Output: ${this.size[this.size.length - 1]} nodes]`
	}

	static from(f: string): NN {
		let sz = f.split(" ")[0].split("").map(e => letts.indexOf(e))
		let ns = f.split(" ")[1].match(/.{10}/g)?.map(e => baseToFloat(e)) as number[]
		let ret = new NN(...sz)
		ret.ws = ret.ws.map(a => a.map(b => b.map(c => ns.shift() as number)))
		ret.bs = ret.bs.map(a => a.map(b => ns.shift() as number))
		return ret
	}

	// activate(n: number): number { return Math.tanh(n) } // Hyperbolic Tangent
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

export class RNN extends NN {
	surfaceLayers: number[]
	revLayers: number[]
	innerState: number[]
	constructor(surfaceLayers: number[], revLayers: number[]) {
		if (surfaceLayers.length != revLayers.length) console.warn("WARNING: mismatch layer numbers!")
		if (revLayers[revLayers.length - 1] != revLayers[0]) console.warn("WARNING: revolutional layers size mismatch!")
		super(...surfaceLayers.map((e, i) => e + revLayers[i]))
		this.innerState = new Array(revLayers[0]).fill(0)
		this.surfaceLayers = surfaceLayers
		this.revLayers = revLayers
	}

	// TODO: Implement serialization, loading, and stringShape
	
	lossRNN(dat: number[][][], lab: number[][][], untilFn: (vals: number[]) => boolean, sw = false) {
		let diff = 0
		dat.map(e => this.forwardRNN(e, untilFn))
			.map((n, i) => {
				let li = 0
				if (sw) console.log(n, lab[i])
				while (n.length > 0 && (++li) < lab[i].length) n.shift()?.map((e, ei) => diff += Math.pow(e - lab[i][li][ei], 2))
				if (sw) console.log(lab[i].slice(li))
				if (sw) console.log()
				n.flat(2).map(e => diff += Math.pow(e, 2) * 10)
				lab[i].slice(li).flat(1).map(e => diff += Math.pow(e, 2) * 10)
			})
		return diff
	}

	forwardRNN(vals: number[][], untilFn: (vals: number[]) => boolean): number[][] {
		this.innerState = new Array(this.revLayers[0]).fill(0)
		let r: number[] = []
		for (let i = 0; i < vals.length; i++) {
			r = super.forward([...vals[i], ...this.innerState])
			r.slice(this.surfaceLayers[this.surfaceLayers.length - 1]).map((e, i) => this.innerState[i] += e)
		}
		let ret: number[][] = [], i = 5
		while ((i--) > 0 && !untilFn(r)) {
			ret.push(r.slice(0, this.surfaceLayers[0]))
			r = super.forward([...new Array(this.surfaceLayers[0]).fill(0), ...this.innerState])
			r.slice(this.surfaceLayers[this.surfaceLayers.length - 1]).map((e, i) => this.innerState[i] += e)
		}
		return ret // r.slice(0, this.surfaceLayers[this.surfaceLayers.length - 1])
	}

	trainRNN(epochs: number, dat: number[][][], lab: number[][][], untilFn: (vals: number[]) => boolean) {
		if (this.currentLoss == -1) this.currentLoss = this.lossRNN(dat, lab, untilFn)
		for (let e = 0; e < epochs; e++) {
			for (let l = 0; l < this.ws.length; l++) {
				let wrnd = this.ws[l].map(m => m.map(n => this.amt * (Math.random() - 0.5)))
				wrnd.map((m, mi) => m.map((n, ni) => this.ws[l][mi][ni] += n))
				let wla = this.lossRNN(dat, lab, untilFn)
				if (wla > this.currentLoss)
					wrnd.map((m, mi) => m.map((n, ni) => this.ws[l][mi][ni] -= n))
				else this.currentLoss = wla
			}

			for (let l = 0; l < this.ws.length; l++) {
				let brnd = this.bs[l].map(b => this.amt * (Math.random() - 0.5))
				brnd.map((b, bi) => this.bs[l][bi] += b)
				let bla = this.lossRNN(dat, lab, untilFn)
				if (bla > this.currentLoss)
					brnd.map((b, bi) => this.bs[l][bi] -= b)
				else this.currentLoss = bla
			}
			this.amt = this.currentLoss * 5
			// console.log(this.ws[0][0])
			console.log(this.currentLoss)
		}
	}
}
