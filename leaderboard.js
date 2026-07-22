// leaderboard.js

import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { computeTotalAll, totalTheory, totalPyq, studentTheoryDone, studentPyqDone, idFor } from './metrics.js';
import { ORDER, CHAPTER_DATA } from './data.js';

// Helper to find titles for progressing topics
function findVideoTitle(searchId) {
  for (let ch of ORDER) {
    for (let it of CHAPTER_DATA[ch].fs) if (idFor(it.url) === searchId) return it.title;
    for (let it of CHAPTER_DATA[ch].pyq) if (idFor(it.url) === searchId) return it.title;
  }
  return 'A Video Topic';
}

export async function computeRankings() {
  let flagMap = {};
  try {
    const flagSnaps = await getDocs(collection(db, 'flags'));
    flagSnaps.forEach(f => { flagMap[f.id] = f.data(); });
  } catch(e) {}

  const total = computeTotalAll();
  const tTheory = totalTheory();
  const tPyq = totalPyq();

  const snaps = await getDocs(collection(db, 'students'));
  const entries = [];

  snaps.forEach(s => {
    const data = s.data();
    const flagged = !!(flagMap[s.id] && flagMap[s.id].flagged);
    if (flagged) return;

    const theoryDone = studentTheoryDone(data);
    const pyqDone = studentPyqDone(data);
    const calculatedTotal = theoryDone + pyqDone;

    if (data.totalDone === undefined) {
      updateDoc(doc(db, 'students', s.id), { totalDone: calculatedTotal }).catch(() => {});
    }

    entries.push({
      id: s.id,
      rawData: data, // Keep raw data for the modal card!
      name: data.displayName || data.username || '(unknown)',
      theoryDone, 
      theoryPct: tTheory ? Math.round(theoryDone / tTheory * 100) : 0,
      pyqDone, 
      pyqPct: tPyq ? Math.round(pyqDone / tPyq * 100) : 0,
      overallDone: calculatedTotal, 
      overallPct: total ? Math.round(calculatedTotal / total * 100) : 0
    });
  });

  const byOverall = [...entries].sort((a,b) => b.overallDone - a.overallDone);
  const byTheory = [...entries].sort((a,b) => b.theoryDone - a.theoryDone);
  const byPyq = [...entries].sort((a,b) => b.pyqDone - a.pyqDone);

  return { byOverall, byTheory, byPyq, total, tTheory, tPyq };
}

export function medal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

export function renderLeaderboardHTML(rankings, activeTab, limitCount) {
  const lists = { overall: rankings.byOverall, theory: rankings.byTheory, pyq: rankings.byPyq };
  const pctKeys = { overall: 'overallPct', theory: 'theoryPct', pyq: 'pyqPct' };
  const doneKeys = { overall: 'overallDone', theory: 'theoryDone', pyq: 'pyqDone' };
  const totals = { overall: rankings.total, theory: rankings.tTheory, pyq: rankings.tPyq };

  const list = lists[activeTab].slice(0, limitCount || 10);
  const pctKey = pctKeys[activeTab];
  const doneKey = doneKeys[activeTab];
  const tot = totals[activeTab];

  const rowsHtml = list.map((r, i) => {
    const rank = i + 1;
    const m = medal(rank);
    const gradeBadge = (r.rawData.isPublic && r.rawData.grade) ? `<span style="font-size:0.7rem; color:var(--muted); font-weight:400; margin-left:6px;">(${r.rawData.grade})</span>` : '';
    
    return `
      <div class="lb-row">
        <div class="lb-rank">${m || '#' + rank}</div>
        <div class="lb-name user-link" data-idx="${i}" style="cursor:pointer; font-weight:600; text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px;">
          ${r.name}${gradeBadge}
        </div>
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

// Function to populate and show the User Card
function showStudentCard(entry, rank, totals) {
  const d = entry.rawData;
  const m = medal(rank) || `#${rank}`;
  const titleStr = `${m} &bull; ${entry.name} ${d.isPublic && d.grade ? `(${d.grade})` : ''}`;
  document.getElementById('scTitle').innerHTML = titleStr;

  let progressingHtml = '';
  if (d.isPublic) {
    const allProg = [];
    if (d.theory) Object.keys(d.theory).forEach(k => { if(d.theory[k] === 'progressing') allProg.push(k); });
    if (d.pyq) Object.keys(d.pyq).forEach(k => { if(d.pyq[k] === 'progressing') allProg.push(k); });
    
    if (allProg.length > 0) {
      progressingHtml = `<div style="margin-top: 15px; margin-bottom: 5px; font-weight:600; color:var(--accent);">🔥 Currently Progressing:</div><ul style="margin:0; padding-left:20px; color:var(--muted); font-size:0.85rem;">`;
      allProg.forEach(id => { progressingHtml += `<li>${findVideoTitle(id)}</li>`; });
      progressingHtml += `</ul>`;
    } else {
      progressingHtml = `<div style="margin-top: 15px; color:var(--muted); font-size:0.85rem;">Not in the middle of any videos right now.</div>`;
    }
  } else {
    progressingHtml = `<div style="margin-top: 15px; padding: 10px; background: var(--panel-2); border-radius:8px; color:var(--muted); font-size:0.85rem; font-style:italic; text-align:center;">This student's detailed profile is set to Private.</div>`;
  }

  let teleHtml = '';
  if (d.isPublic && d.telegram) {
    let cleanTele = d.telegram.replace('@', '');
    teleHtml = `<a href="https://t.me/${cleanTele}" target="_blank" style="display:block; text-align:center; margin-top:20px; background:#2481cc; color:#fff; text-decoration:none; padding:12px; border-radius:8px; font-weight:600; transition:0.2s;">💬 Connect on Telegram</a>`;
  }

  document.getElementById('scBody').innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom: 10px; border-bottom: 1px solid var(--border); padding-bottom: 15px;">
       <div style="text-align:center;"><strong>${entry.overallDone}</strong><br><span style="font-size:0.75rem; color:var(--muted)">Overall</span></div>
       <div style="text-align:center;"><strong>${entry.theoryDone}</strong><br><span style="font-size:0.75rem; color:var(--muted)">Theory</span></div>
       <div style="text-align:center;"><strong>${entry.pyqDone}</strong><br><span style="font-size:0.75rem; color:var(--muted)">PYQs</span></div>
    </div>
    ${progressingHtml}
    ${teleHtml}
  `;

  document.getElementById('settingsModal').style.display = 'none';
  document.getElementById('modalOverlay').style.display = 'flex';
  document.getElementById('studentCardModal').style.display = 'block';
}

export function mountLeaderboard(containerEl, rankings, initialTab, limitCount) {
  let tab = initialTab || 'overall';
  function render() {
    containerEl.innerHTML = renderLeaderboardHTML(rankings, tab, limitCount);
    
    // Wire up tab buttons
    containerEl.querySelectorAll('.leaderboard-tabs button').forEach(btn => {
      btn.addEventListener('click', () => { tab = btn.dataset.lb; render(); });
    });

    // Wire up clicking student names!
    const list = rankings[tab === 'overall' ? 'byOverall' : tab === 'theory' ? 'byTheory' : 'byPyq'];
    containerEl.querySelectorAll('.user-link').forEach(link => {
      link.addEventListener('click', (e) => {
         const idx = parseInt(e.currentTarget.dataset.idx);
         const userEntry = list[idx];
         showStudentCard(userEntry, idx + 1, rankings);
      });
    });
  }
  render();
}
