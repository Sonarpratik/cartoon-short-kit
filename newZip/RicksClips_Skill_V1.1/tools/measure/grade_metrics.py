"""Colour/tone metrics (method: references/reports/grade.md section 1).

Per frame (caption band masked): Y' percentiles (Rec.709 weights on encoded sRGB),
HSV S stats (V > 0.15), lit chroma C*ab p50/p90 (L* 40-85, non-ink), black point
(mean RGB of darkest 0.5 %), vignette corner/centre, ink mask = black top-hat.

Usage:
  python grade_metrics.py video.mp4 --every 15        # sample every 15th frame
  python grade_metrics.py img1.png img2.png ...       # stills
Reference day targets: Y'p50 0.571, non-ink p5 0.234, p99 0.967, lit C* p90 ~55,
black point warm ~(35,19,20)/255, corner/centre 0.86. Per-video medians (STYLE_BIBLE):
lum mean 0.43-0.54, HSV sat 0.38-0.65.
"""
import sys, json, numpy as np
sys.path.insert(0, __file__.rsplit("\\", 1)[0] if "\\" in __file__ else ".")
from vidio import frames, caption_mask, luma
from PIL import Image
from scipy import ndimage


def srgb_to_lab(rgb):
    r = np.where(rgb > 0.04045, ((rgb + 0.055) / 1.055) ** 2.4, rgb / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = r @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return L, a, b


def frame_metrics(rgb, mask_captions=True):
    h = rgb.shape[0]
    if mask_captions:
        rgb = rgb[caption_mask(h)]
    Y = luma(rgb)
    # ink mask: black top-hat (7x7 closing - Y > 0.12) AND Y < 0.30
    cl = ndimage.grey_closing(Y, size=(7, 7))
    ink = ((cl - Y) > 0.12) & (Y < 0.30)
    noink = ~ndimage.binary_dilation(ink, iterations=1)
    mx = rgb.max(-1); mn = rgb.min(-1)
    sat = np.where(mx > 1e-6, (mx - mn) / (mx + 1e-9), 0)
    vsel = mx > 0.15
    L, a, b = srgb_to_lab(rgb)
    C = np.hypot(a, b)
    lit = (L >= 40) & (L <= 85) & noink
    k = max(1, int(0.005 * Y.size))
    dark_idx = np.argpartition(Y.ravel(), k)[:k]
    bp = rgb.reshape(-1, 3)[dark_idx].mean(0)
    # vignette (on the full frame incl. caption rows would bias; use masked grid)
    hh, ww = Y.shape
    yy, xx = np.mgrid[0:hh, 0:ww]
    r = np.hypot((xx - ww / 2) / (ww / 2), (yy - hh / 2) / (hh / 2)) / np.sqrt(2)
    corner = Y[r >= 0.9].mean() if (r >= 0.9).any() else np.nan
    centre = Y[r < 0.3].mean()
    # dark-zone Lab b* (shadow hue: negative = blue/violet, positive = brown/yellow)
    shad = (Y < 0.3) & noink
    return {
        "Yp": {str(p): round(float(np.percentile(Y, p)), 3) for p in (1, 5, 25, 50, 75, 95, 99)},
        "Ymean": round(float(Y.mean()), 3),
        "noink_p5": round(float(np.percentile(Y[noink], 5)), 3),
        "noink_p50": round(float(np.percentile(Y[noink], 50)), 3),
        "sat_mean": round(float(sat[vsel].mean()), 3),
        "sat_p50": round(float(np.percentile(sat[vsel], 50)), 3),
        "litC_p50": round(float(np.percentile(C[lit], 50)), 1) if lit.any() else None,
        "litC_p90": round(float(np.percentile(C[lit], 90)), 1) if lit.any() else None,
        "black_point": [round(float(v * 255), 1) for v in bp],
        "corner_over_centre": round(float(corner / (centre + 1e-9)), 3),
        "dark_bstar_mean": round(float(b[shad].mean()), 1) if shad.any() else None,
        "ink_pct": round(100 * float(ink.mean()), 2),
    }


def agg(ms):
    out = {}
    for k in ms[0]:
        if k == "Yp":
            out["Yp"] = {p: round(float(np.median([m["Yp"][p] for m in ms])), 3) for p in ms[0]["Yp"]}
        elif k == "black_point":
            out[k] = [round(float(np.median([m[k][i] for m in ms])), 1) for i in range(3)]
        else:
            vals = [m[k] for m in ms if m[k] is not None]
            out[k] = round(float(np.median(vals)), 3) if vals else None
    out["n_frames"] = len(ms)
    return out


if __name__ == "__main__":
    argv = sys.argv[1:]
    skip = {argv[i + 1] for i, a in enumerate(argv) if a in ("--json", "--every") and i + 1 < len(argv)}
    args = [a for a in argv if not a.startswith("--") and a not in skip]
    every = int(sys.argv[sys.argv.index("--every") + 1]) if "--every" in sys.argv else 15
    nocap = "--nocaptions" in sys.argv  # for OUR stills (no burned captions)
    out = {}
    for p in args:
        if p.lower().endswith((".png", ".jpg", ".jpeg")):
            rgb = np.asarray(Image.open(p).convert("RGB"), np.float32) / 255
            if rgb.shape[0] > 960:
                im = Image.open(p).convert("RGB")
                im = im.resize((im.width * 960 // im.height, 960))
                rgb = np.asarray(im, np.float32) / 255
            out[p.rsplit("\\", 1)[-1].rsplit("/", 1)[-1]] = frame_metrics(rgb, mask_captions=not nocap)
        else:
            ms = []
            for i, f in enumerate(frames(p, 540, 960, gray=False)):
                if i % every == 0:
                    ms.append(frame_metrics(f, mask_captions=not nocap))
            out[p.rsplit("\\", 1)[-1].rsplit("/", 1)[-1]] = agg(ms)
    s = json.dumps(out, indent=1)
    print(s)
    if "--json" in sys.argv:
        open(sys.argv[sys.argv.index("--json") + 1], "w").write(s)
