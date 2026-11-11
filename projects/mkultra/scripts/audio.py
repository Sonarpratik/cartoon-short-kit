"""Project-local original score/SFX and a measured fixed-ratio narration mix."""
from pathlib import Path
import json, math, re, subprocess, wave
import numpy as np
from scipy import signal
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out'
OUT.mkdir(exist_ok=True)
SR = 48000
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TIMING = json.loads((ROOT / 'work/timing.json').read_text(encoding='utf-8'))
DURATION = TIMING['duration']
N = round(SR * DURATION)

def write(name, data):
    data = np.asarray(data)
    if data.ndim == 1:
        data = np.repeat(data[:, None], 2, axis=1)
    pcm = np.round(np.clip(data, -.999999, .999999) * 32767).astype('<i2')
    with wave.open(str(OUT / name), 'wb') as target:
        target.setnchannels(2)
        target.setsampwidth(2)
        target.setframerate(SR)
        target.writeframes(pcm.tobytes())

raw = subprocess.run([FFMPEG, '-v', 'error', '-i', str(ROOT/'input/voice.mp3'),
    '-f', 'f32le', '-acodec', 'pcm_f32le', '-ar', str(SR), '-ac', '1', '-'],
    capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype='<f4').astype(np.float64)
voice = np.pad(voice[:N], (0, max(0, N-len(voice))))
speech = np.zeros(N, dtype=bool)
for word in TIMING['words']:
    speech[max(0, round(word['start']*SR)):min(N, round(word['end']*SR))] = True
# Ignore breath/silence even within the timestamp mask, with a -40 dB absolute gate.
window = max(1, round(.05*SR))
power = signal.convolve(voice*voice, np.ones(window)/window, mode='same', method='fft')
gate = speech & (power > 1e-4)
if gate.sum() < SR:
    raise RuntimeError('Insufficient gated narration samples')
def rms(x): return float(np.sqrt(np.mean(np.square(x[gate]))))
voice_rms = rms(voice)
voice_peak = float(np.max(np.abs(voice)))
music = np.zeros(N)
sfx = np.zeros(N)
rng = np.random.default_rng(1953)

def add(stem, at, values, gain=1):
    start = round(at*SR)
    lo, hi = max(0,start), min(N,start+len(values))
    if hi > lo: stem[lo:hi] += values[lo-start:hi-start]*gain

def pluck(freq, duration=1.6):
    t=np.arange(round(duration*SR))/SR
    attack=np.minimum(1,t/.008)
    return attack*np.exp(-t*3.2)*(np.sin(2*np.pi*freq*t)+.24*np.sin(2*np.pi*2*freq*t)+.08*np.sin(2*np.pi*3*freq*t))

# Sparse, original D-minor investigative ostinato, not a sampled music track.
notes=[146.832,220,174.614,220,130.813,196,164.814,196]
for i, at in enumerate(np.arange(.05, 31.55, .56)):
    add(music,float(at),pluck(notes[i%len(notes)]),.19 if i%4 else .24)
t=np.arange(N)/SR
pad = .15*np.sin(2*np.pi*73.416*t)+.05*np.sin(2*np.pi*110*t)+.035*np.sin(2*np.pi*146.832*t)
envelope=np.minimum(1,t/.5)*np.minimum(1,np.maximum(0,31.6-t)/.5)
music=(music+pad)*envelope

def noise_event(at, duration, gain, cutoff=1800, decay=7):
    t=np.arange(round(duration*SR))/SR
    n=rng.standard_normal(len(t))
    n=signal.sosfilt(signal.butter(2,cutoff,fs=SR,output='sos'),n)
    add(sfx,at,n*np.minimum(1,t/.008)*np.exp(-decay*t),gain)

def tone_event(at,freq,duration,gain):
    t=np.arange(round(duration*SR))/SR
    add(sfx,at,np.sin(2*np.pi*freq*t)*np.minimum(1,t/.012)*np.exp(-5*t/duration),gain)

