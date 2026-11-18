// App ad "30 seconds" (owner, Nov 18: modern motion ads that promote the app; script C). Real app screens (captured
// from cancha.expo.app) inside an animated phone, kinetic Barlow Condensed type, the club crests, Chris's narration.
// Cue times (seconds) come from the narration's word timing; defaults match a ~19 s read.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Grain, MovingGrid} from './PromoFaltaUno';

const C = {forest: '#103f32', deep: '#0b2e24', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#b9c8bf'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const out = Easing.out(Easing.exp);
const ease = (f: number, a: number, b: number, e = out) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
const A = (p: string) => staticFile('generated/promo/appad/' + p);
export type Cues = {open: number; map: number; recruit: number; ask: number; yes: number; done: number; brand: number; end: number};
export const DEFAULT_CUES: Cues = {open: 3.6, map: 4.7, recruit: 7.3, ask: 9.6, yes: 11.0, done: 13.6, brand: 14.5, end: 18.5};
const CRESTS = ['117-fc-academy', 'boca-jrs-miami-fc', 'river-miami-fc', 'miami-united-fc', 'fc-miami-city', 'cyclones-fc', 'florida-soccer-soldiers',
  'athletum-miami-fc', 'futsoc', 'milan-de-miami-fc', 'dade-county-fc', 'united-stars', 'weston-fc-ii', 'florida-futbol-club', 'miami-sporting-fc', 'empire-sc'];

// Title line: masked reveal (owner, Nov 18: the slam-in looked odd). The line rises from behind a hidden edge with an
// expo ease, no blur or scale.
function Slam({f, at, children, size, color = C.cream, top, rot = 0, outline = false}: {f: number; at: number; children: React.ReactNode; size: number; color?: string; top: number; rot?: number; outline?: boolean}) {
  if (f < at) return null;
  const p = ease(f, at, at + 14, Easing.out(Easing.exp));
  return <div style={{position: 'absolute', left: 0, right: 0, top, height: size * 0.92, overflow: 'hidden', transform: `rotate(${rot}deg)`}}>
    <div style={{textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: size, lineHeight: 0.92, color: outline ? 'transparent' : color,
      WebkitTextStroke: outline ? `4px ${color}` : undefined, textTransform: 'uppercase', letterSpacing: -2, whiteSpace: 'nowrap', transform: `translateY(${(1 - p) * 105}%)`}}>{children}</div>
  </div>;
}

// The phone: real screen captures (1170x2532) in a minimal frame.
function Phone({screen, f, x = 0, y = 0, scale = 1, rotY = 0, rotX = 0, zoom = 1, zoomY = 0, origin = '50% 0%', children}: {screen: string; f: number; x?: number; y?: number; scale?: number; rotY?: number; rotX?: number; zoom?: number; zoomY?: number; origin?: string; children?: React.ReactNode}) {
  const w = 600, h = w * 2532 / 1170;
  return <div style={{position: 'absolute', left: 540 - w / 2 - 18, top: 960 - h / 2 - 18, width: w + 36, height: h + 36, borderRadius: 86, background: '#050a08',
    boxShadow: '0 60px 140px rgba(0,0,0,0.55), 0 0 0 3px #2a3a33 inset', transform: `perspective(2200px) translate(${x}px, ${y}px) scale(${scale}) rotateY(${rotY}deg) rotateX(${rotX}deg)`}}>
    <div style={{position: 'absolute', inset: 18, borderRadius: 70, overflow: 'hidden', background: C.forest}}>
      <Img src={A(screen)} style={{width: w, height: h, transform: `scale(${zoom}) translateY(${zoomY}px)`, transformOrigin: origin}}/>
      {children}
    </div>
  </div>;
}

function Tap({f, at, x, y}: {f: number; at: number; x: number; y: number}) {
  if (f < at || f > at + 24) return null;
  const p = ease(f, at, at + 20, Easing.out(Easing.quad));
  return <><div style={{position: 'absolute', left: x - 60, top: y - 60, width: 120, height: 120, borderRadius: 60, border: `6px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.4})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 26, background: '#ffffffcc', transform: `scale(${1 - p * 0.4})`, opacity: f < at + 10 ? 1 : 1 - (f - at - 10) / 10}}/></>;
}

export function AppAd30({cues = DEFAULT_CUES}: {cues?: Cues}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (k: keyof Cues) => Math.round(cues[k] * fps);
  const t = {open: s('open'), map: s('map'), recruit: s('recruit'), ask: s('ask'), yes: s('yes'), done: s('done'), brand: s('brand'), end: s('end')};

  // Phone entrance on "Open Cancha".
  const enter = spring({frame: f - t.open + 6, fps, config: {damping: 15, stiffness: 90}});
  const phoneY = (1 - enter) * 1500, phoneRot = (1 - enter) * 28;
  const screen = f < t.recruit ? 'w0.png' : f < t.ask ? 'w1.png' : f < t.yes ? 'w2.png' : 'w3.png';
  // The key card of each step pops out of the phone, larger and in front (real crops of the same screens).
  const card = f >= t.recruit && f < t.ask ? {img: 'card-w1.png', at: t.recruit, w: 1020, h: 669} : f >= t.ask && f < t.yes ? {img: 'card-w2.png', at: t.ask, w: 1020, h: 604} : f >= t.yes && f < t.done ? {img: 'card-w3.png', at: t.yes, w: 1062, h: 360} : null;
  const pop = card ? spring({frame: f - card.at - 3, fps, config: {damping: 13, stiffness: 120}}) : 0;
  const exitP = ease(f, t.done - 4, t.done + 10, Easing.in(Easing.cubic));
  const drift = Math.sin(f / 40) * 4;

  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    <MovingGrid f={f} opacity={0.07} speed={1.5}/>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(900px 700px at 50% 55%, ${C.forest}cc, transparent 70%)`, opacity: ease(f, t.open - 10, t.open + 10)}}/>

    {/* 1 · Hook */}
    {f < t.open + 8 && <AbsoluteFill style={{opacity: 1 - ease(f, t.open - 4, t.open + 8)}}>
      <Slam f={f} at={0} size={205} top={600}>Find a team</Slam>
      <Slam f={f} at={9} size={270} top={800} color={C.lime}>in Miami</Slam>
      <Slam f={f} at={30} size={130} top={1080} outline>in 30 seconds</Slam>
    </AbsoluteFill>}

    {/* Background words behind the phone */}
    {f >= t.map && f < t.recruit && <Slam f={f} at={t.map} size={225} top={140} color={C.lime} rot={0}>Every club</Slam>}
    {f >= t.recruit && f < t.ask && <Slam f={f} at={t.recruit} size={250} top={130} color={C.orange} rot={0}>Recruiting</Slam>}
    {f >= t.ask && f < t.yes && <Slam f={f} at={t.ask} size={250} top={130} color={C.lime} rot={0}>Ask to join</Slam>}
    {f >= t.yes && f < t.done && <Slam f={f} at={t.yes} size={250} top={130} color={C.lime} rot={0}>You're in</Slam>}

    {/* Crests orbit the phone while "every club ... on one map" */}
    {f >= t.map && f < t.recruit + 6 && CRESTS.map((c, i) => {
      const a = i / CRESTS.length * Math.PI * 2 + f / 90, p = spring({frame: f - t.map - i * 2, fps, config: {damping: 12}});
      const gone = ease(f, t.recruit - 6, t.recruit + 6, Easing.in(Easing.cubic));
      const r = 400 + (i % 3) * 22;
      return <Img key={c} src={A('crests/' + c + '.png')} style={{position: 'absolute', width: 120, height: 120, left: 540 - 60 + Math.cos(a) * r * p * (1 - gone * 0.6), top: 1080 - 60 + Math.sin(a) * r * 1.35 * p * (1 - gone * 0.6),
        transform: `scale(${p * (1 - gone)})`, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'}}/>;
    })}

    {f >= t.open - 6 && f < t.done + 12 && <Phone f={f} screen={screen} y={phoneY + 120 + drift - exitP * 1700} rotX={phoneRot} rotY={-phoneRot * 0.6} scale={0.97 - exitP * 0.1 - pop * 0.05}>
    </Phone>}
    {card && f < t.done + 6 && <div style={{position: 'absolute', left: 540 - 450, top: 1000 - 450 * card.h / card.w + (1 - pop) * 220 - exitP * 1700, width: 900, height: 900 * card.h / card.w, borderRadius: 44, overflow: 'hidden',
      transform: `scale(${0.7 + pop * 0.3}) rotate(${(1 - pop) * -6 - 1.5}deg)`, opacity: Math.min(1, pop * 2), boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 3px #d7ef8633'}}>
      <Img src={A(card.img)} style={{width: 900, height: 900 * card.h / card.w}}/>
      {f >= t.ask && f < t.yes && <Tap f={f} at={t.ask + 16} x={450} y={900 * card.h / card.w - 150}/>}
    </div>}

    {/* End card */}
    {f >= t.brand && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${ease(f, t.brand, t.brand + 14, Easing.inOut(Easing.cubic)) * 150}% at 50% 50%)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 640, left: 220, top: 560, transform: `scale(${0.8 + 0.2 * spring({frame: f - t.brand - 6, fps, config: {damping: 12}})})`}}/>
      <Slam f={f} at={t.brand + 22} size={128} top={900} color={C.forest}>Find your team.</Slam>
      <Slam f={f} at={t.brand + 30} size={128} top={1030} color={C.orange}>Find your people.</Slam>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, textAlign: 'center', opacity: ease(f, t.brand + 44, t.brand + 54)}}>
        <span style={{fontFamily: U, fontSize: 52, color: C.lime, background: C.forest, padding: '18px 40px', borderRadius: 999, letterSpacing: 2}}>JOIN THE WAITLIST · LINK IN BIO</span>
      </div>
    </AbsoluteFill>}
    <Grain/>
  </AbsoluteFill>;
}
