const tvModels = {
    "LG OLED55BXPUA": [106, 295],
    "TCL 65P610": [120, 190],
    "LG 75UN7070PUC": [110, 240],
    "Samsung QN55Q80AAFXZA": [88, 220],
    "Samsung UN86TU9000FXZA": [120, 285],
    "Samsung QN75QN900AFXZC": [234, 475],
    "Samsung QN43Q60BAFXZC": [50, 115],
    "Samsung QN85QN85AAFXZC": [104, 315],
    "LG 60UN7000PUB": [83.9, 175],
    "LG 82UN8570PUC": [158, 315],
    "LG 55UN7000PUB": [68.6, 140],
    "TCL 50P610": [73, 130],
    "TCL 55P815": [87, 140]
}



function calculateTitleScore(tvData, movieData, price_per_hour) {
    let min_power_consumption = tvData[0];
    let max_power_consumption = tvData[1];
    let pixels_cost = movieData.pixels_cost;
    let movie_length_hours = movieData.runtime_hours;
    return (
        min_power_consumption + 
            (max_power_consumption - min_power_consumption) * pixels_cost
        / (2850.0 * 480)
    ) * movie_length_hours / 1000 * price_per_hour;
}


async function insertScoreOnThumbnail(element, tvData, elPrice) {
    let title = element.getAttribute('aria-label');
    let movieData = movieDatabase[title];
    let score;
    if (movieData) {
        score = await calculateTitleScore(tvData, movieData, elPrice);
    } else {
        score = 'N/A';
    }
    let scoreElement = document.createElement('div');
    scoreElement.innerHTML = score;
    element.appendChild(scoreElement);
    element.classList.add('movieZap-score');
    // scoredTitles.add(title);
}

function getAllTitleElements() {
    return document.querySelectorAll('.title-card [aria-label]:not(.movieZap-score)');
}

let scoringInProgress = false;
let scoredTitles = new Set();

async function scoreAllTitles() {
    if (!scoringInProgress) {
        console.log('Scoring in progress...');
        scoringInProgress = true;

        // Detect all titles on the page
        let titles = getAllTitleElements();
        // Ignore titles that have already been scored.
        // titles = Array.from(titles).filter(title => !scoredTitles.has(title.getAttribute('aria-label')));
        console.log("Found " + titles.length + " new titles.");
        if (titles.length > 0) {
            chrome.storage.sync.get(['elPrice', 'tvModel'], async function(data) {
                let tvData = tvModels[data.tvModel];
                let elPrice = data.elPrice;
                // Score all new titles
                for (let i = 0; i < titles.length; i++) {
                    let title_element = titles[i];
                    await insertScoreOnThumbnail(title_element, tvData, elPrice);
                }
            });
        }

        scoringInProgress = false;
        console.log('Scoring done.');
    }

}

(async function main() {
    // Run every 2 seconds
    const scoringFunction = () => {
        try {
            scoreAllTitles();
        } catch (e) {
	        console.error(e);
        }
        setTimeout(scoringFunction, 2000);
    };
    setTimeout(scoringFunction, 100);
})();
