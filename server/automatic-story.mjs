import {createHash} from 'node:crypto';
import {normalize,updateSourceHash,localNewsSources} from './local-updates.mjs';
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const segmenter=new Intl.Segmenter('en',{granularity:'sentence'});
const sentences=value=>[...segmenter.segment(value)].map(x=>x.segment.trim()).filter(Boolean);
const unsafe=/\b(?:we|our|i|you|today|tonight|tomorrow|yesterday|agree|reported by)\b|[“”]|https?:|\b(?:thrilled|delighted|proud to|excited to)\b/i;
function cleanSentence(value){
 const names=['nil','one','two','three','four','five','six','seven','eight','nine'];
 return value.replace(/^(?:\([A-Za-z]+ \d{1,2}, \d{4}\)\s*[–—-]\s*)/,'').replace(/\s*\(\d+[-–]\d+[-–]\d+,\s*\d+ PTS\)/g,'')
  .replace(/^[A-Z .,'()\d-]+\s[–—]\s/,'').replace(/ in a showdown of [^,]+,/i,',').replace(/ in an exciting match\./i,'.')
  .replace(/^(.+?) jumped out to a quick start, grabbing a (\d[-–]\d) lead in the first (\w+) minutes of the match\.$/i,'$1 took a $2 lead in the first $3 minutes.')
  .replace(/^The (.+?) team took on (.+?), coming from behind to draw (\d[-–]\d)\.$/i,'The $1 team came back to earn a $3 draw against $2.')
  .replace(/\b([0-9])[-–]([0-9])\b/g,(_,a,b)=>a===b?names[Number(a)]+' all':names[Number(a)]+' '+names[Number(b)]).trim();
}
export const automaticScriptHash=story=>sha({version:2,sourceHash:story.sourceHash,script:story.script,evidence:story.evidence});
export function writeAutomaticStory(entry,{maximumCharacters=320}={}){
 if(entry.sourceHash!==updateSourceHash(entry)||!localNewsSources.some(s=>s.id===entry.sourceId&&s.organization===entry.organization))throw Error('Automatic script needs an intact official article');
 if(/preview|bright bits|road trip|partner|sponsor/i.test(entry.title))throw Error('Automatic narration currently requires a recap or factual club update, not an unverified future fixture');
 const candidates=entry.paragraphs.flatMap(p=>sentences(p).map(original=>({original,spoken:cleanSentence(original)}))).filter(s=>!unsafe.test(s.spoken)&&/[.!]$/.test(s.spoken)&&s.spoken.split(/\s+/).length>=10&&s.spoken.length<=maximumCharacters);
 // A comeback story opens with the deficit and ends on the actual result.
 const result=candidates.find(s=>/\b(?:coming from behind|rally|rallied)\b/i.test(s.original)&&/\b(?:draw|drew)\b/i.test(s.original));
 const deficit=candidates.find(s=>/\b(?:lead|ahead)\b/i.test(s.original)&&/\b\d{1,2}[-–]\d{1,2}\b/.test(s.original));
 let selected=[];
 if(result&&deficit&&result!==deficit&&(deficit.spoken+' '+result.spoken).length<=maximumCharacters)selected=[deficit,result];
 else for(const candidate of candidates){if((selected.map(s=>s.spoken).join(' ')+' '+candidate.spoken).trim().length>maximumCharacters)continue;selected.push(candidate);if(selected.map(s=>s.spoken).join(' ').split(/\s+/).length>=30||selected.length===2)break;}
 const script=selected.map(s=>s.spoken).join(' '),words=script.split(/\s+/).length;
 if(words<25||words>58||script.length>maximumCharacters||/[?]$/.test(script)||unsafe.test(script))throw Error('Article needs a complete concise story; no generic closing question or filler is generated');
 const score=result?.original.match(/\b(?:draw|drew)\s+(\d{1,2})[-–](\d{1,2})/i),early=deficit?.original.match(/\b(\d{1,2})[-–](\d{1,2})\s+lead/i);
 const story={sourceId:entry.id,sourceHash:entry.sourceHash,script,evidence:selected.map(s=>({source:entry.url,exactText:s.original,spoken:s.spoken})),wordCount:words,score:score?score.slice(1).join('–'):null,deficit:early?early.slice(1).join('–'):null,ending:'factual-payoff',method:'official-source-excerpts-v2'};
 story.scriptHash=automaticScriptHash(story);return story;
}
export function validAutomaticScript(story,entry){
 return story?.sourceId===entry?.id&&story.sourceHash===entry.sourceHash&&story.scriptHash===automaticScriptHash(story)&&story.script===story.evidence?.map(e=>e.spoken).join(' ')
  &&story.evidence.length>=1&&story.evidence.length<=2&&story.evidence.every(e=>e.source===entry.url&&entry.paragraphs.some(p=>normalize(p).includes(normalize(e.exactText)))&&e.spoken===cleanSentence(e.exactText))
  &&story.wordCount===story.script.split(/\s+/).length&&story.wordCount>=25&&story.wordCount<=58&&!unsafe.test(story.script)&&!/[?]$/.test(story.script);
}
export const NEWS_TECHNIQUES=['match-board','newsroom','club-film'];
export function chooseNewsTechnique(entry,previous=[],learning=null){
 const used=previous.filter(r=>r.status==='Published'||r.status==='Approved'||r.status==='Draft').map(r=>{try{return typeof r.content==='string'?JSON.parse(r.content):r.content}catch{return null}}).filter(c=>c&&NEWS_TECHNIQUES.includes(c.creativeTechnique)).sort((a,b)=>(Date.parse(a.visualEvidence?.renderedAt)||0)-(Date.parse(b.visualEvidence?.renderedAt)||0));
 const counts=Object.fromEntries(NEWS_TECHNIQUES.map(k=>[k,used.slice(-12).filter(r=>r.creativeTechnique===k).length]));
 const candidates=NEWS_TECHNIQUES.filter(k=>k!=='match-board'||/\b(?:draw|rall(?:y|ies|ied)?|win|beat|match)\b/i.test(entry.title));
 const order=[...candidates].sort((a,b)=>counts[a]-counts[b]||sha(entry.id+a).localeCompare(sha(entry.id+b)));
 // A measured preference is only eligible after comparable independent samples.
 const winner=learning?.comparisons?.[0];
 if(winner?.posts>=5&&learning.comparisons.length>=2&&parseInt(sha(entry.id).slice(0,2),16)%4!==0&&candidates.includes(winner.technique))return winner.technique;
 if(/rall(?:y|ies|ied)|comeback/i.test(entry.title)&&counts['match-board']===0)return 'match-board';
 return order[0];
}
