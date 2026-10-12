import {canonicalUrl} from './opportunity-policy.mjs';
// Board search results are leads only. This helper never verifies a job.
export function discoveryBoardLink(href,sourceUrl,text=''){
 try{const u=new URL(href,sourceUrl),source=new URL(sourceUrl);if(u.protocol!=='https:'||u.hostname!==source.hostname||u.username||u.password)return null;
 if(!/soccer|football|futsal|orlando[- ]city|miami[- ]fc|fort[- ]lauderdale[- ]united|\busl\b/i.test(text+' '+u.pathname))return null;
 if(u.hostname==='www.linkedin.com'&&/^\/jobs\/view\/[^/]+-\d+\/?$/.test(u.pathname)){u.search='';return canonicalUrl(u.href);}
 if(u.hostname==='www.indeed.com'&&u.pathname==='/viewjob'&&/^[a-f0-9]{16}$/.test(u.searchParams.get('jk')||'')){const id=u.searchParams.get('jk');u.search='';u.searchParams.set('jk',id);return canonicalUrl(u.href);}
 return null;
 }catch{return null;}
}
