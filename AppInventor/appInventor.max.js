// fetch("http://localhost:8000/appInventor.js").then(r => r.text()).then(t => (1, eval)(t))

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
	av = ae.value
	console.log(ae.tagName, av)
    if (ae.tagName == "INPUT" 
        && isNum(av)) {
        ae.value = Math.trunc(parseFloat(av)) + (k.key == "ArrowUp" ? 1 : k.key == "ArrowDown" ? - 1 : 0) + (av.match(/\..*/)||[""])[0]
    }
	if ("sr".includes(k.key) && k.metaKey)
		build(sec.value), k.preventDefault()
}
ddd = 1

var w = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces)[0]]

function isNum(n) {
	return !isNaN(n) && !isNaN(parseFloat(n))
}

let savedSelect = [], plch = 0, bn = 0
function typeBlock(t) {
	if (t[0] == "_") { // Deselect everything
		let r = selectedTop().getBoundingRectangle()
		plch += r.bottomRight.y - r.topLeft.y
		Blockly.selected.unselect()
	} else if (t[0] == "~") Blockly.selected.getParent().select() // Select parent
	else if (t[0] == ".") { // Setting values
		if (t[1] == 'v') getSelected().setFieldValue(t.slice(2), "NAME") // Sets a value
		else if (t[1] == 'n') getSelected().setFieldValue(t.slice(2), "VAR0") // Sets the name field of a block
		else if (t[1] == 'f') getSelected().setFieldValue(t.slice(2), "VAR") // Sets the name field of a for block
		else if (t[1] == 's') savedSelect.push(getSelected()) // Saves the current selected block
		else if (t[1] == 'l' && savedSelect.length > 0) savedSelect.pop().select() // Loads the last selected block
	} else {
		let wasntSelected = !getSelected()
		w.typeBlock_.show()
		w.typeBlock_.inputText_.value = t
		w.typeBlock_.currentListener_.listener()
		if (document.querySelector(".ac-renderer")) document.querySelector(".ac-renderer").style.display = "none"
		if (wasntSelected) {
			getSelected().moveBy(0, plch)
		}
	}
}
function selectedTop() {
	k = getSelected()
	while (k.parentBlock_) k = k.parentBlock_
	return k
}
function getSelected() { return Blockly.selected }

var lastBuild = []
function build(code) {
	let c = parse(code)
	if (bn++ != 0 && c.length > lastBuild.length && c.slice(0, lastBuild.length).filter((e, i) => e != lastBuild[i]).length == 0) {
		let tmp = c
		c = c.slice(lastBuild.length)
		lastBuild = tmp
	} else {
		lastBuild = c, plch = 0, savedSelect = []
		w.getTopBlocks().map(e => e.dispose())
	}
	c.forEach(typeBlock)
	setTimeout(() => sec.focus(), 1)
	setTimeout(() => w.scrollCenter(), 16)
}

