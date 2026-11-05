// Promo "Falta uno" v2.2 (owner, Nov 5): v2.1 with motion and sound polish only. Same scenes, story, type and colours.
// 1. Every cut sits on the music's beat (120 BPM = one beat every 15 frames).
// 2. Motion: expo ease-outs for UI, overshoot only on hits, motion blur on fast moves, whip transitions between scenes,
//    slow camera drift, phone buzz per message, floodlight flicker before SUSPENDIDO, odometer roll for 13 -> 14.
// Sound is mixed afterwards by video/mix-promo-audio.mjs from the cue list in the promo spec.
import React, {useEffect, useState} from 'react';
import {Grain, MovingGrid} from './PromoFaltaUno';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const C = {forest: '#103f32', deep: '#0b2e24', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#b9c8bf', card: '#16211c'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const S = (s: number) => Math.round(s * 30);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const kick = Easing.bezier(0.2, 1.4, 0.4, 1); // fast out, slight overshoot
const B = 15; // one beat at 120 BPM
export const T22 = {hook: 0, squad: 4 * B, status: 8 * B, chat: 11 * B, off: 17 * B, stamp: 18 * B, grid: 20 * B, phone: 22 * B, tap: 26 * B, fill: 27 * B, win: 29 * B, end: 33 * B, total: 40 * B};
const T = T22;
const out = Easing.out(Easing.exp), back = Easing.out(Easing.back(1.6));
const ease = (f: number, a: number, b: number, e = out) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
// Whip between scenes: the outgoing scene leaves upward with blur, the incoming one arrives from below.
function Whip({f, from, to, children}: {f: number; from: number; to: number; children: React.ReactNode}) {
  const inP = from === 0 ? 1 : ease(f, from, from + 7), outP = interpolate(f, [to - 5, to], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const y = (1 - inP) * 380 - outP * 380, blur = (1 - inP) * 14 + outP * 14;
  return <AbsoluteFill style={{transform: `translateY(${y}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined}}>{children}</AbsoluteFill>;
}
// Scoreboard roll between two numbers.
function Roll({a, b, p, h}: {a: number; b: number; p: number; h: number}) {
  return <span style={{display: 'inline-block', height: h, overflow: 'hidden', verticalAlign: 'bottom', lineHeight: `${h}px`}}>
    <span style={{display: 'flex', flexDirection: 'column', transform: `translateY(${-p * h}px)`, filter: p > 0.05 && p < 0.95 ? 'blur(2px)' : undefined}}><span>{a}</span><span>{b}</span></span></span>;
}
// Sound cues live in the promo spec (content/instagram/promos/falta-uno-es-v2-2.json), in the same beats as T22.


function Tag({children, bg = C.cream, fg = C.night, style}: {children: React.ReactNode; bg?: string; fg?: string; style?: React.CSSProperties}) {
  return <div style={{position: 'absolute', background: bg, color: fg, fontFamily: U, fontSize: 34, letterSpacing: 3, textTransform: 'uppercase', padding: '10px 22px', borderRadius: 6, ...style}}>{children}</div>;
}
const ConceptTag = () => <Tag bg="#ffffff1f" fg={C.cream} style={{top: 64, left: 60, fontSize: 28, letterSpacing: 2, border: '1px solid #ffffff40'}}>Concepto de la app</Tag>;

// 1 · Hook: oversized overlapping words that slam in.
function Hook({f}: {f: number}) {
  const {fps} = useVideoConfig();
  const word = (txt: string, at: number, top: number, color: string, size: number, rot: number) => {
    const p = ease(f, at, at + 6, Easing.out(Easing.cubic)), settle = interpolate(f, [at + 6, at + 30], [1, 0.97], cl);
    return <div style={{position: 'absolute', left: -20, right: -20, top, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: size, lineHeight: 0.8, color,
      transform: `scale(${(2.4 - p * 1.4) * settle}) rotate(${rot}deg)`, opacity: Math.min(1, p * 3), filter: p < 1 ? `blur(${(1 - p) * 18}px)` : undefined, letterSpacing: -6, whiteSpace: 'nowrap', textTransform: 'uppercase',
      WebkitTextStroke: color === 'transparent' ? `5px ${C.lime}` : undefined}}>{txt}</div>;
  };
  const shake = [0, 8, 23].some(a => f >= a && f < a + 5) ? Math.sin(f * 3) * 10 : 0;
  const band = spring({frame: f - 8, fps, config: {damping: 14}});
  return <AbsoluteFill style={{background: C.night, transform: `translateX(${shake}px)`}}>
    <MovingGrid f={f} opacity={0.08} speed={2}/>
    <div style={{position: 'absolute', left: -60, right: -60, top: 760, height: 300, background: C.forest, transform: `rotate(-4deg) scaleX(${band})`, transformOrigin: 'left'}}/>
    <div style={{position: 'absolute', left: -60, right: -60, top: 1450, height: 90, transform: `rotate(-4deg) translateX(${-f * 6}px)`, opacity: Math.min(1, f / 18),
      backgroundImage: `repeating-linear-gradient(90deg, ${C.cream} 0 45px, ${C.night} 45px 90px)`}}/>
    {word('Falta', 0, 420, C.cream, 400, -4)}
    {word('uno.', 8, 700, C.lime, 480, -4)}
    {word('Otra vez', 23, 1150, 'transparent', 250, -4)}
  </AbsoluteFill>;
}

// 2 · Squad: 14 position cards on a tilted pitch; card 14 stays dark, then flashes and reveals FALTA UNO.
const SLOTS: [number, number, string][] = [
  [540, 1500, 'POR'], [300, 1350, 'DEF'], [780, 1350, 'DEF'], [210, 1190, 'MED'], [540, 1260, 'MED'], [870, 1190, 'MED'], [540, 1075, 'DEL'],
  [540, 520, 'POR'], [300, 650, 'DEF'], [780, 650, 'DEF'], [210, 800, 'MED'], [540, 735, 'MED'], [870, 800, 'MED'], [540, 905, 'DEL'],
];
function Squad({f, dim, counter = true}: {f: number; dim: number; counter?: boolean}) {
  const {fps} = useVideoConfig(), local = f - T.squad, flash = local > 2 * B;
  const cam = interpolate(local, [0, 9 * B], [1.06, 1], {...cl, easing: Easing.out(Easing.quad)});
  return <AbsoluteFill style={{background: C.night}}><AbsoluteFill style={{transform: `scale(${cam})`}}>
    <div style={{position: 'absolute', left: 90, right: 90, top: 420, bottom: 300, borderRadius: 30, opacity: 1 - dim * 0.85,
      background: 'linear-gradient(180deg,#1b5e44,#123f2f)', transform: 'perspective(1600px) rotateX(18deg)', boxShadow: 'inset 0 0 0 4px #ffffff30'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 4, background: '#ffffff30'}}/>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 220, height: 220, marginLeft: -110, marginTop: -110, borderRadius: '50%', border: '4px solid #ffffff30'}}/>
    </div>
    {SLOTS.map(([x, y, pos], i) => {
      const missing = i === 13, on = ease(local, 4 + i * 2, 10 + i * 2, back);
      const pulse = missing && flash ? 0.5 + 0.5 * Math.sin((local - 2 * B) / 3) : 0;
      return <div key={i} style={{position: 'absolute', left: x - 62, top: y - 80, width: 124, height: 150, opacity: (0.35 + 0.65 * Math.min(1, on)) * (1 - dim * 0.8), transform: missing ? undefined : `scale(${0.6 + 0.4 * on})`}}>
        <div style={{width: 124, height: 124, borderRadius: '18px 18px 40px 40px', background: missing ? '#0d1411' : (on > 0.5 ? C.lime : '#24302a'),
          border: missing ? `4px ${flash ? 'solid' : 'dashed'} ${flash ? C.orange : '#3c4a43'}`: 'none', boxShadow: missing && flash ? `0 0 ${30 + pulse * 40}px ${C.orange}` : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 58, color: missing ? C.orange : C.forest}}>{missing ? '?' : ''}</div>
        <div style={{textAlign: 'center', fontFamily: U, fontSize: 24, color: C.mint, marginTop: 4, letterSpacing: 2}}>{pos}</div>
        {missing && flash && [[-18, -18, 'borderTop', 'borderLeft'], [106, -18, 'borderTop', 'borderRight'], [-18, 106, 'borderBottom', 'borderLeft'], [106, 106, 'borderBottom', 'borderRight']].map(([x, y, a, b], k) =>
          <div key={k} style={{position: 'absolute', left: x as number, top: y as number, width: 36, height: 36, [a as string]: `7px solid ${C.lime}`, [b as string]: `7px solid ${C.lime}`,
            transform: `scale(${1 + 0.12 * Math.sin((local - 2 * B) / 3)})`}}/>)}
      </div>;
    })}
    {flash && dim < 0.5 && <Tag bg={C.orange} fg={C.cream} style={{left: 330, top: 290, fontSize: 52, letterSpacing: 6, transform: `scale(${ease(local, 2 * B + 2, 2 * B + 10, back)})`}}>Falta uno</Tag>}
    {counter && <div style={{position: 'absolute', top: 150, right: 70, fontFamily: D, fontStyle: 'italic', fontSize: 120, color: C.cream, opacity: 1 - dim}}>13<span style={{color: C.orange}}>/14</span></div>}
  </AbsoluteFill></AbsoluteFill>;
}

// 3 · Live-Activity-style status card with 14 segments; the last one is the missing player.
function StatusCard({f, at, full}: {f: number; at: number; full: number}) {
  const drop = ease(f, at, at + 12);
  return <div style={{position: 'absolute', left: 50, right: 50, top: 170 - (1 - drop) * 500, filter: drop < 0.9 ? `blur(${(1 - drop) * 12}px)` : undefined, borderRadius: 58, background: '#050807f2', padding: '40px 46px', boxShadow: '0 30px 80px #000c'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
      <div style={{width: 96, height: 96, borderRadius: 26, background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={staticFile('generated/promo/cancha.png')} style={{width: 80, filter: 'brightness(0) invert(1)'}}/></div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 70, lineHeight: 1, color: full ? C.lime : C.cream, textTransform: 'uppercase'}}>{full ? 'Completo' : 'Falta 1'}</div>
        <div style={{fontFamily: U, fontSize: 32, color: C.mint, marginTop: 6}}>Dom. 8:00 PM · Doral</div>
      </div>
      <div style={{textAlign: 'right'}}><div style={{fontFamily: D, fontStyle: 'italic', fontSize: 76, color: C.cream, lineHeight: 1}}><Roll a={13} b={14} p={full} h={76}/></div><div style={{fontFamily: U, fontSize: 28, color: C.mint}}>de 14</div></div>
    </div>
    <div style={{display: 'flex', gap: 8, marginTop: 34}}>
      {Array.from({length: 14}, (_, i) => {
        const last = i === 13, w = last ? full : 1;
        return <div key={i} style={{flex: 1, height: 14, borderRadius: 7, background: '#2a332f', overflow: 'hidden'}}>
          <div style={{width: `${w * 100}%`, height: '100%', background: C.lime, opacity: last && !full ? 0.25 + 0.25 * Math.sin(f / 4) : 1}}/></div>;
      })}
    </div>
  </div>;
}

// 4 · Stacked translucent notifications from a fictional group chat, then typing dots and silence.
const MSGS = ['¿Quién juega hoy?', 'Falta uno', '¿Alguien?', 'Hermano, ¿venís?', '¿Uno más?'];
function Notifications({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - T.chat;
  const shown = MSGS.map((m, i) => ({m, p: ease(local, Math.round(i * 7.5), Math.round(i * 7.5) + 8, back)})).filter(x => x.p > 0.01);
  const buzz = [0, 1, 2, 3, 4].some(i => local >= Math.round(i * 7.5) && local < Math.round(i * 7.5) + 4) ? Math.sin(local * 4) * 5 : 0;
  const typing = local > 3 * B && local < 5 * B + 8;
  return <AbsoluteFill style={{transform: `translateX(${buzz}px)`}}>
    <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 150, color: C.cream}}>
      7:{String(45 + Math.min(13, Math.floor(Math.max(0, local) / 7))).padStart(2, '0')}<span style={{fontSize: 70, color: C.mint}}> PM</span></div>
    {shown.map(({m, p}, i) => {
      const depth = shown.length - 1 - i;
      return <div key={i} style={{position: 'absolute', left: 60 + depth * 10, right: 60 + depth * 10, top: 520 + depth * 168 - (1 - p) * 160,
        opacity: Math.min(1, p) * (1 - depth * 0.14), transform: `scale(${(1 - depth * 0.03) * (0.92 + 0.08 * p)})`, zIndex: 10 - depth, borderRadius: 40, padding: '30px 34px',
        background: 'rgba(245,243,233,0.16)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', gap: 24, alignItems: 'center'}}>
        <div style={{width: 84, height: 84, borderRadius: 22, background: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 44, color: C.lime}}>FD</div>
        <div style={{flex: 1}}><div style={{fontFamily: U, fontSize: 32, color: C.mint}}>Fútbol domingo · ahora</div><div style={{fontFamily: U, fontSize: 48, color: '#fff'}}>{m}</div></div>
      </div>;
    })}
    {typing && <div style={{position: 'absolute', left: 80, top: 1440, display: 'flex', gap: 14, background: '#ffffff22', borderRadius: 40, padding: '24px 32px'}}>
      {[0, 1, 2].map(k => <div key={k} style={{width: 22, height: 22, borderRadius: 11, background: C.cream, opacity: 0.4 + 0.6 * Math.max(0, Math.sin((local - k * 4) / 4))}}/>)}</div>}
  </AbsoluteFill>;
}

// 6 · Beyond-90-style transition: moving grid, floating labels converge toward the phone.
function GridTransition({f}: {f: number}) {
  const local = f - T.grid, p = interpolate(local, [0, 2 * B], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)}), v = Math.sin(Math.PI * p);
  const label = (txt: string, x0: number, y0: number, bg: string, fg: string) => <div style={{position: 'absolute', left: interpolate(p, [0, 1], [x0, 420]), top: interpolate(p, [0, 1], [y0, 900]),
    transform: `scale(${1 - p * 0.5}) rotate(${(1 - p) * -6}deg)`, background: bg, color: fg, fontFamily: D, fontStyle: 'italic', fontSize: 110, padding: '18px 40px', borderRadius: 22, opacity: 1 - p * 0.9, boxShadow: '0 20px 40px #0005', filter: `blur(${v * 7}px)`}}>{txt}</div>;
  return <AbsoluteFill style={{background: '#139a56', transform: `scale(${1 + p * 0.25})`}}>
    <MovingGrid f={f} opacity={0.5} speed={6 + v * 10}/>
    {label('DOM. 8 PM', 90, 380, C.cream, C.forest)}{label('DORAL', 560, 700, C.forest, C.lime)}{label('13/14', 120, 1180, C.lime, C.forest)}{label('7V7', 640, 1500, C.night, C.cream)}
  </AbsoluteFill>;
}

// 7 · Plei-style match detail rebuilt in Cancha colours, one oversized join button.
function Phone({f}: {f: number}) {
  const rise = ease(f, T.phone, T.phone + 14), roll = ease(f, T.tap, T.tap + 8);
  const press = interpolate(f, [T.tap - 6, T.tap - 3, T.tap, T.tap + 7], [1, 1.03, 0.9, 1], cl), joined = f >= T.tap;
  const ring = interpolate(f, [T.tap, T.tap + 14], [0, 1], cl);
  const push = interpolate(f, [T.tap - 24, T.tap - 4, T.tap + 14, T.tap + 26], [1, 1.05, 1.05, 1], {...cl, easing: Easing.inOut(Easing.cubic)});
  const rows: [string, string][] = [['AR', 'Intermedio'], ['JM', 'Avanzado'], ['DL', 'Intermedio'], ['SC', 'Casual']];
  return <AbsoluteFill style={{background: C.night}}>
    <MovingGrid f={f} opacity={0.07}/>
    <div style={{position: 'absolute', left: 50, top: 210 + (1 - rise) * 1600, filter: rise < 0.9 ? `blur(${(1 - rise) * 16}px)` : undefined, width: 980, height: 1690, borderRadius: 110, transform: `scale(${push})`, transformOrigin: '50% 90%', background: '#0d1210', border: '16px solid #222b27', overflow: 'hidden', boxShadow: '0 50px 120px #000'}}>
      <div style={{height: 400, background: 'linear-gradient(180deg,#0b1d17,#1b5e44)', position: 'relative', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 60, right: 60, bottom: -40, height: 260, border: '4px solid #ffffff55', borderRadius: 16, transform: 'perspective(600px) rotateX(40deg)'}}/>
        {[190, 780].map(x => <div key={x} style={{position: 'absolute', left: x, top: 40, width: 70, height: 26, borderRadius: 6, background: '#fff6d8', boxShadow: '0 0 60px 20px #fff2c070'}}/>)}
      </div>
      <div style={{padding: '40px 56px'}}>
        <div style={{display: 'flex', gap: 12}}><span style={{fontFamily: U, fontSize: 40, background: C.lime, color: C.forest, padding: '10px 22px', borderRadius: 10}}>PICKUP 7V7</span></div>
        <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 124, lineHeight: 0.92, color: '#fff', marginTop: 24, textTransform: 'uppercase'}}>Dom. 8:00 PM<br/><span style={{color: C.lime}}>Doral</span></div>
        <div style={{display: 'flex', gap: 24, marginTop: 28, fontFamily: U, fontSize: 48, color: C.mint}}><span>Intermedio</span><span>·</span><span><Roll a={13} b={14} p={roll} h={58}/>/14 jugadores</span></div>
        <div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 22}}>
          {rows.slice(0, 3).map(([ini, lvl]) => <div key={ini} style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 100, height: 100, borderRadius: 50, background: '#24302a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: U, fontSize: 40, color: C.cream}}>{ini}</div>
            <span style={{fontFamily: U, fontSize: 40, color: C.forest, background: C.mint, borderRadius: 12, padding: '8px 20px'}}>{lvl}</span></div>)}
          <div style={{fontFamily: U, fontSize: 42, color: C.mint}}>+10 más</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 56, right: 56, bottom: 70, height: 200, borderRadius: 100, background: joined ? C.cream : C.lime, transform: `scale(${press})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 96, color: C.forest, textTransform: 'uppercase', position: 'absolute', boxShadow: `0 0 0 ${ring * 60}px rgba(215,239,134,${0.5 * (1 - ring)})`}}>
        {joined ? 'Estás adentro' : 'Me sumo'}
        {f > T.tap - 10 && f < T.tap + 8 && <div style={{position: 'absolute', left: '62%', top: 40, width: 120, height: 120, borderRadius: 60, background: '#ffffff40', border: '5px solid #fff'}}/>}</div>
    </div>
  </AbsoluteFill>;
}

// 9 · NRC-style full-screen confirmation.
function Win({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - T.win, wipe = interpolate(local, [0, 8], [0, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const badge = spring({frame: local - 6, fps, config: {damping: 9}}), word = spring({frame: local - 12, fps, config: {damping: 12}});
  return <AbsoluteFill style={{background: C.night}}>
    <div style={{position: 'absolute', left: 540, top: 1720, width: 10, height: 10, borderRadius: '50%', background: C.lime, transform: `scale(${wipe * 500})`}}/>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{width: 300, height: 360, transform: `scale(${badge}) rotate(${(1 - badge) * 20}deg)`, position: 'relative'}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '40px 40px 150px 150px', border: `14px solid ${C.forest}`}}/>
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 130, color: C.forest}}>14</div>
      </div>
      <div style={{fontFamily: D, fontStyle: 'italic', fontSize: 130, lineHeight: 0.88, color: C.forest, textAlign: 'center', textTransform: 'uppercase', transform: `translateY(${(1 - word) * 60}px)`, opacity: word}}>14/14<br/>Partido<br/>completo</div>
    </AbsoluteFill>
  </AbsoluteFill>;
}

// 10 · End card: V2's overlapping type, then a larger real logo and one full-width CTA.
function End({f}: {f: number}) {
  const {fps} = useVideoConfig(), local = f - T.end, a = spring({frame: local, fps, config: {damping: 12}}), b = spring({frame: local - 6, fps, config: {damping: 12}}), c = spring({frame: local - 14, fps, config: {damping: 14}}), d = spring({frame: local - 22, fps, config: {damping: 12}});
  return <AbsoluteFill style={{background: C.forest}}>
    <MovingGrid f={f} opacity={0.07}/>
    <div style={{position: 'absolute', left: 40, right: 0, top: 340, fontFamily: D, fontStyle: 'italic', fontSize: 225, lineHeight: 0.78, color: C.cream, textTransform: 'uppercase', letterSpacing: -6, transform: `translateX(${(1 - a) * -300}px) rotate(-4deg)`}}>Encontrá</div>
    <div style={{position: 'absolute', left: 0, right: 50, top: 540, textAlign: 'right', fontFamily: D, fontStyle: 'italic', fontSize: 225, lineHeight: 0.78, color: C.lime, textTransform: 'uppercase', letterSpacing: -6, transform: `translateX(${(1 - b) * 300}px) rotate(-4deg)`}}>tu partido</div>
    <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', left: 110, width: 860, top: 960, filter: 'brightness(0) invert(1)', opacity: c, transform: `scale(${0.9 + c * 0.1})`}}/>
    <div style={{position: 'absolute', left: 80, right: 80, top: 1300, height: 190, borderRadius: 95, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: D, fontStyle: 'italic', fontSize: 96, color: C.forest, textTransform: 'uppercase', transform: `rotate(-2deg) scale(${d})`}}>Sumate a la lista</div>
    <div style={{position: 'absolute', top: 1540, left: 0, right: 0, textAlign: 'center', fontFamily: U, fontSize: 46, color: C.cream, opacity: d}}>Link en bio · @wearecancha</div>
  </AbsoluteFill>;
}

export const PromoFaltaUnoV22 = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const dimOff = interpolate(f, [T.off, T.off + 4, T.off + 6, T.off + 10, T.stamp - 2], [0, 0.5, 0.2, 0.8, 1], cl);
  const flicker = [T.off + 4, T.off + 5, T.off + 10, T.off + 11].includes(f);
  const stampIn = interpolate(f, [T.stamp, T.stamp + 5], [2.6, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const stampShake = f >= T.stamp + 5 && f < T.stamp + 13 ? (f % 2 ? 1 : -1) * (18 - (f - T.stamp - 5) * 2) : 0;
  const fullFill = ease(f, T.fill, T.fill + 10);
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    {f < T.squad && <Whip f={f} from={0} to={T.squad}><Hook f={f}/></Whip>}
    {f >= T.squad && f < T.chat && <Whip f={f} from={T.squad} to={T.chat}><Squad f={f} dim={0} counter={f < T.status}/>{f >= T.status && <StatusCard f={f} at={T.status} full={0}/>}</Whip>}
    {f >= T.chat && f < T.off && <><Squad f={f} dim={0.85} counter={false}/><AbsoluteFill style={{background: '#000a'}}/><Whip f={f} from={T.chat} to={T.total}><Notifications f={f}/></Whip></>}
    {f >= T.off && f < T.grid && <AbsoluteFill style={{transform: `translate(${stampShake}px, ${-stampShake}px)`}}><Squad f={f} dim={dimOff} counter={false}/>{flicker && <AbsoluteFill style={{background: '#000'}}/>}{f >= T.stamp && <Tag bg={C.orange} fg={C.cream} style={{left: 190, top: 820, fontSize: 96, letterSpacing: 8, transform: `rotate(-5deg) scale(${stampIn})`}}>Suspendido</Tag>}</AbsoluteFill>}
    {f >= T.grid && f < T.phone && <GridTransition f={f}/>}
    {f >= T.phone && f < T.win && <><Phone f={f}/><ConceptTag/>{f >= T.fill && <StatusCard f={f} at={T.fill - 10} full={fullFill}/>}</>}
    {f >= T.win && f < T.end && <Win f={f}/>}
    {f >= T.end && <Whip f={f} from={T.end} to={T.total + 99}><End f={f}/></Whip>}
    <Grain/>
  </AbsoluteFill>;
};
