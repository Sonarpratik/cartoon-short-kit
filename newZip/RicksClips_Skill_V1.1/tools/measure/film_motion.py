"""Camera motion of a finished or preview video, the same instrument that measured Rick's 24 Shorts.
Raw pass = references/remeasure/cine_2026-11-09/scripts/cine_raw.py (9-tile similarity fit + luma histogram, caption band masked),
statistics = episodes/card-maker-ban/analysis/motion.py. Both copied here so tools/ no longer depends on an episode folder.
Speed is px per frame at 720x1280, 30 fps: hypot(translation, zoom x 734). "At rest" = under 2 px/f.
    python tools/measure/film_motion.py <video.mp4> [words.json]     prints the numbers as JSON
"""
import os, sys, json, subprocess, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from vidio import frames
from cam_track import tiles, phasecorr, fit_similarity, W, H
FPS = 30; SET = 2.0; CORNER = 734.0
KEEP = np.ones(H, bool); KEEP[406:484] = False

def gs(x, s=1.2):
    r = int(4 * s); k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2); k /= k.sum()
    return np.convolve(np.pad(x, r, mode="edge"), k, "valid")

def raw(video, cache=None):
    """per frame pair: global camera (tx ty zoom roll peak res), luma histogram, gradient energy. Cached as npz."""
    if cache and os.path.exists(cache) and os.path.getmtime(cache) >= os.path.getmtime(video): return dict(np.load(cache))
    G, HI, GX, GY = [], [], [], []; prev = None
    for img in frames(video, W, H, gray=True):
        m = img[KEEP]; h = np.histogram(m, 32, (0, 1))[0].astype(np.float32); HI.append(h / h.sum())
        GX.append(float(np.abs(np.diff(m, axis=1)).mean())); GY.append(float(np.abs(np.diff(m, axis=0)).mean()))
        if prev is not None:
            ta, ca = tiles(prev); tb, _ = tiles(img); d, pks = [], []
            for A, B in zip(ta, tb):
                dx, dy, pk = phasecorr(A, B); d.append((dx, dy)); pks.append(pk)
            tx, ty, a, b, res = fit_similarity(np.array(d), ca); G.append((tx, ty, a, b, float(np.median(pks)), res))
        prev = img
    r = dict(g=np.array(G, np.float32), hist=np.array(HI, np.float32), gx=np.array(GX, np.float32), gy=np.array(GY, np.float32))
    try:                                                    # a step-2 or step-3 animatic (15 or 10 fps) is measured on its own frames and scaled to the 30 fps units
        a, b = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video], capture_output=True, text=True).stdout.strip().split("/")
        r["k"] = np.array(max(1, int(round(FPS / (float(a) / float(b))))))
    except Exception: r["k"] = np.array(1)
    if cache: os.makedirs(os.path.dirname(cache), exist_ok=True); np.savez_compressed(cache, **r)
    return r