noise_event(.5,.15,.35,2600,16)       # restrained table/glass movement
noise_event(3.25,.35,.2,2400,8)       # testimony paper
tone_event(4.7,620,.15,.11)          # lab transition
noise_event(7.9,.15,.12,1400,12)     # file movement
noise_event(11.85,.18,.12,2300,14)   # cup
tone_event(14.1,82,.7,.14)           # interrogation room beat
noise_event(16.15,1.8,.035,800,1.2)  # tape mechanism
noise_event(21.48,.22,.4,650,20)     # stamp landing, aligned to actual frame animation
noise_event(22.38,.82,.14,2200,2.2)  # first paper destruction
tone_event(25.05,440,.5,.13)         # surviving folder
noise_event(28.65,.6,.18,1800,4)     # archive discovery
noise_event(29.65,.35,.13,2500,8)    # file opens
tone_event(31.78,55,2.1,.3)          # final sting after the music stops
noise_event(33.3,.65,.16,1500,5)     # final shredding

# One gain per stem. No narration edits, speech ducking, compression or time stretch.
music *= (.5*voice_rms) / max(rms(music),1e-12)
sfx *= (.5*voice_rms) / max(rms(sfx),1e-12)
sfx *= min(1, (.7*voice_peak)/max(float(np.max(np.abs(sfx))),1e-12))
mix=voice+music+sfx
music_db=20*math.log10(rms(music)/voice_rms)
sfx_db=20*math.log10(rms(sfx)/voice_rms)
assert abs(music_db+6.0206)<.01
assert sfx_db<=-6.02+.01
assert np.max(np.abs(sfx))<=.7*voice_peak+1e-9

# Temporary float WAV allows true-peak/loudness measurement before applying a common gain.
float_path=OUT/'mix-premaster.wav'
subprocess.run([FFMPEG,'-v','error','-f','f64le','-ar',str(SR),'-ac','2','-i','-',
    '-c:a','pcm_f32le','-y',str(float_path)],input=np.repeat(mix[:,None],2,axis=1).astype('<f8').tobytes(),check=True)
def measure(p):
    meter=subprocess.run([FFMPEG,'-hide_banner','-i',str(p),'-af',
        'loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    return json.loads(re.findall(r'\{[^{}]+\}',meter.stderr)[-1])
stats=measure(float_path)
gain_db=-14-float(stats['input_i'])
write('voice-stem.wav',voice)
write('music-stem.wav',music)
write('sfx-stem.wav',sfx)
# One common gain followed by a 4x-oversampled look-ahead peak limiter.
# The limiter is only on the final sum; there is no stem ducking or compression.
for attempt in range(3):
    subprocess.run([FFMPEG,'-v','error','-i',str(float_path),'-af',
        f'aresample=192000,volume={gain_db:.6f}dB,alimiter=limit=0.86:attack=5:release=60:level=false:latency=true,aresample=48000',
        '-t',str(DURATION),'-c:a','pcm_s24le','-y',str(OUT/'mix.wav')],check=True)
    final_stats=measure(OUT/'mix.wav')
    difference=-14-float(final_stats['input_i'])
    if abs(difference)<.3:break
    gain_db+=difference
report={'sampleRate':SR,'duration':DURATION,'voiceGatedRMS':voice_rms,'musicVsVoiceDb':music_db,
 'sfxVsVoiceDb':sfx_db,'sfxPeakVsVoicePeak':float(np.max(np.abs(sfx))/voice_peak),
 'commonMasterGainDb':gain_db,'measuredMasterLUFS':float(final_stats['input_i']),
 'measuredMasterTruePeakDbTP':float(final_stats['input_tp']),
 'voiceTreatment':'Decoded unchanged; one common linear gain and a final peak limiter. No time edits or ducking.',
 'music':'Original synthesized D-minor ostinato and low pad; stops at 31.6 seconds.',
 'mastering':'Common linear gain targets -14 LUFS followed by one 4x-oversampled look-ahead peak limiter.'}
(ROOT/'work/audio-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
