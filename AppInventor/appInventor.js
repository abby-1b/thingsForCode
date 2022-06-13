
const MAX_ITER = 999;
const fnc = {
    "str": "#B32D5E",
    "arr": "#49A6D4",
    "var": "#D05F2D",
    "col": "#333333",
    "set": "#266643",
	"ctr": "#B18E35"
};
const libFns = {
    "rgb": { color: fnc.col, translate: true, transName: "make color" },
    "len": { color: fnc.arr, translate: true, transName: "length of list" },
    "strlen": { color: fnc.str, translate: true, transName: "length" },
    "join": { color: fnc.str },
    "trim": { color: fnc.str },
    "empty": { color: fnc.str, translate: true, transName: "is empty" },
    "uppercase": { color: fnc.str, translate: true, transName: "upcase" },
    "lowercase": { color: fnc.str, translate: true, transName: "downcase" },
    "includes": { color: fnc.str, translate: true, transName: "contains" },
    "split": { color: fnc.str },
    "replace": { color: fnc.str, translate: true, transName: "replace all" },
    "reverse": { color: fnc.str },
    "copy": { color: fnc.arr, translate: true, transName: "copy list" },
    "set": { color: fnc.set },
    "get": { color: fnc.set },
    "nop": { color: "", translate: true, transName: "evaluate but ignore result" },
	"openScreen": { color: fnc.ctr, translate: true, transName: "open another screen", bIns: "Screen Name: " },
	"openScreenVal": { color: fnc.ctr, translate: true, transName: "open another screen with start value", bIns: "Screen Name: " },
};
const mathFunctions = ["rand", "randi", "min", "max", "sqrt", "abs", "neg", "round", "ceil", "floor", "mod", "sin", "cos", "tan", "asin", "acos", "atan", "atan2"];
const mathFunctionMap = {
    "rand": "random fraction",
    "randi": "random integer",
    "sqrt": "square root",
    "ceil": "ceiling",
    "abs": "absolute",
    "mod": "modulo of"
};
function error(e, ret = undefined) { console.log(e); return ret; }
function parse(code) {
    let tokens = code.match(/('|"|'''|""").*?\1|-[0-9.]{1,}|\/\/|[+\-*\/!<>=&|^]=|\+\+|\-\-|&&|\|\||[~{}()\[\]+\-*\/=,<>|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}|\n/gm);
    if (tokens == null)
        tokens = [];
    let ret = [];
    for (let t = 0; t < tokens.length; t++) {
        if (tokens[t] == "//")
            while (tokens.length > t && tokens[t] != "\n")
                tokens.splice(t, 1);
    }
    console.log(tokens);
    function captureClause(tokens, removeFL = false) {
        let ret = [];
        let n = 0, i = MAX_ITER;
        while (tokens.length > 0) {
            if ("([{".includes(tokens[0]))
                n++;
            if ("}])".includes(tokens[0]))
                n--;
            if (n < 0 || (n == 0 && "=".includes(tokens[0])))
                break;
            if ("([{".includes(tokens[0]) && "}])".includes(ret[ret.length - 1]))
                break;
            if (i-- < 0)
                return error("Couldn't find matching parenthesis!", []);
            if (n == 0 && (tokens[0] == "," || tokens[0] == "\n"))
                break;
            if (tokens[0] != "\n")
                ret.push(tokens.shift());
            else
                tokens.shift();
        }
        if (tokens[0] == ",")
            tokens.shift();
        if (removeFL)
            return ret.slice(1, -1);
        return ret;
    }
    function valFromTokens(tk) {
        for (let p = 0; p < tk.length; p++) {
            if (tk[p] == '(') {
                tk[p++] = [];
                let n = 1, i = MAX_ITER;
                while (n > 0) {
                    if (tk[p] == '(')
                        n++;
                    if (tk[p] == ')')
                        n--;
                    if (i-- < 0)
                        return error("Couldn't find matching parenthesis!", []);
                    tk[p - 1].push(tk.splice(p, 1)[0]);
                }
                tk[--p].splice(-1);
                tk[p] = valFromTokens(tk[p]);
            }
            if (tk[p] == '[') {
                let isVar = typeof tk[p - 1] === "string" && vars.map(e => e.name).includes(tk[p - 1]);
                tk[p++] = [];
                let n = 1, i = MAX_ITER;
                while (n > 0) {
                    if (tk[p] == '[')
                        n++;
                    if (tk[p] == ']')
                        n--;
                    if (i-- < 0)
                        return error("Couldn't find matching bracket!", []);
                    let ct = tk.splice(p, 1)[0];
                    if (ct != "\n")
                        tk[p - 1].push(ct);
                }
                ;
                tk[--p].splice(-1);
                tk[p] = valFromTokens(tk[p]);
                tk[p] = ["[" + tk[p].length, ...tk[p]];
                if (isVar) {
                    let vr = tk.splice(--p, 1)[0];
                    tk[p][0] = "$" + vr;
                }
            }
            if (p > 0 && mathFunctions.includes(tk[p - 1])) {
                tk[p--].unshift(tk.splice(p, 1)[0]);
            }
            if (p > 0 && tk[p - 1] in fns) {
                let n = tk.splice(p - 1, 1)[0];
                if (fns[n].translate)
                    n = fns[n].transName;
                tk[p - 1].unshift(n);
                console.log(tk);
            }
            if (tk[p] == ".")
                tk[p - 1] += "." + tk[p + 1], tk.splice(p--, 2);
        }
        ;
        ["^", "*/", "+-", ["==", "<", ">"], ["&", "|", "&&", "||"]].forEach(currSymbols => {
            for (let i = 0; i < tk.length; i++) {
                if (typeof tk[i] !== "string")
                    continue;
                if (currSymbols.includes(tk[i])) {
                    tk[i - 1] = [tk[i], tk[i - 1], tk[i + 1]];
                    tk.splice(i--, 2);
                }
            }
        });
        return tk.filter(t => t != ",");
    }
    function flattenTransVal(val) {
        let ret = val.flat(Infinity);
        return ret
            .filter(e => e != ",")
            .map(e => {
            if (e[0] == '$')
                return ["select list item", translateVal([e.slice(1)])];
            if (e[0] == "[")
                return [".e" + e.slice(1)];
            if (e[0] == '"')
                return e.slice(0, -1);
            if (e == "==")
                return "=";
            if (e == "&")
                return "bitwise and";
            if (e == "&&")
                return "and";
            if (e == "|")
                return "bitwise or";
            if (e == "||")
                return "or";
            if (mathFunctions.includes(e)) {
                if (e in mathFunctionMap)
                    return mathFunctionMap[e];
                return e;
            }
            if (e.match(/[a-zA-Z_]/) && vars.map(v => v.name).includes(e)) {
                let vr = getVar(e);
                if (vr.macro != undefined)
                    return vr.macro;
                return "get " + (vr.level == 0 ? "global " : "") + e;
            }
            return e;
        })
            .flat(2);
    }
    function translateVal(tk) {
        return flattenTransVal(valFromTokens(tk));
    }
    function getVar(varName) {
        for (let v = vars.length - 1; v >= 0; v--)
            if (vars[v].name == varName)
                return vars[v];
        return undefined;
    }
    let varLevel = 1;
    let vars = [];
    let fns = {};
    Object.assign(fns, libFns);
    let nestExits = [];
    let ifPos = [];
    while (tokens.length > 0) {
        let tk = tokens.shift();
        if (tk == "global") {
            let n = tokens.shift();
            vars.push({ name: n, level: 0 });
            ret.push("initialize global", ".v" + n);
            if (tokens.shift() != "=")
                error("Expected `=`");
            else
                ret.push(...translateVal(captureClause(tokens)));
            ret.push("_");
        }
        else if (tk == "local") {
            let n = tokens.shift();
            vars.push({ name: n, level: varLevel });
            ret.push("initialize local in do", ".s", ".n" + n);
            if (tokens.shift() != "=")
                error("Expected `=`");
            else
                ret.push(...translateVal(captureClause(tokens)));
            ret.push(".l");
        }
        else if (tk == "macro") {
            let n = tokens.shift();
            vars.push({ name: n, level: varLevel });
            if (tokens.shift() != "=")
                error("Expected `=`");
            else
                vars[vars.length - 1].macro = translateVal(captureClause(tokens));
        }
        else if (tk == "if") {
            ret.push("if", ".s");
            ret.push(...translateVal(captureClause(tokens, true)), ".l", ".s");
            ifPos.push({ idx: ret.length, level: varLevel });
            varLevel++;
            nestExits.push(".l");
            tokens.shift();
        }
        else if (tk == "elif") {
            ret.splice(ifPos[ifPos.length - 1].idx, 0, ".ii");
            ret.push(".s");
            ret.push(...translateVal(captureClause(tokens, true)), ".l", ".s");
            varLevel++;
            nestExits.push(".l");
            tokens.shift();
        }
        else if (tk == "else") {
            ret.splice(ifPos[ifPos.length - 1].idx, 0, ".ie");
            ret.push(".s");
            varLevel++;
            nestExits.push(".l");
            tokens.shift();
        }
        else if (tk == "while") {
            ret.push("while", ".s");
            ret.push(...translateVal(captureClause(tokens, true)), ".l", ".s");
            varLevel++;
            nestExits.push(".l");
            tokens.shift();
        }
        else if (tk == "for") {
            let cls = valFromTokens(captureClause(tokens, true));
            varLevel++;
            if (cls[3] == "to") {
                ret.push("for each number from", ".s", ".f" + cls[0], ...flattenTransVal([cls[2]]), ".l", ".s", ...flattenTransVal([cls[4]]), ".l", ".s");
                if (cls.length == 5)
                    ret.push("1", ".l", ".s");
                else
                    ret.push(...flattenTransVal([cls[6]]), ".l", ".s");
                vars.push({ name: cls[0], level: varLevel });
            }
            nestExits.push(".l");
            tokens.shift();
        }
        else if (tk == "when") {
            let cls = captureClause(tokens, true);
            ret.push("when " + cls.join(""), ".s");
            varLevel++;
            nestExits.push("_");
            tokens.shift();
        }
		else if (tk == "fnr") {
			varLevel++
			ret.push("procedure result", ".v" + tokens.shift(), ".s")
			captureClause(tokens, true).filter(e => e != ",").forEach(a => {
				vars.push({ name: a, level: varLevel });
				ret.push(".a" + a)
			})
			ret.push("initialize local in return", ".s", ".n__ret__", "0", ".l", "do result", ".s", "get __ret__", ".l")
			nestExits.push("_")
			tokens.shift()
		}
		else if (tk == "return") {
			ret.push("set __ret__", ...translateVal(captureClause(tokens)))
		}
        else if (tokens.length > 0 && tokens[0] == '=') {
            ret.push("set " + (getVar(tk).level == 0 ? "global " : "") + tk, ".s");
            tokens.shift();
            ret.push(...translateVal(captureClause(tokens)), ".l");
        }
        else if (tokens.length > 0 && tokens[0] == '[') {
            let list = translateVal([tk]);
            let idx = translateVal(captureClause(tokens, true));
            let op = tokens.shift()[0];
            ret.push("replace list item", ".s", ".s", ...list, ".l", ...idx, ".l");
            let val = translateVal(captureClause(tokens));
            if (op == '=')
                ret.push(...val);
            else
                ret.push(op[0], "select list item", ...list, ...idx, ...val);
        }
        else if (tokens.length > 0 && ["+=", "-=", "*=", "/=", "&=", "|=", "^="].includes(tokens[0])) {
            ret.push("set " + (getVar(tk).level == 0 ? "global " : "") + tk, ".s");
            let op = tokens.shift()[0];
            let cls = captureClause(tokens);
            cls.unshift(tk, op, "(");
            cls.push(")");
            ret.push(...translateVal(cls), ".l");
        }
        else if (tokens.length > 0 && ["++", "--"].includes(tokens[0])) {
            ret.push("set " + (getVar(tk).level == 0 ? "global " : "") + tk, ".s");
            let op = tokens.shift()[0];
            ret.push(...translateVal([tk, op, "1"]), ".l");
        }
        else if (tokens.length > 3 && tokens[0] == '.' && tokens[2] == '=') {
            ret.push("set " + tk + tokens.splice(0, 2).join(""));
            tokens.shift();
            ret.push(...translateVal(captureClause(tokens)));
        }
        else if (tk == "~" && tokens.length > 0 && tokens[0] == '(') {
            ret.push(...captureClause(tokens, true).filter(e => e[0] == '"').map(e => e.slice(1, -1)));
        }
        else if (tk == "set" && tokens.length > 0 && tokens[0] == '(') {
            let cls = captureClause(tokens, true);
            let p = captureClause(cls).join("");
            let comp = translateVal(captureClause(cls));
            let val = translateVal(captureClause(cls));
            console.log(p, comp, val);
            ret.push("set " + p, ".s", ...comp, ".l", ".s", ...val, ".l");
        }
        else if (tokens.length > 0 && tokens[0] == '(') {
            if ((tk in fns) && fns[tk].translate) {
                ret.push(fns[tk].transName);
            }
            else
                ret.push(tk);
            let c = captureClause(tokens, true);
            let h = [];
            while (c.length > 0) {
                h.push(captureClause(c));
                c.splice(0, 1);
            }
			let l = ret.length;
            ret.push(...h.map(translateVal).flat());
			if ((tk in fns) && fns[tk].bIns) ret[l] = fns[tk].bIns + ret[l];
        }
        else if (tk == "}") {
            ret.push(nestExits.pop());
            varLevel--;
            vars = vars.filter(v => v.level <= varLevel);
            ifPos = ifPos.filter(v => v.level <= varLevel);
        }
        else if (tk != "\n") {
            console.log("Didn't find:", tk, tokens[0]);
        }
    }
    console.log(ret);
    return ret;
}

// fetch("http://localhost:8000/appInventor.js").then(r => r.text()).then(t => (1, eval)(t))

// Simple utilities
efn = (el, fn, once=1) => {
    [...document.querySelectorAll(el)].map(e => {
        e.alr ? 0 : once && !fn(e) ? (e.alr = true) : 0
    })
}
changes = false
lastScreen = ""
lfn = () => {
    efn(".destructive-action", e => { e.click() })
    efn(".gwt-Button", e => e.innerText == "Save the empty screen now." ? [null,e.click()][0] : true)
	if (currScreen() != lastScreen) {
		w = Blockly.allWorkspaces[Object.keys(Blockly.allWorkspaces).filter(e => e.split("_").slice(1).join("_") == currScreen())[0]]
		loadBlocks()
		lastScreen = currScreen()
		console.log(lastScreen)
	}
	if (currEditor() == "Designer") editorShow = 0
}
function loadBlocks() { try { sec.value = w.getTopBlocks().map(b => toText(b)).join("\n"), redraw() } catch (e) { console.log(e) } }
if (!window['ddd']) setInterval(() => {lfn()}, 100)
document.onkeydown = (k) => {
    ae = document.activeElement
	av = ae.value
    if (ae.tagName == "INPUT" 
        && isNum(av)) {
        ae.value = Math.trunc(parseFloat(av)) + (k.key == "ArrowUp" ? 1 : k.key == "ArrowDown" ? - 1 : 0) + (av.match(/\..*/)||[""])[0]
    }
	if ("sr".includes(k.key) && k.ctrlKey) build(sec.value), k.preventDefault()
	if (k.key == "k" && k.ctrlKey) loadBlocks()
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
		else if (t[1] == 'a') {
			getSelected().arguments_.push(t.slice(2))
			getSelected().updateParams_()
		} else if (t[1] == 'e') { // Makes an empty list of a length
			typeBlock("create empty list")
			let to = parseInt(t.slice(2))
			for (let i = 0; i < to; i++) getSelected().appendValueInput("ADD" + i), getSelected().itemCount_++
		} else if (t[1] == 'i') // Adds an else or elseif
			getSelected()[t[2] == "e" ? "elseCount_" : "elseifCount_"]++, getSelected().updateShape_()
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
		w.getTopBlocks().map(e => { e.dispose() })
	}
	c.forEach(typeBlock)
	setTimeout(() => sec.focus(), 1)
	setTimeout(() => w.scrollCenter(), 500)
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
	drawParams.lo = (r.height - 2 * drawParams.ch)// + 1
	b.removeChild(d)

	sec = document.createElement("textarea")
	sec.spellcheck = false
	sec.id = "edt"
	sec.style.cssText = "tab-size:4;font-family:monospace;font-size:1.3em;width:calc(100% - 14px);height:calc(100% - 7px);resize:none;white-space:pre;overflow-wrap:normal;overflow-x:scroll"
	sec.onscroll = redraw
	sec.onkeydown = function(e) {
		changes = true
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
		b.style.gridTemplateColumns = "1fr " + currEdtShow + "fr"
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
	}).forEach((l, y) => {
		let cmt = false
		for (let ti = 0; ti < l.length; ti++) {
			t = l[ti]
			if (cmt) {}
			else if (t.txt[0] == '"') ctx.fillStyle = "#B32D5E"
			else if (["fn", "fnr", "return"].includes(t.txt)) ctx.fillStyle = "#7C5385"
			else if (["if", "elif", "else", "while", "for", "when", "to", "step"].includes(t.txt)) ctx.fillStyle = "#B18E35"
			else if (isNum(t.txt) || [...mathFunctions, "+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">=", "&", "&&", "|", "||"].includes(t.txt)) ctx.fillStyle = "#3F71B5"
			else if (t.txt == "." || (ti > 0 && l[ti - 1].txt == ".") || (ti + 1 < l.length && l[ti + 1].txt == ".")) ctx.fillStyle = "#266643"
			else if (["true", "false"].includes(t.txt)) ctx.fillStyle = "#77AB41"
			else if (["macro", "global", "local", "=", "+=", "-=", "*=", "/=", "++", "--", "&=", "|=", "^="].includes(t.txt)) ctx.fillStyle = "#D05F2D"
			else if ("()".includes(t.txt)) ctx.fillStyle = "#4f0041"
			else if ("{}".includes(t.txt)) ctx.fillStyle = "#424f00"
			else if (t.txt in libFns) ctx.fillStyle = libFns[t.txt].color
			else if (ti + 1 < l.length && l[ti + 1].txt == "(") ctx.fillStyle = "#BF4343"
			else if (t.txt == "//") {
				ctx.fillStyle = "#999"
				ctx.fillRect(drawParams.sx + drawParams.cw * t.x, drawParams.sy + (drawParams.ch + drawParams.lo) * y, 1e4, drawParams.ch)
				return
			} else continue
			ctx.fillRect(drawParams.sx + drawParams.cw * t.x, drawParams.sy + (drawParams.ch + drawParams.lo) * y, drawParams.cw * t.w, drawParams.ch)
		}
	})
	
	ctx.translate(sec.scrollLeft, sec.scrollTop)
}

function splitLine(code) {
	let tokens = []
	let patt = /('|"|'''|""").*?\1|-[0-9.]{1,}|\/\/|[+\-*\/!<>=&|^]=|\+\+|\-\-|&&|\|\||[~{}()\[\]+\-*\/=,<>|&^!?]|[a-zA-Z_][a-zA-Z_0-9]*|[0-9.]{1,}|\n/gm
	while (match = patt.exec(code)) tokens.push({txt: match[0], x: match.index, w: patt.lastIndex - match.index})
	return tokens
}

let bFns = {
	"lists_length": "len",
	"color_make_color": "rgb",
    "text_segment": "segment",
    "text_length": "strlen",
    "text_join": "join",
    "controls_openAnotherScreen": "openScreen",
	"math_divide": "mod"
}
function indent(str) { return str.split("\n").map(e => "\t" + e).join("\n") }
function toText(b) {
	if (!b) return ""
	let ch = b.childBlocks_
	switch (b.type) {
		case "math_number":
			return b.inputList[0].fieldRow[0].value_
		case "local_declaration_expression":
		case "local_declaration_statement":
			return `local ${b.localNames_[0]} = ${toText(ch[0])}`
				+ (ch.length == 1 ? "" : `\n` + toText(ch[1]))
		case "global_declaration":
			return `global ${b.getVars()[0]} = ${toText(ch[0])}`
		case "controls_while":
		case "controls_if": {
			let ret = `${b.type.split("_")[1]} (${toText(ch[0])}) {\n${indent(toText(ch[1]))}\n}`
			let on = 2
			for (let i = 0; i < b.elseifCount_; i++) ret += ` elif (${toText(ch[on++])}) {\n${indent(toText(ch[on++]))}\n}`
			if (b.elseCount_) ret += ` else {\n${indent(toText(ch[on++]))}\n}`
			console.log(on, ch.length)
			return ret + (ch.length == on ? "" : `\n` + toText(ch[on]))
		} break
		case "controls_forRange":
			return `for (${b.getVars()[0]} = ${toText(ch[0])} to ${toText(ch[1])} step ${toText(ch[2])}) {\n${indent(toText(ch[3]))}\n}` + (ch.length == 4 ? "" : `\n` + toText(ch[4]))
		case "controls_eval_but_ignore":
			return ``

		case "controls_do_then_return":
			return toText(ch[0]) + "\nreturn " + toText(ch[1])

        case "logic_operation":
            return `${toText(ch[0])} ${{"AND":"&&","OR":"||"}[b.inputList[1].fieldRow[0].value_]} ${toText(ch[1])}`
            
        case "logic_compare":
		case "math_compare":
			return `${toText(ch[0])} ${{"=":"==","not=":"!=","lt":"<","lte":"<=","gt":">","gte":">="}[b.helpUrl().split("#")[1]]} ${toText(ch[1])}`
		case "math_add":
		case "math_subtract":
		case "math_multiply":
		case "math_division":
		case "math_power":
			return "(" + toText(ch[0]) + " " + {"add":"+","subtract":"-","multiply":"*","divide":"%","division":"/","power":"^"}[b.type.split("_")[1]] + " " + toText(ch[1]) + ")"
		case "math_random_int":
			return `randi(${toText(ch[0])}, ${toText(ch[1])})`
		case "math_random_float":
			return `rand()`

		case "lexical_variable_get":
			return b.getVars()[0].split(" ").slice(-1)[0]
		case "lexical_variable_set":
			if (b.getVars()[0] == "__ret__") return `return ${toText(ch[0])}` + (ch.length == 1 ? "" : `\n` + toText(ch[1]))
			return `${b.getVars()[0].split(" ").slice(-1)[0]} = ${toText(ch[0])}` + (ch.length == 1 ? "" : `\n` + toText(ch[1]))

		case "lists_create_with":
			return `[${b.childBlocks_.map(c => toText(c)).join(", ")}]`
		case "lists_select_item":
			return `${toText(ch[0])}[${toText(ch[1])}]`
        case "lists_replace_item":
            return `${toText(ch[0])}[${toText(ch[1])}] = ${toText(ch[2])}` + (ch.length == 3 ? "" : `\n` + toText(ch[3]))

		case "logic_boolean":
			return b.inputList[0].fieldRow[0].value_ == "TRUE" ? "true" : "false"

		case "component_component_block":
			return b.instanceName
		case "component_event":
			return `when (${b.instanceName}.${b.eventName}) {\n${indent(toText(ch[0]))}\n}`
		case "component_set_get":
			if (ch.length == 1) return `get(${b.typeName}.${b.propertyName}, ${toText(ch[0])})`
			return `set(${b.typeName}.${b.propertyName}, ${toText(ch[0])}, ${toText(ch[1])})` + (ch.length == 2 ? "" : "\n" + toText(ch[2]))
			
		case "helpers_dropdown":
			return `${b.key_}${b.inputList[0].fieldRow[1].value_}()`
        case "helpers_screen_names":
            return `${b.inputList[0].fieldRow[0].value_}`
            
		case "procedures_defreturn":
			return `fnr ${b.inputList[0].fieldRow[1].value_}(${b.inputList[0].fieldRow.slice(3).map(f => f.value_).filter(e => e != undefined).join(", ")}) {\n${indent(toText(ch[0].childBlocks_[1].childBlocks_[1]))}\n}`

        case "procedures_callreturn":
            return b.inputList[0].fieldRow[1].value_ + "(" + b.childBlocks_.map(c => toText(c)).join(", ") + ")"
            
		case "dictionaries_create_with":
			return "{" + b.childBlocks_.map(e => toText(e)).join(", ") + "}"
		case "pair":
			return toText(ch[1]) + ": " + toText(ch[0])
			
        case "text":
            return '"' + b.inputList[0].fieldRow[1].value_ + '"'
            
		default: {
			if (b.type in bFns)
				return bFns[b.type] + "(" + b.childBlocks_.map(c => toText(c)).join(", ") + ")"
		} break
	}
	console.log(b.type, b)
	return "..."
}

function currEditor() {
	return document.querySelectorAll("td:nth-child(3)>table>tbody>tr>td>div.ode-TextButton-up-disabled")[0].innerText
}
function currScreen() {
	return document.querySelector("body > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > div > div:nth-child(2) > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2)").innerText.slice(0, -2)
}

/*
function realPos(block) {
	let bg = w.svgBackground_.getBoundingClientRect()
	let b = block.svgGroup_.getBoundingClientRect()
	return [(b.x + b.width / 2) - (bg.x + bg.width / 2), (b.y + b.height / 2) - (bg.y + bg.height / 2)]
}
realPos(getSelected())
*/