var sec  = null
var intr = null
var ctx  = null
var currEdtShow = 0
var editorShow = 1
var drawParams = {
	cw: 10, // Char width
	ch: 17, // Char height
	lo: 1, // Line offset
	sx: 6, // Start X
	sy: 10 // Start Y
}
;{
	let b = document.querySelectorAll(".ode-Box-body")[5]
	b.style.display = "grid"
	b.style.gridTemplateColumns = "1fr 0fr"
	while (b.children.length > 1) b.removeChild(b.children[1])

	let d = document.createElement("div")
	d.id = "d"
	d.style.cssText = "font-family:monospace;font-size:1.3em"
	d.innerText = "Hello, World!"
	d.style.position = "fixed"
	b.appendChild(d)
	let r = d.getBoundingClientRect()
	drawParams.cw = r.width / d.innerText.length
	drawParams.ch = r.height
	d.innerText += "\nhi"
	r = d.getBoundingClientRect()
	drawParams.lo = (r.height - 2 * drawParams.ch) + 1
	b.removeChild(d)

	sec = document.createElement("textarea")
	sec.spellcheck = false
	sec.id = "edt"
	sec.style.cssText = "tab-size:4;font-family:monospace;font-size:1.3em;width:calc(100% - 14px);height:calc(100% - 7px);resize:none;white-space:pre;overflow-wrap:normal;overflow-x:scroll"
	sec.onscroll = redraw
	sec.onkeydown = function(e) {
		if (e.key == "Enter") {
			let n = 0
			let doNl = false
			let pos = this.selectionStart - 1
			if ("[({".includes(this.value[pos])) n++
			if ("])}".includes(this.value[pos + 1])) doNl = true
			while (this.value[pos] != "\n" && pos >= 0) pos--
			while (this.value[++pos] == "\t" && pos < this.value.length) n++
			setTimeout(() => {
				document.execCommand("insertText", false, "\t".repeat(n))
				if (doNl) {
					document.execCommand("insertText", false, "\n" + ("\t".repeat(n - 1)))
					this.selectionEnd = this.selectionStart = this.selectionStart - n
				}
			}, 1)
		} else if (e.key == "Tab") {
			e.preventDefault()
			let start = this.selectionStart
			let end = this.selectionEnd
			let isSingle = start == end
			if (isSingle && !e.shiftKey)
				return document.execCommand("insertText", false, "\t")
			while (this.value[start] != "\n" && start > 0) start--
			if (start != 0) start++
			if (isSingle) {
				if (this.value[start] != "\t") return
				this.selectionStart = start
				this.selectionEnd = start + 1
				if (end == start) end++
				document.execCommand("insertText", false, "")
				this.selectionStart = this.selectionEnd = end - 1
				return
			}
			while (this.value[end] != "\n" && end < this.value.length - 1) end++
			if (end != this.value.length - 1) end--

			if (e.shiftKey) {
				console.log("Multiple shift!")
			} else {
				let tabPositions = [start]
				let spl = this.value.substring(start, end).split("\n")
				spl.slice(0, -1).forEach((l, i) => {
					tabPositions.push(tabPositions[tabPositions.length - 1] + l.length + 2)
				})
				tabPositions.forEach(p => {
					this.selectionStart = this.selectionEnd = p
					document.execCommand("insertText", false, "\t")
				})
				this.selectionStart = start
				this.selectionEnd = tabPositions[tabPositions.length - 1] + spl[spl.length - 1].length + 2
			}
		} else if ("([{".includes(e.key)) {
			setTimeout(() => {
				document.execCommand("insertText", false, ")]}"["([{".indexOf(e.key)])
				this.selectionEnd = --this.selectionStart
			}, 0)
		} else if (")]}".includes(e.key) && this.value[this.selectionStart] == e.key) {
			e.preventDefault()
			this.selectionEnd = ++this.selectionStart
		}
	}
	sec.oninput  = redraw
	b.appendChild(sec)

	cnv = document.createElement("canvas")
	ctx = cnv.getContext("2d")
	cnv.id = "cnv"
	cnv.style.cssText = "position:absolute;width:50%;height:100%;right:0;opacity:0.8;pointer-events:none;mix-blend-mode:color-dodge" // Final config
	// cnv.style.cssText = "position:absolute;width:50%;height:100%;right:0;opacity:0.5;pointer-events:none" // Test config
	b.appendChild(cnv)

	if (intr) clearInterval(intr)
	intr = setInterval(() => {
		sec.style.padding = (editorShow == 0) ? "0px" : ""
		currEdtShow = currEdtShow * 0.8 + editorShow * 0.2
		if (Math.abs(currEdtShow - editorShow) < 0.01) currEdtShow = editorShow
		b.style.gridTemplateColumns = `1fr ${currEdtShow}fr`
		ctx.canvas.style.width = (50 * currEdtShow) + "%"
		let rct = ctx.canvas.getBoundingClientRect()
		let w = Math.round(rct.width)
		let h = Math.round(rct.height)
		if (ctx.canvas.width != w) {
			ctx.canvas.width = w
			ctx.canvas.height = h
			setTimeout(() => window.dispatchEvent(new Event('resize')), 20)
			redraw()
		}
	}, 16)

	let btn = document.querySelectorAll(".ode-Box-content>table>tbody>tr>td")[5]
	btn.onclick = () => { editorShow = editorShow == 1 ? 0 : 1 }
	btn.children[0].children[0].innerText = "Toggle"
}

function redraw() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	ctx.translate(-sec.scrollLeft, -sec.scrollTop)
	let scr = Math.floor(sec.scrollTop / (drawParams.ch + drawParams.lo))
	sec.value.replace(/\t/g, "    ").split("\n").map((e, i) => {
		if (scr > i) return []
		return splitLine(e)
	}).forEach((l, y) => l.forEach(t => {
		if (t.txt[0] == '"' || ["join"].includes(t.txt)) ctx.fillStyle = "#B32D5E"
		else if (["if", "else", "while", "for", "when", "to", "step"].includes(t.txt)) ctx.fillStyle = "#B18E35"
		else if (isNum(t.txt) || [...mathFunctions, "+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">=", "&", "&&", "|", "||"].includes(t.txt)) ctx.fillStyle = "#3F71B5"
		else if (["true", "false"].includes(t.txt)) ctx.fillStyle = "#77AB41"
		else if (["macro", "global", "local", "=", "+=", "-=", "*=", "/="].includes(t.txt)) ctx.fillStyle = "#D05F2D"
		else if ("()".includes(t.txt)) ctx.fillStyle = "#4f0041"
		else if ("{}".includes(t.txt)) ctx.fillStyle = "#424f00"
		else return
		ctx.fillRect(drawParams.sx + drawParams.cw * t.x, drawParams.sy + (drawParams.ch + drawParams.lo) * y,
			drawParams.cw * t.w, drawParams.ch)
	}))
	
	ctx.translate(sec.scrollLeft, sec.scrollTop)
}

function splitLine(code) {
	let tokens = []
	let patt = /('|"|'''|""").*?\1|-[0-9.]{1,}|[+\-*\/!<>=]=|[{}()\[\]+\-*\/=,|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}/gm
	while (match = patt.exec(code)) tokens.push({txt: match[0], x: match.index, w: patt.lastIndex - match.index})
	return tokens
}
