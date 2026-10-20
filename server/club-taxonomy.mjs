// League affiliation comes from reviewed sources, never from the word "academy".
export function profileLeagues(item,memberships=[]){
 const out=memberships.filter(x=>x.slug===item.slug).map(x=>({name:x.league,division:x.division||'',season:x.season||'',source:x.source,checkedOn:x.checkedOn}));
 if(/^https:\/\/(premier|division1)\.upsl\.com\/teams\/[a-z0-9-]+\/?$/.test(item.source||''))out.push({name:'UPSL',division:item.source.includes('division1.')?'Division 1':'Premier',season:item.summary?.match(/\bfor (20\d{2}(?: (?:Fall|Spring))?)\b/)?.[1]||'',source:item.source,checkedOn:item.checkedOn});
 return out.filter((x,i,a)=>a.findIndex(y=>y.name===x.name&&y.division===x.division)===i);
}
export function publicSourceLinks(html=''){return [...new Set([...String(html).matchAll(/href=["'](https:\/\/[^"']+)["']/g)].map(x=>x[1].replaceAll('&amp;','&')))].filter(x=>{try{const u=new URL(x);return !u.username&&!u.password}catch{return false}})}
export function plainParagraphs(html=''){return String(html).replace(/<\/(?:p|div|li|h[1-6])>/gi,'\n').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#0*39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').split('\n').map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x&&!/[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+/i.test(x))}
export function profileAgeEvidence({name='',source='',ages='',audience=''}){
 const squad=name.match(/\bU(1[3-9]|2[01])\b/i);
 if(/^https:\/\/(premier|division1)\.upsl\.com\/teams\//.test(source)&&squad)return {kind:'season',min:2,max:Number(squad[1])+1,label:'U'+squad[1],audience};
 if(/^https:\/\/www\.goodrec\.com\/pickup-soccer\/(miami|orlando)$/.test(source)&&/^Ages 18 and older\./.test(ages))return {kind:'ages',ranges:[{min:18,max:null}],label:'Ages 18+',audience};
 return {kind:'programs',label:ages||'Confirm program ages',audience};
}
