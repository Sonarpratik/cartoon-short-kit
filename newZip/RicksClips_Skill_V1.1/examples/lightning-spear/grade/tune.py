# Fast tuning loop: grade the cached half-size sample frames (every 15th) with params.json and print the table.
#   python tune.py cache      (once: writes work/sample.npy from the join plan)
#   python tune.py            (table after the grade, with Lab mean per kind and distances between kinds)
import os, sys, json
import numpy as np
from multiprocessing import Pool
HERE = os.path.dirname(os.path.abspath(__file__)); EP = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(EP, "join")); sys.path.insert(0, HERE)
import grade as G
LUMA = G.LUMA
WK = os.path.join(HERE, "work"); os.makedirs(WK, exist_ok=True)
FR = list(range(0, 2085, 15))


def lab(rgb):
    c = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]], np.float32)
    xyz = c @ M.T / np.array([0.9505, 1.0, 1.089], np.float32)
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def cache_one(f):
    import join as J
    for s in J.SEGS: J.have(s["stretch"], 0)
    if not hasattr(cache_one, "plan"): cache_one.plan = J.build_plan()[0]
    a = np.clip(J.render_entry(cache_one.plan[f], f) + 0.5, 0, 255)
    return a.reshape(960, 2, 540, 2, 3).mean((1, 3)).astype(np.uint8)


def st(args):
    a, f, graded = args
    if graded:
        a = G.grade_u8(a, f)
    sm = a.astype(np.float32) / 255
    keep = np.ones(sm.shape[:2], bool); keep[int(0.655 * 960):int(0.745 * 960)] = False
    Y = sm @ LUMA; mx, mn = sm.max(-1), sm.min(-1)
    S = (mx - mn) / np.maximum(mx, 1e-4)
    y = Y[keep]
    lb = lab(sm[keep][::7])
    return dict(f=f, S=float(S[keep].mean()), Y=float(y.mean()), p99=float(np.percentile(y, 99)), p1=float(np.percentile(y, 1)),
                a=float(lb[:, 1].mean()), b=float(lb[:, 2].mean()), L=float(lb[:, 0].mean()))


if __name__ == "__main__":
    if sys.argv[1:] == ["cache"]:
        with Pool(20) as p:
            arr = np.stack(p.map(cache_one, FR, chunksize=2))
        np.save(os.path.join(WK, "sample.npy"), arr); print(arr.shape); sys.exit()
    arr = np.load(os.path.join(WK, "sample.npy"))
    graded = "raw" not in sys.argv
    with Pool(20) as p:
        rs = p.map(st, [(arr[i], f, graded) for i, f in enumerate(FR)])
    K = ["A", "B", "C", "D", "E", "F", "G", "H", "A2"]; M = {}
    print("kind   sat   mean  p99   p1    L     a     b    minY")
    for k in K:
        r = [x for x in rs if G.kind_of(x["f"]) == k]
        M[k] = np.array([np.mean([x[q] for x in r]) for q in ("L", "a", "b")])
        print("%-4s %.3f %.3f %.3f %.3f %5.1f %5.1f %5.1f %.3f" % (k, *[np.mean([x[q] for x in r]) for q in ("S", "Y", "p99", "p1", "L", "a", "b")], min(x["Y"] for x in r)))
    print("film sat %.3f mean %.3f" % (np.mean([x["S"] for x in rs]), np.mean([x["Y"] for x in rs])))
    d = [(np.linalg.norm(M[i] - M[j]), i, j) for n, i in enumerate(K) for j in K[n + 1:]]
    print("closest kinds (Lab distance):", ", ".join("%s-%s %.1f" % (i, j, v) for v, i, j in sorted(d)[:5]))
