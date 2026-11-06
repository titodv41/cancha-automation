// Story Reels v2.2 (owner-relayed review, Nov 6). StoryReel2 stays untouched so approved renders reproduce exactly.
// Changes: hard cuts with content on screen from the first frame (no empty transition frames); every label sits in its
// own header band above the recording instead of floating over it; recordings are cropped to the decision details and
// never show results outside the story; only the demonstrated button is outlined; the map heading has its own band and
// the map starts below it with accurate pin positions; one complete closing card with the logo, no logo-only beat.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain} from './PromoFaltaUno';
import {B, ease} from './PromoFaltaUnoV22';
import COUNTIES from './data/florida-counties.json';

const C = {ink: '#103f32', night: '#07130f', cream: '#f5f3e9', accent: '#d7ef86', mint: '#b9c8bf'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const L = 72, R = 900, W = R - L, TOP = 288, LOGO = 'generated/promo/cancha-trim.png';
const BOX_TOP = 440; // recordings start below the header band

type Rect = {x: number; y: number; w: number; h: number};
export type Scene3 =
  | {kind: 'hero'; beats: number; img: string; x?: number; headline: string[]; accent?: number; support: string}
  | {kind: 'map'; beats: number; headline: string; pins: {badge: string; lat: number; lng: number}[]; cards: {badge: string; lat: number; lng: number; name: string; line: string; status: string}[]}
  | {kind: 'rec'; beats: number; label: string; img: string; imgW: number; crop: [number, number]; dark?: boolean; zoom?: number; align?: 'left'; tap?: {x: number; y: number; at: number}; outline?: Rect & {at: number}; tag?: string}
  | {kind: 'end'; beats: number; action: string; line: string; link: string; soon: string};
export type Story3Props = {scenes: Scene3[]};
export const story3Frames = (scenes: Scene3[]) => scenes.reduce((a, s) => a + s.beats * B, 0);

// Entrances start half visible, so a hard cut never shows an empty frame.
const quick = (local: number, n = 6) => ease(local, 0, n, Easing.out(Easing.cubic));
const Title = ({lines, local, top, size = 112, accent = -1}: {lines: string[]; local: number; top: number; size?: number; accent?: number}) =>
  <div style={{position: 'absolute', left: L - 10, width: W + 70, top}}>
    {lines.map((l, i) => { const p = ease(local, i * 3, 8 + i * 3, Easing.out(Easing.cubic)); return <div key={i} style={{fontFamily: D, fontStyle: 'italic', fontSize: size, lineHeight: 0.92, textTransform: 'uppercase',
      color: i === accent ? C.accent : C.cream, opacity: 0.55 + 0.45 * p, transform: `translateY(${(1 - p) * 26}px)`, textShadow: '0 10px 40px #000c'}}>{l}</div>; })}
  </div>;
const Mark = () => <Img src={staticFile(LOGO)} style={{position: 'absolute', left: L, top: TOP - 110, width: 150, filter: 'brightness(0) invert(1)', opacity: 0.9}}/>;

function Hero({s, local}: {s: Extract<Scene3, {kind: 'hero'}>; local: number}) {
  const sup = ease(local, 0, 9); // full opacity by 0.3 s
  return <AbsoluteFill style={{background: C.night}}>
    <Img src={staticFile(s.img)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(s.x ?? 0.5) * 100}% 50%`, transform: `scale(${1.03 + local * 0.0006})`}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,10,12,.25) 0%, rgba(5,10,12,.15) 30%, rgba(5,10,12,.6) 58%, rgba(5,10,12,.55) 85%, rgba(5,10,12,.3) 100%)'}}/>
    <Mark/>
    <Title lines={s.headline} local={local} top={1250 - 120 - s.headline.length * 112 * 0.92 - 10} accent={s.accent}/>
    <div style={{position: 'absolute', left: L, top: 1250 - 100, fontFamily: U, fontWeight: 600, fontSize: 40, lineHeight: 1.18, color: C.cream, opacity: 0.4 + 0.6 * sup, whiteSpace: 'pre-line', textShadow: '0 4px 18px #000c'}}>{s.support}</div>
  </AbsoluteFill>;
}

// Two counties from Census shapes, mapped below the heading band. Pins keep their real positions.
const LAT: [number, number] = [25.66, 26.33], Y: [number, number] = [720, 1250], LNG0 = -80.30;
function project(lng: number, lat: number) { const sc = (Y[1] - Y[0]) / (LAT[1] - LAT[0]), k = Math.cos(25.9 * Math.PI / 180); return {x: 540 + (lng - LNG0) * sc * k, y: Y[0] + (LAT[1] - lat) * sc}; }
function MapScene({s, local, dur}: {s: Extract<Scene3, {kind: 'map'}>; local: number; dur: number}) {
  const intro = B, seg = (dur - intro) / s.cards.length, active = Math.max(0, Math.min(s.cards.length - 1, Math.floor((local - intro) / seg)));
  const card = local >= intro ? s.cards[active] : null, cp = card ? quick(local - intro - active * seg, 8) : 0;
  const path = (rings: number[][][]) => rings.map(r => 'M' + r.map(([x, y]) => { const q = project(x, y); return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join('L') + 'Z').join('');
  const counties = COUNTIES as {fips: string; rings: number[][][]}[], hi = new Set(['12086', '12011']), draw = interpolate(local, [0, 10], [0.6, 1], cl);
  return <AbsoluteFill style={{background: '#06121a'}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: draw}}>
      {counties.map(c => <path key={c.fips} d={path(c.rings)} fill={hi.has(c.fips) ? `${C.accent}1f` : '#0f2722'} stroke={C.accent} strokeOpacity={hi.has(c.fips) ? 0.9 : 0.15} strokeWidth={hi.has(c.fips) ? 3 : 1}/>)}
    </svg>
    {s.pins.map((p, i) => { const q = project(p.lng, p.lat), on = card && card.badge === p.badge;
      return <div key={i} style={{position: 'absolute', left: q.x - 10, top: q.y - 10, width: 20, height: 20, borderRadius: 10, background: on ? C.accent : '#ffffff59', boxShadow: on ? `0 0 0 14px ${C.accent}40` : undefined}}/>; })}
    {card && (() => { const q = project(card.lng, card.lat); return <div style={{position: 'absolute', left: q.x - 56, top: q.y - 132, width: 112, height: 112, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px #000a', transform: `scale(${0.6 + 0.4 * cp})`}}>
      <Img src={staticFile(card.badge)} style={{width: '82%', height: '82%', objectFit: 'contain'}}/></div>; })()}
    {/* heading band: the map never runs under the title */}
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 640, background: 'linear-gradient(180deg, #06121a 88%, #06121a00)'}}/>
    <Mark/>
    <Title lines={s.headline.split('\n')} local={local} top={TOP + 70} accent={1}/>
    {card && <div style={{position: 'absolute', left: L, width: W, top: 1300, borderRadius: 24, background: '#0b1714f2', border: `2px solid ${C.accent}`, padding: '24px 28px', opacity: 0.4 + 0.6 * cp, transform: `translateY(${(1 - cp) * 16}px)`}}>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 52, lineHeight: 1, color: C.cream, textTransform: 'uppercase'}}>{card.name}</div>
      <div style={{fontFamily: U, fontWeight: 600, fontSize: 38, color: C.cream, marginTop: 10}}>{card.line}</div>
      <div style={{fontFamily: U, fontWeight: 600, fontSize: 34, color: C.accent, marginTop: 6}}>{card.status}</div></div>}
  </AbsoluteFill>;
}

// A real recording below a header band. The crop holds still, then a tap lands; only the demonstrated control is outlined.
function Rec({s, local}: {s: Extract<Scene3, {kind: 'rec'}>; local: number}) {
  const [y0, y1] = s.crop, availH = 1920 - BOX_TOP - 40, fit = Math.min(1080 / s.imgW, availH / (y1 - y0)) * (s.zoom ?? 1);
  const w = s.imgW * fit, left = s.align === 'left' ? L : (1080 - w) / 2; // left-aligned shots clear Instagram's right-hand buttons
  const tapP = s.tap ? interpolate(local, [s.tap.at - 4, s.tap.at, s.tap.at + 12], [0, 1, 0], cl) : 0, ol = s.outline ? quick(local - s.outline.at, 6) * (local >= s.outline.at ? 1 : 0) : 0;
  return <AbsoluteFill style={{background: C.night}}>
    <div style={{position: 'absolute', left, top: BOX_TOP, width: w, height: (y1 - y0) * fit, overflow: 'hidden', borderRadius: 28, boxShadow: '0 20px 60px #000a'}}>
      <div style={{position: 'absolute', left: 0, top: -y0 * fit, width: w}}>
        <Img src={staticFile(s.img)} style={{width: w, display: 'block'}}/>
        {s.outline && <div style={{position: 'absolute', left: s.outline.x * fit - 6, top: s.outline.y * fit - 6, width: s.outline.w * fit + 12, height: s.outline.h * fit + 12, borderRadius: 18, border: `3px solid ${C.accent}`, boxShadow: `0 0 0 3px ${C.ink}`, opacity: ol}}/>}
        {s.tap && <div style={{position: 'absolute', left: s.tap.x * fit - 56, top: s.tap.y * fit - 56, width: 112, height: 112, borderRadius: 56, background: s.dark ? `${C.accent}40` : `${C.ink}33`, border: `6px solid ${s.dark ? C.accent : C.ink}`, opacity: tapP, transform: `scale(${0.7 + tapP * 0.3})`}}/>}
      </div>
    </div>
    <Mark/>
    <div style={{position: 'absolute', left: L, width: W + 60, top: TOP, fontFamily: D, fontStyle: 'italic', fontSize: 58, lineHeight: 0.98, textTransform: 'uppercase', color: C.accent, whiteSpace: 'pre-line', opacity: 0.55 + 0.45 * quick(local)}}>{s.label}</div>
  </AbsoluteFill>;
}

function End({s, local}: {s: Extract<Scene3, {kind: 'end'}>; local: number}) {
  const p = quick(local, 6), row = (i: number) => ({opacity: 0.5 + 0.5 * ease(local, i * 2, 6 + i * 2), transform: `translateY(${(1 - ease(local, i * 2, 6 + i * 2)) * 14}px)`});
  return <AbsoluteFill style={{background: C.ink, alignItems: 'center'}}>
    <div style={{position: 'absolute', left: L, width: W, top: 520, display: 'flex', flexDirection: 'column', gap: 26}}>
      <Img src={staticFile(LOGO)} style={{width: 280, filter: 'brightness(0) invert(1)', opacity: 0.6 + 0.4 * p, marginBottom: 30}}/>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 88, lineHeight: 0.95, color: C.accent, textTransform: 'uppercase', ...row(0)}}>{s.action}</div>
      <div style={{fontFamily: U, fontWeight: 600, fontSize: 46, color: C.cream, ...row(1)}}>{s.line}</div>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 56, color: C.cream, textTransform: 'uppercase', ...row(2)}}>{s.link}</div>
      <div style={{fontFamily: U, fontWeight: 600, fontSize: 36, color: C.mint, ...row(3)}}>{s.soon}</div>
    </div>
  </AbsoluteFill>;
}

export const StoryReel3 = ({scenes}: Story3Props) => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  let start = 0;
  const parts = scenes.map(s => { const from = start; start += s.beats * B; return {s, from, dur: s.beats * B}; });
  const cur = parts.find(p => f >= p.from && f < p.from + p.dur) ?? parts[parts.length - 1], local = f - cur.from, s = cur.s;
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    {s.kind === 'hero' ? <Hero s={s} local={local}/> : s.kind === 'map' ? <MapScene s={s} local={local} dur={cur.dur}/> : s.kind === 'rec' ? <Rec s={s} local={local}/> : <End s={s} local={local}/>}
    <Grain/>
  </AbsoluteFill>;
};
