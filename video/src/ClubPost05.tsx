// Launch ad 05 "Clubs: post your opening" (Nov 21: supply is the biggest risk; owner, Nov 18: keep making simple UI ads
// with taps). A captain's phone: post an opening tap by tap (keeper, competitive, Sundays, Doral), requests from players
// slide in, tap Accept, the chat opens. Illustrated UI; no real club or person named ("Your team", initials only).
// Taps render inside the element they press, so they always land on it.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, Caption, D, Label, Lines, U, ease} from './FindTeam01';

export type Cue05 = {post: number; requests: number; accept: number; chat: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_05: Cue05 = {post: 4.9, requests: 5.6, accept: 7.4, chat: 8.8, end: 11.4, total: 15.0, captions: [{"at": 0.3, "to": 1.45, "text": "Running a team?"}, {"at": 1.45, "to": 2.8, "text": "Post the spot you need."}, {"at": 2.8, "to": 4.73, "text": "A keeper, Sundays, in Doral."}, {"at": 5.9, "to": 8.42, "text": "Players who fit ask to join. You pick who's in."}, {"at": 11.9, "to": 14.33, "text": "Cancha for Clubs is free. Join the waitlist."}]};
const PW = 640, PH = 1300, PX = 540 - PW / 2, PY = 470;

function Tap({f, at}: {f: number; at: number}) {
  if (f < at - 1 || f > at + 14) return null;
  const p = ease(f, at, at + 13, Easing.out(Easing.quad));
  return <div style={{position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, pointerEvents: 'none', zIndex: 3}}>
    <div style={{position: 'absolute', left: -50, top: -50, width: 100, height: 100, borderRadius: 50, border: `5px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.1})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 22, background: '#ffffffd9', opacity: f < at + 6 ? 1 : Math.max(0, 1 - (f - at - 6) / 7)}}/>
  </div>;
}
const pop = (f: number, at: number) => f >= at && f < at + 10 ? 1 + 0.07 * Math.sin((f - at) / 10 * Math.PI) : 1;
function Chips({f, label, items, pick, at}: {f: number; label: string; items: string[]; pick: number; at: number}) {
  return <div><Label size={26}>{label}</Label><div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10}}>
    {items.map((it, i) => { const on = i === pick && f >= at + 2;
      return <div key={it} style={{position: 'relative', padding: '12px 20px', borderRadius: 999, background: on ? C.lime : 'transparent', border: `2px solid ${on ? C.lime : '#ffffff33'}`, transform: `scale(${i === pick ? pop(f, at) : 1})`}}>
        <Label color={on ? C.forest : C.cream} size={28}>{it}</Label>{i === pick && <Tap f={f} at={at}/>}</div>; })}
  </div></div>;
}
function Btn({f, at, label, done, solid = true}: {f: number; at?: number; label: string; done?: string; solid?: boolean}) {
  const isDone = at !== undefined && done && f >= at + 3;
  return <div style={{position: 'relative', height: 92, borderRadius: 24, background: solid ? C.lime : 'transparent', border: solid ? 'none' : `2px solid ${C.lime}`, display: 'grid', placeItems: 'center', transform: `scale(${at !== undefined ? pop(f, at) : 1})`}}>
    <Label color={solid ? C.forest : C.lime} size={32}>{isDone ? '✓ ' + done : label}</Label>{at !== undefined && <Tap f={f} at={at}/>}</div>;
}
function Request({f, at, i, initials, color, line, accept}: {f: number; at: number; i: number; initials: string; color: string; line: string; accept?: number}) {
  const p = spring({frame: f - at - i * 7, fps: 30, config: {damping: 15, stiffness: 150}});
  const accepted = accept !== undefined && f >= accept + 3;
  return <div style={{background: '#0f2a22', borderRadius: 28, padding: 20, display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${(1 - p) * 320}px)`, opacity: Math.min(1, p * 2), border: accepted ? `2px solid ${C.lime}` : '2px solid transparent'}}>
    <div style={{width: 76, height: 76, borderRadius: 38, background: color, display: 'grid', placeItems: 'center', flex: '0 0 76px'}}><Label color={C.forest} size={28}>{initials}</Label></div>
    <div style={{flex: 1}}><Label color={C.cream} size={30}>Wants to join</Label><div><Label color={C.lime} size={26}>{line}</Label></div></div>
    <div style={{position: 'relative', padding: '14px 20px', borderRadius: 18, background: accepted ? C.lime : 'transparent', border: `2px solid ${C.lime}`, transform: `scale(${accept !== undefined ? pop(f, accept) : 1})`}}>
      <Label color={accepted ? C.forest : C.lime} size={26}>{accepted ? '✓ In' : 'Accept'}</Label>{accept !== undefined && <Tap f={f} at={accept}/>}</div>
  </div>;
}

export function ClubPost05({cues = CUES_05}: {cues?: Cue05}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps), t = {post: s(cues.post), requests: s(cues.requests), accept: s(cues.accept), chat: s(cues.chat), end: s(cues.end)};
  const chipAt = [t.post - 100, t.post - 76, t.post - 52, t.post - 28];
  const phoneIn = spring({frame: f, fps, config: {damping: 16, stiffness: 90}});
  const toReq = ease(f, t.requests - 6, t.requests + 10, Easing.inOut(Easing.cubic)), toChat = ease(f, t.chat - 6, t.chat + 10, Easing.inOut(Easing.cubic));
  const wipe = ease(f, t.end - 2, t.end + 16, Easing.inOut(Easing.cubic));
  const SW = PW - 36;
  const bubble = (at: number, text: string, me?: boolean, who?: string, color?: string) => {
    if (f < at) return null; const p = spring({frame: f - at, fps, config: {damping: 14, stiffness: 170}});
    return <div style={{display: 'flex', gap: 12, alignItems: 'flex-end', justifyContent: me ? 'flex-end' : 'flex-start', transform: `translateY(${(1 - p) * 24}px)`, opacity: Math.min(1, p * 2)}}>
      {!me && <div style={{width: 54, height: 54, borderRadius: 27, background: color, display: 'grid', placeItems: 'center'}}><Label color={C.forest} size={24}>{who}</Label></div>}
      <div style={{maxWidth: 420, background: me ? C.lime : '#16332a', borderRadius: 26, padding: '16px 22px', fontFamily: U, fontWeight: 700, fontSize: 32, lineHeight: 1.2, color: me ? C.forest : C.cream}}>{text}</div></div>;
  };

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>
    <div style={{position: 'absolute', inset: 0, transform: 'scale(1.14)', transformOrigin: '540px 470px'}}>
      <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, borderRadius: 96, background: '#050a08', boxShadow: '0 60px 140px rgba(0,0,0,0.55), inset 0 0 0 3px #2a3a33', transform: `translateY(${(1 - phoneIn) * 900}px) rotate(${(1 - phoneIn) * 8}deg)`}}>
        <div style={{position: 'absolute', inset: 18, borderRadius: 80, overflow: 'hidden', background: C.forest}}>
          <div style={{position: 'absolute', top: 22, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 24, background: '#000', zIndex: 5}}/>
          {/* Post an opening */}
          <div style={{position: 'absolute', inset: 0, padding: '100px 36px 36px', display: 'flex', flexDirection: 'column', gap: 22, transform: `translateX(${-toReq * SW}px)`}}>
            <Label size={26}>Your team</Label>
            <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 64, lineHeight: 1, color: C.cream, textTransform: 'uppercase'}}>Post an opening</div>
            <Chips f={f} label="We need" items={['Keeper', 'Defender', 'Midfielder', 'Forward']} pick={0} at={chipAt[0]}/>
            <Chips f={f} label="Level" items={['Casual', 'Intermediate', 'Competitive']} pick={2} at={chipAt[1]}/>
            <Chips f={f} label="When" items={['Saturdays', 'Sundays', 'Weeknights']} pick={1} at={chipAt[2]}/>
            <Chips f={f} label="Where" items={['Miami', 'Doral', 'Kendall', 'Hialeah']} pick={1} at={chipAt[3]}/>
            <div style={{marginTop: 'auto'}}><Btn f={f} at={t.post} label="Post opening" done="Posted"/></div>
          </div>
          {/* Requests */}
          <div style={{position: 'absolute', inset: 0, padding: '100px 36px 36px', display: 'flex', flexDirection: 'column', gap: 18, transform: `translateX(${(1 - toReq) * SW - toChat * SW}px)`}}>
            <div style={{background: C.lime, borderRadius: 26, padding: '18px 22px'}}><Label color={C.forest} size={26}>Your opening</Label>
              <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 50, lineHeight: 1, color: C.forest, textTransform: 'uppercase', marginTop: 4}}>Keeper · Sundays</div></div>
            <Label size={26}>Players who asked</Label>
            <Request f={f} at={t.requests + 6} i={0} initials="MR" color={C.lime} line="Keeper · Competitive" accept={t.accept}/>
            <Request f={f} at={t.requests + 6} i={1} initials="JT" color={C.orange} line="Keeper · Intermediate"/>
            <Request f={f} at={t.requests + 6} i={2} initials="AL" color={C.cream} line="Keeper · Competitive"/>
          </div>
          {/* Chat */}
          <div style={{position: 'absolute', inset: 0, padding: '100px 36px 36px', display: 'flex', flexDirection: 'column', gap: 18, transform: `translateX(${(1 - toChat) * SW}px)`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: '2px solid #ffffff14'}}><div style={{width: 64, height: 64, borderRadius: 32, background: C.lime, display: 'grid', placeItems: 'center'}}><Label color={C.forest} size={26}>MR</Label></div><Label color={C.cream} size={32}>Chat</Label></div>
            {bubble(t.chat + 10, 'Welcome! Sunday 8 AM, field 3.', true)}
            {bubble(t.chat + 28, "I'm in. See you there.", false, 'MR', C.lime)}
          </div>
        </div>
      </div>
    </div>
    <Lines f={f} from={4} to={t.post + 2} top={170} size={128} lines={[['Need a player?', C.cream], ['Post the spot.', C.lime]]}/>
    <Lines f={f} from={t.requests + 2} to={t.accept - 2} top={170} size={128} lines={[['They ask', C.cream], ['to join.', C.lime]]}/>
    <Lines f={f} from={t.accept + 2} to={t.end} top={170} size={128} lines={[["You pick", C.cream], ["who's in.", C.lime]]}/>
    {f < t.end && <Caption f={f} fps={fps} cues={cues} dark bottom={182}/>}
    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at 540px 1500px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={99999} top={820} size={140} lines={[['Cancha for Clubs.', C.forest], ['Free.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1150, opacity: ease(f, t.end + 26, t.end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Join the waitlist · Link in bio</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Coming to the App Store</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
