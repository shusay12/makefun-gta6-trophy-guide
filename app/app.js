// Leonida Legend — GTA VI trophy guide and tracker.
// Loads the official 55-trophy list from data/trophies.json, keeps progress in
// localStorage, and renders the tracker, the roadmap and the Next Up planner.
// Everything runs locally: no network request leaves this folder.

const STORE_KEY = 'leonida-legend-progress-v1';
const POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
const KIND_LABEL = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  partner: 'Partner',
  feats: 'Free-roam feat',
};
const GRADE_ICON = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

const STAGES = [
  {
    n: 1, title: 'First Steps in Leonida',
    text: 'Play the opening mission Gone Fishing and Chapters 1 and 2 as they come. Nothing here needs preparation: the story hands you these four trophies in order.',
    ids: [2, 3, 4, 8],
  },
  {
    n: 2, title: 'Chapters 3 and 4 — the Big Scores',
    text: 'Push the story through Chapters 3 and 4 and its named set-piece missions: The Cartel Heist, Child\'s Play, Headliners, VCIA Takedown and Operation Savage Glory. Keep a manual save before each chapter ends so a missed story moment is never far away.',
    ids: [5, 6, 9, 10, 11, 12, 13],
  },
  {
    n: 3, title: 'People of Leonida',
    text: 'Clear the stranger strands across the state and every named character\'s final mission: Andy, Kenton, Billy, Randy and Tyrone. Do these before the finale — strand givers are story people, and finishing their arcs early keeps the endgame clean.',
    ids: [22, 23, 24, 25, 26, 27],
  },
  {
    n: 4, title: 'See All of Leonida',
    text: 'The long exploration stage: meditate at all 18 spots, finish 3 collectible card sets, WAiNK It at 100 locations, discover 100 vehicles, open up all 52 areas, buy every garage and register 10 vehicles on the Scooter Bros app. Work region by region and let the counters in each guide track you.',
    ids: [28, 30, 31, 35, 42, 54, 55],
  },
  {
    n: 5, title: 'Master the Activities',
    text: 'Skill and grind together: 250 stunts, gold in all 42 Shooting Range challenges, a Top Fun drone-race win at all 14 locations, 20 race wins, 50 challenges, and one try at every activity type. These are the trophies that decide most platinum times, so start the counters early.',
    ids: [15, 16, 17, 18, 19, 20, 21, 29, 32, 46],
  },
  {
    n: 6, title: 'Partner Plays and One-Moment Feats',
    text: 'Free-roam feats and partner moments, including every Missable watch item: the back-to-back shop robberies, losing a 4-star wanted level with your partner, the unscheduled VCIA departure, and the 500 choices PlayStation counts. When the world offers one of these moments, take it — the watch flags in the guides say why.',
    ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53],
  },
  {
    n: 7, title: 'The Finale',
    text: 'Finish the final mission, close out 100% completion, and the platinum is yours. If the counter says 54 of 54, this stage is a victory lap.',
    ids: [7, 14, 1],
  },
];

const state = {
  trophies: [],
  earned: new Set(),
  counts: {},
  spoiler: false,
  kind: 'all',
  grade: 'all',
  stateFilter: 'all',
  query: '',
  selected: null,
  tab: 'tracker',
};

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.earned = new Set(data.earned || []);
    state.counts = data.counts || {};
    state.spoiler = !!data.spoiler;
  } catch { /* a corrupt store simply starts fresh */ }
}

function saveStore() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...state.earned],
    counts: state.counts,
    spoiler: state.spoiler,
  }));
}

function isHiddenStory(t) {
  return state.spoiler && t.kind === 'story' && !state.earned.has(t.id);
}

function displayName(t) {
  return isHiddenStory(t) ? 'Hidden story trophy' : t.name;
}

function displayDesc(t) {
  return isHiddenStory(t) ? 'Name and description stay hidden until you earn it — that is the spoiler shield at work.' : t.description;
}

