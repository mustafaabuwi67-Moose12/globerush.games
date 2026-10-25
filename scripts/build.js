// Turns each standalone travel game into a GlobeRush page: shared config, shared React, precompiled JSX, brand bar + more-games strip,
// how-to section and site footer. Then builds the About/Contact/Privacy/Terms pages and the blog from src/pages and src/blog.
const fs = require("fs"), path = require("path"), vm = require("vm"), B = require("@babel/standalone");
const ROOT = path.resolve(__dirname, ".."), SRC = path.join(ROOT, "src", "games"), OUT = path.join(ROOT, "docs");
fs.rmSync(OUT, { recursive: true, force: true }); fs.cpSync(path.join(ROOT, "src", "site"), OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
const GAMES = ["skyhop", "trivia-battle", "guess-the-city", "guess-the-beach", "airport-codes", "guess-the-flag", "departures", "fare-detective", "vegas-or-orlando", "vacation-price", "hot-takes", "would-you-rather", "magic-trip"];
// config.js is browser code: run it with a stand-in window and document to read the settings the static pages need
const CFG = (() => {
  const sb = { window: {}, document: { readyState: "loading", addEventListener() {}, documentElement: { classList: { toggle() {} } } } };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "src", "site", "config.js"), "utf8"), sb);
  return sb.window.GLOBERUSH;
})();
if (/@example\.com$/.test(CFG.contactEmail)) console.warn("WARNING: contactEmail in src/site/config.js is still the placeholder. Set your real address before applying to AdSense.");
const YEAR = new Date().getFullYear();
const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const words = html => html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;

const FOOT_STYLE = `/* site footer on every page: links to the blog and the About/Contact/legal pages */
#gr-foot{max-width:64rem;margin:20px auto 8px;padding:16px 18px;border-radius:16px;background:#0E1A33;border:2px solid #000;border-bottom-width:4px;color:#AFC0E4;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px;font-weight:500;line-height:1.5}
#gr-foot nav{display:flex;flex-wrap:wrap;gap:2px 18px;margin-bottom:8px}
#gr-foot nav a{padding:4px 0;color:#FFF4E6;font-size:14px;font-weight:800;text-decoration:none}
#gr-foot nav a:hover{text-decoration:underline;text-underline-offset:3px}
#gr-foot a:focus-visible{outline:3px solid #FFC94A;outline-offset:3px;border-radius:4px}
#gr-foot p{margin:4px 0 0}#gr-foot b{color:#FFF4E6}
.wrap>#gr-foot{max-width:none;margin:0}`;
const footer = b => `<footer id="gr-foot">
<nav aria-label="GlobeRush">${[["index.html", "All games"], ["blog/index.html", "Blog"], ["about.html", "About"], ["contact.html", "Contact"], ["privacy.html", "Privacy Policy"], ["terms.html", "Terms"]]
  .map(([href, label]) => `<a href="${b}${href}">${label}</a>`).join("")}</nav>
<p><b>GlobeRush</b> · free travel games, new every day. © ${YEAR} GlobeRush</p>
<p>GlobeRush may earn a commission when you book through links on this site, at no extra cost to you. Prices and facts in the games are examples for play; always check current prices before you book.</p>
</footer>`;

