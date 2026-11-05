// "Falta uno" v3 (owner feedback, Nov 5): bolder edit, real floodlit football, the whole vertical frame, tighter (19.5 s).
// Footage: licensed Mixkit clips (config/footage-licenses.json), cut to 9:16 by video/prepare-promo-clips.mjs.
// Positioning: Encontrá tu equipo (find your team) leads; the pickup game is one way in. Product frames are concept screens,
// marked once, quietly. Variant `opening="counter"` starts on a full-screen 13/14 instead of footage, for comparison.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Grain, MovingGrid} from './PromoFaltaUno';

const C = {forest: '#103f32', deep: '#0b2e24', night: '#050a08', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#b9c8bf'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const S = (s: number) => Math.round(s * 30);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const V3 = {hands: S(2.2), status: S(4.4), chaos: S(5.6), punch: S(8.6), grid: S(10), card: S(10.5), button: S(12.6), tap: S(13.3), counter: S(13.8), win: S(14.6), team: S(16), end: S(17), total: S(19.5)};
const clip = (n: string) => staticFile(`generated/promo/clips/${n}.mp4`);
const Footage = ({name, from = 0, style}: {name: string; from?: number; style?: React.CSSProperties}) =>
  <OffthreadVideo src={clip(name)} startFrom={from} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style}}/>;
// Each scene runs on its own clock so short licensed clips play from their start inside the scene.
const Sc = ({at, children}: {at: number; children: React.ReactNode}) => <Sequence from={at} layout="none">{children}</Sequence>;
const Shade = ({o = 0.45}: {o?: number}) => <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(5,10,8,${o * 0.6}) 0%, rgba(5,10,8,${o}) 100%)`}}/>;

function Word({txt, at, top, size, color, stroke, f, from = 'left'}: {txt: string; at: number; top: number; size: number; color: string; stroke?: boolean; f: number; from?: 'left' | 'right'}) {
  const {fps} = useVideoConfig(), p = spring({frame: f - at, fps, config: {damping: 12, stiffness: 220}});
  return <div style={{position: 'absolute', left: 80, right: 60, top, fontFamily: D, fontStyle: 'italic', fontSize: size, lineHeight: 0.8, letterSpacing: -8,
    textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: from === 'left' ? 'left' : 'right', color: stroke ? 'transparent' : color,
    WebkitTextStroke: stroke ? `6px ${color}` : undefined, transform: `translateX(${(1 - p) * (from === 'left' ? -900 : 900)}px) skewX(-4deg)`, textShadow: stroke ? undefined : '0 12px 50px #000a'}}>{txt}</div>;
}

// Hook: real floodlit football with oversized type slamming over it. Opening variant "counter" starts on a lime 13/14.
function Hook({f, opening}: {f: number; opening: 'footage' | 'counter'}) {
  const off = opening === 'counter' ? 24 : 0;
  const punch = (at: number) => interpolate(f, [at, at + 3, at + 8], [1.12, 1.04, 1], cl);
  return <AbsoluteFill style={{background: C.night}}>
    {opening === 'counter' && f < off && <AbsoluteFill style={{background: C.lime, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 520, color: C.forest, letterSpacing: -20, lineHeight: 0.8}}>13<span style={{color: f % 8 < 4 ? C.orange : C.forest}}>/14</span></div></AbsoluteFill>}
    {f >= off && <>
      <AbsoluteFill style={{transform: `scale(${punch(off) * (1 + (f - off) * 0.002)})`}}>
        {f - off < 30 ? <Footage name="penalty" from={12}/> : <Footage name="net" from={0}/>}
      </AbsoluteFill>
      <Shade o={0.55}/>
      <Word txt="Falta" at={off + 4} top={300} size={420} color={C.cream} f={f}/>
      <Word txt="uno." at={off + 14} top={640} size={480} color={C.lime} f={f} from="right"/>
      <Word txt="Otra vez" at={off + 34} top={1180} size={260} color={C.lime} stroke f={f}/>
    </>}
  </AbsoluteFill>;
}

// The missing player as a real problem: a real huddle freezes, a light beam lands on the gap, a giant 13 counts against it.
function Hands({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - V3.hands, freeze = S(0.55);
  const beam = interpolate(local, [freeze, freeze + 8], [0, 1], cl), tag = spring({frame: local - freeze - 6, fps, config: {damping: 10}});
  const zoom = interpolate(local, [0, freeze, S(2.2)], [1.25, 1.1, 1.18], {...cl, easing: Easing.out(Easing.cubic)});
  return <AbsoluteFill style={{background: C.night}}>
    <AbsoluteFill style={{transform: `scale(${zoom}) rotate(${interpolate(local, [0, S(2.2)], [-2, 1], cl)}deg)`, filter: local > freeze ? 'saturate(0.35) brightness(0.75)' : undefined}}>
      {local < freeze ? <Footage name="hands"/> : <Freeze frame={freeze}><Footage name="hands"/></Freeze>}
    </AbsoluteFill>
    <div style={{position: 'absolute', left: 560, top: -200, width: 520, height: 1500, opacity: beam * 0.55,
      background: 'linear-gradient(180deg, rgba(255,250,220,0.9), rgba(255,250,220,0))', clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)'}}/>
    <div style={{position: 'absolute', left: 640, top: 1060, width: 300, height: 300, borderRadius: 150, border: `10px dashed ${C.orange}`, opacity: beam,
      transform: `scale(${0.8 + beam * 0.2 + 0.04 * Math.sin(local / 3)})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: D, fontStyle: 'italic', fontSize: 170, color: C.orange}}>?</div>
    <div style={{position: 'absolute', left: 60, top: 180, fontFamily: D, fontStyle: 'italic', fontSize: 420, lineHeight: 0.8, color: C.cream, letterSpacing: -14, opacity: beam}}>13</div>
    <div style={{position: 'absolute', left: 70, top: 520, fontFamily: U, fontSize: 52, letterSpacing: 6, color: C.cream, opacity: beam, textTransform: 'uppercase'}}>de 14</div>
    <div style={{position: 'absolute', left: 520, top: 1420, transform: `scale(${tag}) rotate(-5deg)`, background: C.orange, color: C.cream, fontFamily: D, fontStyle: 'italic',
      fontSize: 110, padding: '6px 34px 0', textTransform: 'uppercase'}}>Falta uno</div>
  </AbsoluteFill>;
}

