// studentView.js
import { db } from './firebase.js';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
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
      myData = { 
        theory: d.theory || {}, 
        pyq: d.pyq || {}, 
        selfcheck: d.selfcheck || {}, 
        notes: d.notes || {}, // <--- THIS IS THE MAGIC FIX
        updatedAt: d.updatedAt || null, 
        username: d.username || myUsername, 
        displayName: d.displayName || null,
        targetDate: d.targetDate || null,
        totalDone: d.totalDone !== undefined ? d.totalDone : undefined,
        // NEW PROFILE FIELDS
        grade: d.grade || '',
        telegram: d.telegram || '',
        isPublic: d.isPublic || false
      };
    } else {
      myData = { theory: {}, pyq: {}, selfcheck: {}, updatedAt: null, username: myUsername, displayName: null, totalDone: 0 };
      try { await setDoc(ref, { ...myData, totalDone: 0, updatedAt: new Date().toISOString() }); } catch(e){}
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
    const totalDone = computeDoneTheory() + computeDonePyq();
    myData.totalDone = totalDone;

    const payload = { 
      [fieldPath]: value, 
      totalDone: totalDone,
      updatedAt: new Date().toISOString(), 
      username: myUsername 
    };

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

function findVideoById(searchId) {
  for (let ch of ORDER) {
    for (let it of CHAPTER_DATA[ch].fs) if (idFor(it.url) === searchId) return { chapter: ch, item: it, type: 'fs' };
    for (let it of CHAPTER_DATA[ch].pyq) if (idFor(it.url) === searchId) return { chapter: ch, item: it, type: 'pyq' };
  }
  return null;
}

function updateContinueWatching() {
  const cwEl = document.getElementById('continueWatchingWidget');
  if (!cwEl) return;

  let target = null;
  for (let vid in myData.theory) { if (myData.theory[vid] === 'progressing') { target = findVideoById(vid); break; } }
  if (!target) { for (let vid in myData.pyq) { if (myData.pyq[vid] === 'progressing') { target = findVideoById(vid); break; } } }
  if (!target) {
    for (let ch of ORDER) {
      let foundUnwatched = false;
      for (let it of CHAPTER_DATA[ch].fs) { if (!isDoneVal(myData.theory[idFor(it.url)])) { target = { chapter: ch, item: it }; foundUnwatched = true; break; } }
      if (foundUnwatched) break;
      for (let it of CHAPTER_DATA[ch].pyq) { if (!isDoneVal(myData.pyq[idFor(it.url)])) { target = { chapter: ch, item: it }; foundUnwatched = true; break; } }
      if (foundUnwatched) break;
    }
  }

  if (target && target.item) {
     cwEl.innerHTML = `<div class="widget-meta">${target.chapter}</div><div class="widget-title">${target.item.title}</div><a href="${target.item.url}" target="_blank" class="widget-btn" style="text-decoration:none; display:inline-block; text-align:center;">Resume Video</a>`;
  } else {
     cwEl.innerHTML = `<div class="empty-note">You're all caught up!</div>`;
  }
}

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
    updateContinueWatching(); 
  }

  row.querySelector('.status-btn.progressing').addEventListener('click', () => applyStatus(nextStatus(dataMap[vid] || 'none', 'progressing')));
  row.querySelector('.status-btn.done').addEventListener('click', () => applyStatus(nextStatus(dataMap[vid] || 'none', 'done')));

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
      cb.addEventListener('change', () => { myData.selfcheck[key] = cb.checked; writeField('selfcheck.' + key, cb.checked); });
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
    head.innerHTML = `<div class="chapter-title"><span class="chapter-num">${fmtChapterNum(i)}</span><span class="chapter-name">${ch}</span></div><div class="chapter-meta"><div class="mini-bar"><div></div></div><div class="chapter-count">0/0</div><div class="chevron">▶</div></div>`;
    head.addEventListener('click', () => chapterEl.classList.toggle('open'));

    const body = document.createElement('div');
    body.className = 'chapter-body';

    const fsLabel = document.createElement('div'); fsLabel.className = 'section-label fs'; fsLabel.textContent = 'One-shot lecture(s)'; body.appendChild(fsLabel);
    if (chData.fs.length === 0){ body.innerHTML += '<div class="empty-note">No one-shot lecture found for this chapter - source elsewhere.</div>'; } 
    else { chData.fs.forEach(item => body.appendChild(renderVideoRow(item, 'fs'))); }

    const pyqLabel = document.createElement('div'); pyqLabel.className = 'section-label pyq'; pyqLabel.textContent = 'PYQ practice'; body.appendChild(pyqLabel);
    if (chData.pyq.length === 0){ body.innerHTML += '<div class="empty-note">No dedicated PYQ video for this chapter in the library.</div>'; } 
    else { chData.pyq.forEach(item => body.appendChild(renderVideoRow(item, 'pyq'))); }

    body.appendChild(renderSelfCheck(ch));
    chapterEl.appendChild(head);
    chapterEl.appendChild(body);
    container.appendChild(chapterEl);
    updateChapterProgress(chapterEl);
  });
  updateStatStrip();
}

