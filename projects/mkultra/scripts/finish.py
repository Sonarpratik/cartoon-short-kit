"""Encode the completed frame sequence, meter AAC, and inspect every video frame."""
from pathlib import Path
import json, math, re, subprocess
import numpy as np
from PIL import Image,ImageDraw,ImageFont
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'out';OUT.mkdir(exist_ok=True)
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
render=json.loads((ROOT/'work/render-manifest.json').read_text(encoding='utf-8'))
audio=json.loads((ROOT/'work/audio-report.json').read_text(encoding='utf-8'))
total=render['total'];duration=audio['duration'];final=OUT/'final.mp4'
for s in render['scenes']:
    if not s['complete']:raise RuntimeError('Incomplete scene '+s['id'])

encode=[FFMPEG,'-hide_banner','-loglevel','warning','-framerate','30','-i',str(ROOT/render['sequence']/'f%04d.jpg'),
    '-i',str(OUT/'mix.wav'),'-map','0:v:0','-map','1:a:0',
    '-vf','scale=in_range=full:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p',
    '-c:v','libx264','-preset','slow','-crf','17','-r','30',
    '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',
    '-c:a','aac','-b:a','192k','-ar','48000','-t',str(duration),'-movflags','+faststart',
    '-metadata','title=MKUltra - The Files That Survived','-y',str(final)]
print('Encoding 1080x1920 H.264 + AAC...',flush=True)
subprocess.run(encode,check=True)

def meter(p):
    result=subprocess.run([FFMPEG,'-hide_banner','-i',str(p),'-map','0:a:0','-af',
        'loudnorm=I=-14:TP=-1:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
    return json.loads(re.findall(r'\{[^{}]+\}',result.stderr)[-1])

levels=meter(final);delivery_gain=0
if float(levels['input_tp'])>-1:
    delivery_gain=-1.2-float(levels['input_tp'])
    adjusted=OUT/'final-peak-adjusted.mp4'
    subprocess.run([FFMPEG,'-v','error','-i',str(final),'-i',str(OUT/'mix.wav'),'-map','0:v:0','-map','1:a:0',
        '-c:v','copy','-af',f'volume={delivery_gain:.6f}dB','-c:a','aac','-b:a','192k','-ar','48000',
        '-t',str(duration),'-movflags','+faststart','-y',str(adjusted)],check=True)
    adjusted.replace(final);levels=meter(final)

print('Checking every decoded frame and final audio...',flush=True)
decoded=subprocess.run([FFMPEG,'-v','error','-i',str(final),'-map','0:v:0','-vf','scale=90:160','-pix_fmt','rgb24','-f','rawvideo','-'],capture_output=True,check=True).stdout
frames=np.frombuffer(decoded,np.uint8).reshape(-1,160,90,3)
assert len(frames)==total,(len(frames),total)
luma=(frames[:,:,:,0].astype(np.float32)*.2126+frames[:,:,:,1].astype(np.float32)*.7152+frames[:,:,:,2].astype(np.float32)*.0722)/255
means=luma.mean(axis=(1,2));black=np.flatnonzero((luma<.035).mean(axis=(1,2))>.98).tolist()
white=np.flatnonzero((luma>.97).mean(axis=(1,2))>.98).tolist()
motion=np.mean(np.abs(np.diff(frames.astype(np.float32),axis=0)),axis=(1,2,3))/255
boundaries={s['f0'] for s in render['scenes']}
pops=[int(i+1) for i in np.flatnonzero(motion>.22) if not any(abs(int(i+1)-cut)<=1 for cut in boundaries)]
detector=subprocess.run([FFMPEG,'-hide_banner','-i',str(final),'-vf',
    'blackdetect=d=0.1:pix_th=0.1:pic_th=0.98,freezedetect=n=-50dB:d=0.4','-an','-f','null','-'],capture_output=True,text=True,check=True)
freeze_lines=[line for line in detector.stderr.splitlines() if 'lavfi.freezedetect.freeze_' in line]

comparisons=[]
approved=json.loads((ROOT/'work/hashes.json').read_text(encoding='utf-8'))
for sid,frame in [('S01',24),('S03',208),('S04',419),('S05',509),('S07',809),('S08',902)]:
    version=approved[sid]['version']
    old=np.asarray(Image.open(ROOT/f'review/{sid}_{version}/f{frame:04d}.jpg').convert('RGB').resize((90,160),Image.Resampling.BOX),dtype=np.float32)
    diff=float(np.abs(old-frames[frame].astype(np.float32)).mean())
    comparisons.append({'scene':sid,'frame':frame,'meanPixelDifferenceVsApprovedReview':diff})

chosen=sorted(set([s['f0'] for s in render['scenes']]+[383,509,660,902,total-1]))
cell_w,cell_h=244,451
sheet=Image.new('RGB',(cell_w*4,60+cell_h*math.ceil(len(chosen)/4)),'#14232e');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18);bold=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',24)
d.text((16,15),'MKULTRA - FINAL VIDEO QA',font=bold,fill='#efd4ac')
for i,f in enumerate(chosen):
    scene=next(s['id'] for s in render['scenes'] if s['f0']<=f<s['f1'])
    source=ROOT/render['sequence']/f'f{f:04d}.jpg';im=Image.open(source).convert('RGB').resize((216,384),Image.Resampling.LANCZOS)
    x=(i%4)*cell_w+14;y=60+(i//4)*cell_h
    d.text((x,y),f'{scene}  {f/30:.2f}s',font=font,fill='#efd4ac');sheet.paste(im,(x,y+30))
sheet.save(OUT/'qa-contact-sheet.jpg',quality=94)

report={'file':'out/final.mp4','width':1080,'height':1920,'fps':30,'decodedFrames':len(frames),
    'videoDuration':len(frames)/30,'narrationDuration':duration,'durationDifferenceSeconds':len(frames)/30-duration,
    'integratedLUFS':float(levels['input_i']),'truePeakDbTP':float(levels['input_tp']),
    'finalCommonAudioAdjustmentDb':delivery_gain,'blackFrames':black,'whiteFrames':white,
    'freezeDetectorEvents':freeze_lines,'unplannedLargeChanges':pops,'reviewComparisons':comparisons,
    'fileBytes':final.stat().st_size,'renderer':render['renderer']}
(ROOT/'work/final-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
if black or white or freeze_lines or pops:raise RuntimeError('Inspect flagged visual QA events before delivery')
if float(levels['input_tp'])>-1:raise RuntimeError('AAC true peak exceeds -1 dBTP')
if abs(float(levels['input_i'])+14)>.7:raise RuntimeError('Final loudness is outside target tolerance')
if any(x['meanPixelDifferenceVsApprovedReview']>12 for x in comparisons):raise RuntimeError('Rendered appearance differs materially from review')
print('PASS: final MP4 encoded; all-frame and audio QA passed.',flush=True)
