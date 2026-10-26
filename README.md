# GlobeRush

Free daily travel games. Every game ends with a flight affiliate link, plus ad slots.

## Games
Carry-On Fitter · Travel Trivia Battle · Guess the City · Guess the Beach · Airport Code Quiz · Guess the Flag · Mystery Departures · Fare Detective ·
Vegas or Orlando? · Guess the Vacation Price · Travel Hot Takes · Would You Rather: Travel · Magic Trip Quiz (kids)

## Change your links and domain
Edit **`src/site/config.js`** (the only settings file):
- `site`: your domain, used in every share card
- `contactEmail`: the address on the Contact, Privacy and Terms pages
- `ads`: `false` hides every ad slot; set it to `true` once AdSense approves the site
- `affiliate`: your flight affiliate links (`route`, `toOnly`, `general`)
- `games`: the list on the home page; delete a line to hide a game

Then run `npm run build`.

## Change the words
- `src/pages/`: About, Contact, Privacy Policy and Terms. `{{email}}` becomes `contactEmail`, `{{games}}` the games list.
- `src/blog/`: one file per article. Start it with a header comment (`title`, `description`, `date`, `games`) like the existing posts; the blog index builds itself.
- `src/howto/<slug>.html`: the "How to play, tips & fun facts" text under each game (the build insists on 150–300 words).

Every page gets the same footer: All games · Blog · About · Contact · Privacy Policy · Terms.

## Build and preview
```
npm install
npm run build     # writes the finished site to /docs
npm run serve     # preview at http://localhost:8080
```

## Put it online (GitHub Pages, free)
1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Deploy from a branch**, branch `main`, folder **`/docs`**.
3. To use your own domain, add it under **Settings → Pages → Custom domain**, then point your domain's DNS at GitHub Pages.

## Before launch
- Add your real affiliate links in `src/site/config.js`.
- Set your real `contactEmail` in `src/site/config.js` (the build warns while it's still the placeholder).
- Once AdSense approves the site: set `ads: true`, swap the "Monetization Slot" placeholders for real ad code, and turn on Google's consent message for visitors in the EEA, UK and Switzerland (the Privacy Policy promises it).
- Magic Trip Quiz is for kids: it has no ad slots on purpose, whatever `ads` says. Keep it that way, and keep sign-ups off that page.
