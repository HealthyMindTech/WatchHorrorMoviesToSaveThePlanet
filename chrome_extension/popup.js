function setTVModel(event) {
    chrome.storage.sync.set({'tvModel': event.target.value}, function() {
    });
}
function updateSelectedTVModel() {
    chrome.storage.sync.get('tvModel', function(data) {
        document.getElementById('tvModelSelect').value = data.tvModel;
    });
}
function setElPrice(event) {
    chrome.storage.sync.set({'elPrice': event.target.value}, function() {
    });
}
function updateSelectedElPrice() {
    chrome.storage.sync.get('elPrice', function(data) {
        document.getElementById('elPrice').value = data.elPrice;
    });
}
updateSelectedTVModel();
updateSelectedElPrice();
document.getElementById("tvModelSelect").addEventListener("change", setTVModel);
document.getElementById("elPrice").addEventListener("change", setElPrice);
