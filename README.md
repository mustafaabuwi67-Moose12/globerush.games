# GlobeRush

Free daily travel games. Every game ends with a flight affiliate link, plus ad slots.

## Games
SkyHop · Travel Trivia Battle · Guess the City · Guess the Beach · Airport Code Quiz · Guess the Flag · Mystery Departures · Fare Detective ·
Vegas or Orlando? · Guess the Vacation Price · Travel Hot Takes · Would You Rather: Travel · Magic Trip Quiz (kids)

## Change your links and domain
Edit **`src/site/config.js`** (the only settings file):
- `site`: your domain, used in every share card
- `affiliate`: your flight affiliate links (`route`, `toOnly`, `general`)
- `games`: the list on the home page; delete a line to hide a game

Then run `npm run build`.

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
- Swap the "Monetization Slot" placeholders for real ad code once AdSense approves the site.
- Magic Trip Quiz is for kids: set its ads to child-directed (non-personalized), and keep sign-ups off that page.
