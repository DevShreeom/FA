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
  return ORDER[0]; // everything done - just recommend against the first chapter
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
