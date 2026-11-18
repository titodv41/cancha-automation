// Launch ad 02 "Your player card" (owner, Nov 18: use a phone to show how easy and cool it is to sign up and find teams
// wanting you; animate filling the profile: age, experience, etc.). A drawn phone running illustrated Cancha UI:
// create account (email types, 18+ switch flips), the player card form fills tap by tap (area, position, level, age,
// experience) with a progress bar, Save turns it into a finished player card that lifts out of the phone, then the
// clubs looking for players like you slide in. Same motion language and brand type as ad 01.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {A, Badge, C, Caption, D, Label, Lines, U, ease, inC} from './FindTeam01';

export type Cue02 = {form: number; save: number; clubs: number; end: number; total: number; captions: {at: number; to: number; text: string}[]};
export const CUES_02: Cue02 = {form: 3.0, save: 9.6, clubs: 11.4, end: 15.6, total: 19.5, captions: [
  {at: 0.3, to: 2.8, text: 'Your player card takes a minute.'},
  {at: 3.4, to: 8.9, text: 'Your area, your position, your level.'},
  {at: 9.4, to: 11.0, text: 'Save it,'},
  {at: 11.4, to: 15.2, text: 'and see the clubs looking for players like you.'},
]};
const PW = 640, PH = 1300, PX = 540 - PW / 2, PY = 470; // phone frame on the 1080x1920 canvas
const SW = PW - 36; // screen width

function Tap({f, at, x, y}: {f: number; at: number; x: number; y: number}) {
  if (f < at - 1 || f > at + 14) return null;
  const p = ease(f, at, at + 13, Easing.out(Easing.quad));
  return <><div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: 50, border: `5px solid ${C.lime}`, transform: `scale(${0.4 + p * 1.1})`, opacity: 1 - p}}/>
    <div style={{position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: '#ffffffd9', opacity: f < at + 6 ? 1 : Math.max(0, 1 - (f - at - 6) / 7)}}/></>;
}
function Typed({f, at, text, cps = 22}: {f: number; at: number; text: string; cps?: number}) {
  const n = Math.max(0, Math.min(text.length, Math.floor((f - at) / 30 * cps)));
  return <>{text.slice(0, n)}{f >= at && n < text.length && (f % 16 < 8) ? <span style={{color: C.lime}}>|</span> : null}</>;
}
const Field = ({label, children, active}: {label: string; children: React.ReactNode; active?: boolean}) =>
  <div><Label size={24}>{label}</Label><div style={{marginTop: 8, height: 76, borderRadius: 20, background: '#0f2a22', border: `2px solid ${active ? C.lime : '#ffffff1f'}`, display: 'flex', alignItems: 'center', padding: '0 22px', fontFamily: U, fontWeight: 700, fontSize: 30, color: C.cream}}>{children}</div></div>;
function Chips({f, label, items, pick, at}: {f: number; label: string; items: string[]; pick: number; at: number}) {
  return <div><Label size={24}>{label}</Label><div style={{display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10}}>
    {items.map((it, i) => { const on = i === pick && f >= at + 2, pop = i === pick && f >= at && f < at + 10 ? 1 + 0.08 * Math.sin((f - at) / 10 * Math.PI) : 1;
      return <div key={it} style={{padding: '12px 20px', borderRadius: 999, background: on ? C.lime : 'transparent', border: `2px solid ${on ? C.lime : '#ffffff33'}`, transform: `scale(${pop})`}}><Label color={on ? C.forest : C.cream} size={26}>{it}</Label></div>; })}
  </div></div>;
}

