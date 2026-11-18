"""Model-detail props replacing the kit's primitives: crates with planks and nails, barrels with staves and hoops, fruit with stems, wheelbarrow, boats with planking."""
import math, random, bmesh
from mathutils import Matrix, Vector
from . import scatter as S
MB = S.MB
def torus(mb, c, R_, a, mat, seg=24, s2=6, sq=1.0):
    t = bmesh.new()
    rings = [[t.verts.new((c[0] + (R_ + a * math.cos(j * 6.283 / s2)) * math.cos(i * 6.283 / seg), c[1] + (R_ + a * math.cos(j * 6.283 / s2)) * math.sin(i * 6.283 / seg) * sq, c[2] + a * math.sin(j * 6.283 / s2))) for j in range(s2)] for i in range(seg)]
    for i in range(seg):
        for j in range(s2): t.faces.new((rings[i][j], rings[(i + 1) % seg][j], rings[(i + 1) % seg][(j + 1) % s2], rings[i][(j + 1) % s2]))
    return mb.take(t, mat, Matrix.Identity(4))
def fruit_pile(b, r, mat, stem, leaf, rad, n, kind):
    for i in range(n):
        x, y, z = r.uniform(-.3, .3), r.uniform(-.2, .2), .2 + r.uniform(0, .13); q = rad * r.uniform(.85, 1.15)
        sq = {"pear": (1, 1, 1.35), "lemon": (1.3, 1, 1), "plum": (1, 1, 1.15)}.get(kind, (1, 1, .95)); b.ico((x, y, z), q, mat, 2, sq=sq)
        if i % 2 == 0: b.rod((x, y, z + q * sq[2] * .9), (x + .012, y, z + q * sq[2] * 1.3), .005, stem, 5)
        if i % 5 == 0: b.box((x + .03, y, z + q * sq[2] * 1.2), (.05, .025, .004), leaf, ry=.4)
