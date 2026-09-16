// leaderboard.js

import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, startAt, endAt } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { computeTotalAll, totalTheory, totalPyq, studentTheoryDone, studentPyqDone, idFor } from './metrics.js';
import { ORDER, CHAPTER_DATA } from './data.js';

const TOP_N = 20;
const FETCH_BUFFER = 30; // fetch a few extra in case some are flagged, then trim to TOP_N
const TAB_FIELD = { overall: 'totalDone', theory: 'theoryDone', pyq: 'pyqDone' };

function findVideoTitle(searchId) {
  for (let ch of ORDER) {
    for (let it of CHAPTER_DATA[ch].fs) if (idFor(it.url) === searchId) return it.title;
    for (let it of CHAPTER_DATA[ch].pyq) if (idFor(it.url) === searchId) return it.title;
  }
  return 'A Video Topic';
}

async function getFlagMap() {
  const flagMap = {};
  try {
    const flagSnaps = await getDocs(collection(db, 'flags'));
    flagSnaps.forEach(f => { flagMap[f.id] = f.data(); });
  } catch(e) {}
  return flagMap;
}

function buildEntry(s, data, total, tTheory, tPyq) {
  const theoryDone = studentTheoryDone(data);
  const pyqDone = studentPyqDone(data);
  const overallDone = theoryDone + pyqDone;

  // Backfill all 3 ranking fields so this student becomes queryable on every tab,
  // not just overall. (Firestore orderBy skips docs missing the field entirely.)
  if (data.totalDone === undefined || data.theoryDone === undefined || data.pyqDone === undefined) {
    updateDoc(doc(db, 'students', s.id), { totalDone: overallDone, theoryDone, pyqDone }).catch(() => {});
  }

  return {
    id: s.id,
    rawData: data,
    name: data.displayName || data.username || '(unknown)',
    theoryDone,
    theoryPct: tTheory ? Math.round(theoryDone / tTheory * 100) : 0,
    pyqDone,
    pyqPct: tPyq ? Math.round(pyqDone / tPyq * 100) : 0,
    overallDone,
    overallPct: total ? Math.round(overallDone / total * 100) : 0
  };
}

// Queries by the tab's own field, so Theory/PYQ leaders show up correctly
// instead of being sorted only within the Overall top-30.
async function fetchTab(tab) {
  const total = computeTotalAll();
  const tTheory = totalTheory();
  const tPyq = totalPyq();
  const field = TAB_FIELD[tab];

  const [flagMap, snaps] = await Promise.all([
    getFlagMap(),
    getDocs(query(collection(db, 'students'), orderBy(field, 'desc'), limit(FETCH_BUFFER)))
  ]);

  const entries = [];
  snaps.forEach(s => {
    const data = s.data();
    if (flagMap[s.id] && flagMap[s.id].flagged) return;
    entries.push(buildEntry(s, data, total, tTheory, tPyq));
  });

  return { list: entries.slice(0, TOP_N), total, tTheory, tPyq };
}

export async function searchStudents(qStr) {
  const q = qStr.trim();
  if (!q) return [];
  const total = computeTotalAll();
  const tTheory = totalTheory();
  const tPyq = totalPyq();

  const [flagMap, snaps] = await Promise.all([
    getFlagMap(),
    getDocs(query(collection(db, 'students'), orderBy('displayName'), startAt(q), endAt(q + '\uf8ff'), limit(10)))
  ]);

  const results = [];
  snaps.forEach(s => {
    const data = s.data();
    if (flagMap[s.id] && flagMap[s.id].flagged) return;
    results.push(buildEntry(s, data, total, tTheory, tPyq));
  });
  return results;
}

