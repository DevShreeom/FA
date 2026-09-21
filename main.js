// main.js - Drives the exact prototype UI and seamlessly hooks into real YouTube & Firebase logic

import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initAuthForm } from './auth.js';
import { ORDER, CHAPTER_DATA } from './data.js';

// ---- Prototype Courses Data ----
const courses = [
  ["Limits Mastery", "POCKET", "₹249", "8 lessons · 1h 42m", "∫"],
  ["Matrices: Core → Advanced", "ADVANCED", "₹699", "24 lessons · 7h 10m", "Σ"],
  ["JEE Main Maths Sprint", "MAIN", "₹299", "12 lessons · 3h 20m", "M"],
  ["Calculus Revision Lab", "REVISION", "₹399", "10 lessons · 2h 40m", "R"],
  ["Advanced Problem Vault", "ADVANCED", "₹799", "18 lessons · 5h 35m", "A"],
  ["Coordinate Geometry Bootcamp", "MAIN", "₹599", "21 lessons · 6h 05m", "C"],
  ["Factorial Originals · Vol. 01", "ORIGINAL", "₹349", "50 problems · solutions", "F"],
  ["Homework Accelerator", "POCKET", "₹199", "30-day guided practice", "H"]
];

function renderCourses() {
  const grid = document.getElementById("courseGrid");
  if (!grid) return;
  grid.innerHTML = courses.map((c, i) => `
    <article class="course">
      <div class="cover ${i % 3 === 1 ? 'light' : ''}">
        <span class="tag">${c[1]}</span>
        <span style="font:48px Georgia, serif; opacity:.85">${c[4]}</span>
      </div>
      <div class="courseBody">
        <h3>${c[0]}</h3>
        <div class="meta"><span>${c[3]}</span><span>Demo</span></div>
        <div class="price">${c[2]}</div>
        <button onclick="checkout('${c[0]}','${c[2]}')">View course & checkout →</button>
      </div>
    </article>
  `).join("");
}

// ---- Render Chapters from data.js ----
function renderChapters() {
  const list = document.getElementById("chapterList");
  if (!list) return;

  list.innerHTML = ORDER.map((c, i) => {
    const data = CHAPTER_DATA[c];
    const count = (data?.fs?.length || 0) + (data?.pyq?.length || 0);
    return `
      <div class="chapter ${i === 0 ? 'active' : ''}" data-name="${c}">
        <span>${c}</span>
        <span>${count}</span>
      </div>
    `;
  }).join("");

  list.querySelectorAll('.chapter').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.chapter').forEach(x => x.classList.remove('active'));
      el.classList.add('active');
      const name = el.getAttribute('data-name');
      pickChapter(name);
    });
  });

  if (ORDER.length > 0) pickChapter(ORDER[0]);
}

function pickChapter(name) {
  const titleEl = document.getElementById("videoTitle");
  const subEl = document.getElementById("videoSub");
  const iframe = document.getElementById("videoIframe");
  const playBtn = document.getElementById("mainPlayBtn");
  const screenLabel = document.getElementById("screenLabelText");

  if (titleEl) titleEl.textContent = name + " — Complete Concept Revision";

  const data = CHAPTER_DATA[name];
  const firstVideo = (data?.fs && data.fs[0]) || (data?.pyq && data.pyq[0]);

  if (firstVideo && firstVideo.url) {
    const match = firstVideo.url.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?]+)/);
    const videoId = match ? match[1] : null;

    if (subEl) subEl.textContent = `Factorial Academy · ${firstVideo.title}`;

    if (videoId && playBtn && iframe) {
      playBtn.style.display = "block";
      iframe.style.display = "none";
      iframe.src = "";

      playBtn.onclick = () => {
        playBtn.style.display = "none";
        if (screenLabel) screenLabel.style.display = "none";
        iframe.style.display = "block";
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      };
    }
  } else {
    if (playBtn) playBtn.onclick = () => alert("Explore more chapters from the Factorial Academy library.");
  }
}

// Global Prototype Functions attached to window
window.scrollToId = function(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

window.checkout = function(name, price) {
  document.getElementById("buyTitle").textContent = name;
  document.getElementById("buyPrice").textContent = price + " · One-time payment";
  document.getElementById("payAmount").textContent = price;
  document.getElementById("checkoutContent").style.display = "block";
  document.getElementById("success").classList.remove("show");
  document.getElementById("modal").classList.add("open");
};

window.closeModal = function() {
  document.getElementById("modal").classList.remove("open");
};

window.pay = function() {
  document.getElementById("checkoutContent").style.display = "none";
  document.getElementById("success").classList.add("show");
};

// Cursor follower
document.addEventListener("mousemove", e => {
  const c = document.getElementById("cursor");
  if (c) {
    c.style.left = (e.clientX - 7) + "px";
    c.style.top = (e.clientY - 7) + "px";
  }
});

// Search filter across chapters
document.getElementById("protoSearch")?.addEventListener("input", e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#chapterList .chapter").forEach(ch => {
    const text = ch.textContent.toLowerCase();
    ch.style.display = text.includes(term) ? "flex" : "none";
  });
});

// ---- Authentication Overlay Hooks ----
const authOverlay = document.getElementById('authOverlay');
const loginNavBtn = document.getElementById('loginNavBtn');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');

loginNavBtn?.addEventListener('click', () => {
  if (authOverlay) authOverlay.style.display = 'flex';
});

closeAuthModalBtn?.addEventListener('click', () => {
  if (authOverlay) authOverlay.style.display = 'none';
});

// Boot
initAuthForm();
renderCourses();
renderChapters();

onAuthStateChanged(auth, user => {
  if (user) {
    if (loginNavBtn) {
      loginNavBtn.textContent = 'Account: ' + (user.displayName || user.email.split('@')[0]);
      loginNavBtn.onclick = () => {
        alert("Logged in as " + (user.displayName || user.email));
      };
    }
    const cardStatus = document.getElementById('heroCardStatus');
    if (cardStatus) cardStatus.textContent = 'LOGGED IN · ACTIVE';
  } else {
    if (loginNavBtn) {
      loginNavBtn.textContent = 'Student Login';
      loginNavBtn.onclick = () => {
        if (authOverlay) authOverlay.style.display = 'flex';
      };
    }
  }
});
