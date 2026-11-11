"""Create labelled scene sheets and a compact overview from project review frames."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, sys, textwrap, re
root=Path(__file__).resolve().parents[1]
version=sys.argv[1] if len(sys.argv)>1 else 'v1'
manifest=json.loads((root/f'review/manifest_{version}.json').read_text(encoding='utf-8'))
previous={}
versions=[]
for p in (root/'review').glob('manifest_v*.json'):
    match=re.fullmatch(r'manifest_v(\d+)\.json',p.name)
    if match and (len(sys.argv)<3 or int(match[1])<=int(sys.argv[2])) and (not re.fullmatch(r'v\d+',version) or int(match[1])<int(version[1:])):
        versions.append((int(match[1]),p))
for _,p in sorted(versions):
    for s in json.loads(p.read_text(encoding='utf-8')):previous[s['id']]=s
latest={**previous,**{s['id']:s for s in manifest}}
def font(n,bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('arialbd.ttf' if bold else 'arial.ttf'),n)
overview=[]
lines=['# Scene review — MKUltra', '', 'Narration duration: 34.4555 seconds. 30 fps. This revision has not been rendered as a full video; the previous export is preserved.', '', '| Scene | Time | Words | Version | Status |', '|---|---|---|---|---|']
hashes={}
for s in manifest:
    thumb_w=360;thumb_h=640;gap=16;header=118
    sheet=Image.new('RGB',(gap+(thumb_w+gap)*len(s['paths']),header+thumb_h+56),'#16232e');d=ImageDraw.Draw(sheet)
    d.text((18,14),s['id']+' · '+s['title'],font=font(25,True),fill='#f1d5ae')
    wrapped=textwrap.wrap(s['words'],width=max(55,len(s['paths'])*28))
    for j,line in enumerate(wrapped[:2]):d.text((18,52+j*24),line,font=font(18),fill='#f3eee1')
    for i,p in enumerate(s['paths']):
        im=Image.open(root/p).convert('RGB');im.thumbnail((thumb_w,thumb_h),Image.Resampling.LANCZOS)
        x=gap+i*(thumb_w+gap);sheet.paste(im,(x,header));f=s['review'][i]
        d.text((x,header+thumb_h+13),f'{s["id"]}  f{f:04d}  {f/30:.2f}s',font=font(19),fill='#d6e0dd')
    destination=root/f'review/{s["id"]}_{version}.jpg'
    if destination.exists():raise RuntimeError('Do not overwrite '+str(destination))
    sheet.save(destination,quality=94)
    old=previous.get(s['id'])
    if old:
        old_path=root/f'review/{s["id"]}_{old["version"]}.jpg'
        if old_path.exists():
            before=Image.open(old_path).convert('RGB')
            if before.width!=sheet.width:before=before.resize((sheet.width,round(before.height*sheet.width/before.width)),Image.Resampling.LANCZOS)
            comparison=Image.new('RGB',(sheet.width,before.height+sheet.height+76),'#101a23');cd=ImageDraw.Draw(comparison)
            cd.text((18,8),'BEFORE · '+old['version'],font=font(21,True),fill='#d2d9db');comparison.paste(before,(0,36))
            y=before.height+44;cd.text((18,y),'AFTER · '+version,font=font(21,True),fill='#f1d5ae');comparison.paste(sheet,(0,y+32))
            comparison.save(root/f'review/{s["id"]}_{version}_comparison.jpg',quality=93)
for s in sorted(latest.values(),key=lambda s:s['f0']):
    middle=Image.open(root/s['paths'][len(s['paths'])//2]).convert('RGB').resize((216,384),Image.Resampling.LANCZOS)
    card=Image.new('RGB',(244,443),'#16232e');cd=ImageDraw.Draw(card);card.paste(middle,(14,41));cd.text((14,10),f'{s["id"]} · {s["f0"]/30:.1f}–{s["f1"]/30:.1f}s · {s["version"]}',font=font(14,True),fill='#f1d5ae');overview.append(card)
    lines.append(f'| {s["id"]} | {s["f0"]/30:.2f}–{s["f1"]/30:.2f}s | {s["words"]} | {s["version"]} | {s.get("status","to check")} |')
    hashes[s['id']]={'sourceHash':s['sourceHash'],'version':s['version'],'frames':s['review']}
canvas=Image.new('RGB',(3*244,3*443+60),'#101a23');d=ImageDraw.Draw(canvas);d.text((18,18),'MKULTRA · SCENE REVIEW',font=font(23,True),fill='#f1d5ae')
for i,im in enumerate(overview):canvas.paste(im,((i%3)*244,60+(i//3)*443))
canvas.save(root/f'review/overview_{version}.jpg',quality=94)
(root/'work/REVIEW.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
(root/'work/hashes.json').write_text(json.dumps(hashes,indent=2),encoding='utf-8')
print(f'Created {len(manifest)} updated scene sheets; overview_{version}.jpg includes {len(latest)} latest scenes.')
