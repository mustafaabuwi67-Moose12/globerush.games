/* =====================================================================
   GLOBERUSH SETTINGS: the one file you edit.
   Every game on the site reads its links from here, so change a link once and it updates everywhere.

   site         = your real domain once you have it (used in every share card, e.g. https://globerush.com/skyhop)
   affiliate    = your flight affiliate links. Placeholders you can use:
                    {FROM} {TO} = airport codes in capitals (JFK)   {from} {to} = lowercase (jfk)
                  route   → used when both airports are known
                  toOnly  → used when only the destination is known
                  general → used for generic "find cheap flights" buttons
                  For Skyscanner, add your partner/tracking parameters to the end of each link.
   contactEmail = the address shown on the Contact, Privacy and Terms pages.
   ads          = false hides every ad slot. Set it to true once AdSense approves the site.
                  Magic Trip Quiz (the kids' page) never shows ads, whatever this says.
   ===================================================================== */
window.GLOBERUSH = {
  site: "https://globerush.com",
  contactEmail: "hello@example.com",
  ads: false,
  affiliate: {
    route:   "https://www.skyscanner.com/transport/flights/{from}/{to}/",
    toOnly:  "https://www.skyscanner.com/transport/flights-to/{to}/",
    general: "https://www.skyscanner.com/",
  },

  /* The games on the site, in the order they appear. To hide a game, delete its line. */
  games: [
    { slug: "skyhop",           name: "SkyHop",                   emoji: "✈️", kind: "Daily puzzle", mins: 3, blurb: "Connect two cities in as few nonstop flights as you can." },
    { slug: "trivia-battle",    name: "Travel Trivia Battle",     emoji: "⚔️", kind: "Daily battle", mins: 3, blurb: "Beat today's rival traveler in 10 rapid-fire questions, or challenge a friend on one phone." },
    { slug: "guess-the-city",   name: "Guess the City",           emoji: "📮", kind: "Daily puzzle", mins: 3, blurb: "Five postcard clues, from hard to easy. Name the mystery city in as few as you can." },
    { slug: "guess-the-beach",  name: "Guess the Beach",          emoji: "🏖️", kind: "Daily puzzle", mins: 3, blurb: "Five postcard clues lead to a famous beach. Fewer clues, more points." },
    { slug: "airport-codes",    name: "Airport Code Quiz",        emoji: "🏷️", kind: "Daily quiz",   mins: 2, blurb: "MCO, ORD, YYZ… where is this bag going? Learn where the codes come from." },
    { slug: "guess-the-flag",   name: "Guess the Flag",           emoji: "🏁", kind: "Daily quiz",   mins: 2, blurb: "10 flags a day from more than 90 countries. The wrong choices are neighbors, so look closely." },
    { slug: "departures",       name: "Mystery Departures",       emoji: "🛫", kind: "Daily puzzle", mins: 2, blurb: "Read the departures board and guess which airport you're standing in." },
    { slug: "fare-detective",   name: "Fare Detective",           emoji: "🕵️", kind: "Daily quiz",   mins: 3, blurb: "Spot the cheaper fare in each case and learn the tricks airlines use." },
    { slug: "vegas-or-orlando", name: "Vegas or Orlando?",        emoji: "🎰", kind: "Daily quiz",   mins: 2, blurb: "10 wild facts. Did it happen on the Strip or near the theme parks?" },
    { slug: "vacation-price",   name: "Guess the Vacation Price", emoji: "🏷️", kind: "Daily quiz",   mins: 3, blurb: "Buffets, shows, park tickets: how close can you get to the real price?" },
    { slug: "hot-takes",        name: "Travel Hot Takes",         emoji: "🔥", kind: "Opinions",     mins: 2, blurb: "Agree or disagree, then see how real travelers voted." },
    { slug: "would-you-rather", name: "Would You Rather: Travel", emoji: "🚪", kind: "Opinions",     mins: 2, blurb: "Ten tough travel choices and what kind of traveler they make you." },
    { slug: "magic-trip",       name: "Magic Trip Quiz",          emoji: "🏰", kind: "For kids",     mins: 4, blurb: "A kids' quiz about favorite characters and the parks, with a countdown to your trip." },
  ],

  /* ---------- No need to edit below this line ---------- */
  /* Today's puzzle number (same numbering in every game) and date label. */
  day() {
    const n = new Date(), today = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
    return { id: Math.max(1, Math.round((today - Date.UTC(2026, 9, 19)) / 864e5) + 1), label: n.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) };
  },
  /* Stable shuffle so every player gets the same daily order. */
  shuffled(list, seed) {
    const a = list.slice(); let s = seed >>> 0;
    const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  gameUrl(slug) { return this.site.replace(/\/$/, "") + (slug ? "/" + slug : ""); },
  fill(tpl, from, to) {
    return tpl.replace(/\{FROM\}/g, (from || "").toUpperCase()).replace(/\{TO\}/g, (to || "").toUpperCase())
              .replace(/\{from\}/g, (from || "").toLowerCase()).replace(/\{to\}/g, (to || "").toLowerCase());
  },
  flightLink(from, to) {
    const a = this.affiliate;
    return this.fill(from && to ? a.route : to ? a.toOnly : a.general, from, to);
  },
};

/* GlobeRush bar on top of every game, and "play another game" cards under it. */
(function () {
  // pages hide their ad slots (and the room kept for the mobile sticky ad) unless <html> has this class
  document.documentElement.classList.toggle("gr-ads", !!window.GLOBERUSH.ads);
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function render() {
    var G = window.GLOBERUSH, here = document.body.getAttribute("data-game");
    var bar = document.getElementById("gr-bar");
    if (bar) bar.innerHTML =
      '<a class="gr-home" href="index.html" aria-label="GlobeRush home"><span class="gr-globe" aria-hidden="true">🌍</span><span class="gr-word">Globe<b>Rush</b></span></a>' +
      '<a class="gr-all" href="index.html">All games</a>';
    var more = document.getElementById("gr-more");
    if (more) {
      var others = G.games.filter(function (g) { return g.slug !== here; });
      more.innerHTML = '<div class="gr-more-in"><h2>Play another GlobeRush game</h2><div class="gr-grid">' +
        others.map(function (g) {
          return '<a class="gr-card" href="' + esc(g.slug) + '.html"><span class="gr-e" aria-hidden="true">' + g.emoji + '</span>' +
                 '<span class="gr-t"><b>' + esc(g.name) + '</b><small>' + esc(g.kind) + ' · ' + g.mins + ' min</small></span></a>';
        }).join("") + '</div></div>';
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
})();
