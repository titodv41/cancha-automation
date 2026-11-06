// Promo 2 "Nuevo en Miami" (owner, Nov 5): the broader Cancha story, find your team and your people.
// Same identity and motion system as "Falta uno" v2.2 (beat grid, expo eases, whips, blur on fast moves).
// Story: new in town, no team -> 3-tap quiz -> real South Florida club crests near you -> a feed of real people
// -> ENCONTRÁ TU EQUIPO -> waitlist. No concept label on screen (owner, Nov 6).
// Photos come from props (spec.props.photos, files under public/generated/promo/photos), crests from props too.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Grain, MovingGrid} from './PromoFaltaUno';
import {B, back, ease, Whip, Roll} from './PromoFaltaUnoV22';

const C = {forest: '#103f32', deep: '#0b2e24', night: '#07130f', cream: '#f5f3e9', lime: '#d7ef86', orange: '#f55b32', mint: '#b9c8bf'};
const D = 'CanchaDisplay, sans-serif', U = 'CanchaUI, sans-serif';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const TN = {hook: 0, quiz: 5 * B, clubs: 13 * B, feed: 19 * B, team: 29 * B, end: 33 * B, total: 40 * B};
const T = TN;
type Props = {photos: string[]; crests: string[]; posts: {who: string; area: string; text: string}[]};

