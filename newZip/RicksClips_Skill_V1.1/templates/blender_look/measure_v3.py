"""3D WORLD STYLE look numbers. Same formulas as references/remeasure/3d_2026-11-08/scripts/look.py (1080x1920, caption band
0.64-0.76 H masked), rewritten on numpy/scipy/PIL because cv2 is not installed here.
Usage: python measure_v3.py [--json out.json] img...   Prints the report's targets for comparison."""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "measure"))
import numpy as np
from PIL import Image
from scipy import ndimage as ni
from grade_metrics import srgb_to_lab

def disk(d):
    r = d // 2; y, x = np.ogrid[-r:r + 1, -r:r + 1]; return x * x + y * y <= r * r + 1

def m(f):
    im = Image.open(f).convert("RGB").resize((1080, 1920), Image.BOX); H, W = 1920, 1080
    k = np.ones((H, W), bool); k[int(.64 * H):int(.76 * H)] = False
    rgb = np.asarray(im).astype(np.float32) / 255; Y = .299 * rgb[..., 0] + .587 * rgb[..., 1] + .114 * rgb[..., 2]
    hsv = np.asarray(im.convert("HSV")).astype(np.float32); S = hsv[..., 1] / 255; Hh = hsv[..., 0] * 360 / 255
    L, a, b = srgb_to_lab(rgb); C = np.hypot(a, b); y = Y[k]
    r = {"Ymean": round(float(y.mean()), 3)}; lit = k & (L > 50); r["litC50"] = round(float(np.median(C[lit])), 1)
    dk = k & (Y < .3) & (Y > .06); r["shadow_ab"] = [round(float(np.median(a[dk])), 1), round(float(np.median(b[dk])), 1)]
    t = np.percentile(y, 1); r["black"] = [round(float(v)) for v in rgb[k & (Y <= t)].mean(0) * 255]
    c = Y[int(.35 * H):int(.65 * H), int(.3 * W):int(.7 * W)].mean(); q = int(.12 * W)
    r["vig"] = round(float(np.concatenate([Y[:q, :q].ravel(), Y[:q, -q:].ravel(), Y[-q:, :q].ravel(), Y[-q:, -q:].ravel()]).mean() / c), 2)
    hp = Y - ni.gaussian_filter(Y, 3); bs = 16; hb, wb = H // bs, W // bs
    bl = lambda x: x[:hb * bs, :wb * bs].reshape(hb, bs, wb, bs).transpose(0, 2, 1, 3).reshape(hb, wb, -1)
    sd = bl(hp).std(-1)[bl(k.astype(np.float32)).min(-1) > 0]; r["textured"] = round(float((sd > .015).mean()), 3); r["flat"] = round(float((sd < .004).mean()), 3)
    Y8 = (Y * 255).astype(np.uint8); th = Y8.astype(np.int16) - ni.grey_opening(Y8, footprint=disk(9)).astype(np.int16)
    r["spec"] = round(float(((th > 50) & k).sum() / k.sum()), 4); r["clip_pct"] = round(float((y > .97).mean() * 100), 2)
    sat = k & (S > .25) & (Y > .12); hh = Hh[sat]; n = max(len(hh), 1)
    r["amber"] = round(float(((hh >= 20) & (hh < 70)).sum() / n), 3); r["blue"] = round(float(((hh >= 165) & (hh < 255)).sum() / n), 3); r["red"] = round(float(((hh < 20) | (hh >= 320)).sum() / n), 3)
    return r

if __name__ == "__main__":
    a = sys.argv[1:]; out = a[a.index("--json") + 1] if "--json" in a else None
    files = [x for x in a if x != "--json" and x != out]
    R = {f: m(f) for f in files}
    for f, v in R.items(): print(f.replace(chr(92), "/").split("/")[-1], v)
    print("targets (report): Ymean .46 litC50 21 shadow_ab +6/-8 black 7,4,15 vig .67 textured .39 flat .48 spec .018 clip .9 amber .07 blue .58")
    if out: json.dump(R, open(out, "w"), indent=1)
