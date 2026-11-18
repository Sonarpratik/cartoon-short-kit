"""pc_sheet.py <out.jpg> <cols> <tile_w> <files...>: labelled contact sheet for a look by eye (a small JPEG that is quick to send from the PC).
A file name may be a glob. SHEET_Q sets the JPEG quality (default 84)."""
import sys, os, glob
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); fs = [g for a in sys.argv[4:] for g in (sorted(glob.glob(a)) if any(c in a for c in "*?[") else [a])]
ims = [Image.open(f).convert("RGB") for f in fs]; th = round(tw * ims[0].height / ims[0].width); rows = (len(ims) + cols - 1) // cols
o = Image.new("RGB", (tw * cols, th * rows))
for i, im in enumerate(ims):
    t = im.resize((tw, th), Image.LANCZOS); ImageDraw.Draw(t).text((6, 6), os.path.splitext(os.path.basename(fs[i]))[0], fill=(255, 255, 0)); o.paste(t, (tw * (i % cols), th * (i // cols)))
o.save(out, quality=int(os.environ.get("SHEET_Q", 84))); print(out, o.size, len(ims))
