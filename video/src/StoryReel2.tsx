// Story Reels v2 (owner's review brief, Nov 6). Same identity as StoryReel (wordmark, condensed italic display, dark
// grounds, one accent) with a production layout: essential text, logos and CTA stay inside the critical area
// (x 72..900, y 288..1248); headlines 92px / 2 lines max; supporting copy in the upright UI face; light scrims, not blur;
// one accent per scene; charts grow together and hold fixed final labels; ladders dim the past and light the current step;
// the map starts on the two counties and highlights at most three clubs with a linked card; real product screens are
// cropped large with a visible tap. StoryReel.tsx is untouched so approved cuts render exactly as before.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain} from './PromoFaltaUno';
import {B, ease} from './PromoFaltaUnoV22';
import COUNTIES from './data/florida-counties.json';

const BASE = {ink: '#103f32', night: '#07130f', cream: '#f5f3e9', accent: '#d7ef86', mint: '#b9c8bf'};
let C = BASE;
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const SAFE = {left: 72, right: 900, top: 288, bottom: 1248};
const HEAD = SAFE.top + 86; // top headlines start below the wordmark
const W = SAFE.right - SAFE.left;

type Media = {src: string; video?: boolean; start?: number; x?: number; y?: number};
export type Scene2 =
  | {kind: 'hero'; beats: number; media: Media; kicker?: string; headline: string[]; accent?: number; support?: string}
  | {kind: 'ladder'; beats: number; headline: string; steps: {label: string; note?: string}[]; media?: Media}
  | {kind: 'bars'; beats: number; headline: string; unit: string; bars: {label: string; value: number; hot?: boolean}[]; foot?: string}
  | {kind: 'versus'; beats: number; headline: string; left: {value: string; label: string}; right: {value: string; label: string}; foot?: string}
  | {kind: 'map'; beats: number; headline: string; support?: string; pins: {badge: string; lat: number; lng: number}[]; cards: {badge: string; lat: number; lng: number; name: string; city: string; level: string; status: string}[]}
  | {kind: 'screen'; beats: number; img: string; imgW: number; imgH: number; label?: string; scroll: [number, number]; tap?: {x: number; y: number; at: number}; ring?: {x: number; y: number; w: number; h: number; at: number}; caption?: string}
  | {kind: 'cta'; beats: number; action: string; line: string; media?: Media; logoBeats?: number};
export type Story2Props = {scenes: Scene2[]; theme?: {accent: string; ink: string; bg?: string}};
export const story2Frames = (scenes: Scene2[]) => scenes.reduce((a, s) => a + s.beats * B, 0);

