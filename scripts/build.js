// Turns each standalone travel game into a GlobeRush page: shared config, shared React, precompiled JSX, brand bar + more-games strip.
const fs = require("fs"), path = require("path"), B = require("@babel/standalone");
const ROOT = path.resolve(__dirname, ".."), SRC = path.join(ROOT, "src", "games"), OUT = path.join(ROOT, "docs");
fs.rmSync(OUT, { recursive: true, force: true }); fs.cpSync(path.join(ROOT, "src", "site"), OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
const GAMES = ["skyhop", "trivia-battle", "guess-the-city", "guess-the-beach", "airport-codes", "guess-the-flag", "departures", "fare-detective", "vegas-or-orlando", "vacation-price", "hot-takes", "would-you-rather", "magic-trip"];

const GR_CSS = `<style>
/* GlobeRush chrome shared by every game page (fixed brand colors so it reads the same on every game's background) */
#gr-bar{max-width:64rem;margin:6px auto 10px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 14px;border-radius:14px;background:#0E1A33;border:2px solid #000;border-bottom-width:4px;font-family:"Unbounded","Figtree",system-ui,sans-serif}
#gr-bar a{color:#FFF4E6;text-decoration:none}
#gr-bar .gr-home{display:flex;align-items:center;gap:8px;font-size:16px;letter-spacing:-.01em}
#gr-bar .gr-word{font-weight:600}#gr-bar .gr-word b{color:#FF7A4D;font-weight:800}
#gr-bar .gr-all{font-family:system-ui,sans-serif;font-weight:800;font-size:13px;padding:6px 12px;border-radius:999px;background:#FF7A4D;color:#1A0D05!important}
#gr-bar a:focus-visible,.gr-card:focus-visible{outline:3px solid #FFC94A;outline-offset:3px}
#gr-more{max-width:64rem;margin:28px auto 8px}
.gr-more-in{padding:18px;border-radius:18px;background:#0E1A33;border:2px solid #000;border-bottom-width:5px;color:#FFF4E6;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.gr-more-in h2{margin:0 0 12px;font-family:"Unbounded","Figtree",system-ui,sans-serif;font-size:18px;font-weight:700;color:#FFF4E6}
.gr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:10px}
.gr-card{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;background:#17284B;border:2px solid #000;color:#FFF4E6;text-decoration:none;transition:transform .1s,background .15s}
.gr-card:hover{transform:translateY(-2px);background:#1F3563}
.gr-e{font-size:24px;line-height:1}.gr-t{display:flex;flex-direction:column;min-width:0;line-height:1.25}
.gr-t b{font-size:14px}.gr-t small{font-size:12px;color:#AFC0E4;font-weight:700}
.gr-fine{margin:12px 0 0;font-size:11.5px;color:#AFC0E4}
@media (prefers-reduced-motion:reduce){.gr-card{transition:none}}
</style>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&display=swap">`;

function must(s, a, b, label) { if (!s.includes(a)) throw new Error(`${label}: missing ${a.slice(0, 60)}`); return s.split(a).join(b); }

for (const slug of GAMES) {
  let s = fs.readFileSync(path.join(SRC, slug + ".html"), "utf8");
  // 1. links come from config.js
  if (s.includes("const AFFILIATE = {")) s = must(s, "const AFFILIATE = {", "const AFFILIATE = (window.GLOBERUSH && window.GLOBERUSH.affiliate) || {", slug);
  if (slug === "skyhop") s = must(s, "const sky = `https://www.skyscanner.com/transport/flights/${puzzle.origin.toLowerCase()}/${puzzle.target.toLowerCase()}/`;",
    "const sky = window.GLOBERUSH.flightLink(puzzle.origin, puzzle.target);", slug);
  s = s.replace(/\{ url: "https:\/\/skyhop\.app\/([a-z-]+)" \}/g, (m, g) => `{ url: window.GLOBERUSH.gameUrl("${g}") }`);
  s = s.replace(/https:\/\/skyhop\.app\/([a-z-]+)`/g, (m, g) => '${window.GLOBERUSH.gameUrl("' + g + '")}`');
  s = s.replace(/Play: https:\/\/skyhop\.app`/g, 'Play: ${window.GLOBERUSH.gameUrl("skyhop")}`');
  if (/skyhop\.app/.test(s)) throw new Error(slug + ": leftover skyhop.app");
  s = s.replace(/ prototype · /g, " · a GlobeRush game · ");
  // daily rotation for the three earliest games (they were built around one fixed puzzle)
  const DAYFIX = {
    skyhop: [
      ['const DAILY = { id: 42, origin: "ATL", target: "HND" };',
       'const GR_DAY = window.GLOBERUSH.day();\nconst DAILY = (() => { const codes = AIRPORTS.map(a => a.iata), pool = []; for (const a of codes) for (const b of codes) if (a !== b && isSolvable(a, b)) pool.push([a, b]); const p = window.GLOBERUSH.shuffled(pool, 4242)[(GR_DAY.id - 1) % pool.length]; return { id: GR_DAY.id, origin: p[0], target: p[1] }; })();'],
      ['const SAVE_KEY = "skyhop-42-v2";', 'const SAVE_KEY = "skyhop-day-" + DAILY.id;'],
      ['{ count: 7, last: 41 }', '{ count: 0, last: 0 }'],
      ['Daily #{DAILY.id} · Mon, Oct 19', 'Daily #{DAILY.id} · {GR_DAY.label}'],
    ],
    departures: [
      ['const DAILY = { id: 1, code: "HNL" };', 'const GR_DAY = window.GLOBERUSH.day();\nconst DAILY = { id: GR_DAY.id, code: window.GLOBERUSH.shuffled(Object.keys(BOARDS), 808)[(GR_DAY.id - 1) % Object.keys(BOARDS).length] };'],
      ['const SAVE_KEY = "departures-1";', 'const SAVE_KEY = "departures-day-" + DAILY.id;'],
      ['Board #{DAILY.id} · Mon, Oct 19', 'Board #{DAILY.id} · {GR_DAY.label}'],
    ],
    "fare-detective": [
      ['const DAY = { id: 1, label: "Mon, Oct 19" };', 'const DAY = window.GLOBERUSH.day();'],
      ['const SAVE_KEY = "fare-detective-1";', 'const SAVE_KEY = "fare-detective-day-" + DAY.id;'],
    ],
  };
  for (const [a, b] of DAYFIX[slug] || []) s = must(s, a, b, slug);
  // 2. scripts: shared local React, no Babel or Lucide (SkyHop has built-in icon fallbacks), JSX precompiled
  s = s.replace(/<script src="[^"]*lucide-react[^"]*"><\/script>\s*/g, "");
  s = s.replace(/<script src="[^"]*babel\.min\.js"><\/script>\s*/g, "");
  s = s.replace(/<script src="[^"]*\/react\.production\.min\.js"><\/script>/, '<script src="lib/react.production.min.js"></script>');
  s = s.replace(/<script src="[^"]*\/react-dom\.production\.min\.js"><\/script>/, '<script src="lib/react-dom.production.min.js"></script>\n<script src="config.js"></script>');
  s = s.replace(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/, (m, code) => "<script>\n" + B.transform(code, { presets: ["react"] }).code + "\n</script>");
  if (/text\/babel|babel\.min|<script src="[^"]*(lucide|jsdelivr|unpkg)/.test(s)) throw new Error(slug + ": leftover external JS");
  // 3. page shell (extra pages are served without the artifact skeleton) + GlobeRush chrome
  s = s.replace(/<title>([^<]*)<\/title>/, (m, t) => `<title>${t} · GlobeRush</title>`);
  s = s.replace('<div id="root">', '<div id="gr-bar"></div>\n<div id="root">');
  s = s.replace(/(<div id="root">[\s\S]*?<\/div><\/div>)/, '$1\n<div id="gr-more"></div>');
  if (!s.includes('<div id="gr-more">')) throw new Error(slug + ": root not found");
  s = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}</style>\n${GR_CSS}\n</head>\n<body data-game="${slug}">\n${s}\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(OUT, slug + ".html"), s);
  console.log("built", slug, s.length);
}
