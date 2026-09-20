// portalPromo.js - the "new portal" ad: dashboard banner + in-app section.
// Self-contained: no Firebase, no data.js. Everything it needs is in index.html.
// To point the ads somewhere else, change the href on the .pp-btn links in index.html.

const DISMISS_KEY = 'fa_portal_promo_dismissed_v1';
const TOTAL_VIDEOS = 715;
const TOTAL_HOURS = 245; // "245 h+" in the portal, so this is a lower bound

const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);

// ---- Dashboard banner ----
function initBanner() {
  const banner = $('ppBanner');
  if (!banner) return;
  let dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS_KEY) === '1'; } catch (e) {}
  banner.hidden = dismissed;
  $('ppBannerClose')?.addEventListener('click', () => {
    banner.hidden = true;
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch (e) {}
  });
}

// ---- Buttons that jump to another in-app section ----
function initGotoButtons() {
  document.querySelectorAll('[data-pp-goto]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(`.nav-btn[data-section="${btn.dataset.ppGoto}"]`);
      if (target) target.click();
      window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
  });
}

// ---- The noise switch ----
let noiseTimer = null;
function setNoise(on) {
  const stage = $('ppStage'), sw = $('ppNoiseSwitch'), label = $('ppNoiseLabel');
  if (!stage || !sw) return;
  stage.classList.toggle('quiet', !on);
  sw.setAttribute('aria-checked', String(on));
  if (label) label.textContent = on ? 'Distractions on' : 'Distractions muted';
}

function initNoiseSwitch() {
  const sw = $('ppNoiseSwitch');
  if (!sw) return;
  sw.addEventListener('click', () => {
    clearTimeout(noiseTimer);
    setNoise(sw.getAttribute('aria-checked') !== 'true');
  });
}

// Called every time the "New Portal" section opens: noise first, then it clears.
export function playPortalIntro() {
  clearTimeout(noiseTimer);
  if (reduceMotion()) { setNoise(false); return; }
  setNoise(true);
  noiseTimer = setTimeout(() => setNoise(false), 1900);
}

// ---- The live mini portal ----
function initMiniPortal() {
  const list = $('ppRows');
  if (!list) return;
  const rows = Array.from(list.querySelectorAll('.pp-row'));
  const state = rows.map(() => ({ w: false, s: false }));
  let filter = 'all';

  const squaresEl = $('ppSquares');
  for (let i = 0; i < 44; i++) {
    const q = document.createElement('span');
    q.className = 'pp-sq';
    squaresEl.appendChild(q);
  }
  const squares = Array.from(squaresEl.children);
  const emptyEl = $('ppEmpty');
  const msgs = {
    todo: 'All caught up in this preview. Switch to Watched to see them.',
    watched: 'Nothing watched yet. Press Watched on a video and it appears here.',
    revise: 'Nothing starred yet. Press the star on a video to revise it later.'
  };

  function render() {
    const count = state.filter((x) => x.w).length;
    $('ppTotW').textContent = count;
    $('ppChapW').textContent = count;
    let next = state.findIndex((x) => !x.w);
    if (next < 0) next = state.length;
    $('ppNextPill').textContent = 'Next up: #' + (next + 1);
    squares.forEach((sq, i) => {
      const done = i < state.length && state[i].w;
      sq.className = 'pp-sq' + (done ? ' done' : (i === next ? ' next' : ''));
    });
    let shown = 0;
    rows.forEach((row, i) => {
      const st = state[i];
      row.classList.toggle('is-watched', st.w);
      row.classList.toggle('is-next', i === next);
      row.querySelector('.pp-watch').setAttribute('aria-pressed', String(st.w));
      row.querySelector('.pp-star').setAttribute('aria-pressed', String(st.s));
      const show = filter === 'all' || (filter === 'todo' && !st.w) || (filter === 'watched' && st.w) || (filter === 'revise' && st.s);
      row.hidden = !show;
      if (show) shown++;
    });
    emptyEl.hidden = shown > 0;
    if (shown === 0) emptyEl.textContent = msgs[filter] || '';
  }

  rows.forEach((row, i) => {
    row.querySelector('.pp-watch').addEventListener('click', () => { state[i].w = !state[i].w; render(); });
    row.querySelector('.pp-star').addEventListener('click', () => { state[i].s = !state[i].s; render(); });
  });
  const filterBtns = Array.from(document.querySelectorAll('.pp-filters button'));
  filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    filter = btn.dataset.f;
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    render();
  }));
  render();
}

// ---- Pace calculator ----
function initPace() {
  const range = $('ppDays');
  if (!range) return;
  function pace() {
    const d = +range.value;
    const hrs = TOTAL_HOURS / d;
    let h = Math.floor(hrs), m = Math.round((hrs - h) * 60);
    if (m === 60) { h += 1; m = 0; }
    $('ppDaysOut').textContent = d + ' days';
    $('ppAnsTime').textContent = h > 0 ? `${h} h ${m} min` : `${m} min`;
    const v = Math.ceil(TOTAL_VIDEOS / d);
    $('ppAnsVids').textContent = v + (v === 1 ? ' video' : ' videos');
    const end = new Date(Date.now() + d * 864e5);
    let txt;
    try { txt = end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { txt = end.toDateString(); }
    $('ppAnsDate').textContent = txt;
  }
  range.addEventListener('input', pace);
  pace();
}

export function initPortalPromo() {
  initBanner();
  initGotoButtons();
  initNoiseSwitch();
  initMiniPortal();
  initPace();
}
