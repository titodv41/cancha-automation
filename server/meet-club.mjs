// "Meet Your Local Club · <city>" (docs/meet-your-local-club-kit.md). A feature is built only from clips an
// organization sent after a positive email reply, with its written permission kept alongside. The manifest and
// clips are private (private-data/meet-club/<id>/); nothing renders without consent, and nothing about minors
// renders without guardian consent. Facts on the end card must come from the organization's official page.
const day=/^\d{4}-\d\d-\d\d$/,handle=/^[a-z0-9._]{1,30}$/;
export function meetClubProblems(f,{today=new Date().toISOString().slice(0,10)}={}){
 const p=[],c=f?.consent||{},segs=f?.segments;
 if(!/^[a-z0-9-]{3,60}$/.test(f?.id||''))p.push('id: lowercase letters, digits and dashes');
 if(!f?.organization||String(f.organization).length>40)p.push('organization: 1–40 characters');
 if(!f?.city||String(f.city).length>24)p.push('city: 1–24 characters');
 if(f?.instagram!=null&&!handle.test(f.instagram))p.push('instagram: handle without @');
 try{if(new URL(f?.officialUrl).protocol!=='https:')throw 0}catch{p.push('officialUrl: the organization\'s https page')}
 if(c.reply!=='yes'||c.via!=='email'||!day.test(c.receivedOn||'')||c.receivedOn>today)p.push('consent: the organization\'s "yes" by email, with the date received');
 if(c.ownsMedia!==true||c.everyoneAgreed!==true)p.push('consent: organization owns the media and everyone shown agreed');
 if(typeof c.minorsShown!=='boolean'||c.minorsShown&&c.guardianConsent!==true)p.push('consent: minors shown need guardian consent');
 if(!Array.isArray(segs)||segs.length<1||segs.length>6)p.push('segments: 1–6 clips');
 else{segs.forEach((s,i)=>{if(!/^[\w.-]+\.(mp4|mov|m4v)$/i.test(s.file||''))p.push(`segments[${i}].file: a clip file in the feature folder`);
   if(!(s.duration>=2&&s.duration<=15))p.push(`segments[${i}].duration: 2–15 seconds`);if(s.start!=null&&!(s.start>=0))p.push(`segments[${i}].start: seconds ≥ 0`);
   if(s.caption!=null&&(typeof s.caption!=='string'||s.caption.length>90))p.push(`segments[${i}].caption: their words, ≤90 characters`);});
  const total=segs.reduce((a,s)=>a+(s.duration||0),0)+6.4;if(total<10||total>45)p.push('length: 10–45 seconds including title and end card');}
 if(!Array.isArray(f?.endCard)||f.endCard.length<1||f.endCard.length>3||f.endCard.some(r=>!r?.label||!r?.value||String(r.value).length>70))p.push('endCard: 1–3 rows (where they train, who can join, how to contact), ≤70 characters each');
 if(typeof f?.caption!=='string'||!f.caption.includes('Meet Your Local Club')||!f.caption.includes(f.city)||f.caption.length>2200)p.push('caption: names the series and city');
 return p;
}
