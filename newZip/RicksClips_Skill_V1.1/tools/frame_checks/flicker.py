#!/usr/bin/env python
"""FLICKER CHECK (CB_RULES section 5, NO FLICKERING FLOOR; built 2026-11-15 on the goldrush final v2).

Measures, per pair of frames, the change in local brightness that the camera's own motion does NOT explain,
on the floor region (lower part of the frame, caption band masked) or the whole frame.

    python tools/frame_checks/flicker.py <frames dir> [--from a --to b] [--region floor|all] [--json out.json] [--top 8]

How: frames are read at quarter size as luminance (0-255) and blurred a little. Each 16x16 block of frame t+1 is
matched to frame t inside +-6 px (24 px full size) after a global phase-correlation shift, so pans, tilts,
pushes and parallax are explained away block by block. What is left:
  pop   = the floor-wide brightness jump: |median over floor blocks of the signed block-mean change| (lamp flicker,
          a light that pumps the whole floor). Units: 0-255 grey levels.
  shim  = local shimmer: the 75th percentile of the per-block residual after the best shift (shadow-map swimming,
          z-fighting, texture crawl). A character moving covers few blocks, so p75 ignores them.
  aba   = the A-B-A one-frame pattern at frame t: the pixel goes up then back down (or down then up), counted
          as min(|t - t-1|, |t+1 - t|) on opposite signs, after aligning t-1 and t+1 to t; 75th pct of block means.
score per frame = min(pop / POP_T, pop / (POP_K * shim)): over 1 = a floor-wide jump (z-fighting floor, pumping light)
that is big AND not explained by the block motion (fast flights raise shim and pop together; z-fighting raises pop to
~0.7 x shim). The range fails (exit 1) with more than FAIL_FRAMES such frames. aba is reported as WARN on frames whose
motion the blocks follow (shim < SHIM_GATE): local one-frame flips (shadow shimmer, a decal); it also counts acting, so
look before acting on a WARN. Thresholds were set from stretches CB did not flag (s3 harbour, s7 restaurant)
and checked against the flagged ones; see episodes/continue-goldrush-.../FLICKER_FIX.md.
"""
import argparse, glob, json, os, sys
import numpy as np
from PIL import Image, ImageFilter

POP_T, POP_K = 1.0, 0.25    # FAIL frame: pop > POP_T grey levels AND pop > POP_K * shim (a floor-wide jump the block motion does not explain)
ABA_T, SHIM_GATE = 1.5, 8.0  # WARN frame: aba > ABA_T on a frame the blocks follow well (shim < SHIM_GATE); local, not gated
FAIL_FRAMES = 1              # the range FAILS with 2 or more FAIL frames. Calibrated 2026-11-15, see episodes/continue-goldrush-.../FLICKER_FIX.md
B, S = 16, 8                               # block size (quarter-size px); coarse search radius at 1/8 size (+-64 px full size)
CAP = (0.62, 0.79)                         # caption band (fraction of height), masked
FLOOR_Y0 = 0.50                            # floor region starts at half height


