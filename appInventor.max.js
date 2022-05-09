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
        ae.value = Math.trunc(parseFloat(av)) + (k.key == "ArrowUp" ? 1 : k.key == "ArrowDown" ? - 1 : 0) + (av.match(/\..*/)??[""])[0]
    }
}
ddd = 1

// Editor
async function stdZoom() {
	for (let i = 0; i < 50; i++) await cel(document.querySelectorAll(".blocklyZoom")[0].children[1])
	for (let i = 0; i < 15; i++) await cel(document.querySelectorAll(".blocklyZoom")[0].children[3])
}

let w = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces)[0]]

function delAll() { w.getTopBlocks().map(e => e.dispose()) }

function typeBlock(t) {
	if (t[0] == ".") noSelect()
	else if (t[0] == "~") selectParent()
	else {
		w.typeBlock_.show()
		w.typeBlock_.inputText_.value = t
		w.typeBlock_.currentListener_.listener()
		if (document.querySelector(".ac-renderer")) document.querySelector(".ac-renderer").style.display = "none"
	}
}
function getSelected() { return Blockly.selected }
function selectParent() { Blockly.selected.getParent().select() }
function noSelect() { Blockly.selected.unselect() }

function build() {
	delAll()
	sec.value.split("\n").slice(0, -1).map(e => e.trim()).filter(e => e != "").map(sec => {
		typeBlock(sec)
	})
	setTimeout(() => sec.focus(), 1)
}

function initEditor() {
	let b = document.querySelectorAll(".ode-Box-body")[5]
	b.style.display = "grid"
	b.style.gridTemplateColumns = "1fr 1fr"
	if (b.children.length > 1) b.removeChild(b.children[1])
	let sec = document.createElement("textarea")
	sec.id = "edt"
	sec.style.width = "calc(100% - 14px)"
	sec.style.height = "calc(100% - 7px)"
	sec.style.resize = "none"
	sec.style.fontSize = "1.5em"
	b.appendChild(sec)

	document.onkeydown = (k) => {
		if ("sr".includes(k.key) && k.metaKey) {
			build()
			k.preventDefault()
		}
	}
}
initEditor()

/*
initialize global
10
.
if
true
~
set variable
+
get variable
hello!

*/
