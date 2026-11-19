// Leonida Trophy Guide & Tracker — vanilla JS, no frameworks, no network beyond
// the local data file. Progress lives in localStorage; nothing leaves the browser.

const EARNED_KEY = 'leonida-trophy-earned-v1';
const SPOILER_KEY = 'leonida-trophy-spoiler-v1';
const GRADES = ['platinum', 'gold', 'silver', 'bronze'];

const $ = (id) => document.getElementById(id);
const els = {
  search: $('search'), grade: $('f-grade'), kind: $('f-kind'), status: $('f-status'),
  spoiler: $('spoiler'), hint: $('filter-hint'),
  checklist: $('checklist'), roadmap: $('roadmap'),
  overallFill: $('overall-fill'), overallCount: $('overall-count'), overallPct: $('overall-pct'),
  overallBar: $('overall-bar'), gradeProgress: $('grade-progress'),
  viewChecklist: $('view-checklist'), viewRoadmap: $('view-roadmap'),
};

let doc = null;
let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let spoiler = localStorage.getItem(SPOILER_KEY) === '1';
let view = 'checklist';
let openId = null; // trophy id whose guidance is expanded (from ?open=)

// --- ?shot= deep links (deterministic states for screenshots / sharing) ---
const params = new URLSearchParams(location.search);
if (params.get('view') === 'roadmap') view = 'roadmap';
if (params.has('spoiler')) spoiler = params.get('spoiler') !== '0';
if (params.has('earned')) {
  for (const part of params.get('earned').split(',')) {
    const id = Number(part.trim());
    if (Number.isInteger(id)) earned.add(id);
  }
}
if (params.has('open')) openId = Number(params.get('open'));

function save() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
}

function isHidden(t) {
  return spoiler && t.kind === 'story' && !earned.has(t.id);
}

function displayName(t) {
  return isHidden(t) ? `Story trophy #${t.id} — hidden until earned` : t.name;
}

