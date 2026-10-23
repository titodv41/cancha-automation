"""Small, free CPU audition. Preset voices only; never a publishing command."""
import hashlib
import importlib.metadata
import json
import pathlib
import subprocess
import time

import numpy as np
import scipy.io.wavfile
import torch
from pocket_tts import TTSModel
from pocket_tts.utils.utils import _ORIGINS_OF_PREDEFINED_VOICES

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "private-data/free-voice-auditions"
OUT.mkdir(parents=True, exist_ok=True)
TEXT = ("Looking for women's soccer near you? Tampa Bay Sun play in Tampa. "
        "Sporting Jacks are in Jacksonville. And Fort Lauderdale United play in Davie, "
        "on the Nova Southeastern campus. All three are professional clubs. "
        "Check the next home date before you go.")
VOICES = ("marius", "caro_davy")
if importlib.metadata.version("pocket-tts") != "4.0.1":
    raise RuntimeError("Use the reviewed Pocket TTS version 4.0.1")
torch.set_num_threads(2)
torch.manual_seed(20261023)
started = time.monotonic()
# Upstream automatically uses its official public non-cloning weights when the
# optional gated cloning model is unavailable. No login, token or paid API.
model = TTSModel.load_model(language="english_2026-10", temp=0.3)
results = []
for voice in VOICES:
    torch.manual_seed(20261023)
    source = _ORIGINS_OF_PREDEFINED_VOICES[voice]
    state = model.get_state_for_audio_prompt(voice)
    start = time.monotonic()
    audio = model.generate_audio(state, TEXT)
    data = audio.detach().cpu().numpy().astype(np.float32)
    duration = len(data) / model.sample_rate
    if not np.isfinite(data).all() or not 10 < duration < 35:
        raise RuntimeError("Free voice failed sample validity/duration check")
    wav, mp3 = OUT / f"{voice}.wav", OUT / f"{voice}.mp3"
    scipy.io.wavfile.write(wav, model.sample_rate, data)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav),
                    "-af", "loudnorm=I=-16:TP=-2:LRA=8", "-ar", "48000", "-ac", "2",
                    "-c:a", "libmp3lame", "-b:a", "128k", "-metadata", "title=Cancha voice audition — " + voice,
                    "-metadata", "comment=Synthetic preset narrator. Kyutai Pocket TTS weights CC BY 4.0; preset source CC0. https://github.com/kyutai-labs/pocket-tts",
                    str(mp3)], check=True)
    results.append({"voice": voice, "file": str(mp3), "durationSeconds": duration,
                    "generationSeconds": round(time.monotonic()-start, 2), "voiceSource": source,
                    "voiceSourceLicense": "CC0", "sha256": hashlib.sha256(mp3.read_bytes()).hexdigest()})
    print(json.dumps({"voice": voice, "seconds": duration, "generated": True}), flush=True)
proof = {"provider": "local Pocket TTS", "package": "4.0.1", "torch": torch.__version__,
         "language": "english_2026-10", "cpuOnly": True, "paidApiCalls": 0,
         "cloningEnabled": bool(model.has_voice_cloning), "script": TEXT,
         "spokenSpelling": "Sporting Jacks is the spoken rendering of Sporting JAX",
         "modelLicense": "CC BY 4.0", "codeLicense": "MIT", "results": results,
         "elapsedSeconds": round(time.monotonic()-started, 2),
         "creativeStatus": "Auditions only; not a naturalness score or publishing approval"}
(OUT / "report.json").write_text(json.dumps(proof, indent=2))
print("Free voice auditions ready. Nothing scheduled or published.", flush=True)
