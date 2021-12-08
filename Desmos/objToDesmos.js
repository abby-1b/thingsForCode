
const fs = require('fs')

fs.readFile('skull.obj', 'utf8' , (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	data = data.split("\n")
		.map(e => e.split(" ").slice(1).map(n => parseFloat(n)))
	console.log(data[0], data[data.length - 1])
	
	let maxVal = 0
	for (let v = 0; v < data.length; v++)
		for (let c = 0; c < 3; c++)
			if (Math.abs(data[v][c]) > maxVal) maxVal = Math.abs(data[v][c])
	
	maxVal = 2 / maxVal
	
	let pF = ""
	let pT = ""
	let c, d;
	for (let v = 0; v < data.length; v += 2) {
		c = data[v].map(e => Math.round(e))
		c[2] = - c[2] - 10
		c[1] = c[1] - 4
		d = Math.sqrt(c[0] * c[0] + c[2] * c[2] + c[1] * c[1])
		if (d > 8)
			pF += "[" + [c[0], c[2], c[1]] + "]"

		c = data[(v + 1) % data.length].map(e => Math.round(e))
		c[2] = - c[2] - 10
		c[1] = c[1] - 4
		pT += "[" + [c[0], c[2], c[1]] + "]"
	}
	let ret = "pF=eval('[" + pF + "]'.replace(/\\%/g,'],['));pT=eval('[" + pT + "]'.replace(/\\%/g,'],['))"
	ret = ret.replace(/\]\[/g, "%")
	console.log(ret)
})
