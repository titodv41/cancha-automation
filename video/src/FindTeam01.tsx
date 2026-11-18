// Launch brief 01 "Find a team near you" (owner, Nov 18: Cancha launch content brief, made first). 16 s waitlist ad
// built only from the real app: the club map of Miami-Dade + Broward with the real crests landing at their cities,
// a tap on River Miami FC opening its real club page, the real "Looking for players" row, then the lime end frame.
// Motion per the brief: headlines reveal through an overflow mask (about 18 px, 7 frames), one movement per shot,
// cuts on taps, Chris captioned in a separate lower band, the last 3 s a stable call to action.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const C = {forest: '#103f32', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#9fb3ab'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = (f: number, a: number, b: number, e = Easing.out(Easing.cubic)) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
const A = (p: string) => staticFile('generated/promo/appad/' + p);
type Club = {slug: string; name: string; city: string; lat: number; lng: number};
export type Cue01 = {pan: number; tap: number; looking: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_01: Cue01 = {pan: 2, tap: 6, looking: 11, end: 13, total: 16, captions: [
  {at: 0.2, to: 1.2, text: 'Need a team?'},
  {at: 1.3, to: 4.6, text: 'See real clubs across Miami-Dade and Broward,'},
  {at: 6.2, to: 7.6, text: 'explore their pages,'},
  {at: 11.0, to: 12.9, text: "and see who's looking for players."},
  {at: 13.3, to: 15.6, text: 'Join the waitlist.'},
]};
// Map projection: assets/sofla-land.png covers exactly this box (from the app, US Census county shapes).
const BOX = {minLat: 25.40, maxLat: 26.34, minLng: -80.70, maxLng: -80.02}, MW = 1000, MH = MW * 1200 / 781;
const at = (lat: number, lng: number) => ({x: (lng - BOX.minLng) / (BOX.maxLng - BOX.minLng) * MW, y: (BOX.maxLat - lat) / (BOX.maxLat - BOX.minLat) * MH});
const FIRST = ['miami-united-fc', 'florida-island-united', 'miami-sporting-fc'], TAP = 'river-miami-fc';

function Head({f, from, to, children, color = C.cream, top = 150, size = 150}: {f: number; from: number; to: number; children: React.ReactNode; color?: string; top?: number; size?: number}) {
  if (f < from || f > to) return null;
  const p = ease(f, from, from + 7), out = ease(f, to - 6, to, Easing.in(Easing.cubic));
  return <div style={{position: 'absolute', left: 60, right: 60, top, height: size * 0.95, overflow: 'hidden'}}>
    <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: size, lineHeight: 0.95, color, textTransform: 'uppercase', whiteSpace: 'nowrap',
      transform: `translateY(${(1 - p) * 18 - out * 18}px)`, opacity: p * (1 - out)}}>{children}</div>
  </div>;
}
function Caption({f, fps, cues}: {f: number; fps: number; cues: Cue01}) {
  const c = cues.captions.find(c => f >= c.at * fps && f < c.to * fps);
  if (!c) return null;
  const p = ease(f, c.at * fps, c.at * fps + 5);
  return <div style={{position: 'absolute', left: 80, right: 80, bottom: 250, textAlign: 'center', opacity: p}}>
    <span style={{fontFamily: U, fontSize: 54, lineHeight: 1.3, color: C.cream, background: '#07130fcc', padding: '10px 22px', borderRadius: 14, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{c.text}</span>
  </div>;
}
function Tap({f, at: a, x, y}: {f: number; at: number; x: number; y: number}) {
  if (f < a || f > a + 22) return null;
  const p = ease(f, a, a + 18, Easing.out(Easing.quad));
  return <><div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 70, border: `6px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.3})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: x - 28, top: y - 28, width: 56, height: 56, borderRadius: 28, background: '#ffffffd0', opacity: f < a + 8 ? 1 : 1 - (f - a - 8) / 10}}/></>;
}
function Screen({img, w, h, f, from, to}: {img: string; w: number; h: number; f: number; from: number; to: number}) {
  if (f < from || f >= to) return null;
  const p = spring({frame: f - from, fps: 30, config: {damping: 16, stiffness: 140}});
  const width = 1000, height = width * h / w;
  return <div style={{position: 'absolute', left: 40, top: 1000 - height / 2, width, height, borderRadius: 40, overflow: 'hidden',
    transform: `translateY(${(1 - p) * 60}px) scale(${0.96 + p * 0.04})`, opacity: Math.min(1, p * 1.6), boxShadow: '0 40px 110px rgba(0,0,0,0.6)'}}>
    <Img src={A(img)} style={{width, height}}/>
  </div>;
}

export function FindTeam01({cues = CUES_01, clubs = []}: {cues?: Cue01; clubs?: Club[]}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps), t = {pan: s(cues.pan), tap: s(cues.tap), looking: s(cues.looking), end: s(cues.end)};

  // Crest order: three in Miami-Dade for the hook, the rest land 3-4 frames apart during the pan, River Miami last.
  const order = [...FIRST.map(x => clubs.find(c => c.slug === x)).filter(Boolean) as Club[], ...clubs.filter(c => !FIRST.includes(c.slug) && c.slug !== TAP), ...clubs.filter(c => c.slug === TAP)];
  const landAt = (i: number) => i < 2 ? 0 : i === 2 ? 30 : t.pan + (i - 3) * 3.5;
  const seen: Record<string, number> = {}, size = 84;
  const pos = order.map(c => { const k = (seen[c.city] = (seen[c.city] ?? -1) + 1), a = k * 2.4, r = k ? size * 0.55 * Math.sqrt(k) : 0, p = at(c.lat, c.lng); return {c, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r}; });
  // Camera: framed on Miami-Dade, one pan north to Broward, then holds for the tap.
  const zoom = 1.7, focusY = interpolate(f, [t.pan, t.pan + 100], [at(25.80, 0).y, at(26.06, 0).y], {...cl, easing: Easing.inOut(Easing.cubic)});
  const camX = 560 - (MW * 0.72) * zoom, camY = 1060 - focusY * zoom;
  const tapPos = pos.find(p => p.c.slug === TAP), tapScreen = tapPos ? {x: camX + tapPos.x * zoom, y: camY + tapPos.y * zoom} : {x: 540, y: 900};
  const mapOut = ease(f, t.tap + 8, t.tap + 16, Easing.in(Easing.cubic));

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    {f < t.tap + 16 && <div style={{position: 'absolute', left: camX, top: camY, width: MW, height: MH, transform: `scale(${zoom})`, transformOrigin: '0 0', opacity: 1 - mapOut}}>
      <Img src={A('sofla-land.png')} style={{position: 'absolute', width: MW, height: MH}}/>
      {pos.map(({c, x, y}, i) => {
        const a = landAt(i), p = spring({frame: f - a, fps, config: {damping: 13, stiffness: 160}});
        if (f < a) return null;
        const isTap = c.slug === TAP && f >= t.tap - 12, pulse = isTap ? 1 + 0.08 * Math.sin((f - t.tap) / 2.5) : 1;
        return <Img key={c.slug} src={A('crests/' + c.slug + '.png')} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size,
          transform: `translateY(${(1 - p) * -40}px) scale(${(0.6 + p * 0.4) * pulse})`, opacity: Math.min(1, p * 2), filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
          outline: isTap ? `4px solid ${C.lime}` : undefined, outlineOffset: 6, borderRadius: 12}}/>;
      })}
    </div>}
    {f >= t.tap - 2 && f < t.tap + 26 && <Tap f={f} at={t.tap} x={tapScreen.x} y={tapScreen.y}/>}

    <Head f={f} from={0} to={t.pan + 4}>Find a team</Head>
    <Head f={f} from={4} to={t.pan + 4} top={292} color={C.lime}>near you</Head>
    <Head f={f} from={t.pan + 6} to={t.tap + 6} color={C.lime}>Clubs near you</Head>
    <Head f={f} from={t.tap + 14} to={t.looking} size={124}>Explore local clubs</Head>

    <Screen img="crop-club-river.png" w={1170} h={960} f={f} from={t.tap + 14} to={t.looking}/>
    <Screen img="crop-looking.png" w={1170} h={645} f={f} from={t.looking} to={t.end}/>

    {f >= t.end && <AbsoluteFill style={{background: C.lime, opacity: ease(f, t.end, t.end + 6)}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 620, left: 230, top: 700}}/>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center'}}>
        <span style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 104, color: C.forest, textTransform: 'uppercase'}}>Join the waitlist</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: U, fontSize: 42, color: C.forest, letterSpacing: 3}}>LINK IN BIO · COMING TO THE APP STORE</div>
    </AbsoluteFill>}
    {f < t.end && <Caption f={f} fps={fps} cues={cues}/>}
  </AbsoluteFill>;
}
