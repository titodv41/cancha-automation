import {validReel} from './instagram-media.mjs';
// Short Reels rendered from content/instagram/meme-reels.json (licensed stock, YouTube CC via Commons, official club media).
// They post only when the editorial policy enables them and lists the reviewed recipe id; data Reels also need fresh facts.
const sources=new Set(['pixabay','mixkit','commons','youtube-commons','club-official']);
export function validShortReel(row,{now=Date.now()}={}){
 const e=row.visualEvidence||{},footage=row.footage;
 if(e.kind!=='short-reel'||row.creativeKind!=='short-reel'||!row.recipeId||!validReel(row)||!row.reel)return false;
 if(row.reel.durationSeconds<5||row.reel.durationSeconds>20)return false;
 if(!Array.isArray(footage)||!footage.length||footage.some(f=>!sources.has(f.source)||!f.id||!f.license||!/^https:\/\//.test(f.page||'')))return false;
 if(e.videoChecksum!==row.reel.assetChecksum)return false;
 if(row.recipeKind==='data'){const checked=Date.parse(row.factsCheckedOn);if(!Number.isFinite(checked)||checked>now||(now-checked)/86400000>7)return false;}
 return true;
}
export function shortReelAllowed(row,policy,options){return !!policy?.shortReelsEnabled&&!!policy.approvedShortReelIds?.includes(row?.recipeId)&&validShortReel(row,options);}
