"""Manifest-driven CPU preset narration audition; no provider key or publishing."""
import hashlib
import importlib.metadata
import json
import pathlib
import subprocess
import sys
import time

import numpy as np
import scipy.io.wavfile
import torch
from pocket_tts import TTSModel

root = pathlib.Path(__file__).resolve().parents[2]
story_path = root / (sys.argv[1] if len(sys.argv) > 1 else "content/instagram/single-story.json")
story = json.loads(story_path.read_text())
voice = story["voice"]["preset"]
if voice not in ("marius", "caro_davy"):
    raise ValueError("Only the reviewed CC0 preset sources are enabled")
if importlib.metadata.version("pocket-tts") != "4.0.1":
    raise RuntimeError("Use Pocket TTS 4.0.1")
out = root / "private-data/story-voice" / story["id"]
out.mkdir(parents=True, exist_ok=True)
torch.set_num_threads(2)
torch.manual_seed(20261023)
model = TTSModel.load_model(language="english_2026-10", temp=0.3)
state = model.get_state_for_audio_prompt(voice)
parts = []
for i, cue in enumerate(story["voice"]["cues"]):
    started = time.monotonic()
    torch.manual_seed(20261023 + i)
    audio = model.generate_audio(state, cue["text"]).detach().cpu().numpy().astype(np.float32)
    duration = len(audio) / model.sample_rate
    if not np.isfinite(audio).all() or not 0.6 < duration <= cue["end"] - cue["start"]:
        raise RuntimeError(f"Narration {i} exceeds its scene ({duration:.2f}s); edit timing before rendering")
    file = out / f"part-{i}.wav"
    scipy.io.wavfile.write(file, model.sample_rate, audio)
    part = {**cue, "file": str(file), "durationSeconds": duration,
            "sha256": hashlib.sha256(file.read_bytes()).hexdigest(),
            "generationSeconds": round(time.monotonic() - started, 2)}
    parts.append(part)
    print(json.dumps({"part": i, "seconds": duration}), flush=True)
proof = {"provider": "local-pocket-tts", "package": "4.0.1", "voice": voice,
         "scriptHash": hashlib.sha256(json.dumps(story["voice"], sort_keys=True).encode()).hexdigest(),
         "parts": parts, "modelLicense": "CC BY 4.0", "presetSourceLicense": "CC0",
         "cpuOnly": True, "paidApiCalls": 0, "cloningEnabled": bool(model.has_voice_cloning),
         "creativeStatus": "Synthetic preset audition only; transcript/codec checks do not approve its sound"}
(out / "narration-proof.json").write_text(json.dumps(proof, indent=2))
print("Story voice audition ready; nothing scheduled or published.")
