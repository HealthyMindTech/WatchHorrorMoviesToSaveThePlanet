chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.contentScriptQuery == "getData") {
        var url = request.url;
        fetch(url)
            .then(response => response.json())
            .then(response => sendResponse(response))
            .catch()
        return true;
    }
});
