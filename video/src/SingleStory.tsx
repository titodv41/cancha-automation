import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const clamped = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(.16, 1, .3, 1);
const display: React.CSSProperties = {fontFamily: 'StoryDisplay,sans-serif', fontStyle: 'italic', fontWeight: 700, lineHeight: .92, letterSpacing: -1};
const title: React.CSSProperties = {...display, fontSize: 156, whiteSpace: 'pre-line'};
const copy: React.CSSProperties = {fontSize: 42, lineHeight: 1.25, fontWeight: 650, letterSpacing: -.7};
const src = (name: string) => staticFile('generated/single-story/' + name);

// Scene-local frames keep transforms deterministic and isolate each transition.
const Scene = ({children, seconds}: {children: React.ReactNode; seconds: number}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, .2 * fps, seconds * fps - 1], [0, 1, 1], clamped), '--copy-opacity': interpolate(f, [.2 * fps, .4 * fps], [0, 1], clamped)} as React.CSSProperties}>{children}</AbsoluteFill>;
};

function Opening({story}: any) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill>
    <Img src={src('debut.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '100% 50%', scale: interpolate(f, [0, 4.2 * fps], [1.07, 1], clamped)}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#041c34bb,transparent 35%,#051f2af5 88%)'}}/>
    <Img src={src('crest.png')} style={{position: 'absolute', left: 64, top: 450, width: 300, height: 300, borderRadius: '50%', boxShadow: '0 10px 40px #001b3477', scale: interpolate(f, [0, .4 * fps], [.8, 1], {...clamped, easing: ease})}}/>
    <div style={{position: 'absolute', left: 64, right: 140, top: 980, translate: `0 ${interpolate(f, [0, .35 * fps], [32, 0], {...clamped, easing: ease})}px`}}>
      <div data-copy style={{...copy, color: story.theme.accent, fontSize: 36, marginBottom: 25}}>Fort Lauderdale United</div>
      <div data-copy style={title}>A MEN’S{`\n`}PRO TEAM.</div>
      <div data-copy style={{...copy, marginTop: 28}}>Coming to Broward in spring 2027.</div>
    </div>
  </AbsoluteFill>;
}

function Season({story}: any) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: story.theme.navy}}>
    <Img src={src('crest.png')} style={{position: 'absolute', width: 1190, height: 1190, left: 90, top: 240, opacity: .1, rotate: `${interpolate(f, [0, 4.4 * fps], [-12, -2], clamped)}deg`}}/>
    <div style={{position: 'absolute', left: 64, right: 140, top: 440}}>
      <div data-copy style={{...copy, fontSize: 38, color: story.theme.accent}}>Men’s expansion · USL League One</div>
      <div data-copy style={{...display, fontSize: 96, marginTop: 100}}>SPRING</div>
      <div style={{display: 'flex', gap: 14, marginTop: 18}}>
        {story.year.split('').map((digit: string, i: number) => <div key={i} style={{width: 194, height: 330, overflow: 'hidden', borderRadius: 14, background: '#ffffff0e', borderBottom: '5px solid #a6e7da'}}>
          <div data-copy style={{...display, fontSize: 340, textAlign: 'center', translate: `0 ${interpolate(f, [i * .08 * fps, (.5 + i * .08) * fps], [330, 0], {...clamped, easing: ease})}px`}}>{digit}</div>
        </div>)}
      </div>
      <div style={{height: 5, background: '#ffffff30', marginTop: 100, position: 'relative'}}>
        <div style={{height: '100%', background: story.theme.accent, width: `${interpolate(f, [.5 * fps, 1.5 * fps], [0, 100], {...clamped, easing: ease})}%`}}/>
        <span style={{position: 'absolute', right: -5, top: -10, width: 25, height: 25, borderRadius: '50%', background: story.theme.accent}}/>
      </div>
      <div data-copy style={{...copy, marginTop: 30}}>First men’s season</div>
    </div>
  </AbsoluteFill>;
}

function Ground({story}: any) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: '#0a2d3f'}}>
    <Img src={src('stadium.png')} style={{width: '100%', height: 1570, objectFit: 'cover', objectPosition: '50% 65%', scale: interpolate(f, [0, 4.8 * fps], [1.06, 1], clamped)}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#062f7955,transparent 38%,#062832 76%)'}}/>
    <div style={{position: 'absolute', left: 64, right: 140, top: 1050}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 30}}>
        <svg width="55" height="70" viewBox="0 0 55 70" style={{translate: `0 ${interpolate(f, [0, .5 * fps], [-60, 0], {...clamped, easing: ease})}px`}}><path d="M27.5 65C20 53 4 39 4 26a23.5 23.5 0 0 1 47 0c0 13-16 27-23.5 39Z" fill={story.theme.accent}/><circle cx="27.5" cy="26" r="8" fill="#062f79"/></svg>
        <span data-copy style={{...copy, color: story.theme.accent, fontSize: 36}}>The home ground</span>
      </div>
      <div data-copy style={{...title, fontSize: 186}}>DAVIE.</div>
      <div style={{height: 5, background: story.theme.accent, width: interpolate(f, [.1 * fps, .75 * fps], [0, 840], {...clamped, easing: ease}), margin: '36px 0'}}/>
      <div data-copy style={{...copy, fontSize: 47, fontWeight: 750}}>Amerant Bank Field</div>
      <div data-copy style={{...copy, marginTop: 12}}>Nova Southeastern campus</div>
    </div>
  </AbsoluteFill>;
}

