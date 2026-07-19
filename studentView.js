// studentView.js — everything for the logged-in student's own dashboard.
//
// Efficiency note: instead of overwriting the whole student document on every
// single click (expensive + risks clobbering concurrent tabs), each tick writes
// only the ONE changed field via updateDoc's dot-path syntax. Metadata like
// 'updatedAt'/'username' rides along on each write but the tick data itself
// (theory/pyq/selfcheck) is written per-field, not as one giant object.

import { db } from './firebase.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ORDER, CHAPTER_DATA, SESSIONS } from './data.js';
import { idFor, totalForChapter, computeTotalAll, totalTheory, totalPyq } from './metrics.js';
import { computeRankings, mountLeaderboard } from './leaderboard.js';
import { recommendQotd } from './qotdRecommend.js';

let currentUser = null;
let myUsername = null;
let myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null };
const pendingWrites = {}; // per-field debounce timers, keyed by field path

function fmtChapterNum(i){ return String(i+1).padStart(2,'0'); }
function scKey(ch, sess){ return ch + '|' + sess; }

function isDoneVal(v){ return v === 'done' || v === true; }

function computeDoneTheory(){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].fs.forEach(it => { if (isDoneVal(myData.theory[idFor(it.url)])) n++; }); });
  return n;
}
function computeDonePyq(){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].pyq.forEach(it => { if (isDoneVal(myData.pyq[idFor(it.url)])) n++; }); });
  return n;
}

async function loadMyData(){
  const ref = doc(db, 'students', currentUser.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()){
      const d = snap.data();
      myData = { theory: d.theory || {}, pyq: d.pyq || {}, selfcheck: d.selfcheck || {}, updatedAt: d.updatedAt || null, username: d.username || myUsername };
    } else {
      myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername };
      // create the doc once up front so later writes can use the lighter updateDoc() instead of setDoc()
      try { await setDoc(ref, { ...myData, updatedAt: new Date().toISOString() }); } catch(e){ /* fine, first tick will retry via setDoc fallback */ }
    }
  } catch(e){
    myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername };
  }
}

// Writes exactly one field (e.g. "theory.abc123" or "selfcheck.Chapter|2024 Jan"),
// debounced per field-path so rapid re-clicks on the SAME item collapse into one write,
// but clicks on DIFFERENT items don't wait on each other.
function writeField(fieldPath, value){
  const statusEl = document.getElementById('statusMsg');
  if (statusEl) statusEl.textContent = 'Saving…';
  clearTimeout(pendingWrites[fieldPath]);
  pendingWrites[fieldPath] = setTimeout(async () => {
    const ref = doc(db, 'students', currentUser.uid);
    const payload = { [fieldPath]: value, updatedAt: new Date().toISOString(), username: myUsername };
    try {
      await updateDoc(ref, payload);
      if (statusEl) statusEl.textContent = 'Saved';
    } catch(e){
      // doc might not exist yet (edge case) — fall back to a full setDoc with merge
      try {
        await setDoc(ref, payload, { merge: true });
        if (statusEl) statusEl.textContent = 'Saved';
      } catch(e2){
        if (statusEl) statusEl.textContent = 'Save failed — check connection';
      }
    }
  }, 400);
}

function nextStatus(current, clicked){
  // clicked = 'progressing' | 'done'. Clicking the already-active state clears it back to 'none'.
  if (current === clicked) return 'none';
  return clicked;
}

