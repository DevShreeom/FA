// metrics.js - shared counting logic. Any file that needs to count videos/progress
// should import from here instead of re-writing the same loops.

import { ORDER, CHAPTER_DATA } from './data.js';

export function idFor(url){ return url.split('v=')[1] || url; }

export function totalForChapter(ch){ return CHAPTER_DATA[ch].fs.length + CHAPTER_DATA[ch].pyq.length; }

export function computeTotalAll(){
  let t = 0; ORDER.forEach(ch => { t += totalForChapter(ch); }); return t;
}
export function totalTheory(){
  let t = 0; ORDER.forEach(ch => { t += CHAPTER_DATA[ch].fs.length; }); return t;
}
export function totalPyq(){
  let t = 0; ORDER.forEach(ch => { t += CHAPTER_DATA[ch].pyq.length; }); return t;
}

// s = a raw student document (with .theory / .pyq maps of videoId -> status string: 'none'|'progressing'|'done')
// Backward-compat: older data stored plain booleans (true = done) before the status system existed.
function isDone(v){ return v === 'done' || v === true; }
function isProgressing(v){ return v === 'progressing'; }

export function studentTheoryDone(s){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].fs.forEach(it => { if (s.theory && isDone(s.theory[idFor(it.url)])) n++; }); });
  return n;
}
export function studentPyqDone(s){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].pyq.forEach(it => { if (s.pyq && isDone(s.pyq[idFor(it.url)])) n++; }); });
  return n;
}
export function studentOverallDone(s){
  return studentTheoryDone(s) + studentPyqDone(s);
}
export function studentTheoryProgressing(s){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].fs.forEach(it => { if (s.theory && isProgressing(s.theory[idFor(it.url)])) n++; }); });
  return n;
}
export function studentPyqProgressing(s){
  let n = 0;
  ORDER.forEach(ch => { CHAPTER_DATA[ch].pyq.forEach(it => { if (s.pyq && isProgressing(s.pyq[idFor(it.url)])) n++; }); });
  return n;
}
