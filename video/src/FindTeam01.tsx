// Launch brief 01 "Find a team near you", v2 (owner, Nov 18: draft 1 was not good: muddy map, titles and app parts cut,
// weak transitions; every text must follow the brand; illustrated UI is fine and every club has given its okay).
// Everything is drawn in code so nothing is cropped: a vector map of Miami-Dade + Broward (US Census county shapes),
// club pins with the real crests, an illustrated club card and opening card in Cancha's UI, and a lime end frame.
// One motion language: lines rise through a padded mask, the tapped pin grows into the card's crest (shared element),
// cards move like a carousel, a lime circle wipe opens the end frame. Brand type only: Barlow Condensed (italic bold
// uppercase headlines, upright everything else), forest / cream / lime / orange.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

const C = {forest: '#103f32', land: '#17503f', card: '#0b2a21', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#a9bdb3'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const out = Easing.out(Easing.exp), inC = Easing.in(Easing.cubic);
const ease = (f: number, a: number, b: number, e = out) => interpolate(f, [a, b], [0, 1], {...cl, easing: e});
const A = (p: string) => staticFile('generated/promo/appad/' + p);
type Club = {slug: string; name: string; city: string; lat: number; lng: number};
type MapData = {W: number; H: number; box: {minLat: number; maxLat: number; minLng: number; maxLng: number}; dade: string; broward: string};
export type Cue01 = {pan: number; tap: number; looking: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_01: Cue01 = {pan: 2, tap: 6, looking: 11, end: 13, total: 16, captions: [
  {at: 0.2, to: 1.3, text: 'Need a team?'},
  {at: 1.4, to: 4.8, text: 'See real clubs across Miami-Dade and Broward,'},
  {at: 6.3, to: 8.4, text: 'explore their pages,'},
  {at: 11.0, to: 12.9, text: "and see who's looking for players."},
]};
const FIRST = ['miami-united-fc', 'florida-island-united', 'miami-sporting-fc'], TAP = 'river-miami-fc';

// Headline: each line rises through its own padded mask (room for the italic lean and descenders), 3-frame stagger.
function Lines({f, from, to, lines, top = 210, size = 150}: {f: number; from: number; to: number; lines: [string, string][]; top?: number; size?: number}) {
  if (f < from || f > to) return null;
  return <div style={{position: 'absolute', left: 64, right: 40, top}}>
    {lines.map(([txt, color], i) => {
      const a = from + i * 3, p = ease(f, a, a + 13), o = ease(f, to - 9 + i * 2, to - 1 + i * 2, inC);
      return <div key={i} style={{overflow: 'hidden', padding: '0.04em 0.18em 0.06em 0.02em', margin: '-0.04em 0 -0.06em'}}>
        <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: size, lineHeight: 0.98, color, textTransform: 'uppercase', whiteSpace: 'nowrap',
          transform: `translateY(${(1 - p) * 105 - o * 105}%)`}}>{txt}</div>
      </div>;
    })}
  </div>;
}
function Caption({f, fps, cues, dark}: {f: number; fps: number; cues: Cue01; dark: boolean}) {
  const c = cues.captions.find(c => f >= c.at * fps && f < c.to * fps);
  if (!c) return null;
  const p = ease(f, c.at * fps, c.at * fps + 6);
  return <div style={{position: 'absolute', left: 90, right: 90, bottom: 300, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}>
    <span style={{fontFamily: U, fontWeight: 700, fontSize: 46, lineHeight: 1.35, color: C.cream, background: dark ? '#07130fd9' : '#07130fb3', padding: '10px 22px', borderRadius: 16, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone'}}>{c.text}</span>
  </div>;
}
function Badge({slug, size, ring}: {slug: string; size: number; ring?: boolean}) {
  return <div style={{width: size, height: size, borderRadius: size / 2, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: ring ? `0 0 0 6px ${C.lime}, 0 14px 30px rgba(0,0,0,0.45)` : '0 10px 24px rgba(0,0,0,0.45)'}}>
    <Img src={A('crests/' + slug + '.png')} style={{width: size * 0.78, height: size * 0.78, objectFit: 'contain'}}/>
  </div>;
}
const Label = ({children, color = C.mint, size = 40}: {children: React.ReactNode; color?: string; size?: number}) =>
  <span style={{fontFamily: U, fontWeight: 700, fontSize: size, letterSpacing: 2, textTransform: 'uppercase', color}}>{children}</span>;
function Row({k, v}: {k: string; v: string}) {
  return <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #ffffff17', padding: '18px 0 0'}}><Label>{k}</Label><Label color={C.lime}>{v}</Label></div>;
}
function Btn({children, solid}: {children: React.ReactNode; solid?: boolean}) {
  return <div style={{flex: 1, height: 108, borderRadius: 28, display: 'grid', placeItems: 'center', background: solid ? C.lime : 'transparent', border: solid ? 'none' : `3px solid ${C.lime}`}}>
    <Label color={solid ? C.forest : C.lime} size={40}>{children}</Label></div>;
}

export function FindTeam01({cues = CUES_01, clubs = [], map}: {cues?: Cue01; clubs?: Club[]; map?: MapData}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps), t = {pan: s(cues.pan), tap: s(cues.tap), looking: s(cues.looking), end: s(cues.end)};
  if (!map) return <AbsoluteFill style={{background: C.forest}}/>;

  // Map camera: Miami at (720, 1180) on screen; a slow push toward Broward until the tap.
  const P = (lat: number, lng: number) => ({x: (lng - map.box.minLng) / (map.box.maxLng - map.box.minLng) * map.W, y: (map.box.maxLat - lat) / (map.box.maxLat - map.box.minLat) * map.H});
  const miami = P(25.77, -80.19), hollywood = P(26.01, -80.15);
  const push = ease(f, t.pan, t.tap + 10, Easing.inOut(Easing.cubic));
  const scale = 1.4 + push * 0.25, fx = miami.x + (hollywood.x - miami.x) * push, fy = miami.y + (hollywood.y - miami.y) * push;
  const sx = 700 - fx * scale, sy = 1180 - 120 * push - fy * scale;
  const screen = (x: number, y: number) => ({x: sx + x * scale, y: sy + y * scale});

  const order = [...FIRST.map(x => clubs.find(c => c.slug === x)).filter(Boolean) as Club[], ...clubs.filter(c => !FIRST.includes(c.slug) && c.slug !== TAP), ...clubs.filter(c => c.slug === TAP)];
  const landAt = (i: number) => i < 2 ? 2 + i * 4 : i === 2 ? 34 : t.pan + (i - 3) * 3;
  const seen: Record<string, number> = {}, pin = 100;
  const pins = order.map(c => { const k = (seen[c.city] = (seen[c.city] ?? -1) + 1), a = k * 2.4 + 0.6, r = k ? 40 * Math.sqrt(k) : 0, p = P(c.lat, c.lng); return {c, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r}; });
  const tapPin = pins.find(p => p.c.slug === TAP)!, tapAt = screen(tapPin.x, tapPin.y);

  // Club card (shared element: the tapped pin grows into the card's crest), then the opening card slides in.
  const cardIn = spring({frame: f - t.tap - 6, fps, config: {damping: 18, stiffness: 120}});
  const swap = spring({frame: f - t.looking, fps, config: {damping: 20, stiffness: 110}});
  const dim = ease(f, t.tap + 2, t.tap + 16);
  const cardTop = 700, crestTarget = {x: 64 + 56 + 84, y: cardTop + 56 + 84};
  const grow = ease(f, t.tap + 4, t.tap + 20, Easing.inOut(Easing.cubic));
  const wipe = ease(f, t.end - 2, t.end + 14, Easing.inOut(Easing.cubic));
  const btn = {x: 540 + 1080 * (1 - swap), y: cardTop + 700};

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>

    {/* Map */}
    <div style={{position: 'absolute', inset: 0, opacity: 1 - dim * 0.65, filter: dim > 0.02 ? `blur(${dim * 6}px)` : undefined}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${sx} ${sy}) scale(${scale})`} style={{opacity: ease(f, 0, 8)}}>
          <path d={map.dade} fill={C.land} stroke="#d7ef8640" strokeWidth={2 / scale} strokeLinejoin="round"/>
          <path d={map.broward} fill={C.land} stroke="#d7ef8640" strokeWidth={2 / scale} strokeLinejoin="round"/>
        </g>
      </svg>
      {pins.map(({c, x, y}, i) => {
        const a = landAt(i); if (f < a) return null;
        const p = spring({frame: f - a, fps, config: {damping: 12, stiffness: 170}}), q = screen(x, y), isTap = c.slug === TAP && f >= t.tap - 14;
        const hide = c.slug === TAP && f >= t.tap + 4;
        return <div key={c.slug} style={{position: 'absolute', left: q.x - pin / 2, top: q.y - pin / 2, transform: `translateY(${(1 - p) * -30}px) scale(${p * (isTap ? 1.12 : 1)})`, opacity: hide ? 0 : 1}}>
          <Badge slug={c.slug} size={pin} ring={isTap}/></div>;
      })}
    </div>
    {f >= t.tap - 1 && f < t.tap + 14 && (() => { const p = ease(f, t.tap, t.tap + 14, Easing.out(Easing.quad)); return <div style={{position: 'absolute', left: tapAt.x - 80, top: tapAt.y - 80, width: 160, height: 160, borderRadius: 80, border: `6px solid ${C.lime}`, transform: `scale(${0.5 + p})`, opacity: 1 - p}}/>; })()}

    {/* Club card */}
    {f >= t.tap + 4 && f < t.end && <div style={{position: 'absolute', left: 64, top: cardTop, width: 952, transform: `translateY(${(1 - cardIn) * 260}px) translateX(${-swap * 1100}px)`, opacity: Math.min(1, cardIn * 2),
      background: C.card, borderRadius: 52, padding: 56, boxShadow: '0 40px 100px rgba(0,0,0,0.5)', border: '2px solid #ffffff12'}}>
      <div style={{width: 168, height: 168}}/>
      <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 116, lineHeight: 1, color: C.cream, textTransform: 'uppercase', marginTop: 28}}>River Miami FC</div>
      <div style={{marginTop: 12}}><Label size={42}>UPSL Division 1 · Hollywood</Label></div>
      <div style={{display: 'flex', gap: 18, marginTop: 40}}><Btn solid>Follow</Btn><Btn>Ask about tryouts</Btn></div>
    </div>}
    {/* Shared element: the pin's badge travels and grows into the card crest */}
    {f >= t.tap + 4 && f < t.end && (() => { const x = tapAt.x + (crestTarget.x - tapAt.x) * grow, y = tapAt.y + (crestTarget.y - tapAt.y) * grow + (1 - cardIn) * 260 * grow, sz = pin * 1.12 + (168 - pin * 1.12) * grow;
      return <div style={{position: 'absolute', left: x - sz / 2 - swap * 1100, top: y - sz / 2}}><Badge slug={TAP} size={sz}/></div>; })()}

    {/* Opening card */}
    {f >= t.looking && <div style={{position: 'absolute', left: 64, top: cardTop, width: 952, transform: `translateX(${(1 - swap) * 1100}px)`,
      background: C.card, borderRadius: 52, padding: 56, boxShadow: '0 40px 100px rgba(0,0,0,0.5)', border: '2px solid #ffffff12', display: 'flex', flexDirection: 'column', gap: 18}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18}}><Badge slug="miami-united-fc" size={84}/><Label size={40}>Miami United FC</Label>
        <span style={{marginLeft: 'auto', background: C.orange, borderRadius: 999, padding: '6px 18px'}}><Label color={C.cream} size={32}>Recruiting</Label></span></div>
      <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 120, lineHeight: 1, color: C.cream, textTransform: 'uppercase', margin: '8px 0 6px'}}>Open Talent ID</div>
      <Row k="Level" v="First team · U23"/><Row k="When" v="Open now"/><Row k="Where" v="Hialeah"/>
      <div style={{display: 'flex', marginTop: 16}}><Btn solid>Ask to join</Btn></div>
    </div>}

    <Lines f={f} from={0} to={t.pan + 4} lines={[['Find a team', C.cream], ['near you', C.lime]]}/>
    <Lines f={f} from={t.pan + 6} to={t.tap + 4} lines={[['Clubs', C.cream], ['near you', C.lime]]}/>
    <Lines f={f} from={t.tap + 8} to={t.looking + 2} lines={[['Explore', C.cream], ['local clubs', C.lime]]}/>
    <Lines f={f} from={t.looking + 4} to={t.end} lines={[["Who's looking", C.cream], ['for players', C.lime]]}/>
    {f < t.end + 6 && <Caption f={f} fps={fps} cues={cues} dark={dim > 0.5}/>}

    {/* End frame: a lime circle opens from the Ask to join button */}
    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at ${btn.x}px ${btn.y}px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 680, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={9999} top={880} size={160} lines={[['Join the', C.forest], ['waitlist', C.orange]]}/>
      <div style={{position: 'absolute', left: 64, top: 1230, opacity: ease(f, t.end + 22, t.end + 30)}}><Label color={C.forest} size={42}>Link in bio · Coming to the App Store</Label></div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