const GR_STYLE = `/* GlobeRush chrome shared by every game page (fixed brand colors so it reads the same on every game's background) */
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
@media (prefers-reduced-motion:reduce){.gr-card{transition:none}}
/* "How to play, tips & fun facts" under each game (src/howto/<slug>.html) */
#gr-howto{max-width:64rem;margin:28px auto 0}
.gr-howto-in{padding:clamp(18px,3.5vw,28px);border-radius:18px;background:#FFF4E6;color:#13203D;border:2px solid #000;border-bottom-width:5px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;font-weight:500;line-height:1.6}
.gr-howto-in>*{max-width:46rem}
.gr-howto-in h2{margin:0 0 10px;font-family:"Unbounded","Figtree",system-ui,sans-serif;font-size:clamp(18px,3vw,22px);font-weight:700;line-height:1.25;letter-spacing:-.01em;color:#13203D}
.gr-howto-in h3{margin:18px 0 6px;font-family:"Unbounded","Figtree",system-ui,sans-serif;font-size:15px;font-weight:700;color:#B94A23}
.gr-howto-in p{margin:0 0 10px}
.gr-howto-in ul{margin:0;padding-left:1.25em;list-style:disc}
.gr-howto-in li{margin:5px 0}.gr-howto-in li::marker{color:#FF7A4D}
.gr-howto-in b{font-weight:800}
${FOOT_STYLE}`;
const GR_CSS = `<style>
${GR_STYLE}
/* with ads off (config.js), give back the room games keep at the bottom for the mobile sticky ad */
@media (max-width:767px){html:not(.gr-ads) body{padding-bottom:calc(32px + env(safe-area-inset-bottom,0px))}}
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
  // ad slots render only when config.js has ads: true (Magic Trip Quiz has none on purpose)
  const SLOT = /<div className="[^"]*"><AdSlot [^>]*\/><\/div>/g;
  if ((s.match(SLOT) || []).length !== (s.match(/<AdSlot /g) || []).length) throw new Error(slug + ": every <AdSlot> must sit alone in one <div>");
  s = s.replace(SLOT, m => `{window.GLOBERUSH.ads && (${m})}`);
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
  const howto = path.join(ROOT, "src", "howto", slug + ".html");
  if (!fs.existsSync(howto)) throw new Error(`${slug}: missing src/howto/${slug}.html`);
  const tips = fs.readFileSync(howto, "utf8").trim(), n = words(tips);
  if (n < 150 || n > 300) throw new Error(`${slug}: how-to section is ${n} words, keep it 150–300`);
  s = s.replace(/(<div id="root">[\s\S]*?<\/div><\/div>)/, m => `${m}\n<section id="gr-howto" aria-label="How to play, tips and fun facts"><div class="gr-howto-in">\n${tips}\n</div></section>\n<div id="gr-more"></div>\n${footer("")}`);
  if (!s.includes('<div id="gr-more">')) throw new Error(slug + ": root not found");
  s = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}</style>\n${GR_CSS}\n</head>\n<body data-game="${slug}">\n${s}\n</body>\n</html>\n`;
  fs.writeFileSync(path.join(OUT, slug + ".html"), s);
  console.log("built", slug, s.length);
}

// 4. home page: the shared footer goes where src/site/index.html has the marker
const HOME = path.join(OUT, "index.html");
fs.writeFileSync(HOME, must(fs.readFileSync(HOME, "utf8"), "<!-- GR:footer -->", `<style>\n${FOOT_STYLE}\n</style>\n${footer("")}`, "index"));

