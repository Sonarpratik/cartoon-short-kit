"""Ink line measurement (method: references/reports/outlines.md section 2).

Two modes:
1) Frame mode: edge-ink coverage = share of strong luminance edges that carry a dark
   thin line within 2 px (reference 45.1 % frame-wide; ours was 33.4 %), plus dark-stroke
   density. Caption band masked unless --nocaptions.
2) Scan mode: --scan x0 y0 x1 y1 measures one perpendicular profile like scanline.py:
   EW (equivalent full-ink width), FWHM, core luma. A line "counts" if >= 35 % darker
   than the lighter side and FWHM <= 5 px at 720p.

Usage:
  python ink_scan.py frame.png [--nocaptions]
  python ink_scan.py frame.png --scan 120 300 180 300
Reference targets @1080p: world lines EW ~3 px (depth jumps 3.1, silhouettes 3.0,
creases 2.2), core near-black; character ink plum, ~4.6 px.
"""
import sys, json, numpy as np
sys.path.insert(0, __file__.rsplit("\\", 1)[0] if "\\" in __file__ else ".")
from vidio import caption_mask, luma
from PIL import Image
from scipy import ndimage


def load(p, target_h=960):
    im = Image.open(p).convert("RGB")
    if im.height != target_h:
        im = im.resize((im.width * target_h // im.height, target_h), Image.LANCZOS)
    return np.asarray(im, np.float32) / 255


def frame_mode(rgb, mask_captions):
    Y = luma(rgb)
    if mask_captions:
        Y = Y[caption_mask(Y.shape[0])]
    # dark thin strokes: black top-hat
    cl = ndimage.grey_closing(Y, size=(7, 7))
    stroke = (cl - Y) > 0.12
    dark = stroke & (Y < 0.35)
    # strong edges: Sobel magnitude on the closed image (so ink lines themselves
    # don't dominate), threshold at a high percentile
    gx = ndimage.sobel(cl, 1); gy = ndimage.sobel(cl, 0)
    g = np.hypot(gx, gy)
    edge = g > max(0.35, np.percentile(g, 97))
    edge = ndimage.binary_erosion(edge) | edge  # keep as-is; thin later
    inked = ndimage.binary_dilation(dark, iterations=2)
    cov = float((edge & inked).sum()) / max(1, int(edge.sum()))
    return {
        "edge_ink_coverage_pct": round(100 * cov, 1),
        "dark_stroke_pct": round(100 * float(dark.mean()), 2),
        "stroke_core_luma_median": round(float(np.median(Y[dark])), 3) if dark.any() else None,
    }


def scan_mode(rgb, x0, y0, x1, y1, scale_to_1080):
    """Average 5 px across the scan, 0.25 px steps along it."""
    Y = luma(rgb)
    L = np.hypot(x1 - x0, y1 - y0)
    n = int(L / 0.25)
    t = np.linspace(0, 1, n)
    xs, ys = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
    # perpendicular averaging
    px, py = -(y1 - y0) / L, (x1 - x0) / L
    prof = np.zeros(n)
    for off in (-2, -1, 0, 1, 2):
        xi = np.clip((xs + px * off).astype(int), 0, Y.shape[1] - 1)
        yi = np.clip((ys + py * off).astype(int), 0, Y.shape[0] - 1)
        prof += Y[yi, xi]
    prof /= 5
    bg = max(np.percentile(prof, 85), prof[0], prof[-1])
    i = int(np.argmin(prof))
    core = float(prof[i])
    depth = bg - core
    present = depth > 0.35 * bg
    # FWHM
    half = core + depth / 2
    a = i
    while a > 0 and prof[a] < half: a -= 1
    b = i
    while b < n - 1 and prof[b] < half: b += 1
    fwhm_px = (b - a) * 0.25
    # EW: area of dip / (bg - 12/255)
    dip = np.clip(bg - prof, 0, None)
    ew = float(dip.sum() * 0.25 / max(1e-6, bg - 12 / 255))
    s = scale_to_1080
    return {
        "present": bool(present), "EW_at_1080": round(ew * s, 2),
        "FWHM_at_1080": round(fwhm_px * s, 2), "core_luma": round(core, 3),
        "bg_luma": round(float(bg), 3),
    }


if __name__ == "__main__":
    p = sys.argv[1]
    rgb = load(p)
    scale_to_1080 = 1920 / 960 * (960 / rgb.shape[0])  # profile sampled at 960-high => x2
    if "--scan" in sys.argv:
        i = sys.argv.index("--scan")
        coords = [float(v) for v in sys.argv[i + 1:i + 5]]
        print(json.dumps(scan_mode(rgb, *coords, 2.0), indent=1))
    else:
        print(json.dumps(frame_mode(rgb, "--nocaptions" not in sys.argv), indent=1))
