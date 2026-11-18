"""DENSITY GATES (CB 2026-11-07: "maximum density, no empty space, maximum details for the whole world").
Per frame, PASS/FAIL on each measured gate (thresholds = the reference's measured medians, SKILL.md "DENSITY LAW"):
  G1 edge_density   >= 0.086          (detail_density.py; reference night median; all-light median is 0.117)
  G2 shapes         >= 736            (distinct flat-colour regions >= 30 px after 32-colour quantise)
  G3 empty cells    == 0 (wide aerial: <= 2)   (empty_space.py 6x10 grid, caption band masked)
  G4 lit chroma     C* p90 in range (night 52-68, day 45-65)   (grade_metrics.py)
  G5 depth layers   3 of 3 frame thirds carry edge detail (>= 0.03)
Usage: python density_check.py [--night|--day] [--aerial] img... [--json out.json]
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from detail_density import metrics as dd
from empty_space import metrics as es
from grade_metrics import frame_metrics

def check(path, night=True, aerial=False):
    im = Image.open(path)
    d = dd(im); e = es(im)
    g = frame_metrics(np.asarray(im.convert("RGB")).astype(np.float32) / 255)
    c90 = g.get("litC_p90") or 0.0
    lo, hi = (52, 68) if night else (45, 65)
    gates = {
        "G1_edge": (d["edge_density"], d["edge_density"] >= 0.086),
        "G2_shapes": (d["regions"], d["regions"] >= 736),
        "G3_empty": (e["empty_pct"], e["max_empty_run"], (e["empty_pct"] == 0) if not aerial else (e["empty_pct"] <= 100 * 2 / 54)),
        "G4_chroma": (round(c90, 1), lo <= c90 <= hi),
        "G5_layers": (e["layers"], e["layers"] == 3),
    }
    return gates

if __name__ == "__main__":
    a = sys.argv[1:]
    night = "--day" not in a; aerial = "--aerial" in a
    out = a[a.index("--json") + 1] if "--json" in a else None
    files = [x for x in a if not x.startswith("--") and x != out]
    R = {}
    for f in files:
        g = check(f, night, aerial); R[f] = {k: list(v) for k, v in g.items()}
        n = sum(v[-1] for v in g.values())
        print(f.replace("\\", "/").split("/")[-1], f"{n}/5 PASS", " | ".join(f"{k} {v[:-1]} {'PASS' if v[-1] else 'FAIL'}" for k, v in g.items()))
    if out: json.dump(R, open(out, "w"), indent=1, default=str)