// 5. About / Contact / Privacy / Terms and the blog: plain static pages (no React) in the home page's night-sky look
const PAGE_STYLE = `/* text pages: night sky with a boarding-pass-cream sheet of paper */
:root{color-scheme:dark}
html,body{background:#0B1428;color:#FFF4E6}
body{margin:0;font-family:"Figtree",system-ui,-apple-system,"Segoe UI",sans-serif;font-weight:500;font-size:17px;line-height:1.65;
  padding:12px max(16px,env(safe-area-inset-right,0px)) 40px max(16px,env(safe-area-inset-left,0px));
  background-image:radial-gradient(1200px 520px at 80% -10%,rgba(255,122,77,.16),transparent 65%)}
#gr-bar,#gr-foot{max-width:46rem}
.gr-main{max-width:46rem;margin:0 auto;display:flex;flex-direction:column;gap:18px}
.gr-crumb{margin-top:4px;font-size:14px;font-weight:700;color:#AFC0E4}
.gr-crumb a{color:#FFF4E6;text-decoration:none}.gr-crumb a:hover{text-decoration:underline}
.gr-paper{padding:clamp(20px,4.5vw,40px);border-radius:18px;background:#FFF4E6;color:#13203D;border:2px solid #000;border-bottom-width:6px;overflow-wrap:break-word}
.gr-paper>:first-child{margin-top:0}
.gr-paper h1{margin:0 0 6px;font-family:"Unbounded","Arial Black",system-ui,sans-serif;font-weight:800;font-size:clamp(26px,5vw,40px);line-height:1.1;letter-spacing:-.02em;text-wrap:balance}
.gr-paper h2{margin:30px 0 8px;font-family:"Unbounded",system-ui,sans-serif;font-weight:700;font-size:clamp(19px,3vw,22px);line-height:1.25;letter-spacing:-.01em;text-wrap:balance}
.gr-paper h3{margin:22px 0 6px;font-size:18px;font-weight:800}
.gr-paper p,.gr-paper ul,.gr-paper ol{margin:0 0 14px}
.gr-paper ul,.gr-paper ol{padding-left:1.3em}
.gr-paper li{margin:5px 0}.gr-paper li::marker{color:#B94A23}
.gr-paper a{color:#B94A23;font-weight:700;text-underline-offset:3px}
.gr-paper b,.gr-paper strong{font-weight:800}
.gr-paper .gr-meta{margin:0 0 22px;font-size:14px;font-weight:700;color:#55607A}
.gr-lede{font-size:18px;color:#2E3A57}
.gr-play{margin-top:30px;padding:16px;border-radius:14px;background:#0E1A33;border:2px solid #000;color:#FFF4E6}
.gr-play h2{margin:0 0 12px;font-size:17px;color:#FFF4E6}
.gr-paper .gr-card{color:#FFF4E6;font-weight:600;text-decoration:none}
.gr-posts{list-style:none;padding:0!important;margin:18px 0 0;display:grid;gap:12px}
.gr-posts li{margin:0}
.gr-posts a{display:flex;flex-direction:column;gap:4px;padding:16px 18px;border-radius:14px;background:#fff;border:2px solid #13203D;border-bottom-width:5px;color:#13203D;text-decoration:none;transition:transform .1s}
.gr-posts a:hover{transform:translateY(-2px)}
.gr-posts b{font-family:"Unbounded",system-ui,sans-serif;font-size:18px;font-weight:700;line-height:1.25}
.gr-posts span{font-size:15.5px;font-weight:500;color:#2E3A57}
.gr-posts small{font-size:13px;font-weight:700;color:#55607A}
:focus-visible{outline:3px solid #FFC94A;outline-offset:3px}
@media (prefers-reduced-motion:reduce){.gr-posts a{transition:none}}`;
const bar = b => `<div id="gr-bar"><a class="gr-home" href="${b}index.html" aria-label="GlobeRush home"><span class="gr-globe" aria-hidden="true">🌍</span><span class="gr-word">Globe<b>Rush</b></span></a><a class="gr-all" href="${b}index.html">All games</a></div>`;
const page = ({ title, description, b, main }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} · GlobeRush</title>
<meta name="description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;700;800&family=Figtree:wght@500;600;700;800&display=swap">
<style>
${GR_STYLE}
${PAGE_STYLE}
</style>
</head>
<body>
${bar(b)}
<main class="gr-main">
${main}
</main>
${footer(b)}
</body>
</html>
`;
// content files start with a "key: value" comment: title and description, plus date and games for blog posts
function readDoc(file) {
  const s = fs.readFileSync(file, "utf8"), m = s.match(/^<!--([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${file}: missing the <!-- title: … --> header`);
  const meta = {};
  for (const line of m[1].split("\n")) { const i = line.indexOf(":"); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  if (!meta.title || !meta.description) throw new Error(`${file}: header needs a title and a description`);
  return { meta, body: s.slice(m[0].length).trim() };
}
// {{email}} and {{games}} in page text come from config.js
const fill = (body, b) => body
  .replace(/\{\{email\}\}/g, () => `<a href="mailto:${esc(CFG.contactEmail)}">${esc(CFG.contactEmail)}</a>`)
  .replace(/\{\{games\}\}/g, () => "<ul>" + CFG.games.map(g => `<li><a href="${b}${esc(g.slug)}.html">${esc(g.name)}</a>: ${esc(g.blurb)}</li>`).join("") + "</ul>");

