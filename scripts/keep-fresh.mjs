import {readFile,readdir} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
// Keeps approved posts postable (Nov 7: the 6 PM slot went empty because every approved draft was rendered more
// than 7 days earlier, and the publisher refuses older renders by design). Runs in a quiet hour so it never pushes a
// pending publish run out of the shared concurrency group. It only re-renders what is already approved; it never
// approves, re-checks facts or posts anything.
// Usage: node scripts/keep-fresh.mjs briefs  -> comma list of approved briefs whose facts are still in their window
//        node scripts/keep-fresh.mjs cut     -> the approved creator cut to re-render today (one per day, in rotation)
const DAY=86400000;
const nyDate=at=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
// A brief stays postable for 7 days after its facts were checked; renders in the last day of that window would expire
// before a slot, so only briefs with at least a day left are re-rendered.
export function freshBriefIds(briefs,approved,now=Date.now()){
 const today=nyDate(new Date(now));
 return briefs.filter(b=>approved.includes(b.id)&&(!b.expiresOn||b.expiresOn>=today)&&/^\d{4}-\d\d-\d\d$/.test(b.checkedOn||'')&&(now-Date.parse(b.checkedOn+'T12:00:00Z'))/DAY<6&&Date.parse(b.checkedOn+'T00:00:00Z')<=now).map(b=>b.id);
}
// Briefs whose fact window closes within two days need a person (or the lead session) to re-check the sources.
export function briefsNeedingRecheck(briefs,approved,now=Date.now()){
 const today=nyDate(new Date(now));
 return briefs.filter(b=>approved.includes(b.id)&&(!b.expiresOn||b.expiresOn>=today)&&/^\d{4}-\d\d-\d\d$/.test(b.checkedOn||'')&&(now-Date.parse(b.checkedOn+'T12:00:00Z'))/DAY>=5).map(b=>b.id);
}
// One approved cut per day keeps each of up to six cuts within the 7-day render window.
export function rotatingCut(files,approved,now=Date.now()){
 const cuts=files.filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5)).filter(n=>/^[a-z0-9-]+$/.test(n)&&approved.includes('creator-cut-'+n)).sort();
 return cuts.length?cuts[Math.floor(Date.parse(nyDate(new Date(now))+'T12:00:00Z')/DAY)%cuts.length]:'';
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8')),mode=process.argv[2];
 if(mode==='briefs'){
  const {briefs}=JSON.parse(await readFile('content/instagram/brief-carousels.json','utf8')),approved=policy.briefCarouselsEnabled?policy.approvedBriefCarouselIds||[]:[];
  const recheck=briefsNeedingRecheck(briefs,approved);if(recheck.length)console.error('Re-check sources soon (fact window closing): '+recheck.join(', '));
  console.log(freshBriefIds(briefs,approved).join(','));
 }else if(mode==='cut'){
  console.log(policy.shortReelsEnabled?rotatingCut(await readdir('content/instagram/creator-cuts'),policy.approvedShortReelIds||[]):'');
 }else throw Error('Usage: keep-fresh.mjs briefs|cut');
}