export function medal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function renderRow(r, rank, pctKey, doneKey, tot) {
  const m = medal(rank);
  const gradeBadge = (r.rawData.isPublic && r.rawData.grade) ? `<span style="font-size:0.7rem; color:var(--muted); font-weight:400; margin-left:6px;">(${r.rawData.grade})</span>` : '';
  return `
    <div class="lb-row">
      <div class="lb-rank">${m || (rank ? '#' + rank : '🔍')}</div>
      <div class="lb-name user-link" data-id="${r.id}" style="cursor:pointer; font-weight:600; text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px;">
        ${r.name}${gradeBadge}
      </div>
      <div class="lb-bar"><div style="width:${r[pctKey]}%"></div></div>
      <div class="lb-count">${r[doneKey]}/${tot}</div>
    </div>
  `;
}

export function showStudentCard(entry, rank) {
  const d = entry.rawData;
  const m = rank ? (medal(rank) || `#${rank}`) : '🔍';
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

export function mountLeaderboard(containerEl) {
  let tab = 'overall';
  let debounceTimer = null;

  function wireRowClicks(el, list, isRanked) {
    el.querySelectorAll('.user-link').forEach(link => {
      link.addEventListener('click', () => {
        const id = link.dataset.id;
        const idx = list.findIndex(e => e.id === id);
        showStudentCard(list[idx], isRanked ? idx + 1 : null);
      });
    });
  }

  async function render() {
    containerEl.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    let data;
    try {
      data = await fetchTab(tab);
    } catch (e) {
      containerEl.innerHTML = '<div class="empty-note">Could not load leaderboard.</div>';
      return;
    }

    const pctKey = tab === 'overall' ? 'overallPct' : tab === 'theory' ? 'theoryPct' : 'pyqPct';
    const doneKey = tab === 'overall' ? 'overallDone' : tab === 'theory' ? 'theoryDone' : 'pyqDone';
    const tot = tab === 'overall' ? data.total : tab === 'theory' ? data.tTheory : data.tPyq;

    const rowsHtml = data.list.map((r, i) => renderRow(r, i + 1, pctKey, doneKey, tot)).join('')
      || '<div class="empty-note">No rankings yet.</div>';

    containerEl.innerHTML = `
      <div class="leaderboard-search">
        <input id="lbSearchInput" class="search-input" placeholder="Search any student..." style="width:100%; max-width:400px; box-sizing:border-box;">
      </div>
      <div id="lbSearchResults"></div>
      <div id="lbMainView">
        <div class="leaderboard-tabs">
          <button data-lb="overall" class="${tab === 'overall' ? 'active' : ''}">Overall</button>
          <button data-lb="theory" class="${tab === 'theory' ? 'active' : ''}">Theory</button>
          <button data-lb="pyq" class="${tab === 'pyq' ? 'active' : ''}">PYQ</button>
        </div>
        <div class="leaderboard-list">${rowsHtml}</div>
      </div>
    `;

    containerEl.querySelectorAll('.leaderboard-tabs button').forEach(btn => {
      btn.addEventListener('click', () => { tab = btn.dataset.lb; render(); });
    });
    wireRowClicks(containerEl, data.list, true);

    const searchInput = containerEl.querySelector('#lbSearchInput');
    const resultsEl = containerEl.querySelector('#lbSearchResults');
    const mainViewEl = containerEl.querySelector('#lbMainView');

    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(debounceTimer);
      if (!val.trim()) {
        resultsEl.innerHTML = '';
        mainViewEl.style.display = '';
        return;
      }
      debounceTimer = setTimeout(async () => {
        mainViewEl.style.display = 'none';
        resultsEl.innerHTML = '<div class="loading">Searching...</div>';
        try {
          const found = await searchStudents(val);
          resultsEl.innerHTML = found.length
            ? found.map(r => renderRow(r, null, 'overallPct', 'overallDone', found[0] ? computeTotalAll() : '')).join('')
            : '<div class="empty-note">No student found.</div>';
          wireRowClicks(resultsEl, found, false);
        } catch (e) {
          resultsEl.innerHTML = '<div class="empty-note">Search failed - check your connection.</div>';
        }
      }, 350);
    });
  }
  render();
}
