// qotdRecommend.js — picks a relevant "Question of the Day" video based on
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

export function findCurrentChapter(myData){
  for (const ch of ORDER){
    const chData = CHAPTER_DATA[ch];
    const total = chData.fs.length + chData.pyq.length;
    if (total === 0) continue;
    let done = 0;
    chData.fs.forEach(it => { if (isDoneVal(myData.theory[idFor(it.url)])) done++; });
    chData.pyq.forEach(it => { if (isDoneVal(myData.pyq[idFor(it.url)])) done++; });
    if (done < total) return ch; // first chapter that isn't fully complete yet
  }
  return ORDER[0]; // everything done — just recommend against the first chapter
}

export function recommendQotd(myData){
  const chapter = findCurrentChapter(myData);
  const keywords = chapterKeywords(chapter);

  let best = null, bestScore = -1;
  QOTD.forEach(v => {
    let score = 0;
    keywords.forEach(kw => {
      if (v.tags.some(tag => tag.includes(kw))) score++;
    });
    if (score > bestScore){ bestScore = score; best = v; }
  });

  if (!best || bestScore === 0){
    // no tag overlap at all — fall back to the most recently uploaded video
    best = QOTD[0];
  }
  return { chapter, video: best };
}
