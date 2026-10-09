import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {NEWS_FEED,readFootballFeed} from '../server/soccer-news.mjs';
import {dateInNewYork} from '../server/offer-expiry.mjs';
import {sourceSession} from './source-session.mjs';
const date=dateInNewYork(),dir=`private-data/daily-opportunities/${date}`;await mkdir(dir,{recursive:true,mode:0o700});
const bank=JSON.parse(await readFile('content/instagram/editorial-bank.json','utf8'));
const index=Math.floor(Date.parse(date+'T12:00:00Z')/86400000)%bank.length;
const copy=bank[index],now=new Date().toISOString();
const posts=[{...copy,id:'editorial-'+date.replaceAll('-','')+'-'+copy.key,factsCheckedAt:now}];
const session=sourceSession();let newsSourceAvailable=false;
try{const xml=await session.html(NEWS_FEED,/xml/i);const items=readFootballFeed(xml.toString());newsSourceAvailable=true;if(items.length){const item=items[0];posts.push({id:'news-'+createHash('sha256').update(item.url).digest('hex').slice(0,24),sourceType:'news',format:'feed',topic:'news',headline:'Today in soccer.',kicker:'FOOTBALL BRIEF',body:item.title,cta:'Source: BBC Sport. Full story in the caption.',caption:'“'+item.title+'”\n\nFrom BBC Sport ('+dateInNewYork(new Date(item.publishedAt))+').\nFull story: '+item.url+'\n\nWhat’s your take?\n#Cancha #Soccer',altText:'Cancha football brief quoting BBC Sport: '+item.title,rights:'Original Cancha graphic. Short attributed news headline; no third-party photograph.',factsCheckedAt:now,sourceHash:item.sourceHash,officialSourceUrl:item.url});}}catch{/* Use original content; never invent a news item. */}finally{await session.close();}
await writeFile(dir+'/editorial-drafts.json',JSON.stringify(posts,null,2),{mode:0o600});await writeFile(dir+'/editorial-source-report.json',JSON.stringify({newsSource:NEWS_FEED,newsSourceAvailable,drafts:posts.length,originalBankSize:bank.length,published:false},null,2),{mode:0o600});console.log(JSON.stringify({editorialDrafts:posts.length,newsSourceAvailable,published:false}));
