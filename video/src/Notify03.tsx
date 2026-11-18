// Launch ad 03 "Notifications" (owner, Nov 18: more of these simple, modern UI ads with taps; sell the feeling of
// finding your team). A lock screen that fills with Cancha notifications over one week: a club posts an opening,
// accepts your request, the coach says see you Sunday, the team chat welcomes you. Illustrated UI; the clubs gave
// their okay. Same motion language and brand type as ads 01 and 02.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Badge, C, Caption, D, Label, Lines, U, ease} from './FindTeam01';

export type Cue03 = {n: number[]; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_03: Cue03 = {n: [2.2, 4.4, 6.6, 8.8], end: 12.0, total: 16.0, captions: [
  {at: 0.2, to: 2.0, text: 'This could be your phone this week.'},
  {at: 2.2, to: 4.2, text: 'A club posts an opening.'},
  {at: 4.4, to: 6.4, text: 'They accept your request.'},
  {at: 6.6, to: 8.6, text: 'The coach says see you Sunday.'},
  {at: 8.8, to: 11.6, text: 'And your new team is already in the chat.'},
]};
const NOTES: {crest: string; app: string; title: string; body: string}[] = [
  {crest: 'miami-united-fc', app: 'Cancha', title: 'Miami United FC is recruiting', body: 'Open Talent ID · First team and U23'},
  {crest: 'river-miami-fc', app: 'Cancha', title: 'River Miami FC accepted you', body: 'Your tryout request was accepted.'},
  {crest: 'river-miami-fc', app: 'Coach · River Miami FC', title: 'See you Sunday', body: '9 AM. Bring both shin guards.'},
  {crest: 'river-miami-fc', app: 'Team chat · River Miami FC', title: '4 new messages', body: 'Welcome to the team!'},
];

export function Notify03({cues = CUES_03}: {cues?: Cue03}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const n = cues.n.map(x => Math.round(x * fps)), end = Math.round(cues.end * fps);
  const wipe = ease(f, end - 2, end + 16, Easing.inOut(Easing.cubic));
  const clockIn = ease(f, 0, 14);
  // Each new notification enters at the top of the stack and pushes the older ones down.
  const H = 196, GAP = 22;
  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>
    <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: clockIn, transform: `translateY(${(1 - clockIn) * 20}px)`}}>
      <Label color={C.mint} size={40}>Sunday, November 22</Label>
      <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 260, lineHeight: 1, color: C.cream, marginTop: 6}}>8:41</div>
    </div>
    {NOTES.map((o, i) => {
      const a = n[i]; if (f < a - 1) return null;
      const p = spring({frame: f - a, fps, config: {damping: 15, stiffness: 150}});
      const below = n.filter((b, j) => j > i && f >= b).length;
      const shift = n.slice(i + 1).reduce((acc, b) => acc + spring({frame: f - b, fps, config: {damping: 16, stiffness: 140}}) * (H + GAP), 0);
      const y = 700 + shift + (1 - p) * -160, buzz = f >= a && f < a + 10 ? Math.sin((f - a) * 2.4) * 6 * (1 - (f - a) / 10) : 0;
      return <div key={i} style={{position: 'absolute', left: 48, right: 48, top: y, height: H, opacity: Math.min(1, p * 2) * (below >= 3 ? 0.55 : 1), transform: `translateX(${buzz}px) scale(${0.94 + p * 0.06 - below * 0.015})`,
        background: '#f5f3e9', borderRadius: 44, padding: '26px 30px', display: 'flex', gap: 24, alignItems: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)'}}>
        <Badge slug={o.crest} size={110}/>
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}><Label color="#4f665a" size={30}>{o.app}</Label><Label color="#4f665a" size={28}>now</Label></div>
          <div style={{fontFamily: U, fontWeight: 700, fontSize: 46, lineHeight: 1.1, color: C.forest, marginTop: 4}}>{o.title}</div>
          <div style={{fontFamily: U, fontWeight: 700, fontSize: 36, lineHeight: 1.2, color: '#355a4b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{o.body}</div>
        </div>
      </div>;
    })}
    {f < end && <Caption f={f} fps={fps} cues={cues} dark bottom={150}/>}
    {f >= end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at 540px 800px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, end + 6, end + 14)}}/>
      <Lines f={f} from={end + 10} to={99999} top={820} size={140} lines={[['Find your team.', C.forest], ['Find your people.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1150, opacity: ease(f, end + 26, end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Join the waitlist · Link in bio</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Coming to the App Store</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
