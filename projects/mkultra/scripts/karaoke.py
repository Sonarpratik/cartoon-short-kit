"""Original narration word timings -> active-word goldenrod ASS and a separate subtitled export."""
from pathlib import Path
import argparse,json,math,shutil,subprocess
from PIL import ImageFont
import imageio_ffmpeg

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--prepare-only',action='store_true')
args=parser.parse_args()
timing=json.loads((ROOT/'work/timing.json').read_text(encoding='utf-8'))
words=[]
source=timing['words'];i=0
while i<len(source):
    w=dict(source[i]);w.pop('probability',None)
    if w['word'].lower()=='twenty' and source[i+1]['word'].lower()=='thousand':
        w['word']='20,000';w['end']=source[i+1]['end'];i+=1
    replacements={'citizens,':'citizens…','control,':'control…','destroyed,':'destroyed.','but':'But','survived':'survived,','So,':'So…'}
    w['word']=replacements.get(w['word'],w['word']);words.append(w);i+=1

counts=[3,3,4,3,3,2,2,3,2,3,2,3,2,2,4,2,2,3,4,3,2,4,4,3,2,1,4,3]
assert sum(counts)==len(words),(sum(counts),len(words))
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',76)
groups=[];offset=0
for count in counts:
    group=words[offset:offset+count];offset+=count
    split=None;text=' '.join(w['word'] for w in group)
    if font.getlength(text)>880:
        split=min(range(1,len(group)),key=lambda k:max(font.getlength(' '.join(w['word'] for w in group[:k])),font.getlength(' '.join(w['word'] for w in group[k:]))))
    lines=[text] if split is None else [' '.join(w['word'] for w in group[:split]),' '.join(w['word'] for w in group[split:])]
    assert max(font.getlength(line) for line in lines)<=900,(text,lines)
    groups.append({'words':group,'split':split,'start':group[0]['start'],'end':group[-1]['end'],'lines':lines})

def stamp(seconds,ass=True):
    units=round(seconds*(100 if ass else 1000));scale=100 if ass else 1000
    h,units=divmod(units,3600*scale);m,units=divmod(units,60*scale);s,frac=divmod(units,scale)
    return f'{h}:{m:02d}:{s:02d}.{frac:02d}' if ass else f'{h:02d}:{m:02d}:{s:02d},{frac:03d}'

header='''[Script Info]
Title: MKUltra - active-word karaoke
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Karaoke,Arial,76,&H00FFFFFF,&H0020A5DA,&H001A1420,&H80000000,-1,0,0,0,100,100,0,0,1,4.5,2.5,2,90,90,260,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
events=[];active_spans=[];srt=[]
def text_for(group,active=None):
    pieces=[]
    for j,w in enumerate(group['words']):
        if j:pieces.append(r'\N' if j==group['split'] else ' ')
        text=w['word'].replace('{','').replace('}','')
        pieces.append((r'{\c&H0020A5DA&}'+text+r'{\c&H00FFFFFF&}') if j==active else text)
    return r'{\an2\pos(540,1660)}'+''.join(pieces)

def event(start,end,text):
    if round(end*100)>round(start*100):events.append(f'Dialogue: 0,{stamp(start)},{stamp(end)},Karaoke,,0,0,0,,{text}')

for gi,group in enumerate(groups):
    for j,w in enumerate(group['words']):
        event(w['start'],w['end'],text_for(group,j));active_spans.append({'word':w['word'],'start':w['start'],'end':w['end']})
        next_start=group['words'][j+1]['start'] if j+1<len(group['words']) else min(group['end']+.12,groups[gi+1]['start'] if gi+1<len(groups) else timing['duration'])
        event(w['end'],next_start,text_for(group))
    srt.append(f'{gi+1}\n{stamp(group["start"],False)} --> {stamp(group["end"],False)}\n'+ '\n'.join(group['lines'])+'\n')

out=ROOT/'out';out.mkdir(exist_ok=True)
(out/'mkultra-area51-karaoke.ass').write_text(header+'\n'.join(events)+'\n',encoding='utf-8-sig')
(out/'mkultra-area51-subtitles.srt').write_text('\n'.join(srt),encoding='utf-8-sig')
fonts=ROOT/'work/subtitle-fonts';fonts.mkdir(exist_ok=True);shutil.copy2('C:/Windows/Fonts/arialbd.ttf',fonts/'arialbd.ttf')
report={'activeWordColor':'#DAA520','inactiveColor':'#FFFFFF','font':'Arial Bold','fontSizeAt1080':76,'anchor':[540,1660],'sourceTiming':'work/timing.json','captionedTokens':len(words),'spokenTokens':len(source),'numberDisplay':'twenty thousand -> 20,000 over the combined spoken interval','groups':groups,'activeSpans':active_spans,'events':len(events),'maximumLineWidth':max(font.getlength(line) for g in groups for line in g['lines'])}
(ROOT/'work/karaoke-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(f'Prepared {len(groups)} phrases and {len(words)} active-word intervals; goldenrod #DAA520.',flush=True)
if not args.prepare_only:
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','warning','-i','out/mkultra-area51-clean.mp4',
        '-vf','subtitles=out/mkultra-area51-karaoke.ass:fontsdir=work/subtitle-fonts',
        '-map','0:v:0','-map','0:a:0','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p',
        '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-c:a','copy','-movflags','+faststart',
        '-metadata','title=MKUltra - Area 51 ending with karaoke subtitles','-y','out/mkultra-area51-karaoke.mp4'],cwd=ROOT,check=True)
    print('Subtitled export complete: out/mkultra-area51-karaoke.mp4',flush=True)
