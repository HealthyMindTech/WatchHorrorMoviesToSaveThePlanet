// Data
// the numbers are NordPool pageIds
const countryData = {
  FI: { pageId: 35, hourDiff: 1 },
  DK: { pageId: 41, hourDiff: 0 },
  EE: { pageId: 47, hourDiff: 1 },
  LV: { pageId: 59, hourDiff: 1 },
  LT: { pageId: 53, hourDiff: 1 },
  AT: { pageId: 298578, hourDiff: 0 },
  BE: { pageId: 298736, hourDiff: 0 },
  DE: { pageId: 299565, hourDiff: 0 },
  FR: { pageId: 299568, hourDiff: 0 },
  NL: { pageId: 299571, hourDiff: 0 },
  SE: { pageId: 29, entityName: "SE3", hourDiff: 0 },
  NO: { pageId: 23, entityName: "Oslo", hourDiff: 0 },
};

function setBackgroundImage() {
    // Get image url from extension folder
    const imageUrl = chrome.runtime.getURL("images/background.png");
    // Set img src on the .demo-bg
    document.querySelector(".demo-bg").src = imageUrl;
}

function setTVModel(event) {
  chrome.storage.sync.set({ tvModel: event.target.value }, function () {});
}
function updateSelectedTVModel() {
  chrome.storage.sync.get("tvModel", function (data) {
    if (data && data.tvModel != null) {
      document.getElementById("tvModelSelect").value = data.tvModel;
    }
  });
}
function setElPrice(event) {
  chrome.storage.sync.set({ elPrice: event.target.value }, function () {});
}
function updateSelectedElPrice() {
  chrome.storage.sync.get("elPrice", function (data) {
    if (data && data.elPrice != null) {
      document.getElementById("elPrice").value = data.elPrice;
    }
  });
}

function setCountry(event) {
  chrome.storage.sync.set({ country: event.target.value }, function () {});
}
function updateSelectedCountry() {
  chrome.storage.sync.get("country", function (data) {
    if (data.country) {
      document.getElementById("countrySelect").value = data.country;
    } else {
      document.getElementById("countrySelect").value = "FI";
    }
  });
}

async function getCurrentPrice() {
  chrome.storage.sync.get("country", async function (data) {
    // Add loading class
    document.getElementById("getPriceButton").classList.add("loading");

    let country = data.country;
    if (!country) {
      country = "FI";
    }
    console.log("Country: " + country);
    // in YYYY-MM-DD format
    let currentCETDate = new Date()
      .toLocaleString("sv", {
        timeZoneName: "short",
        timeZone: "Europe/Berlin",
      })
      .slice(0, 10);
    let dateDay = currentCETDate.slice(8, 10);
    let dateMonth = currentCETDate.slice(5, 7);
    let dateYear = currentCETDate.slice(0, 4);
    const date = `${dateDay}-${dateMonth}-${dateYear}`;
    const pageId = countryData[country].pageId;
    let url = `http://34.88.229.226:3001/?page_id=${pageId}&date=${date}`;
    chrome.runtime.sendMessage(
      {
        contentScriptQuery: "getData",
        url: url,
      },
      function (jsonData) {
        console.log(jsonData);
        let price = getPriceFromJson(jsonData);
        // Round to 5 decimals
        console.log("Price: " + price);
        // Add the network price to the price
        let networkPrice = parseFloat(
          document.getElementById("networkPrice").value
        );
        let totalPrice =
            Math.round((price + (networkPrice || 0.0)) * 10000) / 10000;
        document.getElementById("elPrice").value = totalPrice;
        // Remove loading class
        document.getElementById("getPriceButton").classList.remove("loading");
        chrome.storage.sync.set({ elPrice: totalPrice }, function () {});
      }
    );
  });
}
function setNetworkPrice(event) {
  chrome.storage.sync.set({ networkPrice: event.target.value }, function () {});
}

function updateNetworkPrice() {
  chrome.storage.sync.get("networkPrice", function (data) {
    if (data && data.networkPrice != null) {
      document.getElementById("networkPrice").value = data.networkPrice;
    }
  });
}

function getPriceFromJson(jsonData) {
  // We need timestamp in string format "2022-11-05T10:00:00" Floor to get the hour
  // Currenthour is 0-23
  // Should be like this but in CET timezone
  // new Date().toISOString().slice(0, 13) + ':00:00'
  let time = new Date().toLocaleString("sv", {
    timeZoneName: "short",
    timeZone: "Europe/Berlin",
  });

  let datePart = time.slice(0, 10);
  let hour = /^\d+/.exec(time.slice(11));
  const hourNumber = hour[0].length === 1 ? '0' + hour[0] : hour[0]

  let currentCETTime = `${datePart}T${hourNumber}:00:00`;
  console.log(currentCETTime);

  let row = jsonData.data.Rows.find((row) => row.StartTime === currentCETTime);
  if (row) {
    // Price is in EUR/MWh
    return parseFloat(row.Columns[0].Value.replace(",", ".")) / 1000;
  }
}

(function () {
  setBackgroundImage();
  updateSelectedTVModel();
  updateSelectedElPrice();
  updateSelectedCountry();
  updateNetworkPrice();
  document
    .getElementById("tvModelSelect")
    .addEventListener("change", setTVModel);
  document.getElementById("elPrice").addEventListener("change", setElPrice);
  document
    .getElementById("countrySelect")
    .addEventListener("change", setCountry);
  document
    .getElementById("networkPrice")
    .addEventListener("change", setNetworkPrice);
  document
    .getElementById("getPriceButton")
    .addEventListener("click", getCurrentPrice);
})();
