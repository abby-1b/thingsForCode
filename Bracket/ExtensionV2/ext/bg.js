// fetch("cnt.js").then(r => r.text().then(t => { console.log("Gottem."); chrome.storage.local.set({"cnt": t}, () => {}) }))

chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "updtFull") {
        fetch("https://raw.githubusercontent.com/CodeIGuess/thingsForCode/master/Bracket/ExtensionV2/ext/cnt.js")
        .then(r => { r.text().then(t => {
            chrome.storage.local.set({"cnt": t}, () => {})
        })})
    }
})

chrome.alarms.create("updtFull", {
    delayInMinutes: 60,
    periodInMinutes: 180
})