function matches(t) {
  if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
  if (els.kind.value !== 'all' && t.kind !== els.kind.value) return false;
  if (els.status.value === 'earned' && !earned.has(t.id)) return false;
  if (els.status.value === 'missing' && earned.has(t.id)) return false;
  const q = els.search.value.trim().toLowerCase();
  if (q) {
    const hay = isHidden(t)
      ? `story trophy #${t.id}`
      : `${t.name} ${t.description} ${t.kind} ${t.grade}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = `badge ${cls}`;
  s.textContent = text;
  return s;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  card.dataset.id = t.id;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark "${displayName(t)}" as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });

  const title = document.createElement('div');
  title.className = 'trophy-title';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = displayName(t);
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = isHidden(t) ? 'Description hidden by spoiler mode.' : t.description;
  title.append(name, desc);
  head.append(box, title);
  card.append(head);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(t.grade, `grade-${t.grade}`), badge(t.kind, 'kind'));
  if (t.missable) badges.append(badge('⚠ Missable', 'missable'));
  if (earned.has(t.id)) badges.append(badge('✓ Earned', 'earned-tag'));
  card.append(badges);

  if (t.missable && t.missableNote && !isHidden(t)) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = t.missableNote;
    card.append(note);
  }

  const details = document.createElement('details');
  if (openId === t.id) details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'How to earn it';
  details.append(summary);
  const guide = document.createElement('p');
  guide.className = 'guidance';
  guide.textContent = isHidden(t)
    ? 'Guidance hidden by spoiler mode — earn the trophy or turn spoiler mode off to read it.'
    : t.guidance;
  details.append(guide);
  if (!isHidden(t) && t.sources?.length) {
    const src = document.createElement('p');
    src.className = 'sources';
    const strong = document.createElement('strong');
    strong.textContent = 'Sources: ';
    src.append(strong, document.createTextNode(t.sources.join(' ')));
    details.append(src);
  }
  card.append(details);
  return card;
}

function renderProgress() {
  const total = doc.trophies.length;
  const n = doc.trophies.filter((t) => earned.has(t.id)).length;
  const pct = total ? Math.round((n / total) * 100) : 0;
  els.overallFill.style.width = `${pct}%`;
  els.overallCount.textContent = `${n} of ${total}`;
  els.overallPct.textContent = `(${pct}%)`;
  els.overallBar.setAttribute('aria-valuenow', String(n));

  els.gradeProgress.replaceChildren();
  for (const g of GRADES) {
    const all = doc.trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => earned.has(t.id)).length;
    const chip = document.createElement('div');
    chip.className = 'grade-chip';
    const label = document.createElement('span');
    label.textContent = `${g[0].toUpperCase()}${g.slice(1)} ${got}/${all.length}`;
    const bar = document.createElement('span');
    bar.className = 'mini-bar';
    const fill = document.createElement('span');
    fill.className = 'mini-fill';
    fill.style.display = 'block';
    fill.style.width = `${all.length ? (got / all.length) * 100 : 0}%`;
    fill.style.background = g === 'platinum' ? 'var(--platinum)' : g === 'gold' ? 'var(--gold)' : g === 'silver' ? 'var(--silver)' : 'var(--bronze)';
    bar.append(fill);
    chip.append(label, bar);
    els.gradeProgress.append(chip);
  }
}

function renderChecklist() {
  const list = doc.trophies.filter(matches);
  els.checklist.replaceChildren();
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match these filters. Try clearing the search or picking “All”.';
    els.checklist.append(p);
  } else {
    const grid = document.createElement('div');
    grid.className = 'trophy-list';
    for (const t of list) grid.append(trophyCard(t));
    els.checklist.append(grid);
  }
  return list.length;
}

function renderRoadmap() {
  els.roadmap.replaceChildren();
  let shown = 0;
  for (const phase of doc.phases) {
    const inPhase = doc.trophies.filter((t) => t.phase === phase.id);
    const visible = inPhase.filter(matches);
    if (!visible.length) continue;
    shown += visible.length;
    const section = document.createElement('section');
    section.className = 'phase';
    const head = document.createElement('div');
    head.className = 'phase-head';
    const h = document.createElement('h2');
    h.textContent = phase.title;
    const blurb = document.createElement('p');
    blurb.textContent = phase.blurb;
    const got = inPhase.filter((t) => earned.has(t.id)).length;
    const prog = document.createElement('p');
    prog.className = 'phase-progress';
    prog.textContent = `${got} of ${inPhase.length} earned in this phase`;
    head.append(h, blurb, prog);
    const grid = document.createElement('div');
    grid.className = 'trophy-list';
    for (const t of visible) grid.append(trophyCard(t));
    section.append(head, grid);
    els.roadmap.append(section);
  }
  if (!shown) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match these filters. Try clearing the search or picking “All”.';
    els.roadmap.append(p);
  }
  return shown;
}

function render() {
  if (!doc) return;
  renderProgress();
  const shown = view === 'roadmap' ? renderRoadmap() : renderChecklist();
  els.checklist.hidden = view !== 'checklist';
  els.roadmap.hidden = view !== 'roadmap';
  els.viewChecklist.setAttribute('aria-selected', String(view === 'checklist'));
  els.viewRoadmap.setAttribute('aria-selected', String(view === 'roadmap'));
  const missingMissable = doc.trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  els.hint.textContent =
    `Showing ${shown} of ${doc.trophies.length} trophies` +
    (spoiler ? ' · spoiler mode on (story trophies hidden until earned)' : '') +
    (missingMissable ? ` · ${missingMissable} missable trophies still unearned — check the ⚠ flags` : '');
}

function setView(next) {
  view = next;
  render();
}

els.viewChecklist.addEventListener('click', () => setView('checklist'));
els.viewRoadmap.addEventListener('click', () => setView('roadmap'));
for (const el of [els.search, els.grade, els.kind, els.status]) {
  el.addEventListener('input', render);
  el.addEventListener('change', render);
}
els.spoiler.checked = spoiler;
els.spoiler.addEventListener('change', () => {
  spoiler = els.spoiler.checked;
  save();
  render();
});

$('export').addEventListener('click', () => {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' }));
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = new Set(doc.trophies.map((t) => t.id));
    earned = new Set(ids.map(Number).filter((id) => valid.has(id)));
    save();
    render();
    els.hint.textContent = `Imported progress: ${earned.size} trophies marked earned.`;
  } catch {
    els.hint.textContent = 'That file could not be imported — pick a progress JSON exported from this tracker.';
  }
});

$('reset').addEventListener('click', () => {
  if (!earned.size) return;
  if (!confirm(`Clear all ${earned.size} earned ticks? This cannot be undone (export a backup first if unsure).`)) return;
  earned.clear();
  save();
  render();
});

// Apply ?shot= filter params after data loads.
function applyParams() {
  if (params.has('grade')) els.grade.value = params.get('grade');
  if (params.has('kind')) els.kind.value = params.get('kind');
  if (params.has('status')) els.status.value = params.get('status');
  if (params.has('q')) els.search.value = params.get('q');
}

try {
  doc = await (await fetch('data/trophies.json')).json();
  applyParams();
  render();
  document.body.dataset.ready = '1';
} catch (err) {
  els.hint.textContent = 'Could not load data/trophies.json — serve the app folder over HTTP (node serve.ts) or open it with a browser that allows local file access.';
  console.error(err);
}
