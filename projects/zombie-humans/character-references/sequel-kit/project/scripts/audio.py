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

def pluck(freq, duration=1.6, decay=3.2, bright=.24):
    t=np.arange(round(duration*SR))/SR
    attack=np.minimum(1,t/.006)
    return attack*np.exp(-t*decay)*(np.sin(2*np.pi*freq*t)+bright*np.sin(2*np.pi*2*freq*t)+.08*np.sin(2*np.pi*3*freq*t))
def hz(n): return 440*2**((n-69)/12)
t=np.arange(N)/SR

# Original score (synthesized, no samples) for Part 3 "The Real Danger Is Humans":
# 0-27 s low D-minor pulse (group forms, days pass) with a warm D-major lift for "you feel safe"; 27 s drops to a dark drone
# for the knock; freeze hit at 33.6 s; creeping pulse; silence then headlight hit at 44.1 s and an engine rumble;
# heavy menace drums for "humans want everything"; rule stamps; raider-camp drums; drone + sting on "trust them"; outro.
BPM=100;beat=60/BPM
F=lambda fr:fr/30
def bass(a,b,notes,gain):
    for i,at in enumerate(np.arange(a,b,beat/2)):
        n=notes[(i//8)%len(notes)];add(music,float(at),pluck(hz(n-24),.32,9,.5),gain*(1.25 if i%2==0 else .8))
def motif(a,b,step,seq,gain,dur=.9,decay=4,bright=.3):
    for i,at in enumerate(np.arange(a,b,step)):
        add(music,float(at),pluck(hz(seq[i%len(seq)]),dur,decay,bright),gain*(1.15 if i%4==0 else 1))
def kick(at,g=1):
    tt=np.arange(round(.35*SR))/SR;add(music,at,np.sin(2*np.pi*(50+90*np.exp(-tt*30))*tt)*np.exp(-tt*9),.55*g)
def snare(at,g=1):
    tt=np.arange(round(.18*SR))/SR;n=signal.sosfilt(signal.butter(2,1800,btype='high',fs=SR,output='sos'),rng.standard_normal(len(tt)));add(music,at,n*np.exp(-tt*22),.22*g)
def drone(a,b,notes,gain):
    seg=(t>=a)&(t<b);env=np.clip(np.minimum(t-a,b-t)/1.2,0,1)
    for n in notes:music[seg]+=(gain*env*np.sin(2*np.pi*hz(n-24)*t)*(1+.2*np.sin(2*np.pi*.3*t)))[seg]
def hit(at,g=2.2,notes=(50,51,56,62)):
    kick(at,g)
    for n in notes:add(music,at,pluck(hz(n),3.2,1,.5),.1)
# 0-21.8 s: low pulse while the group forms and the days tick by.
bass(.2,21.8,[62,58,60,57],.18)
for at in np.arange(.2,21.8,beat):kick(float(at),.65)
for at in np.arange(.2+beat,21.8,beat*2):snare(float(at),.5)
motif(4.2,21.6,beat,[74,77,76,74,72,74,69,70],.09,.8,5)
# 21.8-27.1 s: warm "for the first time, you feel safe" (D major, slower, softer).
for i,at in enumerate(np.arange(22.1,27.0,beat*2)):
    for n in [[62,66,69],[67,71,74],[69,73,76],[62,66,69]][i%4]:add(music,float(at),pluck(hz(n),2.4,1.4,.25),.07)
bass(22.1,27.0,[62,67,69,62],.12)
# 27.1-43.2 s: dark drone (tritone), knock, freeze hit, creeping pulse, "gone" sting.
drone(27.1,43.2,[50,56],.07)
hit(F(1008),2.0,(50,51,57))
for at in np.arange(35.0,43.0,beat):kick(float(at),.45)
hit(F(1268),1.6,(50,56,62))
# 43.2-44.1 s silence (black); headlights hit; "ten men" hit; Troy sting.
hit(F(1322),2.6,(38,50,51,56));hit(F(1366),2.2,(50,53,56));hit(F(1414),1.8,(51,56,63))
drone(44.1,48.7,[38,44],.08)
# 48.7-60.7 s: heavy menace drums under "humans want everything".
bass(48.7,60.6,[50,51,50,46],.2)
for at in np.arange(48.7,60.6,beat):kick(float(at),.95)
for at in np.arange(48.7+beat,60.6,beat*2):snare(float(at),.85)
motif(53.0,60.5,beat,[62,63,62,58,62,63,65,63],.08,.7,6)
# 60.7-77.4 s: three rules over a steady pulse; slow-and-dumb gets a comic bounce.
bass(60.7,74.2,[62,58,60,57],.15)
for at in np.arange(60.7,74.2,beat):kick(float(at),.55)
for i,at in enumerate(np.arange(74.3,77.3,beat/2)):add(music,float(at),pluck(hz([62,65,62,57][i%4]-12),.4,7,.6),.12)
# 77.4-82.5 s: raider camp toms building to the engines on "never stop".
for i,at in enumerate(np.arange(77.4,82.4,beat/2)):kick(float(at),.6+.6*i/20)
hit(F(2406),2.2,(38,50,53))
# 82.5-90.4 s: drone + sting on "trust", soft outro pulse to the end card.
drone(82.5,90.36,[50,56],.07)
hit(F(2594),2.0,(50,51,56,62))
for at in np.arange(87.3,90.0,beat):kick(float(at),.45)
music*=np.minimum(1,t/.3)*np.clip((DURATION-t)/1.0,0,1)
music[(t>=F(1295))&(t<F(1322))]*=0.05   # the black before the headlights is (almost) silent

def noise_event(at, duration, gain, cutoff=1800, decay=7, kind='low'):
    tt=np.arange(round(duration*SR))/SR
    n=rng.standard_normal(len(tt))
    n=signal.sosfilt(signal.butter(2,cutoff,btype=kind,fs=SR,output='sos'),n)
    add(sfx,at,n*np.minimum(1,tt/.008)*np.exp(-decay*tt),gain)
def tone_event(at,freq,duration,gain,glide=0):
    tt=np.arange(round(duration*SR))/SR;f=freq*(1+glide*tt/duration)
    add(sfx,at,np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(1,tt/.01)*np.exp(-5*tt/duration),gain)
def bed(a,b,gain,cutoff,kind='low',mod=0,rate=0):
    seg=(t>=a)&(t<b);n=signal.sosfilt(signal.butter(2,cutoff,btype=kind,fs=SR,output='sos'),rng.standard_normal(N))
    env=np.clip(np.minimum(t-a,b-t)/.5,0,1)*(1+mod*np.sin(2*np.pi*rate*t))
    sfx[seg]+=(gain*env*n)[seg]
def groan(at,g=.18,f0=95):
    tt=np.arange(round(1.1*SR))/SR;f=f0*(1-.25*tt)+6*np.sin(2*np.pi*5*tt);src=signal.sawtooth(2*np.pi*np.cumsum(f)/SR)
    src=signal.sosfilt(signal.butter(2,[300,900],btype='band',fs=SR,output='sos'),src);add(sfx,at,src*np.sin(np.pi*tt/1.1),g)
def engine(a,b,gain,f0=38):
    seg=(t>=a)&(t<b);env=np.clip(np.minimum(t-a,b-t)/.6,0,1);f=f0*(1+.25*np.clip((t-a)/1.5,0,1))+3*np.sin(2*np.pi*1.3*t)
    src=signal.sawtooth(2*np.pi*np.cumsum(f)/SR)
    src=signal.sosfilt(signal.butter(2,420,btype='low',fs=SR,output='sos'),src);sfx[seg]+=(gain*env*src)[seg]
def knock(at):
    noise_event(at,.22,.8,260,18);tone_event(at,110,.25,.25);noise_event(at,.05,.25,2500,60,'high')
def whoosh(at,g=.18):bed(at,at+.28,g,3000,'high')
def stamp(at):noise_event(at,.12,.6,400,25);tone_event(at,180,.25,.2)
def clang(at,g=.8):noise_event(at,.4,g,500,8);tone_event(at,220,.6,.18);tone_event(at,331,.5,.08)
for at in [2.0,9.0,49.6,51.2,52.4,74.6,76.0]:groan(at)                # distant zombies
bed(0,27.1,.012,500,'low',.2,.1)                                       # daytime air
for fr in [418,518,814]:whoosh(F(fr));stamp(F(fr)+.15)                  # DAY 1 / 10 / 20 cards
bed(F(440),F(478),.06,900,'low',.4,9);clang(F(478))                     # gate rolls shut, clang
tone_event(F(488),2400,.08,.12);noise_event(F(488),.05,.4,4000,80,'high')  # padlock click
for fr in [572,595,618,636]:tone_event(F(fr),880,.12,.05)               # supply ticks
for k in range(3):noise_event(F(660)+k*.12,.1,.25,1200,20)              # pull cord
bed(F(666),F(814),.05,140,'low',.6,25)                                  # generator hum
bed(F(700),F(814),.03,2500,'high',.8,7)                                 # campfire crackle
for fr in [868,877,887]:knock(F(fr))                                    # three knocks on the steel gate
bed(F(814),F(1008),.015,300,'low')                                      # night wind
noise_event(F(1008),.5,.5,6000,6,'high')                                # freeze-frame hit
bed(F(1053),F(1065),.05,900,'low',.4,9)                                 # gate rolls open
for fr in [1164,1184,1192,1198]:tone_event(F(fr),1200,.15,.06)          # counting ticks
for fr in [1322,1330]:whoosh(F(fr),.3);noise_event(F(fr),.3,.5,6000,8,'high')   # headlights blaze on
engine(F(1343),F(1462),.22);engine(F(1349),F(1462),.16,44)              # engines rev and idle
for fr in range(1362,1380,3):noise_event(F(fr),.08,.18,700,30)          # boots on asphalt
for fr in [1690,1719,1745,1792]:whoosh(F(fr),.12);stamp(F(fr))          # YOUR FOOD / WATER / WEAPONS / CAMP
for fr in [1898,2000,2103]:whoosh(F(fr));stamp(F(fr)+.2)                # rule cards
noise_event(F(1963),.35,.9,600,10);tone_event(F(1963),140,.3,.2)        # store door slams
noise_event(F(2028),.3,.25,1500,10);noise_event(F(2052),.25,.3,2500,12) # hatch creak, locker clank
bed(F(2101),F(2228),.015,300,'low')                                     # night wind on watch
tone_event(F(2276),520,.35,.25,-.6);tone_event(F(2276),780,.3,.12,-.5)  # cartoon bonk
for k in range(4):tone_event(F(2280)+k*.09,2200+300*k,.15,.05)         # dizzy stars
bed(F(2321),F(2474),.05,2500,'high',.8,7)                               # oil-drum fire crackle
engine(F(2406),F(2474),.2,40)                                           # trucks start
bed(F(2474),F(2711),.03,2500,'high',.8,7)                               # campfire under the question
whoosh(F(2619));stamp(F(2632));tone_event(F(2648),1500,.2,.1)           # PART 4 / SUBSCRIBE

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
 'music':'Original synthesized score: D-minor pulse, warm D-major safe beat, dark drones, hits on the freeze / headlights / ten men / trust, menace drums, raider toms.',
 'mastering':'Common linear gain targets -14 LUFS followed by one 4x-oversampled look-ahead peak limiter.'}
(ROOT/'work/audio-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
