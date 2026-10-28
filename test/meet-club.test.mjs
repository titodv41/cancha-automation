import test from'node:test';import assert from'node:assert/strict';
import{meetClubProblems}from'../server/meet-club.mjs';
const ok={id:'fko-kissimmee',organization:'Free Kick Orlando',city:'Kissimmee',instagram:'freekickorlando',officialUrl:'https://example.org/',
 consent:{reply:'yes',via:'email',receivedOn:'2026-10-28',ownsMedia:true,everyoneAgreed:true,minorsShown:false},
 segments:[{file:'intro.mp4',start:0,duration:8,caption:'We started with six kids and one field.'},{file:'drills.mov',duration:6}],
 endCard:[{label:'Where they train',value:'Indoor field, Kissimmee'}],caption:'Meet Your Local Club · Kissimmee'};
const today='2026-10-28';
test('a complete, consented feature is ready',()=>assert.deepEqual(meetClubProblems(ok,{today}),[]));
test('nothing renders without the organization\'s written yes and media ownership',()=>{
 for(const consent of[{...ok.consent,reply:'maybe'},{...ok.consent,via:'instagram-dm'},{...ok.consent,receivedOn:'2026-11-02'},{...ok.consent,ownsMedia:false},{...ok.consent,everyoneAgreed:undefined}])
  assert.ok(meetClubProblems({...ok,consent},{today}).some(p=>p.startsWith('consent')));
});
test('minors need guardian consent',()=>{
 assert.ok(meetClubProblems({...ok,consent:{...ok.consent,minorsShown:true}},{today}).some(p=>/guardian/.test(p)));
 assert.deepEqual(meetClubProblems({...ok,consent:{...ok.consent,minorsShown:true,guardianConsent:true}},{today}),[]);
 assert.ok(meetClubProblems({...ok,consent:{...ok.consent,minorsShown:undefined}},{today}).some(p=>/guardian/.test(p)));
});
test('clip, length, end card and caption limits',()=>{
 assert.ok(meetClubProblems({...ok,segments:[{file:'../secret.mp4',duration:5}]},{today}).some(p=>p.includes('.file')));
 assert.ok(meetClubProblems({...ok,segments:[{file:'a.mp4',duration:1}]},{today}).some(p=>p.includes('duration')));
 assert.ok(meetClubProblems({...ok,segments:Array.from({length:4},()=>({file:'a.mp4',duration:12}))},{today}).some(p=>p.startsWith('length')));
 assert.ok(meetClubProblems({...ok,endCard:[]},{today}).some(p=>p.startsWith('endCard')));
 assert.ok(meetClubProblems({...ok,caption:'New club video'},{today}).some(p=>p.startsWith('caption')));
 assert.ok(meetClubProblems({...ok,instagram:'@freekick'},{today}).some(p=>p.startsWith('instagram')));
});
