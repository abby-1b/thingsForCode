
let encodeDecode = false

let imgInp = document.getElementById("inp")
let imgSrc = document.getElementById("src")
let ctx = document.getElementById("canvas").getContext("2d")

imgSrc.onload = () => {
	doEncode()
}

imgInp.onchange = evt => {
	let [file] = imgInp.files
	if (file) {
		console.log(file)
		imgSrc.src = URL.createObjectURL(file)
	}
}

imgSrc.src = "../enc.png" // "../skype.png"

function swapBits(x) {
	// return ((x & 15) << 4) | (x >> 4)
	return ((x & 1) << 7) | ((x & 2) << 5) | ((x & 4) << 3) | ((x & 8) << 1)
		| ((x & 16) >> 1) | ((x & 32) >> 3) | ((x & 64) >> 5) | ((x & 128) >> 7)
}

function rnd(y) {
	// return (y ^ 341)
	return (y ^ 341) * (encodeDecode ? 1 : -1)
}

function doEncode() {
	let srcCanvas = document.createElement("canvas")
	let srcCtx = srcCanvas.getContext("2d")
	srcCtx.canvas.width = imgSrc.width
	srcCtx.canvas.height = imgSrc.height
	srcCtx.drawImage(imgSrc, 0, 0, imgSrc.width, imgSrc.height)

	ctx.canvas.width = imgSrc.width
	ctx.canvas.height = imgSrc.height

	let srcImgDat = srcCtx.getImageData(0, 0, imgSrc.width, imgSrc.height)
	let newImgDat = ctx.createImageData(imgSrc.width, imgSrc.height)

	// for (let d = 0; d < srcImgDat.data.length; d += 4) {
	// 	newImgDat.data[d] = swapBits(srcImgDat.data[d])
	// 	newImgDat.data[d + 1] = swapBits(srcImgDat.data[d + 1])
	// 	newImgDat.data[d + 2] = swapBits(srcImgDat.data[d + 2])
	// 	newImgDat.data[d + 3] = srcImgDat.data[d + 3]
	// }

	for (let y = 0; y < imgSrc.height; y++) {
		for (let x = 0; x < imgSrc.width; x++) {
			let f = (x + y * imgSrc.width) * 4
			let t = (((x + rnd(y)) % imgSrc.width) + y * imgSrc.width) * 4
			newImgDat.data[t    ] = swapBits(srcImgDat.data[f    ])
			newImgDat.data[t + 1] = swapBits(srcImgDat.data[f + 1])
			newImgDat.data[t + 2] = swapBits(srcImgDat.data[f + 2])
			newImgDat.data[t + 3] = srcImgDat.data[f + 3]
		}
	}

	ctx.putImageData(newImgDat, 0, 0)

	document.getElementById("out").src = ctx.canvas.toDataURL()
}
