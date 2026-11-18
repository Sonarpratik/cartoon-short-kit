"""DENSITY GATES (CB 2026-11-07: "maximum density, no empty space, maximum details for the whole world").
Per frame, PASS/FAIL on each measured gate (thresholds = the reference's measured medians, SKILL.md "DENSITY LAW"):
  G1 edge_density   >= 0.086          (detail_density.py; reference night median; all-light median is 0.117)
  G2 shapes         >= 736            (distinct flat-colour regions >= 30 px after 32-colour quantise)
  G3 empty cells    3d: at or below his median for that light (night 18.8 %, other lights 14.6 %); ink: == 0 (wide aerial: <= 2)   (empty_space.py 6x10 grid, caption band masked)
  G4 lit chroma     C* p90 in range (night 52-68, day 45-65)   (grade_metrics.py)
  G5 depth layers   3 of 3 frame thirds carry edge detail (>= 0.03)
QUALITY GATES (2026-11-07: "full" must also be "fine"; quality_metrics.py, bands from 317 reference night frames):
  G6 fine surface   hf_surface <= 0.343 (ref p75) AND lc_surface >= 1.10 (ref p10)
                    = surfaces carry painted variation but no pixel-level noise / blocky texels
  G7 depth haze     haze_lift >= 3.2 (ref median): the far band's black level is lifted toward the horizon colour
STYLES (2026-11-09): --style 3d is the DEFAULT = the LOCKED LOOK, no world ink. Thresholds from 193 frames of his 3 newest videos
(references/measure/gates_3d.json): medians, except G4 = p10-p90 band and G6 noise = p75. --style ink = the old inked gates.
Usage: python density_check.py [--style 3d|ink] [--night|--day] [--aerial] img... [--json out.json]
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from detail_density import metrics as dd
from empty_space import metrics as es
from grade_metrics import frame_metrics
from quality_metrics import metrics as qm

T3D = {True: dict(edge=.141, shapes=783, empty=18.8, c=(26.3, 61.7), hf=.569, lc=1.508, haze=6.22), False: dict(edge=.14, shapes=702, empty=14.6, c=(24.7, 72.1), hf=.614, lc=1.364, haze=12.08)}
def target_text(k, night, style):
    if style == "ink": return {"G1_edge": ">= 0.086", "G2_shapes": ">= 736", "G3_empty": "0 %", "G4_chroma": "52-68" if night else "45-65", "G5_layers": "3", "G6_fine": "hf <= .343, lc >= 1.10", "G7_haze": ">= 3.2"}[k]
    t = T3D[night]; return {"G1_edge": f">= {t['edge']}", "G2_shapes": f">= {t['shapes']}", "G3_empty": f"<= {t['empty']} %", "G4_chroma": f"{t['c'][0]}-{t['c'][1]}", "G5_layers": "3", "G6_fine": f"hf <= {t['hf']}, lc >= {t['lc']}", "G7_haze": f">= {t['haze']}"}[k]

def check(path, night=True, aerial=False, style="3d"):
    im = Image.open(path)
    d = dd(im); e = es(im); q = qm(im)
    g = frame_metrics(np.asarray(im.convert("RGB")).astype(np.float32) / 255)
    c90 = g.get("litC_p90") or 0.0
    lo, hi = (52, 68) if night else (45, 65)
    if style == "3d":
        t = T3D[night]
        return {"G1_edge": (d["edge_density"], d["edge_density"] >= t["edge"]), "G2_shapes": (d["regions"], d["regions"] >= t["shapes"]),
                "G3_empty": (e["empty_pct"], e["max_empty_run"], e["empty_pct"] <= t["empty"]), "G4_chroma": (round(c90, 1), t["c"][0] <= c90 <= t["c"][1]),
                "G5_layers": (e["layers"], e["layers"] == 3), "G6_fine": (q["hf_surface"], q["lc_surface"], q["hf_surface"] <= t["hf"] and q["lc_surface"] >= t["lc"]),
                "G7_haze": (q["haze_masked"], q["haze_masked"] >= t["haze"])}
    gates = {
        "G1_edge": (d["edge_density"], d["edge_density"] >= 0.086),
        "G2_shapes": (d["regions"], d["regions"] >= 736),
        "G3_empty": (e["empty_pct"], e["max_empty_run"], (e["empty_pct"] == 0) if not aerial else (e["empty_pct"] <= 100 * 2 / 54)),
        "G4_chroma": (round(c90, 1), lo <= c90 <= hi),
        "G5_layers": (e["layers"], e["layers"] == 3),
        "G6_fine": (q["hf_surface"], q["lc_surface"], q["hf_surface"] <= 0.343 and q["lc_surface"] >= 1.10),
        "G7_haze": (q["haze_lift"], q["haze_lift"] >= 3.2),
    }
    return gates

if __name__ == "__main__":
    a = sys.argv[1:]
    night = "--day" not in a; aerial = "--aerial" in a; style = a[a.index("--style") + 1] if "--style" in a else "3d"
    out = a[a.index("--json") + 1] if "--json" in a else None
    files = [x for x in a if not x.startswith("--") and x != out and x != style]
    R = {}
    for f in files:
        g = check(f, night, aerial, style); R[f] = {k: list(v) for k, v in g.items()}
        n = sum(v[-1] for v in g.values())
        print(f.replace("\\", "/").split("/")[-1], f"{n}/{len(g)} PASS", " | ".join(f"{k} {v[:-1]} {'PASS' if v[-1] else 'FAIL'}" for k, v in g.items()))
    if out: json.dump(R, open(out, "w"), indent=1, default=str)
