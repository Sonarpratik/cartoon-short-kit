"""face_fix.py (shared copy): per-card face correction on a graded frame, CPU, after tools/pc_post.py. From the Wrong Helmet EP 1 final
(episodes/wrong-helmet/look/face_fix.py, 2026-11-11), used on all 1500 frames of its final: lit side L* 94.8-97, cast within +-3, no clipping.
EP = the episode folder (it reads out/plan/camera_baked.json and out/lock/cards/<who>/index.json + PNGs). Original docstring follows."""
"""face_fix.py: per-card face correction on a graded frame (CPU, after tools/pc_post.py). CB: heads read clean WHITE, no grey, no lilac.
For every card visible on frame f, the face centre and radius come from the card image used on that frame (the centroid of its white face pixels,
card px -> metres via index.json), projected with out/plan/camera_baked.json (same geometry as face_wh.py). Inside a soft disc over the face, only
near-white pixels change: their colour cast is pulled to neutral (blue minus red -> 0) and their brightness is mapped so the lit side lands at
TARGET (sRGB, about L* 95) through a soft shoulder that never reaches 255 flat. Relative shading inside the face (the far-edge shadow) is kept.
    import face_fix; FF = face_fix.FaceFix(EP); arr = FF.fix(arr_uint8, f)        or  python face_fix.py <graded.png> <frame> <out.png>"""
import os, json, math, sys
import numpy as np
from PIL import Image
TARGET, SHOULDER = 241.0, 250.0            # lit-side 85th percentile target, and the soft ceiling for the brightest face pixels
class FaceFix:
    def __init__(self, EP):
        self.EP = EP; L = os.path.join(EP, "out", "lock", "cards")
        self.cam = {c["f"]: c for c in json.load(open(os.path.join(EP, "out", "plan", "camera_baked.json")))["frames"]}
        self.idx = {w: json.load(open(os.path.join(L, w, "index.json"))) for w in os.listdir(L) if os.path.exists(os.path.join(L, w, "index.json"))}
        self.L = L; self._face = {}; self.log = {}
    def _card_face(self, w, img):
        k = (w, img)
        if k not in self._face:
            d = self.idx[w]; fn = next(i["file"] for i in d["images"] if i["img"] == img)
            a = np.asarray(Image.open(os.path.join(self.L, w, fn)).convert("RGBA").reduce(4)).astype(np.float32)
            m = (a[..., 3] > 250) & (a[..., :3].min(-1) > 225)
            if m.sum() < 50: self._face[k] = None
            else:
                ys, xs = np.nonzero(m); cy, cx = np.median(ys) * 4, np.median(xs) * 4; r = math.sqrt(m.sum() / math.pi) * 4; mpp = d["metres_per_px"]
                self._face[k] = ((cx - d["centre_px"]) * mpp, (d["ground_px"] - cy) * mpp, r * mpp)
        return self._face[k]
    def faces(self, f, W, H):
        c = self.cam.get(f); out = []
        if not c: return out
        P, A = np.array(c["pos"]), np.array(c["aim"]); fw = A - P; fw /= np.linalg.norm(fw); rt = np.cross(fw, [0, 0, 1.]); rt /= np.linalg.norm(rt); u2 = np.cross(rt, fw)
        t = math.tan(math.radians(c["fov_v"]) / 2)
        for w, d in self.idx.items():
            r = next((x for x in d["runs"] if x["f0"] <= f <= x["f1"]), None)
            if not r or not r.get("visible"): continue
            fc = self._card_face(w, r["img"])
            if not fc: continue
            ox, oz, rad = fc; ox = -ox if r.get("flip") else ox
            pos = np.array(r["pos"], float); to = P - pos; to[2] = 0; n = np.linalg.norm(to)
            side = np.cross([0, 0, 1.], to / n) if n > 1e-6 else rt
            q = pos + side * ox + np.array([0, 0, oz]); dv = q - P; z = dv @ fw
            if z <= .05: continue
            x = (dv @ rt) / (z * t * W / H); y = (dv @ u2) / (z * t); cx, cy = (.5 + x / 2) * W, (.5 - y / 2) * H; rp = rad / (2 * z * t) * H
            if rp < 4 or not (-rp < cx < W + rp and -rp < cy < H + rp): continue
            out.append((w, cx, cy, rp))
        return out
    def fix(self, arr, f):
        a = arr.astype(np.float32); H, W = a.shape[:2]; rec = {}
        for w, cx, cy, rp in self.faces(f, W, H):
            x0, x1, y0, y1 = max(0, int(cx - rp * 1.15)), min(W, int(cx + rp * 1.15) + 1), max(0, int(cy - rp * 1.15)), min(H, int(cy + rp * 1.15) + 1)
            if x1 - x0 < 4 or y1 - y0 < 4: continue
            sub = a[y0:y1, x0:x1]; yy, xx = np.mgrid[y0:y1, x0:x1]; dd = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / rp
            disc = np.clip((1.12 - dd) / .12, 0, 1)                                         # soft edge of the disc
            mx = sub.max(-1); mn = sub.min(-1); sat = (mx - mn) / np.maximum(mx, 1)
            white = np.clip((mx - 120) / 60, 0, 1) * np.clip((.32 - sat) / .12, 0, 1)            # near-white face pixels; ink, eyes, mouth, uniform stay
            wgt = disc * white
            sel = wgt > .5
            if sel.sum() < 30: continue
            px = sub[sel]; cast = float(np.mean(px[:, 2] - px[:, 0])); lit = float(np.percentile(px.mean(1), 85))
            g = TARGET / max(lit, 1.0)
            nb = sub.copy()
            nb[..., 0] += cast * .5; nb[..., 2] -= cast * .5                                     # neutral: equal red and blue around the same grey level
            gm = (nb[..., 1] - (nb[..., 0] + nb[..., 2]) / 2)[sel].mean(); nb[..., 1] -= gm * .8   # and no green tint either
            nb = nb * g
            k = SHOULDER; nb = np.where(nb > k - 20, (k - 20) + 20 * np.tanh((nb - (k - 20)) / 20), nb)   # soft shoulder: no flat 255 blob
            sub[:] = sub * (1 - wgt[..., None]) + nb * wgt[..., None]
            rec[w] = dict(cast_before=round(cast), lit_before=round(lit), gain=round(g, 3))
        self.log[f] = rec
        return np.clip(a + .5, 0, 255).astype(np.uint8)
if __name__ == "__main__":
    EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); FF = FaceFix(EP)
    im = np.asarray(Image.open(sys.argv[1]).convert("RGB")); Image.fromarray(FF.fix(im, int(sys.argv[2]))).save(sys.argv[3]); print(FF.log)
