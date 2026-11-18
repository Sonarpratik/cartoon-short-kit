# PIECE 17: TIME PASSING IN ONE SHOT (night turns to dawn inside the take; no cut, no second shot).
# Source: episodes/armor-no-holes/stretches/armor-s5-payoff/time_pass.py (16 lines) with build_film.py lines 1-3 and 19 and render_dawn.sh. Film: S5, one take of 263 frames, the pass over f108-132 (0.8 s),
# while the camera is in flight (travel to the station at f128), so the change of light rides on a move and never on a rest.
# HOW: the SAME take is rendered twice with the same camera and the same acts: <dir>/n in the first light (frames 0..P1), <dir>/d in the second light (frames P0..T-1).
# Across P0..P1 the second is laid over the first with a soft edge that TRAVELS: with --from top the sky turns first and the ground last.
# Cost: only the frames P0..P1 are rendered twice (25 of 263 in the armor film).
# run:  python time_pass.py <dir> P0 P1 T [--soft 0.6] [--from top|bottom|left|right] [--a n] [--b d]
# WHAT MUST CHANGE FOR A NEW STORY: the two lights (they are two full light set-ups of the place, built by the lighting plan: sun height, sky, lamps on or off, shadows),
# where the change starts (dawn and dusk: the sky, --from top; a lamp lit at one side of a room: that side; a storm front: the side it comes from), how long (0.8 s here for a whole night;
# a slow afternoon may take 2 s), and WHAT ELSE shows the time: something in the set must move with it (armor: the lantern goes dark, the chalk words appear; a shadow that swings,
# a candle that is shorter, a cup that is empty). The blend alone reads as a filter.
# NOT FOR: a change of PLACE (use the fly-through piece), or two lights whose cameras or acts differ by even one frame (the blend then shows double edges).
import sys, os, shutil, argparse
import numpy as np
from PIL import Image

def ss(x):
    x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

def mask(u, h, w, soft=0.6, origin='top'):
    """0 = first light, 1 = second light. u = 0..1 through the pass. The edge enters at `origin` and has crossed the picture at u = 1; `soft` = how wide the soft edge is."""
    if origin in ('top', 'bottom'):
        y = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
        if origin == 'bottom': y = 1 - y
    else:
        y = np.linspace(0, 1, w, dtype=np.float32)[None, :, None]
        if origin == 'right': y = 1 - y
    return ss(u * (1 + soft) - soft * y)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('dir'); ap.add_argument('p0', type=int); ap.add_argument('p1', type=int); ap.add_argument('t', type=int)
    ap.add_argument('--soft', type=float, default=0.6); ap.add_argument('--from', dest='origin', default='top', choices=['top', 'bottom', 'left', 'right']); ap.add_argument('--a', default='n'); ap.add_argument('--b', default='d')
    A = ap.parse_args(); D, P0, P1, T = A.dir, A.p0, A.p1, A.t
    for f in range(T):
        n = os.path.join(D, A.a, 'f_%05d.png' % f); d = os.path.join(D, A.b, 'f_%05d.png' % f); o = os.path.join(D, 'f_%05d.png' % f)
        if f <= P0: shutil.copyfile(n, o); continue
        if f >= P1: shutil.copyfile(d, o); continue
        a = np.asarray(Image.open(n).convert('RGB'), dtype=np.float32); b = np.asarray(Image.open(d).convert('RGB'), dtype=np.float32)
        m = mask((f - P0) / float(P1 - P0), a.shape[0], a.shape[1], A.soft, A.origin)
        Image.fromarray(np.clip(a + (b - a) * m, 0, 255).astype(np.uint8)).save(o)
    print('time pass', P0, P1, 'frames', T, 'soft', A.soft, 'from', A.origin)

if __name__ == '__main__': main()
