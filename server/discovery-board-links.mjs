import {canonicalUrl,opportunityIdentity} from './opportunity-policy.mjs';
// Board search results are leads only. This helper never verifies a job.
export function discoveryBoardLink(href,sourceUrl,text=''){
 try{const u=new URL(href,sourceUrl),source=new URL(sourceUrl);if(u.protocol!=='https:'||u.hostname!==source.hostname||u.username||u.password)return null;
 if(!/soccer|football|futsal|orlando[- ]city|miami[- ]fc|fort[- ]lauderdale[- ]united|\busl\b/i.test(text+' '+u.pathname))return null;
 if(u.hostname==='www.linkedin.com'&&/^\/jobs\/view\/[^/]+-\d+\/?$/.test(u.pathname)){u.search='';return canonicalUrl(u.href);}
 if(u.hostname==='www.indeed.com'&&u.pathname==='/viewjob'&&/^[a-f0-9]{16}$/.test(u.searchParams.get('jk')||'')){const id=u.searchParams.get('jk');u.search='';u.searchParams.set('jk',id);return canonicalUrl(u.href);}
 return null;
 }catch{return null;}
}

// A reviewed exact URL can seed discovery when a board omits cards or is unavailable.
// This only queues a lead; verifyJob still checks the live posting before any CMS write.
export function approvedEmployerPosting(input,organizers){
 try{const url=canonicalUrl(input),u=new URL(url);return u.hostname==='www.teamworkonline.com'&&!u.search&&/^\/soccer-jobs\/.+-\d+$/.test(u.pathname)&&organizers.some(o=>url.startsWith(o.sourcePrefix))?url:null}catch{return null}
}
export function exactEmployerSeed(source,{organizers,existingPostingIds,today}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(source.discoverySeedUntil||'')||source.discoverySeedUntil<today)return null;
 const url=approvedEmployerPosting(source.url,organizers);return url&&!existingPostingIds.has(opportunityIdentity(url))?url:null;
}
