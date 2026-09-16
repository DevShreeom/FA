// index.js - Cloud Functions: computes class stats server-side and stores
// one small doc (stats/summary) so the client never has to scan all `students`.

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { ORDER, CHAPTER_DATA as RAW_CHAPTER_DATA } from "./data.js";
import { idFor } from "./metrics.js";

initializeApp();
const db = getFirestore();

function slugify(ch){ return ch.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 80); }
function isDone(v){ return v === 'done' || v === true; }
function totalForChapter(chData){ return chData.fs.length + chData.pyq.length; }
function computeTotalAll(data){ let t = 0; ORDER.forEach(ch => { t += totalForChapter(data[ch]); }); return t; }

function studentDoneCount(s, data){
  let n = 0;
  ORDER.forEach(ch => {
    data[ch].fs.forEach(it => { if (s.theory && isDone(s.theory[idFor(it.url)])) n++; });
    data[ch].pyq.forEach(it => { if (s.pyq && isDone(s.pyq[idFor(it.url)])) n++; });
  });
  return n;
}

function chapterCompletionAcrossClass(students, data){
  const total = students.length || 1;
  return ORDER.map(ch => {
    const chTotal = totalForChapter(data[ch]);
    let sumPct = 0;
    students.forEach(s => {
      let done = 0;
      data[ch].fs.forEach(it => { if (s.theory && isDone(s.theory[idFor(it.url)])) done++; });
      data[ch].pyq.forEach(it => { if (s.pyq && isDone(s.pyq[idFor(it.url)])) done++; });
      sumPct += chTotal ? (done / chTotal) : 0;
    });
    return { chapter: ch, avgPct: Math.round((sumPct / total) * 100) };
  });
}

async function computeAndStore(){
  // Clone the static data every run - never mutate the shared imported object,
  // since warm function instances reuse the same module across invocations.
  const data = JSON.parse(JSON.stringify(RAW_CHAPTER_DATA));

  // Merge admin-added lectures the same way customLectures.js does on the client.
  const bySlug = {};
  ORDER.forEach(ch => { bySlug[slugify(ch)] = ch; });
  const customSnaps = await db.collection('customLectures').get();
  customSnaps.forEach(d => {
    const ch = bySlug[d.id];
    if (!ch) return;
    const c = d.data();
    (c.fs || []).forEach(item => data[ch].fs.push(item));
    (c.pyq || []).forEach(item => data[ch].pyq.push(item));
  });

  const studentSnaps = await db.collection('students').get();
  const students = [];
  studentSnaps.forEach(s => students.push(s.data()));

  if (students.length === 0){
    await db.doc('stats/summary').set({
      studentsCount: 0, avgPct: 0, avgSc: 0, heat: [], updatedAt: new Date().toISOString()
    });
    return;
  }

  const total = computeTotalAll(data);
  const rows = students.map(s => {
    const done = studentDoneCount(s, data);
    const pct = total ? Math.round(done / total * 100) : 0;
    let scCount = 0;
    if (s.selfcheck) Object.values(s.selfcheck).forEach(v => { if (v) scCount++; });
    return { pct, scCount };
  });

  const avgPct = Math.round(rows.reduce((a, r) => a + r.pct, 0) / rows.length);
  const avgSc = Math.round(rows.reduce((a, r) => a + r.scCount, 0) / rows.length);
  const heat = chapterCompletionAcrossClass(students, data).sort((a, b) => a.avgPct - b.avgPct);

  await db.doc('stats/summary').set({
    studentsCount: students.length,
    avgPct, avgSc, heat,
    updatedAt: new Date().toISOString()
  });
}

// Runs automatically every 30 minutes - this is what keeps ongoing reads low.
export const recomputeClassStats = onSchedule("every 30 minutes", async () => {
  await computeAndStore();
});

// Manual trigger for admins, so you don't have to wait up to 30 min for the
// first doc to exist. Call from the client with httpsCallable(functions,'recomputeNow').
// ASSUMPTION: admin status is stored in an `admins/{uid}` collection - adjust the
// check below if your adminCheck.js uses a different scheme.
export const recomputeNow = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in required.');
  const adminDoc = await db.doc(`admins/${request.auth.uid}`).get();
  if (!adminDoc.exists) throw new HttpsError('permission-denied', 'Admin only.');
  await computeAndStore();
  return { ok: true };
});
