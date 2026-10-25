# GlobeRush: notes for Claude Code

Static site, no backend. Hosted from `/docs` on GitHub Pages.

## Layout
- `src/games/<slug>.html`: one file per game. React 18 + JSX in a `<script type="text/babel">` block, Tailwind play CDN for utility classes, each game's own CSS tokens in `<style>`. Question data lives inside the file.
- `src/site/index.html`: the home page (plain JS, renders cards from `config.js`).
- `src/site/config.js`: `window.GLOBERUSH`: site URL, affiliate link templates, the games list, and helpers (`day()`, `shuffled()`, `flightLink()`, `gameUrl()`). It also renders the shared GlobeRush top bar (`#gr-bar`) and the "play another game" cards (`#gr-more`) on every game page.
- `src/site/lib/`: React and ReactDOM UMD builds, served locally.
- `scripts/build.js`: copies `src/site` to `docs/`, then for each game: points links at `config.js`, precompiles JSX with Babel (no Babel in the browser), swaps CDN React for `lib/`, adds the page shell and GlobeRush chrome, writes `docs/<slug>.html`. It throws if a step can't find what it expects.
- `docs/`: build output. Don't edit by hand; run `npm run build`.

## Conventions
- Daily content: `GLOBERUSH.day().id` is today's puzzle number (day 1 = Oct 19, 2026). Pools are shuffled with a fixed seed and walked through so nothing repeats until the pool is used up.
- Saved progress uses localStorage with a key per game and day, and stores a lineup signature so a changed question list never crashes an old save. Always wrap storage in try/catch.
- Affiliate links: never hardcode. Use `GLOBERUSH.flightLink(from, to)`.
- Share cards: spoiler-free emoji grid + `GLOBERUSH.gameUrl(slug)`.
- Each game has: daily mode + bonus/practice mode, streak, share card with clipboard fallback, ad placeholders (728×90 desktop, 300×250 results, 320×50 sticky on mobile), keyboard shortcuts, `prefers-reduced-motion` support.
- Facts, prices and quotes in games were fact-checked; keep that bar when adding content. Text only for brand/character names, no logos or character images.

## Adding a game
1. Create `src/games/<slug>.html` following an existing game (Guess the City or Airport Code Quiz are the simplest templates; they read `window.GLOBERUSH` directly).
2. Add the slug to `GAMES` in `scripts/build.js` and an entry to `games` in `src/site/config.js`.
3. `npm run build`, then `npm run serve` and play it through.