def series(z):
    k = int(z["k"]) if "k" in z else 1; g, hist = z["g"].copy(), z["hist"]; n = len(g); g[:, :4] /= k      # motion per 30 fps frame
    if k > 1: print("note: %d fps video: speeds are per 30 fps frame, times in seconds; use a full-rate render for the final check" % (FPS // k))
    hd = np.abs(np.diff(hist, axis=0)).sum(1); med = np.array([np.median(hd[max(0, i - 6):i + 7]) for i in range(n)])
    tx, ty, zm, rl, pk = g[:, 0], g[:, 1], g[:, 2], g[:, 3], g[:, 4]
    cut = ((hd >= .5) & (hd >= 3 * med + .05)) | ((hd >= .22) & (hd >= 4 * med + .05) & (pk < .06)); bad = cut | (pk < .04)
    cutm = cut | np.roll(cut, 1) | np.roll(cut, -1)
    T = lambda v: np.where(bad, 0, v)
    sx, sy, sz, sr = (gs(np.cumsum(T(v))) for v in (tx * 2, ty * 2, zm, rl))
    vx, vy, vz, vr = (np.diff(s, prepend=s[0]) for s in (sx, sy, sz, sr))
    sp = np.hypot(np.hypot(vx, vy), vz * CORNER)
    aniso = np.maximum(z["gx"], z["gy"])[1:] / (np.minimum(z["gx"], z["gy"])[1:] + 1e-6)
    w0 = (~cutm) & ((sp >= 40) | ((pk < .04) & (aniso > 2.2)))
    return dict(n=n, sp=sp, vz=vz, vr=vr, cut=cut, cutm=cutm, whip0=w0, hd=hd, fps=FPS / float(k))

def spans(m, merge=0):
    m = np.asarray(m, bool).copy(); i = 0; n = len(m)
    if merge:
        while i < n:
            if not m[i]:
                j = i
                while j < n and not m[j]: j += 1
                if 0 < i and j < n and j - i <= merge: m[i:j] = True
                i = j
            else: i += 1
    out, i = [], 0
    while i < n:
        if m[i]:
            j = i
            while j < n and m[j]: j += 1
            out.append((i, j - i)); i = j
        else: i += 1
    return out

def analyse(S, words=None):
    """words: list of {w, s, e}. Returns the film-level camera numbers (same names as data/motion.json)."""
    n, sp, vz, vr, cutm = S["n"], S["sp"], S["vz"], S["vr"], S["cutm"]; ok = ~cutm; FPS = S.get("fps", 30.0); k = 30.0 / FPS; dur = n / FPS; r = {}
    r.update(dur=round(dur, 1), cuts_10s=10 * float(S["cut"].sum()) / dur, p50=float(np.median(sp[ok])), p90=float(np.percentile(sp[ok], 90)), peak=float(sp[ok].max()),
             pct_hold03=100 * float((sp[ok] < .3).mean()), pct_settled=100 * float((sp[ok] < SET).mean()))
    h = [(a, l) for a, l in spans(sp < SET, int(2 / k)) if l >= 6 / k]; hl = np.array([l for a, l in h], float) / FPS if h else np.array([0.])
    t = [l for a, l in spans(sp >= SET, int(2 / k))]; tl = np.array(t, float) / FPS if t else np.array([0.])
    r.update(holds_10s=10 * len(h) / dur, hold_p50=float(np.median(hl)), hold_p90=float(np.percentile(hl, 90)), hold_max=float(hl.max()),
             travel_p50=float(np.median(tl)), travel_p90=float(np.percentile(tl, 90)), travel_max=float(tl.max()))
    r["travels_over_3s"] = [[round(a / FPS, 2), round(l / FPS, 2)] for a, l in spans(sp >= SET, int(2 / k)) if l > 3 * FPS]
    r["frozen_over_12f"] = [[round(a / FPS, 2), round(l / FPS, 2)] for a, l in spans((sp < .05) & (S["hd"] < .002) & ok) if l >= 12 / k]     # camera AND picture fully still: reads as a freeze
    if words:
        on = np.array([w["s"] * FPS for w in words], float); lon = np.array([w["s"] * FPS for w in words if len(w["w"].strip(" .,?!\"'")) >= 5], float)
        r["words_per_s"] = len(on) / max(1e-6, (words[-1]["e"] - words[0]["s"]))
        idx = lon.astype(int)[(lon >= 0) & (lon < n)]
        if len(idx): r["settled_at_longword"] = 100 * float((sp[idx] < SET).mean())
    deg = np.degrees(vr); ad = np.abs(deg[ok]); r.update(roll_rate_p99=float(np.percentile(ad, 99)))
    rg = np.cumsum(np.where(ok, deg, 0)); r["roll_drift_deg"] = float(np.ptp(rg))
    wp = [(a, l) for a, l in spans(S["whip0"]) if l >= max(2, 3 / k)]; r.update(whips_min=60 * len(wp) / dur)
    ze = [100 * float(np.abs(vz[a:a + l]).max()) for sgn in (1, -1) for a, l in spans((sgn * vz * 100 >= .3) & ok, int(3 / k)) if 100 * float(np.abs(vz[a:a + l].sum())) >= 15]
    r["zoom_peak_p90"] = float(np.percentile(ze, 90)) if ze else 0.0
    return r

if __name__ == "__main__":
    v = sys.argv[1]; w = json.load(open(sys.argv[2], encoding="utf-8")) if len(sys.argv) > 2 else None
    print(json.dumps(analyse(series(raw(v)), w), indent=1))
