
Array.prototype.logTuple = function() {
	console.log("( " + this.map(e => (typeof e === Fraction ? e.res() : e)).join(", ") + " )")
}

const gcd = (a, b) => {
	a = Math.abs(a); b = Math.abs(b)
	if (b > a) { var tmp = a; a = b; b = tmp }
	while (true) {
		if (b == 0) return a; a %= b
		if (a == 0) return b; b %= a
	}
}

class Fraction {
  constructor(a, b = 1) {
    this.top = a
    this.bottom = b
		this.simp()
  }
  
  add(f) {
		return new Fraction(f.top * this.bottom + this.top * f.bottom, f.bottom * this.bottom)
  }
	
	sub(f) {
		return new Fraction(this.top * f.bottom - f.top * this.bottom, f.bottom * this.bottom)
  }
	
	dvv(v) { return new Fraction(this.top * v.bottom, this.bottom * v.top) }
	
	mlv(v) { return new Fraction(this.top * v.top, this.bottom * v.bottom) }

	simp() {
		if (Number.isNaN(this.top) || Number.isNaN(this.bottom)) 
			return this
		const d = gcd(this.top, this.bottom)
		this.top = this.top / d
		this.bottom = this.bottom / d
		if (this.bottom < 0) {
			this.top *= -1
			this.bottom *= -1
		}
		return this
	}

	toString() {
		if (this.top == 0) return "0"
		else if (this.bottom == 1) return this.top + ""
		return `${this.top}/${this.bottom}`
	}

	res() { return this.top / this.bottom }
}

const sub = (m1, m2) => m1.map((e, i) => e.sub(m2[i]))
const add = (m1, m2) => m1.map((e, i) => e.add(m2[i]))
const mlv = (m, v) => m.map(e => e.mlv(v))
const dvv = (m, v) => m.map(e => e.dvv(v))
const swap = (m, a, b) => {
	const t = m[a]
	m[a] = m[b]
	m[b] = t
}

function solve(m) {
	m = m.map(r => r.map(v => typeof v === Fraction ? v : new Fraction(v)))

	// if (!m[1][1].res()) swap(m, 1, 2)
	// if (!m[0][0].res()) swap(m, 0, 1)

	m.map(e => e.logTuple())
	
	m[0] = dvv(m[0], m[0][0])
	
	m[1] = sub(m[1], mlv(m[0], m[1][0]))
	m[1] = dvv(m[1], m[1][1])
	
	m[2] = sub(m[2], mlv(m[0], m[2][0]))
	m[2] = sub(m[2], mlv(m[1], m[2][1]))
	m[2] = dvv(m[2], m[2][2])

	// console.log(m[0].map(e => e.res()))
	// console.log(m[1].map(e => e.res()))
	// console.log(m[2].map(e => e.res()))
	
	let z = m[2].slice(-1)[0]
	let y = m[1][3].sub(z.mlv(m[1][2]))
	let x = m[0][3].sub(y.mlv(m[0][1])).sub(z.mlv(m[0][2]))
	return [x, y, z]
}

function solved(s) {
	const m = [
		[1, 1, 1, s[0] + s[1] + s[2]],
		[0, 1, 1, s[1] + s[2]],
		[0, 0, 1, s[2]]
	].map(r => r.map(v => typeof v === Fraction ? v : new Fraction(v)))

	if (Math.random() < 0.5) swap(m, 0, 1)
	if (Math.random() < 0.5) swap(m, 1, 2)
	if (Math.random() < 0.5) swap(m, 2, 0)

	// m.map(e => e.logTuple())

	return m
}

// solve([
//   [3, 1, -1, 9],
//   [2, -2, 1, -3],
//   [1, 1, 1, 7]
// ]).logTuple()

solve(solved([7, 3, 8]))
