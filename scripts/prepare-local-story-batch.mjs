import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sourceSession} from './source-session.mjs';
import {localStoryDescriptor,localStoryHash,confirmLocalStorySource} from '../server/local-story-source.mjs';
const rows=JSON.parse(await readFile('content/instagram/local-stories.json'));
const checks=JSON.parse(await readFile('previews/local-stories-2026-10-22/render-check.json'));
const previous=JSON.parse(await readFile('content/instagram/local-stories-ready.json').catch(()=>'[]'));
const session=sourceSession(),ready=[];
try{for(const row of rows){
 const source=localStoryDescriptor(row.editorialSourceId),check=checks.find(x=>x.id===row.id);
 if((!source&&!(row.sourceType==='brand'&&row.creativeKind==='community-question'))||!check||check.designHash!==createHash('sha256').update(JSON.stringify(row)).digest('hex')||check.overflow||check.overlap||!check.fonts)throw Error('Re-render and inspect local story '+row.id);
 if(createHash('sha256').update(await readFile(check.path)).digest('hex')!==check.checksum)throw Error('Rendered image changed');
 const draft={...row,creativeVersion:'cancha-local-v2',...(source?{sourceHash:localStoryHash(source),officialSourceUrl:source.documents[0].url}:{})};
 if(source&&!await confirmLocalStorySource(draft,{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Official facts changed: '+row.id);
 ready.push({...draft,factsCheckedAt:new Date().toISOString(),rights:'Original Cancha copy, graphic layout and animation. Unmodified club identifying marks from the recorded official/club-profile sources, used for independent editorial identification. No affiliation, endorsement, photo license or interview asserted. Fonts: Barlow / Barlow Condensed, SIL OFL 1.1. Asset provenance: content/instagram/local-stories/assets/manifest.json.',visualEvidence:{creator:'Cancha',kind:source?'local-story':'community-question',subjectKey:row.editorialSourceId||row.id,sourceUrl:draft.officialSourceUrl,sourceHash:draft.sourceHash,renderedAt:check.renderedAt,assetChecksum:check.checksum}});
 const old=previous.find(x=>x.id===row.id),saved=ready.at(-1);if(old?.assetUrl&&old.visualEvidence?.renderChecksum===check.checksum){saved.assetUrl=old.assetUrl;saved.assetChecksum=old.assetChecksum;saved.visualEvidence.assetChecksum=old.assetChecksum;saved.visualEvidence.renderChecksum=check.checksum;}console.log(row.id+(source?' sources confirmed':' original community copy reviewed'));
}await writeFile('content/instagram/local-stories-ready.json',JSON.stringify(ready,null,2)+'\n');}finally{await session.close()}