export function wireStudentControls(){
  document.getElementById('expandAll').addEventListener('click', () => { document.querySelectorAll('.chapter').forEach(c => c.classList.add('open')); });
  document.getElementById('collapseAll').addEventListener('click', () => { document.querySelectorAll('.chapter').forEach(c => c.classList.remove('open')); });
  document.getElementById('chapterSearch').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.chapter').forEach(el => { el.style.display = el.dataset.chapter.toLowerCase().includes(q) ? '' : 'none'; });
  });

  // Settings Modal Logic
  const overlay = document.getElementById('modalOverlay');
  const settingsModal = document.getElementById('settingsModal');
  const cardModal = document.getElementById('studentCardModal');
  
  function openSettings() {
    overlay.style.display = 'flex';
    settingsModal.style.display = 'block';
    cardModal.style.display = 'none';
    
    // Load existing profile data
    document.getElementById('setDisplayName').value = myData.displayName || '';
    document.getElementById('setGrade').value = myData.grade || '';
    document.getElementById('setTelegram').value = myData.telegram || '';
    document.getElementById('setIsPublic').checked = myData.isPublic || false;
    
    // Load existing Dock preference
    const navDropdown = document.getElementById('setNavStyle');
    if(navDropdown) navDropdown.value = localStorage.getItem('jee_tracker_nav') || 'sidebar';
  }

  // 1. Profile "(edit)" button
  document.getElementById('editNameBtn').addEventListener('click', openSettings);
  
  // 2. Old floating profile button (Sidebar mode)
  if(document.getElementById('settingsCapsule')) document.getElementById('settingsCapsule').addEventListener('click', openSettings);
  
  // 3. NEW: The Glass Dock Settings Button!
  if(document.getElementById('dockSettingsBtn')) document.getElementById('dockSettingsBtn').addEventListener('click', openSettings);

  // Close modal listeners
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => { overlay.style.display = 'none'; settingsModal.style.display = 'none'; cardModal.style.display = 'none'; });
  });
  
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) { overlay.style.display = 'none'; settingsModal.style.display = 'none'; cardModal.style.display = 'none'; }
  });

  // Bulletproof Save Button Logic
  document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
    const btn = document.getElementById('saveSettingsBtn');
    btn.textContent = 'Saving...';
    btn.disabled = true; // Prevent spam-clicking
    
    const newName = document.getElementById('setDisplayName').value.trim();
    const newGrade = document.getElementById('setGrade').value;
    const newTele = document.getElementById('setTelegram').value.trim();
    const newPub = document.getElementById('setIsPublic').checked;

    // --- SAVE DOCK PREFERENCE ---
    const navDropdown = document.getElementById('setNavStyle');
    if (navDropdown) {
      const newNav = navDropdown.value;
      localStorage.setItem('jee_tracker_nav', newNav);
      if (newNav === 'dock') document.body.classList.add('dock-mode'); 
      else document.body.classList.remove('dock-mode');
    }
    // ----------------------------

    // 1. Update local data instantly
    myData.displayName = newName;
    myData.grade = newGrade;
    myData.telegram = newTele;
    myData.isPublic = newPub;

    // 2. Update the UI instantly so it feels lightning fast
    document.getElementById('whoamiName').textContent = newName || myUsername;
    const banner = document.getElementById('displayNameBanner');
    if (banner) banner.style.display = 'none';

    const ref = doc(db, 'students', currentUser.uid);
    
    try {
      // 3. Send to Firebase
      await setDoc(ref, {
        displayName: newName,
        grade: newGrade,
        telegram: newTele,
        isPublic: newPub,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      btn.textContent = 'Saved!';
      
    } catch (error) {
      console.error("Save error:", error);
      btn.textContent = 'Error!';
    } finally {
      // 4. THIS ALWAYS RUNS! No more stuck buttons.
      setTimeout(() => {
        document.getElementById('modalOverlay').style.display = 'none';
        document.getElementById('settingsModal').style.display = 'none';
        btn.textContent = 'Save Profile';
        btn.disabled = false;
      }, 600);
    }
  });
}


