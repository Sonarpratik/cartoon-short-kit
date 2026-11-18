"""Detail density (added 2026-11-05 for Night Witches, CB: "more detailed quality").

Two numbers per frame, both computed at 540x960 with the burned-in caption band (62-78 % of height) masked:
  edge_density  share of pixels whose Sobel gradient magnitude on luma exceeds 0.08 (painted detail, props, lines)
  regions       number of distinct flat-colour regions >= 30 px after quantising to 32 colours (objects / shapes in frame)
  fine_regions  regions of 30-600 px (small props, secondary detail)
Instrument check (run with --validate): a flat frame reads ~0 / 1; a checkerboard of 40 px squares reads high.

Usage: python detail_density.py img1.png img2 ... [--json out.json]
       python detail_density.py --validate
"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage

W, H = 540, 960
CAP = (0.62, 0.78)

def metrics(img: Image.Image):
    a = np.asarray(img.convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    mask = np.ones((H, W), bool); mask[int(CAP[0] * H):int(CAP[1] * H)] = False
    Y = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    gx = ndimage.sobel(Y, 1); gy = ndimage.sobel(Y, 0); g = np.hypot(gx, gy) / 4
    edge = float((g[mask] > 0.08).mean())
    q = np.asarray(img.convert("RGB").resize((W, H), Image.LANCZOS).quantize(32, method=Image.Quantize.MEDIANCUT))
    q = np.where(mask, q, 255)
    regions = fine = 0
    for c in np.unique(q):
        if c == 255: continue
        lab, n = ndimage.label(q == c)
        if n == 0: continue
        sizes = np.bincount(lab.ravel())[1:]
        regions += int((sizes >= 30).sum()); fine += int(((sizes >= 30) & (sizes <= 600)).sum())
    return {"edge_density": round(edge, 4), "regions": regions, "fine_regions": fine}

def validate():
    flat = Image.new("RGB", (W, H), (60, 80, 120))
    cb = np.indices((H, W)).sum(0) // 1; cb = (((np.indices((H, W))[0] // 40) + (np.indices((H, W))[1] // 40)) % 2 * 200 + 30).astype(np.uint8)
    chk = Image.fromarray(np.stack([cb] * 3, -1))
    print("flat", metrics(flat)); print("checker40", metrics(chk))

if __name__ == "__main__":
    a = sys.argv[1:]
    if "--validate" in a: validate(); sys.exit()
    out = a[a.index("--json") + 1] if "--json" in a else None
    files = [x for x in a if x != "--json" and x != out]
    R = {f: metrics(Image.open(f)) for f in files}
    for f, m in R.items(): print(f.split("/")[-1].split("\\")[-1], m)
    if out: json.dump(R, open(out, "w"), indent=1)
