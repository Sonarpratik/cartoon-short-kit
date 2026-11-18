"""One runner for any episode folder. Prints PASS/FAIL per gate.
    python tools/check_episode.py <episode_folder> [--preset night|day|golden|interior] [--style 3d|ink] [--aerial]
Stills: <folder>/out/*.png and <folder>/stills/*.png (skips *_raw, *_grid, names starting with _). Video: <folder>/final.mp4.
Runs: density_check (G1-G7), 3D look (grade numbers + glints), the automatic part of the scorecard, short_qa on final.mp4.
The rest of references/SCORECARD.md needs a fresh verifier and the sound-off test: they stay manual, and this prints that."""
import sys, os, glob, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, os.path.join(HERE, "measure"))
import numpy as np
from PIL import Image
import density_check as D
import look_3d as L
from grade_metrics import frame_metrics

A = sys.argv[1:]; folder = A[0]; get = lambda k, d: A[A.index(k) + 1] if k in A else d
preset, style = get("--preset", "night"), get("--style", "3d"); night = preset == "night"
files = [f for d in ("out", "stills") for f in sorted(glob.glob(os.path.join(folder, d, "*.png"))) if not os.path.basename(f).startswith("_") and not any(s in f for s in ("_raw", "_grid", "_v1", "_v2"))]
if get("--only", ""): files = [f for f in files if get("--only", "") in os.path.basename(f)]
fails = 0
def line(name, val, ok, target):
    global fails; fails += 0 if ok else 1; print(f"  {'PASS' if ok else 'FAIL'}  {name:<24}{str(val):<24}target {target}")
for f in files:
    print(os.path.basename(f))
    for k, v in D.check(f, night, "--aerial" in A, style).items(): line(k, list(v[:-1]), v[-1], D.target_text(k, night, style))
    r = L.m(f)
    line("texture share", r["textured"], r["textured"] >= .30, ">= 0.30 (his middle half .30-.48, median .39)")
    line("black point", r["black"], all(abs(a - b) <= 8 for a, b in zip(r["black"], (7, 4, 15))), "7,4,15 +-8")
    a, b = r["shadow_ab"]; line("shadow a*/b*", r["shadow_ab"], -2 <= a <= 14 and (b <= 0 if not night else b <= -5), "a* +6 (-2..14), b* -8 (below 0; night -5 or lower)")
    line("vignette", r["vig"], .55 <= r["vig"] <= .8, "0.67 (.55-.80); fit once per shot with grade.py --fit-vig")
    line("amber share", r["amber"], r["amber"] <= .14, "<= 0.14 (his 0.07)")
    line("small glints", r["spec"], r["spec"] >= .007, ">= 0.007 (his Pink .007, median .018)")
    line("clipped highlights %", r["clip_pct"], r["clip_pct"] <= 2.5, "<= 2.5 (his median 0.9); lamps must not go white")
    g = frame_metrics(np.asarray(Image.open(f).convert("RGB")).astype(np.float32) / 255)
    print(f"  INFO  scorecard colour: Y' p50 {g['Yp']['50']}, sat {round(g['sat_mean'], 2)}, lit C* p90 {round(g.get('litC_p90') or 0, 1)}")
v = os.path.join(folder, "final.mp4")
if os.path.exists(v):
    s = subprocess.run([sys.executable, os.path.join(ROOT, "templates", "scripts", "short_qa.py"), v, os.path.join(folder, "qa")], capture_output=True, text=True)
    line("short_qa", "exit %d" % s.returncode, s.returncode == 0, "see qa/ folder"); print(s.stdout[-600:])
else: print("SKIP  short_qa: no final.mp4 yet")
print("MANUAL  by eye on every location: puddles reflect lamps and sky; lamps stay warm; tarps read as cloth; paint chips sit on edges; fresh verifier + sound-off test (references/SCORECARD.md)")
print(f"RESULT: {len(files)} still(s), {fails} FAIL")
