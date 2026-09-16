// teacherView.js
// Direct-fetch is fine here now: Class View is admin-only (see main.js), so this
// ~1000-read scan only runs when a teacher opens it, not every student.

import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { computeTotalAll, studentTheoryDone, studentPyqDone, idFor } from './metrics.js';
import { ORDER, CHAPTER_DATA } from './data.js';
import { getCurrentUser } from './studentView.js';
import { checkIsAdmin } from './adminCheck.js';
import { addCustomLecture } from './customLectures.js';

function totalForChapter(ch){ return CHAPTER_DATA[ch].fs.length + CHAPTER_DATA[ch].pyq.length; }

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

export async function loadTeacherView(){
  const container = document.getElementById('sirContent');
  container.innerHTML = '<div class="loading">Loading class data...</div>';

  const user = getCurrentUser();
  const isAdmin = await checkIsAdmin(user ? user.uid : null);

  if (!isAdmin){
    container.innerHTML = '<div class="loading">You don\'t have teacher access on this account.</div>';
    return;
  }

  let snaps;
  try {
    snaps = await getDocs(collection(db, 'students'));
  } catch(e){
    container.innerHTML = '<div class="loading">Could not load class data. Check your connection and try again.</div>';
    return;
  }

  const students = [];
  snaps.forEach(s => students.push({ id: s.id, ...s.data() }));

  if (students.length === 0){
    container.innerHTML = '<div class="loading">No students have started tracking yet.</div>';
    return;
  }

  const total = computeTotalAll();

  const rows = students.map(s => {
    const done = studentDoneCount(s);
    const pct = total ? Math.round(done/total*100) : 0;
    let scCount = 0;
    if (s.selfcheck) Object.values(s.selfcheck).forEach(v => { if (v) scCount++; });
    return { pct, scCount };
  });

  const avgPct = rows.length ? Math.round(rows.reduce((a,r) => a + r.pct, 0) / rows.length) : 0;
  const avgSc = rows.length ? Math.round(rows.reduce((a,r) => a + r.scCount, 0) / rows.length) : 0;
  const heat = chapterCompletionAcrossClass(students).sort((a,b) => a.avgPct - b.avgPct);

  container.innerHTML = `
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

    <div class="stat-grid" style="margin-top:20px;">
      <div class="stat-box"><div class="num">${rows.length}</div><div class="lbl">Students tracking</div></div>
      <div class="stat-box"><div class="num">${avgPct}%</div><div class="lbl">Avg class completion</div></div>
      <div class="stat-box pyq"><div class="num">${avgSc}</div><div class="lbl">Avg year-sessions checked</div></div>
    </div>

    <div class="section-label" style="margin-top:32px;">Chapter completion across class (where they are stuck)</div>

    <div style="width:100%; overflow-x:auto; padding-bottom:10px; -webkit-overflow-scrolling:touch;">
      <div class="chapter-heat" style="min-width:550px;">
        ${heat.map(h => `
          <div class="heat-row">
            <div class="heat-name">${h.chapter}</div>
            <div class="heat-bar"><div style="width:${h.avgPct}%"></div></div>
            <div class="heat-pct">${h.avgPct}%</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

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
