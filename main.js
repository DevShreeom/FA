// main.js - entry point. Routes the editorial landing view and dashboard app shell.

import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initAuthForm, showAuthOverlay, hideAuthOverlay } from './auth.js';
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
import { initOnboarding, openRoadmap } from './onboarding.js';
import { ORDER, CHAPTER_DATA } from './data.js';

window.openRoadmap = openRoadmap;

// ---- Theme Management ----
const THEME_KEY = 'jee_tracker_theme';
const themes = ['default','forest','light','ocean','crimson','cyber','peach','sakura','gold','slate','emerald','twilight','ruby','arctic','coffee','lime','plum','copper','teal','sand','mono-light','rose-gold'];
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

if (currentTheme !== 'dark') {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
  let idx = themes.indexOf(currentTheme);
  idx = (idx + 1) % themes.length; 
  currentTheme = themes[idx];
  
  const applyTheme = () => {
    if (currentTheme === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);
  };

  if (document.startViewTransition) {
    document.startViewTransition(applyTheme);
  } else {
    applyTheme();
  }
});

// ---- Nav routing inside app shell ----
const SECTION_IDS = {
  dashboard:   'sectionDashboard',
  library:     'sectionLibrary',
  allvideos:   'sectionAllVideos',
  notes:       'sectionNotes',
  qotd:        'sectionQotd',
  leaderboard: 'sectionLeaderboard',
  updates:     'sectionUpdates',
  profile:     'sectionProfile',
  about:       'sectionAbout'
};

const SECTION_META = {
  dashboard:   { title: 'Dashboard',            subtitle: "Welcome back — here's where you left off." },
  library:     { title: 'Lectures Library',     subtitle: 'Browse and track the complete curriculum.' },
  allvideos:   { title: 'All YT Videos',        subtitle: 'Every upload from the channel, freshly synced.' },
  notes:       { title: 'Revision Notes',       subtitle: 'Your timestamped notes across every lecture.' },
  qotd:        { title: 'Question of the Day',  subtitle: 'One sharp problem, every single day.' },
  leaderboard: { title: 'Leaderboard',          subtitle: 'See how your progress stacks up against the class.' },
  updates:     { title: 'Updates',              subtitle: 'Announcements and changelog from the team.' },
  profile:     { title: 'My Profile',           subtitle: 'Your study activity, streaks, and settings.' },
  about:       { title: 'About & Credits',      subtitle: 'The team, the legal fine print, and how to reach us.' }
};

function updateHeaderTitle(name) {
  const meta = SECTION_META[name];
  if (!meta) return;
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl) titleEl.textContent = meta.title;
  if (subEl) subEl.textContent = meta.subtitle;
}

export function showSection(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  updateHeaderTitle(name);
  
  const targetSection = document.getElementById(SECTION_IDS[name]);
  if (targetSection) targetSection.classList.add('active');
  
  if (name === 'qotd') loadQotdView();
  if (name === 'notes') buildNotesView();
  if (name === 'leaderboard') {
    const el = document.getElementById('leaderboardPage');
    if (el) mountLeaderboard(el);
  }
  if (name === 'updates') loadUpdatesPage();
  if (name === 'profile') {
    const myData = getMyData();
    const hmEl = document.getElementById('heatmapContainer');
    if (hmEl) renderHeatmap(hmEl, myData.studyLog || {});
    const profileSection = document.getElementById('sectionProfile');
    if (profileSection) mountClassAnalytics(profileSection, myData);
  }
}
window.showSection = showSection;

document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
  btn.addEventListener('click', () => showSection(btn.dataset.section));
});
document.getElementById('aboutBtn')?.addEventListener('click', () => showSection('about'));

// Switch between landing and workspace
document.getElementById('protoHomeBtn')?.addEventListener('click', () => {
  document.getElementById('appShell').style.display = 'none';
  document.getElementById('landingView').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =========================================================
// === EDITORIAL LANDING PAGE LOGIC & DATA POPULATION    ===
// =========================================================

const PROTOTYPE_COURSES = [
  ["Limits Mastery", "POCKET", "₹249", "8 lessons · 1h 42m", "∫"],
  ["Matrices: Core → Advanced", "ADVANCED", "₹699", "24 lessons · 7h 10m", "Σ"],
  ["JEE Main Maths Sprint", "MAIN", "₹299", "12 lessons · 3h 20m", "M"],
  ["Calculus Revision Lab", "REVISION", "₹399", "10 lessons · 2h 40m", "R"],
  ["Advanced Problem Vault", "ADVANCED", "₹799", "18 lessons · 5h 35m", "A"],
  ["Coordinate Geometry Bootcamp", "MAIN", "₹599", "21 lessons · 6h 05m", "C"],
  ["Factorial Originals · Vol. 01", "ORIGINAL", "₹349", "50 problems · solutions", "F"],
  ["Homework Accelerator", "POCKET", "₹199", "30-day guided practice", "H"]
];

function renderPrototypeCourses() {
  const grid = document.getElementById("courseGrid");
  if (!grid) return;
  grid.innerHTML = PROTOTYPE_COURSES.map((c, i) => `
    <article class="proto-course">
      <div class="proto-cover ${i % 3 === 1 ? 'light' : ''}">
        <span class="proto-tag">${c[1]}</span>
        <span style="font:48px Georgia; opacity:.85">${c[4]}</span>
      </div>
      <div class="proto-courseBody">
        <h3>${c[0]}</h3>
        <div class="proto-meta"><span>${c[3]}</span><span>Demo</span></div>
        <div class="proto-price">${c[2]}</div>
        <button onclick="openProtoCheckout('${c[0]}','${c[2]}')">View course & checkout →</button>
      </div>
    </article>
  `).join("");
}

function renderLandingLibrary() {
  const list = document.getElementById("chapterList");
  if (!list) return;

  list.innerHTML = ORDER.map((ch, i) => {
    const data = CHAPTER_DATA[ch];
    const totalCount = (data?.fs?.length || 0) + (data?.pyq?.length || 0);
    return `
      <div class="proto-chapter ${i === 0 ? 'active' : ''}" data-ch="${ch}">
        <span>${ch}</span>
        <span>${totalCount}</span>
      </div>
    `;
  }).join("");

  list.querySelectorAll('.proto-chapter').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.proto-chapter').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      selectLandingChapter(el.getAttribute('data-ch'));
    });
  });

  if (ORDER.length > 0) selectLandingChapter(ORDER[0]);
}

