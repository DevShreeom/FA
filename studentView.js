// studentView.js — everything for the logged-in student's own dashboard.

import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ORDER, CHAPTER_DATA, SESSIONS } from './data.js';

let currentUser = null;
let myUsername = null;
let myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null };
let saveTimer = null;

function idFor(url){ return url.split('v=')[1] || url; }
function fmtChapterNum(i){ return String(i+1).padStart(2,'0'); }
function scKey(ch, sess){ return ch + '|' + sess; }

function totalForChapter(ch){ return CHAPTER_DATA[ch].fs.length + CHAPTER_DATA[ch].pyq.length; }
function computeTotal(){ let t = 0; ORDER.forEach(ch => { t += totalForChapter(ch); }); return t; }
function computeDoneTheory(){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].fs.forEach(it => { if (myData.theory[idFor(it.url)]) n++; }); });
  return n;
}
function computeDonePyq(){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].pyq.forEach(it => { if (myData.pyq[idFor(it.url)]) n++; }); });
  return n;
}
function totalTheory(){ let t=0; ORDER.forEach(ch => t += CHAPTER_DATA[ch].fs.length); return t; }
function totalPyq(){ let t=0; ORDER.forEach(ch => t += CHAPTER_DATA[ch].pyq.length); return t; }

async function loadMyData(){
  try {
    const snap = await getDoc(doc(db, 'students', currentUser.uid));
    if (snap.exists()){
      const d = snap.data();
      myData = { theory: d.theory || {}, pyq: d.pyq || {}, selfcheck: d.selfcheck || {}, updatedAt: d.updatedAt || null, username: d.username || myUsername };
    } else {
      myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername };
    }
  } catch(e){
    myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername };
  }
}

function saveMyDataDebounced(){
  const statusEl = document.getElementById('statusMsg');
  if (statusEl) statusEl.textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    myData.username = myUsername;
    myData.updatedAt = new Date().toISOString();
    try {
      await setDoc(doc(db, 'students', currentUser.uid), myData);
      if (statusEl) statusEl.textContent = 'Saved';
    } catch(e){
      if (statusEl) statusEl.textContent = 'Save failed — check connection';
    }
  }, 600);
}

function renderVideoRow(item, kind){
  const vid = idFor(item.url);
  const checked = kind === 'fs' ? !!myData.theory[vid] : !!myData.pyq[vid];
  const row = document.createElement('div');
  row.className = 'video-row ' + (kind === 'pyq' ? 'pyq' : '') + (checked ? ' done' : '');
  row.innerHTML = `
    <input type="checkbox" ${checked ? 'checked' : ''}>
    <div class="video-info">
      <a href="${item.url}" target="_blank" rel="noopener">${item.title}</a>
      <span class="video-dur">${item.duration ? '· ' + item.duration : ''}</span>
    </div>
  `;
  const cb = row.querySelector('input');
  cb.addEventListener('change', () => {
    if (kind === 'fs') myData.theory[vid] = cb.checked; else myData.pyq[vid] = cb.checked;
    row.classList.toggle('done', cb.checked);
    updateChapterProgress(row.closest('.chapter'));
    updateStatStrip();
    saveMyDataDebounced();
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
        saveMyDataDebounced();
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
  CHAPTER_DATA[ch].fs.forEach(it => { if (myData.theory[idFor(it.url)]) done++; });
  CHAPTER_DATA[ch].pyq.forEach(it => { if (myData.pyq[idFor(it.url)]) done++; });
  const pct = total ? Math.round(done/total*100) : 0;
  chapterEl.querySelector('.mini-bar > div').style.width = pct + '%';
  chapterEl.querySelector('.chapter-count').textContent = `${done}/${total}`;
}

function updateStatStrip(){
  const total = computeTotal();
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
}

export function getCurrentUser(){ return currentUser; }
