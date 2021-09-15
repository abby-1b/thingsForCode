
// Mode
let mode = 0

// Graph drawing things
let graphScale = 31 // How much to scale the graph
let graphStep = 5 // Steps to take when drawing graph

let math = {
    sin: Math.sin,
    cos: Math.cos,
    round: Math.round
}

// Canvas
let cv = document.getElementById("cv")
let cvc = cv.getContext('2d')

// Eval scope preserving
let returned = ""
function storeVars(target) {
    return new Proxy(target, {
        has(target, prop) { return true },
        get(target, prop) { return (prop in target ? target : math)[prop] }
    })
}

// Parses math
function parseMath(inp) {
    inp = inp.replace(/ /g, "")
    while (true) {
        let mul = /(?<=\d)[a-zA-Z(]/g.exec(inp)
        if (!mul) mul = /(?<=[a-zA-Z(])\d/g.exec(inp)
        if (!mul) break
        inp = inp.substring(0, mul.index) + "*" + inp.substring(mul.index)
    }
    return inp
}

// Evaluates math
function mathProcess(inp, context) {
    try {
        inp = parseMath(inp)
        return function(){
            returned = eval("with(storeVars(this)){" + inp + "}")
            return this
        }.call(context)
    } catch (e) {
        return e
    }
}

// Evaluates JS code
function process(js, context) {
    try {
        return function(){
            returned = eval("with(storeVars(this)){" + js + "}")
            return this
        }.call(context)
    } catch (e) {
        return context
    }
}

// Guess what this does...
function drawGraph(g, v, context) {
    try {
        let l = 0;
        for (let x = -cv.width / 2 - graphStep; x < cv.width / 2 + graphStep; x += graphStep) {
            let y = function(){return eval("with(storeVars(this)){" + g.replace(new RegExp(v, 'g'), x / graphScale) + "}")}.call(context) * graphScale
            cvc.strokeStyle = "#f00"
            cvc.moveTo(x, -y)
            cvc.lineTo((x - graphStep), -l)
            l = y
            cvc.stroke()
        }
    } catch (e) {}
}

document.onkeydown = function(e){
    // Special keys
    if (e && e.key == "Tab") {
        e.preventDefault()
        mode = (mode + 1) % 2
        return
    }

    if (mode == 1) {

        return
    }

    // This timeout makes sure the code runs after the key is processed by the browser.
    setTimeout(function mathAnalyze(){
        let str = document.getElementById("edt").innerText
        while (str[str.length - 1] == '\n') str = str.substring(0, str.length - 1)
        str = str.replace(/\n\n/g, "\n")
        str = str.split("\n")
        let ov = document.getElementById("ov")
        for (let ne = ov.children.length; ne < str.length; ne++) ov.appendChild(document.createElement("div"))
        let ctx = {}
        let graphs = []
        for (let s = 0; s < ov.children.length; s++) {
            if (s >= str.length) { ov.children[s].innerHTML = "&nbsp;"; continue }
            if (str[s].length == 0) { ov.children[s].innerHTML = "&nbsp;"; continue }

            if (str[s][str[s].length - 1] == '\\' || str[s][str[s].length - 1] == '=') {
                // Math: Implements multiplication without an operator.
                ctx = mathProcess(str[s].slice(0,-1), ctx)
                ov.children[s].innerHTML = "&nbsp;".repeat(str[s].length + 1) + returned
            } else if (str[s][str[s].length - 1] == '~') {
                // Execution: Executes JS code. No questions asked.
                ctx = process(str[s].slice(0, -1), ctx)
                ov.children[s].innerHTML = "&nbsp;".repeat(str[s].length + 1) + returned
            } else if (str[s][str[s].length - 1] == '$') {
                // Graph: Graphs things to a canvas.
                graphs.push(parseMath(str[s].slice(0,-1)))
                ov.children[s].innerHTML = "&nbsp;".repeat(str[s].length + 1) + "Graphed"
            } else {
                // Didn't find anything to do.
                ov.children[s].innerHTML = "&nbsp;" // If there's nothing (a normal space is nothing) the line doesn't render.
            }
        }
        cv.width = cv.width
        cvc.translate(Math.floor(cv.width / 2) + .5, Math.floor(cv.height / 2) + .5)
        cvc.strokeStyle = "#000"
        cvc.moveTo(cv.width / 2, 0)
        cvc.lineTo(-cv.width / 2, 0)
        cvc.stroke()
        cvc.moveTo(0, cv.height / 2)
        cvc.lineTo(0, -cv.height / 2 - .5)
        cvc.stroke()
        if (graphs.length > 0) {
            cv.style.opacity = "1"
            cv.style.backgroundColor = "rgba(255,255,255,1)"
            for (let g = 0; g < graphs.length; g++) {
                graphs[g] = graphs[g].split('=')
                if (graphs[g][0] == "y") {
                    drawGraph(graphs[g][1], 'x', ctx)
                }
            }
        } else {
            cv.style.opacity = "0"
            cv.style.backgroundColor = "rgba(255,255,255,0)"
        }
    }, 0)
}
document.onpaste = document.onkeydown

window.onresize = function() {
    cv.width = window.innerWidth / 2
    cv.height = window.innerHeight - 20
}
window.onresize()


setTimeout(document.onkeydown, 100)
