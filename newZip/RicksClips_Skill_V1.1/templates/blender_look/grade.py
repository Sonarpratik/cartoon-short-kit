"""Grade per preset (post on the rendered PNG, system Python; same presets as look.py). Run with no Blender:
    python grade.py raw.png out.png --preset night [--vig 0.5]
    python grade.py raw.png out.png --preset day --fit-vig      solves the vignette for corner/centre 0.67 on this still; print it, then keep that value for the whole shot (never per frame, it would flicker)
Targets from his 3 newest videos: black (7,4,15), shadows a* +6 b* -8 (night runs bluer), vignette 0.67, no grain, saturation under 1.3.
Corrections baked in after the approved round 3: a bloom threshold of 0.8 and a highlight lift only on near-neutral pixels, so lamps stay warm instead of clipping to white."""
import sys
import numpy as np
from PIL import Image, ImageFilter

LUM = np.array([.2126, .7152, .0722], np.float32)
P = {
    "night":    dict(gain=1.22, sat=1.12, vig=.62, pull=(.016, .008, .082), tint=(.004, -.004, .006), shadow_desat=0),   # matches the approved stills; less blue also greyed the clouds
    "morning":  dict(gain=1.04, sat=1.27, vig=.45, pull=(.1, .075, .15), tint=(-.006, -.002, .05), shadow_desat=0, vig_target=.78),
    "day":      dict(gain=1.05, sat=1.15, vig=.42, pull=(.12, .065, .11), tint=(.006, -.003, .012), shadow_desat=.1, vig_target=.78),
    "golden":   dict(gain=1.05, sat=1.24, vig=.5, pull=(.14, .11, .08), tint=(.0, -.006, .09), shadow_desat=.35),
    "interior": dict(gain=1.05, sat=1.08, vig=.45, pull=(.012, .01, .03), tint=(.006, -.003, .01), shadow_desat=.15),
}
BLACK = np.array([7, 4, 15], np.float32) / 255

def bloom(a, thr=.8, k=.6):
    Y = a @ LUM; hot = a * np.clip((Y - thr) / (1 - thr), 0, 1)[..., None]; h, w = Y.shape
    s = Image.fromarray((np.clip(hot, 0, 1) * 255).astype(np.uint8)).resize((w // 4, h // 4), Image.BILINEAR); acc = np.zeros_like(a)
    for r, wt in ((3, .55), (10, .4), (30, .3)):
        acc += np.asarray(s.filter(ImageFilter.GaussianBlur(r)).resize((w, h), Image.BILINEAR)).astype(np.float32) / 255 * wt
    return a + acc * k

def _vignette(a, vig):
    h, w = a.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32); r2 = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - .48 * h) / (h / 2)) ** 2
    return BLACK + (a - BLACK) * (1 - vig * np.clip(r2 / 1.6, 0, 1) ** 1.1)[..., None]

def base(a, p):
    a = np.clip(a * p["gain"], 0, 1); Y = (a @ LUM)[..., None]
    sat_px = (a.max(-1, keepdims=True) - a.min(-1, keepdims=True)) / np.maximum(a.max(-1, keepdims=True), 1e-3)
    a = a * (1 + .3 * np.clip((Y - .9) / .08, 0, 1) * np.clip(1 - sat_px / .25, 0, 1))
    a = np.clip(Y + (a - Y) * p["sat"], 0, 1); s = np.clip(1 - Y / .35, 0, 1) ** 1.5
    a = Y + (a - Y) * (1 - p["shadow_desat"] * s)        # measured: raw night shadows were about 2x too blue
    a = a + np.array(p["tint"], np.float32) * s - np.array(p["pull"], np.float32) * np.clip(1 - Y / .4, 0, 1)
    return BLACK + (1 - BLACK) * np.clip(a, 0, 1)

def corner_centre(a):
    Y = .299 * a[..., 0] + .587 * a[..., 1] + .114 * a[..., 2]; H, W = Y.shape; c = Y[int(.35 * H):int(.65 * H), int(.3 * W):int(.7 * W)].mean(); q = int(.12 * W)
    return float(np.concatenate([Y[:q, :q].ravel(), Y[:q, -q:].ravel(), Y[-q:, :q].ravel(), Y[-q:, -q:].ravel()]).mean() / c)

def fit_vig(a, preset, target=.67):
    s = np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).resize((270, 480))).astype(np.float32) / 255; b = base(bloom(s), P[preset]); lo, hi = 0.0, .95
    for _ in range(14):
        m = (lo + hi) / 2
        if corner_centre(_vignette(b, m)) > target: lo = m
        else: hi = m
    return round((lo + hi) / 2, 3)

def grade(a, preset="night", vig=None):
    return np.clip(_vignette(base(bloom(a), P[preset]), P[preset]["vig"] if vig is None else vig), 0, 1)

if __name__ == "__main__":
    A = sys.argv[1:]; pre = A[A.index("--preset") + 1] if "--preset" in A else "night"; v = float(A[A.index("--vig") + 1]) if "--vig" in A else None
    a = np.asarray(Image.open(A[0]).convert("RGB")).astype(np.float32) / 255
    if "--fit-vig" in A: v = fit_vig(a, pre, P[pre].get("vig_target", .67)); print("fitted vignette", v)
    Image.fromarray((grade(a, pre, v) * 255 + .5).astype(np.uint8)).save(A[1]); print("graded", A[1], "preset", pre, "vig", v if v is not None else P[pre]["vig"])
