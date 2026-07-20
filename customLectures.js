// customLectures.js — lets admins add a missing lecture link without a code deploy.
// Extra lectures live in Firestore ('customLectures' collection, one doc per chapter)
// and get pushed into CHAPTER_DATA's arrays once at startup — every other file
// (metrics, leaderboard, teacherView, studentView, qotd) reads CHAPTER_DATA already,
// so this merge is invisible to them; no other file needs to change.

import { db } from './firebase.js';
import { doc, setDoc, getDocs, collection, arrayUnion } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ORDER, CHAPTER_DATA } from './data.js';

function slugify(ch){ return ch.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 80); }

export async function loadAndMergeCustomLectures(){
  try {
    const snaps = await getDocs(collection(db, 'customLectures'));
    const bySlug = {};
    ORDER.forEach(ch => { bySlug[slugify(ch)] = ch; });
    snaps.forEach(s => {
      const ch = bySlug[s.id];
      if (!ch) return;
      const d = s.data();
      (d.fs || []).forEach(item => CHAPTER_DATA[ch].fs.push(item));
      (d.pyq || []).forEach(item => CHAPTER_DATA[ch].pyq.push(item));
    });
  } catch(e){ /* fine — just means no extra lectures loaded this session */ }
}

export async function addCustomLecture(chapter, kind, item){
  const ref = doc(db, 'customLectures', slugify(chapter));
  await setDoc(ref, { [kind]: arrayUnion(item) }, { merge: true });
  CHAPTER_DATA[chapter][kind].push(item); // reflect immediately without a reload
}