function Manager({story}: any) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: '#062832'}}>
    <Img src={src('hassan.png')} style={{width: '100%', height: 1310, objectFit: 'cover', objectPosition: '60% 50%', maskImage: 'linear-gradient(180deg,#000 65%,transparent 100%)', scale: interpolate(f, [0, 4.2 * fps], [1.03, 1], clamped)}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#06283266,transparent 35%,#062832 84%)'}}/>
    <div style={{position: 'absolute', top: 1110, left: 64, right: 140}}>
      <div data-copy style={{...copy, fontSize: 36, marginBottom: 25, color: story.theme.accent}}>Building the men’s roster</div>
      <div data-copy style={title}>ALY{`\n`}HASSAN.</div>
      <div data-copy style={{...copy, display: 'inline-block', marginTop: 30, padding: '15px 22px', background: story.theme.accent, color: '#062f79', borderRadius: 12, translate: `${interpolate(f, [.1 * fps, .6 * fps], [-35, 0], {...clamped, easing: ease})}px 0`}}>General manager</div>
    </div>
  </AbsoluteFill>;
}

function Next({story}: any) {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return <AbsoluteFill>
    <OffthreadVideo src={src('club.mp4')} muted trimBefore={0} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 50%'}}/>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#06283299,transparent 30%,#062832f5 73%)'}}/>
    <div style={{position: 'absolute', top: 980, left: 64, right: 140}}>
      <div data-copy style={{...copy, color: story.theme.accent, fontSize: 36}}>Women’s team · Already playing</div>
      <div style={{overflow: 'hidden', marginTop: 30}}><div data-copy style={{...title, translate: `0 ${interpolate(f, [.1 * fps, .6 * fps], [300, 0], {...clamped, easing: ease})}px`}}>MEN:{`\n`}SPRING 2027.</div></div>
      <div data-copy style={{...copy, marginTop: 35}}>Who’s coming to the first{`\n`}men’s home game?</div>
      <div data-copy style={{...copy, fontSize: 34, marginTop: 25, color: story.theme.accent}}>ftlutd.com/mens</div>
    </div>
  </AbsoluteFill>;
}

export function SingleStory({brand, story, audio}: any) {
  const {fps} = useVideoConfig();
  const [fontHandle] = useState(() => delayRender('Story brand fonts'));
  useEffect(() => {Promise.all([document.fonts.load('italic 700 156px StoryDisplay'), document.fonts.load('650 42px StoryUI'), document.fonts.load('750 42px StoryUI')]).then(() => continueRender(fontHandle));}, [fontHandle]);
  return <AbsoluteFill style={{background: brand.forest, color: brand.cream, fontFamily: 'StoryUI,sans-serif', fontWeight: 650, letterSpacing: -.5}}>
    <style>{`@font-face{font-family:StoryDisplay;src:url('${src('display.woff2')}');font-weight:700;font-style:italic}@font-face{font-family:StoryUI;src:url('${src('ui.woff2')}');font-weight:200 800}[data-copy]{opacity:var(--copy-opacity,1)}`}</style>
    <Sequence from={0} durationInFrames={Math.round(4.2 * fps)}><Opening story={story}/></Sequence>
    <Sequence from={4 * fps} durationInFrames={Math.round(4.4 * fps)}><Scene seconds={4.4}><Season story={story}/></Scene></Sequence>
    <Sequence from={Math.round(8.2 * fps)} durationInFrames={Math.round(4.8 * fps)}><Scene seconds={4.8}><Ground story={story}/></Scene></Sequence>
    <Sequence from={Math.round(12.8 * fps)} durationInFrames={Math.round(4.2 * fps)}><Scene seconds={4.2}><Manager story={story}/></Scene></Sequence>
    <Sequence from={Math.round(16.8 * fps)} durationInFrames={Math.round(7.2 * fps)}><Scene seconds={7.2}><Next story={story}/></Scene></Sequence>
    <Audio src={staticFile(audio)}/>
    <header style={{position: 'absolute', left: 64, right: 140, top: 125, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textShadow: '0 2px 10px #0008'}}>
      <div style={{width: 210, height: 68, overflow: 'hidden'}}><Img src={src('cancha.png')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0) invert(1)'}}/></div>
      <span data-copy style={{fontSize: 34, fontWeight: 750}}>The local game</span>
    </header>
    <div data-copy style={{position: 'absolute', left: 64, bottom: 220, fontSize: 34, fontWeight: 750}}>{brand.handle}</div>
  </AbsoluteFill>;
}
