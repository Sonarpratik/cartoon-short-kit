"""Shared I/O for the measuring tools: ffmpeg frame iterator + caption mask.

All tools follow the methods in references/reports/*.md. Reference videos carry a
burned-in one-word caption at ~60-75 % of frame height; every statistic masks it.
"""
import subprocess, numpy as np

CAPTION_BAND = (0.635, 0.755)  # fraction of height masked (grade.md: rows 650-706/960 + margin)

def frames(path, w=360, h=640, fps=None, gray=True, start=None, dur=None):
    """Yield float32 frames 0..1 (h, w) gray or (h, w, 3) RGB."""
    pix = "gray" if gray else "rgb24"
    cmd = ["ffmpeg", "-v", "error"]
    if start is not None: cmd += ["-ss", str(start)]
    cmd += ["-i", path]
    if dur is not None: cmd += ["-t", str(dur)]
    vf = f"scale={w}:{h}"
    if fps: vf = f"fps={fps},{vf}"
    cmd += ["-vf", vf, "-f", "rawvideo", "-pix_fmt", pix, "-"]
    n = w * h * (1 if gray else 3)
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stdin=subprocess.DEVNULL)
    try:
        while True:
            buf = p.stdout.read(n)
            if len(buf) < n: break
            a = np.frombuffer(buf, np.uint8).astype(np.float32) / 255.0
            yield a.reshape((h, w) if gray else (h, w, 3))
    finally:
        p.stdout.close(); p.wait()

def caption_mask(h):
    """Boolean row mask: True = keep."""
    keep = np.ones(h, bool)
    a, b = int(CAPTION_BAND[0] * h), int(CAPTION_BAND[1] * h)
    keep[a:b] = False
    return keep

def luma(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
