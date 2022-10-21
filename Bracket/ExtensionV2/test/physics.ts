
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
		let frm = num.replace(/[^.0-9]/g, "")
		if (frm[0] == ".") frm = "0" + frm

		let isExp = new Number(num).toString() == "NaN"
			, after = NaN
		if (isExp) {
			// Is an exponentiated number
			after = parseInt(num.split("^")[1].replace(/[^.0-9]/g, ""))
			frm = num.split("*")[0].replace(/[^.0-9]/g, "")
			if (frm[0] == ".") frm = "0" + frm
		}
		
		// Process the number
		if (frm.includes(".")) {
			// frm = frm == "" ? "0" : frm
			console.log(">", aft)

			this.num = parseInt(frm.replace(/\./g, ""))


			// this.tenExp = dIdx == -1 ? 0 : -(frm.length - dIdx - 1)
			// this.digits = frm.replace(/0{1,}\.0{1,}|^0{1,}|^([0-9]*?)0{1,}$/g, "").replace(/\./g, "").length

			// this.tenExp = dIdx == -1 ? 0 : 1 - dIdx
			// this.digits = frm.replace(/\./g, "").length
		} else {
			frm = frm.replace(/0{1,}\.0{1,}|^0{1,}|^([0-9]*?)0{1,}$/g, "")
			frm = frm == "" ? "0" : frm
			this.num = parseInt(frm), this.tenExp = frm.length - 1, this.digits = frm.length
		}

		if (isExp) {
			// Finish parsing exponent
			// this.tenExp -= after
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
console.log(new Num("1").toString())
console.log(new Num("02.5").toString())
console.log(new Num("0.005430").toString())
console.log(new Num("0.54").toString())
console.log(new Num("23").toString())
console.log(new Num("0").toString())

// console.log("\nExps:")
// console.log(new Num("10.250*10^3").toString())
// console.log(new Num("0.005300*10^-5").toString())
// console.log(new Num("52000*10^-3").toString())
// console.log(new Num("0*10^-3").toString())
