"""QUALITY METRICS (2026-11-07): "full" is not "fine". Two numbers that density alone cannot see.

All at 540x960 luma, caption band (62-78 % H) masked.
  surface pixels = not ink (no pixel darker than 0.07 within 2 px) and not an object edge (Sobel g/4 <= 0.08)
  hf_surface   mean |Y - gauss(Y, 1.0)| x 100 over surface pixels. Blocky / pixel-noisy painting reads HIGH,
               flat plastic reads ~0; soft painted surfaces sit in the reference band.
  lc_surface   mean local std (7x7) x 100 over surface pixels: painted variation (flat = 0).
  haze_lift    p10 luma of surface pixels in the far band (rows 28-50 %) minus p10 in the near band (rows 80-100 %)
               x 100. Distance lifted toward the horizon colour reads positive; a crisp, unhazed distance reads ~0 or below.
  far_contrast (p90-p10) far band / (p90-p10) near band: < 1 when the distance is hazed back.

Usage: python quality_metrics.py img... [--json out.json]
       python quality_metrics.py --reference   (measures the reference night frames -> references/measure/quality_night.json)
"""
import sys, os, json, glob
import numpy as np
from PIL import Image
from scipy import ndimage
ni_label = ndimage.label

W, H = 540, 960
CAP = (0.62, 0.78)
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

def metrics(img):
    a = np.asarray(img.convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    Y = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    g = np.hypot(ndimage.sobel(Y, 1), ndimage.sobel(Y, 0)) / 4
    ink = ndimage.binary_dilation(Y < 0.07, iterations=2)
    surf = (~ink) & (g <= 0.08)
    surf[int(CAP[0] * H):int(CAP[1] * H)] = False
    hf = np.abs(Y - ndimage.gaussian_filter(Y, 1.0))
    m = ndimage.uniform_filter(Y, 7); m2 = ndimage.uniform_filter(Y * Y, 7); lc = np.sqrt(np.clip(m2 - m * m, 0, None))
    rows = np.arange(H)[:, None] / H
    far = surf & (rows >= 0.28) & (rows < 0.50); near = surf & (rows >= 0.80)
    def p(mask, q): return float(np.percentile(Y[mask], q)) if mask.sum() > 200 else float("nan")
    fr = p(far, 90) - p(far, 10); nr = p(near, 90) - p(near, 10)
    # 3d haze: big dark objects in the far band (an aircraft, a wall in shade) are not distance; judge the rest of the band
    dark = (Y < max(.04, p(far, 50) * .65)) & far; lab, n = ni_label(dark)
    far2 = far.copy()
    if n:
        sz = np.bincount(lab.ravel()); big = np.nonzero(sz >= .004 * W * H)[0]; big = big[big > 0]; far2[np.isin(lab, big)] = False
    masked = (p(far2, 10) - p(near, 10)) * 100
    return {"hf_surface": round(float(hf[surf].mean() * 100), 3), "lc_surface": round(float(lc[surf].mean() * 100), 3),
            "haze_lift": round((p(far, 10) - p(near, 10)) * 100, 2), "haze_masked": round(masked, 2), "far_contrast": round(fr / nr, 3) if nr > 1e-4 else float("nan"),
            "surface_share": round(float(surf.mean()), 3)}

def reference():
    P = json.load(open(os.path.join(ROOT, "references", "remeasure", "data", "frames_pass.json")))
    night = [x for x in P if x["grade"]["Yp"]["50"] <= 0.25 and x["grade"].get("dark_bstar_mean", 0) < -10]
    rows = []
    for x in night:
        f = os.path.join(ROOT, "references", "frames", x["ep"], x["f"])
        if not os.path.exists(f):
            alt = glob.glob(os.path.splitext(f)[0] + ".*")
            if not alt: continue
            f = alt[0]
        rows.append(metrics(Image.open(f)))
    out = {"n": len(rows)}
    for k in rows[0]:
        v = np.array([r[k] for r in rows], float); v = v[np.isfinite(v)]
        out[k] = {q: round(float(np.percentile(v, q)), 3) for q in (10, 25, 50, 75, 90)}
    json.dump(out, open(os.path.join(ROOT, "references", "measure", "quality_night.json"), "w"), indent=1)
    print(json.dumps(out, indent=1))

if __name__ == "__main__":
    a = sys.argv[1:]
    if "--reference" in a: reference(); sys.exit()
    out = a[a.index("--json") + 1] if "--json" in a else None
    files = [x for x in a if not x.startswith("--") and x != out]
    R = {f: metrics(Image.open(f)) for f in files}
    for f, m in R.items(): print(f.replace("\\", "/").split("/")[-1], m)
    if out: json.dump(R, open(out, "w"), indent=1)
