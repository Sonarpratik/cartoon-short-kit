"""cine_look.py: the CINEMATIC LOOK gate (CB 2026-11-10). Measures a rendered film, or the look frames of stage 9, against what
five of Rick's films measure (references/remeasure/compare_2026-11-10: Railroads, Roller Coasters, Drivers, Pink Prison, Storm Oil).
It checks what the camera gates cannot see: vignette, shadow tint, haze, sky against ground, fine surface detail, glints, colour
strength of lit surfaces, sharpness, and how much the light changes across the film.

    python tools/measure/cine_look.py <video.mp4 | folder of frames | frame files...> [--interior] [--out <folder>]

A video is sampled at one frame per second. --interior skips the two outdoor gates (haze, sky against ground).
Writes <out>/cine_look.md + cine_look.json. Exit code 1 on any FAIL. Bands: references/measure/gates_cine.json.
"""
import os, sys, json, glob, subprocess
import numpy as np
from PIL import Image
from scipy import ndimage as ni
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); sys.path.insert(0, HERE)
import grade_metrics as GM, look_3d as L3, quality_metrics as QM

def extra(rgb):
    H, W = rgb.shape[:2]; Y = rgb @ np.array([.2126, .7152, .0722], np.float32); k = np.ones((H, W), bool); k[int(.62 * H):int(.78 * H)] = False; y = Y[k]
    r = dict(dark=float((y < .2).mean()), top_bot=float(Y[:H // 3].mean() / (Y[int(.8 * H):].mean() + 1e-6)))
    bs = 24; hb, wb = H // bs, W // bs; bl = lambda x: x[:hb * bs, :wb * bs].reshape(hb, bs, wb, bs).transpose(0, 2, 1, 3).reshape(hb, wb, -1)
    fine = bl(Y - ni.gaussian_filter(Y, 1.5)).std(-1); coarse = bl(ni.gaussian_filter(Y, 3) - ni.gaussian_filter(Y, 8)).std(-1); s = (coarse > .012) & (bl(k.astype(np.float32)).min(-1) > 0)
    r["sharp"] = float(np.median(fine[s] / coarse[s])) if s.sum() > 20 else None
    L, a, b = GM.srgb_to_lab(rgb); r["L"] = float(L[k].mean()); return r

def measure(files):
    rows = []
    for f in files:
        im = Image.open(f).convert("RGB").resize((540, 960), Image.LANCZOS); rgb = np.asarray(im, np.float32) / 255
        if rgb.mean() < .02: continue
        g = GM.frame_metrics(rgb); q = QM.metrics(im); e = extra(rgb)
        try: l3 = L3.m(f)
        except Exception: l3 = {}
        rows.append(dict(vignette=g["corner_over_centre"], shadow_b=g["dark_bstar_mean"], Ymean=g["Ymean"], haze=q["haze_masked"], hf=q["hf_surface"], spec=l3.get("spec"), litC=l3.get("litC50"), clip=l3.get("clip_pct"), **e))
    med = lambda k: (lambda v: round(float(np.median(v)), 3) if v else None)([r[k] for r in rows if r.get(k) is not None and np.isfinite(r[k])])
    M = {k: med(k) for k in ("vignette", "shadow_b", "Ymean", "haze", "top_bot", "hf", "spec", "litC", "clip", "sharp")}
    if len(rows) >= 10: M["L_spread"] = round(float(np.std([r["L"] for r in rows])), 2); M["dark_p90"] = round(float(np.percentile([r["dark"] for r in rows], 90)), 3)
    return M, len(rows)

if __name__ == "__main__":
    A = sys.argv[1:]; get = lambda k, d=None: A[A.index(k) + 1] if k in A else d; interior = "--interior" in A
    src = [a for i, a in enumerate(A) if not a.startswith("--") and (i == 0 or A[i - 1] != "--out")]
    out = get("--out", os.path.join(os.path.dirname(os.path.abspath(src[0])), "cine_look")); os.makedirs(out, exist_ok=True)
    if len(src) == 1 and src[0].lower().endswith((".mp4", ".mov", ".mkv", ".webm")):
        F = os.path.join(out, "frames"); os.makedirs(F, exist_ok=True)
        for f in glob.glob(os.path.join(F, "*.jpg")): os.remove(f)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src[0], "-vf", "fps=1,scale=540:960:flags=lanczos", "-q:v", "2", os.path.join(F, "f_%03d.jpg")], check=True); files = sorted(glob.glob(os.path.join(F, "*.jpg")))
    elif len(src) == 1 and os.path.isdir(src[0]): files = sorted(f for f in glob.glob(os.path.join(src[0], "*")) if f.lower().endswith((".png", ".jpg", ".jpeg")))
    else: files = src
    G = json.load(open(os.path.join(ROOT, "references", "measure", "gates_cine.json"), encoding="utf-8"))["gate"]; M, n = measure(files)
    band = lambda v, b: (b[0] is None or v >= b[0]) and (b[1] is None or v <= b[1]); R = []
    for k, g in G.items():
        if M.get(k) is None or (interior and g.get("exterior")): continue
        v = M[k]; st = "PASS" if band(v, g["pass"]) else "WARN" if band(v, g["warn"]) else "FAIL"
        R.append(dict(name=g["text"], value=v, status=st, target=g["target"], fix="" if st == "PASS" else g["fix"]))
        print("  %-4s %-58s %-8s target %s" % (st, g["text"], v, g["target"]))
        if st != "PASS": print("         FIX: " + g["fix"])
    nf = sum(r["status"] == "FAIL" for r in R); nw = sum(r["status"] == "WARN" for r in R)
    json.dump(dict(source=src, frames=n, values=M, gates=R), open(os.path.join(out, "cine_look.json"), "w"), indent=1)
    md = ["# Cinematic look check", "", "%d gates: %d pass, %d warn, %d fail. %d frames measured." % (len(R), len(R) - nf - nw, nw, nf, n), "", "| | Gate | Value | Target | Fix |", "|-|-|-|-|-|"] + ["| %s | %s | %s | %s | %s |" % (r["status"], r["name"], r["value"], r["target"], r["fix"]) for r in R]
    open(os.path.join(out, "cine_look.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print("RESULT: %d FAIL, %d WARN of %d gates -> %s" % (nf, nw, len(R), os.path.join(out, "cine_look.md"))); sys.exit(1 if nf else 0)
