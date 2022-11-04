
async function get_title_score(title) {
    // Randomly generate a score between 0 and 10 for now, with 2 decimals.
    // Wait 0.2 second to simulate a network request.
    let score = Math.random() * 10;
    score = score.toFixed(2);
    await new Promise(resolve => setTimeout(resolve, 200));
    return score;
}

async function insert_score_on_thumbnail(element) {
    let title = element.getAttribute('aria-label');
    let score = await get_title_score(title);
    let score_title = document.createElement('div');
    score_title.innerHTML = score;
    element.appendChild(score_title);
    scored_titles.add(title);
}

function get_all_title_elements() {
    return document.querySelectorAll('.title-card [aria-label]');
}



(async function main() {
    if (window.netflixScoring === undefined) {
        window.netflixScoring = true;
        chrome.storage.sync.get(['scored_titles'], async function(result) {
            console.log('Value currently is ' + result.scored_titles);
            if (result.scored_titles === undefined) {
                scored_titles = new Set();
            } else {
                console.log("Scored titles: " + result.scored_titles.length);
                scored_titles = result.scored_titles;
            }
            console.log(scored_titles)
            console.log(typeof(scored_titles))
            let titles = get_all_title_elements();
            // Ignore titles that have already been scored.
            titles = Array.from(titles).filter(title => !scored_titles.has(title.getAttribute('aria-label')));
            console.log("Found " + titles.length + " titles.");
            for (let i = 0; i < titles.length; i++) {
                let title_element = titles[i];
                await insert_score_on_thumbnail(title_element);
            }
            chrome.storage.sync.set({scored_titles}, function() {
                console.log('Value is set to ' + scored_titles);
                window.netflixScoring = undefined;
            });
        });
    }
  })();
