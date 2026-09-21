// main.js - entry point. Routes the nav rail, boots auth, wires theme toggle.

import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initAuthForm, showAuthOverlay, hideAuthOverlay } from './auth.js';
// Class View removed (Pillar 6)
import { mountLeaderboard } from './leaderboard.js';
import { loadUpdatesPage, loadLatestUpdatePreview } from './updates.js';
import { loadAndMergeCustomLectures } from './customLectures.js';
import { loadQotdView } from './qotdView.js';
import { wireStudentControls, startStudentSession, getCurrentUser, buildNotesView, getMyData } from './studentView.js';
import { checkIsAdmin } from './adminCheck.js';
import { renderHeatmap } from './heatmap.js';
import { mountClassAnalytics } from './classAnalytics.js';

import { initYtFeed } from './ytFeed.js';
import { initAllVideosGrid } from './allVideos.js';

// ---- Theme toggle ----
const THEME_KEY = 'jee_tracker_theme';
const themes = ['default','forest','light','ocean','crimson','cyber','peach','sakura','gold','slate','emerald','twilight','ruby','arctic','coffee','lime','plum','copper','teal','sand','mono-light','rose-gold'];
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

// Apply saved theme on load
if (currentTheme !== 'dark') {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

// Cycle through all themes on click with native fluid transition
document.getElementById('themeToggle').addEventListener('click', () => {
  let idx = themes.indexOf(currentTheme);
  idx = (idx + 1) % themes.length; 
  currentTheme = themes[idx];
  
  const applyTheme = () => {
    if (currentTheme === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);
  };

  // Fluid crossfade using native View Transitions API
  if (document.startViewTransition) {
    document.startViewTransition(applyTheme);
  } else {
    applyTheme();
  }
});

// ---- Navigation style memory ----
const NAV_KEY = 'jee_tracker_nav';
if (localStorage.getItem(NAV_KEY) === 'dock') {
  document.body.classList.add('dock-mode');
}

// ---- Nav rail routing ----
const SECTION_IDS = {
  dashboard:  'sectionDashboard',
  library:    'sectionLibrary',
  allvideos:  'sectionAllVideos',
  notes:      'sectionNotes',
  qotd:       'sectionQotd',
  leaderboard:'sectionLeaderboard',
  updates:    'sectionUpdates',
  profile:    'sectionProfile',
  about:      'sectionAbout'
};

let isAdminUser = false; // set once per session after login, see onAuthStateChanged below

function showSection(name){
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  
  const targetSection = document.getElementById(SECTION_IDS[name]);
  if (targetSection) {
    targetSection.classList.add('active');
  } else {
    console.error("Missing HTML section for:", name);
  }
  
  if (name === 'qotd')        loadQotdView();
  if (name === 'notes')       buildNotesView();
  if (name === 'leaderboard') {
    const el = document.getElementById('leaderboardPage');
    if (el) mountLeaderboard(el);
  }
  if (name === 'updates')     loadUpdatesPage();

  if (name === 'profile') {
    const myData = getMyData();
    const hmEl   = document.getElementById('heatmapContainer');
    if (hmEl) renderHeatmap(hmEl, myData.studyLog || {});
    
    // Mount the "You vs. Class" analytics (Pillar 2) — 1 Firestore read
    const profileSection = document.getElementById('sectionProfile');
    if (profileSection) mountClassAnalytics(profileSection, myData);

    // Close sidebar on mobile after navigating
    if (window.innerWidth <= 768) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) sidebar.classList.remove('open');
      const overlay = document.getElementById('mobileMenuOverlay');
      if (overlay) overlay.style.display = 'none';
    }
  } // Closes if (name === 'profile')
} // Closes function showSection

// Bind side navigation
document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.section));
});

// Bind footer and about buttons
document.getElementById('aboutBtn')?.addEventListener('click', () => showSection('about'));
document.querySelectorAll('.footer-links a').forEach(a => {
  a.addEventListener('click', (e) => { e.preventDefault(); showSection('about'); });
});

// Export functions to window
window.showSection = showSection;



// ---- Boot ----
(async function boot() {
  initAuthForm();
  wireStudentControls();
  await loadAndMergeCustomLectures();

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initAllVideosGrid);
  } else {
    setTimeout(initAllVideosGrid, 500);
  }
})();



// ---- YouTube feed ----
initYtFeed();

onAuthStateChanged(auth, async (user) => {
  if (user){
    await startStudentSession(user);
    loadLatestUpdatePreview();

    isAdminUser = await checkIsAdmin(user.uid);
  } else {
    document.getElementById('appShell').style.display = 'none';
    if(document.getElementById('whoamiBar')) document.getElementById('whoamiBar').style.display = 'none';
    if(document.getElementById('settingsCapsule')) document.getElementById('settingsCapsule').style.display = 'none';
    showAuthOverlay();
  }
});
