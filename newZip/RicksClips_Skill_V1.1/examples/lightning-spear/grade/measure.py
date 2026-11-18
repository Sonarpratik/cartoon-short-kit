# Measure the joined film per light kind, before or after the grade. CPU only.
#   python measure.py before|after [step]      -> grade/measure_<mode>.json + table printed
# Frames come straight from join.py's plan (exact pixels, no MP4 loss). "after" runs grade.grade_frame on them.
# Every <step>-th frame (default 15) for the table; EVERY frame of G and H for the night floor (mean >= 0.31).
import os, sys, json, importlib.util
import numpy as np
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(EP, "join")); sys.path.insert(0, HERE)
import join as J
import grade as G
_sp = importlib.util.spec_from_file_location("armor_measure", os.path.join(EP, "..", "armor-no-holes", "grade_final", "measure.py"))
_am = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_am)
armor_faces = _am.faces                            # armor head finder (near-white disc with ink ring), 540x960
LUMA = np.array([0.2126, 0.7152, 0.0722], np.float32)
CAP0, CAP1 = int(0.655 * 1920), int(0.745 * 1920)
PLAN = None


def hue(rgb, mx, mn):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    d = np.maximum(mx - mn, 1e-5)
    return np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60


def stats(f, mode, full):
    a = J.render_entry(PLAN[f], f)
    a = np.clip(a + 0.5, 0, 255).astype(np.uint8)
    if mode == "after":
        a = G.grade_u8(a, f)
    cap = a[CAP0:CAP1]
    capwhite = int((cap == 255).all(-1).sum())
    keep = np.ones(a.shape[:2], bool); keep[CAP0:CAP1] = False
    sm = a.reshape(960, 2, 540, 2, 3).mean((1, 3)).astype(np.float32) / 255
    k2 = keep[::2, ::2]
    Y = sm @ LUMA
    mx, mn = sm.max(-1), sm.min(-1)
    S = (mx - mn) / np.maximum(mx, 1e-4)
    d = {"f": f, "Y": float(Y[k2].mean()), "capwhite": capwhite}
    if not full:
        return d
    y, s = Y[k2], S[k2]
    H = hue(sm, mx, mn)[k2]
    d.update(S=float(s.mean()), p99=float(np.percentile(y, 99)), p1=float(np.percentile(y, 1)))
    # cold glint: bright cold-blue pixels (hue 190-215, Y > 0.75); how many sit flat at 255 in every channel
    full_px = a[keep].reshape(-1, 3)
    fx = full_px.astype(np.float32) / 255
    fmx, fmn = fx.max(-1), fx.min(-1)
    fH = hue(fx, fmx, fmn); fY = fx @ LUMA
    cold = (fH > 188) & (fH < 218) & (fY > 0.75) & ((fmx - fmn) > 0.12)
    d["glint_n"] = int(cold.sum()); d["glint_flat"] = int(((full_px == 255).all(-1) & cold).sum())
    d["glint_ymax"] = float(fY[cold].max()) if cold.any() else 0.0
    orange = (H > 14) & (H < 42) & (s > 0.55) & (y > 0.35)
    d["orange"] = float(orange.mean())
    fc = armor_faces(sm)
    d["faces"] = [[round(v * 255) for v in c] for _, c in fc]
    return d


def job(args):
    return stats(*args)


def init(plan, h):
    global PLAN
    PLAN = plan; J._have = h


def main():
    mode = sys.argv[1]; step = int(sys.argv[2]) if len(sys.argv) > 2 else 15
    for s in J.SEGS: J.have(s["stretch"], 0)
    plan, _ = J.build_plan()
    jobs = [(f, mode, True) for f in range(0, J.TOTAL, step)]
    night = [f for f in range(J.TOTAL) if G.kind_of(f) in ("G", "H") and f % step]
    jobs += [(f, mode, False) for f in night]
    with Pool(max(2, (os.cpu_count() or 4) - 4), initializer=init, initargs=(plan, J._have)) as p:
        res = p.map(job, jobs, chunksize=4)
    json.dump(res, open(os.path.join(HERE, "measure_%s.json" % mode), "w"))
    print(table(res, mode))


def table(res, mode):
    full = [r for r in res if "S" in r]
    L = ["| kind (%s) | n | sat | mean | white p99 | dark p1 | face rgb (median) | glint n/flat/max | orange share | min mean |" % mode,
         "|---|---|---|---|---|---|---|---|---|---|"]
    for k in ["A", "B", "C", "D", "E", "F", "G", "H", "A2"]:
        rs = [r for r in full if G.kind_of(r["f"]) == k]
        allk = [r for r in res if G.kind_of(r["f"]) == k]
        fcs = [c for r in rs for c in r["faces"]]
        fm = np.median(np.array(fcs), 0).round().astype(int).tolist() if fcs else "-"
        g = (sum(r["glint_n"] for r in rs), sum(r["glint_flat"] for r in rs), max(r["glint_ymax"] for r in rs))
        mn = min(allk, key=lambda r: r["Y"])
        L.append("| %s | %d | %.3f | %.3f | %.3f | %.3f | %s (%d) | %d/%d/%.2f | %.4f | %.3f @%d |" % (
            k, len(rs), np.mean([r["S"] for r in rs]), np.mean([r["Y"] for r in rs]), np.mean([r["p99"] for r in rs]),
            np.mean([r["p1"] for r in rs]), fm, len(fcs), *g, np.mean([r["orange"] for r in rs]), mn["Y"], mn["f"]))
    L.append("film: sat %.3f  mean %.3f" % (np.mean([r["S"] for r in full]), np.mean([r["Y"] for r in full])))
    low = sorted(r["f"] for r in res if G.kind_of(r["f"]) in ("G", "H") and r["Y"] < 0.31)
    L.append("G/H frames under 0.31 (every frame checked): %d %s" % (len(low), low[:40]))
    return "\n".join(L)


if __name__ == "__main__":
    main()
