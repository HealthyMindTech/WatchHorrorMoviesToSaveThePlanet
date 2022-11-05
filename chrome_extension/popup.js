// Data
// the numbers are NordPool pageIds
const countryData = {
    FI: {pageId: 35, hourDiff: 1},
    DK: {pageId: 41, hourDiff: 0},
    EE: {pageId: 47, hourDiff: 1},
    LV: {pageId: 59, hourDiff: 1},
    LT: {pageId: 53, hourDiff: 1},
    AT: {pageId: 298578, hourDiff: 0},
    BE: {pageId: 298736, hourDiff: 0},
    DE: {pageId: 299565, hourDiff: 0},
    FR: {pageId: 299568, hourDiff: 0},
    NL: {pageId: 299571, hourDiff: 0},
    SE: {pageId: 29, entityName: 'SE3', hourDiff: 0},
    NO: {pageId: 23, entityName: 'Oslo', hourDiff: 0}
  }

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

function setCountry(event) {
    chrome.storage.sync.set({'country': event.target.value}, function() {
    });
}
function updateSelectedCountry() {
    chrome.storage.sync.get('country', function(data) {
        if (data.country) {
            document.getElementById('countrySelect').value = data.country;
        } else {
            document.getElementById('countrySelect').value = 'FI';
        }
    });
}

async function getCurrentPrice() {
    chrome.storage.sync.get('country', async function(data) {
        let country = data.country;
        if (!country) {
            country = 'FI';
        }
        console.log('Country: ' + country);
        let url = 'https://www.nordpoolgroup.com/api/marketdata/page/' + countryData[country].pageId;
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: "getData"
                , url: url
            }, function (jsonData) {
                console.log(jsonData);
                let price = getPriceFromJson(jsonData);
                // Round to 5 decimals
                
                // Add the newtork price to the price
                let networkPrice = document.getElementById('networkPrice').value;
                console.log('Network price: ' + networkPrice);
                let totalPrice = Math.round((price + networkPrice) * 100000) / 100000;
                document.getElementById('elPrice').value = totalPrice;
            });
        // Set to no-cors to avoid CORS errors
        // let response = await fetch(url, {mode: 'no-cors'});
        // let jsonData = await response.json();
        // console.log(jsonData);
        // let price = jsonData.data[0].values[0].value;
        // document.getElementById('currentPrice').innerText = price;
    });
}

function getPriceFromJson(jsonData) {
    // We need timestamp in string format "2022-11-05T10:00:00" Floor to get the hour
    // Currenthour is 0-23
    // Should be like this but in CET timezone
    // new Date().toISOString().slice(0, 13) + ':00:00'
    let currentCETTime = new Date().toLocaleString( 'sv', { timeZoneName: 'short', timeZone: 'Europe/Berlin' } ).slice(0, 13) + ':00:00'
    currentCETTime = currentCETTime.replace(' ', 'T');

    let row = jsonData.data.Rows.find(row => row.StartTime === currentCETTime);
    if (row) {
        // Price is in EUR/MWh
        return parseFloat(row.Columns[0].Value.replace(',', '.')) / 1000;
    }

}

updateSelectedTVModel();
updateSelectedElPrice();
updateSelectedCountry();
document.getElementById("tvModelSelect").addEventListener("change", setTVModel);
document.getElementById("elPrice").addEventListener("change", setElPrice);
document.getElementById("countrySelect").addEventListener("change", setCountry);

document.getElementById('getPriceButton').addEventListener('click', getCurrentPrice);