export async function startStudentSession(user){
  currentUser = user;
  myUsername = (user.email || '').split('@')[0];
  document.getElementById('authOverlay').style.display = 'none';
  document.getElementById('appShell').style.display = 'block'; 
  document.getElementById('whoamiBar').style.display = 'flex';
  if(document.getElementById('settingsCapsule')) document.getElementById('settingsCapsule').style.display = 'flex';
  
  await loadMyData();

  if (myData && myData.totalDone === undefined) {
    const totalDone = computeDoneTheory() + computeDonePyq();
    myData.totalDone = totalDone;
    try { await updateDoc(doc(db, 'students', currentUser.uid), { totalDone: totalDone, updatedAt: new Date().toISOString() }); } catch(e) {}
  }

  document.getElementById('whoamiName').textContent = myData.displayName || myUsername;
  const nameToUse = myData.displayName || myUsername;
  const avatarEl = document.getElementById('avatarLetter');
  if (avatarEl) avatarEl.textContent = nameToUse.charAt(0).toUpperCase();

  const banner = document.getElementById('displayNameBanner');
  if (banner) banner.style.display = myData.displayName ? 'none' : 'block';
  
  buildChapters();
  const first = document.querySelector('.chapter');
  if (first) first.classList.add('open');
  
  updateDashboardExtras(); 
  updateContinueWatching(); 
  updateLiveOnlineCount();
}

export async function updateLiveOnlineCount() {
  const capsuleText = document.getElementById('onlineCountText');
  if (!capsuleText) return;

  try {
    // Calculate the time exactly 60 minutes ago
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Query Firestore
    const activeQuery = query(collection(db, 'students'), where('updatedAt', '>=', oneHourAgo));
    
    // 🔥 THE MAGIC BULLET: getCountFromServer only costs 1 single read!
    const snapshot = await getCountFromServer(activeQuery);
    
    // Fallback to at least 1 (themselves)
    const activeCount = Math.max(1, snapshot.data().count); 
    
    capsuleText.textContent = `${activeCount} online`;
  } catch (error) {
    console.error("Could not fetch live count:", error);
    capsuleText.textContent = `1 online`; // Silent fallback
  }
}

export function getCurrentUser(){ return currentUser; }

// ==========================================
// === THE NEW REVISION NOTES ENGINE ========
// ==========================================

