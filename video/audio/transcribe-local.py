"""CPU transcription/word timings for an audition or actual creator recording.

This creates editable caption drafts. It does not assess naturalness, invent
quotes, change source audio or publish anything.
"""
import argparse
import hashlib
import importlib.metadata
import json
import pathlib
import subprocess
import numpy as np

from faster_whisper import WhisperModel

ROOT=pathlib.Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument("inputs",nargs="+")
parser.add_argument("--out",default=str(ROOT/"private-data/captions"))
args=parser.parse_args()
out=pathlib.Path(args.out);out.mkdir(parents=True,exist_ok=True)
if importlib.metadata.version("faster-whisper")!="1.2.1":
    raise RuntimeError("Use the reviewed faster-whisper version 1.2.1")
model=WhisperModel("tiny.en",device="cpu",compute_type="int8",cpu_threads=2,download_root=str(ROOT/"private-data/caption-models"))
def stamp(t):
    ms=round(t*1000);return f"{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}"
for filename in args.inputs:
    path=pathlib.Path(filename).resolve()
    if not path.is_file(): raise RuntimeError("Input media file is missing")
    duration=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(path)]))
    if not 0<duration<=180: raise RuntimeError("Use a clip no longer than three minutes")
    # Decode through the project's FFmpeg. Recent PyAV releases removed the
    # metadata_errors argument used by faster-whisper's path decoder.
    pcm=subprocess.check_output(["ffmpeg","-hide_banner","-loglevel","error","-i",str(path),"-vn","-ar","16000","-ac","1","-f","f32le","pipe:1"])
    samples=np.frombuffer(pcm,dtype=np.float32)
    if not len(samples):raise RuntimeError("Input has no decodable audio")
    segments,info=model.transcribe(samples,language="en",beam_size=5,word_timestamps=True,vad_filter=True)
    words=[];text=[]
    for segment in segments:
        text.append(segment.text.strip())
        for word in segment.words or []:
            words.append({"text":word.word.strip(),"start":round(word.start,3),"end":round(word.end,3),"probability":round(word.probability,3)})
    if not words: raise RuntimeError("No spoken words recognized; inspect the actual recording")
    groups=[];current=[]
    for word in words:
        if current and (word["start"]-current[-1]["end"]>.45 or len(" ".join(w["text"] for w in current))+len(word["text"])>27):
            groups.append(current);current=[]
        current.append(word)
        if len(current)==4 or word["text"].endswith((".","!","?")):
            groups.append(current);current=[]
    if current:groups.append(current)
    report={"sourceSha256":hashlib.sha256(path.read_bytes()).hexdigest(),"model":"Systran/faster-whisper-tiny.en","package":"1.2.1","license":"MIT","cpuOnly":True,"durationSeconds":duration,"text":" ".join(text),"words":words,"groups":[{"start":g[0]["start"],"end":g[-1]["end"],"words":g} for g in groups],"needsEditorialReview":True,"note":"ASR may miss names and words. A transcript is not evidence of a human-sounding narrator."}
    (out/(path.stem+".json")).write_text(json.dumps(report,indent=2))
    (out/(path.stem+".srt")).write_text("\n\n".join(f"{i+1}\n{stamp(g[0]['start'])} --> {stamp(g[-1]['end'])}\n"+" ".join(w["text"] for w in g) for i,g in enumerate(groups))+"\n")
    print(json.dumps({"input":path.name,"words":len(words),"text":report["text"],"captionDraft":str(out/(path.stem+".json"))}),flush=True)
