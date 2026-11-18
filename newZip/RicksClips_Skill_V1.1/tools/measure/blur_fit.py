"""Depth-of-field measurement (method: references/reports/depth.md section 1.1).

Edge-spread fits: at strong edges, a 1D profile across the edge is fitted with
a + b*Phi((t-t0)/sigma) over a sigma grid; fits kept if relative RMS <= 0.07.
Per 40 px tile, the 30th percentile of its edge sigmas. Reports per-frame:
sharp baseline (p10 of edge sigmas), above-band medians, tile map summary.

Sigmas are in 720p px (inputs resized to 720-wide equivalent). Blur disc radius
at 1080p ~ 3 x sigma720.

Usage: python blur_fit.py frame.png [frame2.png ...] [--nocaptions] [--json out]
Reference: sharp baseline p10 = 0.33 (IQR 0.30-0.37); backgrounds when DOF on:
CU 4.2, MS 4.0, FS 2.7, WS 1.9; foregrounds 3.7-7.8.
"""
import sys, json, numpy as np
sys.path.insert(0, __file__.rsplit("\\", 1)[0] if "\\" in __file__ else ".")
from vidio import caption_mask, luma
from PIL import Image
from scipy import ndimage
from math import erf

SIGMAS = np.exp(np.linspace(np.log(0.25), np.log(16), 28))
HALF = 12  # profile half-length px


def esf_templates():
    t = np.arange(-HALF, HALF + 1, 1.0)
    return [np.array([0.5 * (1 + erf(x / (s * np.sqrt(2)))) for x in t]) for s in SIGMAS]


TEMPL = esf_templates()


def fit_sigma(prof):
    """Fit a + b*ESF_sigma(t); return (sigma, relRMS) of best."""
    best = (None, 1e9)
    rng = prof.max() - prof.min()
    if rng < 0.08:
        return None
    for s, T in zip(SIGMAS, TEMPL):
        # least squares a + b*T
        A = np.stack([np.ones_like(T), T], 1)
        sol, *_ = np.linalg.lstsq(A, prof, rcond=None)
        r = prof - A @ sol
        rel = np.sqrt((r ** 2).mean()) / rng
        if rel < best[1]:
            best = (float(s), rel)
    return best if best[1] <= 0.07 else None


def analyze(path, mask_captions=True):
    # resize to 720-wide equivalent so sigmas are in 720p px
    im = Image.open(path).convert("L")
    if im.width != 720:
        im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
    Y = np.asarray(im, np.float32) / 255
    H, W = Y.shape
    keep = caption_mask(H) if mask_captions else np.ones(H, bool)
    gx = ndimage.sobel(Y, 1); gy = ndimage.sobel(Y, 0)
    g = np.hypot(gx, gy)
    thr = max(0.25, np.percentile(g, 98))
    ys, xs = np.where((g > thr) & keep[:, None])
    # subsample edges
    if len(ys) > 4000:
        idx = np.random.default_rng(0).choice(len(ys), 4000, replace=False)
        ys, xs = ys[idx], xs[idx]
    sig_map = {}
    for y, x in zip(ys, xs):
        if y < HALF or y >= H - HALF or x < HALF or x >= W - HALF:
            continue
        ang = np.arctan2(gy[y, x], gx[y, x])
        dx, dy = np.cos(ang), np.sin(ang)
        t = np.arange(-HALF, HALF + 1)
        xi = np.clip((x + dx * t).astype(int), 0, W - 1)
        yi = np.clip((y + dy * t).astype(int), 0, H - 1)
        prof = Y[yi, xi]
        if prof[-1] < prof[0]:
            prof = prof[::-1]
        r = fit_sigma(prof)
        if r:
            sig_map.setdefault((y // 40, x // 40), []).append(r[0])
    tile30 = {k: float(np.percentile(v, 30)) for k, v in sig_map.items() if len(v) >= 3}
    allsig = np.concatenate([np.array(v) for v in sig_map.values()]) if sig_map else np.array([])
    if not len(allsig):
        return {"error": "no fit-able edges"}
    tiles = np.array(list(tile30.values()))
    return {
        "edges_fit": int(len(allsig)),
        "sharp_baseline_p10": round(float(np.percentile(allsig, 10)), 2),
        "sigma_median": round(float(np.median(allsig)), 2),
        "tile30_median": round(float(np.median(tiles)), 2) if len(tiles) else None,
        "tile30_p90": round(float(np.percentile(tiles, 90)), 2) if len(tiles) else None,
        "pct_tiles_blurred": round(100 * float((tiles > 1.2).mean()), 1) if len(tiles) else None,
        "note": "R@1080p ~ 3 x sigma720",
    }


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    nocap = "--nocaptions" in sys.argv
    out = {p.rsplit("\\", 1)[-1].rsplit("/", 1)[-1]: analyze(p, not nocap) for p in args}
    s = json.dumps(out, indent=1)
    print(s)
    if "--json" in sys.argv:
        open(sys.argv[sys.argv.index("--json") + 1], "w").write(s)
