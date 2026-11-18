"""Hero object: a wooden inshore fishing boat, built alone at model detail. Forward = +Y, waterline z = 0, about 12.5 m long."""
import math, bmesh
from mathutils import Matrix, Vector
from blender_look import scatter as S
import detail as D
MB = S.MB
L = 12.5
def beam(t):      # half beam along the hull, t -1 (stern) .. 1 (bow)
    if t > 0: return 2.15 * (1 - t ** 2.1) ** .72 + .02
    return 2.15 * (1 - (abs(t) * .96) ** 4) ** .5 * .94 + .02
def sheer(t): return 1.5 + .9 * max(t, 0) ** 1.7 + .32 * min(t, 0) ** 2      # gunwale height, rising to the bow
def section(t, v):   # v 0 (keel) .. 1 (gunwale)
    w = beam(t) * (v ** .55) * (1 - .14 * (1 - v)); kz = -1.15 + .7 * max(t, 0) ** 3; return w, kz + (sheer(t) - kz) * v
def build(M, K, name="hero_boat", paint=(36, 92, 128), trim=(232, 226, 208), accent=(206, 56, 46)):
    hul = M.get("boat_paint", color=paint); hul2 = M.get("boat_paint", color=tuple(min(255, int(c * 1.16)) for c in paint)); bot = M.get("boat_paint", color=accent); tr = M.get("boat_paint", color=trim); deck = M.get("wood_grain", color=(170, 138, 104)); wood = K["wd"]; dark = K["dark"]; metal = K["mt"]; rope = M.get("rope"); glass = K["gl"]; canvas = K["ca"]; rub = M.get("rubber"); red = M.get("boat_paint", color=accent); brass = K["brs"]; net = M.get("rope", color=(116, 136, 112))
    b = MB(name, [hul, hul2, bot, tr, deck, wood, dark, metal, rope, glass, canvas, rub, red, brass, net])
    HUL, HUL2, BOT, TR, DK, WD, DARK, MT, RP, GL, CV, RB, RD, BR, NT = range(15)
    seg, strakes = 56, 15
    for k in range(strakes):           # clinker strakes, each overlapping the one below
        v0, v1 = k / strakes, (k + 1.12) / strakes; v1 = min(v1, 1)
        for side in (-1, 1):
            t_ = bmesh.new(); low, up = [], []
            for i in range(seg + 1):
                t = i / seg * 2 - 1; w0, z0 = section(t, v0); w1, z1 = section(t, v1); y = t * L / 2; low.append(t_.verts.new((side * w0, y, z0))); up.append(t_.verts.new((side * (w1 + .018), y, z1)))
            for i in range(seg):
                f = (low[i], low[i + 1], up[i + 1], up[i]); t_.faces.new(f if side > 0 else f[::-1])
            mat = BOT if k < 5 else (HUL if k % 2 else HUL2)
            b.take(t_, mat, Matrix.Identity(4))
    # gunwale rail, rub strake, stem and keel
    for side in (-1, 1):
        for i in range(seg):
            t0, t1 = i / seg * 2 - 1, (i + 1) / seg * 2 - 1; w0, z0 = section(t0, 1); w1, z1 = section(t1, 1); b.rod((side * w0, t0 * L / 2, z0 + .03), (side * w1, t1 * L / 2, z1 + .03), .05, TR, 6)
            w0, z0 = section(t0, .72); w1, z1 = section(t1, .72); b.rod((side * (w0 + .03), t0 * L / 2, z0), (side * (w1 + .03), t1 * L / 2, z1), .035, TR, 5)
    for i in range(14):
        a0, a1 = i / 14, (i + 1) / 14; b.rod((0, L / 2 - .02 - 0, -.45 + a0 * 3.2), (0, L / 2 + .05 * a1, -.45 + a1 * 3.2), .07, WD, 6)
    b.box((0, -1.0, -1.1), (.14, 10.5, .22), WD)
    # planked deck, hatch, ribs inside the bulwark
    for i in range(16):       # deck planks stop inside the hull curve
        x = -1.9 + i * .255; ts = [t / 100 for t in range(-100, 101) if beam(t / 100) * .92 > abs(x) + .1]
        if ts: y0_, y1_ = min(ts) * L / 2, max(ts) * L / 2; b.box((x, (y0_ + y1_) / 2, 1.2), (.24, y1_ - y0_, .05), DK)
    w_ = beam(-1.0) * .98; z_ = sheer(-1.0)
    b.box((0, -L / 2, .25), (w_ * 2, .08, z_ * 1.5), TR); [b.box((0, -L / 2 - .05, -.4 + i * .3), (w_ * 2 + .04, .02, .03), WD) for i in range(8)]
    for y in range(-5, 5):
        for side in (-1, 1): w, z = section(y / 6.25, 1); b.box((side * (w - .08), y, z - .22), (.07, .1, .46), TR)
    b.box((0, 2.1, 1.35), (1.8, 1.6, .24), WD); [b.box((-.72 + i * .36, 2.1, 1.48), (.32, 1.52, .04), DK) for i in range(5)]
    # wheelhouse: panelled walls, windows with frames, door, roof with lip, stack, lamp, horn
    y0, wx, wy, z0 = -2.4, 1.05, 1.3, 1.25
    for sx in (-1, 1):
        b.box((sx * wx, y0, z0 + 1.0), (.07, wy * 2, 2.0), TR)
        for j in range(9): b.box((sx * (wx + .04), y0 - wy + j * .32 + .04, z0 + 1.0), (.012, .03, 2.0), WD)
        for wi_ in (-.55, .55):
            b.box((sx * (wx + .04), y0 + wi_, z0 + 1.35), (.02, .86, .76), WD); b.box((sx * (wx + .056), y0 + wi_, z0 + 1.35), (.02, .7, .6), GL)
    for sy in (-1, 1):
        b.box((0, y0 + sy * wy, z0 + 1.0), (wx * 2, .07, 2.0), TR)
        for i in range(3):
            x = -.72 + i * .72; b.box((x, y0 + sy * (wy + .04), z0 + 1.35), (.56, .02, .74), WD); b.box((x, y0 + sy * (wy + .056), z0 + 1.35), (.44, .02, .6), GL)
    b.box((.0, y0 - wy - .05, z0 + .8), (.72, .05, 1.6), WD); b.sph((.25, y0 - wy - .1, z0 + .8), (.035, .035, .035), BR)
    b.box((0, y0, z0 + 2.08), (2.5, 3.0, .12), WD); b.box((0, y0, z0 + 2.17), (2.34, 2.84, .06), CV)
    b.cyl((-.5, y0 - .6, z0 + 2.8), .17, 1.3, DARK, 14); b.cyl((-.5, y0 - .6, z0 + 3.48), .23, .1, RD, 14); b.cyl((.65, y0 + .7, z0 + 2.42), .1, .3, BR, 10); b.cyl((.65, y0 + .7, z0 + 2.62), .07, .14, GL, 10); b.rod((-.2, y0 + 1, z0 + 2.2), (-.2, y0 + 1, z0 + 3.3), .018, MT)
    # mast, boom, stays, block and tackle, winch, net on the boom
    my = .4; b.rod((0, my, 1.25), (0, my, 9.0), .1, WD, 12); b.cyl((0, my, 9.04), .13, .08, TR, 12)
    b.rod((0, my, 3.2), (0, 5.4, 3.0), .07, WD, 10); b.rod((0, my, 8.8), (0, 5.4, 3.05), .014, DARK, 5)
    for sx in (-1, 1): b.rod((0, my, 8.7), (sx * 1.9, my, 1.65), .012, DARK, 5); b.rod((0, my, 7.6), (sx * 1.92, my - 2.5, 1.6), .012, DARK, 5)
    b.rod((0, my, 8.8), (0, 6.1, 3.0), .012, DARK, 5); b.rod((0, my, 8.8), (0, -6.2, 2.0), .012, DARK, 5)
    for i in range(7): b.rod((-.05, my, 2.0 + i * .45), (.05, my, 2.0 + i * .45), .012, MT, 5)
    b.cyl((0, .9, 1.7), .22, .9, MT, 14, rot=(0, 1.57, 0)); b.cyl((-.5, .9, 1.7), .3, .06, RD, 16, rot=(0, 1.57, 0)); b.cyl((.5, .9, 1.7), .3, .06, RD, 16, rot=(0, 1.57, 0)); D.torus(b, (0, .9, 1.7), .25, .03, RP, 18, 5)
    for z in (3.0, 2.6, 2.2): b.sph((.0, 4.4, z - .3), (.55, .34, .36), NT, 12, 8)
    for i in range(14): b.ico((.05 * ((i * 7) % 11 - 5), 3.6 + i * .16, 3.0 - .26 * (i % 5)), .05, RD, 1)
    # fittings: cleats, bollards, fairlead, tyre fenders, life ring (accent), anchor at the bow, ladder, lobster floats, side lamps
    for sy in (-4, -1, 3, 5):
        for sx in (-1, 1): w, z = section(sy / 6.25, 1); b.box((sx * (w - .3), sy, z + .1), (.1, .3, .05), MT); b.cyl((sx * (w - .3), sy, z + .03), .05, .12, MT, 8)
    for y in (-4.3, -3.1, -1.4, .3, 2, 3.4):
        w, z = section(y / 6.25, .78); D.torus(b, (0, 0, 0), .001, .001, RB, 3, 3) if False else None; b.cyl((w + .16, y, z - .65), .32, .22, RB, 18, rot=(0, 1.57, 0)); b.rod((w + .02, y, z), (w + .16, y, z - .36), .012, RP, 4)
    t_ = bmesh.new(); D.torus(MB("tmp", []), (0, 0, 0), .001, .001, 0, 3, 3) if False else None; t_.free()
    D.torus(b, (0, 0, 0), .001, .001, RB, 3, 3) if False else None
    ring = MB("ring", [red]);
    for a in range(8): pass
    t2 = bmesh.new(); seg2, s2 = 20, 8; c = (wx + .1, y0 - .55, z0 + .6); R_, a_ = .34, .085; rings = [[t2.verts.new((c[0] + a_ * math.sin(j * 6.283 / s2), c[1] + (R_ + a_ * math.cos(j * 6.283 / s2)) * math.cos(i * 6.283 / seg2), c[2] + (R_ + a_ * math.cos(j * 6.283 / s2)) * math.sin(i * 6.283 / seg2))) for j in range(s2)] for i in range(seg2)]
    for i in range(seg2):
        for j in range(s2): t2.faces.new((rings[i][j], rings[(i + 1) % seg2][j], rings[(i + 1) % seg2][(j + 1) % s2], rings[i][(j + 1) % s2]))
    b.take(t2, RD, Matrix.Identity(4))
    b.rod((.6, 5.6, 2.3), (.6, 6.3, 1.0), .05, MT); b.rod((.3, 6.3, 1.0), (.9, 6.3, 1.0), .05, MT); b.rod((.3, 6.3, 1.0), (.2, 6.4, 1.3), .04, MT); b.rod((.9, 6.3, 1.0), (1.0, 6.4, 1.3), .04, MT)
    for i in range(8): b.rod((-1.75, -3.8, 1.45 + i * .1), (-1.75, -3.6, 1.45 + i * .1), .01, MT, 4)
    for i in range(10): sx = 1 if i % 2 else -1; b.sph((sx * .5, -4.9 + i * .1, 1.5), (.12, .12, .15), RD)
    for sx, c_ in ((-1, RD), (1, HUL2)): b.box((sx * 1.12, y0 + .5, z0 + 2.3), (.06, .24, .2), c_)
    # registration board: stripes only, no letters
    for sx in (-1, 1):
        w, z = section(.62, 1); b.box((sx * (w * .96 + .05), 3.9, z - .4), (.03, 1.5, .3), TR); [b.box((sx * (w * .96 + .07), 3.42 + i * .3, z - .4), (.01, .16, .18), DARK) for i in range(4)]
    return b.mesh()
