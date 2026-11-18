"""Round 3 post (SKILL.md 3D WORLD STYLE grade): bloom on practicals and speculars, cool near-black, blue shadows,
vignette about 0.67, saturation well under 1.3, no grain.   python post_v3.py raw.png out.png"""
import sys
import numpy as np
from PIL import Image, ImageFilter

GAIN, GAMMA, SAT, VIG = 1.22, 1.0, 1.12, 0.62
BLACK = np.array([7, 4, 15], np.float32) / 255      # target black point
SHADOW = np.array([0.004, -0.004, 0.006], np.float32)   # blue, slightly red: a* about +6, b* about -8

def bloom(a, thr=0.72, k=0.6):
    Y = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    hot = a * np.clip((Y - thr) / (1 - thr), 0, 1)[..., None]
    h, w = Y.shape; small = Image.fromarray((np.clip(hot, 0, 1) * 255).astype(np.uint8)).resize((w // 4, h // 4), Image.BILINEAR)
    acc = np.zeros_like(a)
    for r, wt in ((3, 0.55), (10, 0.4), (30, 0.3)):
        acc += np.asarray(small.filter(ImageFilter.GaussianBlur(r)).resize((w, h), Image.BILINEAR)).astype(np.float32) / 255 * wt
    return a + acc * k

def grade(a):
    a = np.clip(a * GAIN, 0, 1) ** GAMMA
    Y = (a @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
    a = a * (1 + 0.4 * np.clip((Y - 0.68) / 0.22, 0, 1))   # practicals and the moon clip, as in his engine look
    a = np.clip(Y + (a - Y) * SAT, 0, 1)
    s = np.clip(1 - Y / 0.35, 0, 1) ** 1.5                 # shadows only
    a = a + SHADOW * s
    a = a - np.array([0.016, 0.008, 0.082], np.float32) * np.clip(1 - Y / 0.4, 0, 1)   # raw shadows sit too blue: pull to the near-black
    a = BLACK + (1 - BLACK) * np.clip(a, 0, 1)             # floor at the cool near-black
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r2 = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - 0.48 * h) / (h / 2)) ** 2
    v = (1 - VIG * np.clip(r2 / 1.6, 0, 1) ** 1.1)[..., None]
    a = BLACK + (a - BLACK) * v
    return np.clip(a, 0, 1)

if __name__ == "__main__":
    a = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(np.float32) / 255
    Image.fromarray((grade(bloom(a)) * 255 + 0.5).astype(np.uint8)).save(sys.argv[2]); print("graded", sys.argv[2])
