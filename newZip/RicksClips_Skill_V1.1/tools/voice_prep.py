"""Voice prep (shared; copied from the baboon-signalman episode 2026-11-13): trim true silence, speed up, word times, gates.
python tools/voice_prep.py <raw.mp3> <tempo> <out_dir>
Writes voice.wav, words.json (w,s,e), voice_gates.json. Never time-stretches beyond atempo; keeps breaths."""
import sys, json, subprocess, statistics, os, re
raw, tempo, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
os.makedirs(out, exist_ok=True)
wav = os.path.join(out, "voice.wav")
# 1) cut only silence: any pause longer than 0.28 s is shortened to 0.18 s (true silence below -42 dB); 2) atempo
af = f"silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,silenceremove=stop_periods=-1:stop_duration=0.28:stop_threshold=-42dB:stop_silence=0.18,atempo={tempo},areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.25,areverse"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", af, "-ar", "48000", "-ac", "1", wav], check=True)
from faster_whisper import WhisperModel
m = WhisperModel("small.en", device="cpu", compute_type="int8")
import numpy as np
pcm = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", wav, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0   # decode with ffmpeg: the PC's PyAV does not match faster-whisper 1.2.1
segs, info = m.transcribe(audio, word_timestamps=True, beam_size=5, vad_filter=False)
words = [{"w": w.word.strip(), "s": round(float(w.start), 3), "e": round(float(w.end), 3)} for s in segs for w in s.words]
json.dump(words, open(os.path.join(out, "words.json"), "w"), indent=0)
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
gaps = [round(b["s"] - a["e"], 3) for a, b in zip(words, words[1:])]
sent_gaps = [g for a, g in zip(words, gaps) if re.search(r"[.,?!\"]$", a["w"])]
talk = sum(w["e"] - w["s"] for w in words) + sum(g for g in gaps if g < 0.12)
pauses = sum(g for g in gaps if g >= 0.12)
G = {"duration_s": round(dur, 2), "words": len(words), "words_per_s_overall": round(len(words) / dur, 2),
     "words_per_s_talking": round(len(words) / max(talk, 1e-6), 2),
     "sentence_gap_median": round(statistics.median(sent_gaps), 3) if sent_gaps else None,
     "longest_gap": float(max(gaps)) if gaps else 0.0, "gaps_over_0_5": int(sum(g > 0.5 for g in gaps)),
     "pause_share_pct": round(100 * pauses / dur, 1), "tempo": tempo,
     "transcript": " ".join(w["w"] for w in words)}
json.dump(G, open(os.path.join(out, "voice_gates.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in G.items() if k != "transcript"}))
