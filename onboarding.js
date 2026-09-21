// onboarding.js — first-visit welcome + name capture, a short guided tour,
// the static roadmap list on the About page, and the progress certificate.
// Everything here is additive: it never blocks the app if an element is
// missing, and it never touches the core tracking logic in studentView.js.

import { db } from './firebase.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getCurrentUser, getMyData } from './studentView.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const TI = (d) => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/* ---------------- guided tour ---------------- */
const TOUR = [
  { welcome: true, title: 'Welcome to Factorial Academy', text: 'A quick look around before you dive in. What should we call you?' },
  { sel: '.nav-btn[data-section="dashboard"]', title: 'Your dashboard', text: 'Continue watching, today\u2019s question and the latest update all live here.', icon: TI('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>') },
  { sel: '.nav-btn[data-section="library"]', title: 'The full library', text: 'Every chapter and lecture — tick off Theory and PYQ videos as you finish them.', icon: TI('<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>') },
  { sel: '.nav-btn[data-section="qotd"]', title: 'Question of the Day', text: 'One sharp problem every day — answer it to keep your streak going.', icon: TI('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>') },
  { sel: '.nav-btn[data-section="leaderboard"]', title: 'Leaderboard', text: 'See how your progress stacks up against the rest of the class.', icon: TI('<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>') },
  { sel: '#dockSettingsBtn', title: 'Settings, any time', text: 'Change your display name, theme and target grade here whenever you like.', icon: TI('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 15.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9.09a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10.6 3V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>') }
];
let tourI = 0;
let uid = null;

function seenKey(){ return 'fa_onboard_seen_' + (uid || 'anon'); }
function $(id){ return document.getElementById(id); }

