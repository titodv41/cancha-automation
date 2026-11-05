// Promo 1, "La cancha vacía" (owner-approved script, Nov 5): an original animated story, no footage.
// Night field -> scoreboard 13/14 with one empty bib -> group chat nobody answers -> lights go off -> Miami lights up -> Cancha.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type PromoText = {kicker: string; day: string; count: string; missing: string; chat: string[]; chatTime: string; off: string; city: string; tag1: string; tag2: string; cta: string};
type Brand = {forest: string; cream: string; accent: string; orange: string};
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const S = (s: number) => Math.round(s * 30);
const display = 'CanchaDisplay, sans-serif', ui = 'CanchaUI, sans-serif';

function Tag({text, color, top, left, right, at, f}: {text: string; color: string; top: number; left?: number; right?: number; at: number; f: number}) {
  const {fps} = useVideoConfig(), pop = spring({frame: f - at, fps, config: {damping: 14}});
  return <div style={{position: 'absolute', top, left, right, transform: `scale(${0.85 + pop * 0.15})`, opacity: pop, display: 'flex', alignItems: 'center', gap: 22,
    background: '#0b0f0dcc', border: `3px solid ${color}`, borderRadius: 14, padding: '18px 30px', fontFamily: ui, fontSize: 52, letterSpacing: 6, color: '#fff', textTransform: 'uppercase'}}>
    <div style={{width: 22, height: 22, background: color, borderRadius: 3}}/>{text}</div>;
}

function Pitch({f, lightsOff}: {f: number; lightsOff: number}) {
  const dim = interpolate(f, [lightsOff, lightsOff + 6, lightsOff + 18, lightsOff + 24], [1, 0.25, 0.25, 0.08], clamp);
  return <AbsoluteFill>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#05080a 0%,#0b1d17 45%,#0d2a1f 100%)'}}/>
    {[180, 900].map((x, i) => <React.Fragment key={i}>
      <div style={{position: 'absolute', left: x - 10, top: 360, width: 20, height: 560, background: '#2b3430'}}/>
      <div style={{position: 'absolute', left: x - 70, top: 320, width: 140, height: 60, borderRadius: 10, background: `rgba(255,248,214,${0.95 * dim})`, boxShadow: `0 0 ${90 * dim}px ${40 * dim}px rgba(255,240,190,${0.55 * dim})`}}/>
      <div style={{position: 'absolute', left: x - (i ? 640 : 120), top: 380, width: 760, height: 1100, opacity: 0.22 * dim,
        background: 'linear-gradient(180deg,rgba(255,245,200,.9),rgba(255,245,200,0))', clipPath: i ? 'polygon(84% 0,100% 0,60% 100%,0 100%)' : 'polygon(0 0,16% 0,100% 100%,40% 100%)'}}/>
    </React.Fragment>)}
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.35 + 0.65 * dim}}>
      <polygon points="300,1000 780,1000 1060,1700 20,1700" fill={`rgba(31,110,72,${0.55 + 0.35 * dim})`} stroke="#d9f5e5" strokeWidth="5"/>
      <line x1="540" y1="1000" x2="540" y2="1700" stroke="#d9f5e5" strokeWidth="5"/>
      <ellipse cx="540" cy="1330" rx="150" ry="70" fill="none" stroke="#d9f5e5" strokeWidth="5"/>
    </svg>
  </AbsoluteFill>;
}

