"""Head shape measurement (simplified from references/reports/characters.md 1.1).

Input: a crop containing ONE pale cartoon head on a darker/colourful surround
(crop it so the head fills most of the image). The head is segmented as the
largest bright blob; the contour's width profile gives:
  H/W            (ref front median 0.93; ours was 1.17)
  chin_taper     width at 20 % from bottom / max width (ref has egg ~ -0.125 -> taper < 1)
  crown_point    width at 10 % from top / width at 30 % from top (< 1 = pointed crown)
  asym           |centroid_x - bbox centre| / W  (ref ~ +0.10 bulge to facing side)

Usage: python head_fit.py headcrop.png [more.png ...]
"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage


def fit(path):
    im = Image.open(path).convert("RGB")
    if im.width > 400:
        im = im.resize((400, im.height * 400 // im.width))
    rgb = np.asarray(im, np.float32) / 255
    Y = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    sat = (rgb.max(-1) - rgb.min(-1)) / (rgb.max(-1) + 1e-6)
    bright = (Y > 0.62) & (sat < 0.45)
    lab, n = ndimage.label(bright)
    if n == 0:
        return {"error": "no pale blob found"}
    sizes = ndimage.sum(bright, lab, range(1, n + 1))
    blob = lab == (1 + int(np.argmax(sizes)))
    blob = ndimage.binary_fill_holes(ndimage.binary_closing(blob, iterations=2))
    ys, xs = np.where(blob)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    Hh, Ww = y1 - y0 + 1, x1 - x0 + 1
    rows = np.arange(y0, y1 + 1)
    widths = np.array([blob[y].sum() for y in rows], float)
    maxw = widths.max()
    def w_at(frac_from_top):
        return widths[int(np.clip(frac_from_top * (len(rows) - 1), 0, len(rows) - 1))]
    cx = xs.mean()
    return {
        "H_over_W": round(Hh / Ww, 3),
        "chin_taper": round(float(w_at(0.80) / maxw), 3),
        "crown_point": round(float(w_at(0.10) / max(1.0, w_at(0.30))), 3),
        "asym": round(float(abs(cx - (x0 + x1) / 2) / Ww), 3),
        "blob_px": int(blob.sum()),
    }


if __name__ == "__main__":
    print(json.dumps({p.rsplit("\\", 1)[-1].rsplit("/", 1)[-1]: fit(p) for p in sys.argv[1:]}, indent=1))
