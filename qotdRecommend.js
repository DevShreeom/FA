// qotdRecommend.js - picks a relevant "Question of the Day" video based on
// whichever chapter the student is currently working through (the first
// not-yet-fully-done chapter in the locked study order).

import { ORDER, CHAPTER_DATA } from './data.js';
import { QOTD } from './qotd.js';
import { idFor } from './metrics.js';

function isDoneVal(v){ return v === 'done' || v === true; }

// Breaks a chapter name into meaningful lowercase keywords for loose matching
// e.g. "Sequences & Series" -> ["sequences","series"]
function chapterKeywords(ch){
  return ch
    .toLowerCase()
    .replace(/[()/&]/g, ' ')
    .split(/[\s,]+/)
    .filter(w => w.length > 3 && !['ratios','equations','inequalities','mixed','extra','revision','compilations'].includes(w));
}

export function findCurrentChapter(myData) {
  let activeChapter = null;
  let highestTouchedIndex = -1;

  // Safe fetchers in case a new student has no data yet
  const getTheory = (id) => myData.theory ? myData.theory[id] : null;
  const getPyq = (id) => myData.pyq ? myData.pyq[id] : null;

  for (let i = 0; i < ORDER.length; i++) {
    const ch = ORDER[i];
    let isWorking = false;
    let hasTouched = false;

    // Check Theory
    CHAPTER_DATA[ch].fs.forEach(it => {
      const status = getTheory(idFor(it.url));
      if (status === 'progressing') isWorking = true;
      if (status === 'done' || status === true) hasTouched = true;
    });

    // Check PYQs
    CHAPTER_DATA[ch].pyq.forEach(it => {
      const status = getPyq(idFor(it.url));
      if (status === 'progressing') isWorking = true;
      if (status === 'done' || status === true) hasTouched = true;
    });

    // Keep track of the furthest chapter they have done *anything* in
    if (hasTouched || isWorking) highestTouchedIndex = i;
    
    // If they are actively 'progressing' here, mark it as the active chapter
    if (isWorking) activeChapter = ch;
  }

  // 1. If they have a video actively marked as "progressing", recommend that chapter!
  if (activeChapter) return activeChapter;

  // 2. Otherwise, recommend the furthest chapter they have touched
  if (highestTouchedIndex >= 0) return ORDER[highestTouchedIndex];

  // 3. Fallback for brand new accounts
  return ORDER[0]; 
}

export function recommendQotd(myData){
  const chapter = findCurrentChapter(myData);
  const keywords = chapterKeywords(chapter);

  const scored = QOTD.map(v => {
    let score = 0;
    keywords.forEach(kw => { if (v.tags.some(tag => tag.includes(kw))) score++; });
    return { video: v, score };
  }).sort((a, b) => b.score - a.score);

  const matches = scored.filter(s => s.score > 0).map(s => s.video);
  const ranked = matches.length ? matches : QOTD; // no tag overlap at all - fall back to full list

  return { chapter, ranked };
}