// Segmented status, now huge: the 14th segment is the missing player.
function Status({f, at, full, compact}: {f: number; at: number; full: number; compact?: boolean}) {
  const {fps} = useVideoConfig(), p = spring({frame: f - at, fps, config: {damping: 14}});
  const scale = compact ? 1 : 1.0;
  return <div style={{position: 'absolute', left: 40, right: 40, top: compact ? 120 : 640, transform: `translateY(${(1 - p) * (compact ? -500 : 900)}px) scale(${scale})`,
    background: '#020403f2', borderRadius: 70, padding: compact ? '40px 50px' : '70px 64px', boxShadow: '0 40px 120px #000'}}>
    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between'}}>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: compact ? 90 : 170, lineHeight: 0.85, color: full ? C.lime : C.cream, textTransform: 'uppercase'}}>{full ? 'Completo' : 'Falta 1'}</div>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: compact ? 90 : 150, lineHeight: 0.85, color: C.cream}}>{full ? 14 : 13}<span style={{fontSize: compact ? 44 : 64, color: C.mint}}>/14</span></div>
    </div>
    <div style={{display: 'flex', gap: 10, marginTop: compact ? 30 : 56}}>
      {Array.from({length: 14}, (_, i) => {
        const last = i === 13, w = last ? full : interpolate(f - at, [i * 1.2, i * 1.2 + 6], [0, 1], cl);
        return <div key={i} style={{flex: 1, height: compact ? 18 : 40, borderRadius: 20, background: last && !full ? 'transparent' : '#2a332f', border: last && !full ? `4px solid ${C.orange}` : 'none', overflow: 'hidden', opacity: last && !full ? 0.5 + 0.5 * Math.sin(f / 3) : 1}}>
          <div style={{width: `${w * 100}%`, height: '100%', background: C.lime}}/></div>;
      })}
    </div>
  </div>;
}