function renderVideoRow(item, kind){
  const vid = idFor(item.url);
  const dataMap = kind === 'fs' ? myData.theory : myData.pyq;
  const rawVal = dataMap[vid];
  const status = rawVal === true ? 'done' : (rawVal || 'none'); // legacy boolean compat

  const row = document.createElement('div');
  row.className = 'video-row ' + (kind === 'pyq' ? 'pyq' : '') + (status === 'done' ? ' done' : '');
  row.innerHTML = `
    <div class="status-btns">
      <button class="status-btn progressing ${status === 'progressing' ? 'active' : ''}" title="Mark as progressing">◐</button>
      <button class="status-btn done ${status === 'done' ? 'active' : ''}" title="Mark as done">✓</button>
    </div>
    <div class="video-info">
      <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
      <span class="video-dur">${item.duration ? '· ' + item.duration : ''}</span>
    </div>
  `;

  const fieldPath = (kind === 'fs' ? 'theory.' : 'pyq.') + vid;

  function applyStatus(newStatus){
    dataMap[vid] = newStatus;
    row.classList.toggle('done', newStatus === 'done');
    row.querySelector('.status-btn.progressing').classList.toggle('active', newStatus === 'progressing');
    row.querySelector('.status-btn.done').classList.toggle('active', newStatus === 'done');
    updateChapterProgress(row.closest('.chapter'));
    updateStatStrip();
    writeField(fieldPath, newStatus);
  }

  row.querySelector('.status-btn.progressing').addEventListener('click', () => {
    applyStatus(nextStatus(dataMap[vid] || 'none', 'progressing'));
  });
  row.querySelector('.status-btn.done').addEventListener('click', () => {
    applyStatus(nextStatus(dataMap[vid] || 'none', 'done'));
  });

  return row;
}

function renderSelfCheck(ch){
  const wrap = document.createElement('div');
  wrap.className = 'selfcheck';
  const label = document.createElement('div');
  label.className = 'section-label pyq';
  label.textContent = 'Year-wise PYQ self-check';
  wrap.appendChild(label);

  for (let y = 0; y < SESSIONS.length; y += 2){
    const yearLabel = SESSIONS[y].split(' ')[0];
    const row = document.createElement('div');
    row.className = 'sc-year';
    row.innerHTML = `<span class="sc-year-label">${yearLabel}</span>`;
    [SESSIONS[y], SESSIONS[y+1]].forEach(sess => {
      const sessLabel = sess.split(' ')[1];
      const key = scKey(ch, sess);
      const checked = !!myData.selfcheck[key];
      const lbl = document.createElement('label');
      lbl.className = 'sc-sess';
      lbl.innerHTML = `<input type="checkbox" ${checked ? 'checked' : ''}> ${sessLabel}`;
      const cb = lbl.querySelector('input');
      cb.addEventListener('change', () => {
        myData.selfcheck[key] = cb.checked;
        writeField('selfcheck.' + key, cb.checked);
      });
      row.appendChild(lbl);
    });
    wrap.appendChild(row);
  }
  return wrap;
}

function updateChapterProgress(chapterEl){
  const ch = chapterEl.dataset.chapter;
  const total = totalForChapter(ch);
  let done = 0;
  CHAPTER_DATA[ch].fs.forEach(it => { if (isDoneVal(myData.theory[idFor(it.url)])) done++; });
  CHAPTER_DATA[ch].pyq.forEach(it => { if (isDoneVal(myData.pyq[idFor(it.url)])) done++; });
  const pct = total ? Math.round(done/total*100) : 0;
  chapterEl.querySelector('.mini-bar > div').style.width = pct + '%';
  chapterEl.querySelector('.chapter-count').textContent = `${done}/${total}`;
}

function updateStatStrip(){
  const total = computeTotalAll();
  const doneTheory = computeDoneTheory();
  const donePyq = computeDonePyq();
  const done = doneTheory + donePyq;
  const pct = total ? Math.round(done/total*100) : 0;

  document.getElementById('statOverallNum').textContent = pct + '%';
  document.getElementById('statTheoryNum').textContent = `${doneTheory}/${totalTheory()}`;
  document.getElementById('statPyqNum').textContent = `${donePyq}/${totalPyq()}`;
  document.getElementById('overallCount').textContent = `${done} / ${total}`;
  document.getElementById('overallBar').style.width = pct + '%';
}

