#!/usr/bin/env python
"""Join for lightning-spear.  Usage: python join.py <version> [--workers N] [--grade ../grade/grade.py]
--grade <file>: a module with grade_u8(uint8 HxWx3, film_frame) -> uint8, applied to every joined frame (and the sheet).
Segments tile 0..total-1 with END EXCLUSIVE (seg.end == next seg.start, last end == total_frames).
Blend at each boundary B: frames B-5..B+4, weight of incoming = (f-(B-5)+0.5)/10 (linear).
Loop: last 8 frames blend into S1 f_00000, weight (i+1)/9.
CPU only (PIL/numpy/ffmpeg libx264)."""
import os, sys, json, subprocess, multiprocessing as mp
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(EP))   # skill root
EDL = json.load(open(os.path.join(EP, "EDIT_LIST.json")))
FPS, TOTAL, BL = EDL["fps"], EDL["total_frames"], EDL["blend_frames"]
SEGS = EDL["segments"]
W, H = 1080, 1920
LOOP_N = 8
WAV = os.path.join(EP, "sound", "out", os.environ.get("SPEAR_MIX", "mix_v2.wav"))
FF = "ffmpeg"


def fpath(stretch, f):
    return os.path.join(ROOT, "episodes", "lightning-spear-" + stretch.lower(), "final", "frames", "f_%05d.png" % f)


_have = {}


def have(stretch, f):
    if stretch not in _have:
        d = os.path.dirname(fpath(stretch, 0))
        ok = set()
        if os.path.isdir(d):
            for n in os.listdir(d):
                if not n.endswith(".png"):
                    continue
                try:   # a PNG still being written has no IEND tail: treat as missing
                    with open(os.path.join(d, n), "rb") as fh:
                        fh.seek(-12, 2)
                        if fh.read(12)[4:8] == b"IEND":
                            ok.add(n)
                except OSError:
                    pass
        _have[stretch] = ok
    return ("f_%05d.png" % f) in _have[stretch]


def owner(f):
    for i, s in enumerate(SEGS):
        if s["start"] <= f < s["end"]:
            return i
    raise ValueError(f)


