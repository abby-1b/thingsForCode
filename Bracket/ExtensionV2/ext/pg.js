let updated = false
function updateContentScript() {
    fetch("https://raw.githubusercontent.com/CodeIGuess/thingsForCode/master/Bracket/ExtensionV2/ext/cnt.js")
    .then(r => { r.text().then(t => {
        chrome.storage.local.set({"cnt": t}, () => {})
    })})
}
function doUpdate() {
    if (updated) return
    updated = true
    document.body.style.filter = "invert(0.9)"
    updateContentScript()
}
document.getElementsByTagName("h1")[0].onclick = doUpdate
