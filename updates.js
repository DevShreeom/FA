// updates.js - a simple announcements feed. Admins post, everyone sees.
// Stored as one doc (updates/feed) with a growing array - fine at this scale.

import { db } from './firebase.js';
import { doc, getDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getCurrentUser } from './studentView.js';
import { checkIsAdmin } from './adminCheck.js';

async function fetchPosts(){
  try {
    const snap = await getDoc(doc(db, 'updates', 'feed'));
    return snap.exists() ? (snap.data().posts || []) : [];
  } catch(e){ return []; }
}

function renderPost(p){
  const dt = new Date(p.postedAt).toLocaleString();
  return `<div class="update-post"><div class="update-date">${dt}</div><div class="update-text">${p.text}</div></div>`;
}

export async function loadUpdatesPage(){
  const container = document.getElementById('updatesContent');
  if (!container) return;
  container.innerHTML = '<div class="loading">Loading updates...</div>';
  const user = getCurrentUser();
  const isAdmin = await checkIsAdmin(user ? user.uid : null);
  const posts = (await fetchPosts()).slice().reverse();

  let html = '';
  if (isAdmin){
    html += `
      <div class="update-composer">
        <textarea id="updateText" placeholder="Post an update for everyone..." rows="2"></textarea>
        <button id="postUpdateBtn">Post</button>
      </div>
    `;
  }
  html += posts.length ? posts.map(renderPost).join('') : '<div class="empty-note">No updates posted yet.</div>';
  container.innerHTML = html;

  if (isAdmin){
    document.getElementById('postUpdateBtn').addEventListener('click', async () => {
      const val = document.getElementById('updateText').value.trim();
      if (!val) return;
      try {
        await setDoc(doc(db, 'updates', 'feed'), {
          posts: arrayUnion({ text: val, postedAt: new Date().toISOString() })
        }, { merge: true });
        loadUpdatesPage();
      } catch(e){ alert('Could not post update - check your connection.'); }
    });
  }
}

export async function loadLatestUpdatePreview(){
  const el = document.getElementById('latestUpdatePreview');
  if (!el) return;
  const posts = await fetchPosts();
  if (posts.length === 0){ el.innerHTML = '<div class="empty-note">No updates yet.</div>'; return; }
  el.innerHTML = renderPost(posts[posts.length - 1]);
}
