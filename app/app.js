"use strict";

/* Leonida Trophy Guide & Tracker — vanilla JS, no network calls beyond
   loading the local data file. Progress lives in localStorage. */

const STORE_EARNED = "leonida-tracker/earned";
const STORE_SPOILER = "leonida-tracker/spoiler";

const PHASES = [
  { n: 1, title: "Story — Chapters 1–2", blurb: "The opening stretch. Story trophies pop on their own; grab the Ocean Beach cocktail moment while you are first exploring." },
  { n: 2, title: "Story — Chapters 3–4", blurb: "The middle chapters and the named heist missions. Watch for the VCIA departure moment inside the VCIA Takedown stretch — it only exists there." },
  { n: 3, title: "Partner, choices & one-off moments", blurb: "Everything that needs your partner beside you, plus choice-driven and one-off moments. Clear these before the finale while your partner is available." },
  { n: 4, title: "The finale", blurb: "The final mission and the gold trophy that comes with it. Free roam continues afterwards for the cleanup phases." },
  { n: 5, title: "Stranger strands", blurb: "Andy, Kenton, Billy, Randy, Tyrone, Bret and friends. Finish strands as they appear — left too long, a strand can lock behind story progress." },
  { n: 6, title: "Activities", blurb: "Shooting ranges, drone races, street races, fishing, arcade, bowling and meditation spots. Pure skill and repetition — no missables here." },
  { n: 7, title: "Crime & challenges", blurb: "Vaults, armored trucks, gang operations, stunts and the money trophies. Bring armour, a fast car and an escape plan." },
  { n: 8, title: "Collectibles, 100% & the platinum", blurb: "The final sweep: card sets, WAiNK locations, vehicle discoveries and every corner of Leonida, then 100% completion and the platinum." }
];

const KIND_LABELS = {
  story: "Story",
  side: "Stranger strand",
  activity: "Activity",
  collectible: "Collectible",
  challenge: "Challenge & crime",
  misc: "Moment",
  completion: "Completion",
  platinum: "Platinum"
};

const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];
const GRADE_COLORS = { platinum: "#b8f4ff", gold: "#ffc94d", silver: "#d7dce6", bronze: "#e0a06a" };

const state = {
  trophies: [],
  earned: new Set(),
  spoiler: false,
  view: "checklist",
  expanded: new Set(),
  filters: { q: "", grade: "all", kind: "all", status: "all" },
  shotMode: false
};

const $ = (sel) => document.querySelector(sel);

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 2600);
}

function saveEarned() {
  if (state.shotMode) return;
  try { localStorage.setItem(STORE_EARNED, JSON.stringify([...state.earned])); } catch (e) { /* storage unavailable */ }
}

function saveSpoiler() {
  if (state.shotMode) return;
  try { localStorage.setItem(STORE_SPOILER, state.spoiler ? "1" : "0"); } catch (e) { /* ignore */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_EARNED);
    if (raw) state.earned = new Set(JSON.parse(raw).filter((n) => Number.isInteger(n)));
    state.spoiler = localStorage.getItem(STORE_SPOILER) === "1";
  } catch (e) { /* fresh start */ }
}

function isHidden(t) {
  return state.spoiler && t.kind === "story" && !state.earned.has(t.id);
}

function displayName(t) {
  return isHidden(t) ? "Story trophy #" + t.id + " — hidden until earned" : t.name;
}

function displayDesc(t) {
  return isHidden(t) ? "Spoiler-free mode is on: earn this story trophy to reveal it." : t.description;
}

function matchesFilters(t) {
  const f = state.filters;
  if (f.grade !== "all" && t.grade !== f.grade) return false;
  if (f.kind !== "all" && t.kind !== f.kind) return false;
  if (f.status === "earned" && !state.earned.has(t.id)) return false;
  if (f.status === "missing" && state.earned.has(t.id)) return false;
  if (f.status === "missable" && !t.missable) return false;
  if (f.q) {
    const hay = (displayName(t) + " " + displayDesc(t) + " " + (KIND_LABELS[t.kind] || "")).toLowerCase();
    if (!hay.includes(f.q.toLowerCase())) return false;
  }
  return true;
}

function badge(text, cls) {
  const s = document.createElement("span");
  s.className = "badge" + (cls ? " " + cls : "");
  s.textContent = text;
  return s;
}

