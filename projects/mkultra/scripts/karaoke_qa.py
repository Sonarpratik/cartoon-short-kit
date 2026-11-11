"""Check encoded karaoke coverage, retained picture/audio and preserved original export."""
from pathlib import Path
import hashlib,json,subprocess
import numpy as np
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1];FF=imageio_ffmpeg.get_ffmpeg_exe()
clean=ROOT/'out/mkultra-area51-clean.mp4';subbed=ROOT/'out/mkultra-area51-karaoke.mp4'
timing=json.loads((ROOT/'work/karaoke-report.json').read_text(encoding='utf-8'))
def decode(file,filter='scale=90:160',width=90,height=160):
    raw=subprocess.run([FF,'-v','error','-i',str(file),'-map','0:v:0','-vf',filter,'-pix_fmt','rgb24','-fps_mode','passthrough','-f','rawvideo','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.uint8).reshape(-1,height,width,3)

base=decode(clean);output=decode(subbed);assert len(base)==len(output)==1034
luma=(output.astype(np.float32)*np.array([.2126,.7152,.0722],np.float32)).sum(axis=3)/255
black=np.flatnonzero((luma<.035).mean(axis=(1,2))>.98).tolist();white=np.flatnonzero((luma>.97).mean(axis=(1,2))>.98).tolist()
assert not black and not white
outside=np.abs(base[:,:120].astype(np.float32)-output[:,:120].astype(np.float32)).mean(axis=(1,2,3))
assert float(outside.max())<6,float(outside.max())
def audio_digest(file):
    raw=subprocess.run([FF,'-v','error','-i',str(file),'-map','0:a:0','-c:a','copy','-f','adts','-'],capture_output=True,check=True).stdout
    return hashlib.sha256(raw).hexdigest()
audio_same=audio_digest(clean)==audio_digest(subbed);assert audio_same

midframes=[round((w['start']+w['end'])*15) for w in timing['activeSpans']]
selected=sorted(set(midframes));select='+'.join(f'eq(n\\,{n})' for n in selected)
filter='select='+select+',scale=360:640'
a=decode(clean,filter,360,640);b=decode(subbed,filter,360,640);assert len(a)==len(b)==len(selected)
counts={}
for i,f in enumerate(selected):
    original=a[i,480:575].astype(np.int16);image=b[i,480:575].astype(np.int16)
    changed=np.max(np.abs(image-original),axis=2)>30
    rr,gg,bb=image[:,:,0],image[:,:,1],image[:,:,2]
    gold=(rr>155)&(rr<256)&(gg>105)&(gg<225)&(bb<105)&(rr>gg+20)&(gg>bb+45)&changed
    counts[f]=int(gold.sum())
missing=[{'word':w['word'],'frame':f,'goldPixels':counts[f]} for w,f in zip(timing['activeSpans'],midframes) if counts[f]<5]
assert not missing,missing

prior=(ROOT/'out/final.mp4').read_bytes();preserved=(ROOT/'out/mkultra-final-v16.mp4').read_bytes();assert hashlib.sha256(prior).digest()==hashlib.sha256(preserved).digest()
report={'video':'out/mkultra-area51-karaoke.mp4','decodedFrames':len(output),'blackFrames':black,'whiteFrames':white,
    'audioBitstreamIdenticalToClean':audio_same,'allActiveWordsHaveEncodedGoldenrod':not missing,'checkedWordIntervals':len(midframes),
    'minimumGoldenrodPixelsAt360Width':min(counts.values()),'maximumMeanPictureDifferenceAboveCaptionRegion':float(outside.max()),
    'previousFinalUnchanged':True,'previousFinalSha256':hashlib.sha256(prior).hexdigest(),'subtitleColor':'#DAA520',
    'cleanBytes':clean.stat().st_size,'subtitledBytes':subbed.stat().st_size}
(ROOT/'work/area51-karaoke-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
subprocess.run([FF,'-v','error','-i',str(subbed),'-vf','select=eq(n\\,1009)','-frames:v','1','-y',str(ROOT/'out/area51-karaoke-final-check.png')],check=True)
print(json.dumps(report,indent=2),flush=True)
