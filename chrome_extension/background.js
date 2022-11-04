// Check for new titles after a request for more titles is made.
chrome.webRequest.onCompleted.addListener(
    function(details) {
        console.log(details.url)
        
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            files: ['netflix.js']
        });
    },
    { urls: ["https://www.netflix.com/*"] }
);