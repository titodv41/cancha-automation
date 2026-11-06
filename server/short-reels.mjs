import {validReel} from './instagram-media.mjs';
// Short Reels rendered from content/instagram/meme-reels.json (licensed stock, YouTube CC via Commons, official club media).
// Creator cuts (recipeKind 'creator') use cleared creator videos from config/clip-permissions.json and may run to 40 s.
// Story Reels (recipeKind 'story', owner Nov 6) are approved motion-graphic renders over Pexels photos, club marks shown in
// the Cancha directory and Cancha's own screens; they may run to 60 s.
// They post only when the editorial policy enables them and lists the reviewed recipe id; data Reels also need fresh facts.
const sources=new Set(['pixabay','mixkit','commons','youtube-commons','club-official','youtube-cleared','pexels','cancha']);
const maxSeconds={creator:90,story:60};
export function validShortReel(row,{now=Date.now()}={}){
 const e=row.visualEvidence||{},footage=row.footage;
 if(e.kind!=='short-reel'||row.creativeKind!=='short-reel'||!row.recipeId||!validReel(row)||!row.reel)return false;
 if(row.reel.durationSeconds<5||row.reel.durationSeconds>(maxSeconds[row.recipeKind]??20))return false;
 if(footage?.some?.(f=>f.source==='youtube-cleared')&&row.recipeKind!=='creator')return false;
 if(footage?.some?.(f=>f.source==='pexels'||f.source==='cancha')&&row.recipeKind!=='story')return false;
 if(footage?.some?.(f=>f.license==='pending-owner'))return false; // drafts only until the creator says yes
 if(!Array.isArray(footage)||!footage.length||footage.some(f=>!sources.has(f.source)||!f.id||!f.license||!/^https:\/\//.test(f.page||'')))return false;
 if(e.videoChecksum!==row.reel.assetChecksum)return false;
 if(row.recipeKind==='data'){const checked=Date.parse(row.factsCheckedOn);if(!Number.isFinite(checked)||checked>now||(now-checked)/86400000>7)return false;}
 return true;
}
export function shortReelAllowed(row,policy,options){return !!policy?.shortReelsEnabled&&!!policy.approvedShortReelIds?.includes(row?.recipeId)&&validShortReel(row,options);}
