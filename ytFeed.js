// ytFeed.js — YouTube feed widget on the dashboard.
// Owns the Sync button, video card rendering, and last-synced timestamp.
// ytApi.js stays pure — this module handles all UI state.

import { fetchChannelUploads, fetchVideoDetails, YTError } from './ytApi.js';
import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const LS_KEY      = 'fa_yt_feed_last';
const LS_FEED_KEY = 'fa_yt_feed_cache';
const SHOW_COUNT  = 8;

// ---- Public ----

/**
 * Wire up the YouTube feed card on the dashboard.
 * Call once after the DOM is ready.
 */
export function initYtFeed() {
  const btn       = document.getElementById('ytSyncBtn');
  const container = document.getElementById('ytFeedContainer');
  const status    = document.getElementById('ytSyncStatus');
  if (!btn || !container) return;

  // Restore cached feed from localStorage (instant, no API call)
  const cached = loadCache();
  if (cached.length) {
    const limited = cached.slice(0, SHOW_COUNT);
    renderFeed(container, limited, cached);
    updateStatus(status, cached);
  }

  btn.addEventListener('click', () => sync(container, status));
}

// ---- Sync ----

async function sync(container, status) {
  const btn   = document.getElementById('ytSyncBtn');
  const label = document.getElementById('ytSyncLabel');
  const icon  = document.getElementById('ytSyncIcon');
  if (!btn) return;

  // Spinner state
  btn.disabled = true;
  if (label) label.textContent = 'Syncing…';
  if (icon)  icon.style.animation = 'ytSyncSpin 0.8s linear infinite';

  try {
    const ids     = await fetchChannelUploads({ fullScan: false }); // last 2 pages only — fast
    const videos  = await fetchVideoDetails(ids.slice(0, 50));
    const limited = videos.slice(0, SHOW_COUNT);

    await routeQOTD(videos);

    saveCache(videos); // Save all 50 videos
    renderFeed(container, limited, videos);
    updateStatus(status, videos);
  } catch (err) {
    const msg = err instanceof YTError ? err.message : 'Sync failed. Check your connection.';
    if (container) container.innerHTML = `<p class="yt-feed-empty yt-feed-error">${msg}</p>`;
  } finally {
    btn.disabled = false;
    if (label) label.textContent = 'Sync';
    if (icon)  icon.style.animation = '';
  }
}

// ---- Render ----

function renderFeed(container, dashboardVideos, allVideos) {
  if (!dashboardVideos.length) {
    if (container) container.innerHTML = '<p class="yt-feed-empty">No videos found.</p>';
    return;
  }

  if (container) container.innerHTML = '';

  dashboardVideos.forEach(v => {
    const dur = v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '';
    
    // For Dashboard Widget (Horizontal Shelf)
    if (container) {
      const card = document.createElement('a');
      card.className = 'yt-video-card';
      card.href      = `https://www.youtube.com/watch?v=${v.id}`;
      card.target    = '_blank';
      card.rel       = 'noopener noreferrer';
      card.innerHTML = `
        <div class="yt-thumb-wrap">
          <img src="https://i.ytimg.com/vi/${v.id}/mqdefault.jpg" alt="" loading="lazy" referrerpolicy="no-referrer" class="yt-thumb">
          ${dur ? `<span class="yt-dur-badge">${dur}</span>` : ''}
        </div>
        <div class="yt-card-title">${escHtml(v.title)}</div>
      `;
      container.appendChild(card);
    }
  });
}

function updateStatus(statusEl, videos) {
  if (!statusEl) return;
  const now = Date.now();
  localStorage.setItem(LS_KEY, now);
  statusEl.textContent = `Last synced: just now · ${videos.length} videos`;
}

// ---- Cache (localStorage — no Firestore write needed for this) ----

function saveCache(videos) {
  try { localStorage.setItem(LS_FEED_KEY, JSON.stringify(videos)); } catch (_) {}
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem(LS_FEED_KEY) || '[]'); } catch (_) { return []; }
}

// ---- Util ----

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- QOTD Automation ----

async function routeQOTD(videos) {
  try {
    const qotdDocs = videos.filter(v => {
      const text = (v.title + ' ' + v.description + ' ' + (v.tags || []).join(' ')).toLowerCase();
      return text.includes('#questionoftheday') || text.includes('#qotd');
    }).map(v => ({
      title: v.title,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      duration: v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '',
      tags: v.tags || []
    }));

    if (!qotdDocs.length) return;

    const ref = doc(db, 'qotd', 'feed');
    const snap = await getDoc(ref);
    const existing = snap.exists() ? (snap.data().items || []) : [];
    
    const existingUrls = new Set(existing.map(e => e.url));
    const newItems = qotdDocs.filter(d => !existingUrls.has(d.url));
    
    if (newItems.length > 0) {
      await setDoc(ref, { items: [...existing, ...newItems] }, { merge: true });
    }
  } catch (e) { console.warn('QOTD route failed', e); }
}