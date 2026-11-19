"""Montage a folder of frames into one labelled sheet: python scripts/montage.py <dir> <out.jpg> [cols] [width]"""
import sys,pathlib
from PIL import Image,ImageDraw,ImageFont
d=pathlib.Path(sys.argv[1]);out=sys.argv[2];cols=int(sys.argv[3]) if len(sys.argv)>3 else 6;W=int(sys.argv[4]) if len(sys.argv)>4 else 300
files=sorted(d.glob('f*.jpg'));H=int(W*16/9)+30;rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(cols*W,rows*H),'#1b1b22');dr=ImageDraw.Draw(sheet)
try:font=ImageFont.truetype('arialbd.ttf',20)
except Exception:font=ImageFont.load_default()
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((W,int(W*16/9)));x,y=(i%cols)*W,(i//cols)*H;sheet.paste(im,(x,y));dr.text((x+8,y+int(W*16/9)+4),f.stem,fill='#f1eee5',font=font)
sheet.save(out,quality=88);print(out,len(files))
