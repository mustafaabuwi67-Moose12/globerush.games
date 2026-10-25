# GlobeRush: notes for Claude Code

Static site, no backend. Hosted from `/docs` on GitHub Pages.

## Layout
- `src/games/<slug>.html`: one file per game. React 18 + JSX in a `<script type="text/babel">` block, Tailwind play CDN for utility classes, each game's own CSS tokens in `<style>`. Question data lives inside the file.
- `src/site/index.html`: the home page (plain JS, renders cards from `config.js`).
- `src/site/config.js`: `window.GLOBERUSH`: site URL, contact email, the `ads` switch, affiliate link templates, the games list, and helpers (`day()`, `shuffled()`, `flightLink()`, `gameUrl()`). It also renders the shared GlobeRush top bar (`#gr-bar`) and the "play another game" cards (`#gr-more`) on every game page, and puts `.gr-ads` on `<html>` when `ads` is true.
- `src/site/lib/`: React and ReactDOM UMD builds, served locally.
- `src/howto/<slug>.html`: the "How to play, tips & fun facts" section under each game (h2, h3, p, ul only; 150–300 words).
- `src/pages/`: About, Contact, Privacy, Terms. `src/blog/`: one article per file. Both start with a `<!-- title: … -->` header comment; `{{email}}` and `{{games}}` are filled from `config.js`.
- `scripts/build.js`: reads `config.js` (in a `vm` sandbox), copies `src/site` to `docs/`, then for each game: points links at `config.js`, wraps every ad slot in `GLOBERUSH.ads &&`, precompiles JSX with Babel (no Babel in the browser), swaps CDN React for `lib/`, adds the page shell, GlobeRush chrome, how-to section and site footer, writes `docs/<slug>.html`. Then it adds the footer to the home page and builds the static pages and `docs/blog/`. It throws if a step can't find what it expects.
- `docs/`: build output. Don't edit by hand; run `npm run build`.

## Conventions
- Daily content: `GLOBERUSH.day().id` is today's puzzle number (day 1 = Oct 19, 2026). Pools are shuffled with a fixed seed and walked through so nothing repeats until the pool is used up.
- Saved progress uses localStorage with a key per game and day, and stores a lineup signature so a changed question list never crashes an old save. Always wrap storage in try/catch.
- Affiliate links: never hardcode. Use `GLOBERUSH.flightLink(from, to)`.
- Share cards: spoiler-free emoji grid + `GLOBERUSH.gameUrl(slug)`.
- Each game has: daily mode + bonus/practice mode, streak, share card with clipboard fallback, ad placeholders (728×90 desktop, 300×250 results, 320×50 sticky on mobile), keyboard shortcuts, `prefers-reduced-motion` support.
- Ads: each slot is `<div className="…"><AdSlot … /></div>` on its own so the build can gate it on `GLOBERUSH.ads` (off until AdSense approval). Magic Trip Quiz (kids) has no ad slots at all; don't add any.
- Facts, prices and quotes in games, how-to sections and blog posts were fact-checked; keep that bar when adding content. Text only for brand/character names, no logos or character images.

## Adding a game
1. Create `src/games/<slug>.html` following an existing game (Guess the City or Airport Code Quiz are the simplest templates; they read `window.GLOBERUSH` directly).
2. Add the slug to `GAMES` in `scripts/build.js` and an entry to `games` in `src/site/config.js`.
3. Write `src/howto/<slug>.html` (150–300 words; the build fails without it).
4. `npm run build`, then `npm run serve` and play it through.
