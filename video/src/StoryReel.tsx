// Story Reels (owner, Nov 6): cool soccer stories (business, ownership, culture) told with real images and Cancha motion
// graphics. One JSON per story (content/instagram/stories/<id>.json) lists scenes; this file only knows how to draw them.
// Scene kinds: photo (Ken Burns + kinetic headline), ladder (a club climbing divisions), compare (two columns),
// end (logo + one CTA). Timing runs on the 120 BPM beat grid shared with the promos (B = 15 frames).
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, MovingGrid} from './PromoFaltaUno';
import {B, back, ease, Whip} from './PromoFaltaUnoV22';

const BASE = {forest: '#103f32', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#b9c8bf'};
// Club look (owner, Nov 6): a story can set its accent (lime by default) and the ink drawn on that accent.
let C = BASE;
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

type Photo = {src: string; x?: number; y?: number; zoom?: number; dir?: 1 | -1};
export type Scene =
  | {kind: 'photo'; beats: number; photo: Photo; kicker?: string; lines: string[]; accent?: number; place?: 'top' | 'bottom'}
  | {kind: 'ladder'; beats: number; title: string; steps: {label: string; year: string}[]; photo?: Photo}
  | {kind: 'compare'; beats: number; title: string; left: {head: string; lines: string[]}; right: {head: string; lines: string[]}; photo?: Photo}
  | {kind: 'stat'; beats: number; from: number; to: number; prefix?: string; lines: string[]; photo?: Photo}
  | {kind: 'end'; beats: number; title: string; line: string};
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
    {s.kicker && <div style={{position: 'absolute', left: 60, top: s.place === 'top' ? 200 : 1460 - h, background: C.lime, color: C.forest, fontFamily: U, fontSize: 36,
      letterSpacing: 3, textTransform: 'uppercase', padding: '10px 20px', borderRadius: 8, transform: `scale(${k})`, transformOrigin: 'left center'}}>{s.kicker}</div>}
    <Headline lines={s.lines} local={local} accent={s.accent} top={s.place === 'top' ? 290 : 1540 - h}/>
  </AbsoluteFill>;
}

// A club climbing the pyramid: steps rise from the bottom, a lime marker climbs one step per beat.
function Ladder({s, local, dur}: {s: Extract<Scene, {kind: 'ladder'}>; local: number; dur: number}) {
  const n = s.steps.length, climb = interpolate(local, [B, dur - B], [0, n - 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const at = Math.round(climb), rowH = 190, base = 1600;
  return <AbsoluteFill style={{background: C.night}}>
    {s.photo && <Bg photo={s.photo} local={local} dur={dur} dim={0.85} blur={8}/>}
    <MovingGrid f={local} opacity={0.06}/>
    <div style={{position: 'absolute', left: 60, right: 60, top: 170, fontFamily: D, fontStyle: 'italic', fontSize: 120, lineHeight: 0.9, color: C.cream, textTransform: 'uppercase', opacity: ease(local, 0, 8)}}>{s.title}</div>
    {s.steps.map((st, i) => {
      const on = ease(local, 4 + i * 3, 12 + i * 3, back), reached = i <= at, top = base - (i + 1) * rowH, w = 560 + i * 90;
      return <div key={i} style={{position: 'absolute', left: 60, top, width: w, height: rowH - 22, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        background: reached ? (i === at ? C.lime : '#d7ef8633') : '#ffffff12', border: `3px solid ${reached ? C.lime : '#ffffff30'}`, transform: `translateX(${(1 - on) * -400}px)`, opacity: Math.min(1, on)}}>
        <span style={{fontFamily: D, fontStyle: 'italic', fontSize: 78, color: i === at ? C.forest : C.cream, textTransform: 'uppercase'}}>{st.label}</span>
        <span style={{fontFamily: U, fontSize: 44, color: i === at ? C.forest : C.mint}}>{st.year}</span></div>;
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
    <div style={{position: 'absolute', left: 60, right: 60, top: 220, fontFamily: D, fontStyle: 'italic', fontSize: 140, lineHeight: 0.88, color: C.cream, textTransform: 'uppercase', opacity: ease(local, 0, 8),
      transform: `translateY(${(1 - ease(local, 0, 10)) * 60}px)`}}>{s.title}</div>
    <div style={{position: 'absolute', left: 50, right: 50, top: 700, display: 'flex', gap: 24}}>{col(s.left, 0)}{col(s.right, 1)}</div>
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
    <div style={{position: 'absolute', left: 60, right: 60, top: 880, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 96, lineHeight: 0.95, color: C.lime, textTransform: 'uppercase', opacity: Math.min(1, a)}}>{s.title}</div>
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
        : s.kind === 'compare' ? <Compare s={s} local={local} dur={cur.dur}/> : s.kind === 'stat' ? <Stat s={s} local={local} dur={cur.dur}/> : <End s={s} local={local}/>}
    </Whip>
    {credit && s.kind !== 'end' && <div style={{position: 'absolute', right: 40, bottom: 60, fontFamily: U, fontSize: 26, color: '#ffffffb0'}}>{credit}</div>}
    <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', left: 60, top: 80, width: 200, filter: 'brightness(0) invert(1)', opacity: s.kind === 'end' ? 0 : 0.9}}/>
    <Grain/>
  </AbsoluteFill>;
};
