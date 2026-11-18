import numpy as np, os, json
from PIL import Image, ImageDraw, ImageFont
H=os.path.dirname(os.path.abspath(__file__)); F=lambda f: os.path.join(H,'frames','f_%05d.png'%f)
rows=[]; 
for f in range(60):
    a=np.asarray(Image.open(F(f)).convert('RGB')).astype(np.float32); l=a.mean(2)
    g=l[1300:1920].mean()   # lower picture: tower + ground (light thrown on the world)
    rows.append((f, round(float(l.mean()),1), int((l>245).sum()), round(float(g),1), int(np.isnan(a).sum())))
print('frame mean core_px(>245) lower_mean'); print(' '.join(f'{r[0]}:{r[1]}/{r[2]}/{r[3]}' for r in rows))
S=26; m={r[0]:r for r in rows}
after=[r for r in rows if r[0]>S+1]
rs=[r[0] for r in after if r[2]>m[r[0]-1][2]*1.6 and r[2]>800]
last=max([r[0] for r in rows if r[0]>S and r[2]>150] or [S+10])
print('restrike-like frames', rs, 'last channel frame', last)
far=8; lead=S-2; restr=rs[0] if rs else S+4; aft=min(last+2,59)
tiles=[('NOW: film v2 bolt (s5 f1440)',os.path.join(H,'../../../../episodes/lightning-spear-s5/final/frames/f_01440.png'),None),
 (f'far bolt f{far}',F(far),None),(f'stepped leader f{lead}',F(lead),None),(f'return stroke f{S}',F(S),None),
 (f'current down the wire f{S+3}',F(S+3),None),(f'restrike f{restr}',F(restr),None),(f'afterglow f{aft}',F(aft),None),(f'strike close f{S} (crop)',F(S),(300,330,780,1180))]
W,Ht=400,711; sh=Image.new('RGB',(1600,2*Ht+2*30),(12,12,16)); d=ImageDraw.Draw(sh)
try: fn=ImageFont.truetype('arial.ttf',20)
except: fn=None
for i,(t,p,crop) in enumerate(tiles):
    im=Image.open(p).convert('RGB')
    if crop: im=im.crop(crop)
    im=im.resize((W,Ht)); x=(i%4)*W; y=(i//4)*(Ht+30); sh.paste(im,(x,y+30)); d.text((x+6,y+5),t,fill=(235,235,240),font=fn)
sh.save(os.path.join(H,'bolt_sheet.jpg'),quality=88); print('sheet', far, lead, S, restr, aft)
json.dump({'rows':rows,'restrikes':rs,'last':last},open(os.path.join(H,'numbers.json'),'w'))