// Chaos: notifications at different sizes, angles and speeds over a phone close-up; a white flash on the loudest one.
const CHAOS: {t: string; at: number; x: number; y: number; s: number; r: number; big?: boolean}[] = [
  {t: '¿Quién juega hoy?', at: 0, x: 60, y: 420, s: 1, r: -3}, {t: 'Falta uno', at: 7, x: 120, y: 640, s: 1.15, r: 2}, {t: '¿Alguien?', at: 12, x: 40, y: 860, s: 0.95, r: -5},
  {t: 'Hermano, ¿venís?', at: 18, x: 140, y: 1060, s: 1.05, r: 4}, {t: 'Voy en camino', at: 23, x: 70, y: 1260, s: 0.9, r: -2}, {t: '...mentira', at: 27, x: 300, y: 1390, s: 0.85, r: 6},
  {t: '¿¿ALGUIEN??', at: 34, x: 0, y: 560, s: 1.6, r: -6, big: true}, {t: '¿Uno más?', at: 44, x: 160, y: 1560, s: 1, r: 3}, {t: 'Visto 7:58', at: 54, x: 420, y: 1720, s: 0.8, r: 0},
];
function Chaos({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - V3.chaos;
  const flash = local >= 34 && local < 37;
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(1.35) translateY(${-local * 1.5}px)`, filter: 'blur(14px) brightness(0.45)'}}><Footage name="juggle" from={30}/></AbsoluteFill>
    <div style={{position: 'absolute', left: -120, right: -120, top: 120, bottom: -200, borderRadius: 160, border: '30px solid #1d2622', boxShadow: 'inset 0 0 0 4px #000'}}/>
    <div style={{position: 'absolute', top: 160, left: 0, right: 0, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 260, color: 'transparent', WebkitTextStroke: `5px ${C.cream}55`, letterSpacing: -6}}>
      7:{String(45 + Math.min(13, Math.floor(Math.max(0, local) / 6))).padStart(2, '0')}</div>
    {CHAOS.filter(m => local >= m.at).map((m, i) => {
      const p = spring({frame: local - m.at, fps, config: {damping: 11, stiffness: 240}});
      return <div key={i} style={{position: 'absolute', left: m.x, top: m.y, transform: `scale(${m.s * (0.6 + 0.4 * p)}) rotate(${m.r}deg)`, transformOrigin: 'left top', opacity: p,
        background: m.big ? C.cream : 'rgba(245,243,233,0.18)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 44, padding: '26px 36px',
        display: 'flex', gap: 22, alignItems: 'center', boxShadow: '0 20px 60px #000a'}}>
        <div style={{width: 78, height: 78, borderRadius: 22, background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 40, color: C.lime}}>FD</div>
        <div><div style={{fontFamily: U, fontSize: 28, color: m.big ? C.forest : C.mint}}>Fútbol domingo</div>
          <div style={{fontFamily: m.big ? D : U, fontStyle: m.big ? 'italic' : 'normal', fontSize: m.big ? 90 : 52, lineHeight: 1, color: m.big ? C.forest : '#fff'}}>{m.t}</div></div>
      </div>;
    })}
    {flash && <AbsoluteFill style={{background: '#ffffffaa'}}/>}
  </AbsoluteFill>;
}

// Punchline: the floodlights die, a giant stamp lands with a hard shake, then half a second of black.
function Punch({f}: {f: number}) {
  const local = f - V3.punch, cut = S(0.4), stamp = S(0.5);
  const light = interpolate(local, [0, cut - 4, cut], [1, 0.9, 0], cl), shake = local >= stamp && local < stamp + 8 ? (local % 2 ? 1 : -1) * (16 - (local - stamp) * 2) : 0;
  const land = interpolate(local, [stamp, stamp + 5], [2.4, 1], {...cl, easing: Easing.in(Easing.cubic)});
  return <AbsoluteFill style={{background: '#000', transform: `translate(${shake}px, ${-shake}px)`}}>
    <AbsoluteFill style={{opacity: light}}><Footage name="juggle" from={60}/><Shade o={0.3}/></AbsoluteFill>
    {local >= stamp && local < S(1.25) && <div style={{position: 'absolute', left: -60, right: -60, top: 780, transform: `scale(${land}) rotate(-8deg)`, background: C.orange, padding: '30px 0 10px',
      textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 210, color: C.cream, letterSpacing: 4, textTransform: 'uppercase', boxShadow: '0 0 0 14px #000'}}>Suspendido</div>}
  </AbsoluteFill>;
}

// Transition: grid rushing toward camera with labels flying past.
function Rush({f}: {f: number}) {
  const local = f - V3.grid, p = interpolate(local, [0, S(0.5)], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const fly = (t: string, x: number, y: number, bg: string, fg: string, k: number) => <div style={{position: 'absolute', left: x, top: y, transform: `scale(${1 + p * (3 + k)}) translate(${(x - 400) * p * 0.4}px, ${(y - 900) * p * 0.4}px)`,
    background: bg, color: fg, fontFamily: D, fontStyle: 'italic', fontSize: 100, padding: '10px 30px', borderRadius: 20, opacity: 1 - p}}>{t}</div>;
  return <AbsoluteFill style={{background: C.forest, transform: `scale(${1 + p * 0.6})`}}>
    <MovingGrid f={f} opacity={0.35} speed={14}/>
    {fly('DOM. 8 PM', 120, 600, C.cream, C.forest, 0)}{fly('DORAL', 560, 820, C.lime, C.forest, 0.5)}{fly('7V7', 200, 1150, C.night, C.cream, 1)}
  </AbsoluteFill>;
}

const ConceptNote = () => <div style={{position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontFamily: U, fontSize: 30, color: '#ffffffb0', letterSpacing: 2}}>Pantallas de concepto</div>;

// The app, full-bleed: the game card fills the screen with real footage in its header.
function Card({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - V3.card, rise = spring({frame: local, fps, config: {damping: 15}});
  const field = (k: number) => spring({frame: local - 6 - k * 4, fps, config: {damping: 13}});
  return <AbsoluteFill style={{background: C.deep}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 900, overflow: 'hidden', transform: `translateY(${(1 - rise) * -300}px)`}}>
      <Footage name="juggle" from={20}/><AbsoluteFill style={{background: `linear-gradient(180deg, transparent 50%, ${C.deep})`}}/>
      <div style={{position: 'absolute', left: 60, top: 120, background: C.lime, color: C.forest, fontFamily: U, fontSize: 40, padding: '10px 22px', borderRadius: 12}}>PICKUP · 7V7</div>
    </div>
    <div style={{position: 'absolute', left: 60, right: 60, top: 760}}>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 210, lineHeight: 0.82, color: '#fff', textTransform: 'uppercase', transform: `translateX(${(1 - field(0)) * -200}px)`, opacity: field(0)}}>Dom.<br/>8:00 PM</div>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 150, lineHeight: 0.9, color: C.lime, textTransform: 'uppercase', marginTop: 20, transform: `translateX(${(1 - field(1)) * 200}px)`, opacity: field(1)}}>Doral</div>
      <div style={{display: 'flex', gap: 22, marginTop: 50, opacity: field(2)}}>
        {['Intermedio', '2.1 mi', '13/14'].map(x => <div key={x} style={{fontFamily: U, fontSize: 46, color: C.cream, border: `3px solid ${C.mint}66`, borderRadius: 999, padding: '12px 28px'}}>{x}</div>)}
      </div>
    </div>
    <ConceptNote/>
  </AbsoluteFill>;
}

// Push into the button: it fills the width, the press compresses it, a ring bursts.
function Button({f}: {f: number}) {
  const local = f - V3.button, push = interpolate(local, [0, S(0.7)], [0.7, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const tapAt = V3.tap - V3.button, press = interpolate(local, [tapAt - 5, tapAt, tapAt + 7], [1, 0.88, 1], cl), done = local >= tapAt;
  const ring = interpolate(local, [tapAt, tapAt + 16], [0, 1], cl);
  return <AbsoluteFill style={{background: C.deep, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{transform: `scale(${push * press})`, width: 960, height: 420, borderRadius: 210, background: done ? C.cream : C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 0 ${ring * 220}px rgba(215,239,134,${0.45 * (1 - ring)})`, fontFamily: D, fontStyle: 'italic', fontSize: done ? 150 : 200, color: C.forest, textTransform: 'uppercase'}}>
      {done ? 'Estás adentro' : 'Me sumo'}</div>
    {local > tapAt - 14 && local < tapAt + 8 && <div style={{position: 'absolute', left: 600, top: 1080, width: 170, height: 170, borderRadius: 85, background: '#ffffff40', border: '6px solid #fff', transform: `scale(${press})`}}/>}
    <ConceptNote/>
  </AbsoluteFill>;
}

