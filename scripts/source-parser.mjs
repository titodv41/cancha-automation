import {flattenSchemas,sourceDigest} from '../server/source-verification.mjs';
export async function parseJob(page,bytes,url){await page.setContent(bytes.toString('utf8'),{waitUntil:'domcontentloaded'});const data=await page.evaluate(()=>{
 const schemas=[];for(const s of document.querySelectorAll('script[type="application/ld+json"]')){try{schemas.push(JSON.parse(s.textContent));}catch{}}
 const flatten=values=>values.flatMap(v=>Array.isArray(v)?flatten(v):v&&typeof v==='object'?[v,...flatten(v['@graph']||[])]:[]);
 const desc=flatten(schemas).find(x=>[x['@type']].flat().includes('JobPosting'))?.description||'',box=document.createElement('div');box.innerHTML=desc;for(const node of box.querySelectorAll('script,style'))node.remove();for(const node of box.querySelectorAll('div,p,li,br,h1,h2,h3,strong')){node.before(document.createTextNode(' '));node.after(document.createTextNode(' '));}
 return {schemas,pageText:document.body.innerText,descriptionText:box.textContent,applicationLinks:[...document.querySelectorAll('a[href]')].filter(a=>/apply now/i.test(a.textContent)).map(a=>a.getAttribute('href'))};
 });data.applicationLinks=[...new Set(data.applicationLinks.map(x=>new URL(x,url).href))].sort();data.sourceHash=sourceDigest(Buffer.from(JSON.stringify({jobs:flattenSchemas(data.schemas).filter(x=>[x['@type']].flat().includes('JobPosting')),applicationLinks:data.applicationLinks,closed:/closed to new applications|position (?:has been )?filled|no longer accepting applications/i.test(data.pageText)})));return data;
}
