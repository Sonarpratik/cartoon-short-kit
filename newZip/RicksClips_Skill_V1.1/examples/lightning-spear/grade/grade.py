# FINAL grade for "Why The Safest Tower Had A Spear On Top". CPU only (numpy + scipy), no graphics card.
# Method from episodes/armor-no-holes/grade_final/grade.py: one grade per light kind, a pure colour-to-colour map per
# pixel (no vignette, blur or grain, so it cannot flicker), plus:
#   - a soft haze lift of the darkest tones (curve starts above 0),
#   - a NIGHT FLOOR for G and H: a frame whose graded mean is under FLOOR gets a smooth extra lift until it reaches it,
#   - guards: reds/fire orange (no gain), faces and near-whites (identity), caption letters (pure white kept, black
#     outline kept), the cold blue-white glint (identity, never pushed to flat 255), soft ceiling.
# Light kind per frame from lights.json; 10-frame joins and the loop tail blend the two kinds' gradings.
# API for join.py:  grade_u8(uint8 HxWx3, film_frame) -> uint8 HxWx3
import os, json
import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)
STRIP = 64
L = json.load(open(os.path.join(HERE, "lights.json")))
SPANS = [(s["kind"], s["first"], s["last"]) for s in L["spans"]]
HALF, LOOP_N, TOTAL = L["blend_half"], L["loop_tail"], SPANS[-1][2] + 1
CUTS = set(L["hard_cuts"])
FLOOR = 0.322            # night floor target (rule: never under 0.31; small margin for the MP4)
CAP0, CAP1 = int(0.655 * 1920), int(0.745 * 1920)

# ---- numbers per light kind ------------------------------------------------------------------------------
# curve: luminance map (x -> y), first point = haze lift of the darkest tone.  sat: colour gain on weak colours
# (gain falls with existing strength, power satp, so strong colours are never pushed).  sh/mid/hi: tint per tone band
# (luma-neutral).  warm: extra gain factor for warm hues (H: 1.0 keeps fire the only orange).  cool: gain factor sky/shade.
P = json.load(open(os.path.join(HERE, "params.json")))


def kind_of(f):
    for k, a, b in SPANS:
        if a <= f <= b:
            return k
    raise ValueError(f)


def kind_weights(f):
    """[(kind, weight)] for film frame f: blends at kind changes (B-5..B+4, join.py's weights), loop tail into A."""
    out = {}
    k = kind_of(f)
    w = [(k, 1.0)]
    for i in range(1, len(SPANS)):
        B = SPANS[i][1]
        if B in CUTS or SPANS[i - 1][0] == SPANS[i][0]:
            continue
        if B - HALF <= f < B + HALF:
            t = (f - (B - HALF) + 0.5) / (2 * HALF)
            w = [(SPANS[i - 1][0], 1 - t), (SPANS[i][0], t)]
    if f >= TOTAL - LOOP_N:
        t = (f - (TOTAL - LOOP_N) + 1) / (LOOP_N + 1)
        w = [(kk, ww * (1 - t)) for kk, ww in w] + [(SPANS[0][0], t)]
    for kk, ww in w:
        out[kk] = out.get(kk, 0) + ww
    return list(out.items())


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def hue_deg(rgb, mx, mn):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    d = np.maximum(mx - mn, 1e-5)
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4))
    return h * 60


def guards(rgb, p=None):
    """per-pixel guard masks from the UNGRADED pixel: red/orange, skin, keep-white (faces, paper, letters), glint"""
    Y = rgb @ LUMA
    mx, mn = rgb.max(-1), rgb.min(-1)
    S = (mx - mn) / np.maximum(mx, 1e-4)
    H = hue_deg(rgb, mx, mn)
    hd = np.minimum(H, 360 - H)                                        # distance from pure red
    p = p or {}
    h0, h1 = p.get("red_h", (10, 20))                                  # madder cap, red cloth (terracotta is NOT guarded)
    red = (1 - sstep(h0, h1, hd)) * sstep(0.40, 0.55, S)
    if p.get("terra"):                                                 # terracotta roofs / orange walls keep their built colour
        red = np.maximum(red, p["terra"] * sstep(6, 10, H) * (1 - sstep(38, 46, H)) * sstep(0.40, 0.55, S))
    if p.get("fire"):                                                  # H: the fire orange stays exactly as built
        red = np.maximum(red, sstep(12, 18, H) * (1 - sstep(44, 52, H)) * sstep(0.55, 0.70, S) * sstep(0.40, 0.55, Y))
    skin = sstep(0.50, 0.65, Y) * sstep(5, 12, H) * (1 - sstep(40, 55, H)) * sstep(0.07, 0.12, S) * (1 - sstep(0.34, 0.44, S))
    # faces: clean white AND the template's soft grey shade side (CB: "the shadow on his face"): low colour, light
    keepw = sstep(0.62, 0.80, Y) * (1 - sstep(0.06, 0.14, S))
    glint = sstep(186, 194, H) * (1 - sstep(214, 224, H)) * sstep(0.68, 0.80, Y) * sstep(0.10, 0.18, S)
    return Y, S, H, red, skin, np.maximum(keepw, glint)