def apply(M, K, r):
    m = K["m"]; wd, wi, mt, bl, fruit, cl, cl2, ca = K["wd"], K["wi"], K["mt"], K["bl"], K["fruit"], K["cl"], K["cl2"], K["ca"]
    nail = M.get("metal", color=(70, 72, 80)); dk = M.get("wood_grain", color=(96, 74, 60)); stem = M.get("wood_grain", color=(92, 70, 46)); leaf = M.get("foliage", color=(80, 130, 60))
    c = MB("crate", [wi, dk, nail])
    for side in (-1, 1):
        for z in (.09, .25, .41): c.box((0, side * .3, z), (.88, .02, .13), 0, rx=r.uniform(-.01, .01)); c.box((side * .44, 0, z), (.02, .58, .13), 0)
        for sx in (-1, 1): c.box((side * .42, sx * .28, .25), (.05, .05, .5), 1)
        for z in (.09, .25, .41):
            for sx in (-.4, .4): c.sph((sx, side * .315, z), (.009, .004, .009), 2, 6, 4)
    for x in range(6): c.box((-.36 + x * .145, 0, .02), (.13, .58, .02), 0)
    m["crate"] = c.mesh()
    b = MB("barrel", [wd, mt, dk]); n = 18
    for i in range(n):
        a = i * 6.283 / n; a2 = a + 6.283 / n * .9
        pts = [(z / 8, .24 + .08 * math.sin(math.pi * z / 8)) for z in range(9)]
        for k in range(8):
            z0, r0 = pts[k]; z1, r1 = pts[k + 1]; t = bmesh.new(); v = [t.verts.new((r0 * math.cos(a), r0 * math.sin(a), z0 * .8)), t.verts.new((r0 * math.cos(a2), r0 * math.sin(a2), z0 * .8)), t.verts.new((r1 * math.cos(a2), r1 * math.sin(a2), z1 * .8)), t.verts.new((r1 * math.cos(a), r1 * math.sin(a), z1 * .8))]; t.faces.new(v); b.take(t, 0 if i % 3 else 2, Matrix.Identity(4))
    for z, rr in ((.14, .285), (.27, .315), (.53, .315), (.66, .285)): torus(b, (0, 0, z), rr, .012, 1, 28, 4)
    b.cyl((0, 0, .75), .24, .02, 2, 18); b.cyl((0, 0, .03), .24, .02, 2, 18); m["barrel"] = b.mesh()
    k = MB("basket", [wi, dk]); nr = 22
    for i in range(nr): a = i * 6.283 / nr; k.rod((.21 * math.cos(a), .21 * math.sin(a), .01), (.3 * math.cos(a), .3 * math.sin(a), .28), .012, 0, 5)
    for z, rr in [(.05 + j * .046, .222 + j * .0155) for j in range(6)]: torus(k, (0, 0, z), rr, .017, 0 if int(z * 100) % 2 else 1, 26, 4)
    torus(k, (0, 0, .29), .305, .026, 1, 28, 6); k.cyl((0, 0, .015), .21, .02, 1, 20); m["basket"] = k.mesh()
    s = MB("sack", [bl, M.get("rope")]); s.sph((0, 0, .3), (.3, .24, .32)); s.sph((.04, .03, .5), (.17, .14, .14)); s.cyl((0, 0, .72), .05, .14, 0, 10, r2=.13); torus(s, (0, 0, .67), .07, .018, 1, 18, 5); m["sack"] = s.mesh()
    for nm, kn, rad, ct, kind in (("apples", 0, .05, 34, "apple"), ("oranges", 1, .055, 30, "orange"), ("pears", 2, .05, 26, "pear"), ("lemons", 3, .042, 34, "lemon"), ("plums", 4, .032, 46, "plum")):
        f = MB(nm, [wi, fruit[kn], stem, leaf, dk]); f.box((0, 0, .1), (.72, .5, .2), 0)
        for sx in (-.36, .36): f.box((sx, 0, .1), (.03, .54, .22), 4)
        fruit_pile(f, r, 1, 2, 3, rad, ct, kind); m[nm] = f.mesh()
    w = MB("wheelbarrow", [M.get("wood_grain", color=(150, 112, 78)), wd, M.get("rubber"), nail]); w.box((0, .05, .42), (.56, .9, .03)); w.box((-.3, .05, .56), (.03, 1.0, .3), 0, ry=.35); w.box((.3, .05, .56), (.03, 1.0, .3), 0, ry=-.35); w.box((0, -.42, .55), (.62, .03, .3), 0, rx=-.35); w.box((0, .56, .55), (.62, .03, .3), 0, rx=.35)
    for sx in (-.25, .25): w.rod((sx, .85, .22), (sx * 1.1, -1.3, .62), .03, 1); w.rod((sx, -.3, .42), (sx * 1.1, -.5, 0), .025, 1)
    t = bmesh.new(); torus(w, (0, 0, 0), 1, .001, 0, 3, 3) if False else None
    w.cyl((0, .95, .24), .05, .1, 3, 10, rot=(0, 1.57, 0)); w.cyl((0, .95, .24), .24, .05, 2, 22, rot=(0, 1.57, 0), caps=False)
    for i in range(8): a = i * .785; w.rod((0, .95, .24), (0, .95 + .22 * math.cos(a), .24 + .22 * math.sin(a)), .012, 3, 5)
    m["wheelbarrow"] = w.mesh()
    bk = MB("bucket", [mt, K["dark"]]); bk.cyl((0, 0, .17), .14, .34, 0, 18, r2=.18, caps=False); bk.cyl((0, 0, .012), .14, .02, 0, 18); bk.cyl((0, 0, .32), .172, .01, 1, 18); torus(bk, (0, 0, .34), .18, .009, 0, 26, 4)
    for i in range(13): a0, a1 = math.pi * i / 13, math.pi * (i + 1) / 13; bk.rod((.18 * math.cos(a0), 0, .34 + .2 * math.sin(a0)), (.18 * math.cos(a1), 0, .34 + .2 * math.sin(a1)), .006, 0, 5)
    m["bucket"] = bk.mesh()
    ca1 = MB("cabbage", [M.get("foliage", color=(130, 180, 90))]);
    for i in range(9): a = i * 2.4; ca1.ico((.05 * math.cos(a), .05 * math.sin(a), .12 + .01 * i), .1 + .006 * (9 - i), 0, 2, sq=(1.1, 1, .85))
    m["cabbage"] = ca1.mesh()
    me = MB("melon", [M.get("matte", color=(60, 124, 62), rough=.4, coat=.3), M.get("matte", color=(150, 196, 110), rough=.4, coat=.3), stem]); me.sph((0, 0, .13), (.2, .14, .14), 0, 24, 14)
    for i in range(8): a = i * .785; me.sph((.195 * math.cos(a) * .7, .137 * math.sin(a) * .7, .17), (.03, .035, .1), 1, 8, 6)
    me.rod((-.2, 0, .13), (-.25, .01, .14), .01, 2, 5); m["melon"] = me.mesh()
    stone = M.get("stone"); ss = MB("stones", [stone, M.get("stone", color=(176, 162, 140))])
    for i in range(6):
        t = bmesh.new(); bmesh.ops.create_icosphere(t, subdivisions=2, radius=1)
        for v in t.verts: v.co *= r.uniform(.8, 1.16)
        ss.take(t, i % 2, Matrix.Translation((r.uniform(-.28, .28), r.uniform(-.28, .28), -.01)) @ Matrix.Diagonal((r.uniform(.03, .075), r.uniform(.025, .06), r.uniform(.014, .03), 1)))
    m["stones"] = ss.mesh()
