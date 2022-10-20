
enum OutType {
	NORMAL,
	LATEX,
	DOCS_LATEX,

}

class Num {
	tenExp = 0 // The exponent of ten.
	num: number = 0 // The number. For example, in 1.52 * 10^3 this would be 152. Always an integer.
	digits = 0 // How many significant digits this has

	constructor(num: string) {
		let frm = num.replace(/[^0123456789.]/g, "")
		if (frm[0] == ".") frm = "0" + frm
		if (new Number(num).toString() == "NaN") {
			// Has math in it!
		} else {
			// No math, simple number.
			this.num = parseInt(frm.replace(/\./g, ""))
			let dIdx = frm.indexOf(".")
			this.tenExp = dIdx == -1 ? 0 : -(frm.length - dIdx - 1)
			this.digits = frm.replace(/0{1,}\.0{1,}|^0{1,}|^([0-9]*?)0{1,}$/g, "").replace(/\./g, "").length
		}
	}

	toFloat() {
		return this.num * 10 ** this.tenExp
	}
	
	toString(a: OutType = OutType.NORMAL) {
		let s = this.num.toString()
		s = this.digits < 2 ? this.num + "" : s[0] + "." + s.slice(1)
		if (a == OutType.NORMAL) return `${s} * 10^${this.tenExp}  [${this.digits}]`
		if (a == OutType.LATEX) return `${s}\\cdot10^{${this.tenExp}}`
		if (a == OutType.DOCS_LATEX) return `$$ \\bf{${s}\\cdot10^{${this.tenExp}}} $$`
	}
}

class Result {
	constructor(num: string) {

	}
}

function convert(str: string): Result {
	const parts = str.replace(/( |)[\/\\^*+-]( |)| {1,}(?= )/g, e => e.trim()).split(" ")
	const res = new Result(parts[0])

	return res
}

// console.log(convert("10 segundos a minutos"))
// console.log(convert("13000 m a cm"))
// console.log(convert("543.5000 g/cm^2 a lb/m^2"))
// console.log(convert("0.0032 horas a años"))

console.log("\nNums:")
console.log(new Num("1").toFloat())
console.log(new Num("02.5").toFloat())
console.log(new Num("0.005430").toFloat())
console.log(new Num("0.54").toFloat())
console.log(new Num("0").toFloat())

console.log("\nExps:")
console.log(new Num("01.25*10^3").toFloat())
console.log(new Num("0.005300*10^-5").toFloat())
console.log(new Num("52000*10^-3").toFloat())
