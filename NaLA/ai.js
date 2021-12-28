const {readFile, writeFileSync} = require('fs')

let dat = null
let hist = ["", "", ""]

function strDist(str1, str2) {
	const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
	for (let i = 0; i <= str1.length; i += 1) { track[0][i] = i }
	for (let j = 0; j <= str2.length; j += 1) { track[j][0] = j }
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
			track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + indicator)
		}
	}
	return track[str2.length][str1.length]
}

function shuffleArr(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

function load(file) {
readFile(file, "utf-8", (err, data) => {
		if (err) {
			console.error(err)
			return
		}
		if (data == "") dat = {res: [], vars: []}
		else dat = JSON.parse(data)
	})
}

function getResponse(str) {
	hist.unshift(str)
	let nw = JSON.stringify(hist)
	if (dat.res.map(e => JSON.stringify(e)).indexOf(nw) == -1) {
		console.log("✨")
		dat.res.push(hist.slice(0))
	}

	let res = ""
	if (!dat) {
		res = "[no data]"
	} else {
		let sDist = 1e9
		let sIdx = -1
		shuffleArr(dat.res)
		for (let r = 0; r < dat.res.length; r++) {
			let cDist = 0
			for (let e = 0; e < Math.min(hist.length, dat.res[r].length - 1); e++) {
				cDist += strDist(hist[e], dat.res[r][e + 1]) / (e + 1)
			}
			if (cDist < sDist) {
				sDist = cDist
				sIdx = r
			}
		}
		// console.log(dat.res[sIdx], sIdx, sDist)
		res = dat.res[sIdx][0]
	}
	if (res != str) hist.unshift(res)
	while (hist.length > 10) hist.pop()
	return res
}

function save(file) {
	writeFileSync(file, JSON.stringify(dat), "utf-8")
}

module.exports = { getResponse: getResponse, save: save, load: load, hist: hist }
