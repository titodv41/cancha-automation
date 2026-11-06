// Story Reels (owner, Nov 6): cool soccer stories (business, ownership, culture) told with real images and Cancha motion
// graphics. One JSON per story (content/instagram/stories/<id>.json) lists scenes; this file only knows how to draw them.
// Scene kinds: photo (Ken Burns + kinetic headline), ladder (a club climbing divisions), compare (two columns),
// end (logo + one CTA). Timing runs on the 120 BPM beat grid shared with the promos (B = 15 frames).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, MovingGrid} from './PromoFaltaUno';
import {B, back, ease, Whip} from './PromoFaltaUnoV22';
import COUNTIES from './data/florida-counties.json'; // US Census 2023 cartographic boundaries (public domain), simplified

const BASE = {forest: '#103f32', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#b9c8bf'};
// Club look (owner, Nov 6): a story can set its accent (lime by default) and the ink drawn on that accent.
let C = BASE;
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type Photo = {src: string; x?: number; y?: number; zoom?: number; dir?: 1 | -1};
export type Scene =
  | {kind: 'photo'; beats: number; photo: Photo; kicker?: string; lines: string[]; accent?: number; place?: 'top' | 'bottom'; badge?: string}
  | {kind: 'pins'; beats: number; title: string; sub?: string; pins: {badge: string; lat: number; lng: number; name?: string}[]; cities: {name: string; lat: number; lng: number}[]; highlight?: string[]}
  | {kind: 'ladder'; beats: number; title: string; steps: {label: string; year: string}[]; photo?: Photo}
  | {kind: 'compare'; beats: number; title: string; left: {head: string; lines: string[]}; right: {head: string; lines: string[]}; photo?: Photo}
  | {kind: 'stat'; beats: number; from: number; to: number; prefix?: string; lines: string[]; photo?: Photo}
  | {kind: 'end'; beats: number; title: string; line: string; badge?: string};
export type StoryProps = {scenes: Scene[]; credit?: string; theme?: {accent: string; ink: string; bg?: string}};

export const storyFrames = (scenes: Scene[]) => scenes.reduce((a, s) => a + s.beats * B, 0);

function Bg({photo, local, dur, dim = 0.55, blur = 0}: {photo: Photo; local: number; dur: number; dim?: number; blur?: number}) {
  const p = interpolate(local, [0, dur], [0, 1], cl), z = (photo.zoom ?? 1.15) + 0.08 * p, dx = (photo.dir ?? 1) * (p - 0.5) * 40;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <Img src={staticFile(photo.src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${(photo.x ?? 0.5) * 100}% ${(photo.y ?? 0.5) * 100}%`,
      transform: `scale(${z}) translateX(${dx}px)`, filter: blur ? `blur(${blur}px)` : undefined}}/>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,19,15,${dim * 0.35}) 0%, rgba(7,19,15,${dim * 0.15}) 40%, rgba(7,19,15,${dim}) 78%, rgba(7,19,15,${Math.min(1, dim + 0.3)}) 100%)`}}/>
  </AbsoluteFill>;
}

function Headline({lines, local, accent = -1, size = 132, top}: {lines: string[]; local: number; accent?: number; size?: number; top: number}) {
  return <div style={{position: 'absolute', left: 60, right: 50, top}}>
    {lines.map((l, i) => {
      const p = ease(local, 4 + i * 5, 14 + i * 5);
      return <div key={i} style={{fontFamily: D, fontStyle: 'italic', fontSize: size, lineHeight: 0.9, textTransform: 'uppercase', color: i === accent ? C.lime : C.cream,
        transform: `translateY(${(1 - p) * 70}px)`, opacity: Math.min(1, p * 1.4), filter: p < 0.9 ? `blur(${(1 - p) * 10}px)` : undefined, textShadow: '0 10px 40px #000c'}}>{l}</div>;
    })}
  </div>;
}

function PhotoScene({s, local, dur}: {s: Extract<Scene, {kind: 'photo'}>; local: number; dur: number}) {
  const k = ease(local, 0, 8, back), h = s.lines.length * 120;
  return <AbsoluteFill>
    <Bg photo={s.photo} local={local} dur={dur}/>
    {s.kicker && <div style={{position: 'absolute', left: 60, top: s.place === 'top' ? 200 : 1450 - h, display: 'flex', alignItems: 'center', gap: 18, opacity: Math.min(1, k),
      transform: `translateX(${(1 - Math.min(1, k)) * -60}px)`}}><div style={{width: 56, height: 8, borderRadius: 4, background: C.lime}}/>
      <span style={{fontFamily: D, fontStyle: 'italic', fontSize: 58, color: C.lime, textTransform: 'uppercase', letterSpacing: 1, textShadow: '0 6px 24px #000c'}}>{s.kicker}</span></div>}
    <Headline lines={s.lines} local={local} accent={s.accent} top={s.place === 'top' ? 290 : 1540 - h}/>
    {s.badge && <Badge src={s.badge} size={170} style={{position: 'absolute', right: 60, top: 60, transform: `scale(${k}) rotate(${(1 - Math.min(1, k)) * -20}deg)`}}/>}
  </AbsoluteFill>;
}

const Badge = ({src, size, style}: {src: string; size: number; style?: React.CSSProperties}) =>
  <div style={{width: size, height: size, borderRadius: size * 0.24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px #0008', ...style}}>
    <Img src={staticFile(src)} style={{width: '80%', height: '80%', objectFit: 'contain'}}/></div>;

// A club climbing the pyramid: steps rise from the bottom, a lime marker climbs one step per beat.
function Ladder({s, local, dur}: {s: Extract<Scene, {kind: 'ladder'}>; local: number; dur: number}) {
  const n = s.steps.length, climb = interpolate(local, [B, dur - B], [0, n - 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const at = Math.round(climb), rowH = 190, base = 1600;
  return <AbsoluteFill style={{background: C.night}}>
    {s.photo && <Bg photo={s.photo} local={local} dur={dur} dim={0.85} blur={8}/>}
    <MovingGrid f={local} opacity={0.06}/>
    <div style={{position: 'absolute', left: 60, right: 60, top: 170, fontFamily: D, fontStyle: 'italic', fontSize: 120, lineHeight: 0.9, color: C.cream, textTransform: 'uppercase', opacity: ease(local, 0, 8), whiteSpace: 'pre-line'}}>{s.title}</div>
    {s.steps.map((st, i) => {
      const on = ease(local, 4 + i * 3, 12 + i * 3, back), reached = i <= at, top = base - (i + 1) * rowH, w = 700 + i * 60;
      return <div key={i} style={{position: 'absolute', left: 60, top, width: w, height: rowH - 22, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        background: reached ? (i === at ? C.lime : '#d7ef8633') : '#ffffff12', border: `3px solid ${reached ? C.lime : '#ffffff30'}`, transform: `translateX(${(1 - on) * -400}px)`, opacity: Math.min(1, on)}}>
        <span style={{fontFamily: D, fontStyle: 'italic', fontSize: 78, color: i === at ? C.forest : C.cream, textTransform: 'uppercase'}}>{st.label}</span>
        <span style={{fontFamily: D, fontStyle: 'italic', fontSize: 56, color: i === at ? C.forest : C.mint, textTransform: 'uppercase'}}>{st.year}</span></div>;
    })}
  </AbsoluteFill>;
}

function Compare({s, local, dur}: {s: Extract<Scene, {kind: 'compare'}>; local: number; dur: number}) {
  const col = (c: {head: string; lines: string[]}, i: number) => {
    const p = ease(local, 8 + i * 10, 18 + i * 10, back);
    return <div style={{flex: 1, borderRadius: 32, padding: '34px 30px', background: i ? C.lime : '#ffffff14', border: `3px solid ${i ? C.lime : '#ffffff30'}`,
      transform: `translateY(${(1 - p) * 140}px)`, opacity: Math.min(1, p), display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 88, lineHeight: 0.9, color: i ? C.forest : C.cream, textTransform: 'uppercase'}}>{c.head}</div>
      {c.lines.map((l, k) => <div key={k} style={{fontFamily: U, fontSize: 54, lineHeight: 1.1, color: i ? C.forest : C.cream, opacity: ease(local, 16 + i * 10 + k * 4, 24 + i * 10 + k * 4)}}>{l}</div>)}
    </div>;
  };
  return <AbsoluteFill style={{background: C.forest}}>
    {s.photo && <Bg photo={s.photo} local={local} dur={dur} dim={0.9} blur={6}/>}
    <MovingGrid f={local} opacity={0.06}/>
    <div style={{position: 'absolute', left: 60, right: 60, top: 220, fontFamily: D, fontStyle: 'italic', fontSize: 140, lineHeight: 0.88, color: C.cream, textTransform: 'uppercase', opacity: ease(local, 0, 8), whiteSpace: 'pre-line',
      transform: `translateY(${(1 - ease(local, 0, 10)) * 60}px)`}}>{s.title}</div>
    <div style={{position: 'absolute', left: 50, right: 50, top: 700, display: 'flex', gap: 24}}>{col(s.left, 0)}{col(s.right, 1)}</div>
  </AbsoluteFill>;
}

// Clubs on the real map (owner, Nov 6: "use the real map, make people say wow"). Real Florida county shapes; the camera
// starts on the whole state, flies into South Florida, the highlighted counties light up, then each crest lands at its city.
type Box = {lng: [number, number]; lat: [number, number]};
const FLORIDA: Box = {lng: [-87.7, -79.9], lat: [24.4, 31.05]}, SOFLA: Box = {lng: [-80.62, -79.98], lat: [25.38, 26.36]};
const VIEW = {x: 40, y: 440, w: 1000, h: 1340};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function projector(box: Box) {
  const k = Math.cos(((box.lat[0] + box.lat[1]) / 2) * Math.PI / 180), dx = (box.lng[1] - box.lng[0]) * k, dy = box.lat[1] - box.lat[0];
  const sc = Math.min(VIEW.w / dx, VIEW.h / dy), cx = (box.lng[0] + box.lng[1]) / 2, cy = (box.lat[0] + box.lat[1]) / 2;
  return (lng: number, lat: number) => ({x: VIEW.x + VIEW.w / 2 + (lng - cx) * k * sc, y: VIEW.y + VIEW.h / 2 - (lat - cy) * sc});
}
function Pins({s, local, dur}: {s: Extract<Scene, {kind: 'pins'}>; local: number; dur: number}) {
  const fly = ease(local, 1.5 * B, 4.5 * B, Easing.inOut(Easing.cubic)), lit = ease(local, 4.5 * B, 5.5 * B);
  const box: Box = {lng: [lerp(FLORIDA.lng[0], SOFLA.lng[0], fly), lerp(FLORIDA.lng[1], SOFLA.lng[1], fly)], lat: [lerp(FLORIDA.lat[0], SOFLA.lat[0], fly), lerp(FLORIDA.lat[1], SOFLA.lat[1], fly)]};
  const P = projector(box), hi = new Set(s.highlight ?? ['12086', '12011']), draw = ease(local, 0, 1.5 * B);
  const path = (rings: number[][][]) => rings.map(r => 'M' + r.map(([x, y]) => { const q = P(x, y); return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join('L') + 'Z').join('');
  const counties = COUNTIES as {fips: string; name: string; rings: number[][][]}[];
  const seen: Record<string, number> = {};
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 55%, #0e2b3b 0%, #07131c 70%)'}}>
    <MovingGrid f={local} opacity={0.05}/>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g opacity={draw}>{counties.map(c => <path key={c.fips} d={path(c.rings)} fill={hi.has(c.fips) ? `rgba(215,239,134,${0.08 + 0.22 * lit})` : '#12302a'} stroke={C.lime} strokeOpacity={hi.has(c.fips) ? 0.35 + 0.65 * lit : 0.22} strokeWidth={hi.has(c.fips) ? 2 + 2 * lit : 1.2}/>)}</g>
      <g filter="url(#glow)" opacity={draw * (1 - 0.5 * fly)}>{counties.map(c => <path key={c.fips} d={path(c.rings)} fill="none" stroke={C.lime} strokeOpacity={0.5} strokeWidth={2.5}/>)}</g>
    </svg>
    {fly < 0.4 && <div style={{position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 120, color: C.cream, opacity: draw * (1 - fly / 0.4), letterSpacing: 6}}>FLORIDA</div>}
    {[['Miami-Dade', -80.55, 25.62], ['Broward', -80.52, 26.24]].map(([n, ln, la]) => { const q = P(ln as number, la as number);
      return <div key={n as string} style={{position: 'absolute', left: q.x, top: q.y, fontFamily: D, fontStyle: 'italic', fontSize: 54, color: C.lime, textTransform: 'uppercase', opacity: lit, letterSpacing: 2}}>{n}</div>; })}
    {s.cities.map((c, i) => { const q = P(c.lng, c.lat), o = ease(local, 5 * B + i * 2, 5 * B + 8 + i * 2);
      return <div key={c.name} style={{position: 'absolute', left: q.x - 8, top: q.y - 8, opacity: o}}>
        <div style={{width: 16, height: 16, borderRadius: 8, background: C.cream, boxShadow: `0 0 0 ${6 + 6 * Math.sin(local / 5)}px ${C.lime}33`}}/></div>; })}
    {s.pins.map((pin, i) => {
      const key = `${pin.lat},${pin.lng}`, n = seen[key] = (seen[key] ?? -1) + 1, total = s.pins.filter(q => q.lat === pin.lat && q.lng === pin.lng).length;
      const ang = -Math.PI / 2 + n * 2 * Math.PI / total, rad = total > 1 ? 40 + total * 16 : 0, q = P(pin.lng, pin.lat);
      const x = q.x + Math.cos(ang) * rad, y = q.y - (total > 1 ? 0 : 76) + Math.sin(ang) * rad, on = ease(local, 6 * B + i * 2, 6 * B + 8 + i * 2, back);
      return <Badge key={i} src={pin.badge} size={104} style={{position: 'absolute', left: x - 52, top: y - 52, transform: `scale(${on})`, opacity: Math.min(1, on * 2)}}/>;
    })}
    <div style={{position: 'absolute', left: 60, right: 60, top: 170, fontFamily: D, fontStyle: 'italic', fontSize: 112, lineHeight: 0.9, color: C.cream, textTransform: 'uppercase',
      opacity: ease(local, 4 * B, 5 * B), whiteSpace: 'pre-line'}}>{s.title}</div>
    {s.sub && <div style={{position: 'absolute', left: 60, right: 60, top: 1820 - 60, fontFamily: D, fontStyle: 'italic', fontSize: 64, color: C.lime, textTransform: 'uppercase', opacity: ease(local, 9 * B, 10 * B)}}>{s.sub}</div>}
  </AbsoluteFill>;
}

// A number that rolls to its value (rankings count down, totals count up), with the label underneath.
function Stat({s, local, dur}: {s: Extract<Scene, {kind: 'stat'}>; local: number; dur: number}) {
  const p = interpolate(local, [4, Math.min(dur - 10, 2 * B + 4)], [0, 1], {...cl, easing: Easing.out(Easing.cubic)}), v = Math.round(s.from + (s.to - s.from) * p), land = ease(local, 2 * B + 2, 2 * B + 10, back);
  return <AbsoluteFill style={{background: C.night}}>
    {s.photo && <Bg photo={s.photo} local={local} dur={dur} dim={0.75}/>}
    <div style={{position: 'absolute', left: 50, top: 520, fontFamily: D, fontStyle: 'italic', fontSize: 420, lineHeight: 0.85, color: p >= 1 ? C.lime : C.cream,
      transform: `scale(${p >= 1 ? 0.9 + 0.1 * land : 1})`, transformOrigin: 'left center', textShadow: '0 20px 60px #000c'}}>{s.prefix ?? ''}{v}</div>
    <Headline lines={s.lines} local={local - 2 * B} top={1000} size={104} accent={-1}/>
  </AbsoluteFill>;
}

function End({s, local}: {s: Extract<Scene, {kind: 'end'}>; local: number}) {
  const a = ease(local, 0, 10, back), d = ease(local, 8, 18, back);
  return <AbsoluteFill style={{background: C.forest}}>
    <MovingGrid f={local} opacity={0.07}/>
    <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', left: 110, width: 860, top: 560, filter: 'brightness(0) invert(1)', opacity: Math.min(1, a), transform: `scale(${0.9 + a * 0.1})`}}/>
    {s.badge && <Badge src={s.badge} size={200} style={{position: 'absolute', left: 440, top: 300, transform: `scale(${Math.min(1.1, a)})`}}/>}
    <div style={{position: 'absolute', left: 60, right: 60, top: 880, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 96, lineHeight: 0.95, color: C.lime, textTransform: 'uppercase', opacity: Math.min(1, a), whiteSpace: 'pre-line'}}>{s.title}</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1140, textAlign: 'center', fontFamily: U, fontSize: 48, color: C.cream, opacity: Math.min(1, d)}}>{s.line}</div>
  </AbsoluteFill>;
}

export const StoryReel = ({scenes, credit, theme}: StoryProps) => {
  const f = useCurrentFrame();
  C = theme ? {...BASE, lime: theme.accent, forest: theme.ink, ...(theme.bg ? {night: theme.bg} : {})} : BASE;
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  let start = 0;
  const parts = scenes.map((s, i) => { const from = start, dur = s.beats * B; start += dur; return {s, i, from, dur}; });
  const cur = parts.find(p => f >= p.from && f < p.from + p.dur) ?? parts[parts.length - 1];
  const local = f - cur.from, s = cur.s;
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    <Whip f={f} from={cur.from} to={cur.i === parts.length - 1 ? cur.from + cur.dur + 99 : cur.from + cur.dur}>
      {s.kind === 'photo' ? <PhotoScene s={s} local={local} dur={cur.dur}/> : s.kind === 'ladder' ? <Ladder s={s} local={local} dur={cur.dur}/>
        : s.kind === 'compare' ? <Compare s={s} local={local} dur={cur.dur}/> : s.kind === 'stat' ? <Stat s={s} local={local} dur={cur.dur}/> : s.kind === 'pins' ? <Pins s={s} local={local} dur={cur.dur}/> : <End s={s} local={local}/>}
    </Whip>
    {credit && s.kind !== 'end' && <div style={{position: 'absolute', right: 40, bottom: 60, fontFamily: U, fontSize: 26, color: '#ffffffb0'}}>{credit}</div>}
    <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', left: 60, top: 80, width: 200, filter: 'brightness(0) invert(1)', opacity: s.kind === 'end' ? 0 : 0.9}}/>
    <Grain/>
  </AbsoluteFill>;
};