function matches(t) {
  if (state.kind === 'missable' && !t.missable) return false;
  if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
  if (state.grade !== 'all' && t.grade !== state.grade) return false;
  if (state.stateFilter === 'earned' && !state.earned.has(t.id)) return false;
  if (state.stateFilter === 'remaining' && state.earned.has(t.id)) return false;
  if (state.query) {
    const hay = `${t.name} ${t.description} ${t.guide} ${KIND_LABEL[t.kind]}`.toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function earnedPoints() {
  return state.trophies.reduce((sum, t) => sum + (state.earned.has(t.id) ? POINTS[t.grade] : 0), 0);
}

function renderStats() {
  const total = state.trophies.length || 55;
  const earned = state.earned.size;
  const pct = Math.round((earned / total) * 100);
  document.getElementById('earnedCount').textContent = String(earned);
  document.getElementById('ringNum').textContent = `${pct}%`;
  document.getElementById('ringFg').style.strokeDashoffset = String(119.4 * (1 - earned / total));
  const byGrade = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of state.trophies) {
    byGrade[t.grade][1] += 1;
    if (state.earned.has(t.id)) byGrade[t.grade][0] += 1;
  }
  document.getElementById('gradeLine').textContent =
    `Platinum ${byGrade.platinum[0]}/${byGrade.platinum[1]} · Gold ${byGrade.gold[0]}/${byGrade.gold[1]} · Silver ${byGrade.silver[0]}/${byGrade.silver[1]} · Bronze ${byGrade.bronze[0]}/${byGrade.bronze[1]}`;
  const totalPoints = state.trophies.reduce((s, t) => s + POINTS[t.grade], 0);
  document.getElementById('pointsLine').textContent = `${earnedPoints()} of ${totalPoints} PSN points`;
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = `trophy grade-${t.grade}${state.earned.has(t.id) ? ' earned' : ''}${state.selected === t.id ? ' selected' : ''}`;
  const count = t.target ? `<span class="t-count">${Math.min(state.counts[t.id] || 0, t.target)}/${t.target} ${t.unit || ''}</span>` : '';
  li.innerHTML = `
    <input type="checkbox" ${state.earned.has(t.id) ? 'checked' : ''} aria-label="Mark ${t.name} earned">
    <span class="medal ${t.grade}">${GRADE_ICON[t.grade]}</span>
    <span>
      <span class="t-name ${isHiddenStory(t) ? 'hidden-name' : ''}">${displayName(t)}</span>
      <span class="t-desc" style="display:block">${displayDesc(t)}</span>
    </span>
    <span class="t-meta">
      ${count}
      ${t.missable ? '<span class="pill miss">⚠ Missable watch</span>' : ''}
      <span class="pill kind">${KIND_LABEL[t.kind]}</span>
      ${state.earned.has(t.id) ? '<span class="pill done">Earned</span>' : ''}
    </span>`;
  li.querySelector('input').addEventListener('change', (ev) => {
    ev.stopPropagation();
    toggleEarned(t.id);
  });
  li.querySelector('input').addEventListener('click', (ev) => ev.stopPropagation());
  li.addEventListener('click', () => { state.selected = t.id; render(); });
  return li;
}

function renderList() {
  const list = document.getElementById('trophyList');
  list.innerHTML = '';
  const visible = state.trophies.filter(matches);
  if (!visible.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No trophies match these filters. Loosen a filter or clear the search.';
    list.appendChild(li);
    return;
  }
  for (const t of visible) list.appendChild(trophyRow(t));
}

function renderDetail() {
  const pane = document.getElementById('detailPane');
  const t = state.trophies.find((x) => x.id === state.selected) || state.trophies[0];
  if (!t) { pane.innerHTML = '<p class="empty">Loading the trophy list…</p>'; return; }
  state.selected = t.id;
  const earned = state.earned.has(t.id);
  const counter = t.target ? `
    <div class="counter-box">
      <label for="countInput">Progress counter — PlayStation tracks ${t.target} ${t.unit || ''} for this trophy (PSNProfiles).</label>
      <div class="counter-row">
        <input type="number" id="countInput" min="0" max="${t.target}" value="${state.counts[t.id] || 0}">
        <span>of ${t.target}</span>
        <span class="counter-bar"><span class="counter-fill" style="width:${Math.min(100, ((state.counts[t.id] || 0) / t.target) * 100)}%"></span></span>
      </div>
    </div>` : '';
  pane.innerHTML = `
    <div class="d-head">
      <span class="medal ${t.grade}">${GRADE_ICON[t.grade]}</span>
      <div>
        <p class="d-name ${isHiddenStory(t) ? 'hidden-name' : ''}">${displayName(t)}</p>
        <p class="d-desc">${displayDesc(t)}</p>
      </div>
    </div>
    <p>
      <span class="pill kind">${KIND_LABEL[t.kind]}</span>
      <span class="pill">${t.grade} · ${POINTS[t.grade]} pts</span>
      <span class="pill">Roadmap stage ${t.stage}</span>
      ${earned ? '<span class="pill done">Earned</span>' : ''}
    </p>
    ${t.missable ? '<p class="miss-note">⚠ Missable watch: the official wording ties this trophy to a single moment or a continuing run of choices. Secure it when the moment comes; if it passes, a chapter replay or an earlier save is the safe recovery.</p>' : ''}
    <p class="d-guide">${isHiddenStory(t) ? 'Earn this story trophy to reveal its guide — the spoiler shield hides story guidance too.' : t.guide}</p>
    <p class="d-sources"><strong>Sources:</strong> ${t.sources.join(' · ')}</p>
    ${counter}
    <div class="d-actions">
      <button class="primary" id="toggleBtn">${earned ? 'Mark as not earned' : 'Mark as earned'}</button>
      <button id="roadmapBtn">See it on the roadmap</button>
    </div>`;
  pane.querySelector('#toggleBtn').addEventListener('click', () => toggleEarned(t.id));
  pane.querySelector('#roadmapBtn').addEventListener('click', () => switchTab('roadmap'));
  const input = pane.querySelector('#countInput');
  if (input) {
    input.addEventListener('change', () => {
      const v = Math.max(0, Math.min(t.target, Number(input.value) || 0));
      state.counts[t.id] = v;
      if (v >= t.target) state.earned.add(t.id);
      saveStore();
      render();
    });
  }
}

function renderRoadmap() {
  const wrap = document.getElementById('roadmapStages');
  wrap.innerHTML = '';
  let doneTotal = 0;
  for (const stage of STAGES) {
    const items = stage.ids.map((id) => state.trophies.find((t) => t.id === id)).filter(Boolean);
    const done = items.filter((t) => state.earned.has(t.id)).length;
    doneTotal += done;
    const div = document.createElement('div');
    div.className = 'stage';
    div.innerHTML = `
      <div class="stage-head"><h3>Stage ${stage.n} — ${stage.title}</h3><span class="stage-count">${done}/${items.length} earned</span></div>
      <p>${stage.text}</p>
      <ul>${items.map((t) => `<li class="${state.earned.has(t.id) ? 'done' : ''}">${displayName(t)}${t.missable ? ' <span class="mflag">⚠</span>' : ''}</li>`).join('')}</ul>`;
    wrap.appendChild(div);
  }
  document.getElementById('roadmapProgress').textContent =
    `Roadmap progress: ${doneTotal} of ${state.trophies.length} trophies earned across all seven stages.`;
}

function nextUp() {
  const byStage = [...state.trophies].sort((a, b) => (a.stage - b.stage) || (a.id - b.id));
  const remaining = byStage.filter((t) => !state.earned.has(t.id) && t.id !== 1);
  const missableFirst = remaining.filter((t) => t.missable);
  const rest = remaining.filter((t) => !t.missable);
  return [...missableFirst, ...rest].slice(0, 6);
}

function renderPlanner() {
  const grid = document.getElementById('plannerGrid');
  grid.innerHTML = '';
  const picks = nextUp();
  if (!picks.length) {
    grid.innerHTML = '<p class="empty">Everything is earned — the platinum is yours. Congratulations, Leonida Legend.</p>';
    return;
  }
  picks.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'next-card';
    const count = t.target ? `<p>Counter: ${Math.min(state.counts[t.id] || 0, t.target)} of ${t.target} ${t.unit || ''} so far.</p>` : '';
    card.innerHTML = `
      <span class="rank">Next up ${i + 1}${t.missable ? ' · ⚠ missable watch' : ''}</span>
      <h3>${displayName(t)} <span class="pill">${t.grade}</span></h3>
      <p>${displayDesc(t)}</p>
      ${count}
      <p class="why">Why now: ${t.missable ? 'its moment can pass — the watch list goes first.' : `it sits in roadmap stage ${t.stage}, the earliest stage you have not finished.`}</p>`;
    card.addEventListener('click', () => { state.selected = t.id; switchTab('tracker'); });
    grid.appendChild(card);
  });
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id); else state.earned.add(id);
  if (id !== 1 && state.trophies.length && state.trophies.every((t) => t.id === 1 || state.earned.has(t.id))) {
    state.earned.add(1);
  }
  saveStore();
  render();
}

