let updated = false
function sendUpdate() {
    if (updated) return
    updated = true
    document.body.style.filter = "invert(0.9)"
    chrome.runtime.sendMessage({type: 'update'})
}
document.getElementsByTagName("h1")[0].onclick = sendUpdate
