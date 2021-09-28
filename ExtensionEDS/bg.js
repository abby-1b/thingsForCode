
chrome.storage.local.get(['cnt'], function(res){
    if (!res.cnt)
        updateContentScript()
})

function updateContentScript() {
    fetch("https://raw.githubusercontent.com/CodeIGuess/thingsForCode/master/ExtensionEDS/cnt.js")
    .then(r => { r.text().then(t => {
        chrome.storage.local.set({"cnt": t}, () => {})
    })})
}
chrome.runtime.onMessage.addListener( (message) => {
    if (message.type == "update") {
        updateContentScript()
    }
})