export function buildNotesView() {
  const container = document.getElementById('notesContainer');
  const searchInput = document.getElementById('notesSearch');
  if(!container || !searchInput) return;
  
  const queryStr = searchInput.value.toLowerCase();
  container.innerHTML = '';

  ORDER.forEach((ch, i) => {
    const chData = CHAPTER_DATA[ch];
    const chapterEl = document.createElement('div');
    chapterEl.className = 'chapter';
    
    const head = document.createElement('div');
    head.className = 'chapter-head';
    head.innerHTML = `<div class="chapter-title"><span class="chapter-num">${fmtChapterNum(i)}</span><span class="chapter-name">${ch}</span></div><div class="chevron">▶</div>`;
    head.addEventListener('click', () => chapterEl.classList.toggle('open'));
    
    const body = document.createElement('div');
    body.className = 'chapter-body notes-body';
    let hasVisibleNotes = false;

    const renderVids = (vids, label) => {
      if(vids.length === 0) return;
      
      const vidsWrapper = document.createElement('div');
      let vidsAdded = 0;
      
      vids.forEach(vid => {
        const vidId = idFor(vid.url);
        const vidNotes = myData.notes[vidId] || Array(10).fill({time:'', text:''});
        
        // Universal Search filter
        const matchesSearch = queryStr === '' || vid.title.toLowerCase().includes(queryStr) || vidNotes.some(n => n.text.toLowerCase().includes(queryStr));
        if(!matchesSearch) return;

        vidsAdded++;
        hasVisibleNotes = true;

        const vRow = document.createElement('div');
        vRow.className = 'note-video-row';
        vRow.innerHTML = `<div class="note-vid-title"><a href="${vid.url}" target="_blank">${vid.title}</a></div><div class="note-slots"></div>`;
        const slotsContainer = vRow.querySelector('.note-slots');

        for(let j=0; j<10; j++) {
          const slot = document.createElement('div');
          slot.className = 'note-slot';
          const nData = vidNotes[j] || {time:'', text:''};
          
          slot.innerHTML = `
            <div class="note-slot-inputs">
              <input type="text" class="note-time" placeholder="HH:MM:SS" value="${nData.time}" maxlength="8">
              <input type="text" class="note-text" placeholder="Add footnote here..." value="${nData.text}">
            </div>
            <div class="note-actions">
              <button class="note-jump" title="Jump to Timestamp" ${!nData.time ? 'disabled' : ''}>▶ Jump</button>
              <button class="note-clear" title="Clear Slot">✖</button>
            </div>
          `;

          const timeIn = slot.querySelector('.note-time');
          const textIn = slot.querySelector('.note-text');
          const jumpBtn = slot.querySelector('.note-jump');
          const clearBtn = slot.querySelector('.note-clear');

          const saveSlot = () => {
            let t = timeIn.value.trim();
            // SMART FORMATTING: Auto-inserts colons!
            if(t.length === 6 && !t.includes(':') && !isNaN(t)) t = `${t.slice(0,2)}:${t.slice(2,4)}:${t.slice(4,6)}`;
            else if(t.length === 4 && !t.includes(':') && !isNaN(t)) t = `${t.slice(0,2)}:${t.slice(2,4)}`;
            timeIn.value = t;
            
            jumpBtn.disabled = !t;

            const newNotes = [...(myData.notes[vidId] || Array(10).fill({time:'', text:''}))];
            newNotes[j] = { time: t, text: textIn.value.trim() };
            myData.notes[vidId] = newNotes;

            writeField('notes.' + vidId, newNotes); // Debounced Firebase Save
          };

          timeIn.addEventListener('blur', saveSlot);
          textIn.addEventListener('blur', saveSlot);

          jumpBtn.addEventListener('click', () => {
            let t = timeIn.value.trim();
            let parts = t.split(':').reverse();
            let secs = 0;
            if(parts[0]) secs += parseInt(parts[0]);
            if(parts[1]) secs += parseInt(parts[1]) * 60;
            if(parts[2]) secs += parseInt(parts[2]) * 3600;
            window.open(vid.url + '&t=' + secs + 's', '_blank');
          });

          clearBtn.addEventListener('click', () => { timeIn.value = ''; textIn.value = ''; saveSlot(); });
          slotsContainer.appendChild(slot);
        }
        vidsWrapper.appendChild(vRow);
      });

      if(vidsAdded > 0) {
        const lbl = document.createElement('div'); lbl.className = 'section-label'; lbl.textContent = label;
        body.appendChild(lbl);
        body.appendChild(vidsWrapper);
      }
    };

    renderVids(chData.fs, 'One-shot lecture(s)');
    renderVids(chData.pyq, 'PYQ practice');

    if(hasVisibleNotes) {
      if (queryStr !== '') chapterEl.classList.add('open');
      chapterEl.appendChild(head);
      chapterEl.appendChild(body);
      container.appendChild(chapterEl);
    }
  });
}

// Make search live
document.addEventListener('DOMContentLoaded', () => {
  const notesSearch = document.getElementById('notesSearch');
  if(notesSearch) notesSearch.addEventListener('input', () => { clearTimeout(notesSearch.timer); notesSearch.timer = setTimeout(buildNotesView, 300); });
});
