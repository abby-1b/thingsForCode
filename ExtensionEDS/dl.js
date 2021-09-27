
console.log("Getting content...")
chrome.storage.local.get(['cnt'], function(result) {
    console.log(result.cnt)
})

// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//     console.log(response.farewell);
// });