async function updateSidebar(){
  const lbEl = document.getElementById('sidebarLeaderboard');
  const qotdEl = document.getElementById('qotdWidget');

  if (lbEl){
    lbEl.innerHTML = '<div class="loading" style="padding:10px;">Loading leaderboard…</div>';
    try {
      const rankings = await computeRankings();
      mountLeaderboard(lbEl, rankings, 'overall', 5);
    } catch(e){
      lbEl.innerHTML = '<div class="empty-note">Could not load leaderboard.</div>';
    }
  }

  if (qotdEl){
    try {
      const { chapter, video } = recommendQotd(myData);
      qotdEl.innerHTML = `
        <div class="qotd-chapter">Based on: ${chapter}</div>
        <a class="qotd-link" href="${video.url}" target="_blank" rel="noopener">${video.title}</a>
        <div class="video-dur">${video.duration}</div>
      `;
    } catch(e){
      qotdEl.innerHTML = '<div class="empty-note">No recommendation available.</div>';
    }
  }
}

function buildChapters(){
  const container = document.getElementById('chapters');
  container.innerHTML = '';
  ORDER.forEach((ch, i) => {
    const chData = CHAPTER_DATA[ch];
    const chapterEl = document.createElement('div');
    chapterEl.className = 'chapter';
    chapterEl.dataset.chapter = ch;

    const head = document.createElement('div');
    head.className = 'chapter-head';
    head.innerHTML = `
      <div class="chapter-title">
        <span class="chapter-num">${fmtChapterNum(i)}</span>
        <span class="chapter-name">${ch}</span>
      </div>
      <div class="chapter-meta">
        <div class="mini-bar"><div></div></div>
        <div class="chapter-count">0/0</div>
        <div class="chevron">▶</div>
      </div>
    `;
    head.addEventListener('click', () => chapterEl.classList.toggle('open'));

    const body = document.createElement('div');
    body.className = 'chapter-body';

    const fsLabel = document.createElement('div');
    fsLabel.className = 'section-label fs';
    fsLabel.textContent = 'One-shot lecture(s)';
    body.appendChild(fsLabel);
    if (chData.fs.length === 0){
      const n = document.createElement('div');
      n.className = 'empty-note';
      n.textContent = 'No one-shot lecture found for this chapter — source elsewhere.';
      body.appendChild(n);
    } else {
      chData.fs.forEach(item => body.appendChild(renderVideoRow(item, 'fs')));
    }

    const pyqLabel = document.createElement('div');
    pyqLabel.className = 'section-label pyq';
    pyqLabel.textContent = 'PYQ practice';
    body.appendChild(pyqLabel);
    if (chData.pyq.length === 0){
      const n = document.createElement('div');
      n.className = 'empty-note';
      n.textContent = 'No dedicated PYQ video for this chapter in the library.';
      body.appendChild(n);
    } else {
      chData.pyq.forEach(item => body.appendChild(renderVideoRow(item, 'pyq')));
    }

    body.appendChild(renderSelfCheck(ch));

    chapterEl.appendChild(head);
    chapterEl.appendChild(body);
    container.appendChild(chapterEl);
    updateChapterProgress(chapterEl);
  });
  updateStatStrip();
}

export function wireStudentControls(){
  document.getElementById('expandAll').addEventListener('click', () => {
    document.querySelectorAll('.chapter').forEach(c => c.classList.add('open'));
  });
  document.getElementById('collapseAll').addEventListener('click', () => {
    document.querySelectorAll('.chapter').forEach(c => c.classList.remove('open'));
  });
  document.getElementById('chapterSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.chapter').forEach(el => {
      const name = el.dataset.chapter.toLowerCase();
      el.style.display = name.includes(q) ? '' : 'none';
    });
  });
}

export async function startStudentSession(user){
  currentUser = user;
  myUsername = (user.email || '').split('@')[0];
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('studentView').style.display = 'block';
  document.getElementById('whoamiName').textContent = myUsername;
  await loadMyData();
  buildChapters();
  const first = document.querySelector('.chapter');
  if (first) first.classList.add('open');
  updateSidebar(); // fire-and-forget, doesn't block chapter rendering
}

export function getCurrentUser(){ return currentUser; }
