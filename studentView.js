// studentView.js

import { db } from './firebase.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ORDER, CHAPTER_DATA, SESSIONS } from './data.js';
import { idFor, totalForChapter, computeTotalAll, totalTheory, totalPyq } from './metrics.js';
import { recommendQotd } from './qotdRecommend.js';

let currentUser = null;
let myUsername = null;
let myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null };
const pendingWrites = {}; 

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
      myData = { theory: d.theory || {}, pyq: d.pyq || {}, selfcheck: d.selfcheck || {}, updatedAt: d.updatedAt || null, username: d.username || myUsername, displayName: d.displayName || null };
    } else {
      myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername, displayName: null };
      try { await setDoc(ref, { ...myData, updatedAt: new Date().toISOString() }); } catch(e){}
    }
  } catch(e){
    myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername, displayName: null };
  }
}

function writeField(fieldPath, value){
  const statusEl = document.getElementById('statusMsg');
  if (statusEl) statusEl.textContent = 'Saving...';
  clearTimeout(pendingWrites[fieldPath]);
  pendingWrites[fieldPath] = setTimeout(async () => {
    const ref = doc(db, 'students', currentUser.uid);
    const payload = { [fieldPath]: value, updatedAt: new Date().toISOString(), username: myUsername };
    try {
      await updateDoc(ref, payload);
      if (statusEl) statusEl.textContent = 'Saved';
    } catch(e){
      try {
        await setDoc(ref, payload, { merge: true });
        if (statusEl) statusEl.textContent = 'Saved';
      } catch(e2){
        if (statusEl) statusEl.textContent = 'Save failed - check connection';
      }
    }
  }, 400);
}

function nextStatus(current, clicked){
  if (current === clicked) return 'none';
  return clicked;
}

// --- NEW CONTINUE WATCHING LOGIC ---
function findVideoById(searchId) {
  for (let ch of ORDER) {
    for (let it of CHAPTER_DATA[ch].fs) {
      if (idFor(it.url) === searchId) return { chapter: ch, item: it, type: 'fs' };
    }
    for (let it of CHAPTER_DATA[ch].pyq) {
      if (idFor(it.url) === searchId) return { chapter: ch, item: it, type: 'pyq' };
    }
  }
  return null;
}

function updateContinueWatching() {
  const cwEl = document.getElementById('continueWatchingWidget');
  if (!cwEl) return;

  let target = null;
  // 1. Look for progressing items
  for (let vid in myData.theory) {
    if (myData.theory[vid] === 'progressing') { target = findVideoById(vid); break; }
  }
  if (!target) {
    for (let vid in myData.pyq) {
      if (myData.pyq[vid] === 'progressing') { target = findVideoById(vid); break; }
    }
  }

  // 2. Fallback to first unwatched
  if (!target) {
    for (let ch of ORDER) {
      let foundUnwatched = false;
      for (let it of CHAPTER_DATA[ch].fs) {
        if (!isDoneVal(myData.theory[idFor(it.url)])) { target = { chapter: ch, item: it }; foundUnwatched = true; break; }
      }
      if (foundUnwatched) break;
      for (let it of CHAPTER_DATA[ch].pyq) {
        if (!isDoneVal(myData.pyq[idFor(it.url)])) { target = { chapter: ch, item: it }; foundUnwatched = true; break; }
      }
      if (foundUnwatched) break;
    }
  }

  // 3. Render
  if (target && target.item) {
     cwEl.innerHTML = `
       <div class="widget-meta">${target.chapter}</div>
       <div class="widget-title">${target.item.title}</div>
       <a href="${target.item.url}" target="_blank" class="widget-btn" style="text-decoration:none; display:inline-block; text-align:center;">Resume Video</a>
     `;
  } else {
     cwEl.innerHTML = `<div class="empty-note">You're all caught up!</div>`;
  }
}
// --- END CONTINUE WATCHING LOGIC ---

function renderVideoRow(item, kind){
  const vid = idFor(item.url);
  const dataMap = kind === 'fs' ? myData.theory : myData.pyq;
  const rawVal = dataMap[vid];
  const status = rawVal === true ? 'done' : (rawVal || 'none'); 

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
    
    // Call the widget update whenever a status changes!
    updateContinueWatching(); 
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

let qotdIndex = 0;
let qotdRanked = [];

function renderQotdCard(){
  const qotdEl = document.getElementById('qotdWidget');
  if (!qotdEl || qotdRanked.length === 0) return;
  const video = qotdRanked[qotdIndex % qotdRanked.length];
  
  // Adjusted for the new Premium UI Widget layout
  qotdEl.innerHTML = `
    <div class="widget-meta">Based on: ${qotdChapterName}</div>
    <div class="widget-title">${video.title}</div>
    <div class="qotd-footer" style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <span class="widget-meta">${video.duration}</span>
      ${qotdRanked.length > 1 ? '<button id="qotdAnotherBtn" class="widget-btn" style="padding: 4px 10px; font-size: 0.7rem;">🔀 Next</button>' : ''}
    </div>
  `;
  const btn = document.getElementById('qotdAnotherBtn');
  if (btn) btn.addEventListener('click', () => { qotdIndex++; renderQotdCard(); });
}

let qotdChapterName = '';

async function updateDashboardExtras(){
  const qotdEl = document.getElementById('qotdWidget');
  if (qotdEl){
    try {
      const { chapter, ranked } = recommendQotd(myData);
      qotdChapterName = chapter;
      qotdRanked = ranked;
      qotdIndex = 0;
      renderQotdCard();
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
      n.textContent = 'No one-shot lecture found for this chapter - source elsewhere.';
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
  document.getElementById('editNameBtn').addEventListener('click', () => {
    const current = myData.displayName || '';
    const val = window.prompt('Set your display name:', current);
    if (val === null) return;
    const trimmed = val.trim();
    if (!trimmed) return;
    myData.displayName = trimmed;
    document.getElementById('whoamiName').textContent = trimmed;
    const banner = document.getElementById('displayNameBanner');
    if (banner) banner.style.display = 'none';
    writeField('displayName', trimmed);
  });
}

export async function startStudentSession(user){
  currentUser = user;
  myUsername = (user.email || '').split('@')[0];
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('appShell').style.display = 'block'; // Adjusted for new layout
  document.getElementById('whoamiBar').style.display = 'flex';
  await loadMyData();
  document.getElementById('whoamiName').textContent = myData.displayName || myUsername;
  
  // Fix the avatar letter to match their username/display name
  const nameToUse = myData.displayName || myUsername;
  const avatarEl = document.getElementById('avatarLetter');
  if (avatarEl) avatarEl.textContent = nameToUse.charAt(0).toUpperCase();

  const banner = document.getElementById('displayNameBanner');
  if (banner) banner.style.display = myData.displayName ? 'none' : 'block';
  
  buildChapters();
  const first = document.querySelector('.chapter');
  if (first) first.classList.add('open');
  
  updateDashboardExtras(); 
  updateContinueWatching(); // Initial load of the Continue Watching widget
}

export function getCurrentUser(){ return currentUser; }