// The counter as the hero: 13 flips to 14 full-screen while the last segment fills.
function Counter({f}: {f: number}) {
  const local = f - V3.counter, flip = interpolate(local, [4, 12], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  return <AbsoluteFill style={{background: C.night, alignItems: 'center', justifyContent: 'center'}}>
    <div style={{height: 520, overflow: 'hidden', fontFamily: D, fontStyle: 'italic', fontSize: 560, lineHeight: '520px', letterSpacing: -20}}>
      <div style={{transform: `translateY(${-flip * 520}px)`}}><div style={{color: C.cream}}>13</div><div style={{color: C.lime}}>14</div></div></div>
    <Status f={f} at={V3.counter - 30} full={interpolate(local, [8, 16], [0, 1], cl)} compact/>
  </AbsoluteFill>;
}

// Confirmation takeover.
function Win({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - V3.win, wipe = interpolate(local, [0, 7], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const a = spring({frame: local - 4, fps, config: {damping: 10}}), b = spring({frame: local - 9, fps, config: {damping: 12}});
  return <AbsoluteFill style={{background: C.night}}>
    <div style={{position: 'absolute', left: 540, top: 960, width: 10, height: 10, borderRadius: '50%', background: C.lime, transform: `scale(${wipe * 450})`}}/>
    <div style={{position: 'absolute', left: -20, right: -20, top: 360, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 470, lineHeight: 0.8, color: C.forest, letterSpacing: -16, transform: `scale(${a})`}}>14/14</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 230, lineHeight: 0.82, color: C.forest, textTransform: 'uppercase', transform: `translateY(${(1 - b) * 120}px)`, opacity: b}}>Partido<br/>completo</div>
  </AbsoluteFill>;
}

// The bigger idea: find your team. A real huddle, then the brand.
function Team({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - V3.team, p = spring({frame: local - 3, fps, config: {damping: 12}});
  return <AbsoluteFill>
    <AbsoluteFill style={{transformOrigin: '50% 10%', transform: `scale(${1.12 - local * 0.003})`}}><Footage name="huddle" from={10}/></AbsoluteFill><Shade o={0.4}/>
    <div style={{position: 'absolute', left: 50, right: 30, bottom: 300, fontFamily: D, fontStyle: 'italic', fontSize: 200, lineHeight: 0.82, color: C.cream, textTransform: 'uppercase', transform: `translateY(${(1 - p) * 200}px)`, opacity: p}}>
      Encontrá<br/><span style={{color: C.lime}}>tu equipo.</span></div>
  </AbsoluteFill>;
}

function End({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - V3.end;
  const a = spring({frame: local, fps, config: {damping: 13}}), b = spring({frame: local - 8, fps, config: {damping: 13}}), c = spring({frame: local - 16, fps, config: {damping: 12}});
  return <AbsoluteFill style={{background: C.forest}}>
    <MovingGrid f={f} opacity={0.06}/>
    <Img src={staticFile('generated/promo/cancha.png')} style={{position: 'absolute', left: 70, width: 940, top: 380, filter: 'brightness(0) invert(1)', transform: `scale(${0.85 + a * 0.15})`, opacity: a}}/>
    <div style={{position: 'absolute', left: 70, right: 40, top: 820, fontFamily: D, fontStyle: 'italic', fontSize: 150, lineHeight: 0.86, textTransform: 'uppercase', color: C.cream, opacity: b, transform: `translateY(${(1 - b) * 80}px)`}}>
      Tu equipo.<br/><span style={{color: C.lime}}>Tu partido.</span><br/>Tu cancha.</div>
    <div style={{position: 'absolute', left: 70, right: 70, top: 1440, height: 190, borderRadius: 95, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: D, fontStyle: 'italic', fontSize: 92, color: C.forest, textTransform: 'uppercase', transform: `scale(${c})`}}>Sumate a la lista</div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1680, textAlign: 'center', fontFamily: U, fontSize: 46, color: C.cream, opacity: c}}>Link en bio · @wearecancha</div>
  </AbsoluteFill>;
}

export const PromoFaltaUnoV3 = ({opening = 'footage'}: {opening?: 'footage' | 'counter'}) => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    {f < V3.hands && <Sc at={0}><Hook f={f} opening={opening}/></Sc>}
    {f >= V3.hands && f < V3.status && <Sc at={V3.hands}><Hands f={f}/></Sc>}
    {f >= V3.status && f < V3.chaos && <Sc at={V3.status}><Freeze frame={S(0.55)}><AbsoluteFill style={{filter: 'blur(18px) brightness(0.4)'}}><Footage name="hands"/></AbsoluteFill></Freeze><Status f={f} at={V3.status} full={0}/></Sc>}
    {f >= V3.chaos && f < V3.punch && <Sc at={V3.chaos}><Chaos f={f}/></Sc>}
    {f >= V3.punch && f < V3.grid && <Sc at={V3.punch}><Punch f={f}/></Sc>}
    {f >= V3.grid && f < V3.card && <Rush f={f}/>}
    {f >= V3.card && f < V3.button && <Sc at={V3.card}><Card f={f}/></Sc>}
    {f >= V3.button && f < V3.counter && <Button f={f}/>}
    {f >= V3.counter && f < V3.win && <Counter f={f}/>}
    {f >= V3.win && f < V3.team && <Win f={f}/>}
    {f >= V3.team && f < V3.end && <Sc at={V3.team}><Team f={f}/></Sc>}
    {f >= V3.end && <End f={f}/>}
    <Grain/>
  </AbsoluteFill>;
};
