
const fs = require('fs')

fs.readFile('thing.obj', 'utf8' , (err, data) => {
	if (err) {
		console.error(err)
		return
	}
	data = data.split("\n")
		.map(e => e.split(" "))
		.filter(e => e[0] == "v")
		.map(e => e.slice(1).map(n => parseFloat(n)))
	console.log(data[0], data[data.length - 1])
	
	let maxVal = 0
	for (let v = 0; v < data.length; v++)
		for (let c = 0; c < 3; c++)
			if (Math.abs(data[v][c]) > maxVal) maxVal = Math.abs(data[v][c])
	
	maxVal = 2 / maxVal
	
	let pF = ""
	let c = null
	for (let v = 0; v < data.length; v += 1) {
		c = data[v].map(e => Math.round(e * 20))
		c[2] = - c[2] - 10
		c[1] = c[1] - 4
		pF += "[" + [c[0], -c[1], c[2]] + "]"
	}
	let ret = "pF=eval('[" + pF + "]'.replace(/\\%/g,'],['));"
	ret = ret.replace(/\]\[/g, "%")
	console.log(ret)
})

/*

Calc.setExpression({
  id: '27',
  type: 'table',
  columns: [
    {
      latex: 'f_x',
      values: pF.map(e => e[0])
    },
    {
      latex: 'f_y',
      values: pF.map(e => e[1])
    },
    {
      latex: 'f_z',
      values: pF.map(e => e[2])
    }
  ]
})

*/