function render() {
  renderStats();
  renderList();
  renderDetail();
  renderRoadmap();
  renderPlanner();
}

function switchTab(name) {
  state.tab = name;
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
}

function applySampleProgress() {
  const sampleEarned = [2, 3, 4, 5, 8, 9, 15, 16, 22, 28, 33, 42, 44];
  const sampleCounts = { 15: 132, 17: 19, 18: 6, 25: 3, 28: 11, 31: 47, 32: 21, 35: 58, 42: 52, 48: 210 };
  state.earned = new Set(sampleEarned);
  state.counts = { ...sampleCounts };
  saveStore();
  render();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned], counts: state.counts, spoiler: state.spoiler }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-legend-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  const data = JSON.parse(await file.text());
  state.earned = new Set((data.earned || []).filter((id) => state.trophies.some((t) => t.id === id)));
  state.counts = data.counts || {};
  state.spoiler = !!data.spoiler;
  document.getElementById('spoilerToggle').checked = state.spoiler;
  saveStore();
  render();
}

function wire() {
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.getElementById('searchBox').addEventListener('input', (e) => { state.query = e.target.value.trim().toLowerCase(); renderList(); });
  document.getElementById('kindChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-kind]'); if (!b) return;
    state.kind = b.dataset.kind;
    document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderList();
  });
  document.getElementById('gradeChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-grade]'); if (!b) return;
    state.grade = b.dataset.grade;
    document.querySelectorAll('#gradeChips .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderList();
  });
  document.getElementById('stateChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-state]'); if (!b) return;
    state.stateFilter = b.dataset.state;
    document.querySelectorAll('#stateChips .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderList();
  });
  const spoiler = document.getElementById('spoilerToggle');
  spoiler.checked = state.spoiler;
  spoiler.addEventListener('change', () => { state.spoiler = spoiler.checked; saveStore(); render(); });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', (e) => { if (e.target.files[0]) importProgress(e.target.files[0]); });
  document.getElementById('sampleBtn').addEventListener('click', applySampleProgress);
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.earned = new Set(); state.counts = {}; saveStore(); render();
  });
}

async function boot() {
  loadStore();
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  state.trophies = data.trophies;
  const params = new URLSearchParams(location.search);
  if (params.get('sample') === '1') applySampleProgressSilent();
  if (params.get('spoiler') === '1') { state.spoiler = true; document.getElementById('spoilerToggle').checked = true; }
  if (params.get('kind')) {
    state.kind = params.get('kind');
    document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === state.kind));
  }
  if (params.get('select')) state.selected = Number(params.get('select'));
  wire();
  render();
  if (params.get('tab')) switchTab(params.get('tab'));
}

function applySampleProgressSilent() {
  const sampleEarned = [2, 3, 4, 5, 8, 9, 15, 16, 22, 28, 33, 42, 44];
  state.earned = new Set(sampleEarned);
  state.counts = { 15: 132, 17: 19, 18: 6, 25: 3, 28: 11, 31: 47, 32: 21, 35: 58, 42: 52, 48: 210 };
}

boot();
