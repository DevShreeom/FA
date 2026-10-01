// portal.js — Factorial Academy Focus Video Portal
// Frontend-only: uses the existing YouTube API wrapper and local cache.
// The portal keeps the latest upload in focus and lets students browse the synced uploads
// without leaving the site.

import { fetchChannelUploads, fetchVideoDetails, YTError } from './ytApi.js';

const CACHE_KEY = 'fa_focus_portal_v2';
const CACHE_TTL = 12 * 60 * 60 * 1000;

const state = {
  videos: [],
  active: 0,
  syncing: false
};

const $ = (id) => document.getElementById(id);

function esc(s='') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function fmtDate(ts) {
  if (!ts) return '';
  return new Intl.DateTimeFormat(undefined, { day:'numeric', month:'short', year:'numeric' }).format(new Date(ts));
}

function loadCache() {
  try {
    const x = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return x && Array.isArray(x.videos) ? x : null;
  } catch { return null; }
}

function saveCache(videos) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), videos }));
  } catch {}
}

function normalize(v) {
  return {
    id: v.id,
    title: v.title || 'Untitled lecture',
    description: v.description || '',
    duration: Number(v.duration || 0),
    publishedAt: Number(v.publishedAt || 0)
  };
}

function dedupe(videos) {
  const seen = new Set();
  return videos
    .filter(v => v && v.id && !seen.has(v.id) && seen.add(v.id))
    .sort((a,b) => (b.publishedAt || 0) - (a.publishedAt || 0));
}

function durationText(sec) {
  if (!sec) return '';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`;
}

function embedUrl(id) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&enablejsapi=1`;
}

function setStatus(text, live=false) {
  const el = $('portalSyncStatus');
  if (!el) return;
  el.innerHTML = `${live ? '<span class="portal-live-dot"></span>' : ''}${esc(text)}`;
}

function renderQueue() {
  const list = $('portalQueue');
  const count = $('portalCount');
  if (!list) return;

  if (count) count.textContent = `${state.videos.length.toLocaleString()} videos synced`;

  list.innerHTML = state.videos.slice(0, 80).map((v, i) => `
    <button class="portal-queue-item ${i === state.active ? 'is-active' : ''}" data-index="${i}">
      <span class="portal-queue-thumb">
        <img src="https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/mqdefault.jpg" alt="" loading="lazy">
        <span class="portal-queue-play">${i === state.active ? '▶' : (i+1)}</span>
      </span>
      <span class="portal-queue-copy">
        <strong>${esc(v.title)}</strong>
        <small>${esc(fmtDate(v.publishedAt))}${v.duration ? ` · ${esc(durationText(v.duration))}` : ''}</small>
      </span>
    </button>
  `).join('');

  list.querySelectorAll('.portal-queue-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.active = Number(btn.dataset.index);
      renderPlayer();
      renderQueue();
    });
  });
}

function renderPlayer() {
  const v = state.videos[state.active];
  if (!v) return;

  const frame = $('portalPlayerFrame');
  if (frame && frame.dataset.videoId !== v.id) {
    frame.dataset.videoId = v.id;
    frame.src = embedUrl(v.id);
  }

  const title = $('portalVideoTitle');
  const meta = $('portalVideoMeta');
  const desc = $('portalVideoDescription');

  if (title) title.textContent = v.title;
  if (meta) meta.textContent = `${fmtDate(v.publishedAt)}${v.duration ? `  •  ${durationText(v.duration)}` : ''}  •  Factorial Academy`;
  if (desc) desc.textContent = v.description ? v.description.slice(0, 220).replace(/\s+/g,' ').trim() + (v.description.length > 220 ? '…' : '') : 'Focused JEE preparation. No tabs, no feed, no wandering.';
}

function renderPortal() {
  renderPlayer();
  renderQueue();
}

async function syncVideos(full=false) {
  if (state.syncing) return;
  state.syncing = true;

  const btn = $('portalSyncBtn');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('is-syncing');
    btn.querySelector('.portal-sync-label').textContent = full ? 'Syncing library…' : 'Checking YouTube…';
  }
  setStatus(full ? 'Refreshing the complete uploads playlist…' : 'Checking for new uploads…');

  try {
    // Incremental checks are cheap and keep the latest video current.
    // A full scan is available from the portal when the local catalogue is stale/missing.
    const ids = await fetchChannelUploads({ fullScan: full });
    const details = await fetchVideoDetails(ids);
    const incoming = details.map(normalize);

    if (full || !state.videos.length) {
      state.videos = dedupe(incoming);
    } else {
      state.videos = dedupe([...incoming, ...state.videos]);
    }

    state.active = 0;
    saveCache(state.videos);
    renderPortal();

    const label = full ? 'Full library synced' : 'Live with YouTube';
    setStatus(`${label} · ${state.videos.length.toLocaleString()} videos`, true);
  } catch (err) {
    const cached = loadCache();
    if (cached?.videos?.length) {
      state.videos = dedupe(cached.videos.map(normalize));
      state.active = 0;
      renderPortal();
      setStatus(`Using saved library · YouTube sync unavailable right now`);
    } else {
      setStatus(err instanceof YTError ? err.message : 'Could not sync YouTube right now.');
      const empty = $('portalQueue');
      if (empty) empty.innerHTML = '<div class="portal-empty">Connect to the internet and tap sync to load the library.</div>';
    }
  } finally {
    state.syncing = false;
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('is-syncing');
      btn.querySelector('.portal-sync-label').textContent = 'Sync';
    }
  }
}

function wireControls() {
  $('portalSyncBtn')?.addEventListener('click', () => syncVideos(false));
  $('portalFullSyncBtn')?.addEventListener('click', () => syncVideos(true));

  $('portalPrevBtn')?.addEventListener('click', () => {
    if (!state.videos.length) return;
    state.active = Math.max(0, state.active - 1);
    renderPortal();
  });

  $('portalNextBtn')?.addEventListener('click', () => {
    if (!state.videos.length) return;
    state.active = Math.min(state.videos.length - 1, state.active + 1);
    renderPortal();
  });

  const search = $('portalSearch');
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.portal-queue-item').forEach(item => {
      item.hidden = q && !item.textContent.toLowerCase().includes(q);
    });
  });
}

export function initFocusPortal() {
  if (!$('focusVideoPortal')) return;

  const cached = loadCache();
  if (cached?.videos?.length) {
    state.videos = dedupe(cached.videos.map(normalize));
    renderPortal();
    setStatus(`${state.videos.length.toLocaleString()} videos cached · checking YouTube…`, true);
  }

  wireControls();

  // Always check recent uploads when the dashboard opens.
  syncVideos(false);

  // Full library refresh only when cache is missing/stale.
  const stale = !cached || !cached.savedAt || Date.now() - cached.savedAt > CACHE_TTL;
  if (stale && cached?.videos?.length) {
    // Let the incremental check finish first; users still see the cached portal immediately.
    setTimeout(() => syncVideos(true), 3500);
  } else if (!cached?.videos?.length) {
    setTimeout(() => syncVideos(true), 400);
  }
}