def grade(rgb, p, g):
    """rgb float32 (...,3) 0..1, p = params of one kind, g = guards -> graded float32"""
    Y, S, H, red, skin, keep = g
    xs, ys = zip(*p["curve"])
    Y2 = np.interp(Y, xs, ys).astype(np.float32)
    Y2 = Y2 * (1 - red) + np.clip(Y2, Y * 0.96 + 0.01, Y * 1.06 + 0.02) * red          # reds: small lift only
    ratio = np.minimum(Y2 / np.maximum(Y, 1e-4), 4.0)
    tone = rgb * ratio[..., None]
    tone += (Y2 - tone @ LUMA)[..., None]
    gain = 1 + (p["sat"] - 1) * (1 - S) ** p["satp"]
    cw = sstep(150, 185, H) * (1 - sstep(275, 300, H))                                    # sky, shade, night blue
    ww = (1 - sstep(48, 62, np.minimum(H, 360 - H)))                                       # warm hues (not red-guarded)
    gain = gain * (1 + (p.get("cool", 1.0) - 1) * cw * (1 - S)) * (1 + (p.get("warm", 1.0) - 1) * ww)
    gain = gain * (1 - skin) + p.get("skin", 1.0) * skin
    gain = gain * (1 - red) + red
    out = Y2[..., None] + (tone - Y2[..., None]) * gain[..., None]
    wsh = 1 - sstep(0.10, 0.45, Y2)
    whi = sstep(0.55, 0.85, Y2) * (1 - sstep(0.90, 1.0, Y2))
    wmid = 1 - wsh - sstep(0.55, 0.85, Y2)
    free = (1 - red) * (1 - skin)
    for w, key in ((wsh, "sh"), (wmid, "mid"), (whi, "hi")):
        t = np.array(p[key], np.float32); t = t - t @ LUMA
        out += (w * free)[..., None] * t
    # soft HAZE lift: an additive coloured veil that fades out by Y2 = haze_to (lifts the darkest 1 %, calms the
    # strong dark colours, mids and highlights untouched)
    if "haze" in p:
        hw = (1 - sstep(0.0, p.get("haze_to", 0.45), Y2)) * (1 - 0.5 * red)
        out += hw[..., None] * np.array(p["haze"], np.float32)
    return out


def finish(out, rgb, keep, top=0.975, knee=0.90):
    out = out * (1 - keep[..., None]) + rgb * keep[..., None]
    Yo = np.clip(out @ LUMA, 0, 1)
    hi, lo = out.max(-1), out.min(-1)
    hs = np.where(hi > knee, knee + (top - knee) * np.tanh((hi - knee) / (top - knee)), hi)
    k = np.ones_like(Yo)
    over = (hi > knee) & (hi > Yo)
    k[over] = np.clip((hs[over] - Yo[over]) / np.maximum(hi[over] - Yo[over], 1e-5), 0, 1)
    under = lo < 0
    k[under] = np.minimum(k[under], Yo[under] / np.maximum(Yo[under] - lo[under], 1e-5))
    k = k * (1 - keep) + keep
    out = Yo[..., None] + (out - Yo[..., None]) * k[..., None]
    return np.clip(out, 0, 1)


def _grade_all(a, kw, lift=0.0):
    o = np.empty_like(a)
    for y in range(0, a.shape[0], STRIP):
        f = a[y:y + STRIP].astype(np.float32) / 255
        gs = {k: guards(f, P[k]) for k, _ in kw}
        out = sum(w * grade(f, P[k], gs[k]) for k, w in kw)
        g = gs[kw[0][0]]
        if lift > 0:                                   # night floor: smooth lift (gamma on luminance, darks most)
            Yo = np.clip(out @ LUMA, 1e-4, 1)
            Yn = Yo ** (1 - lift)
            out = out * (Yn / Yo)[..., None]
        o[y:y + STRIP] = (finish(out, f, g[5]) * 255 + 0.5).astype(np.uint8)
    return o


def grade_u8(a, f):
    kw = kind_weights(f)
    o = _grade_all(a, kw)
    if any(k in ("G", "H") for k, _ in kw):
        m = (o[::8, ::8].astype(np.float32) / 255 @ LUMA).mean()
        if m < FLOOR:
            sm = a[::4, ::4]
            lo, hi = 0.0, 0.6
            for _ in range(9):                         # bisection on a quarter-size copy
                mid = (lo + hi) / 2
                mm = (_grade_all(sm, kw, mid)[::2, ::2].astype(np.float32) / 255 @ LUMA).mean()
                lo, hi = (mid, hi) if mm < FLOOR else (lo, mid)
            o = _grade_all(a, kw, hi)
    white = (a == 255).all(-1)
    o[white] = 255                                     # caption letters stay pure white ...
    o[(o == 255).all(-1) & ~white] = 254               # ... and nothing else becomes pure white
    # caption black outline: inside the caption band, pixels next to the letters keep their ungraded value
    band = white[CAP0:CAP1]
    if band.any():
        ring = ndi.binary_dilation(band, iterations=5) & ~band
        ab = a[CAP0:CAP1]
        ring &= (ab.astype(np.float32) @ LUMA) < 0.18 * 255
        sub = o[CAP0:CAP1]; sub[ring] = ab[ring]
    return o