const Photo = ({src, pos = 'center', dim = 0, style}: {src: string; pos?: string; dim?: number; style?: React.CSSProperties}) =>
  <AbsoluteFill style={style}><Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: pos}}/>
    {dim > 0 && <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(7,19,15,${dim * 0.5}), rgba(7,19,15,${dim}))`}}/>}</AbsoluteFill>;
const Concept = () => <div style={{position: 'absolute', top: 64, left: 60, background: '#ffffff1f', color: C.cream, fontFamily: U, fontSize: 28, letterSpacing: 2,
  textTransform: 'uppercase', padding: '10px 22px', borderRadius: 6, border: '1px solid #ffffff40'}}>Concepto de la app</div>;

// 1 · Hook: a real photo, oversized words slam in on the beat.
function Hook({f, photo}: {f: number; photo: string}) {
  const word = (txt: string, at: number, top: number, color: string, size: number) => {
    const p = ease(f, at, at + 6, Easing.out(Easing.cubic));
    return <div style={{position: 'absolute', left: -20, right: -20, top, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: size, lineHeight: 0.8, color,
      transform: `scale(${2.4 - p * 1.4}) rotate(-4deg)`, opacity: Math.min(1, p * 3), filter: p < 1 ? `blur(${(1 - p) * 18}px)` : undefined,
      letterSpacing: -6, whiteSpace: 'nowrap', textTransform: 'uppercase', WebkitTextStroke: color === 'transparent' ? `5px ${C.lime}` : undefined, textShadow: color === 'transparent' ? undefined : '0 12px 50px #000a'}}>{txt}</div>;
  };
  return <AbsoluteFill style={{background: C.night}}>
    <Photo src={photo} dim={0.75} style={{transform: `scale(${1.12 - f * 0.0015})`}}/>
    {word('Nuevo', 0, 470, C.cream, 380)}
    {word('en Miami.', 8, 760, C.lime, 330)}
    {word('Sin equipo', 23, 1180, 'transparent', 230)}
  </AbsoluteFill>;
}

// 2 · The 3-tap quiz from the app, full screen; each answer is tapped on a beat.
const QUIZ = [
  {q: '¿Qué buscás?', a: ['Jugar', 'Un equipo', 'Gente'], pick: 1},
  {q: 'Tu nivel', a: ['Casual', 'Intermedio', 'Avanzado'], pick: 1},
  {q: '¿Dónde?', a: ['Doral', 'Kendall', 'Fort Lauderdale'], pick: 0},
];
function Quiz({f}: {f: number}) {
  const local = f - T.quiz, step = Math.min(2, Math.floor(local / (2.5 * B))), sLocal = local - step * 2.5 * B, q = QUIZ[step];
  const tapAt = Math.round(1.5 * B), picked = sLocal >= tapAt;
  return <AbsoluteFill style={{background: C.forest}}>
    <MovingGrid f={f} opacity={0.07}/>
    <div style={{position: 'absolute', left: 60, right: 60, top: 170, display: 'flex', gap: 12}}>
      {QUIZ.map((_, i) => <div key={i} style={{flex: 1, height: 16, borderRadius: 8, background: '#ffffff26', overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${(i < step ? 1 : i === step ? ease(sLocal, tapAt, tapAt + 8) : 0) * 100}%`, background: C.lime}}/></div>)}
    </div>
    <div key={step} style={{position: 'absolute', left: 60, right: 60, top: 330, fontFamily: D, fontStyle: 'italic', fontSize: 170, lineHeight: 0.9, color: C.cream, textTransform: 'uppercase',
      transform: `translateX(${(1 - ease(sLocal, 0, 8)) * 300}px)`, opacity: ease(sLocal, 0, 6), filter: sLocal < 6 ? `blur(${(1 - sLocal / 6) * 10}px)` : undefined}}>{q.q}</div>
    <div style={{position: 'absolute', left: 60, right: 60, top: 780, display: 'flex', flexDirection: 'column', gap: 34}}>
      {q.a.map((a, i) => {
        const on = ease(sLocal, 4 + i * 3, 12 + i * 3, back), sel = picked && i === q.pick;
        const press = i === q.pick ? interpolate(sLocal, [tapAt - 3, tapAt, tapAt + 6], [1, 0.94, 1], cl) : 1;
        return <div key={a} style={{height: 210, borderRadius: 105, display: 'flex', alignItems: 'center', padding: '0 70px', fontFamily: D, fontStyle: 'italic', fontSize: 104,
          textTransform: 'uppercase', background: sel ? C.lime : '#ffffff14', color: sel ? C.forest : C.cream, border: `4px solid ${sel ? C.lime : '#ffffff40'}`,
          transform: `translateY(${(1 - on) * 120}px) scale(${press})`, opacity: Math.min(1, on), justifyContent: 'space-between'}}>
          <span>{a}</span>{sel && <span style={{fontSize: 90}}>✓</span>}</div>;
      })}
    </div>
    {sLocal > tapAt - 8 && sLocal < tapAt + 6 && <div style={{position: 'absolute', left: 640, top: 780 + q.pick * 244 + 45, width: 120, height: 120, borderRadius: 60, background: '#ffffff40', border: '5px solid #fff'}}/>}
  </AbsoluteFill>;
}

