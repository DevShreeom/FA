// main.js - entry point. Routes the nav rail, boots auth, wires theme toggle.

import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initAuthForm, showAuthOverlay, hideAuthOverlay } from './auth.js';
import { wireStudentControls, startStudentSession, getCurrentUser } from './studentView.js';
import { loadTeacherView } from './teacherView.js';
import { computeRankings, mountLeaderboard } from './leaderboard.js';
import { loadUpdatesPage, loadLatestUpdatePreview } from './updates.js';
import { loadAndMergeCustomLectures } from './customLectures.js';

// ---- Theme toggle ----
const THEME_KEY = 'jee_tracker_theme';
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle').textContent = theme === 'light' ? '☀️' : '🌙';
}
const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
applyTheme(savedTheme);
document.getElementById('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

// ---- Nav rail routing ----
const SECTION_IDS = {
  dashboard: 'sectionDashboard',
  leaderboard: 'sectionLeaderboard',
  classview: 'sectionClassView',
  updates: 'sectionUpdates'
};

function showSection(name){
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  document.getElementById(SECTION_IDS[name]).classList.add('active');

  if (name === 'leaderboard'){
    const el = document.getElementById('leaderboardPage');
    el.innerHTML = '<div class="loading">Loading leaderboard...</div>';
    computeRankings().then(rankings => mountLeaderboard(el, rankings, 'overall', 20))
      .catch(() => { el.innerHTML = '<div class="empty-note">Could not load leaderboard.</div>'; });
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
    showAuthOverlay();
  }
});
