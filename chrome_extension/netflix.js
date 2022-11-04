
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
}

function get_all_title_elements() {
    return document.querySelectorAll('.title-card [aria-label]');
}

(async function main() {
    let titles = get_all_title_elements();
    for (let i = 0; i < titles.length; i++) {
        let title_element = titles[i];
        await insert_score_on_thumbnail(title_element);
    }
  })();