def load(p, q=4):
    im = Image.open(p).convert('RGB')
    im = im.resize((im.width // q, im.height // q), Image.BOX).filter(ImageFilter.GaussianBlur(0.8))
    a = np.asarray(im, dtype=np.float32)
    return a[..., 0] * .2126 + a[..., 1] * .7152 + a[..., 2] * .0722


def phase_shift(a, b):
    """integer (dy, dx) so that roll(b, (dy, dx)) ~ a"""
    wy, wx = np.hanning(a.shape[0])[:, None], np.hanning(a.shape[1])[None, :]
    A, Bf = np.fft.fft2((a - a.mean()) * wy * wx), np.fft.fft2((b - b.mean()) * wy * wx)
    R = A * np.conj(Bf); R /= np.abs(R) + 1e-6
    r = np.fft.ifft2(R).real; dy, dx = np.unravel_index(np.argmax(r), r.shape)
    h, w = a.shape
    if dy > h // 2: dy -= h
    if dx > w // 2: dx -= w
    return int(dy), int(dx)


def _block_search(ref, mov, base, rad, b):
    """per block (size b): best (dy, dx) in base + [-rad, rad]^2 so that mov[y + dy, x + dx] ~ ref[y, x]. base = per-block int offsets (nby, nbx, 2)."""
    h, w = ref.shape; nby, nbx = h // b, w // b; H, W = nby * b, nbx * b
    best = np.full((nby, nbx), np.inf, np.float32); vec = np.zeros((nby, nbx, 2), np.int32); r0 = ref[:H, :W]
    uni = (base == base[0, 0]).all()
    if uni:   # one offset for every block: shifted slices of an edge-padded copy (fast)
        oy, ox = int(base[0, 0, 0]), int(base[0, 0, 1]); P = rad + max(abs(oy), abs(ox)); mp = np.pad(mov, P, mode='edge')
    else:
        yy, xx = np.mgrid[0:H, 0:W]; by, bx = yy // b, xx // b
    for dy in range(-rad, rad + 1):
        for dx in range(-rad, rad + 1):
            if uni: sh = mp[P + oy + dy:P + oy + dy + H, P + ox + dx:P + ox + dx + W]
            else: sh = mov[np.clip(yy + base[by, bx, 0] + dy, 0, h - 1), np.clip(xx + base[by, bx, 1] + dx, 0, w - 1)]
            d = np.abs(r0 - sh).reshape(nby, b, nbx, b).mean(axis=(1, 3))
            m = d < best; best[m] = d[m]; vec[m] = base[m] + (dy, dx)
    return vec, best


def align(ref, mov):
    """coarse to fine block matching (1/8 size +-8 px around the global phase shift, then 1/4 size +-2):
    returns mov warped block-wise onto ref and the residual per 16 px block (quarter size)."""
    h, w = ref.shape; nby, nbx = h // B, w // B; H, W = nby * B, nbx * B
    gy, gx = phase_shift(ref, mov)
    if abs(gy) > h // 4 or abs(gx) > w // 4: gy = gx = 0
    half = lambda a: a[:a.shape[0] // 2 * 2, :a.shape[1] // 2 * 2].reshape(a.shape[0] // 2, 2, a.shape[1] // 2, 2).mean(axis=(1, 3))
    rc, mc = half(ref), half(mov)
    base = np.zeros((nby, nbx, 2), np.int32); base[..., 0], base[..., 1] = round(-gy / 2), round(-gx / 2)
    v, _ = _block_search(rc, mc, base, S, B // 2)
    v, best = _block_search(ref, mov, v * 2, 2, B)
    yy, xx = np.mgrid[0:H, 0:W]; by, bx = yy // B, xx // B
    out = mov[np.clip(yy + v[by, bx, 0], 0, h - 1), np.clip(xx + v[by, bx, 1], 0, w - 1)]
    return out, best


def region_mask(h, w, region):
    H, W = h // B * B, w // B * B
    ys = (np.arange(H // B) + .5) * B / h
    keep = ~((ys > CAP[0]) & (ys < CAP[1]))
    if region == 'floor': keep &= ys >= FLOOR_Y0
    return np.repeat(keep[:, None], W // B, 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dir'); ap.add_argument('--from', dest='a', type=int, default=None); ap.add_argument('--to', dest='b', type=int, default=None)
    ap.add_argument('--region', default='floor', choices=['floor', 'all']); ap.add_argument('--json'); ap.add_argument('--top', type=int, default=8)
    o = ap.parse_args()
    fs = sorted(glob.glob(os.path.join(o.dir, '*.png')) + glob.glob(os.path.join(o.dir, '*.jpg')))
    num = lambda p: int(''.join(c for c in os.path.basename(p).split('.')[0] if c.isdigit()) or -1)
    fs = [p for p in fs if (o.a is None or num(p) >= o.a) and (o.b is None or num(p) <= o.b)]
    fs.sort(key=num)
    if len(fs) < 3: print('need 3+ frames'); return 2
    imgs = {}
    def L(i):
        if i not in imgs:
            imgs[i] = load(fs[i])
            for k in [k for k in imgs if k < i - 2]: del imgs[k]
        return imgs[i]
    h, w = L(0).shape; H, W = h // B * B, w // B * B; M = region_mask(h, w, o.region)
    rows = []
    prev_fwd = None   # (aligned t onto t-1 ...) we recompute per frame for clarity
    for i in range(1, len(fs) - 1):
        a, b, c = L(i - 1), L(i), L(i + 1)
        A1, _ = align(b, a)            # t-1 aligned onto t
        C1, res = align(b, c)          # t+1 aligned onto t, residual per block
        bc = b[:H, :W]
        g2 = float(np.median((C1 - bc).reshape(H // B, B, W // B, B).mean(axis=(1, 3))[M]))    # floor-wide signed change t -> t+1
        g1 = float(np.median((bc - A1).reshape(H // B, B, W // B, B).mean(axis=(1, 3))[M]))    # t-1 -> t
        pop = abs(g2 - g1) / 2                                                                    # second difference: a smooth fade or ramp ~0, a jump or a flip = its size
        shim = float(np.percentile(res[M], 75))
        e1, e2 = bc - A1, C1 - bc
        flip = np.where(np.sign(e1) != np.sign(e2), np.minimum(np.abs(e1), np.abs(e2)), 0).reshape(H // B, B, W // B, B).mean(axis=(1, 3))
        aba = float(np.percentile(flip[M], 75))
        sc = round(min(pop / POP_T, pop / max(POP_K * shim, 1e-6)), 3); warn = shim < SHIM_GATE and aba > ABA_T
        rows.append({'f': num(fs[i]), 'pop': round(pop, 3), 'shim': round(shim, 3), 'aba': round(aba, 3), 'score': sc, 'warn': bool(warn)})
    P = lambda k, q: round(float(np.percentile([r[k] for r in rows], q)), 3)
    bad = [r for r in rows if r['score'] > 1.0]
    print(f"flicker.py {o.dir}  frames {rows[0]['f']}-{rows[-1]['f']}  region {o.region}  FAIL frame: pop > {POP_T} and pop > {POP_K} x shim;  WARN frame: aba > {ABA_T} with shim < {SHIM_GATE}")
    print(f"  pop  median {P('pop', 50)}  p95 {P('pop', 95)}  max {P('pop', 100)}")
    print(f"  shim median {P('shim', 50)}  p95 {P('shim', 95)}  max {P('shim', 100)}")
    print(f"  aba  median {P('aba', 50)}  p95 {P('aba', 95)}  max {P('aba', 100)}")
    print(f"  score median {P('score', 50)}  p95 {P('score', 95)}  max {P('score', 100)}  FAIL frames (score > 1): {len(bad)} {[r['f'] for r in bad][:12]}")
    wf = [r['f'] for r in rows if r['warn']]; print(f"  WARN frames (local one-frame flips, camera followed): {len(wf)} {wf[:12]}")
    print('  worst: ' + '  '.join(f"f{r['f']} {r['score']} (pop {r['pop']} shim {r['shim']} aba {r['aba']})" for r in sorted(rows, key=lambda r: -r['score'])[:o.top]))
    if o.json: json.dump(rows, open(o.json, 'w'), indent=0)
    ok = len(bad) <= FAIL_FRAMES
    print('PASS' if ok else 'FAIL'); return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
