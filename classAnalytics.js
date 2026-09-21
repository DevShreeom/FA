// classAnalytics.js
// Pillar 2: "You vs. The Class" analytics section in My Profile.
// Strict quota rule: fetches ONLY the single stats/summary document (1 Firestore read).

import { db } from './firebase.js';
import { computeTotalAll, totalTheory, totalPyq } from './metrics.js';
import { fetchTopStudentsForStats } from './leaderboard.js';

/**
 * Renders the "You vs. Class" bar chart section below the heatmap in My Profile.
 * @param {HTMLElement} container - The element to inject into (appended as a child)
 * @param {Object} myData - The user's local data object (from studentView.js)
 */
export async function mountClassAnalytics(container, myData) {
  if (!container) return;

  // Remove any previously mounted analytics card
  const existing = container.querySelector('#classAnalyticsCard');
  if (existing) existing.remove();

  const card = document.createElement('div');
  card.id = 'classAnalyticsCard';
  card.className = 'card';
  card.style.marginTop = '24px';
  card.innerHTML = `
    <div class="section-label" style="margin-top: 0; margin-bottom: 20px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      You vs. Leaderboard (Top 30 Avg)
    </div>
    <div id="classAnalyticsBars" style="display: flex; flex-direction: column; gap: 20px;">
      <div style="color: var(--muted); font-size: 0.9rem; text-align: center; padding: 16px;">Loading leaderboard data…</div>
    </div>
  `;
  container.appendChild(card);

  // --- Compute from Top 30 Leaderboard ---
  let classAvg = { theoryDone: 0, pyqDone: 0, totalDone: 0 };
  const stats = await fetchTopStudentsForStats();
  if (stats) {
    classAvg.theoryDone = stats.avgTheory;
    classAvg.pyqDone    = stats.avgPyq;
    classAvg.totalDone  = stats.avgTotal;
  }

  // --- Local user stats ---
  const totalT = totalTheory();
  const totalP = totalPyq();
  const totalAll = computeTotalAll();

  let myTheory = 0, myPyq = 0, myTotal = 0;
  if (myData && myData.theory) {
    Object.values(myData.theory).forEach(v => { if (v === 'done' || v === 'progressing') myTheory++; });
  }
  if (myData && myData.pyq) {
    Object.values(myData.pyq).forEach(v => { if (v === 'done' || v === 'progressing') myPyq++; });
  }
  myTotal = myTheory + myPyq;

  // --- Render ---
  const barsEl = card.querySelector('#classAnalyticsBars');
  barsEl.innerHTML = `
    <div style="display: flex; justify-content: flex-end; gap: 20px; font-size: 0.78rem; font-weight: 600; color: var(--muted); margin-bottom: -8px;">
      <span style="display: flex; align-items: center; gap: 6px;"><span style="display:inline-block; width:10px; height:10px; border-radius:2px; background: var(--accent);"></span> You</span>
      <span style="display: flex; align-items: center; gap: 6px;"><span style="display:inline-block; width:10px; height:10px; border-radius:2px; background: var(--muted);"></span> Top 30 Avg</span>
    </div>
    ${_bar('Theory',  myTheory, classAvg.theoryDone, totalT,   'var(--accent)')}
    ${_bar('PYQ',     myPyq,    classAvg.pyqDone,    totalP,   'var(--pyq)')}
    ${_bar('Overall', myTotal,  classAvg.totalDone,  totalAll, 'var(--accent)')}
  `;
}

function _bar(label, myVal, avgVal, total, color) {
  const myPct  = total > 0 ? Math.min(100, Math.round(myVal  / total * 100)) : 0;
  const avgPct = total > 0 ? Math.min(100, Math.round(avgVal / total * 100)) : 0;
  const ahead = myPct >= avgPct;

  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: var(--text);">
        <span>${label}</span>
        <span style="color: ${ahead ? color : 'var(--muted)'};">${ahead ? '▲' : '▼'} You: ${myPct}%  |  Top 30: ${avgPct}%</span>
      </div>

      <!-- Your bar -->
      <div style="position: relative; height: 12px; background: var(--panel-2); border-radius: 6px; overflow: hidden;">
        <div class="squiggly-progress" style="position: absolute; left: 0; top: 0; height: 100%; width: ${myPct}%; color: ${color}; border-radius: 6px; transition: width 0.6s var(--m3-ease);"></div>
      </div>

      <!-- Class avg bar -->
      <div style="position: relative; height: 8px; background: var(--panel-2); border-radius: 6px; overflow: hidden;">
        <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${avgPct}%; background: var(--muted); border-radius: 6px; transition: width 0.6s var(--m3-ease);"></div>
      </div>

      <div style="font-size: 0.75rem; color: var(--muted);">${myVal} / ${total} done  ·  Top 30 avg: ${Math.round(avgVal)} / ${total}</div>
    </div>
  `;
}
