"""Empty-space check (added 2026-11-07, CB: "maximum density, no empty space").

The frame (540x960, caption band 62-78 % masked) is cut into a 6 x 10 grid of cells (90 x 96 px). A cell is EMPTY when it
holds almost no drawn information: Sobel edge density < 0.02 AND luma std < 0.035 (a flat fill, a bare sky gradient, a
blank wall). Reported per frame:
  empty_pct      share of (unmasked) cells that are empty
  max_empty_run  largest 4-connected block of empty cells (in cells)
  layers         depth layers present from a 3-band split of edge activity: top / middle / bottom thirds each with
                 edge density >= 0.03 (a proxy for background / midground / foreground all carrying detail)
Usage: python empty_space.py img... [--json out.json]   |   python empty_space.py --validate
"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage
W, H, GX, GY = 540, 960, 6, 10
CAP = (0.62, 0.78)

def metrics(img):
    a = np.asarray(img.convert("RGB").resize((W, H), Image.LANCZOS)).astype(np.float32) / 255
    Y = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    g = np.hypot(ndimage.sobel(Y, 1), ndimage.sobel(Y, 0)) / 4
    e = g > 0.08
    cw, ch = W // GX, H // GY
    empty = np.zeros((GY, GX), bool); valid = np.ones((GY, GX), bool)
    for j in range(GY):
        y0, y1 = j * ch, (j + 1) * ch
        if y0 / H >= CAP[0] - 0.02 and y1 / H <= CAP[1] + 0.02: valid[j, :] = False; continue
        for i in range(GX):
            c = (slice(y0, y1), slice(i * cw, (i + 1) * cw))
            empty[j, i] = e[c].mean() < 0.02 and Y[c].std() < 0.035
    lab, n = ndimage.label(empty & valid)
    run = int(np.bincount(lab.ravel())[1:].max()) if n else 0
    thirds = [e[int(k * H / 3):int((k + 1) * H / 3)].mean() for k in range(3)]
    return {"empty_pct": round(float((empty & valid).sum() / valid.sum() * 100), 1), "max_empty_run": run,
            "layers": int(sum(t >= 0.03 for t in thirds)), "thirds_edge": [round(float(t), 3) for t in thirds]}

if __name__ == "__main__":
    a = sys.argv[1:]
    if "--validate" in a:
        print("flat", metrics(Image.new("RGB", (W, H), (40, 50, 90))))
        n = (np.random.default_rng(1).random((H, W)) * 255).astype(np.uint8); print("noise", metrics(Image.fromarray(n)))
        sys.exit()
    out = a[a.index("--json") + 1] if "--json" in a else None
    files = [x for x in a if x not in ("--json", out)]
    R = {f: metrics(Image.open(f)) for f in files}
    for f, m in R.items(): print(f.replace("\\", "/").split("/")[-1], m)
    if out: json.dump(R, open(out, "w"), indent=1)
