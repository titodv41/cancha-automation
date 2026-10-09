import {createHash} from 'node:crypto';
export const NEWS_FEED='https://feeds.bbci.co.uk/sport/football/rss.xml';
const decode=value=>String(value).replace(/^\s*<!\[CDATA\[([\s\S]*)\]\]>\s*$/,'$1').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&#(\d+);/g,(_,n)=>Number(n)<0x110000?String.fromCodePoint(Number(n)):'').trim();
export function readFootballFeed(xml,{now=Date.now()}={}){
 const result=[];for(const item of String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)){
  const get=key=>decode(item[1].match(new RegExp('<'+key+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+key+'>'))?.[1]||'');
  const title=get('title'),link=get('link'),date=get('pubDate'),published=Date.parse(date);let url;try{url=new URL(link);}catch{continue;}
  if(!['www.bbc.co.uk','www.bbc.com'].includes(url.hostname)||url.protocol!=='https:'||url.username||url.password||!url.pathname.startsWith('/sport/')||!title||title.length>120||!Number.isFinite(published)||published>now||now-published>48*3600000)continue;
  const sourceHash=createHash('sha256').update(JSON.stringify({title,url:url.href,publishedAt:new Date(published).toISOString()})).digest('hex');
  result.push({title,url:url.href,publishedAt:new Date(published).toISOString(),sourceHash});
 }return result.sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
}
export async function confirmNewsSource(row,{fetchImpl=fetch,now=Date.now()}={}){
 const response=await fetchImpl(NEWS_FEED,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Football news source unavailable');
 const reader=response.body.getReader(),chunks=[];let size=0;while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>1_000_000){await reader.cancel();throw Error('News feed too large');}chunks.push(Buffer.from(next.value));}
 const entries=readFootballFeed(Buffer.concat(chunks).toString('utf8'),{now});if(!entries.some(item=>item.url===row.officialSourceUrl&&item.sourceHash===row.sourceHash))throw Error('News changed, aged or disappeared from the verified feed');return true;
}
