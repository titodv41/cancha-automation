// Teaching video 06 "New in Miami and no team? 3 ways in" (owner, Nov 21: teach the problem, show Cancha at the end
// as the fix; all earlier video feedback applies: brand type only, masked title reveals, taps on transitions, real county
// map, drawn phone UI, captions clear of the UI, real logo, no Expo link, no 18+ copy, Chris voice).
// Facts: rec leagues that place solo players on a team (South Florida Club Sport sign-ups, src/openings.ts, checked Nov 18);
// clubs announce tryouts / Talent IDs on Instagram (Miami United Open Talent ID, same file). Cancha: the "Find me a team"
// request (app 0008). Generic UI otherwise: no invented club news, dates or prices.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {Badge, C, Caption, D, Label, Lines, U, ease, type Club, type MapData} from './FindTeam01';

export type Cue06 = {ways: number; one: number; two: number; three: number; send: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_06: Cue06 = {ways: 2.8, one: 4.0, two: 8.0, three: 12.0, send: 15.4, end: 17.4, total: 21.0, captions: []};
const PW = 640, PH = 1300, PX = 540 - PW / 2, PY = 560, SW = PW - 36;

function Tap({f, at}: {f: number; at: number}) {
  if (f < at - 1 || f > at + 14) return null;
  const p = ease(f, at, at + 13, Easing.out(Easing.quad));
  return <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none', zIndex: 3}}>
    <div style={{position: 'absolute', left: -50, top: -50, width: 100, height: 100, borderRadius: 50, border: `5px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.1})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 22, background: '#ffffffd9', opacity: f < at + 6 ? 1 : Math.max(0, 1 - (f - at - 6) / 7)}}/>
  </div>;
}
const pop = (f: number, at: number) => f >= at && f < at + 10 ? 1 + 0.07 * Math.sin((f - at) / 10 * Math.PI) : 1;
function Chip({f, label, at, on}: {f: number; label: string; at?: number; on?: boolean}) {
  const lit = on || (at !== undefined && f >= at + 2);
  return <div style={{position: 'relative', padding: '12px 20px', borderRadius: 999, background: lit ? C.lime : 'transparent', border: `2px solid ${lit ? C.lime : '#ffffff33'}`, transform: `scale(${at !== undefined ? pop(f, at) : 1})`}}>
    <Label color={lit ? C.forest : C.cream} size={28}>{label}</Label>{at !== undefined && <Tap f={f} at={at}/>}</div>;
}
function Btn({f, at, label, done, ghost}: {f: number; at?: number; label: string; done?: string; ghost?: boolean}) {
  const isDone = at !== undefined && done && f >= at + 3;
  return <div style={{position: 'relative', height: 92, borderRadius: 24, background: ghost && !isDone ? 'transparent' : C.lime, border: `2px solid ${C.lime}`, display: 'grid', placeItems: 'center', transform: `scale(${at !== undefined ? pop(f, at) : 1})`}}>
    <Label color={ghost && !isDone ? C.lime : C.forest} size={32}>{isDone ? '✓ ' + done : label}</Label>{at !== undefined && <Tap f={f} at={at}/>}</div>;
}
const H = ({children, size = 58, color = C.cream}: {children: React.ReactNode; size?: number; color?: string}) =>
  <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: size, lineHeight: 1, color, textTransform: 'uppercase'}}>{children}</div>;

export function ThreeWays06({cues = CUES_06, clubs = [], map}: {cues?: Cue06; clubs?: Club[]; map?: MapData}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps);
  const t = {ways: s(cues.ways), one: s(cues.one), two: s(cues.two), three: s(cues.three), send: s(cues.send), end: s(cues.end)};
  if (!map) return <AbsoluteFill style={{background: C.forest}}/>;

  // Hook: the county map, clubs everywhere, and you dropped in Miami alone.
  const P = (lat: number, lng: number) => ({x: (lng - map.box.minLng) / (map.box.maxLng - map.box.minLng) * map.W, y: (map.box.maxLat - lat) / (map.box.maxLat - map.box.minLat) * map.H});
  const miami = P(25.77, -80.19), scale = 1.45 + ease(f, 0, t.ways, Easing.inOut(Easing.cubic)) * 0.25;
  const sx = 540 - miami.x * scale, sy = 1240 - miami.y * scale, screen = (x: number, y: number) => ({x: sx + x * scale, y: sy + y * scale});
  const seen: Record<string, number> = {};
  const pins = clubs.slice(0, 18).map((c, i) => { const k = (seen[c.city] = (seen[c.city] ?? -1) + 1), a = k * 2.4 + 0.6, r = k ? 40 * Math.sqrt(k) : 0, p = P(c.lat, c.lng); return {c, i, x: p.x + Math.cos(a) * r, y: p.y + Math.sin(a) * r}; });
  const you = screen(miami.x, miami.y), youIn = spring({frame: f - 10, fps, config: {damping: 11, stiffness: 160}});
  const mapOut = ease(f, t.ways - 4, t.one + 4, Easing.inOut(Easing.cubic));

  // Phone: rises at "one", screens slide on the taps that end each way.
  const phoneIn = spring({frame: f - t.one + 8, fps, config: {damping: 16, stiffness: 90}});
  const to2 = ease(f, t.two - 6, t.two + 10, Easing.inOut(Easing.cubic)), to3 = ease(f, t.three - 6, t.three + 10, Easing.inOut(Easing.cubic));
  const wipe = ease(f, t.end - 2, t.end + 16, Easing.inOut(Easing.cubic));
  const placed = spring({frame: f - t.one - 52, fps, config: {damping: 14, stiffness: 140}});
  const notif = spring({frame: f - t.two - 70, fps, config: {damping: 15, stiffness: 150}});
  const sent = spring({frame: f - t.send - 6, fps, config: {damping: 15, stiffness: 140}});
  const step = f < t.two ? 1 : f < t.three ? 2 : 3;

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>

    {/* Map hook */}
    {f < t.one + 6 && <div style={{position: 'absolute', inset: 0, opacity: 1 - mapOut, transform: `scale(${1 + mapOut * 0.15})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${sx} ${sy}) scale(${scale})`}>
          <path d={map.dade} fill={C.land} stroke="#d7ef8640" strokeWidth={2 / scale} strokeLinejoin="round"/>
          <path d={map.broward} fill={C.land} stroke="#d7ef8640" strokeWidth={2 / scale} strokeLinejoin="round"/>
        </g>
      </svg>
      {pins.map(({c, i, x, y}) => { const a = 2 + i * 2; if (f < a) return null; const p = spring({frame: f - a, fps, config: {damping: 12, stiffness: 170}}), q = screen(x, y); if (q.y < 470) return null;
        return <div key={c.slug} style={{position: 'absolute', left: q.x - 40, top: q.y - 40, transform: `scale(${p})`, opacity: 0.85}}><Badge slug={c.slug} size={80}/></div>; })}
      <div style={{position: 'absolute', left: you.x - 60, top: you.y - 150, transform: `translateY(${(1 - youIn) * -200}px)`, opacity: Math.min(1, youIn * 2)}}>
        <div style={{width: 120, height: 120, borderRadius: 60, background: C.lime, display: 'grid', placeItems: 'center', boxShadow: '0 0 0 14px #d7ef8633'}}><Label color={C.forest} size={34}>You</Label></div>
        <div style={{width: 0, height: 0, margin: '0 auto', borderLeft: '18px solid transparent', borderRight: '18px solid transparent', borderTop: `26px solid ${C.lime}`}}/>
      </div>
    </div>}

    {/* Phone */}
    {f >= t.one - 8 && <div style={{position: 'absolute', inset: 0, transform: 'scale(1.12)', transformOrigin: '540px 560px'}}><div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, borderRadius: 96, background: '#050a08', boxShadow: '0 60px 140px rgba(0,0,0,0.55), inset 0 0 0 3px #2a3a33', transform: `translateY(${(1 - phoneIn) * 1100}px) rotate(${(1 - phoneIn) * 6}deg)`}}>
      <div style={{position: 'absolute', inset: 18, borderRadius: 80, overflow: 'hidden', background: C.forest}}>
        <div style={{position: 'absolute', top: 22, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 24, background: '#000', zIndex: 5}}/>
        {/* 1 · Rec league: sign up solo, get placed on a team */}
        <div style={{position: 'absolute', inset: 0, padding: '100px 36px 36px', display: 'flex', flexDirection: 'column', gap: 22, transform: `translateX(${-to2 * SW}px)`}}>
          <Label size={26}>Rec league · Sign up</Label>
          <H>Join a league</H>
          <Label size={26}>I'm signing up as</Label>
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}><Chip f={f} label="A full team"/><Chip f={f} label="Solo player" at={t.one + 24}/></div>
          <div style={{marginTop: 8}}><Btn f={f} at={t.one + 44} label="Sign up" done="Signed up"/></div>
          <div style={{marginTop: 'auto', background: '#0f2a22', borderRadius: 28, padding: 24, transform: `translateY(${(1 - placed) * 380}px)`, border: `2px solid ${C.lime}`}}>
            <Label size={26} color={C.lime}>✓ Placed on a team</Label>
            <div style={{display: 'flex', gap: 10, marginTop: 16}}>{[C.lime, C.orange, C.cream, '#2a6b55', C.lime, C.orange, C.cream].map((c, k) =>
              <div key={k} style={{width: 58, height: 58, borderRadius: 29, background: c, transform: `scale(${spring({frame: f - t.one - 60 - k * 3, fps, config: {damping: 12, stiffness: 180}})})`, border: k === 3 ? `3px solid ${C.lime}` : 'none'}}/>)}</div>
          </div>
        </div>
        {/* 2 · Clubs post tryouts on Instagram */}
        <div style={{position: 'absolute', inset: 0, padding: '100px 36px 36px', display: 'flex', flexDirection: 'column', gap: 20, transform: `translateX(${(1 - to2) * SW - to3 * SW}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}><Badge slug="miami-united-fc" size={84}/><div><Label size={30} color={C.cream}>Miami United FC</Label><div><Label size={24}>UPSL · Hialeah</Label></div></div></div>
          <div style={{background: '#0f2a22', borderRadius: 28, padding: 26, display: 'flex', flexDirection: 'column', gap: 12}}>
            <span style={{alignSelf: 'flex-start', background: C.orange, borderRadius: 999, padding: '6px 16px'}}><Label color={C.cream} size={24}>New post</Label></span>
            <H size={64}>Open Talent ID</H><Label size={26}>Details on their post</Label>
          </div>
          <Btn f={f} at={t.two + 40} label="Follow" done="Following" ghost/>
          <div style={{marginTop: 'auto', background: C.cream, borderRadius: 26, padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', transform: `translateY(${(1 - notif) * 300}px)`, opacity: Math.min(1, notif * 2)}}>
            <Badge slug="miami-united-fc" size={56}/><div style={{flex: 1}}><Label color={C.forest} size={24}>Miami United FC</Label><div style={{fontFamily: U, fontWeight: 700, fontSize: 26, color: C.forest}}>posted a new tryout</div></div>
          </div>
        </div>
        {/* 3 · Tell Cancha what you play */}
        <div style={{position: 'absolute', inset: 0, padding: '100px 36px 36px', display: 'flex', flexDirection: 'column', gap: 18, transform: `translateX(${(1 - to3) * SW}px)`}}>
          <Img src={staticFile('generated/promo/cancha-trim.png')} style={{width: 200, filter: 'brightness(0) invert(0.96)'}}/>
          <H>Find me a team</H>
          <Label size={24}>Position</Label>
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}><Chip f={f} label="Keeper" at={t.three + 20}/><Chip f={f} label="Defender"/><Chip f={f} label="Forward"/></div>
          <Label size={24}>Level</Label>
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}><Chip f={f} label="Casual"/><Chip f={f} label="Competitive" at={t.three + 40}/></div>
          <Label size={24}>Area</Label>
          <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}><Chip f={f} label="Miami"/><Chip f={f} label="Doral" at={t.three + 60}/><Chip f={f} label="Kendall"/></div>
          <div style={{marginTop: 'auto'}}><Btn f={f} at={t.send} label="Find me a team" done="Sent"/></div>
          {f >= t.send + 4 && <div style={{position: 'absolute', left: 24, right: 24, bottom: 150, background: C.lime, borderRadius: 28, padding: 26, transform: `translateY(${(1 - sent) * 400}px)`}}>
            <H size={54} color={C.forest}>We're on it.</H><div style={{marginTop: 8}}><Label color={C.forest} size={26}>Clubs that fit you, by email</Label></div></div>}
        </div>
      </div>
    </div></div>}

    {/* Step counter */}
    {f >= t.one && f < t.end && <div style={{position: 'absolute', left: 70, top: 470, display: 'flex', gap: 12, opacity: ease(f, t.one, t.one + 8)}}>
      {[1, 2, 3].map(k => <div key={k} style={{width: k === step ? 76 : 24, height: 24, borderRadius: 12, background: k <= step ? C.lime : '#ffffff30'}}/>)}</div>}

    <Lines f={f} from={4} to={t.ways - 2} top={170} size={136} lines={[['New in Miami.', C.cream], ['No team.', C.lime]]}/>
    <Lines f={f} from={t.ways} to={t.one} top={170} size={160} lines={[['3 ways', C.cream], ['in.', C.lime]]}/>
    <Lines f={f} from={t.one + 2} to={t.two - 2} top={170} size={120} lines={[['1 · Rec leagues', C.cream], ['Sign up solo.', C.lime]]}/>
    <Lines f={f} from={t.two + 2} to={t.three - 2} top={170} size={120} lines={[['2 · Club tryouts', C.cream], ['Follow the clubs.', C.lime]]}/>
    <Lines f={f} from={t.three + 2} to={t.end} top={170} size={120} lines={[['3 · Tell Cancha', C.cream], ['We find you a club.', C.lime]]}/>
    {f < t.end && <Caption f={f} fps={fps} cues={cues} dark bottom={60}/>}

    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at 540px 1500px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={99999} top={820} size={150} lines={[['Find me', C.forest], ['a team.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1170, opacity: ease(f, t.end + 26, t.end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Link in bio · Free</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Miami-Dade + Broward</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
