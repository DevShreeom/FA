// auth.js - handles the login/signup form. Talks to Firebase Auth only.

import { auth, FAKE_EMAIL_DOMAIN } from './firebase.js';
import {
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,      // <--- Added for Google Login
  signInWithPopup          // <--- Added for Google Login
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

let authMode = 'login';

function usernameToEmail(u){
  return u.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '') + '@' + FAKE_EMAIL_DOMAIN;
}

export function showAuthOverlay(){
  document.getElementById('authOverlay').style.display = 'block';
  const sv = document.getElementById('studentView');
  if(sv) sv.style.display = 'none';
}

export function hideAuthOverlay(){
  document.getElementById('authOverlay').style.display = 'none';
}

export function initAuthForm(){
  document.getElementById('tabLogin').addEventListener('click', () => {
    authMode = 'login';
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('tabSignup').classList.remove('active');
    document.getElementById('authTitle').textContent = 'Log in';
    document.getElementById('authSub').textContent = 'Enter your username and password to continue tracking.';
    document.getElementById('authSubmit').textContent = 'Log in';
    document.getElementById('authPassword').setAttribute('autocomplete', 'current-password');
    document.getElementById('authError').textContent = '';
  });

  document.getElementById('tabSignup').addEventListener('click', () => {
    authMode = 'signup';
    document.getElementById('tabSignup').classList.add('active');
    document.getElementById('tabLogin').classList.remove('active');
    document.getElementById('authTitle').textContent = 'Create account';
    document.getElementById('authSub').textContent = 'Pick a username and password. Remember it - there is no recovery yet.';
    document.getElementById('authSubmit').textContent = 'Create account';
    document.getElementById('authPassword').setAttribute('autocomplete', 'new-password');
    document.getElementById('authError').textContent = '';
  });

  document.getElementById('authSubmit').addEventListener('click', async () => {
    const uname = document.getElementById('authUsername').value.trim();
    const pass = document.getElementById('authPassword').value;
    const errEl = document.getElementById('authError');
    errEl.textContent = '';
    if (!uname || uname.length < 3){ errEl.textContent = 'Username must be at least 3 characters.'; return; }
    if (!pass || pass.length < 6){ errEl.textContent = 'Password must be at least 6 characters.'; return; }
    const email = usernameToEmail(uname);
    try {
      if (authMode === 'signup'){
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch(e){
      if (e.code === 'auth/email-already-in-use') errEl.textContent = 'That username is taken. Try logging in instead.';
      else if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') errEl.textContent = 'Wrong username or password.';
      else if (e.code === 'auth/user-not-found') errEl.textContent = 'No account with that username. Try creating one.';
      else if (e.code === 'auth/weak-password') errEl.textContent = 'Password too weak - use at least 6 characters.';
      else errEl.textContent = 'Something went wrong: ' + e.code;
    }
  });

  document.getElementById('authPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('authSubmit').click();
  });

  // --- NEW GOOGLE LOGIN LOGIC ---
  const googleBtn = document.getElementById('authGoogleBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        // On success, main.js's onAuthStateChanged takes over automatically!
      } catch(e) {
        document.getElementById('authError').textContent = 'Google sign-in failed: ' + e.message;
      }
    });
  }

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await signOut(auth);
  });
}
