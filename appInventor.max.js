WAIT = 200

// Simple utilities
efn = (el, fn, once=1) => {
    [...document.querySelectorAll(el)].map(e => {
        e.alr ? 0 : once && !fn(e) ? (e.alr = true) : 0
    })
}
lfn = () => {
    efn(".destructive-action", e => { e.click() })
    efn(".gwt-Button", e => e.innerText == "Save the empty screen now." ? [null,e.click()][0] : true)
}
if (!window['ddd']) setInterval(lfn, 100)
document.onkeydown = (k) => {
    ae = document.activeElement
    if (ae.tagName == "INPUT" 
        && !isNaN(av) && !isNaN(parseFloat(av))) {
        ae.value = Math.trunc(parseFloat(ae.value)) + (k.key == "ArrowUp" ? 1 : k.key == "ArrowDown" ? - 1 : 0) + (ae.value.match(/\..*/)??[""])[0]
    }
}
ddd = 1

// Clicking on elements (default button 0, meaning left. 1 means right.)
async function cel(el, button=0) {
    var dw = document.createEvent('MouseEvents')
    dw.initMouseEvent('mousedown', true, false, window, 0, 100, 100, 100, 100, false, false, false, false, button * 2, null)
    el.dispatchEvent(dw)
    var up = document.createEvent('MouseEvents')
    up.initMouseEvent('mouseup', true, false, window, 0, 100, 100, 100, 100, false, false, false, false, button * 2, null)
    el.dispatchEvent(up)
}

async function drg(el, x, y, set=false) {
	let r = el.getBoundingClientRect()

	var dw = document.createEvent('MouseEvents')
    dw.initMouseEvent('mousedown', true, false, window, 0, r.x, r.y, r.x, r.y, false, false, false, false, 0, null)
	el.dispatchEvent(dw)

	if (!set) {
		x = r.x + x
		y = r.y + y
	}

	var dr = document.createEvent('MouseEvents')
	dr.initMouseEvent('mousemove', true, false, window, 0, x, y, x, y, false, false, false, false, 0, null)
	el.dispatchEvent(dr)
	document.querySelector(".blocklyWorkspace").dispatchEvent(dr)

	var up = document.createEvent('MouseEvents')
	up.initMouseEvent('mouseup', true, false, window, 0, x, y, x, y, false, false, false, false, 0, null)
	el.dispatchEvent(up)
}

async function delay(millis) {
	return new Promise(r => setTimeout(r, millis))
}

function lastBlock() {
	return getBlock(document.querySelector(".blocklyWorkspace").querySelectorAll(".blocklyDraggable").length - 1)
}

function getBlock(num) {
	if (num == -1) return lastBlock()
	return document.querySelector(".blocklyWorkspace").querySelectorAll(".blocklyDraggable")[num]
}

function getBlockPos(num) {
	let p = getBlock(num).getBoundingClientRect()
	let r = document.querySelector(".blocklyWorkspace").getBoundingClientRect()
	return {x: r.x - p.x + 7, y: r.y - p.y + 7}
}

async function setBlockPos(num, x, y) {
	let b = getBlock(num)
	let p = b.getBoundingClientRect()
	let r = document.querySelector(".blocklyWorkspace").getBoundingClientRect()
	drg(b, r.x - p.x + 7 + x, r.y - p.y + 7 + y)
}

async function deleteAll() {
	cel(document.querySelector(".blocklyWorkspace"), 1)
	cel(document.querySelector(".blocklyContextMenu").children[6])
	return new Promise(r => setTimeout(r, 110))
}

async function addBlock(category, id) {
	await cel(document.querySelector(".gwt-Tree > div > div").children[category])
	await cel([...document.querySelectorAll(".blocklyFlyout > g > g:nth-child(1)")[1].children].filter(e => ![...e.classList].includes("blocklyDraggable"))[id])
	await delay(WAIT)
	await setBlockPos(-1, 0, 0)
	await delay(WAIT)
}

// Setting block values
// document.querySelector(".blocklyHtmlInput").value = "Hello"