// 3 · Real South Florida club crests near you; one in your area lights up.
function Clubs({f, crests}: {f: number; crests: string[]}) {
  const local = f - T.clubs, cam = interpolate(local, [0, 6 * B], [1.08, 1], {...cl, easing: Easing.out(Easing.quad)}), hi = 5;
  const title = ease(local, 0, 10);
  return <AbsoluteFill style={{background: C.night}}>
    <MovingGrid f={f} opacity={0.06}/>
    <div style={{position: 'absolute', left: 60, right: 60, top: 150, fontFamily: D, fontStyle: 'italic', fontSize: 150, lineHeight: 0.88, color: C.cream, textTransform: 'uppercase',
      transform: `translateY(${(1 - title) * 80}px)`, opacity: title}}>Clubes<br/><span style={{color: C.lime}}>cerca tuyo</span></div>
    <AbsoluteFill style={{transform: `scale(${cam})`}}>
      <div style={{position: 'absolute', left: 60, right: 60, top: 520, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28}}>
        {crests.slice(0, 16).map((c, i) => {
          const on = ease(local, 6 + i * 2, 14 + i * 2, back), lit = i === hi && local > 4 * B;
          return <div key={c} style={{aspectRatio: '1', borderRadius: 36, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${(0.4 + 0.6 * on) * (lit ? 1.08 : 1)})`, opacity: Math.min(1, on) * (local > 4 * B && !lit ? 0.45 : 1),
            boxShadow: lit ? `0 0 0 10px ${C.lime}, 0 0 60px ${C.lime}` : '0 10px 30px #0006'}}>
            <Img src={staticFile(c)} style={{width: '78%', height: '78%', objectFit: 'contain'}}/></div>;
        })}
      </div>
    </AbsoluteFill>
    {local > 4 * B && <div style={{position: 'absolute', left: 60, top: 1640, background: C.lime, color: C.forest, fontFamily: D, fontStyle: 'italic', fontSize: 80,
      padding: '14px 36px', borderRadius: 16, textTransform: 'uppercase', transform: `rotate(-3deg) scale(${ease(local, 4 * B, 4 * B + 8, back)})`}}>Cerca de Doral</div>}
  </AbsoluteFill>;
}

// 4 · A Strava-style feed with real photos; a kudos and a follow land on beats.
function Feed({f, photos, posts}: {f: number; photos: string[]; posts: Props['posts']}) {
  const local = f - T.feed, scroll = interpolate(local, [0, 10 * B], [0, 1180], {...cl, easing: Easing.inOut(Easing.cubic)});
  const kudosAt = 3 * B, followAt = 7 * B;
  return <AbsoluteFill style={{background: '#0d1210'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 200 - scroll}}>
      {posts.slice(0, 3).map((p, i) => {
        const kudos = i === 0 ? ease(local, kudosAt, kudosAt + 8) : 0, follow = i === 1 && local >= followAt;
        const press = (at: number) => interpolate(local, [at - 3, at, at + 6], [1, 0.9, 1], cl);
        return <div key={i} style={{margin: '0 40px 40px', borderRadius: 44, background: '#16201b', overflow: 'hidden', border: '1px solid #ffffff14'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '30px 34px'}}>
            <div style={{width: 92, height: 92, borderRadius: 46, background: [C.lime, C.orange, C.mint][i], color: C.forest, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 46}}>{p.who}</div>
            <div style={{flex: 1, fontFamily: U}}><div style={{fontSize: 40, color: C.cream}}>{p.text}</div><div style={{fontSize: 32, color: C.mint}}>{p.area}</div></div>
            {i === 1 && <div style={{fontFamily: U, fontSize: 34, padding: '14px 26px', borderRadius: 30, background: follow ? C.lime : 'transparent', color: follow ? C.forest : C.cream,
              border: `3px solid ${C.lime}`, transform: `scale(${press(followAt)})`}}>{follow ? 'Siguiendo' : 'Seguir'}</div>}
          </div>
          <div style={{height: 760, position: 'relative'}}><Photo src={photos[i]}/></div>
          <div style={{display: 'flex', gap: 40, padding: '26px 34px', fontFamily: U, fontSize: 40, color: C.cream, alignItems: 'center'}}>
            <span style={{display: 'flex', gap: 14, alignItems: 'center', color: kudos > 0.5 ? C.orange : C.cream, transform: `scale(${i === 0 ? press(kudosAt) : 1})`}}>
              <span style={{fontSize: 46}}>{kudos > 0.5 ? '♥' : '♡'}</span>{i === 0 ? <Roll a={11} b={12} p={kudos} h={48}/> : [8, 21, 5][i]}</span>
            <span>💬 {[3, 6, 2][i]}</span></div>
        </div>;
      })}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'linear-gradient(180deg, #0d1210 75%, #0d121000)'}}/>
  </AbsoluteFill>;
}

// 5 · The payoff: a real team, the line.
function Team({f, photo}: {f: number; photo: string}) {
  const local = f - T.team, p = ease(local, 2, 12);
  return <AbsoluteFill>
    <Photo src={photo} dim={0.55} style={{transform: `scale(${1.1 - local * 0.002})`}}/>
    <div style={{position: 'absolute', left: 50, right: 30, bottom: 300, fontFamily: D, fontStyle: 'italic', fontSize: 210, lineHeight: 0.82, color: C.cream, textTransform: 'uppercase',
      transform: `translateY(${(1 - p) * 160}px)`, opacity: p, filter: p < 0.9 ? `blur(${(1 - p) * 10}px)` : undefined}}>Encontrá<br/><span style={{color: C.lime}}>tu equipo.</span></div>
  </AbsoluteFill>;
}

// 6 · End: logo, one CTA, a strip of real club crests for trust.
function End({f, crests}: {f: number; crests: string[]}) {
  const local = f - T.end, a = ease(local, 0, 10, back), d = ease(local, 8, 18, back);
  return <AbsoluteFill style={{background: C.forest}}>
    <MovingGrid f={f} opacity={0.07}/>
    <Img src={staticFile('generated/promo/cancha-trim.png')} style={{position: 'absolute', left: 110, width: 860, top: 560, filter: 'brightness(0) invert(1)', opacity: Math.min(1, a), transform: `scale(${0.9 + a * 0.1})`}}/>
    <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: D, fontStyle: 'italic', fontSize: 92, color: C.lime, textTransform: 'uppercase', opacity: Math.min(1, a)}}>Tu equipo. Tu gente.</div>
    <div style={{position: 'absolute', left: 80, right: 80, top: 1060, height: 190, borderRadius: 95, background: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: D, fontStyle: 'italic', fontSize: 96, color: C.forest, textTransform: 'uppercase', transform: `rotate(-2deg) scale(${d})`}}>Sumate a la lista</div>
    <div style={{position: 'absolute', top: 1300, left: 0, right: 0, textAlign: 'center', fontFamily: U, fontSize: 46, color: C.cream, opacity: Math.min(1, d)}}>Link en bio · @wearecancha</div>
    <div style={{position: 'absolute', left: 0, top: 1520, display: 'flex', gap: 24, transform: `translateX(${-local * 4}px)`}}>
      {[...crests, ...crests].map((c, i) => <div key={i} style={{width: 150, height: 150, flex: 'none', borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9}}>
        <Img src={staticFile(c)} style={{width: '78%', height: '78%', objectFit: 'contain'}}/></div>)}
    </div>
  </AbsoluteFill>;
}

export const PromoNuevoEnMiami = ({photos, crests, posts}: Props) => {
  const f = useCurrentFrame();
  const [handle] = useState(() => delayRender('Load brand fonts'));
  useEffect(() => { Promise.all([document.fonts.load('italic 700 120px CanchaDisplay'), document.fonts.load('600 52px CanchaUI')]).then(() => continueRender(handle)); }, [handle]);
  return <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
    <style>{`@font-face{font-family:CanchaDisplay;src:url('${staticFile('generated/promo/display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:CanchaUI;src:url('${staticFile('generated/promo/ui.woff2')}');font-weight:600}`}</style>
    {f < T.quiz && <Whip f={f} from={0} to={T.quiz}><Hook f={f} photo={photos[0]}/></Whip>}
    {f >= T.quiz && f < T.clubs && <Whip f={f} from={T.quiz} to={T.clubs}><Quiz f={f}/></Whip>}
    {f >= T.clubs && f < T.feed && <Whip f={f} from={T.clubs} to={T.feed}><Clubs f={f} crests={crests}/></Whip>}
    {f >= T.feed && f < T.team && <Whip f={f} from={T.feed} to={T.team}><Feed f={f} photos={photos.slice(1)} posts={posts}/></Whip>}
    {f >= T.team && f < T.end && <Team f={f} photo={photos[4]}/>}
    {f >= T.end && <Whip f={f} from={T.end} to={T.total + 99}><End f={f} crests={crests}/></Whip>}
    <Grain/>
  </AbsoluteFill>;
};
