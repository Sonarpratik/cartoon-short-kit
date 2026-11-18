"""Cluster statistics of OUR film sampled like the reference study (grade.md: every 15th frame).

Groups stills by the shot light from story.ts (day / golden), skips crossfade and flash windows,
takes per-frame metrics (grade_metrics.frame_metrics, no caption mask) and reports per-cluster
medians next to the reference cluster medians. Also mean edge-ink coverage per cluster.

Usage: python cluster_stats.py <stills_dir> <prefix>     e.g. out/p2 s_
Still filenames: <prefix><frame>.jpg
"""
import sys, os, re, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from grade_metrics import frame_metrics
from ink_scan import frame_mode

GOLDEN = (1303, 1735)
SKIP = []  # crossfade/flash windows
for f0, w in [(130, 4), (1134, 8), (1303, 10), (1411, 10), (1620, 10), (1735, 10), (1863, 10)]:
    SKIP.append((f0 - w, f0 + w))

REF = {
    "day":    {"Yp50": 0.571, "Yp5": 0.205, "noink_p5": 0.234, "noink_p50": 0.583, "Ymean": 0.558,
               "sat_mean": 0.439, "litC_p90": 55.0, "corner": 0.86, "edge_ink": 45.1},
    "golden": {"Yp50": 0.516, "Yp5": 0.180, "noink_p5": 0.211, "noink_p50": 0.526, "Ymean": 0.508,
               "sat_mean": 0.459, "litC_p90": 55.0, "corner": 0.86, "edge_ink": 45.1},
}

def main(d, prefix):
    groups = {"day": [], "golden": []}
    for fn in sorted(os.listdir(d)):
        m = re.fullmatch(re.escape(prefix) + r"(\d+)\.jpg", fn)
        if not m:
            continue
        fr = int(m.group(1))
        if any(a <= fr <= b for a, b in SKIP):
            continue
        light = "golden" if GOLDEN[0] <= fr < GOLDEN[1] else "day"
        rgb = np.asarray(Image.open(os.path.join(d, fn)).convert("RGB"), np.float32) / 255
        fm = frame_metrics(rgb, mask_captions=False)
        ik = frame_mode(rgb, mask_captions=False)
        groups[light].append({
            "frame": fr, "Ymean": fm["Ymean"], "Yp50": fm["Yp"]["50"], "Yp5": fm["Yp"]["5"],
            "noink_p5": fm["noink_p5"], "noink_p50": fm["noink_p50"], "sat_mean": fm["sat_mean"],
            "litC_p90": fm["litC_p90"] or 0, "corner": fm["corner_over_centre"],
            "dark_b": fm["dark_bstar_mean"] or 0, "bp": fm["black_point"],
            "edge_ink": ik["edge_ink_coverage_pct"],
        })
    out = {}
    for light, rows in groups.items():
        if not rows:
            continue
        med = lambda k: round(float(np.median([r[k] for r in rows])), 3)
        ours = {k: med(k) for k in ["Ymean", "Yp50", "Yp5", "noink_p5", "noink_p50", "sat_mean", "litC_p90", "corner", "dark_b", "edge_ink"]}
        ours["bp"] = [round(float(np.median([r["bp"][i] for r in rows])), 1) for i in range(3)]
        ours["n"] = len(rows)
        out[light] = ours
        ref = REF[light]
        print(f"== {light} (n={len(rows)}) ==")
        print(f"{'metric':12} {'ours':>8} {'ref':>8}   delta")
        for k in ["Ymean", "Yp50", "Yp5", "noink_p5", "noink_p50", "sat_mean", "litC_p90", "corner", "edge_ink"]:
            r = ref.get(k)
            dl = f"{ours[k]-r:+.3f}" if r is not None else ""
            print(f"{k:12} {ours[k]:>8} {r if r is not None else '':>8}   {dl}")
        print(f"{'dark_b*':12} {ours['dark_b']:>8}   (day ~0, golden < 0)")
        print(f"{'black_point':12} {ours['bp']}   (ref day ~[35,19,20])")
        print()
    json.dump(out, open(os.path.join(d, prefix + "cluster.json"), "w"), indent=1)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "s_")
