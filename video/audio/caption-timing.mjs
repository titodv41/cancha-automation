// Preserve provider word timings. Never estimate karaoke timing for a final voice cut.
export function alignmentToWords(alignment, offset = 0) {
  const chars = alignment?.characters;
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;
  if (!Array.isArray(chars) || !chars.length || !Array.isArray(starts) || !Array.isArray(ends) || chars.length !== starts.length || chars.length !== ends.length || !Number.isFinite(offset) || offset < 0) throw Error('Missing or invalid voice alignment');
  const words = []; let word;
  for (let i = 0; i < chars.length; i++) {
    if (typeof chars[i] !== 'string' || !Number.isFinite(starts[i]) || !Number.isFinite(ends[i]) || starts[i] < 0 || ends[i] < starts[i] || (i && starts[i] < starts[i - 1])) throw Error('Invalid voice timestamp');
    if (/^\s+$/.test(chars[i])) { if (word) words.push(word); word = undefined; continue; }
    if (!word) word = {text: '', start: starts[i] + offset, end: ends[i] + offset};
    word.text += chars[i]; word.end = ends[i] + offset;
  }
  if (word) words.push(word);
  if (!words.length) throw Error('No spoken words in alignment');
  return words;
}

export function captionGroups(words, maxWords = 4) {
  if (!Number.isInteger(maxWords) || maxWords < 1 || maxWords > 5) throw Error('Invalid caption group size');
  const groups = []; let current = [];
  for (const word of words) {
    if (!word.text || !Number.isFinite(word.start) || !Number.isFinite(word.end) || word.end < word.start) throw Error('Invalid caption word');
    if (current.length && (word.start - current.at(-1).end > 0.45 || current.map(w => w.text).join(' ').length + word.text.length > 27)) { groups.push(current); current = []; }
    current.push(word);
    if (current.length === maxWords || /[.!?]$/.test(word.text)) { groups.push(current); current = []; }
  }
  if (current.length) groups.push(current);
  return groups.map(words => ({start: words[0].start, end: words.at(-1).end, words}));
}

// Caption-only cut (no narration): each word holds for a comfortable reading pace, with a beat after each sentence.
export function readingTimeline(script,start=.6){let t=start;return String(script).split(/\s+/).filter(Boolean).map(text=>{const d=Math.max(.3,.055*text.length+.12),w={text,start:+t.toFixed(3),end:+(t+d).toFixed(3)};t+=d+(/[.!?]$/.test(text)?.4:/[,;:]$/.test(text)?.15:0);return w;});}
// On-screen text shows scores as digits ("two nil" is written for a voice): "two nil" → "2–0", "three all" → "3–3".
const NUM={nil:0,zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
export function captionText(script){return String(script).replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten) (nil|all|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi,(m,a,b)=>{const x=NUM[a.toLowerCase()],y=b.toLowerCase()==='all'?x:NUM[b.toLowerCase()];return x+'–'+y;});}
