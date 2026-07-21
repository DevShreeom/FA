// teacherView.js - Class view. Real access control lives in Firestore security rules
// (only UIDs listed in the 'admins' collection can list all student docs) - this file
// just renders whatever Firestore allows through, and shows a clear message if it's blocked.

import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { computeTotalAll, studentTheoryDone, studentPyqDone, idFor } from './metrics.js';
import { ORDER, CHAPTER_DATA } from './data.js';
import { getCurrentUser } from './studentView.js';
import { computeRankings, mountLeaderboard } from './leaderboard.js';
import { checkIsAdmin } from './adminCheck.js';
import { addCustomLecture } from './customLectures.js';

function totalForChapter(ch){ return CHAPTER_DATA[ch].fs.length + CHAPTER_DATA[ch].pyq.length; }
function pctClass(p){ if (p < 34) return 'low'; if (p < 70) return 'mid'; return 'high'; }

let lastRows = [];
let searchQuery = '';
let sortKey = 'pct';
let sortDir = -1;
let isAdmin = false;
let currentPage = 1;
const PAGE_SIZE = 10;

function studentDoneCount(s){
  return studentTheoryDone(s) + studentPyqDone(s);
}

function chapterCompletionAcrossClass(students){
  const isDone = (v) => v === 'done' || v === true;
  const total = students.length || 1;
  return ORDER.map(ch => {
    const chTotal = totalForChapter(ch);
    let sumPct = 0;
    students.forEach(s => {
      let done = 0;
      CHAPTER_DATA[ch].fs.forEach(it => { if (s.theory && isDone(s.theory[idFor(it.url)])) done++; });
      CHAPTER_DATA[ch].pyq.forEach(it => { if (s.pyq && isDone(s.pyq[idFor(it.url)])) done++; });
      sumPct += chTotal ? (done / chTotal) : 0;
    });
    return { chapter: ch, avgPct: Math.round((sumPct / total) * 100) };
  });
}

function renderTable(){
  const filtered = searchQuery
    ? lastRows.filter(r => r.name.toLowerCase().includes(searchQuery))
    : lastRows;
  const sorted = [...filtered].sort((a, b) => {
    if (a.flagged !== b.flagged) return a.flagged ? 1 : -1; // flagged accounts always sink to the bottom
    return (a[sortKey] > b[sortKey] ? 1 : -1) * sortDir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const tbody = document.getElementById('studentsTbody');
  if (!tbody) return;
  tbody.innerHTML = pageRows.map(r => {
    const dt = r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '-';
    const rowStyle = r.flagged ? ' style="background:#3a2020;"' : '';
    const lastCell = isAdmin
      ? `<button class="flag-btn" data-id="${r.id}" data-flagged="${r.flagged}">${r.flagged ? '🚩 Flagged' : 'Flag'}</button>`
      : (r.flagged ? '🚩 Flagged' : '-');
    return `<tr${rowStyle}>
      <td>${r.name}</td>
      <td>${r.done}/${r.total}</td>
      <td><span class="pct-pill ${pctClass(r.pct)}">${r.pct}%</span></td>
      <td>${dt}</td>
      <td>${lastCell}</td>
    </tr>`;
  }).join('');

  renderPagination(totalPages, sorted.length);

  if (isAdmin){
    tbody.querySelectorAll('.flag-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const currentlyFlagged = btn.dataset.flagged === 'true';
        btn.disabled = true;
        try {
          await setDoc(doc(db, 'flags', id), { flagged: !currentlyFlagged, updatedAt: new Date().toISOString() }, { merge: true });
          const row = lastRows.find(r => r.id === id);
          if (row) row.flagged = !currentlyFlagged;
          renderTable();
        } catch(e){
          btn.disabled = false;
          alert('Could not update flag - check your connection.');
        }
      });
    });
  }
}

