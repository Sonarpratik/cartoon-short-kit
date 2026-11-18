"""draw the 6x10 empty-space grid on a still: red = empty cell (fails G3), grey = caption band (masked)."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "measure"))
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
import empty_space as E
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB"); a = np.asarray(im.resize((E.W, E.H), Image.LANCZOS)).astype(np.float32) / 255
Y = a @ np.array([0.2126, 0.7152, 0.0722], np.float32); e = np.hypot(ndimage.sobel(Y, 1), ndimage.sobel(Y, 0)) / 4 > 0.08
out = im.resize((E.W, E.H)); d = ImageDraw.Draw(out, "RGBA"); cw, ch = E.W // E.GX, E.H // E.GY
for j in range(E.GY):
    y0 = j * ch
    if y0 / E.H >= E.CAP[0] - 0.02 and (y0 + ch) / E.H <= E.CAP[1] + 0.02:
        d.rectangle([0, y0, E.W, y0 + ch], fill=(128, 128, 128, 90)); continue
    for i in range(E.GX):
        c = (slice(y0, y0 + ch), slice(i * cw, (i + 1) * cw)); em = e[c].mean() < 0.02 and Y[c].std() < 0.035
        d.rectangle([i * cw, y0, (i + 1) * cw - 1, y0 + ch - 1], outline=(255, 40, 40, 255) if em else (255, 255, 255, 50), width=3 if em else 1)
        if em: d.rectangle([i * cw, y0, (i + 1) * cw - 1, y0 + ch - 1], fill=(255, 0, 0, 60))
out.save(dst)
