// fetch("http://localhost:8000/appInventor.max.js").then(r => r.text()).then(t => (1, eval)(t))

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
    if (ae.tagName == "INPUT" 
        && !isNaN(av) && !isNaN(parseFloat(av))) {
        ae.value = Math.trunc(parseFloat(av)) + (k.key == "ArrowUp" ? 1 : k.key == "ArrowDown" ? - 1 : 0) + (av.match(/\..*/)||[""])[0]
    }
}
ddd = 1

let w = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces)[0]]

function delAll() { w.getTopBlocks().map(e => e.dispose()) }

let savedSelect = [], plch = 0
function typeBlock(t) {
	if (t[0] == "_") { // Deselect everything
		let r = selectedTop().getBoundingRectangle()
		console.log(r.bottomRight.y - r.topLeft.y)
		plch += r.bottomRight.y - r.topLeft.y
		noSelect()
	} else if (t[0] == "~") selectParent() // Select parent
	else if (t[0] == ".") { // Setting values
		if (t[1] == 'v') getSelected().setFieldValue(t.slice(2), "NAME")
		else if (t[1] == 's') savedSelect.push(getSelected())
		else if (t[1] == 'l' && savedSelect.length > 0) savedSelect.pop().select()
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
	let c = getSelected()
	while (c.parentBlock_) c = c.parentBlock_
	return c
}
function getSelected() { return Blockly.selected }
function selectParent() { Blockly.selected.getParent().select() }
function noSelect() { Blockly.selected.unselect() }

function build() {
	plch = 0
	savedSelect = []
	delAll()
	sec.value.split("\n").slice(0, -1).map(e => e.trim()).filter(e => e != "").map(s => {
		typeBlock(s)
	})
	w.scrollCenter()
	setTimeout(() => sec.focus(), 1)
}

var sec = null
var currEdtShow = 0
var editorShow = 0
var intr = null
function initEditor() {
	let b = document.querySelectorAll(".ode-Box-body")[5]
	b.style.display = "grid"
	b.style.gridTemplateColumns = "1fr 0fr"
	if (b.children.length > 1) b.removeChild(b.children[1])
	sec = document.createElement("textarea")
	sec.id = "edt"
	sec.style.width = "calc(100% - 14px)"
	sec.style.height = "calc(100% - 7px)"
	sec.style.resize = "none"
	sec.style.fontSize = "1.5em"
	b.appendChild(sec)
	if (intr) clearInterval(intr)
	intr = setInterval(() => {
		currEdtShow = currEdtShow * 0.8 + editorShow * 0.2
		b.style.gridTemplateColumns = `1fr ${currEdtShow}fr`
	}, 16)

	document.onkeydown = (k) => {
		if ("sr".includes(k.key) && k.metaKey) {
			build()
			k.preventDefault()
		}
	}
}
initEditor()