function renderPagination(totalPages, totalCount){
  const el = document.getElementById('studentsPagination');
  if (!el) return;
  if (totalPages <= 1){ el.innerHTML = ''; return; }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1, currentPage - 2, currentPage + 2]);
  const sortedPages = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a,b) => a-b);

  let html = `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&lsaquo; Prev</button>`;
  let prev = 0;
  sortedPages.forEach(p => {
    if (p - prev > 1) html += `<span class="page-ellipsis">...</span>`;
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    prev = p;
  });
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next &rsaquo;</button>`;
  html += `<span class="page-count">${totalCount} students total</span>`;

  el.innerHTML = html;
  el.querySelectorAll('.page-btn[data-page]:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page, 10);
      renderTable();
    });
  });
}

export async function loadTeacherView(){
  const container = document.getElementById('sirContent');
  container.innerHTML = '<div class="loading">Loading class data...</div>';

  const user = getCurrentUser();
  isAdmin = await checkIsAdmin(user ? user.uid : null);

  let snaps, flagSnaps;
  try {
    snaps = await getDocs(collection(db, 'students'));
  } catch(e){
    if (e.code === 'permission-denied'){
      container.innerHTML = '<div class="loading">You don\'t have teacher access on this account. Ask an existing admin to add your account if you should have access.</div>';
    } else {
      container.innerHTML = '<div class="loading">Could not load class data. Check your connection and try again.</div>';
    }
    return;
  }
  try {
    flagSnaps = await getDocs(collection(db, 'flags'));
  } catch(e){
    flagSnaps = null; // flags are optional - don't block the whole dashboard if this fails
  }

  const flagMap = {};
  if (flagSnaps) flagSnaps.forEach(f => { flagMap[f.id] = f.data(); });

  const students = [];
  snaps.forEach(s => students.push({ id: s.id, ...s.data() }));

  if (students.length === 0){
    container.innerHTML = '<div class="loading">No students have started tracking yet.</div>';
    return;
  }

  const total = computeTotalAll();
  lastRows = students.map(s => {
    const done = studentDoneCount(s);
    const pct = total ? Math.round(done/total*100) : 0;
    let scCount = 0;
    if (s.selfcheck) Object.values(s.selfcheck).forEach(v => { if (v) scCount++; });
    const flagged = !!(flagMap[s.id] && flagMap[s.id].flagged);
    return { id: s.id, name: s.displayName || s.username || '(unknown)', done, total, pct, scCount, updatedAt: s.updatedAt, flagged };
  });

  const avgPct = lastRows.length ? Math.round(lastRows.reduce((a,r) => a + r.pct, 0) / lastRows.length) : 0;
  const avgSc = lastRows.length ? Math.round(lastRows.reduce((a,r) => a + r.scCount, 0) / lastRows.length) : 0;

  const heat = chapterCompletionAcrossClass(students).sort((a,b) => a.avgPct - b.avgPct);
  const rankings = await computeRankings();

  container.innerHTML = `
    ${isAdmin ? `
    <div class="section-label" style="margin-top:0;">➕ Add a missing lecture</div>
    <div class="add-lecture-form">
      <select id="addLecChapter">${ORDER.map(ch => `<option value="${ch}">${ch}</option>`).join('')}</select>
      <select id="addLecType"><option value="fs">Theory</option><option value="pyq">PYQ</option></select>
      <input id="addLecTitle" placeholder="Title">
      <input id="addLecUrl" placeholder="YouTube URL">
      <input id="addLecDuration" placeholder="Duration (e.g. 12:34)">
      <button id="addLecBtn">Add</button>
    </div>
    <div id="addLecMsg" class="status-msg" style="margin:4px 0 16px;"></div>
    ` : ''}

    <div class="section-label">🏆 Leaderboard (top 10, flagged accounts excluded)</div>
    <div id="leaderboardPanel"></div>

    <div class="stat-grid" style="margin-top:20px;">
      <div class="stat-box"><div class="num">${lastRows.length}</div><div class="lbl">Students tracking</div></div>
      <div class="stat-box"><div class="num">${avgPct}%</div><div class="lbl">Avg class completion</div></div>
      <div class="stat-box pyq"><div class="num">${avgSc}</div><div class="lbl">Avg year-sessions self-checked</div></div>
    </div>

    <div class="controls">
      <input class="search-input" id="studentSearch" placeholder="Search student...">
    </div>

    <table class="students">
      <thead><tr>
        <th data-key="name">Student</th>
        <th data-key="done">Progress</th>
        <th data-key="pct">Completion</th>
        <th data-key="updatedAt">Last active</th>
        ${isAdmin ? '<th>Flag</th>' : '<th>Status</th>'}
      </tr></thead>
      <tbody id="studentsTbody"></tbody>
    </table>
    <div id="studentsPagination" class="pagination"></div>

    <div class="section-label" style="margin-top:22px;">Chapter completion across class (lowest first - where the class is stuck)</div>
    <div class="chapter-heat">
      ${heat.map(h => `
        <div class="heat-row">
          <div class="heat-name">${h.chapter}</div>
          <div class="heat-bar"><div style="width:${h.avgPct}%"></div></div>
          <div class="heat-pct">${h.avgPct}%</div>
        </div>
      `).join('')}
    </div>
  `;

  renderTable();
  mountLeaderboard(document.getElementById('leaderboardPanel'), rankings, 'overall', 10);

  document.querySelectorAll('table.students th').forEach(th => {
    if (!th.dataset.key) return;
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (sortKey === key) sortDir *= -1; else { sortKey = key; sortDir = 1; }
      currentPage = 1;
      renderTable();
    });
  });

  document.getElementById('studentSearch').addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    currentPage = 1;
    renderTable();
  });

  if (isAdmin){
    document.getElementById('addLecBtn').addEventListener('click', async () => {
      const chapter = document.getElementById('addLecChapter').value;
      const kind = document.getElementById('addLecType').value;
      const title = document.getElementById('addLecTitle').value.trim();
      const url = document.getElementById('addLecUrl').value.trim();
      const duration = document.getElementById('addLecDuration').value.trim();
      const msg = document.getElementById('addLecMsg');
      if (!title || !url){ msg.textContent = 'Title and URL are required.'; return; }
      msg.textContent = 'Adding...';
      try {
        await addCustomLecture(chapter, kind, { title, url, duration, uploaded: new Date().toISOString() });
        msg.textContent = 'Added - visible immediately, and to everyone else next time they load the site.';
        document.getElementById('addLecTitle').value = '';
        document.getElementById('addLecUrl').value = '';
        document.getElementById('addLecDuration').value = '';
      } catch(e){
        msg.textContent = 'Could not add - check your connection.';
      }
    });
  }
}