function trophyCard(t) {
  const card = document.createElement("article");
  card.className = "trophy" + (state.earned.has(t.id) ? " earned" : "");
  card.dataset.id = String(t.id);

  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "t-check";
  check.checked = state.earned.has(t.id);
  check.setAttribute("aria-label", "Mark " + displayName(t) + " as earned");
  check.addEventListener("change", () => {
    if (check.checked) state.earned.add(t.id); else state.earned.delete(t.id);
    saveEarned();
    render();
  });
  card.appendChild(check);

  const body = document.createElement("div");
  const head = document.createElement("div");
  head.className = "t-head";
  const name = document.createElement("h3");
  name.className = "t-name";
  name.textContent = displayName(t);
  head.appendChild(name);
  head.appendChild(badge(t.grade, "badge-" + t.grade));
  if (t.missable) head.appendChild(badge("Missable", "badge-missable"));
  body.appendChild(head);

  const desc = document.createElement("p");
  desc.className = "t-desc";
  desc.textContent = displayDesc(t);
  body.appendChild(desc);

  const meta = document.createElement("div");
  meta.className = "t-meta";
  meta.appendChild(badge(KIND_LABELS[t.kind] || t.kind, "badge-kind"));
  meta.appendChild(badge("Phase " + t.phase, "badge-phase"));
  body.appendChild(meta);
  card.appendChild(body);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "t-detail-btn";
  const open = state.expanded.has(t.id);
  btn.textContent = open ? "Hide guide" : "Guide";
  btn.setAttribute("aria-expanded", open ? "true" : "false");
  btn.addEventListener("click", () => {
    if (state.expanded.has(t.id)) state.expanded.delete(t.id); else state.expanded.add(t.id);
    render();
  });
  card.appendChild(btn);

  if (open) {
    const detail = document.createElement("div");
    detail.className = "t-detail";
    const h = document.createElement("h3");
    h.textContent = "How to earn it";
    detail.appendChild(h);
    const g = document.createElement("p");
    g.textContent = isHidden(t)
      ? "Guidance is hidden while spoiler-free mode is on and this story trophy is unearned. Earn it in the story, or turn spoiler-free mode off to read ahead."
      : t.guidance;
    detail.appendChild(g);
    if (t.missable && t.missable_note && !isHidden(t)) {
      const m = document.createElement("p");
      m.className = "missable-note";
      m.textContent = "Missable: " + t.missable_note;
      detail.appendChild(m);
    }
    const src = document.createElement("p");
    src.className = "sources";
    const strong = document.createElement("strong");
    strong.textContent = "Sources: ";
    src.appendChild(strong);
    src.appendChild(document.createTextNode((t.sources || []).join("; ")));
    detail.appendChild(src);
    card.appendChild(detail);
  }

  return card;
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.trophies.filter((t) => state.earned.has(t.id)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $("#progressPct").textContent = pct + "%";
  $("#progressRing").style.setProperty("--pct", String(pct));
  $("#progressCount").textContent = done + " / " + total + " trophies";
  $("#progressHint").textContent = done === total && total > 0
    ? "Every trophy earned — Leonida Legend. 🏆"
    : "Tick trophies off as you earn them — progress is saved on this device.";

  const bars = $("#gradeBars");
  bars.textContent = "";
  for (const grade of GRADE_ORDER) {
    const inGrade = state.trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => state.earned.has(t.id)).length;
    const row = document.createElement("div");
    row.className = "grade-bar";
    const label = document.createElement("span");
    label.textContent = grade[0].toUpperCase() + grade.slice(1);
    const track = document.createElement("div");
    track.className = "track";
    const fill = document.createElement("div");
    fill.className = "fill";
    fill.style.width = (inGrade.length ? (got / inGrade.length) * 100 : 0) + "%";
    fill.style.background = GRADE_COLORS[grade];
    track.appendChild(fill);
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = got + " / " + inGrade.length;
    row.append(label, track, count);
    bars.appendChild(row);
  }
}

function renderChecklist() {
  const list = $("#trophyList");
  list.textContent = "";
  const visible = state.trophies.filter(matchesFilters);
  for (const t of visible) list.appendChild(trophyCard(t));
  $("#emptyState").hidden = visible.length > 0;
  $("#resultCount").textContent = "Showing " + visible.length + " of " + state.trophies.length + " trophies";
}

