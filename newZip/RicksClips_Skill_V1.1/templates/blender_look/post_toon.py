"""Stage A grade (round-2 airfield grade, per light): bloom, gentle saturation, cool shadows, light vignette.  python post_toon.py raw.png out.png day"""
import sys
import numpy as np
from PIL import Image, ImageFilter
LUM = np.array([.2126, .7152, .0722], np.float32)
P = dict(night=(1.03, 1.16, .08, .3, .25), morning=(1.02, 1.12, .03, .22, .1), day=(1.02, 1.12, .02, .2, .05), golden=(1.0, .92, .05, .22, .1), interior=(1.03, 1.12, .04, .28, .05))
def bloom(a, thr=.78, k=.42):
    Y = a @ LUM; hot = a * np.clip((Y - thr) / (1 - thr), 0, 1)[..., None]; h, w = Y.shape; s = Image.fromarray((np.clip(hot, 0, 1) * 255).astype(np.uint8)).resize((w // 4, h // 4), Image.BILINEAR); acc = np.zeros_like(a)
    for r, wt in ((3, .5), (9, .35), (24, .25)): acc += np.asarray(s.filter(ImageFilter.GaussianBlur(r)).resize((w, h), Image.BILINEAR)).astype(np.float32) / 255 * wt
    return a + acc * k
def grade(a, pre):
    g, sat, blue, vig, top = P[pre]; a = np.clip(a * g, 0, 1); Y = (a @ LUM)[..., None]; a = Y + (a - Y) * sat; a[..., 2] += blue * (1 - Y[..., 0]); a[..., 0] -= blue * .5 * (1 - Y[..., 0])
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); r2 = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - .46 * h) / (h / 2)) ** 2; a *= (1 - vig * np.clip(r2, 0, 1.6) ** 1.2)[..., None]
    t = np.clip(yy[:, 0] / (.5 * h), 0, 1); a *= (1 - top * (1 - t * t * (3 - 2 * t)))[:, None, None]; return np.clip(a, 0, 1)
a = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(np.float32) / 255
Image.fromarray((grade(bloom(a), sys.argv[3]) * 255 + .5).astype(np.uint8)).save(sys.argv[2]); print("graded", sys.argv[2])
