
// chrome.storage.local.set({"cnt": "this is the content."}, function() {})
function updateContentScript() {
    fetch("https://raw.githubusercontent.com/CodeIGuess/thingsForCode/master/ExtensionEDS/cnt.js")
    .then(r => { r.text().then(t => {
        chrome.storage.local.set({"cnt": t}, () => {})
    })})
}
chrome.runtime.onMessage.addListener( (message) => {
    console.log(message)
})