function renderRoadmap() {
  const wrap = $("#roadmapList");
  wrap.textContent = "";
  for (const phase of PHASES) {
    const inPhase = state.trophies.filter((t) => t.phase === phase.n);
    const done = inPhase.filter((t) => state.earned.has(t.id)).length;
    const section = document.createElement("section");
    section.className = "phase";
    const head = document.createElement("div");
    head.className = "phase-head";
    const num = document.createElement("span");
    num.className = "phase-num";
    num.textContent = "Phase " + phase.n;
    const title = document.createElement("h2");
    title.textContent = phase.title;
    const prog = document.createElement("span");
    prog.className = "phase-progress";
    prog.textContent = done + " / " + inPhase.length + " earned";
    head.append(num, title, prog);
    section.appendChild(head);
    const blurb = document.createElement("p");
    blurb.className = "phase-blurb";
    blurb.textContent = phase.blurb;
    section.appendChild(blurb);
    const list = document.createElement("div");
    list.className = "trophy-list";
    for (const t of inPhase) list.appendChild(trophyCard(t));
    section.appendChild(list);
    wrap.appendChild(section);
  }
  $("#resultCount").textContent = "Roadmap: " + PHASES.length + " phases, " + state.trophies.length + " trophies";
}

function render() {
  renderProgress();
  $("#checklistView").hidden = state.view !== "checklist";
  $("#roadmapView").hidden = state.view !== "roadmap";
  $("#tabChecklist").setAttribute("aria-selected", state.view === "checklist" ? "true" : "false");
  $("#tabRoadmap").setAttribute("aria-selected", state.view === "roadmap" ? "true" : "false");
  if (state.view === "checklist") renderChecklist(); else renderRoadmap();
}

function exportProgress() {
  const payload = {
    app: "leonida-trophy-guide-tracker",
    version: 1,
    exported_at: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    spoiler: state.spoiler
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-trophy-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast("Progress exported as JSON.");
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      const valid = new Set(state.trophies.map((t) => t.id));
      state.earned = new Set(ids.filter((n) => valid.has(n)));
      if (typeof data.spoiler === "boolean") {
        state.spoiler = data.spoiler;
        $("#spoilerToggle").checked = state.spoiler;
        saveSpoiler();
      }
      saveEarned();
      render();
      toast("Imported " + state.earned.size + " earned trophies.");
    } catch (e) {
      toast("That file is not a valid progress export.");
    }
  };
  reader.readAsText(file);
}

function applyShotMode() {
  const shot = new URLSearchParams(location.search).get("shot");
  if (!shot) return;
  state.shotMode = true;
  if (shot === "checklist") {
    state.earned = new Set([2, 3, 4, 8, 44, 21, 35, 53]);
  } else if (shot === "roadmap") {
    state.view = "roadmap";
    state.earned = new Set([2, 3, 4, 5, 8, 9, 44, 21]);
  } else if (shot === "detail") {
    state.earned = new Set([2, 3, 4, 8, 44]);
    state.expanded.add(40);
    state.filters.q = "Maximum Withdrawal";
    $("#search").value = "Maximum Withdrawal";
  } else if (shot === "spoiler") {
    state.spoiler = true;
    $("#spoilerToggle").checked = true;
    state.earned = new Set([2]);
    // Filter to story trophies so the hidden cards are what the shot shows.
    state.filters.kind = "story";
    $("#kindFilter").value = "story";
  }
}

function wireControls() {
  $("#search").addEventListener("input", (e) => { state.filters.q = e.target.value; render(); });
  $("#gradeFilter").addEventListener("change", (e) => { state.filters.grade = e.target.value; render(); });
  $("#kindFilter").addEventListener("change", (e) => { state.filters.kind = e.target.value; render(); });
  $("#statusFilter").addEventListener("change", (e) => { state.filters.status = e.target.value; render(); });
  $("#tabChecklist").addEventListener("click", () => { state.view = "checklist"; render(); });
  $("#tabRoadmap").addEventListener("click", () => { state.view = "roadmap"; render(); });
  $("#spoilerToggle").addEventListener("change", (e) => {
    state.spoiler = e.target.checked;
    saveSpoiler();
    render();
  });
  $("#exportBtn").addEventListener("click", exportProgress);
  $("#importBtn").addEventListener("click", () => $("#importFile").click());
  $("#importFile").addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = "";
  });
  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Reset all trophy progress on this device? This cannot be undone.")) return;
    state.earned.clear();
    saveEarned();
    render();
    toast("Progress reset.");
  });
}

async function init() {
  loadState();
  wireControls();
  $("#spoilerToggle").checked = state.spoiler;
  try {
    const res = await fetch("data/trophies.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    state.trophies = data.trophies.slice().sort((a, b) => a.id - b.id);
  } catch (e) {
    $("#resultCount").textContent = "Could not load the trophy list (data/trophies.json). Serve the app over HTTP (node serve.ts) rather than opening the file directly.";
    return;
  }
  applyShotMode();
  render();
}

init();