function Bibs({f, at, brand}: {f: number; at: number; brand: Brand}) {
  const {fps} = useVideoConfig();
  return <div style={{position: 'absolute', top: 1180, left: 90, right: 90, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 18}}>
    {Array.from({length: 14}, (_, i) => {
      const empty = i === 13, pop = spring({frame: f - at - i * 2, fps, config: {damping: 12}}), pulse = empty ? 0.6 + 0.4 * Math.sin((f - at) / 5) : 1;
      return <div key={i} style={{height: 150, borderRadius: 18, transform: `scale(${pop})`, opacity: empty ? pulse : 1,
        background: empty ? 'transparent' : brand.accent, border: empty ? `5px dashed ${brand.orange}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontStyle: 'italic', fontSize: 64, color: empty ? brand.orange : brand.forest}}>{empty ? '?' : i + 1}</div>;
    })}
  </div>;
}

function Chat({f, at, lines, time}: {f: number; at: number; lines: string[]; time: string}) {
  const {fps} = useVideoConfig();
  return <div style={{position: 'absolute', top: 560, left: 110, right: 110, display: 'flex', flexDirection: 'column', gap: 26}}>
    <div style={{alignSelf: 'center', fontFamily: ui, fontSize: 38, color: '#9fb3aa', letterSpacing: 3}}>{time}</div>
    {lines.map((l, i) => {
      const pop = spring({frame: f - at - i * 18, fps, config: {damping: 13}});
      return <div key={i} style={{alignSelf: i % 2 ? 'flex-start' : 'flex-end', maxWidth: 720, opacity: pop, transform: `translateY(${(1 - pop) * 40}px)`,
        background: i % 2 ? '#26302c' : '#2f6b4f', color: '#fff', fontFamily: ui, fontSize: 56, padding: '26px 36px', borderRadius: 40}}>{l}</div>;
    })}
    <div style={{alignSelf: 'flex-end', fontFamily: ui, fontSize: 34, color: '#7c8f86', opacity: interpolate(f, [at + lines.length * 18 + 10, at + lines.length * 18 + 20], [0, 1], clamp)}}>Read 7:46 PM</div>
  </div>;
}

function PhoneScene({f, at, brand, text}: {f: number; at: number; brand: Brand; text: PromoText}) {
  // The answer: the Cancha app shows the open spot nearby, one tap fills it, and the field lights come back on.
  const {fps} = useVideoConfig(), rise = spring({frame: f - at, fps, config: {damping: 16}}), tap = at + S(2.0);
  const pressed = interpolate(f, [tap, tap + 4, tap + 9], [1, 0.9, 1], clamp), filled = f >= tap + 4;
  const glow = interpolate(f, [tap + 4, tap + 20], [0, 1], clamp);
  return <AbsoluteFill>
    <AbsoluteFill style={{opacity: glow}}><Pitch f={0} lightsOff={1e9}/></AbsoluteFill>
    <div style={{position: 'absolute', left: 190, top: 330 + (1 - rise) * 900, width: 700, height: 1300, borderRadius: 90, background: '#0d1210', border: '14px solid #1f2723', boxShadow: '0 40px 90px #000c', overflow: 'hidden', transform: `scale(${0.98 + glow * 0.02})`}}>
      <div style={{position: 'absolute', top: 70, left: 50, right: 50, display: 'flex', justifyContent: 'space-between', fontFamily: ui, fontSize: 34, color: '#8a9690'}}><span>Para vos</span><span>Equipos</span><span>Cerca</span></div>
      <div style={{position: 'absolute', top: 150, left: 34, right: 34, bottom: 60, borderRadius: 48, overflow: 'hidden', background: 'linear-gradient(180deg,#1d5a47,#0b2e24)'}}>
        <div style={{position: 'absolute', top: 40, left: 40, fontFamily: ui, fontSize: 32, color: brand.forest, background: brand.accent, borderRadius: 10, padding: '8px 16px'}}>PICKUP</div>
        <div style={{position: 'absolute', top: 300, left: 40, right: 40, fontFamily: display, fontStyle: 'italic', fontSize: 84, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase'}}>{text.day}<br/>Doral</div>
        <div style={{position: 'absolute', top: 640, left: 40, right: 40, display: 'flex', gap: 50}}>
          <div><div style={{fontFamily: ui, fontSize: 30, color: '#cfe0d6'}}>JUGADORES</div><div style={{fontFamily: display, fontStyle: 'italic', fontSize: 90, color: filled ? brand.accent : '#fff'}}>{filled ? '14 / 14' : text.count}</div></div>
        </div>
        <div style={{position: 'absolute', left: 40, right: 40, bottom: 50, height: 130, borderRadius: 30, background: filled ? '#ffffff' : brand.accent, transform: `scale(${pressed})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontStyle: 'italic', fontSize: 64, color: brand.forest, textTransform: 'uppercase'}}>{filled ? '✓ Estás adentro' : 'Me sumo'}</div>
      </div>
    </div>
    {f >= tap - 6 && f < tap + 10 && <div style={{position: 'absolute', left: 520, top: 1430 + (1 - rise) * 900, width: 110, height: 110, borderRadius: 55, background: '#ffffff55', border: '4px solid #fff', transform: `scale(${pressed})`}}/>}
    <div style={{position: 'absolute', bottom: 120, left: 80, right: 80, fontFamily: display, fontStyle: 'italic', fontSize: 84, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', textShadow: '0 6px 30px #000', opacity: interpolate(f, [at + 10, at + 20], [0, 1], clamp)}}>{text.city}</div>
  </AbsoluteFill>;
}

export const PromoEmptySpot = ({brand, text, logo}: {brand: Brand; text: PromoText; logo: string}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const T = {count: S(3.2), chat: S(7.5), off: S(12.2), city: S(15.2), end: S(19.4)};
  const vis = (a: number, b: number) => interpolate(f, [a, a + 8, b - 8, b], [0, 1, 1, 0], clamp);
  const endPop = spring({frame: f - T.end, fps, config: {damping: 15}});
  return <AbsoluteFill style={{background: '#05080a', overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    {f < T.city && <Pitch f={f} lightsOff={T.off}/>}
    {f < T.chat && <AbsoluteFill style={{opacity: vis(0, T.chat)}}>
      <div style={{position: 'absolute', top: 190, left: 80, right: 80, fontFamily: display, fontStyle: 'italic', fontSize: 120, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', textShadow: '0 6px 30px #000', whiteSpace: 'pre-line'}}>{text.kicker}</div>
      <Tag text={text.day} color={brand.orange} top={560} left={80} at={S(1.2)} f={f}/>
      <Tag text={text.count} color={brand.accent} top={700} right={80} at={T.count} f={f}/>
      {f > T.count && <Bibs f={f} at={T.count} brand={brand}/>}
      <Tag text={text.missing} color={brand.orange} top={1420} left={80} at={T.count + S(1.6)} f={f}/>
    </AbsoluteFill>}
    {f >= T.chat && f < T.off + S(0.3) && <AbsoluteFill style={{opacity: vis(T.chat, T.off + S(0.3)), background: '#05080add'}}><Chat f={f} at={T.chat + 6} lines={text.chat} time={text.chatTime}/></AbsoluteFill>}
    {f >= T.off && f < T.city && <Tag text={text.off} color="#e23b3b" top={880} left={150} at={T.off + S(0.8)} f={f}/>}
    {f >= T.city && f < T.end && <AbsoluteFill style={{opacity: vis(T.city, T.end), background: '#05080a'}}>
      <PhoneScene f={f} at={T.city + 4} brand={brand} text={text}/>
    </AbsoluteFill>}
    {f >= T.end && <AbsoluteFill style={{background: brand.forest, alignItems: 'center', justifyContent: 'center', gap: 50, opacity: endPop}}>
      <Img src={staticFile(logo)} style={{width: 640, filter: 'brightness(0) invert(1)', transform: `scale(${0.9 + endPop * 0.1})`}}/>
      <div style={{fontFamily: display, fontStyle: 'italic', fontSize: 92, lineHeight: 1, color: '#fff', textAlign: 'center', textTransform: 'uppercase'}}>{text.tag1}<br/><span style={{color: brand.accent}}>{text.tag2}</span></div>
      <div style={{fontFamily: ui, fontSize: 46, color: brand.forest, background: brand.accent, borderRadius: 999, padding: '22px 46px'}}>{text.cta}</div>
    </AbsoluteFill>}
  </AbsoluteFill>;
};
