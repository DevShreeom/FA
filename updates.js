// updates.js - a simple announcements feed. Admins post, everyone sees.
// Stored as one doc (updates/feed) with a growing array.

import { db } from './firebase.js';
// Notice we added arrayRemove to the import list below:
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getCurrentUser } from './studentView.js';
import { checkIsAdmin } from './adminCheck.js';

async function fetchPosts(){
  try {
    const snap = await getDoc(doc(db, 'updates', 'feed'));
    return snap.exists() ? (snap.data().posts || []) : [];
  } catch(e){ return []; }
}

// We updated this function to check if the user is an admin
function renderPost(p, isAdmin){
  const dt = new Date(p.postedAt).toLocaleString();
  let html = `<div class="update-post" style="position: relative;">
                <div class="update-date">${dt}</div>
                <div class="update-text">${p.text}</div>`;
                
  if (isAdmin) {
    // We safely attach the exact post data to the button so Firebase knows which one to delete
    const safePostData = JSON.stringify(p).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    html += `<button class="delete-post-btn" data-post="${safePostData}" style="position: absolute; top: 10px; right: 10px; padding: 4px 8px; font-size: 0.8rem; background: var(--surface-2); color: var(--text-dim); border: none; border-radius: 4px; cursor: pointer;">Delete</button>`;
  }
  
  html += `</div>`;
  return html;
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
  
  // Pass the isAdmin status into the render function
  html += posts.length ? posts.map(p => renderPost(p, isAdmin)).join('') : '<div class="empty-note">No updates posted yet.</div>';
  container.innerHTML = html;

  if (isAdmin){
    // 1. Post logic (unchanged)
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

    // 2. NEW: Delete logic
    document.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        // Add a quick safety check so admins don't accidentally click it
        if (!confirm("Are you sure you want to delete this update?")) return;

        const postObj = JSON.parse(e.target.dataset.post);
        try {
          // Tell Firebase to look through the array and remove this exact object
          await setDoc(doc(db, 'updates', 'feed'), {
            posts: arrayRemove(postObj) 
          }, { merge: true });
          
          loadUpdatesPage(); // Refresh the list
        } catch(error) {
          alert('Could not delete update - check your connection.');
        }
      });
    });
  }
}

export async function loadLatestUpdatePreview(){
  const el = document.getElementById('latestUpdatePreview');
  if (!el) return;
  const posts = await fetchPosts();
  if (posts.length === 0){ el.innerHTML = '<div class="empty-note">No updates yet.</div>'; return; }
  
  // We pass 'false' here because we don't want the delete button showing up on the main dashboard preview widget
  el.innerHTML = renderPost(posts[posts.length - 1], false);
}
