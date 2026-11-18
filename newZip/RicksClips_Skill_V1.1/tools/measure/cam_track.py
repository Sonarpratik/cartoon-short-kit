"""Camera grammar measurement (method: references/reports/motion.md section 1).

9-tile sub-pixel phase-correlation similarity fit (translation, zoom, roll) at 360x640,
tile bands 3-29 / 29-56 / 80-97 % of height (captions excluded), outlier tiles rejected,
path integrated and Gaussian-smoothed (sigma 1.2 f). Speed in 720p px/f = translation
combined with zoom x 734 (frame-corner radius). Classes: hold < 0.3, drift < 2, move >= 2.
Bursts = local peaks >= 6 px/f, attack/release measured to 10 % of peak.

Usage: python cam_track.py <video_or_frames_json> [--json out.json]
Reference targets (per video, 20 shorts): hold 1-27 %, median speed 1.3-12.9, p90 9.7-29.4,
move peak median 13.7 (p25 5.9, p75 24.6), attack ~10 f, release ~10 f, quiet-zoom active
~70 % (83 % push-in, median 0.14 %/f), HF residual 0.05-0.29 px.
"""
import sys, json, numpy as np
sys.path.insert(0, __file__.rsplit("\\", 1)[0] if "\\" in __file__ else ".")
from vidio import frames

W, H = 360, 640
ROWS = [(0.03, 0.29), (0.29, 0.56), (0.80, 0.97)]
CORNER_720 = 734.0  # hypot(360, 640) at 720p


def tiles(img):
    out, cts = [], []
    for (a, b) in ROWS:
        y0, y1 = int(a * H), int(b * H)
        for c in range(3):
            x0, x1 = c * W // 3, (c + 1) * W // 3
            out.append(img[y0:y1, x0:x1])
            cts.append(((x0 + x1) / 2, (y0 + y1) / 2))
    return out, np.array(cts)


def phasecorr(a, b):
    """Sub-pixel shift of b relative to a; returns (dx, dy, peak)."""
    wy = np.hanning(a.shape[0])[:, None] * np.hanning(a.shape[1])[None, :]
    A, B = np.fft.rfft2(a * wy), np.fft.rfft2(b * wy)
    R = A * np.conj(B)
    R /= np.abs(R) + 1e-9
    r = np.fft.irfft2(R, a.shape)
    iy, ix = np.unravel_index(np.argmax(r), r.shape)
    pk = r[iy, ix]
    # parabolic sub-pixel
    def sub(m, c, p):
        d = m - 2 * c + p
        return 0.0 if abs(d) < 1e-12 else np.clip(0.5 * (m - p) / d, -1, 1)
    h, w = r.shape
    dy = iy + sub(r[(iy - 1) % h, ix], pk, r[(iy + 1) % h, ix])
    dx = ix + sub(r[iy, (ix - 1) % w], pk, r[iy, (ix + 1) % w])
    if dy > h / 2: dy -= h
    if dx > w / 2: dx -= w
    return -dx, -dy, float(pk)  # motion of b vs a


def fit_similarity(d, cts, c=(W / 2, H / 2)):
    """d: (9,2) tile displacements. Model d = t + a*(p-c) + b*perp(p-c). Robust LS."""
    p = cts - np.array(c)
    keep = np.ones(len(d), bool)
    for _ in range(2):
        A = []
        y = []
        for i in np.where(keep)[0]:
            px, py = p[i]
            A.append([1, 0, px, -py]); y.append(d[i, 0])
            A.append([0, 1, py, px]); y.append(d[i, 1])
        sol, *_ = np.linalg.lstsq(np.array(A), np.array(y), rcond=None)
        tx, ty, a, b = sol
        res = np.hypot(d[:, 0] - (tx + a * p[:, 0] - b * p[:, 1]),
                       d[:, 1] - (ty + a * p[:, 1] + b * p[:, 0]))
        med = np.median(res[keep]) + 1e-6
        keep = res < max(2.5 * med, 0.75)
        if keep.sum() < 5: keep = np.ones(len(d), bool); break
    return tx, ty, a, b, float(np.median(res[keep]))


def gauss_smooth(x, sigma=1.2):
    r = int(4 * sigma)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    return np.convolve(np.pad(x, r, mode="edge"), k, "valid")