function saveDisplayName(name){
  const data = getMyData();
  data.displayName = name;
  const nameEl = $('whoamiName'); if (nameEl) nameEl.textContent = name;
  const avatarEl = $('avatarLetter'); if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  const user = getCurrentUser();
  if (user) {
    setDoc(doc(db, 'students', user.uid), { displayName: name, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
  }
}

function tourDots(){
  const wrap = $('tourDots'); if (!wrap) return;
  wrap.innerHTML = TOUR.map((_, i) => `<span class="tour-dot${i === tourI ? ' on' : ''}"></span>`).join('');
}
function tourCaptureName(){
  if (TOUR[tourI] && TOUR[tourI].welcome) {
    const v = ($('tourNameInput').value || '').trim();
    if (v) saveDisplayName(v.slice(0, 40));
  }
}
function tourReveal(){
  requestAnimationFrame(() => { $('tourOverlay').classList.add('on'); $('tourCard').classList.add('in'); });
}
function tourPosition(){
  const step = TOUR[tourI];
  const card = $('tourCard'), arrow = $('tourArrow'), nameIn = $('tourNameInput');
  document.querySelectorAll('.tour-target').forEach((x) => x.classList.remove('tour-target'));
  card.classList.remove('in');
  tourDots();
  $('tourText').textContent = step.text;
  $('tourNext').textContent = step.welcome ? 'Let\u2019s go' : (tourI === TOUR.length - 1 ? 'Done' : 'Next');
  $('tourSkip').textContent = step.welcome ? 'Skip tour' : 'Skip';

  if (step.welcome) {
    card.classList.add('welcome');
    arrow.style.display = 'none';
    const user = getCurrentUser();
    const fallback = user && user.email ? user.email.split('@')[0] : '';
    $('tourBadge').innerHTML = `<img src="logot.png" alt="">`;
    $('tourTitle').textContent = step.title;
    nameIn.style.display = 'block';
    nameIn.value = getMyData().displayName || fallback || '';
    card.style.top = '50%'; card.style.left = '50%';
    card.style.transform = 'translate(-50%,-50%)';
    tourReveal();
    setTimeout(() => nameIn.focus(), 320);
    return;
  }

  card.classList.remove('welcome');
  nameIn.style.display = 'none';
  card.style.transform = 'none';
  $('tourBadge').innerHTML = step.icon || '';
  $('tourTitle').textContent = step.title;
  const el = document.querySelector(step.sel);
  if (!el) { tourNext(); return; }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    el.classList.add('tour-target');
    const r = el.getBoundingClientRect();
    const cardW = Math.min(320, window.innerWidth * 0.88), cardH = card.offsetHeight || 190;
    const spaceBelow = window.innerHeight - r.bottom, spaceAbove = r.top;
    let top, below;
    if (spaceBelow >= cardH + 26 || spaceBelow >= spaceAbove) { top = r.bottom + 18; below = true; }
    else { top = r.top - cardH - 18; below = false; }
    top = Math.min(window.innerHeight - cardH - 12, Math.max(12, top));
    const left = Math.min(window.innerWidth - cardW - 12, Math.max(12, r.left + r.width / 2 - cardW / 2));
    card.style.top = top + 'px'; card.style.left = left + 'px';
    arrow.style.display = 'block';
    arrow.className = 'tour-arrow ' + (below ? 'top' : 'bottom');
    arrow.style.top = (below ? top - 7 : top + cardH - 7) + 'px';
    arrow.style.left = Math.min(left + cardW - 28, Math.max(left + 14, r.left + r.width / 2 - 7)) + 'px';
    tourReveal();
  }, 260);
}
function tourStart(){
  tourI = 0;
  const ov = $('tourOverlay'); if (!ov) return;
  ov.style.display = 'block'; ov.classList.remove('on');
  tourPosition();
}
function tourEnd(){
  tourCaptureName();
  const ov = $('tourOverlay');
  if (ov) { ov.classList.remove('on'); $('tourCard').classList.remove('in'); setTimeout(() => { ov.style.display = 'none'; }, 220); }
  document.querySelectorAll('.tour-target').forEach((x) => x.classList.remove('tour-target'));
  localStorage.setItem(seenKey(), '1');
}
function tourNext(){
  tourCaptureName();
  tourI++;
  if (tourI >= TOUR.length) { tourEnd(); return; }
  tourPosition();
}
function wireTourControls(){
  $('tourNext')?.addEventListener('click', tourNext);
  $('tourSkip')?.addEventListener('click', tourEnd);
  $('tourDim')?.addEventListener('click', tourEnd);
  $('tourNameInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); tourNext(); } });
}
function wireRetake(){
  $('retakeTourBtn')?.addEventListener('click', () => {
    const overlay = $('modalOverlay'), settingsModal = $('settingsModal');
    if (overlay) overlay.style.display = 'none';
    if (settingsModal) settingsModal.style.display = 'none';
    setTimeout(tourStart, 150);
  });
}

/* ---------------- roadmap (About page) ---------------- */
const ROADMAP = [
  { t: 'A proper installable app', s: 'This update adds the install prompt and offline page on Android and desktop — a native app wrapper is the natural next step.', tag: 'In progress' },
  { t: 'Personal weekly digest', s: 'A short email or Telegram summary of the week\u2019s progress, opt-in only.', tag: 'Idea' },
  { t: 'Chapter-wise leaderboard', s: 'See who\u2019s ahead on a specific chapter, not just the overall count.', tag: 'Considering' },
  { t: 'Notes export', s: 'Download your timestamped notes as one PDF per chapter.', tag: 'Considering' },
  { t: 'A second certificate style', s: 'A dark, minimal alternative to the current certificate design.', tag: 'Idea' }
];
function renderRoadmap(){
  const el = $('roadmapList'); if (!el) return;
  el.innerHTML = ROADMAP.map((r) => `<div class="road-item"><div style="flex:1"><b>${esc(r.t)}</b><span>${esc(r.s)}</span></div><span class="road-tag">${esc(r.tag)}</span></div>`).join('');
}
export function openRoadmap(){
  if (window.showSection) window.showSection('about');
  setTimeout(() => { $('roadmapCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
}

/* ---------------- certificate ---------------- */
function drawCertificate(){
  const cv = $('certCanvas'); if (!cv) return;
  const name = ($('certName').value || '').trim() || 'A dedicated student';
  const overall = ($('statOverallNum')?.textContent || '0%').trim();
  const theory = ($('statTheoryNum')?.textContent || '0/0').trim();
  const pyq = ($('statPyqNum')?.textContent || '0/0').trim();
  const g = cv.getContext('2d'), W = cv.width, H = cv.height;
  const INK = '#1B1B1D', DIM = '#6B6B70', ACCENT = '#6750A4';
  g.fillStyle = '#F7F5FA'; g.fillRect(0, 0, W, H);
  g.strokeStyle = ACCENT; g.lineWidth = 10; g.strokeRect(24, 24, W - 48, H - 48);
  g.strokeStyle = INK; g.lineWidth = 1.5; g.strokeRect(44, 44, W - 88, H - 88);
  g.textAlign = 'center';
  g.font = '700 26px Sora, Inter, sans-serif'; g.fillStyle = INK; g.fillText('FACTORIAL ACADEMY', W / 2, 150);
  g.font = '800 44px Sora, Inter, sans-serif'; g.fillStyle = ACCENT; g.fillText('CERTIFICATE OF PROGRESS', W / 2, 218);
  g.font = '400 20px Inter, sans-serif'; g.fillStyle = DIM; g.fillText('JEE Preparation & Tracking', W / 2, 254);
  g.font = '400 20px Inter, sans-serif'; g.fillStyle = DIM; g.fillText('This certifies that', W / 2, 352);
  g.font = '700 50px Sora, Inter, sans-serif'; g.fillStyle = INK; g.fillText(name, W / 2, 422);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(W / 2 - 220, 444); g.lineTo(W / 2 + 220, 444); g.stroke();
  g.font = '400 22px Inter, sans-serif'; g.fillStyle = DIM;
  g.fillText(`has completed ${overall} of the tracked JEE syllabus on Factorial Academy`, W / 2, 500);
  g.font = '600 20px Inter, sans-serif'; g.fillStyle = INK;
  g.fillText(`Theory ${theory}    \u00b7    PYQ ${pyq}`, W / 2, 538);
  const dt = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  g.font = '400 18px Inter, sans-serif'; g.fillStyle = DIM; g.fillText(dt, W / 2, H - 110);
  g.textAlign = 'left'; g.font = '700 18px Sora, Inter, sans-serif'; g.fillStyle = INK; g.fillText('Factorial Academy', 90, H - 70);
  g.textAlign = 'right'; g.font = '400 16px Inter, sans-serif'; g.fillStyle = DIM; g.fillText('factorialacademy.com', W - 90, H - 70);
}
function wireCertificate(){
  const btn = $('certBtn'), modal = $('certModal'), overlay = $('modalOverlay');
  if (!btn || !modal || !overlay) return;
  btn.addEventListener('click', () => {
    $('certName').value = getMyData().displayName || '';
    overlay.style.display = 'flex';
    modal.style.display = 'block';
    if ($('settingsModal')) $('settingsModal').style.display = 'none';
    if ($('studentCardModal')) $('studentCardModal').style.display = 'none';
    drawCertificate();
  });
  const close = () => { overlay.style.display = 'none'; modal.style.display = 'none'; };
  $('certCloseBtn')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay && modal.style.display === 'block') close(); });
  $('certName')?.addEventListener('input', drawCertificate);
  $('certPngBtn')?.addEventListener('click', () => {
    cvToPng();
  });
  $('certPrintBtn')?.addEventListener('click', () => {
    const url = $('certCanvas').toDataURL('image/png');
    const w = window.open('', '_blank'); if (!w) return;
    w.document.write(`<title>Certificate</title><body style="margin:0"><img src="${url}" style="width:100%" onload="setTimeout(()=>window.print(),200)"></body>`);
    w.document.close();
  });
}
function cvToPng(){
  const cv = $('certCanvas');
  cv.toBlob((b) => {
    if (!b) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'factorial-academy-certificate.png';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
}

/* ---------------- boot ---------------- */
export function initOnboarding(){
  const user = getCurrentUser();
  uid = user ? user.uid : null;
  wireTourControls();
  wireRetake();
  wireCertificate();
  renderRoadmap();
  const data = getMyData();
  const already = localStorage.getItem(seenKey());
  if (!data.displayName && !already) {
    setTimeout(tourStart, 900);
  }
}
