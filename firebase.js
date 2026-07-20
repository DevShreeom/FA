// firebase.js - one shared Firebase connection used everywhere else.
// If you ever need to point this at a different Firebase project, this is the ONLY place to change it.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZmPc61LRxkgYalLyRyT-rRdkMswcAclg",
  authDomain: "factorial-acadamy.firebaseapp.com",
  projectId: "factorial-acadamy",
  storageBucket: "factorial-acadamy.firebasestorage.app",
  messagingSenderId: "189838287114",
  appId: "1:189838287114:web:bda2986d1079abda1d1af3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const FAKE_EMAIL_DOMAIN = "jee-tracker.local";
