"""Offline, project-local word timestamps from the cached faster-whisper model."""
from pathlib import Path
import json
import wave
import numpy as np
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parents[1]
model = WhisperModel('small.en', device='cpu', compute_type='int8', local_files_only=True)
with wave.open(str(root / 'work/voice-16k.wav'), 'rb') as audio:
    samples = np.frombuffer(audio.readframes(audio.getnframes()), dtype='<i2').astype(np.float32) / 32768
segments, info = model.transcribe(samples, beam_size=5,
    word_timestamps=True, vad_filter=True,
    initial_prompt='Zombie apocalypse, school gates, canned food, generator, headlights, stash, Part 4, subscribe.')
words = []
phrases = []
for segment in segments:
    print(f'{segment.start:.2f}-{segment.end:.2f}: {segment.text}', flush=True)
    phrases.append({'start': segment.start, 'end': segment.end, 'text': segment.text})
    for word in segment.words or []:
        words.append({'word': word.word.strip(), 'start': word.start, 'end': word.end, 'probability': word.probability})
with wave.open(str(root / 'work/voice-16k.wav'), 'rb') as audio:
    duration = audio.getnframes() / audio.getframerate()
data = {'duration': duration, 'fps': 30, 'totalFrames': round(duration * 30),
        'method': 'faster-whisper small.en, offline CPU int8, word timestamps',
        'segments': phrases, 'words': words}
(root / 'work/timing.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
print(f'Duration: {duration:.3f}s; frames: {data["totalFrames"]}', flush=True)
