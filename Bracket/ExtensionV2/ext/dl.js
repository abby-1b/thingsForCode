
function updateContentScript() {
    fetch(
        "https://raw.githubusercontent.com/CodeIGuess/thingsForCode/master/Bracket/ExtensionV2/ext/cnt.js")
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
