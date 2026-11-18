// Launch ad 01 v3 (owner, Nov 18: "love that this is way better"; add taps to the transitions, touching Follow, signing
// up for a tryout, a message from the coach "we want you on the team"; sell the feeling of finding your team and
// community). One club, one story: find it on the map, the pin becomes its card, tap Follow, tap Sign up for tryout,
// the coach's message drops in, tap it, the team chat welcomes you, lime wipe to "Find your team. Find your people."
// Illustrated UI in Cancha's style (owner: illustrations are fine; the clubs have given their okay). Brand type only.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {A, Badge, Btn, C, Caption, D, Label, Lines, U, ease, inC, type Club, type MapData} from './FindTeam01';

export type CueV3 = {pan: number; tap: number; follow: number; tryout: number; notify: number; chat: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_V3: CueV3 = {pan: 2, tap: 5.5, follow: 7.4, tryout: 9.2, notify: 11.0, chat: 12.8, end: 17.0, total: 21.5, captions: [
  {at: 0.2, to: 1.3, text: 'Need a team?'},
  {at: 1.4, to: 5.0, text: 'See real clubs across Miami-Dade and Broward.'},
  {at: 5.8, to: 8.8, text: 'Follow the ones you like,'},
  {at: 9.0, to: 10.8, text: 'sign up for a tryout,'},
  {at: 11.0, to: 12.7, text: 'and hear back from the coach.'},
  {at: 13.2, to: 16.6, text: "That's your team. Those are your people."},
]};
const FIRST = ['miami-united-fc', 'florida-island-united', 'miami-sporting-fc'], TAP = 'river-miami-fc';
const Check = ({color, size = 34}: {color: string; size?: number}) => <svg width={size} height={size} viewBox="0 0 24 24" style={{marginRight: 10}}><path d="M4 12.5l5 5L20 6.5" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"/></svg>;
function Ripple({f, at, x, y}: {f: number; at: number; x: number; y: number}) {
  if (f < at - 1 || f > at + 16) return null;
  const p = ease(f, at, at + 15, Easing.out(Easing.quad));
  return <><div style={{position: 'absolute', left: x - 70, top: y - 70, width: 140, height: 140, borderRadius: 70, border: `6px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.2})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 30, background: '#ffffffd9', transform: `scale(${1 - p * 0.3})`, opacity: f < at + 7 ? 1 : Math.max(0, 1 - (f - at - 7) / 8)}}/></>;
}
// A button that flips state when tapped: pops slightly, swaps label with a check.
function FlipBtn({f, at, before, after, solidBefore, solidAfter}: {f: number; at: number; before: string; after: string; solidBefore?: boolean; solidAfter?: boolean}) {
  const done = f >= at + 3, pop = f >= at && f < at + 12 ? 1 + 0.06 * Math.sin((f - at) / 12 * Math.PI) : 1;
  const solid = done ? solidAfter : solidBefore;
  return <div style={{width: '100%', height: 108, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})`,
    background: solid ? C.lime : 'transparent', border: solid ? 'none' : `3px solid ${C.lime}`}}>
    {done && <Check color={solid ? C.forest : C.lime}/>}<Label color={solid ? C.forest : C.lime} size={38}>{done ? after : before}</Label></div>;
}
function Bubble({f, at, who, color, text, me}: {f: number; at: number; who?: string; color?: string; text: string; me?: boolean}) {
  if (f < at) return null;
  const p = spring({frame: f - at, fps: 30, config: {damping: 14, stiffness: 170}});
  return <div style={{display: 'flex', gap: 16, alignItems: 'flex-end', justifyContent: me ? 'flex-end' : 'flex-start', transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + p * 0.1})`, opacity: Math.min(1, p * 2), transformOrigin: me ? '100% 100%' : '0% 100%'}}>
    {!me && <div style={{width: 64, height: 64, borderRadius: 32, background: color, display: 'grid', placeItems: 'center', flex: '0 0 64px'}}><Label color={C.forest} size={28}>{who}</Label></div>}
    <div style={{maxWidth: 640, background: me ? C.lime : '#16332a', borderRadius: 30, padding: '20px 28px', fontFamily: U, fontWeight: 700, fontSize: 40, lineHeight: 1.2, color: me ? C.forest : C.cream}}>{text}</div>
  </div>;
}

export function FindTeam01V3({cues = CUES_V3, clubs = [], map}: {cues?: CueV3; clubs?: Club[]; map?: MapData}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps);
  const t = {pan: s(cues.pan), tap: s(cues.tap), follow: s(cues.follow), tryout: s(cues.tryout), notify: s(cues.notify), chat: s(cues.chat), end: s(cues.end)};
  if (!map) return <AbsoluteFill style={{background: C.forest}}/>;

  // Map and pins (as v2).
  const P = (lat: number, lng: number) => ({x: (lng - map.box.minLng) / (map.box.maxLng - map.box.minLng) * map.W, y: (map.box.maxLat - lat) / (map.box.maxLat - map.box.minLat) * map.H});
  const miami = P(25.77, -80.19), hollywood = P(26.01, -80.15), push = ease(f, t.pan, t.tap + 10, Easing.inOut(Easing.cubic));
  const scale = 1.4 + push * 0.25, fx = miami.x + (hollywood.x - miami.x) * push, fy = miami.y + (hollywood.y - miami.y) * push;
  const sx = 700 - fx * scale, sy = 1180 - 120 * push - fy * scale, screen = (x: number, y: number) => ({x: sx + x * scale, y: sy + y * scale});
  const order = [...FIRST.map(x => clubs.find(c => c.slug === x)).filter(Boolean) as Club[], ...clubs.filter(c => !FIRST.includes(c.slug) && c.slug !== TAP), ...clubs.filter(c => c.slug === TAP)];
  const landAt = (i: number) => i < 2 ? 2 + i * 4 : i === 2 ? 34 : t.pan + (i - 3) * 2.6;
  const seen: Record<string, number> = {}, pin = 100;
  const pins = order.map(c => { const k = (seen[c.city] = (seen[c.city] ?? -1) + 1), a = k * 2.4 + 0.6, r = k ? 40 * Math.sqrt(k) : 0, p = P(c.lat, c.lng); return {c, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r}; });
  const tapPin = pins.find(p => p.c.slug === TAP)!, tapAt = screen(tapPin.x, tapPin.y);

  const cardTop = 640, cardIn = spring({frame: f - t.tap - 6, fps, config: {damping: 18, stiffness: 120}});
  const dim = ease(f, t.tap + 2, t.tap + 16), grow = ease(f, t.tap + 4, t.tap + 20, Easing.inOut(Easing.cubic));
  const crestTarget = {x: 64 + 56 + 84, y: cardTop + 56 + 84};
  // Notification drops in, gets tapped, and opens the team chat.
  const note = spring({frame: f - t.notify, fps, config: {damping: 15, stiffness: 140}}), noteGone = ease(f, t.chat, t.chat + 10, inC);
  const chatIn = spring({frame: f - t.chat - 4, fps, config: {damping: 18, stiffness: 120}});
  const cardAway = ease(f, t.chat - 2, t.chat + 12, inC), cardDim = ease(f, t.notify, t.notify + 10);
  const wipe = ease(f, t.end - 2, t.end + 16, Easing.inOut(Easing.cubic));
  const btnY = cardTop + 56 + 168 + 28 + 116 + 12 + 50 + 40 + 54; // first button's centre; the second is 126 px lower

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>
    <div style={{position: 'absolute', inset: 0, opacity: 1 - dim * 0.7, filter: dim > 0.02 ? `blur(${dim * 7}px)` : undefined}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${sx} ${sy}) scale(${scale})`} style={{opacity: ease(f, 0, 8)}}>
          <path d={map.dade} fill={C.land} stroke="#d7ef8640" strokeWidth={2 / scale} strokeLinejoin="round"/>
          <path d={map.broward} fill={C.land} stroke="#d7ef8640" strokeWidth={2 / scale} strokeLinejoin="round"/>
        </g>
      </svg>
      {pins.map(({c, x, y}, i) => {
        const a = landAt(i); if (f < a) return null;
        const p = spring({frame: f - a, fps, config: {damping: 12, stiffness: 170}}), q = screen(x, y), isTap = c.slug === TAP && f >= t.tap - 14;
        return <div key={c.slug} style={{position: 'absolute', left: q.x - pin / 2, top: q.y - pin / 2, transform: `translateY(${(1 - p) * -30}px) scale(${p * (isTap ? 1.12 : 1)})`, opacity: c.slug === TAP && f >= t.tap + 4 ? 0 : 1}}>
          <Badge slug={c.slug} size={pin} ring={isTap}/></div>;
      })}
    </div>
    <Ripple f={f} at={t.tap} x={tapAt.x} y={tapAt.y}/>

    {/* Club card with Follow and Sign up for tryout */}
    {f >= t.tap + 4 && f < t.chat + 14 && <div style={{position: 'absolute', left: 64, top: cardTop, width: 952, transform: `translateY(${(1 - cardIn) * 260 + cardAway * 300}px) scale(${1 - cardDim * 0.04})`, opacity: Math.min(1, cardIn * 2) * (1 - cardAway),
      background: C.card, borderRadius: 52, padding: 56, boxShadow: '0 40px 100px rgba(0,0,0,0.5)', border: '2px solid #ffffff12', filter: cardDim > 0.02 ? `brightness(${1 - cardDim * 0.35})` : undefined}}>
      <div style={{width: 168, height: 168}}/>
      <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 116, lineHeight: 1, color: C.cream, textTransform: 'uppercase', marginTop: 28}}>River Miami FC</div>
      <div style={{marginTop: 12}}><Label size={42}>UPSL Division 1 · Hollywood</Label></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 40}}>
        <FlipBtn f={f} at={t.follow} before="Follow" after="Following" solidBefore solidAfter={false}/>
        <FlipBtn f={f} at={t.tryout} before="Sign up for tryout" after="Request sent" solidBefore={false} solidAfter/>
      </div>
    </div>}
    {f >= t.tap + 4 && f < t.chat + 14 && (() => { const x = tapAt.x + (crestTarget.x - tapAt.x) * grow, y = tapAt.y + (crestTarget.y - tapAt.y) * grow + (1 - cardIn) * 260 * grow + cardAway * 300, sz = pin * 1.12 + (168 - pin * 1.12) * grow;
      return <div style={{position: 'absolute', left: x - sz / 2, top: y - sz / 2, opacity: 1 - cardAway, filter: cardDim > 0.02 ? `brightness(${1 - cardDim * 0.35})` : undefined}}><Badge slug={TAP} size={sz}/></div>; })()}
    <Ripple f={f} at={t.follow} x={540} y={btnY}/>
    <Ripple f={f} at={t.tryout} x={540} y={btnY + 126}/>

    {/* Coach's message */}
    {f >= t.notify && f < t.chat + 12 && <div style={{position: 'absolute', left: 48, right: 48, top: 90 + (1 - note) * -320, opacity: 1 - noteGone, transform: `scale(${1 - noteGone * 0.08})`,
      background: '#f5f3e9', borderRadius: 44, padding: '30px 34px', display: 'flex', gap: 26, alignItems: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.45)'}}>
      <Badge slug={TAP} size={104}/>
      <div style={{flex: 1}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><Label color={C.forest} size={36}>River Miami FC · Coach</Label><Label color="#5d7267" size={32}>now</Label></div>
        <div style={{fontFamily: U, fontWeight: 700, fontSize: 46, lineHeight: 1.15, color: C.forest, marginTop: 6}}>We want you on the team.</div>
      </div>
    </div>}
    <Ripple f={f} at={t.chat - 6} x={540} y={200}/>

    {/* Team chat */}
    {f >= t.chat && f < t.end + 18 && <div style={{position: 'absolute', left: 48, right: 48, top: 600, transform: `translateY(${(1 - chatIn) * 400}px)`, opacity: Math.min(1, chatIn * 2),
      background: C.card, borderRadius: 52, padding: '40px 40px 46px', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', border: '2px solid #ffffff12', display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 22, borderBottom: '2px solid #ffffff14'}}><Badge slug={TAP} size={80}/>
        <div><Label color={C.cream} size={40}>River Miami FC</Label><div><Label size={30}>Team chat</Label></div></div></div>
      <Bubble f={f} at={t.chat + 14} who="C" color={C.lime} text="Welcome to the team!"/>
      <Bubble f={f} at={t.chat + 30} who="MR" color={C.orange} text="Let's go!"/>
      <Bubble f={f} at={t.chat + 44} who="JT" color={C.cream} text="See you Sunday."/>
      <Bubble f={f} at={t.chat + 62} me text="Can't wait. Thanks, coach."/>
    </div>}

    <Lines f={f} from={0} to={t.pan + 4} lines={[['Find a team', C.cream], ['near you', C.lime]]}/>
    <Lines f={f} from={t.pan + 6} to={t.tap + 4} lines={[['Clubs', C.cream], ['near you', C.lime]]}/>
    <Lines f={f} from={t.tap + 8} to={t.tryout} lines={[['Follow', C.cream], ['your club', C.lime]]}/>
    <Lines f={f} from={t.tryout + 2} to={t.notify - 2} lines={[['Sign up for', C.cream], ['tryouts', C.lime]]}/>
    <Lines f={f} from={t.chat + 10} to={t.end} top={200} lines={[['Find', C.cream], ['your people', C.lime]]}/>
    {f < t.end && <Caption f={f} fps={fps} cues={cues} dark/>}

    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at 800px 1400px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={99999} top={820} size={140} lines={[['Find your team.', C.forest], ['Find your people.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1150, opacity: ease(f, t.end + 26, t.end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Join the waitlist · Link in bio</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Coming to the App Store</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
