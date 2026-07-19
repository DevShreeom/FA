// leaderboard.js — computes Overall / Theory / PYQ rankings across all students.
// Flagged accounts are excluded entirely from rankings (they don't get to compete
// on suspicious data) but still show up in the teacher's full student table.

import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { computeTotalAll, totalTheory, totalPyq, studentTheoryDone, studentPyqDone, studentOverallDone } from './metrics.js';

export async function computeRankings(){
  const snaps = await getDocs(collection(db, 'students'));
  let flagMap = {};
  try {
    const flagSnaps = await getDocs(collection(db, 'flags'));
    flagSnaps.forEach(f => { flagMap[f.id] = f.data(); });
  } catch(e){ /* flags are optional */ }

  const total = computeTotalAll();
  const tTheory = totalTheory();
  const tPyq = totalPyq();

  const entries = [];
  snaps.forEach(s => {
    const data = s.data();
    const flagged = !!(flagMap[s.id] && flagMap[s.id].flagged);
    if (flagged) return; // excluded from all leaderboards
    const theoryDone = studentTheoryDone(data);
    const pyqDone = studentPyqDone(data);
    const overallDone = theoryDone + pyqDone;
    entries.push({
      id: s.id,
      name: data.username || '(unknown)',
      theoryDone, theoryPct: tTheory ? Math.round(theoryDone/tTheory*100) : 0,
      pyqDone, pyqPct: tPyq ? Math.round(pyqDone/tPyq*100) : 0,
      overallDone, overallPct: total ? Math.round(overallDone/total*100) : 0
    });
  });

  const byOverall = [...entries].sort((a,b) => b.overallDone - a.overallDone);
  const byTheory = [...entries].sort((a,b) => b.theoryDone - a.theoryDone);
  const byPyq = [...entries].sort((a,b) => b.pyqDone - a.pyqDone);

  return { byOverall, byTheory, byPyq, total, tTheory, tPyq };
}

export function findRank(rankedList, studentId){
  const idx = rankedList.findIndex(r => r.id === studentId);
  return idx === -1 ? null : idx + 1;
}

export function medal(rank){
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}