def build_plan():
    plan = [None] * TOTAL
    log = {"hardcut": [], "blends": {i: 0 for i in range(len(SEGS))},
           "missing": {i: [] for i in range(len(SEGS))}, "loop": None}
    for f in range(TOTAL):
        i = owner(f)
        st = SEGS[i]["stretch"]
        plan[f] = ("one", st, f)
        if not have(st, f):
            log["missing"][i].append(f)
    for i in range(1, len(SEGS)):
        B = SEGS[i]["start"]
        out = SEGS[i - 1]["stretch"]
        inc = SEGS[i]["stretch"]
        fr = list(range(B - BL // 2, B + BL // 2))
        miss = [(s, f) for f in fr for s in (out, inc) if not have(s, f)]
        if miss:
            log["hardcut"].append((i + 1, B, ["%s f%d" % m for m in miss]))
            continue
        for k, f in enumerate(fr):
            plan[f] = ("mix", out, f, inc, f, (k + 0.5) / BL)
        log["blends"][i] = BL
    s1 = SEGS[0]["stretch"]
    tail = range(TOTAL - LOOP_N, TOTAL)

    def real(e):
        if e[0] == "one":
            return have(e[1], e[2])
        return have(e[1], e[2]) and have(e[3], e[4])
    if have(s1, 0) and all(real(plan[f]) for f in tail):
        for k, f in enumerate(tail):
            plan[f] = ("loop", plan[f], (s1, 0), (k + 1) / (LOOP_N + 1))
        log["loop"] = "ok"
    else:
        log["loop"] = "SKIPPED (S1 f0 or tail frames missing)"
    return plan, log


def placeholder(stretch, f):
    im = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype("arial.ttf", 90)
    except Exception:
        font = ImageFont.load_default()
    d.text((60, H // 2 - 45), "MISSING %s f%d" % (stretch, f), fill=(255, 255, 255), font=font)
    return np.asarray(im, dtype=np.float32)


def load(stretch, f, film_f):
    if have(stretch, f):
        return np.asarray(Image.open(fpath(stretch, f)).convert("RGB"), dtype=np.float32)
    return placeholder(stretch, film_f)


def render_entry(e, film_f):
    k = e[0]
    if k == "one":
        return load(e[1], e[2], film_f)
    if k == "mix":
        a = load(e[1], e[2], film_f)
        b = load(e[3], e[4], film_f)
        return a * (1 - e[5]) + b * e[5]
    a = render_entry(e[1], film_f)
    b = load(e[2][0], e[2][1], 0)
    return a * (1 - e[3]) + b * e[3]


PLAN = None
GRADE = None


def load_grade(path):
    import importlib.util
    path = os.path.abspath(os.path.join(HERE, path)) if not os.path.isabs(path) else path
    sp = importlib.util.spec_from_file_location("film_grade", path)
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    return m


def frame_u8(f, plan):
    img = np.clip(render_entry(plan[f], f) + 0.5, 0, 255).astype(np.uint8)
    return GRADE.grade_u8(img, f) if GRADE else img


def work(f):
    return frame_u8(f, PLAN).tobytes()


def init(plan, h, gpath=None):
    global PLAN, _have, GRADE
    PLAN = plan
    _have = h
    GRADE = load_grade(gpath) if gpath else None


def main():
    ver = sys.argv[1]
    workers = max(1, (os.cpu_count() or 4) - 2)
    if "--workers" in sys.argv:
        workers = int(sys.argv[sys.argv.index("--workers") + 1])
    out = os.path.join(HERE, "out")
    os.makedirs(out, exist_ok=True)
    gpath = sys.argv[sys.argv.index("--grade") + 1] if "--grade" in sys.argv else None
    global GRADE
    GRADE = load_grade(gpath) if gpath else None
    for s in SEGS:
        have(s["stretch"], 0)
    plan, log = build_plan()
    big = os.path.join(out, "film_%s.mp4" % ver)
    small = os.path.join(out, "film_%s_small.mp4" % ver)
    dur = TOTAL / FPS
    cmd = [FF, "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H),
           "-r", str(FPS), "-i", "-", "-i", WAV,
           "-filter_complex", "[0:v]split[a][b];[b]scale=540:960:flags=lanczos[s];[1:a]apad,atrim=0:%.4f,asplit=2[au][au2]" % dur,
           "-map", "[a]", "-map", "[au]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "medium",
           "-r", str(FPS), "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", big,
           "-map", "[s]", "-map", "[au2]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "medium",
           "-r", str(FPS), "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", small]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with mp.Pool(workers, initializer=init, initargs=(plan, _have, gpath)) as pool:
        for n, b in enumerate(pool.imap(work, range(TOTAL), chunksize=4)):
            try:
                p.stdin.write(b)
            except OSError:
                pool.terminate()
                sys.exit("ffmpeg died (see message above)")
            if n % 200 == 0:
                print("frame", n, "/", TOTAL, flush=True)
    p.stdin.close()
    rc = p.wait()
    if rc:
        sys.exit("ffmpeg failed %d" % rc)
    idx = [round(i * (TOTAL - 1) / 15) for i in range(16)]
    cols, tw = 8, 200
    th = int(tw * H / W)
    sheet = Image.new("RGB", (cols * tw, 2 * th), (0, 0, 0))
    for n, f in enumerate(idx):
        im = Image.fromarray(frame_u8(f, plan)).resize((tw, th), Image.LANCZOS)
        ImageDraw.Draw(im).text((4, 4), str(f), fill=(255, 255, 0))
        sheet.paste(im, ((n % cols) * tw, (n // cols) * th))
    sheet.save(os.path.join(out, "%s_16frames.jpg" % ver), quality=88)

    def probe(path, sel):
        return subprocess.run(["ffprobe", "-v", "error", "-select_streams", sel, "-show_entries",
                               "stream=duration,nb_frames", "-of", "csv=p=0", path],
                              capture_output=True, text=True).stdout.strip().replace("\n", " | ")
    pv, pa = probe(big, "v:0"), probe(big, "a:0")
    L = ["grade: %s" % (gpath or "none"), "JOIN REPORT version=%s  total_frames=%d  fps=%d  duration=%.3fs  (segment end exclusive)" % (ver, TOTAL, FPS, dur),
         "mp4 video(dur,frames)=%s  audio(dur,frames)=%s" % (pv, pa), ""]
    for i, s in enumerate(SEGS):
        m = log["missing"][i]
        ms = "none" if not m else "%d missing (%s)" % (len(m), ",".join(map(str, m)) if len(m) <= 12 else "%d..%d" % (m[0], m[-1]))
        L.append("seg %2d %s frames %d..%d (%d): missing owned frames: %s; blend frames made at start boundary: %d" %
                 (s["seg"], s["stretch"], s["start"], s["end"] - 1, s["end"] - s["start"], ms, log["blends"][i]))
    L.append("")
    L.append("hard cuts (blend skipped, a needed frame missing):")
    L += ["  seg %d boundary %d: %s" % (a, b, ", ".join(c)) for a, b, c in log["hardcut"]] or ["  none"]
    L.append("loop blend (last %d frames into S1 f0): %s" % (LOOP_N, log["loop"]))
    open(os.path.join(out, "%s_report.txt" % ver), "w").write("\n".join(L) + "\n")
    print("\n".join(L))


if __name__ == "__main__":
    mp.freeze_support()
    main()