const enter = (local: number, at = 0, n = 8) => ease(local, at, at + n, Easing.out(Easing.cubic));
function Media({m, local, from, scrim = 0.55}: {m: Media; local: number; from: number; scrim?: number}) {
  const z = 1.03 + local * 0.0005, pos = `${(m.x ?? 0.5) * 100}% ${(m.y ?? 0.5) * 100}%`;
  return <AbsoluteFill style={{overflow: 'hidden', background: C.night}}>
    {m.video ? <Sequence from={from} layout="none"><OffthreadVideo src={staticFile(m.src)} startFrom={Math.round((m.start ?? 0) * 30)} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z})`}}/></Sequence>
      : <Img src={staticFile(m.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos, transform: `scale(${z})`}}/>}
    {/* restrained scrim: clear subject on top, legible text band in the critical area */}
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(5,10,12,${scrim * 0.35}) 0%, rgba(5,10,12,${scrim * 0.2}) 25%, rgba(5,10,12,${scrim}) 55%, rgba(5,10,12,${scrim * 0.9}) 80%, rgba(5,10,12,${scrim * 0.5}) 100%)`}}/>
  </AbsoluteFill>;
}
export const TITLE = 120, TITLE_LH = 0.9; // v1 title scale
const Headline = ({lines, local, accent = -1, top, size = TITLE, at = 4}: {lines: string[]; local: number; accent?: number; top: number; size?: number; at?: number}) =>
  <div style={{position: 'absolute', left: SAFE.left - 12, width: W + 70, top}}>
    {lines.map((l, i) => { const p = ease(local, at + i * 5, at + 10 + i * 5); return <div key={i} style={{fontFamily: D, fontStyle: 'italic', fontSize: size, lineHeight: TITLE_LH, textTransform: 'uppercase',
      color: i === accent ? C.accent : C.cream, opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 70}px)`, filter: p < 0.9 ? `blur(${(1 - p) * 10}px)` : undefined, textShadow: '0 10px 40px #000c'}}>{l}</div>; })}
  </div>;
const Support = ({text, local, top, at = 14}: {text: string; local: number; top: number; at?: number}) =>
  <div style={{position: 'absolute', left: SAFE.left, width: W, top, fontFamily: D, fontStyle: 'italic', fontSize: 52, lineHeight: 1.04, textTransform: 'uppercase', color: C.accent, opacity: enter(local, at), transform: `translateY(${(1 - enter(local, at)) * 30}px)`, textShadow: '0 6px 24px #000c'}}>{text}</div>;
const Kicker = ({text, local, top}: {text: string; local: number; top: number}) =>
  <div style={{position: 'absolute', left: SAFE.left, top, display: 'flex', alignItems: 'center', gap: 18, opacity: enter(local, 0), transform: `translateX(${(1 - enter(local, 0)) * -40}px)`}}>
    <div style={{width: 56, height: 8, borderRadius: 4, background: C.accent}}/><span style={{fontFamily: D, fontStyle: 'italic', fontSize: 58, color: C.accent, textTransform: 'uppercase', textShadow: '0 6px 24px #000c'}}>{text}</span></div>;

function Hero({s, local, from}: {s: Extract<Scene2, {kind: 'hero'}>; local: number; from: number}) {
  // estimate wrapped lines so the title never collides with the support line
  const rows = s.headline.reduce((a, l) => a + Math.ceil(l.length / 16), 0), supRows = s.support ? Math.ceil(s.support.length / 34) : 0;
  const top = 1248 - supRows * 54 - (supRows ? 20 : 0) - rows * TITLE * TITLE_LH;
  return <AbsoluteFill><Media m={s.media} local={local} from={from}/>
    {s.kicker && <Kicker text={s.kicker} local={local} top={top - 70}/>}
    <Headline lines={s.headline} local={local} accent={s.accent} top={top}/>
    {s.support && <Support text={s.support} local={local} top={1248 - supRows * 54}/>}
  </AbsoluteFill>;
}

// Past steps dim, the current step lights, the destination is the biggest thing on screen.
function Ladder({s, local, dur, from}: {s: Extract<Scene2, {kind: 'ladder'}>; local: number; dur: number; from: number}) {
  const n = s.steps.length, at = Math.min(n - 1, Math.floor(interpolate(local, [B, dur - 2 * B], [0, n - 1 + 0.999], cl))), rowH = 118, base = 1248;
  return <AbsoluteFill style={{background: C.night}}>
    {s.media && <Media m={s.media} local={local} from={from} scrim={0.85}/>}
    <Headline lines={s.headline.split('\n')} local={local} top={HEAD}/>
    {s.steps.map((st, i) => {
      const top = base - (i + 1) * rowH, cur = i === at, past = i < at, last = i === n - 1, on = enter(local, 4 + i * 2);
      return <div key={i} style={{position: 'absolute', left: SAFE.left, width: last ? W : W - 120, top, height: rowH - 18, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px',
        background: cur ? C.accent : 'transparent', border: `3px solid ${cur ? C.accent : past ? '#ffffff26' : '#ffffff40'}`, opacity: on * (past ? 0.4 : 1), transform: `translateY(${(1 - on) * 20}px)`}}>
        <span style={{fontFamily: D, fontStyle: 'italic', fontSize: last ? 76 : 66, color: cur ? C.ink : C.cream, textTransform: 'uppercase'}}>{st.label}</span>
        {(cur || last) && st.note && <span style={{fontFamily: U, fontSize: 38, color: cur ? C.ink : C.mint}}>{st.note}</span>}
      </div>;
    })}
  </AbsoluteFill>;
}

// All bars grow together (~0.8 s), then hold; labels appear at their final values only.
function Bars({s, local}: {s: Extract<Scene2, {kind: 'bars'}>; local: number}) {
  const max = Math.max(...s.bars.map(b => b.value)), n = s.bars.length, colW = W / n, floor = 1130, H = 520, g = ease(local, 10, 34, Easing.out(Easing.cubic)), lab = enter(local, 34, 6);
  return <AbsoluteFill style={{background: C.night}}>
    <Headline lines={s.headline.split('\n')} local={local} top={HEAD}/>
    <div style={{position: 'absolute', left: SAFE.left, width: W, top: floor, height: 4, background: '#ffffffaa'}}/>
    {s.bars.map((b, i) => { const h = Math.max(4, (b.value / max) * H * g), x = SAFE.left + i * colW + 8;
      return <React.Fragment key={i}>
        <div style={{position: 'absolute', left: x, width: colW - 16, top: floor - h, height: h, borderRadius: '10px 10px 0 0', background: b.hot ? C.accent : '#ffffff33'}}/>
        <div style={{position: 'absolute', left: x - 8, width: colW, top: floor - h - 52, textAlign: 'center', fontFamily: U, fontSize: 38, color: b.hot ? C.accent : C.cream, opacity: lab}}>{b.value}</div>
        <div style={{position: 'absolute', left: x - 8, width: colW, top: floor + 14, textAlign: 'center', fontFamily: U, fontSize: 34, color: C.mint}}>{b.label}</div>
      </React.Fragment>; })}
    <div style={{position: 'absolute', left: SAFE.left, width: W, top: floor + 64, fontFamily: U, fontSize: 34, lineHeight: 1.2, color: C.mint}}>{s.unit}</div>
    {s.foot && <div style={{position: 'absolute', left: SAFE.left, width: W, top: 1248 - 50, fontFamily: U, fontSize: 38, color: C.cream, opacity: enter(local, 40)}}>{s.foot}</div>}
  </AbsoluteFill>;
}

function Versus({s, local}: {s: Extract<Scene2, {kind: 'versus'}>; local: number}) {
  const box = (v: {value: string; label: string}, i: number) => { const p = enter(local, 8 + i * 8, 10);
    return <div style={{flex: 1, padding: '28px 24px', borderRadius: 24, background: i ? '#ffffff12' : `${C.accent}22`, border: `3px solid ${i ? '#ffffff33' : C.accent}`, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 104, lineHeight: 1, color: i ? C.cream : C.accent}}>{v.value}</div>
      <div style={{fontFamily: U, fontSize: 38, lineHeight: 1.15, color: C.cream, marginTop: 12}}>{v.label}</div></div>; };
  return <AbsoluteFill style={{background: C.night}}>
    <Headline lines={s.headline.split('\n')} local={local} top={HEAD}/>
    <div style={{position: 'absolute', left: SAFE.left, width: W, top: 600, display: 'flex', gap: 20}}>{box(s.left, 0)}{box(s.right, 1)}</div>
    {s.foot && <div style={{position: 'absolute', left: SAFE.left, width: W, top: 1100, fontFamily: U, fontSize: 40, lineHeight: 1.2, color: C.mint, opacity: enter(local, 24)}}>{s.foot}</div>}
  </AbsoluteFill>;
}

// The two counties (real Census shapes), all crests dimmed, then up to three highlighted one at a time with a card.
const BOX = {lng: [-80.62, -79.98] as [number, number], lat: [25.38, 26.36] as [number, number]};
function project(lng: number, lat: number) {
  const k = Math.cos(25.87 * Math.PI / 180), sc = Math.min(1080 / ((BOX.lng[1] - BOX.lng[0]) * k), 1500 / (BOX.lat[1] - BOX.lat[0]));
  return {x: 540 + (lng - (BOX.lng[0] + BOX.lng[1]) / 2) * k * sc, y: 860 - (lat - (BOX.lat[0] + BOX.lat[1]) / 2) * sc};
}
function MapScene({s, local, dur}: {s: Extract<Scene2, {kind: 'map'}>; local: number; dur: number}) {
  const zoom = interpolate(local, [0, 16], [1.08, 1], {...cl, easing: Easing.out(Easing.cubic)}), seg = (dur - 2 * B) / Math.max(1, s.cards.length), active = Math.min(s.cards.length - 1, Math.floor((local - 2 * B) / seg));
  const path = (rings: number[][][]) => rings.map(r => 'M' + r.map(([x, y]) => { const q = project(x, y); return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }).join('L') + 'Z').join('');
  const counties = COUNTIES as {fips: string; rings: number[][][]}[], hi = new Set(['12086', '12011']);
  const card = local >= 2 * B ? s.cards[active] : null, cp = card ? enter(local - 2 * B - active * seg, 0, 10) : 0;
  return <AbsoluteFill style={{background: '#06121a'}}>
    <AbsoluteFill style={{transform: `scale(${zoom})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {counties.map(c => <path key={c.fips} d={path(c.rings)} fill={hi.has(c.fips) ? `${C.accent}1f` : '#0f2722'} stroke={C.accent} strokeOpacity={hi.has(c.fips) ? 0.9 : 0.15} strokeWidth={hi.has(c.fips) ? 3 : 1}/>)}
      </svg>
      {s.pins.map((p, i) => { const q = project(p.lng, p.lat), isCard = card && card.badge === p.badge;
        return <div key={i} style={{position: 'absolute', left: q.x - 10, top: q.y - 10, width: 20, height: 20, borderRadius: 10, background: isCard ? C.accent : '#ffffff59', boxShadow: isCard ? `0 0 0 14px ${C.accent}40` : undefined}}/>; })}
      {card && (() => { const q = project(card.lng, card.lat); return <div style={{position: 'absolute', left: q.x - 60, top: q.y - 140, width: 120, height: 120, borderRadius: 26, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px #000a', transform: `scale(${cp})`}}>
        <Img src={staticFile(card.badge)} style={{width: '82%', height: '82%', objectFit: 'contain'}}/></div>; })()}
    </AbsoluteFill>
    <Headline lines={s.headline.split('\n')} local={local} top={HEAD}/>
    {s.support && <Support text={s.support} local={local} top={HEAD + 230} at={6}/>}
    {card && <div style={{position: 'absolute', left: SAFE.left, width: W, top: 1000, borderRadius: 24, background: '#0b1714f2', border: `2px solid ${C.accent}`, padding: '22px 26px', display: 'flex', gap: 22, alignItems: 'center', opacity: cp, transform: `translateY(${(1 - cp) * 24}px)`}}>
      <div style={{width: 96, height: 96, borderRadius: 20, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}><Img src={staticFile(card.badge)} style={{width: '82%', height: '82%', objectFit: 'contain'}}/></div>
      <div style={{minWidth: 0}}><div style={{fontFamily: D, fontStyle: 'italic', fontSize: 60, lineHeight: 1, color: C.cream, textTransform: 'uppercase'}}>{card.name}</div>
        <div style={{fontFamily: U, fontSize: 36, color: C.cream, marginTop: 6}}>{card.city} · {card.level}</div>
        <div style={{fontFamily: U, fontSize: 32, color: C.accent, marginTop: 4}}>{card.status}</div></div></div>}
  </AbsoluteFill>;
}

// A real product screen, cropped large; the page scrolls, a tap ring lands, an optional ring highlights the result.
function Screen({s, local, dur}: {s: Extract<Scene2, {kind: 'screen'}>; local: number; dur: number}) {
  const scale = 1080 / s.imgW, y = interpolate(local, [6, Math.max(8, (s.tap?.at ?? dur - 10) - 6)], s.scroll, {...cl, easing: Easing.inOut(Easing.cubic)});
  const tapP = s.tap ? interpolate(local, [s.tap.at - 4, s.tap.at, s.tap.at + 10], [0, 1, 0], cl) : 0, ring = s.ring ? enter(local, s.ring.at, 8) : 0;
  return <AbsoluteFill style={{background: '#eef2e8'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: s.imgH * scale, transform: `translateY(${-y * scale}px)`}}>
      <Img src={staticFile(s.img)} style={{width: 1080, height: s.imgH * scale}}/>
      {s.tap && <div style={{position: 'absolute', left: s.tap.x * scale - 60, top: s.tap.y * scale - 60, width: 120, height: 120, borderRadius: 60, background: `${C.ink}33`, border: `6px solid ${C.ink}`, opacity: tapP, transform: `scale(${0.7 + tapP * 0.3})`}}/>}
      {s.ring && <div style={{position: 'absolute', left: s.ring.x * scale - 12, top: s.ring.y * scale - 12, width: s.ring.w * scale + 24, height: s.ring.h * scale + 24, borderRadius: 26, border: `8px solid ${BASE.accent}`, boxShadow: `0 0 0 9999px rgba(7,19,15,${0.35 * ring})`, opacity: ring}}/>}
    </div>
    {s.label && <div style={{position: 'absolute', left: SAFE.left, top: 1248 - 250, padding: '10px 20px', borderRadius: 12, background: '#07130fe6', fontFamily: D, fontStyle: 'italic', fontSize: 46, textTransform: 'uppercase', color: BASE.accent, opacity: enter(local, 0)}}>{s.label}</div>}
    {s.caption && <div style={{position: 'absolute', left: SAFE.left, width: W, top: 1248 - 120, padding: '18px 22px', borderRadius: 18, background: '#07130fee', fontFamily: D, fontStyle: 'italic', fontSize: 72, lineHeight: 1, color: '#f5f3e9', textTransform: 'uppercase', opacity: enter(local, 8)}}>{s.caption}</div>}
  </AbsoluteFill>;
}

function Cta({s, local, dur, from}: {s: Extract<Scene2, {kind: 'cta'}>; local: number; dur: number; from: number}) {
  const logoAt = dur - (s.logoBeats ?? 2) * B, logo = enter(local, logoAt, 8);
  return <AbsoluteFill style={{background: C.ink}}>
    {s.media && <Media m={s.media} local={local} from={from} scrim={0.75}/>}
    <AbsoluteFill style={{opacity: 1 - logo}}>
      <Headline lines={s.action.split('\n')} local={local} top={700} size={132} accent={0}/>
      <div style={{position: 'absolute', left: SAFE.left, width: W, top: 1000, fontFamily: D, fontStyle: 'italic', fontSize: 64, lineHeight: 1.05, textTransform: 'uppercase', color: C.cream, opacity: enter(local, 12), whiteSpace: 'pre-line'}}>{s.line}</div>
    </AbsoluteFill>
    <AbsoluteFill style={{opacity: logo, background: C.ink, alignItems: 'center', justifyContent: 'center'}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{width: 640, filter: 'brightness(0) invert(1)', transform: `scale(${0.94 + 0.06 * logo})`}}/>
    </AbsoluteFill>
  </AbsoluteFill>;
}

export const StoryReel2 = ({scenes, theme}: Story2Props) => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  C = theme ? {...BASE, accent: theme.accent, ink: theme.ink, ...(theme.bg ? {night: theme.bg} : {})} : BASE;
  let start = 0;
  const parts = scenes.map((s, i) => { const from = start, dur = s.beats * B; start += dur; return {s, i, from, dur}; });
  const cur = parts.find(p => f >= p.from && f < p.from + p.dur) ?? parts[parts.length - 1], local = f - cur.from, s = cur.s;
  // hard cut on the beat with a 4-frame fade in: no sideways travel, nothing off-canvas
  const fadeIn = cur.i === 0 ? 1 : enter(local, 0, 4);
  const showMark = s.kind !== 'cta' && s.kind !== 'screen';
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    <AbsoluteFill style={{opacity: fadeIn}}>
      {s.kind === 'hero' ? <Hero s={s} local={local} from={cur.from}/> : s.kind === 'ladder' ? <Ladder s={s} local={local} dur={cur.dur} from={cur.from}/>
        : s.kind === 'bars' ? <Bars s={s} local={local}/> : s.kind === 'versus' ? <Versus s={s} local={local}/> : s.kind === 'map' ? <MapScene s={s} local={local} dur={cur.dur}/>
        : s.kind === 'screen' ? <Screen s={s} local={local} dur={cur.dur}/> : <Cta s={s} local={local} dur={cur.dur} from={cur.from}/>}
    </AbsoluteFill>
    {showMark && <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', left: SAFE.left, top: SAFE.top, width: 150, filter: 'brightness(0) invert(1)', opacity: 0.85}}/>}
    <Grain/>
  </AbsoluteFill>;
};
