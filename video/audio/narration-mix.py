"""Narration mix (Nov 19, after the owner heard the voice cut in and out on the first launch Reels: cuts placed
from ElevenLabs word timings landed mid-word and the music volume switched abruptly). Cuts come from the audio's real pauses (silencedetect), never from word timings.
segments.json: [{"src": [a, b], "speechAt": t, "text": caption}]  a/b = cut points inside pauses (source seconds);
speechAt = when the first spoken sound of the segment should be heard in the video.
Checks: every cut must sit inside a detected pause with >= 60 ms of silence on both sides.
usage: narration-mix.py check <voice.mp3> <segments.json>
       narration-mix.py mix <silent.mp4> <voice.mp3> <segments.json> <music.mp3> <out.mp4>
       narration-mix.py verify <silent.mp4> <voice.mp3> <segments.json>   (voice-only render; speech must match the plan)
Segments for the launch ads live in video/audio/narration/.
"""
import json, re, subprocess, sys

def silences(voice):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', voice, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True, timeout=120).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', err)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', err)]
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voice]).decode())
    if len(en) < len(st): en.append(dur)
    return list(zip(st, en)), dur

def plan(voice, segments):
    sil, dur = silences(voice)
    def inside(t):
        if t <= 0.0 or t >= dur - 0.001: return (t, t)
        for a, b in sil:
            if a + 0.06 <= t <= b - 0.06: return (a, b)
        raise SystemExit(f'cut at {t:.2f}s is not inside a pause; pauses: ' + ', '.join(f'{a:.2f}-{b:.2f}' for a, b in sil))
    out = []
    for s in segments:
        a, b = s['src']; pa, pb = inside(a), inside(min(b, dur))
        onset = pa[1] if a > 0 else next((y for x, y in sil if x <= 0.01), 0.0)  # first sound after the pause
        offset = pb[0] if b < dur - 0.001 else max([x for x, y in sil if y >= dur - 0.05] or [dur])
        place = s['speechAt'] - (onset - a)
        out.append({**s, 'a': a, 'b': min(b, dur), 'place': place, 'speech': (s['speechAt'], s['speechAt'] + (offset - onset))})
    for x, y in zip(out, out[1:]):
        if y['place'] < x['place'] + (x['b'] - x['a']) - 0.01: raise SystemExit(f"segments overlap near {y['speechAt']}s")
    return out

def check(voice, segfile):
    for c in plan(voice, json.load(open(segfile))):
        print(f"{c['text'][:44]:44s} src {c['a']:.2f}-{c['b']:.2f} placed {c['place']:.2f}  speech {c['speech'][0]:.2f}-{c['speech'][1]:.2f}")
    print(json.dumps([{'at': round(c['speech'][0], 2), 'to': round(c['speech'][1] + 0.4, 2), 'text': c['text']} for c in plan(voice, json.load(open(segfile))) if c['text']]))

def mix(silent, voice, segfile, music, out):
    segs = plan(voice, json.load(open(segfile)))
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', silent]).decode())
    parts, labels = [], []
    for i, x in enumerate(segs):
        d, ln = int(x['place'] * 1000), x['b'] - x['a']
        parts.append(f"[1:a]atrim={x['a']:.3f}:{x['b']:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.05,afade=t=out:st={max(0, ln - 0.05):.3f}:d=0.05,adelay={d}|{d}[v{i}]")
        labels.append(f'[v{i}]')
    g = ';'.join(parts) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={dur:.3f}[vo]"
    env = None
    for x in segs:
        a, b = x['speech'][0] - 0.2, x['speech'][1] + 0.2
        tm = f"clip(min((t-({a:.2f}-0.5))/0.5,(({b:.2f}+0.6)-t)/0.6),0,1)"
        env = tm if env is None else f'max({env},{tm})'
    g += f";[2:a]atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.4,afade=t=out:st={dur-1.6:.3f}:d=1.6,volume='0.42-0.27*{env}':eval=frame[mu]"
    g += ";[vo][mu]amix=inputs=2:normalize=0:duration=first,aresample=48000,aformat=channel_layouts=stereo[a]"
    tmp = out[:-4] + '.tmp.mov'
    subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', silent, '-i', voice, '-i', music, '-filter_complex', g, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'pcm_s16le', '-shortest', tmp])
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', tmp, '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], capture_output=True, text=True, timeout=120).stderr
    I = float(re.findall(r'I:\s+(-?[0-9.]+) LUFS', meas)[-1])
    gain = -14.5 - I
    subprocess.check_call(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.79:level=false', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', out])
    print('ok', out, f'{I:.1f} LUFS, gain {gain:+.1f} dB')

def verify(silent, voice, segfile):
    # Render the voice alone through the same cuts and confirm every spoken stretch lands where planned, once.
    segs = plan(voice, json.load(open(segfile)))
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', silent]).decode())
    parts, labels = [], []
    for i, x in enumerate(segs):
        d, ln = int(x['place'] * 1000), x['b'] - x['a']
        parts.append(f"[0:a]atrim={x['a']:.3f}:{x['b']:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.05,afade=t=out:st={max(0, ln - 0.05):.3f}:d=0.05,adelay={d}|{d}[v{i}]"); labels.append(f'[v{i}]')
    g = ';'.join(parts) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={dur:.3f},silencedetect=noise=-38dB:d=0.12"
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', voice, '-filter_complex', g, '-f', 'null', '-'], capture_output=True, text=True, timeout=120).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', err)]; en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', err)]
    speech, prev = [], 0.0
    for a, b in zip(st, en + [dur] * (len(st) - len(en))):
        if a - prev > 0.05: speech.append((prev, a))
        prev = b
    if dur - prev > 0.05: speech.append((prev, dur))
    bad = [s for s in speech if not any(x['speech'][0] - 0.12 <= s[0] and s[1] <= x['speech'][1] + 0.12 for x in segs)]
    print('speech', ' '.join(f'{a:.2f}-{b:.2f}' for a, b in speech))
    if bad: raise SystemExit('voice outside the planned stretches (cut fragment?): ' + ', '.join(f'{a:.2f}-{b:.2f}' for a, b in bad))
    print('verified')

if __name__ == '__main__':
    {'check': check, 'mix': mix, 'verify': verify}[sys.argv[1]](*sys.argv[2:])
