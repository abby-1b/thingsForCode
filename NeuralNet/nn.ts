
function plot(n: number) {
	let a = new Array(128).fill('.')
	a[Math.round(-Math.log(n) * 5)] = '#'
	console.log(a.join(""), n)
}

function bin(n: number, b: number): string {
	let r = n.toString(2)
	while (r.length < b) r = "0" + r
	return r
}
const letts = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
	buffer = new ArrayBuffer(8), intArr = new Uint32Array(buffer), fltArr = new Float64Array(buffer)
export function floatToBase64(n: number) {
	fltArr[0] = n
	let val = bin(intArr[0], 32) + bin(intArr[1], 32), ret = ""
	for (let i = 0; i < 11; ret += letts[parseInt(val.slice(-6), 2)], val = val.slice(0, -6), i++);
	return ret
}
export function base64ToFloat(b: string) {
	let val = ""
	for (let i = 10; i >= 0; val += bin(letts.indexOf(b[i--]), 6));
	intArr[0] = parseInt(val.slice(-64, -32), 2)
	intArr[1] = parseInt(val.slice(-32), 2)
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
			this.amt = this.currentLoss * 2
		}
		if (log) console.log("Loss:", this.currentLoss)
		return this.currentLoss
	}

	trainTo(toLoss: number, dat: number[][], lab: number[][], log = true): number {
		if (this.currentLoss == -1) this.currentLoss = this.loss(dat, lab)
		while (this.currentLoss > toLoss) plot(this.train(10000, dat, lab, false))
		if (log) console.log("Loss:", this.currentLoss)
		return this.currentLoss
	}

	serialize(): string {
		return this.size.map(e => letts[e]).join("") + " "
			+ this.ws.map(a => a.map(b => b.map(c => floatToBase64(c)))).flat(3).join("")
			+ this.bs.map(a => a.map(b => floatToBase64(b))).flat(2).join("")
	}
}
