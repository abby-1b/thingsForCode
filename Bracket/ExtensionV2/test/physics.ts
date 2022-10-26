
enum OutType {
	NORMAL,
	LATEX,
	BOLD_LATEX,
}

class Num {
	num: number = 0 // The number. For example, in 1.52 * 10^3 this would be 152. Always an integer.
	digits = 0 // The number of working digits in the number

	constructor(num?: string) {
		if (!num) return
		let frm = num.replace(/[^.0-9-]/g, "")
		if (frm[0] == ".") frm = "0" + frm

		let isExp = new Number(num).toString() == "NaN"
			, after = NaN
		if (isExp) {
			// Is an exponentiated number
			num = num.replace(/ /g, "")
			after = parseInt(num.split("^")[1].replace(/[^.0-9-]/g, ""))
			frm = num.split("*")[0].replace(/[^.0-9-]/g, "")
			if (frm[0] == ".") frm = "0" + frm
		}
		
		// Process the number
		this.num = parseFloat(frm)
		this.digits = frm.replace(/0{1,}\.0{1,}|^0{1,}|(?<=^[0-9])0{1,}$/g, "").replace(/\./g, "").length

		if (isExp) {
			// Finish parsing exponent
			this.num *= 10 ** after
		}
	}

	toFloat() {
		return this.num
	}
	
	toString(a: OutType = OutType.NORMAL) {
		let num = this.num
		let tenExp = 0
		while (num >= 10) num *= 0.1, tenExp++
		if (num != 0) while (num <   1) num *=  10, tenExp--
		num = Math.round(num * (10 ** (this.digits - 1))) / (10 ** (this.digits - 1))
		let s = num.toString()
		if (s.length >= 16) s = parseFloat(s.slice(0, -1)).toString()
		s = s.replace(".", "")
		while (s.length > this.digits) s = s.slice(0, -1) 
		while (s.length < this.digits) s += "0"
		if (this.digits > 1) s = s[0] + "." + s.slice(1)
		if (a == OutType.LATEX) return `${s}\\cdot10^{${tenExp}}`
		return `${s} * 10^${tenExp}`
	}

	copy(): Num {
		let n = new Num()
		n.num = this.num
		n.digits = this.digits
		return n
	}
}

class Result {
	eqs: string[] = []
	n: Num
	latex: boolean

	mult = " * "
	div = " / "
	arrow = " > "

	constructor(num: Num, latex = false) {
		this.n = num
		this.latex = latex

		if (latex)
			this.mult = "\\cdot",
			this.div = "\\div",
			this.arrow = "\\rightarrow"

		this.eqs.push(this.nStr())
	}

	nStr() {
		return this.n.toString(this.latex ? OutType.LATEX : OutType.NORMAL)
	}

	multiply(f: number) {
		let res = this.nStr() + this.mult + f + this.arrow
		this.n.num *= f
		res += this.nStr()
		this.eqs.push(res)
	}
	divide(f: number) {
		let res = this.nStr() + this.div + f + this.arrow
		this.n.num /= f
		res += this.nStr()
		this.eqs.push(res)
	}

	toString() {
		if (this.latex) return this.eqs.slice(1).map(e => "\\\\\\bf{" + e + "}").join("")
		else return this.eqs.join("\n")
	}
}

const specialConversions: {[key: string]: (string | number)[][]} = {
	"time": [
		[1, "s", "segundo", "segundos", "second", "seconds", "sec", "secs"],
		[60, "min", "minuto", "minutos", "minute", "minutes", "mins"],
		[3600, "hr", "hrs", "hour", "hours", "hora", "horas"]
	],
	"length": [
		[0.3048, "pie", "ft", "foot", "\""]
	]
}

const conversions: {[key: string]: number} = {
	"Y": 24, "Z": 21,
	"E": 18, "P": 15,
	"T": 12, "G": 9,
	"M": 6, "k": 3,
	"h": 2, "da": 1,
	"d": -1, "c": -2,
	"m": -3, "μ": -6,
	"µ": -6, "u": -6,
	"n": -9, "p": -12,
	"f": -15, "a": -18,
	"z": -21, "y": -24
}

function getConversion(unit: string): [string, number] {
	for (let k in specialConversions) {
		for (let t = 0; t < specialConversions[k].length; t++) {
			let a = specialConversions[k][t]
			if (a.includes(unit)) {
				return [k, t]
			}
		}
	}
	return ["", -1]
}

function getFinalConv(unit: string) {
	if (unit.length == 1) return 1
	console.log("Couldn't find unit:", unit)
	return 10 ** conversions[unit.slice(0, -1)]
}

function leftExp(unit: string): string {
	while ("0123456789".includes(unit[unit.length - 1])) unit = unit.slice(0, -1)
	if (unit[unit.length - 1] == '^') unit = unit.slice(0, -1)
	return unit
}
function rightExp(unit: string): number {
	let v = ""
	while ("0123456789".includes(unit[unit.length - 1])) v = unit[unit.length - 1] + v, unit = unit.slice(0, -1)
	return parseInt(v) || 1
}

function convert(str: string) {
	const parts = str.replace(/( |)[\/\\^*+-]( |)| {1,}(?= )/g, e => e.trim()).split(" ")
	const res = new Result(new Num(parts[0]), true)

	let spacialExp = rightExp(parts[1])
	// let toExp = parseInt(parts[1].split("^")[1]) ?? 0

	parts[1] = leftExp(parts[1]), parts[3] = leftExp(parts[3])

	let fromPath = getConversion(parts[1])
	let toPath = getConversion(parts[3])
	
	let fromNum = fromPath[1] == -1 ? getFinalConv(parts[1]) : specialConversions[fromPath[0]][fromPath[1]][0] as number
	let toNum = toPath[1] == -1 ? getFinalConv(parts[3]) : specialConversions[toPath[0]][toPath[1]][0] as number
	
	let conversion = (fromNum ** spacialExp) / (toNum ** spacialExp)
	// console.log(fromNum, toNum, conversion, spacialExp)
	res.multiply(conversion)

	return res
}

// console.log(convert("10 segundos a minutos").toString())
// console.log(convert("1 m^3 a cm^3").toString())
// console.log(convert("543.5000 g/cm^2 a lb/m^2"))
// console.log(convert("0.0032 horas a minutos").toString())
// console.log(convert("3.41 cm^3 to dm^3").toString())
console.log(convert("1.00 ft to m").toString())
