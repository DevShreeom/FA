// main.js — the entry point. Wires up mode-switching and boots the app.
// Loaded as <script type="module" src="main.js"> from index.html.

import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { initAuthForm, showAuthOverlay, hideAuthOverlay } from './auth.js';
import { wireStudentControls, startStudentSession, getCurrentUser } from './studentView.js';
import { loadTeacherView } from './teacherView.js';

initAuthForm();
wireStudentControls();

document.getElementById('btnStudentMode').addEventListener('click', () => {
  document.getElementById('btnStudentMode').classList.add('active');
  document.getElementById('btnSirMode').classList.remove('active');
  document.getElementById('sirView').style.display = 'none';
  const user = getCurrentUser();
  if (user) startStudentSession(user); else showAuthOverlay();
});

document.getElementById('btnSirMode').addEventListener('click', () => {
  document.getElementById('btnSirMode').classList.add('active');
  document.getElementById('btnStudentMode').classList.remove('active');
  hideAuthOverlay();
  document.getElementById('studentView').style.display = 'none';
  document.getElementById('sirView').style.display = 'block';
  loadTeacherView();
});

onAuthStateChanged(auth, (user) => {
  if (user) startStudentSession(user);
  else showAuthOverlay();
});