export function PlayerCard02({cues = CUES_02}: {cues?: Cue02}) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('700 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  const s = (x: number) => Math.round(x * fps), t = {form: s(cues.form), save: s(cues.save), clubs: s(cues.clubs), end: s(cues.end)};

  const phoneIn = spring({frame: f, fps, config: {damping: 16, stiffness: 90}});
  // Taps (frames) inside the form; positions are on the canvas.
  const tp = {create: t.form - 14, area: t.form + 40, pos: t.form + 64, lvl: t.form + 88, age: t.form + 112, exp: t.form + 140, save: t.save};
  const progress = [tp.area, tp.pos, tp.lvl, tp.age, tp.exp].filter(a => f >= a + 2).length / 5;
  const toForm = ease(f, t.form - 6, t.form + 10, Easing.inOut(Easing.cubic));
  const lift = spring({frame: f - t.save - 6, fps, config: {damping: 15, stiffness: 110}}), cardGone = ease(f, t.clubs - 4, t.clubs + 8, inC);
  const toClubs = ease(f, t.clubs - 6, t.clubs + 10, Easing.inOut(Easing.cubic));
  const wipe = ease(f, t.end - 2, t.end + 16, Easing.inOut(Easing.cubic));
  const ox = PX + 18, oy = PY + 18; // screen origin on canvas

  return <AbsoluteFill style={{background: C.forest, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:700}`}</style>

    <div style={{position: 'absolute', inset: 0, transform: 'scale(1.14)', transformOrigin: '540px 470px'}}>
    {/* Phone */}
    <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, borderRadius: 96, background: '#050a08', boxShadow: '0 60px 140px rgba(0,0,0,0.55), inset 0 0 0 3px #2a3a33',
      transform: `translateY(${(1 - phoneIn) * 900}px) rotate(${(1 - phoneIn) * 8}deg)`}}>
      <div style={{position: 'absolute', inset: 18, borderRadius: 80, overflow: 'hidden', background: C.forest}}>
        <div style={{position: 'absolute', top: 22, left: '50%', width: 150, height: 42, marginLeft: -75, borderRadius: 24, background: '#000', zIndex: 5}}/>
        {/* Screen 1: create account */}
        <div style={{position: 'absolute', inset: 0, padding: '110px 40px 40px', display: 'flex', flexDirection: 'column', gap: 24, transform: `translateX(${-toForm * SW}px)`}}>
          <Img src={staticFile('generated/promo/cancha-trim.png')} style={{width: 230, filter: 'brightness(0) invert(0.95)'}}/>
          <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 64, lineHeight: 1, color: C.cream, textTransform: 'uppercase', marginTop: 10}}>Create your account</div>
          <Field label="Email" active={f < 34}><Typed f={f} at={12} text="you@email.com"/></Field>
          <Field label="Password" active={f >= 34 && f < 56}>{'•'.repeat(Math.max(0, Math.min(10, Math.floor((f - 36) / 2))))}</Field>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 4}}>
            {(() => { const on = f >= 62; const k = ease(f, 60, 66); return <div style={{width: 84, height: 48, borderRadius: 24, background: on ? C.lime : '#ffffff26', position: 'relative'}}><div style={{position: 'absolute', top: 5, left: 5 + k * 36, width: 38, height: 38, borderRadius: 19, background: C.cream}}/></div>; })()}
            <Label color={C.cream} size={28}>I'm 18 or older</Label></div>
          <div style={{marginTop: 'auto', height: 92, borderRadius: 24, background: C.lime, display: 'grid', placeItems: 'center'}}><Label color={C.forest} size={32}>Create account</Label></div>
        </div>
        {/* Screen 2: player card form */}
        <div style={{position: 'absolute', inset: 0, padding: '96px 36px 36px', display: 'flex', flexDirection: 'column', gap: 20, transform: `translateX(${(1 - toForm) * SW - toClubs * SW}px)`}}>
          <div style={{height: 10, borderRadius: 5, background: '#ffffff1f'}}><div style={{height: 10, borderRadius: 5, width: `${progress * 100}%`, background: C.lime}}/></div>
          <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 60, lineHeight: 1, color: C.cream, textTransform: 'uppercase'}}>Your player card</div>
          <Field label="Name" active={f >= t.form && f < tp.area}><Typed f={f} at={t.form + 8} text="Mateo R."/></Field>
          <Chips f={f} label="Area" items={['Miami', 'Doral', 'Kendall', 'Hialeah']} pick={1} at={tp.area}/>
          <Chips f={f} label="Position" items={['Keeper', 'Defender', 'Midfielder', 'Forward']} pick={2} at={tp.pos}/>
          <Chips f={f} label="Level" items={['Casual', 'Intermediate', 'Competitive']} pick={2} at={tp.lvl}/>
          <Chips f={f} label="Age" items={['18-24', '25-34', '35+']} pick={1} at={tp.age}/>
          <Chips f={f} label="Experience" items={['New', '1-4 years', '5+ years']} pick={2} at={tp.exp}/>
          <div style={{marginTop: 'auto', height: 88, borderRadius: 24, background: C.lime, display: 'grid', placeItems: 'center'}}><Label color={C.forest} size={32}>Save</Label></div>
        </div>
        {/* Screen 3: clubs looking for you */}
        <div style={{position: 'absolute', inset: 0, padding: '110px 36px 36px', display: 'flex', flexDirection: 'column', gap: 18, transform: `translateX(${(1 - toClubs) * SW}px)`}}>
          <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 60, lineHeight: 1, color: C.cream, textTransform: 'uppercase'}}>Looking for <span style={{color: C.lime}}>you</span></div>
          {[['river-miami-fc', 'River Miami FC', 'Midfielder · Competitive'], ['miami-united-fc', 'Miami United FC', 'Open Talent ID'], ['fc-miami-city', 'FC Miami City', 'Midfielder · Tryouts'], ['cyclones-fc', 'Cyclones FC', 'Open spot · Sundays']].map(([slug, name, need], i) => {
            const p = spring({frame: f - t.clubs - 8 - i * 6, fps, config: {damping: 15, stiffness: 150}});
            return <div key={slug} style={{display: 'flex', alignItems: 'center', gap: 18, background: '#0f2a22', borderRadius: 26, padding: 18, transform: `translateX(${(1 - p) * 300}px)`, opacity: Math.min(1, p * 2)}}>
              <Badge slug={slug} size={78}/><div style={{flex: 1}}><Label color={C.cream} size={30}>{name}</Label><div><Label color={C.lime} size={26}>{need}</Label></div></div>
              <div style={{background: i === 0 && f >= t.clubs + 50 ? C.lime : 'transparent', border: `2px solid ${C.lime}`, borderRadius: 18, padding: '10px 16px'}}><Label color={i === 0 && f >= t.clubs + 50 ? C.forest : C.lime} size={24}>{i === 0 && f >= t.clubs + 50 ? 'Asked' : 'Ask'}</Label></div>
            </div>;
          })}
        </div>
      </div>
    </div>

    {/* Taps */}
    <Tap f={f} at={tp.create} x={540} y={oy + PH - 36 - 40 - 46}/>
    <Tap f={f} at={tp.area} x={ox + 36 + 180} y={oy + 96 + 10 + 20 + 60 + 20 + 104 + 20 + 34 + 34}/>
    <Tap f={f} at={tp.pos} x={ox + 36 + 380} y={oy + 96 + 10 + 20 + 60 + 20 + 104 + 20 + 120 + 20 + 34 + 34}/>
    <Tap f={f} at={tp.lvl} x={366} y={1270}/>
    <Tap f={f} at={tp.age} x={441} y={1388}/>
    <Tap f={f} at={tp.exp} x={616} y={1505}/>
    <Tap f={f} at={tp.save} x={540} y={oy + PH - 36 - 36 - 44}/>
    <Tap f={f} at={t.clubs + 46} x={ox + SW - 36 - 50} y={oy + 110 + 60 + 18 + 57}/>
    </div>

    {/* Finished player card lifts out of the phone */}
    {f >= t.save + 4 && f < t.clubs + 10 && <div style={{position: 'absolute', left: 140, top: 640, width: 800, borderRadius: 48, padding: 48, background: C.lime,
      transform: `translateY(${(1 - lift) * 300 - cardGone * 200}px) scale(${0.6 + lift * 0.4}) rotate(${-3 + lift * 1}deg)`, opacity: Math.min(1, lift * 2) * (1 - cardGone), boxShadow: '0 50px 120px rgba(0,0,0,0.55)'}}>
      <Label color={C.forest} size={30}>Player card</Label>
      <div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 120, lineHeight: 1, color: C.forest, textTransform: 'uppercase', margin: '10px 0 24px'}}>Mateo R.</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 30px'}}>
        {[['Position', 'Midfielder'], ['Level', 'Competitive'], ['Area', 'Doral'], ['Experience', '5+ years']].map(([k, v]) => <div key={k}>
          <Label color="#2c5a49" size={26}>{k}</Label><div style={{fontFamily: D, fontStyle: 'italic', fontWeight: 700, fontSize: 64, color: C.forest, textTransform: 'uppercase', lineHeight: 1.05}}>{v}</div></div>)}
      </div>
    </div>}

    <Lines f={f} from={4} to={t.form - 2} top={170} size={128} lines={[['Make your', C.cream], ['player card', C.lime]]}/>
    <Lines f={f} from={t.form + 2} to={t.save} top={170} size={128} lines={[['Area. Position.', C.cream], ['Level.', C.lime]]}/>
    <Lines f={f} from={t.save + 4} to={t.clubs - 2} top={170} size={128} lines={[['Save it.', C.cream], ['That\'s you.', C.lime]]}/>
    <Lines f={f} from={t.clubs + 2} to={t.end} top={170} size={128} lines={[['Clubs looking', C.cream], ['for you', C.lime]]}/>
    {f < t.end && <Caption f={f} fps={fps} cues={cues} dark bottom={130}/>}

    {f >= t.end - 2 && <AbsoluteFill style={{background: C.lime, clipPath: `circle(${wipe * 2300}px at 860px 760px)`}}>
      <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', width: 520, left: 70, top: 600, opacity: ease(f, t.end + 6, t.end + 14)}}/>
      <Lines f={f} from={t.end + 10} to={99999} top={820} size={140} lines={[['Find your team.', C.forest], ['Find your people.', C.orange]]}/>
      <div style={{position: 'absolute', left: 70, top: 1150, opacity: ease(f, t.end + 26, t.end + 34)}}>
        <div style={{display: 'inline-block', background: C.forest, borderRadius: 28, padding: '26px 40px'}}><Label color={C.lime} size={44}>Join the waitlist · Link in bio</Label></div>
        <div style={{marginTop: 22}}><Label color={C.forest} size={36}>Coming to the App Store</Label></div>
      </div>
    </AbsoluteFill>}
  </AbsoluteFill>;
}