def analyze(path):
    prev = None
    TX, TY, ZM, RL, PKS, RES = [], [], [], [], [], []
    for img in frames(path, W, H, gray=True):
        if prev is not None:
            ta, ca = tiles(prev)
            tb, _ = tiles(img)
            d, pks = [], []
            for A, B in zip(ta, tb):
                dx, dy, pk = phasecorr(A, B)
                d.append((dx, dy)); pks.append(pk)
            tx, ty, a, b, res = fit_similarity(np.array(d), ca)
            TX.append(tx); TY.append(ty); ZM.append(a); RL.append(b)
            PKS.append(float(np.median(pks))); RES.append(res)
        prev = img
    TX, TY, ZM = np.array(TX), np.array(TY), np.array(ZM)
    PKS = np.array(PKS)
    n = len(TX)
    # cuts: weak correlation or absurd shift
    cut = (PKS < 0.04) | (np.hypot(TX, TY) > 120)
    cutm = cut | np.roll(cut, 1) | np.roll(cut, -1)
    # integrate + smooth path (x2 -> 720p px)
    px_, py_ = np.cumsum(TX) * 2, np.cumsum(TY) * 2
    pz = np.cumsum(ZM)
    sx, sy, sz = gauss_smooth(px_), gauss_smooth(py_), gauss_smooth(pz)
    vx, vy, vz = np.diff(sx, prepend=sx[0]), np.diff(sy, prepend=sy[0]), np.diff(sz, prepend=sz[0])
    speed = np.hypot(np.hypot(vx, vy), vz * CORNER_720)
    ok = ~cutm
    sp = speed[ok]
    hold, drift, move = (sp < 0.3).mean(), ((sp >= 0.3) & (sp < 2)).mean(), (sp >= 2).mean()
    # bursts: local maxima >= 6 px/f within a +-4 f window, min separation 8 f.
    # attack/release measured to 10 % of peak, stopping at a valley (speed rising
    # again for 2 consecutive frames) and capped at 60 f.
    cand = [i for i in range(4, n - 4)
            if not cutm[i] and speed[i] >= 6 and speed[i] == speed[i - 4:i + 5].max()]
    peaks = []
    for i in cand:
        if peaks and i - peaks[-1][0] < 8:
            if speed[i] > peaks[-1][1]:
                peaks[-1] = (i, speed[i], 0, 0)
            continue
        peaks.append((i, speed[i], 0, 0))
    def walk(i, pk, step):
        j, rise = i, 0
        while 0 < j < n - 1 and abs(j - i) < 60 and not cutm[j + step]:
            if speed[j + step] < 0.1 * pk: break
            rise = rise + 1 if speed[j + step] > speed[j] else 0
            if rise >= 2: break
            j += step
        return abs(j - i)
    peaks = [(i, pk, walk(i, pk, -1), walk(i, pk, +1)) for (i, pk, _, _) in peaks]
    # quiet-frame zoom (translation < 2 px/f @720)
    trans = np.hypot(vx, vy)
    quiet = ok & (trans < 2)
    zr = vz[quiet] * 100  # %/f
    zact = np.abs(zr) >= 0.05
    # high-frequency residual (handheld float)
    hf = np.hypot(px_ - sx, py_ - sy)
    dur10 = (ok.sum() / 30) / 10 or 1
    stats = {
        "frames": int(n), "cut_frames": int(cut.sum()),
        "hold_pct": round(100 * hold, 1), "drift_pct": round(100 * drift, 1), "move_pct": round(100 * move, 1),
        "speed_median": round(float(np.median(sp)), 2), "speed_p90": round(float(np.percentile(sp, 90)), 2),
        "moves_per_10s": round(len(peaks) / dur10, 2),
        "move_peak_median": round(float(np.median([p[1] for p in peaks])), 1) if peaks else None,
        "move_peak_p25_p75": [round(float(np.percentile([p[1] for p in peaks], q)), 1) for q in (25, 75)] if peaks else None,
        "attack_median_f": round(float(np.median([p[2] for p in peaks])), 1) if peaks else None,
        "release_median_f": round(float(np.median([p[3] for p in peaks])), 1) if peaks else None,
        "quiet_zoom_active_pct": round(100 * float(zact.mean()), 1) if len(zr) else None,
        "quiet_zoom_pushin_pct": round(100 * float((zr[zact] > 0).mean()), 1) if zact.any() else None,
        "quiet_zoom_rate_median": round(float(np.median(np.abs(zr[zact]))), 3) if zact.any() else None,
        "hf_residual_median_px": round(float(np.median(hf[ok])), 3),
    }
    return stats


if __name__ == "__main__":
    out = {}
    argv = sys.argv[1:]
    skip = {argv[i + 1] for i, a in enumerate(argv) if a == "--json" and i + 1 < len(argv)}
    args = [a for a in argv if not a.startswith("--") and a not in skip]
    for v in args:
        out[v.rsplit("\\", 1)[-1].rsplit("/", 1)[-1]] = analyze(v)
    s = json.dumps(out, indent=1)
    print(s)
    if "--json" in sys.argv:
        open(sys.argv[sys.argv.index("--json") + 1], "w").write(s)
