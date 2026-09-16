// teacherView.js - reads the server-computed stats/summary doc (1 read)
// instead of scanning the whole `students` collection. That scan now happens
// server-side in Cloud Functions (functions/index.js), every 30 min.

import { db, functions } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-functions.js";
import { ORDER } from './data.js';
import { getCurrentUser } from './studentView.js';
import { checkIsAdmin } from './adminCheck.js';
import { addCustomLecture } from './customLectures.js';

function addLectureFormHtml(){
  return `
    <div class="section-label" style="margin-top:0;">➕ Add a missing lecture</div>
    <div class="add-lecture-form" style="display:flex; flex-wrap:wrap; gap:8px;">
      <select id="addLecChapter" style="flex:1; min-width:130px;">${ORDER.map(ch => `<option value="${ch}">${ch}</option>`).join('')}</select>
      <select id="addLecType" style="flex:1; min-width:100px;"><option value="fs">Theory</option><option value="pyq">PYQ</option></select>
      <input id="addLecTitle" placeholder="Title" style="flex:2; min-width:200px;">
      <input id="addLecUrl" placeholder="YouTube URL" style="flex:2; min-width:150px;">
      <input id="addLecDuration" placeholder="Duration (e.g. 12:34)" style="flex:1; min-width:120px;">
      <button id="addLecBtn" style="flex:1; min-width:100px;">Add</button>
    </div>
    <div id="addLecMsg" class="status-msg" style="margin:4px 0 16px;"></div>
    <button id="refreshStatsBtn" style="margin-bottom:16px;">🔄 Refresh class stats now</button>
    <div id="refreshMsg" class="status-msg" style="margin:4px 0 16px;"></div>
  `;
}

function wireAdminControls(){
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
      msg.textContent = 'Added - visible immediately, and to everyone else next time they load the site. Class stats pick it up on next refresh.';
      document.getElementById('addLecTitle').value = '';
      document.getElementById('addLecUrl').value = '';
      document.getElementById('addLecDuration').value = '';
    } catch(e){
      msg.textContent = 'Could not add - check your connection.';
    }
  });

  document.getElementById('refreshStatsBtn').addEventListener('click', async () => {
    const msg = document.getElementById('refreshMsg');
    msg.textContent = 'Recomputing...';
    try {
      const recomputeNow = httpsCallable(functions, 'recomputeNow');
      await recomputeNow();
      msg.textContent = 'Done - reload Class View to see the update.';
    } catch(e){
      msg.textContent = 'Could not refresh: ' + (e.message || 'check your connection.');
    }
  });
}

export async function loadTeacherView(){
  const container = document.getElementById('sirContent');
  container.innerHTML = '<div class="loading">Loading class data...</div>';

  const user = getCurrentUser();
  const isAdmin = await checkIsAdmin(user ? user.uid : null);

  let stats = null;
  try {
    const snap = await getDoc(doc(db, 'stats', 'summary'));
    if (snap.exists()) stats = snap.data();
  } catch(e){
    stats = null;
  }

  if (!stats || stats.studentsCount === 0){
    container.innerHTML = `
      ${isAdmin ? addLectureFormHtml() : ''}
      <div class="loading">${!stats ? 'Class stats not available yet - check back shortly.' : 'No students have started tracking yet.'}</div>
    `;
    if (isAdmin) wireAdminControls();
    return;
  }

  const staleness = stats.updatedAt ? new Date(stats.updatedAt).toLocaleString() : '';

  container.innerHTML = `
    ${isAdmin ? addLectureFormHtml() : ''}

    <div class="stat-grid" style="margin-top:20px;">
      <div class="stat-box"><div class="num">${stats.studentsCount}</div><div class="lbl">Students tracking</div></div>
      <div class="stat-box"><div class="num">${stats.avgPct}%</div><div class="lbl">Avg class completion</div></div>
      <div class="stat-box pyq"><div class="num">${stats.avgSc}</div><div class="lbl">Avg year-sessions checked</div></div>
    </div>

    <div class="section-label" style="margin-top:32px;">Chapter completion across class (where they are stuck)</div>
    <div style="font-size:0.75rem; color:var(--muted); margin-bottom:8px;">Updated ${staleness} (auto-refreshes every 30 min)</div>

    <div style="width:100%; overflow-x:auto; padding-bottom:10px; -webkit-overflow-scrolling:touch;">
      <div class="chapter-heat" style="min-width:550px;">
        ${stats.heat.map(h => `
          <div class="heat-row">
            <div class="heat-name">${h.chapter}</div>
            <div class="heat-bar"><div style="width:${h.avgPct}%"></div></div>
            <div class="heat-pct">${h.avgPct}%</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  if (isAdmin) wireAdminControls();
}