def planked_boat(M, n, col, K):
    """clinker hull built plank by plank (lofted strakes), deck, cabin, mast and rigging."""
    pa = M.get("boat_paint", color=col); lt = M.get("boat_paint", color=tuple(min(255, int(c * 1.18)) for c in col)); deck = M.get("wood_grain", color=(156, 124, 92)); wh = M.get("matte", color=(214, 208, 196)); wd, dark = K["wd"], K["dark"]; rp = M.get("rope")
    b = MB(n, [pa, lt, deck, wh, wd, dark, rp]); L = 8.0; st = 9; seg = 24
    def hx(y, lv):  # half beam at y (-1..1) and strake level (0..1)
        return 1.25 * (1 - abs(y) ** 2.4) ** .55 * (.35 + .65 * lv ** .6)
    for k in range(st):
        z0, z1 = -.7 + k * .17, -.7 + (k + 1) * .17 + .012; t = bmesh.new(); rows = []
        for side in (-1, 1):
            rows.append([(t.verts.new((side * hx(i / seg * 2 - 1, k / st) * .999, (i / seg * 2 - 1) * L / 2, z0)), t.verts.new((side * hx(i / seg * 2 - 1, (k + 1) / st), (i / seg * 2 - 1) * L / 2, z1))) for i in range(seg + 1)])
        for rw, side in zip(rows, (-1, 1)):
            for i in range(seg):
                f = (rw[i][0], rw[i + 1][0], rw[i + 1][1], rw[i][1]); t.faces.new(f if side > 0 else f[::-1])
        b.take(t, k % 2, Matrix.Identity(4))
    b.box((0, 0, .85), (2.2, 6.6, .06), 2); b.box((0, .8, 1.45), (1.3, 1.6, 1.2), 3); b.box((0, .8, 2.1), (1.5, 1.8, .08), 4)
    for sx in (-.66, .66):
        for y in (.3, 1.2): b.box((sx, y, 1.55), (.02, .5, .42), 5)
    b.rod((0, -1, .9), (0, -1, 6.5), .06, 4); b.rod((0, -1, 3), (0, -3.6, 2.2), .04, 4); b.rod((0, -1, 6.4), (0, 3.9, 1), .012, 6); b.rod((0, -1, 6.4), (0, -3.9, 1), .012, 6)
    for sx in (-1, 1):
        for y in range(-3, 4): b.rod((sx * hx(y / 4, 1) * .96, y, .96), (sx * hx(y / 4, 1) * .96, y, 1.35), .012, 4);
    return b.mesh()
