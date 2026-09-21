// heatmap.js — Study heatmap: Firebase write + SVG renderer.
// Tracks Theory (green tiers) and PYQ (blue tiers) separately.
// This feature is architecturally impossible without a real database.

import { db } from './firebase.js';
import { doc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// ---- Helpers ----

/** Returns today's date as "YYYY-MM-DD" in local time. */
function todayKey() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

/** Maps a daily count to an intensity tier 0–4. */
function tier(count) {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

// ---- Firebase write ----

/**
 * Increment today's study count for the given kind.
 * Called (fire-and-forget) each time a video is marked 'done'.
 * Writes to: students/{uid}.studyLog.YYYY-MM-DD.theory  or  .pyq
 *
 * @param {string} uid
 * @param {'theory'|'pyq'} kind
 */
export async function writeStudyEvent(uid, kind) {
  try {
    const field = `studyLog.${todayKey()}.${kind}`;
    await updateDoc(doc(db, 'students', uid), { [field]: increment(1) });
  } catch (_) {
    // Non-critical — heatmap skips if offline
  }
}

// ---- SVG renderer ----

const CELL  = 11;  // px — cell size
const GAP   =  2;  // px — gap between cells
const ROW_GAP = 12; // px — vertical gap between theory row and PYQ row
const TOP_LABEL_H = 14; // px — month label row height
const DAY_LABEL_W = 38; // px — left label column width
const STEP = CELL + GAP;

/**
 * Render the dual-row heatmap into containerEl.
 * Reads the studyLog map directly — no Firestore calls.
 *
 * studyLog shape: { "YYYY-MM-DD": { theory?: number, pyq?: number } }
 *
 * @param {HTMLElement} containerEl
 * @param {Object} studyLog
 */
export function renderHeatmap(containerEl, studyLog = {}) {
  containerEl.innerHTML = '';

  // Build 365 days ending today
  const today  = new Date();
  const days   = [];
  for (let i = 364; i >= 0; i--) {
    const d   = new Date(today);
    d.setDate(today.getDate() - i);
    const key = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');
    const log = studyLog[key] || {};
    days.push({ key, date: d, theory: log.theory || 0, pyq: log.pyq || 0 });
  }

  // Group into week columns, aligning Sunday to row 0
  const weeks = [];
  let week = new Array(days[0].date.getDay()).fill(null); // pad start
  for (const day of days) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // SVG dimensions
  const svgW = weeks.length * STEP;
  const theoryRowTop = TOP_LABEL_H + 4;
  const pyqRowTop    = theoryRowTop + 7 * STEP + ROW_GAP;
  const svgH         = pyqRowTop + 7 * STEP + 4;

  const NS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('class', 'heatmap-svg');
  svg.setAttribute('aria-label', 'Study activity heatmap');

  // Month labels
  let lastMonth = -1;
  weeks.forEach((wk, wi) => {
    const first = wk.find(d => d);
    if (!first) return;
    if (first.date.getMonth() !== lastMonth) {
      lastMonth = first.date.getMonth();
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', wi * STEP);
      t.setAttribute('y', TOP_LABEL_H - 2);
      t.setAttribute('class', 'hm-month-label');
      t.textContent = first.date.toLocaleString('default', { month: 'short' });
      svg.appendChild(t);
    }
  });

  // Cells for each week
  weeks.forEach((wk, wi) => {
    wk.forEach((day, di) => {
      if (!day) return;
      const x = wi * STEP;

      // Theory cell
      appendCell(svg, NS, x, theoryRowTop + di * STEP, day, 'theory');
      // PYQ cell
      appendCell(svg, NS, x, pyqRowTop   + di * STEP, day, 'pyq');
    });
  });

  // Wrapper with day-of-week labels
  const outer = document.createElement('div');
  outer.className = 'heatmap-outer';

  // Left labels column
  const labels = document.createElement('div');
  labels.className = 'heatmap-day-labels';
  labels.innerHTML = `
    <span class="hm-row-tag hm-row-tag-theory">Theory</span>
    <span class="hm-row-tag hm-row-tag-pyq">PYQ</span>
  `;

  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'heatmap-scroll';
  scrollWrap.appendChild(svg);

  outer.appendChild(labels);
  outer.appendChild(scrollWrap);
  containerEl.appendChild(outer);

  // Legend
  containerEl.insertAdjacentHTML('beforeend', `
    <div class="heatmap-legend">
      <span class="hm-legend-text">Less</span>
      ${[0,1,2,3,4].map(i => `<span class="hm-cell-swatch hm-theory-${i}" title="Theory tier ${i}"></span>`).join('')}
      <span class="hm-legend-divider"></span>
      ${[0,1,2,3,4].map(i => `<span class="hm-cell-swatch hm-pyq-${i}" title="PYQ tier ${i}"></span>`).join('')}
      <span class="hm-legend-text">More</span>
      <span class="hm-legend-hint">Green&nbsp;=&nbsp;Theory &nbsp;·&nbsp; Blue&nbsp;=&nbsp;PYQ</span>
    </div>
  `);
}

function appendCell(svg, NS, x, y, day, kind) {
  const t = tier(kind === 'theory' ? day.theory : day.pyq);
  const rect = document.createElementNS(NS, 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width',  CELL);
  rect.setAttribute('height', CELL);
  rect.setAttribute('rx', 2);
  rect.setAttribute('class', `hm-cell hm-${kind}-${t}`);

  const title = document.createElementNS(NS, 'title');
  title.textContent = `${day.key} — Theory: ${day.theory}, PYQ: ${day.pyq}`;
  rect.appendChild(title);

  svg.appendChild(rect);
}
