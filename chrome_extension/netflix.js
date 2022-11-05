
async function getTitleScore(title) {
  // Randomly generate a score between 0 and 10 for now, with 2 decimals.
  // Wait 0.2 second to simulate a network request.
  let score = Math.random() * 10;
  score = score.toFixed(2);
  await new Promise(resolve => setTimeout(resolve, 10));
  return score;
}

async function insertScoreOnThumbnail(element) {
  let title = element.getAttribute('aria-label');
  let score = await getTitleScore(title);
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

    // Score all new titles
    for (let i = 0; i < titles.length; i++) {
      let title_element = titles[i];
      await insertScoreOnThumbnail(title_element);
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
