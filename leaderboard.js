// leaderboard.js - computes Overall / Theory / PYQ rankings across all students.
// Flagged accounts are excluded entirely from rankings (they don't get to compete
// on suspicious data) but still show up in the teacher's full student table.

import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { computeTotalAll, totalTheory, totalPyq, studentTheoryDone, studentPyqDone, studentOverallDone } from './metrics.js';

export async function computeRankings(){
  const snaps = await getDocs(collection(db, 'students'));
  let flagMap = {};
  try {
    const flagSnaps = await getDocs(collection(db, 'flags'));
    flagSnaps.forEach(f => { flagMap[f.id] = f.data(); });
  } catch(e){ /* flags are optional */ }

  const total = computeTotalAll();
  const tTheory = totalTheory();
  const tPyq = totalPyq();

  const entries = [];
  snaps.forEach(s => {
    const data = s.data();
    const flagged = !!(flagMap[s.id] && flagMap[s.id].flagged);
    if (flagged) return; // excluded from all leaderboards
    const theoryDone = studentTheoryDone(data);
    const pyqDone = studentPyqDone(data);
    const overallDone = theoryDone + pyqDone;
    entries.push({
      id: s.id,
      name: data.displayName || data.username || '(unknown)',
      theoryDone, theoryPct: tTheory ? Math.round(theoryDone/tTheory*100) : 0,
      pyqDone, pyqPct: tPyq ? Math.round(pyqDone/tPyq*100) : 0,
      overallDone, overallPct: total ? Math.round(overallDone/total*100) : 0
    });
  });

  const byOverall = [...entries].sort((a,b) => b.overallDone - a.overallDone);
  const byTheory = [...entries].sort((a,b) => b.theoryDone - a.theoryDone);
  const byPyq = [...entries].sort((a,b) => b.pyqDone - a.pyqDone);

  return { byOverall, byTheory, byPyq, total, tTheory, tPyq };
}

export function findRank(rankedList, studentId){
  const idx = rankedList.findIndex(r => r.id === studentId);
  return idx === -1 ? null : idx + 1;
}

export function medal(rank){
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

// Reusable renderer - used by both the student sidebar (compact) and the
// teacher Class view (full top 10), so both stay in sync automatically.
export function renderLeaderboardHTML(rankings, activeTab, limit){
  const lists = { overall: rankings.byOverall, theory: rankings.byTheory, pyq: rankings.byPyq };
  const pctKeys = { overall: 'overallPct', theory: 'theoryPct', pyq: 'pyqPct' };
  const doneKeys = { overall: 'overallDone', theory: 'theoryDone', pyq: 'pyqDone' };
  const totals = { overall: rankings.total, theory: rankings.tTheory, pyq: rankings.tPyq };

  const list = lists[activeTab].slice(0, limit || 10);
  const pctKey = pctKeys[activeTab];
  const doneKey = doneKeys[activeTab];
  const tot = totals[activeTab];

  const rowsHtml = list.map((r, i) => {
    const rank = i + 1;
    const m = medal(rank);
    return `
      <div class="lb-row">
        <div class="lb-rank">${m || '#' + rank}</div>
        <div class="lb-name">${r.name}</div>
        <div class="lb-bar"><div style="width:${r[pctKey]}%"></div></div>
        <div class="lb-count">${r[doneKey]}/${tot}</div>
      </div>
    `;
  }).join('') || '<div class="empty-note">No rankings yet.</div>';

  return `
    <div class="leaderboard-tabs">
      <button data-lb="overall" class="${activeTab === 'overall' ? 'active' : ''}">Overall</button>
      <button data-lb="theory" class="${activeTab === 'theory' ? 'active' : ''}">Theory</button>
      <button data-lb="pyq" class="${activeTab === 'pyq' ? 'active' : ''}">PYQ</button>
    </div>
    <div class="leaderboard-list">${rowsHtml}</div>
  `;
}

// Wires tab clicks for a leaderboard rendered into `containerEl`. Keeps its own
// tab state and re-renders in place - pass a `limit` for compact (sidebar) use.
export function mountLeaderboard(containerEl, rankings, initialTab, limit){
  let tab = initialTab || 'overall';
  function render(){
    containerEl.innerHTML = renderLeaderboardHTML(rankings, tab, limit);
    containerEl.querySelectorAll('.leaderboard-tabs button').forEach(btn => {
      btn.addEventListener('click', () => { tab = btn.dataset.lb; render(); });
    });
  }
  render();
}