for (const name of ["about", "contact", "privacy", "terms"]) {
  const { meta, body } = readDoc(path.join(ROOT, "src", "pages", name + ".html"));
  fs.writeFileSync(path.join(OUT, name + ".html"), page({ ...meta, b: "", main: `<article class="gr-paper">\n<h1>${esc(meta.title)}</h1>\n${fill(body, "")}\n</article>` }));
  console.log("built", name);
}

const BLOG = path.join(ROOT, "src", "blog");
const card = (g, b) => `<a class="gr-card" href="${b}${esc(g.slug)}.html"><span class="gr-e" aria-hidden="true">${g.emoji}</span><span class="gr-t"><b>${esc(g.name)}</b><small>${esc(g.kind)} · ${g.mins} min</small></span></a>`;
const dateLabel = d => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const posts = fs.readdirSync(BLOG).filter(f => f.endsWith(".html")).map(f => {
  const { meta, body } = readDoc(path.join(BLOG, f));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || "")) throw new Error(`blog/${f}: date must be YYYY-MM-DD`);
  const games = (meta.games || "").split(",").map(g => g.trim()).filter(Boolean);
  for (const g of games) if (!GAMES.includes(g)) throw new Error(`blog/${f}: unknown game "${g}"`);
  return { ...meta, slug: f.slice(0, -5), body, games, mins: Math.max(1, Math.round(words(body) / 220)) };
}).sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
if (!posts.length) throw new Error("no blog posts in src/blog");
const listing = list => `<ul class="gr-posts">${list.map(p => `<li><a href="${p.slug}.html"><b>${esc(p.title)}</b><span>${esc(p.description)}</span><small>${dateLabel(p.date)} · ${p.mins} min read</small></a></li>`).join("")}</ul>`;
fs.mkdirSync(path.join(OUT, "blog"));
for (const p of posts) {
  const play = CFG.games.filter(g => p.games.includes(g.slug)); // only games still listed in config.js
  const main = `<nav class="gr-crumb" aria-label="Breadcrumb"><a href="../index.html">GlobeRush</a> › <a href="index.html">Blog</a></nav>
<article class="gr-paper">
<h1>${esc(p.title)}</h1>
<p class="gr-meta">${dateLabel(p.date)} · ${p.mins} min read</p>
${p.body}
${play.length ? `<aside class="gr-play"><h2>Play the games from this article</h2><div class="gr-grid">${play.map(g => card(g, "../")).join("")}</div></aside>` : ""}
</article>
${posts.length > 1 ? `<section class="gr-paper" aria-labelledby="more-h"><h2 id="more-h">More from the blog</h2>${listing(posts.filter(q => q !== p))}</section>` : ""}`;
  fs.writeFileSync(path.join(OUT, "blog", p.slug + ".html"), page({ title: p.title, description: p.description, b: "../", main }));
  console.log("built blog/" + p.slug);
}
const BLOG_INTRO = "Short travel reads about flying, cities, flags and vacations, to go with GlobeRush's free daily games.";
fs.writeFileSync(path.join(OUT, "blog", "index.html"), page({ title: "Travel blog", description: BLOG_INTRO, b: "../",
  main: `<article class="gr-paper">\n<h1>The GlobeRush blog</h1>\n<p class="gr-lede">${esc(BLOG_INTRO)}</p>\n${listing(posts)}\n</article>` }));
console.log("built blog/index", posts.length, "posts");
