// Checks the Carry-On Fitter level generator, loaded straight from the game file: every suitcase it cuts
// has a perfect packing, follows the piece rules, and comes out the same for every player. Run: npm test
const fs = require("fs"), path = require("path"), vm = require("vm");
const src = fs.readFileSync(path.join(__dirname, "..", "src", "games", "carry-on-fitter.html"), "utf8");
const m = src.match(/\/\* ===== LEVEL GENERATOR[^*]*\*\/([\s\S]*?)\/\* ===== END LEVEL GENERATOR ===== \*\//);
if (!m) throw new Error("LEVEL GENERATOR markers not found in src/games/carry-on-fitter.html");
const G = vm.runInNewContext(m[1] + "\n;({ LEVELS, ITEMS, makeLevel, dailyLevels, bonusLevel, lineupOf, canonical })", {});

let failures = 0;
const fail = msg => { failures++; if (failures <= 25) console.error("FAIL " + msg); };
const key = cells => cells.map(p => p.join(",")).sort().join(" ");

function check(level, label) {
  const L = G.LEVELS[level.diff], N = L.rows * L.cols, grid = Array(N).fill(-1);
  if (level.rows !== L.rows || level.cols !== L.cols) fail(`${label}: suitcase is ${level.rows}x${level.cols}`);
  if (!L.counts.includes(level.pieces.length)) fail(`${label}: ${level.pieces.length} pieces, expected ${L.counts.join(" or ")}`);
  const items = new Set();
  level.pieces.forEach((p, i) => {
    const tag = `${label} piece ${i}`;
    if (p.id !== i) fail(`${tag}: id ${p.id}`);
    if (p.size < 3 || p.size > 6 || p.cells.length !== p.size) fail(`${tag}: size ${p.size} with ${p.cells.length} cells`);
    // the stored solution: inside the suitcase, no overlap
    for (const [r, c] of p.cells) {
      if (r < 0 || c < 0 || r >= L.rows || c >= L.cols) { fail(`${tag}: cell ${r},${c} outside the suitcase`); continue; }
      if (grid[r * L.cols + c] !== -1) fail(`${tag}: overlaps piece ${grid[r * L.cols + c]} at ${r},${c}`);
      grid[r * L.cols + c] = i;
    }
    // one connected piece
    const has = new Set(p.cells.map(q => q.join(","))), seen = new Set([p.cells[0].join(",")]), stack = [p.cells[0]];
    while (stack.length) { const [r, c] = stack.pop(); for (const [a, b] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) { const k = a + "," + b; if (has.has(k) && !seen.has(k)) { seen.add(k); stack.push([a, b]); } } }
    if (seen.size !== p.cells.length) fail(`${tag}: not connected`);
    // no straight line longer than 4
    if (p.size > 4 && (p.cells.every(q => q[0] === p.cells[0][0]) || p.cells.every(q => q[1] === p.cells[0][1]))) fail(`${tag}: straight line of ${p.size}`);
    // what the hint does: shapes[0] at the solution's top-left corner covers exactly the solution cells
    const r0 = Math.min(...p.cells.map(q => q[0])), c0 = Math.min(...p.cells.map(q => q[1]));
    if (key(p.shapes[0].map(([r, c]) => [r + r0, c + c0])) !== key(p.cells)) fail(`${tag}: hint spot doesn't match the solution`);
    // shapes[1..3] are quarter turns of the solution shape, and the tray starts the piece turned
    if (p.shapes.length !== 4 || new Set(p.shapes.map(G.canonical)).size !== 1) fail(`${tag}: turned shapes aren't the same piece`);
    if (!(p.rot0 >= 1 && p.rot0 <= 3)) fail(`${tag}: tray turn ${p.rot0}`);
    if (!p.item || items.has(p.item.name)) fail(`${tag}: missing or repeated item`);
    items.add(p.item && p.item.name);
  });
  if (grid.includes(-1)) fail(`${label}: ${grid.filter(x => x === -1).length} empty squares in the solution`);
  if (new Set(level.pieces.map(p => G.canonical(p.cells))).size !== level.pieces.length) fail(`${label}: two pieces have the same shape`);
}

const t0 = Date.now(), slowest = [0, 0, 0], counts = [{}, {}, {}];
for (let diff = 0; diff < 3; diff++) {
  for (let i = 0; i < 200; i++) {
    const seed = Math.floor(Math.random() * 2 ** 31), t = Date.now(), level = G.makeLevel(diff, seed);
    slowest[diff] = Math.max(slowest[diff], Date.now() - t);
    counts[diff][level.pieces.length] = (counts[diff][level.pieces.length] || 0) + 1;
    check(level, `${G.LEVELS[diff].name} seed ${seed}`);
    if (G.lineupOf([G.makeLevel(diff, seed)]) !== G.lineupOf([level])) fail(`${G.LEVELS[diff].name} seed ${seed}: same seed gave a different suitcase`);
  }
  console.log(`${G.LEVELS[diff].name.padEnd(6)} 200 random suitcases checked · piece counts ${JSON.stringify(counts[diff])} · slowest ${slowest[diff]} ms`);
}
// a year of daily puzzles: valid, and no day repeats another
const lineups = new Set();
for (let day = 1; day <= 366; day++) { const levels = G.dailyLevels(day); levels.forEach((l, d) => check(l, `day ${day} bag ${d + 1}`)); lineups.add(G.lineupOf(levels)); }
if (lineups.size !== 366) fail(`only ${lineups.size} different daily lineups in 366 days`);
console.log(`Daily  366 days checked (${lineups.size} different lineups)`);
for (let n = 1; n <= 20; n++) check(G.bonusLevel(1000 + n, n), `bonus ${n}`);
console.log(`Bonus  20 suitcases checked · total ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (failures) { console.error(`\n${failures} failure(s)`); process.exit(1); }
console.log("\nAll Carry-On Fitter generator checks passed.");
