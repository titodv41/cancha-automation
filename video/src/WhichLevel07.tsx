// Teaching video 07 "Rec or competitive: which level are you?" (Nov 23). Same rules as 05/06: brand type only, masked
// title reveals, taps on the transitions, drawn UI, real logo on the end card, no Expo link, no 18+ copy, Chris voice.
// Facts: rec = South Florida Club Sport weeknight 6v6/7v7 leagues with solo sign-up and no tryout (src/openings.ts,
// checked Nov 18); competitive = UPSL clubs from the Cancha directory (crests), tryouts/Talent IDs, 11v11.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, interpolate} from 'remotion';
import {Badge, C, D, Label, Lines, ease} from './FindTeam01';

export type Cue07 = {rec: number; comp: number; cancha: number; send: number; end: number; total: number};
// Timed to Chris's narration (video/audio/narration/teach-07.json).
export const CUES_07: Cue07 = {rec: 4.1, comp: 9.3, cancha: 15.5, send: 19.3, end: 20.3, total: 23.5};
const UPSL = ['117-fc-academy', 'asa-itss', 'boca-jrs-miami-fc', 'futsoc', 'florida-island-united', 'miami-united-fc'];

function Tap({f, at}: {f: number; at: number}) {
  if (f < at - 1 || f > at + 14) return null;
  const p = ease(f, at, at + 13, Easing.out(Easing.quad));
  return <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none', zIndex: 3}}>
    <div style={{position: 'absolute', left: -50, top: -50, width: 100, height: 100, borderRadius: 50, border: `5px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.1})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 22, background: '#ffffffd9', opacity: f < at + 6 ? 1 : Math.max(0, 1 - (f - at - 6) / 7)}}/>
  </div>;
}
const pop = (f: number, at: number) => f >= at && f < at + 10 ? 1 + 0.07 * Math.sin((f - at) / 10 * Math.PI) : 1;
function Tag({f, at, label, tone = C.lime}: {f: number; at: number; label: string; tone?: string}) {
  const p = spring({frame: f - at, fps: 30, config: {damping: 13, stiffness: 170}});
  if (f < at) return null;
  return <div style={{position: 'relative', padding: '18px 30px', borderRadius: 999, background: tone, transform: `scale(${p * pop(f, at)})`}}><Label color={C.forest} size={40}>{label}</Label><Tap f={f} at={at}/></div>;
}
function Chip({f, label, at}: {f: number; label: string; at?: number}) {
  const lit = at !== undefined && f >= at + 2;
  return <div style={{position: 'relative', padding: '14px 24px', borderRadius: 999, background: lit ? C.lime : 'transparent', border: `2px solid ${lit ? C.lime : '#ffffff33'}`, transform: `scale(${at !== undefined ? pop(f, at) : 1})`}}>
    <Label color={lit ? C.forest : C.cream} size={30}>{label}</Label>{at !== undefined && <Tap f={f} at={at}/>}</div>;
}
// Top-down pitch with two teams of dots; n players a side.
function Pitch({f, at, n, w, h}: {f: number; at: number; n: number; w: number; h: number}) {
  const lay = (k: number, home: boolean) => {
    const rows = n === 7 ? [1, 3, 3] : [1, 4, 3, 3];
    let r = 0, c = k; while (c >= rows[r]) { c -= rows[r]; r++; }
    const gap = n === 7 ? 0.15 : 0.12, x = (c + 1) / (rows[r] + 1) * w, y = (home ? 0.93 - r * gap : 0.07 + r * gap) * h;
    return {x, y};
  };
  return <div style={{position: 'relative', width: w, height: h, borderRadius: 28, background: '#2f6b4f', border: `4px solid #d7ef8666`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: h / 2 - 2, height: 4, background: '#d7ef8666'}}/>
    <div style={{position: 'absolute', left: w / 2 - 70, top: h / 2 - 70, width: 140, height: 140, borderRadius: 70, border: '4px solid #d7ef8666'}}/>
    {[true, false].map(home => Array.from({length: n}).map((_, k) => { const p = lay(k, home), s = spring({frame: f - at - k * 2 - (home ? 0 : 6), fps: 30, config: {damping: 12, stiffness: 180}});
      return <div key={`${home}${k}`} style={{position: 'absolute', left: p.x - 20, top: p.y - 20, width: 40, height: 40, borderRadius: 20, background: home ? C.lime : C.orange, transform: `scale(${s})`}}/>; }))}
  </div>;
}

export function WhichLevel07({cues = CUES_07}: {cues?: Cue07}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps), t = {rec: s(cues.rec), comp: s(cues.comp), cancha: s(cues.cancha), send: s(cues.send), end: s(cues.end)};
  const wipe = ease(f, t.end - 2, t.end + 16, Easing.inOut(Easing.cubic));
  // Level slider (hook): the knob swings between Rec and Competitive, then settles on the scene's level.
  const knob = f < t.rec ? 0.5 + 0.45 * Math.sin(f / 14) : f < t.comp ? interpolate(f, [t.rec, t.rec + 12], [0.5, 0.06], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : f < t.cancha ? interpolate(f, [t.comp, t.comp + 12], [0.06, 0.94], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0.5;
  const inScene = (a: number, b: number) => ({opacity: ease(f, a, a + 8) * (1 - ease(f, b - 6, b)), transform: `translateX(${(1 - ease(f, a, a + 12, Easing.out(Easing.cubic))) * 120 - ease(f, b - 6, b) * 120}px)`});
  const sent = spring({frame: f - t.send - 6, fps, config: {damping: 15, stiffness: 140}});

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>

    {/* Level slider */}
    {f < t.end && <div style={{position: 'absolute', left: 90, right: 90, top: f < t.rec ? 860 : 520, transition: 'none', opacity: f < t.cancha ? 1 : 1 - ease(f, t.cancha, t.cancha + 8)}}>
      <div style={{position: 'relative', height: 16, borderRadius: 8, background: '#ffffff26'}}>
        <div style={{position: 'absolute', left: 0, width: `${knob * 100}%`, height: 16, borderRadius: 8, background: C.lime}}/>
        <div style={{position: 'absolute', left: `calc(${knob * 100}% - 34px)`, top: -26, width: 68, height: 68, borderRadius: 34, background: C.cream, boxShadow: '0 10px 30px rgba(0,0,0,0.35)'}}/>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40}}><Label size={36} color={knob < 0.3 ? C.lime : C.mint}>Rec</Label><Label size={36} color={knob > 0.3 && knob < 0.7 ? C.lime : C.mint}>In between</Label><Label size={36} color={knob > 0.7 ? C.lime : C.mint}>Competitive</Label></div>
    </div>}

    {/* Rec */}
    {f >= t.rec - 2 && f < t.comp + 2 && <div style={{position: 'absolute', left: 90, right: 90, top: 760, ...inScene(t.rec, t.comp)}}>
      <Pitch f={f} at={t.rec + 6} n={7} w={900} h={520}/>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 34}}>
        <Tag f={f} at={t.rec + 45} label="Weeknights"/><Tag f={f} at={t.rec + 60} label="7 v 7"/><Tag f={f} at={t.rec + 85} label="Sign up solo"/><Tag f={f} at={t.rec + 105} label="No tryout" tone={C.cream}/>
      </div>
    </div>}

    {/* Competitive */}
    {f >= t.comp - 2 && f < t.cancha + 2 && <div style={{position: 'absolute', left: 90, right: 90, top: 760, ...inScene(t.comp, t.cancha)}}>
      <Pitch f={f} at={t.comp + 6} n={11} w={900} h={520}/>
      <div style={{display: 'flex', gap: 14, marginTop: 30}}>{UPSL.map((slug, i) => { const p = spring({frame: f - t.comp - 30 - i * 3, fps, config: {damping: 12, stiffness: 170}}); return <div key={slug} style={{transform: `scale(${p})`}}><Badge slug={slug} size={128}/></div>; })}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 26}}>
        <Tag f={f} at={t.comp + 80} label="UPSL clubs"/><Tag f={f} at={t.comp + 110} label="Tryouts" tone={C.orange}/><Tag f={f} at={t.comp + 125} label="Full field"/>
      </div>
    </div>}

    {/* Cancha: tell us your level */}
    {f >= t.cancha - 4 && f < t.end && <div style={{position: 'absolute', left: 140, right: 140, top: 560, height: 1200, borderRadius: 80, background: '#050a08', boxShadow: '0 60px 140px rgba(0,0,0,0.55), inset 0 0 0 3px #2a3a33', transform: `translateY(${(1 - spring({frame: f - t.cancha + 4, fps, config: {damping: 16, stiffness: 90}})) * 1200}px)`}}>
      <div style={{position: 'absolute', inset: 16, borderRadius: 66, overflow: 'hidden', background: C.forest, padding: '90px 40px 40px', display: 'flex', flexDirection: 'column', gap: 22}}>
        <div style={{position: 'absolute', top: 20, left: '50%', width: 150, height: 40, marginLeft: -75, borderRadius: 22, background: '#000'}}/>
        <Img src={staticFile('generated/promo/cancha-trim.png')} style={{width: 210, filter: 'brightness(0) invert(0.96)'}}/>
        <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 64, lineHeight: 1, color: C.cream, textTransform: 'uppercase'}}>Find me a team</div>
        <Label size={26}>Level</Label>
        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}><Chip f={f} label="Casual"/><Chip f={f} label="Intermediate" at={t.cancha + 30}/><Chip f={f} label="Competitive"/></div>
        <Label size={26}>Area</Label>
        <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}><Chip f={f} label="Miami"/><Chip f={f} label="Hialeah" at={t.cancha + 52}/><Chip f={f} label="Doral"/></div>
        <div style={{marginTop: 'auto', position: 'relative', height: 92, borderRadius: 24, background: C.lime, display: 'grid', placeItems: 'center', transform: `scale(${pop(f, t.send)})`}}>
          <Label color={C.forest} size={32}>{f >= t.send + 3 ? '✓ Sent' : 'Find me a team'}</Label><Tap f={f} at={t.send}/></div>
        {f >= t.send + 4 && <div style={{position: 'absolute', left: 24, right: 24, bottom: 150, background: C.lime, borderRadius: 28, padding: 26, transform: `translateY(${(1 - sent) * 400}px)`}}>
          <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 54, lineHeight: 1, color: C.forest, textTransform: 'uppercase'}}>We're on it.</div>
          <div style={{marginTop: 8}}><Label color={C.forest} size={26}>A team at your level</Label></div></div>}
      </div>
    </div>}

    <Lines f={f} from={4} to={t.rec - 2} top={190} size={140} lines={[['Rec or', C.cream], ['competitive?', C.lime]]}/>
    <Lines f={f} from={t.rec + 2} to={t.comp - 2} top={190} size={140} lines={[['Rec', C.cream], ['For fun.', C.lime]]}/>
    <Lines f={f} from={t.comp + 2} to={t.cancha - 2} top={190} size={140} lines={[['Competitive', C.cream], ['Club + league.', C.lime]]}/>
    <Lines f={f} from={t.cancha + 2} to={t.end} top={190} size={120} lines={[['Not sure?', C.cream], ['Tell Cancha.', C.lime]]}/>

    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at 540px 1500px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={99999} top={820} size={150} lines={[['Find me', C.forest], ['a team.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1170, opacity: ease(f, t.end + 26, t.end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Link in bio · Free</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Miami-Dade + Broward</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
