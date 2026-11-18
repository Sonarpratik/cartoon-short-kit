"""pc_post.py <look_dir> [--preset day] [--vig v] [--no-overlay] [--only f,f]: the post step of the look pass, system Python on the PC.
<look_dir>/raw/f_#####.png -> <look_dir>/graded/f_#####.png: grade (templates/blender_look/grade.py, the locked grade), then the drawn
layer of the animatic (out/overlay/o_#####.png: effects, lens glints, transitions, captions) laid over it.
post_one(raw, dst, preset, vig, overlay_png or None) does one frame (used by the film render driver)."""
import sys, os, glob
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, "..", "templates", "blender_look")); import grade as G

def post_one(raw, dst, preset="day", vig=None, ov=None):
    a = np.asarray(Image.open(raw).convert("RGB")).astype(np.float32) / 255; im = Image.fromarray((G.grade(a, preset, vig) * 255 + .5).astype(np.uint8)).convert("RGBA")
    if ov and os.path.exists(ov): im = Image.alpha_composite(im, Image.open(ov).convert("RGBA").resize(im.size, Image.LANCZOS))
    im.convert("RGB").save(dst)

if __name__ == "__main__":
    A = sys.argv[1:]; d = os.path.abspath(A[0]); opt = lambda k, v=None: A[A.index(k) + 1] if k in A else v
    preset = opt("--preset", "day"); vig = float(opt("--vig")) if opt("--vig") else None; only = set(int(x) for x in opt("--only").split(",")) if opt("--only") else None
    ovd = os.path.abspath(os.path.join(d, "..", "..", "overlay")); out = os.path.join(d, "graded"); os.makedirs(out, exist_ok=True); n = 0
    for f in sorted(glob.glob(os.path.join(d, "raw", "f_*.png"))):
        fr = int(os.path.basename(f)[2:7])
        if only and fr not in only: continue
        post_one(f, os.path.join(out, os.path.basename(f)), preset, vig, None if "--no-overlay" in A else os.path.join(ovd, "o_%05d.png" % fr)); n += 1
    print("graded", n, "frames ->", out, "preset", preset)
