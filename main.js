// main.js - entry point. Routes the nav rail, boots auth, wires theme toggle.

import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initAuthForm, showAuthOverlay, hideAuthOverlay } from './auth.js';
import { loadTeacherView } from './teacherView.js';
import { computeRankings, mountLeaderboard } from './leaderboard.js';
import { loadUpdatesPage, loadLatestUpdatePreview } from './updates.js';
import { loadAndMergeCustomLectures } from './customLectures.js';
import { loadQotdView } from './qotdView.js';
import { wireStudentControls, startStudentSession, getCurrentUser, buildNotesView } from './studentView.js';

// ---- Theme toggle ----
const THEME_KEY = 'jee_tracker_theme';
const themes = ['dark', 'forest', 'light'];
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

// Apply saved theme on load
if (currentTheme !== 'dark') {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

// Cycle through all 3 themes on click
document.getElementById('themeToggle').addEventListener('click', () => {
  let idx = themes.indexOf(currentTheme);
  idx = (idx + 1) % themes.length; // Moves to the next theme in the array
  currentTheme = themes[idx];
  
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }
  localStorage.setItem(THEME_KEY, currentTheme);
});

// ---- Navigation style memory ----
const NAV_KEY = 'jee_tracker_nav';
if (localStorage.getItem(NAV_KEY) === 'dock') {
  document.body.classList.add('dock-mode');
}


// ---- Nav rail routing ----
const SECTION_IDS = {
  dashboard: 'sectionDashboard',
  notes: 'sectionNotes',
  qotd: 'sectionQotd',
  leaderboard: 'sectionLeaderboard',
  classview: 'sectionClassView',
  updates: 'sectionUpdates'
};

function showSection(name){
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  
  // CRASH PROTECTION: Check if the section actually exists before adding classes
  const targetSection = document.getElementById(SECTION_IDS[name]);
  if (targetSection) {
    targetSection.classList.add('active');
  } else {
    console.error("Missing HTML section for:", name);
  }
  
  if (name === 'qotd') loadQotdView();
  if (name === 'notes') buildNotesView(); 

  if (name === 'leaderboard'){
    const el = document.getElementById('leaderboardPage');
    if(el) el.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    computeRankings().then(rankings => mountLeaderboard(el, rankings, 'overall', 20))
      .catch(() => { if(el) el.innerHTML = '<div class="empty-note">Could not load leaderboard.</div>'; });
  }
  if (name === 'classview') loadTeacherView();
  if (name === 'updates') loadUpdatesPage();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.section));
});

// ---- Boot ----
initAuthForm();
wireStudentControls();
await loadAndMergeCustomLectures(); // pull in any admin-added lectures before the first render

onAuthStateChanged(auth, async (user) => {
  if (user){
    await startStudentSession(user);
    loadLatestUpdatePreview();
  } else {
    document.getElementById('appShell').style.display = 'none';
    document.getElementById('whoamiBar').style.display = 'none';
    if(document.getElementById('settingsCapsule')) document.getElementById('settingsCapsule').style.display = 'none';
    showAuthOverlay();
  }
});