function selectLandingChapter(chName) {
  const titleEl = document.getElementById("videoTitle");
  const subEl = document.getElementById("videoSubInfo");
  const iframe = document.getElementById("protoIframe");
  const playBtn = document.getElementById("protoPlayBtn");

  if (titleEl) titleEl.textContent = `${chName} — Concept Masterclass`;

  const data = CHAPTER_DATA[chName];
  const firstVideo = (data?.fs && data.fs[0]) || (data?.pyq && data.pyq[0]);

  if (firstVideo && firstVideo.url) {
    const match = firstVideo.url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?]+)/);
    const videoId = match ? match[1] : null;

    if (subEl) subEl.textContent = `${firstVideo.title} · ${firstVideo.duration || 'Watch Lecture'}`;

    if (videoId && playBtn && iframe) {
      playBtn.style.display = 'grid';
      iframe.style.display = 'none';
      iframe.src = '';

      playBtn.onclick = () => {
        playBtn.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      };
    }
  } else {
    if (subEl) subEl.textContent = "Explore complete curriculum in the student workspace.";
    if (playBtn) playBtn.style.display = 'grid';
    if (iframe) iframe.style.display = 'none';
  }
}

// Global helpers for inline prototypes
window.scrollToLandingSection = function(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

window.openProtoCheckout = function(name, price) {
  document.getElementById("buyTitle").textContent = name;
  document.getElementById("buyPrice").textContent = `${price} · One-time payment`;
  document.getElementById("payAmount").textContent = price;
  document.getElementById("checkoutContent").style.display = "block";
  document.getElementById("checkoutSuccess").classList.remove("show");
  document.getElementById("protoCheckoutModal").classList.add("open");
};

window.closeProtoCheckout = function() {
  document.getElementById("protoCheckoutModal").classList.remove("open");
};

window.processProtoPay = function() {
  document.getElementById("checkoutContent").style.display = "none";
  document.getElementById("checkoutSuccess").classList.add("show");
};

// Smooth cursor
const cursor = document.getElementById("cursor");
if (cursor) {
  document.addEventListener("mousemove", e => {
    cursor.style.left = `${e.clientX - 7}px`;
    cursor.style.top = `${e.clientY - 7}px`;
  });
}

// Search filter in prototype
document.getElementById("protoSearch")?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll(".proto-chapter").forEach(ch => {
    const match = ch.textContent.toLowerCase().includes(query);
    ch.style.display = match ? "flex" : "none";
  });
});

// ---- Boot Sequence & Auth Management ----
(async function boot() {
  initAuthForm();
  wireStudentControls();
  await loadAndMergeCustomLectures();

  renderPrototypeCourses();
  renderLandingLibrary();

  const landingLoginBtn = document.getElementById('landingLoginBtn');
  landingLoginBtn?.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
      document.getElementById('landingView').style.display = 'none';
      document.getElementById('appShell').style.display = 'block';
      showSection('dashboard');
    } else {
      showAuthOverlay();
    }
  });

  document.getElementById('closeAuthBtn')?.addEventListener('click', hideAuthOverlay);

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initAllVideosGrid);
  } else {
    setTimeout(initAllVideosGrid, 500);
  }
})();

initYtFeed();

onAuthStateChanged(auth, async (user) => {
  const landingLoginBtn = document.getElementById('landingLoginBtn');
  if (user) {
    if (landingLoginBtn) landingLoginBtn.textContent = 'Open Dashboard';
    
    // Switch to active workspace
    document.getElementById('landingView').style.display = 'none';
    document.getElementById('appShell').style.display = 'block';
    hideAuthOverlay();

    await startStudentSession(user);
    loadLatestUpdatePreview();
    checkIsAdmin(user.uid);
    initOnboarding();

    // Sync live card in landing hero
    const myData = getMyData();
    const whoamiName = document.getElementById('whoamiBarName');
    if (whoamiName) whoamiName.textContent = myData.displayName || user.email?.split('@')[0] || 'Student';
  } else {
    if (landingLoginBtn) landingLoginBtn.textContent = 'Student Login';
    document.getElementById('appShell').style.display = 'none';
    document.getElementById('landingView').style.display = 'block';
  }
});
