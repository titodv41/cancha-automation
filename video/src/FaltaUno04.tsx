// Launch ad 04 "Falta uno / One player short" (owner, Nov 18: more simple UI ads with taps; "Falta uno" is its own
// campaign: your team is one player short). A top-down pitch with a 4-3-3; one spot glows orange and empty. The
// captain's post appears, a player taps "I'm in", their player card flies into the spot, the lineup is full and
// the team bounces. Illustrated, no club named. Same motion language and brand type as the other launch ads.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, Caption, D, Label, Lines, U, ease, inC} from './FindTeam01';

export type Cue04 = {post: number; tap: number; fill: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_04: Cue04 = {post: 2.6, tap: 5.4, fill: 6.2, end: 10.4, total: 14.4, captions: [
  {at: 0.2, to: 2.4, text: 'Sunday, eight a.m. One player short.'},
  {at: 2.6, to: 5.2, text: 'On Cancha, the captain posts the spot,'},
  {at: 5.4, to: 7.4, text: "a player taps I'm in,"},
  {at: 7.6, to: 10.0, text: 'and the lineup is full.'},
]};
// 4-3-3 on a 900 x 1240 pitch (attacking up). The empty spot is the left back.
const SPOTS: [string, number, number][] = [['GK', 450, 1150], ['RB', 760, 930], ['CB', 560, 980], ['CB', 340, 980], ['LB', 140, 930], ['CM', 450, 720], ['CM', 690, 650], ['CM', 210, 650], ['RW', 760, 380], ['ST', 450, 300], ['LW', 140, 380]];
const EMPTY = 4, PX = 90, PY = 540;

export function FaltaUno04({cues = CUES_04}: {cues?: Cue04}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps), t = {post: s(cues.post), tap: s(cues.tap), fill: s(cues.fill), end: s(cues.end)};
  const pitchIn = spring({frame: f, fps, config: {damping: 18, stiffness: 90}});
  const postIn = spring({frame: f - t.post, fps, config: {damping: 15, stiffness: 140}}), postOut = ease(f, t.fill - 2, t.fill + 10, inC);
  const fly = ease(f, t.fill, t.fill + 18, Easing.inOut(Easing.cubic)), filled = f >= t.fill + 16;
  const wipe = ease(f, t.end - 2, t.end + 16, Easing.inOut(Easing.cubic));
  const [, ex, ey] = SPOTS[EMPTY], target = {x: PX + ex, y: PY + ey}, from = {x: 540, y: 1470};
  const pulse = 1 + 0.08 * Math.sin(f / 4);

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>
    {/* Pitch */}
    <div style={{position: 'absolute', left: PX, top: PY, width: 900, height: 1240, borderRadius: 36, overflow: 'hidden', transform: `translateY(${(1 - pitchIn) * 300}px)`, opacity: pitchIn,
      background: 'repeating-linear-gradient(0deg, #17503f 0 124px, #144a3a 124px 248px)', boxShadow: 'inset 0 0 0 4px #f5f3e933'}}>
      <svg width={900} height={1240} style={{position: 'absolute', inset: 0}} fill="none" stroke="#f5f3e933" strokeWidth={4}>
        <line x1={0} y1={620} x2={900} y2={620}/><circle cx={450} cy={620} r={110}/><rect x={230} y={-4} width={440} height={190}/><rect x={230} y={1054} width={440} height={190}/>
      </svg>
    </div>
    {SPOTS.map(([pos, x, y], i) => {
      const a = 8 + i * 2, p = spring({frame: f - a, fps, config: {damping: 12, stiffness: 180}});
      const cheer = filled && i !== EMPTY ? Math.max(0, Math.sin((f - t.fill - 16 - i * 1.5) / 4)) * 14 * (f < t.fill + 50 ? 1 : 0) : 0;
      if (i === EMPTY) {
        if (filled) return null;
        return <div key={i} style={{position: 'absolute', left: PX + x - 62, top: PY + y - 62, width: 124, height: 124, borderRadius: 62, border: `5px dashed ${C.orange}`, display: 'grid', placeItems: 'center',
          transform: `scale(${p * pulse})`, background: '#f55b3222'}}><span style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 64, color: C.orange}}>?</span></div>;
      }
      return <div key={i} style={{position: 'absolute', left: PX + x - 56, top: PY + y - 56 - cheer, width: 112, height: 112, borderRadius: 56, background: C.cream, display: 'grid', placeItems: 'center', transform: `scale(${p})`, boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>
        <Label color={C.forest} size={34}>{pos}</Label></div>;
    })}
    {/* The filled spot */}
    {f >= t.fill && (() => { const x = from.x + (target.x - from.x) * fly, y = from.y + (target.y - from.y) * fly, sz = 240 - 116 * fly;
      return <div style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, borderRadius: sz / 2, background: C.lime, display: 'grid', placeItems: 'center', boxShadow: `0 0 0 ${filled ? 8 + 6 * Math.max(0, 1 - (f - t.fill - 16) / 20) : 0}px #d7ef8655, 0 14px 30px rgba(0,0,0,0.4)`}}>
        <Label color={C.forest} size={34 + 30 * (1 - fly)}>{fly < 0.6 ? 'You' : 'LB'}</Label></div>; })()}

    {/* Captain's post with I'm in */}
    {f >= t.post && f < t.fill + 12 && <div style={{position: 'absolute', left: 48, right: 48, top: 1320, transform: `translateY(${(1 - postIn) * 400 + postOut * 60}px)`, opacity: Math.min(1, postIn * 2) * (1 - postOut),
      background: '#0b2a21', borderRadius: 48, padding: 40, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', border: '2px solid #ffffff14'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Label size={32}>Captain · Sunday 8 AM</Label>
        <span style={{background: C.orange, borderRadius: 999, padding: '6px 18px'}}><Label color={C.cream} size={28}>Falta uno</Label></span></div>
      <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 92, lineHeight: 1, color: C.cream, textTransform: 'uppercase', margin: '14px 0 24px'}}>We need a left back</div>
      {(() => { const done = f >= t.tap + 3, pop = f >= t.tap && f < t.tap + 12 ? 1 + 0.06 * Math.sin((f - t.tap) / 12 * Math.PI) : 1;
        return <div style={{height: 108, borderRadius: 28, background: C.lime, display: 'grid', placeItems: 'center', transform: `scale(${pop})`}}><Label color={C.forest} size={40}>{done ? "✓ You're in" : "I'm in"}</Label></div>; })()}
    </div>}
    {f >= t.tap - 1 && f < t.tap + 15 && (() => { const p = ease(f, t.tap, t.tap + 14, Easing.out(Easing.quad)); return <><div style={{position: 'absolute', left: 540 - 70, top: 1680 - 70, width: 140, height: 140, borderRadius: 70, border: `6px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.2})`, opacity: 1 - p}}/><div style={{position: 'absolute', left: 510, top: 1650, width: 60, height: 60, borderRadius: 30, background: '#ffffffd9', opacity: 1 - p}}/></>; })()}

    <Lines f={f} from={0} to={t.fill + 4} top={170} lines={[['Falta uno.', C.cream], ['One player short.', C.orange]]} size={124}/>
    <Lines f={f} from={t.fill + 8} to={t.end} top={170} size={150} lines={[['Lineup', C.cream], ['complete.', C.lime]]}/>
    {f < t.end && <Caption f={f} fps={fps} cues={cues} dark bottom={140}/>}

    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at ${target.x}px ${target.y}px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={99999} top={820} size={140} lines={[['Find your team.', C.forest], ['Find your people.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1150, opacity: ease(f, t.end + 26, t.end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Join the waitlist · Link in bio</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Coming to the App Store</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
