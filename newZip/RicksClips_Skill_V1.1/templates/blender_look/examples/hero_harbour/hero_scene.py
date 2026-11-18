"""Harbour staged like the approved airfield: one hero (boat) + the fisher as focal point, 3-5 big readable foreground props,
breathing room in the midground, density in the background, ground and sky, a lamp leading the eye. Called from build.py."""
import math, os, bpy, hero_boat
from mathutils import Vector
LIB = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "library", "blenderkit"))
def mean_color(mat):
    """a flat colour for a downloaded material: its base-colour image mean, or its base colour."""
    if not mat or not mat.use_nodes: return (150, 150, 150)
    b = next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if b is None: return (150, 150, 150)
    i = b.inputs["Base Color"]
    if i.links and i.links[0].from_node.type == "TEX_IMAGE" and i.links[0].from_node.image:
        im = i.links[0].from_node.image; px = [0.0] * (im.size[0] * im.size[1] * 4); im.pixels.foreach_get(px); n = len(px) // 4; st = max(1, n // 3000); c = [sum(px[k * 4 + j] for k in range(0, n, st)) / (n / st) for j in range(3)]
    else: c = list(i.default_value[:3])
    f = lambda v: 12.92 * v if v <= .0031308 else 1.055 * v ** (1 / 2.4) - .055
    return tuple(int(255 * f(max(0, x))) for x in c)
def asset(g, name, loc, rz, s, ink=.004):
    """append a cached BlenderKit model. Stage A: toon shading and ink. Stage B: its own PBR materials."""
    sc = g["sc"]; p = os.path.join(LIB, name, name + ".blend")
    with bpy.data.libraries.load(p, link=False) as (src, dst): dst.objects = src.objects
    root = bpy.data.objects.new(name, None); sc.collection.objects.link(root); root.location = loc; root.rotation_euler = (0, 0, rz); root.scale = (s, s, s)
    for o in dst.objects:
        if o is None: continue
        sc.collection.objects.link(o)
        if o.parent is None: o.parent = root
        if o.type == "MESH" and g["TOON"]:
            for i, m in enumerate(o.data.materials): o.data.materials[i] = g["M"].get("boat_paint", color=(52, 98, 156))
            g["TS"].hull(o, ink)
    g["S"].TALLY.add("blenderkit " + name); return root
def build(g):
    M, K, m, MB, P, fr, spread, cl3s, char, ground, clouds, hills, setcam, r, S, sc, rp = (g[k] for k in "M K m MB P fr spread cl3s char ground clouds hills setcam r S sc rp".split())
    wd, wi, mt, dark = K["wd"], K["wi"], K["mt"], K["dark"]; T = g["TUNE"]
    g["ZF"] = .12; setcam((.6, -3.0, 1.75), (-.7, 12, 1.5 + T.get("tilt", 0)), 5.2)
    ground(M.get("water"), 900, -1.1)
    plk = M.get("matte", color=(146, 112, 88)) if g["TOON"] else M.get("tar_wood", color=(120, 94, 72)); g["INK_T"]["plank"] = 0; tints = [M.get("wood_grain", color=c) for c in ((168, 128, 96), (150, 116, 90), (182, 142, 106), (138, 108, 88))] if g["TOON"] else [plk]; me = None
    Q = T.get("quay_y", 4.9)
    pl_ = [MB("plank%d" % i, [t]).box((0, 0, 0), (46, .232, .08)).mesh() for i, t in enumerate(tints)]
    for i in range(int((Q + 10) / .26)): P(pl_[r.randrange(len(pl_))], (r.uniform(-.5, .5), -10 + i * .26, .08), kind="deck plank")
    for n_ in range(len(pl_)): g["INK_T"]["plank%d" % n_] = 0
    P(MB("deckbase", [dark, K["st"]]).box((0, (Q - 10) / 2, -.6), (46, Q + 10, 1.1)).box((0, Q + .05, -.6), (46, .14, 1.2), 1).mesh(), (0, 0, 0), kind="quay")
    # HERO boat, spanning the frame behind the fisher, bow swinging toward the camera on the left
    H = T.get("hero", (-1.2, 10.0)); boat = hero_boat.build(M, K); g["INK_T"]["hero_boat"] = .006
    P(boat, (H[0], H[1], -1.1), rz=T.get("hero_rz", 1.5708 + .42), kind="hero boat")
    m["bollard"] = MB("bollard", [M.get("metal", color=(50, 54, 60))]).cyl((0, 0, .3), .14, .6, 0, 16).cyl((0, 0, .62), .2, .06, 0, 16).mesh()
    m["net"] = MB("net", [M.get("rope", color=(96, 138, 112)), M.get("boat_paint", color=(206, 56, 46))]).sph((0, 0, .12), (.8, .55, .3), 0, 40, 24).sph((.5, .3, .08), (.55, .4, .2), 0, 32, 20).ico((-.3, .2, .34), .06, 1).ico((.3, -.1, .36), .06, 1).ico((.7, .2, .22), .06, 1).ico((-.55, -.1, .22), .06, 1).ico((.05, .28, .34), .06, 1).mesh()
    pot = MB("trap", [wi, rp]); pot.box((0, 0, .02), (.7, .5, .03))
    for i in range(6): a = i / 5; pot.rod((-.32 + .64 * a, -.22, .02), (-.32 + .64 * a, -.22, .36), .008); pot.rod((-.32 + .64 * a, .22, .02), (-.32 + .64 * a, .22, .36), .008); pot.rod((-.32 + .64 * a, -.22, .36), (-.32 + .64 * a, .22, .36), .01)
    m["trap"] = pot.mesh()
    m["fish"] = MB("fish", [M.get("matte", color=(150, 172, 190), rough=.2, coat=.8), M.get("matte", color=(90, 110, 130))]).sph((0, 0, .04), (.05, .19, .04)).box((0, -.22, .04), (.01, .1, .08), 1).mesh()
    m["buoy"] = MB("buoy", [M.get("boat_paint", color=(220, 56, 48))]).sph((0, 0, .2), (.18, .18, .25)).rod((0, 0, .4), (0, 0, .6), .012).mesh()
    # bollards + mooring lines along the quay edge
    for x_ in (-12, -7, -3.5, 1.5, 5.5, 10, 14): P(m["bollard"], (x_, Q - .3, .12), kind="bollard")
    P(MB("line", [rp]).rod((5.5, Q - .3, .72), (H[0] + 4.6, H[1] - 2.0, 1.0), .025).mesh(), (0, 0, 0), kind="mooring line"); P(MB("line2", [rp]).rod((3, Q - .3, .72), (H[0] + 5.5, H[1] - 1.2, 1.0), .025).mesh(), (0, 0, 0), kind="mooring line")
    # FOREGROUND: 3-5 big readable props. Rowboat hauled up left, crates + lamp right, net and basket low
    asset(g, "rowboat_tosh", (*fr(3.7, -1.25), .12), T.get("row_rz", .25), T.get("row_s", .5))
    P(m["crate"], (*fr(2.9, .85), .12), rz=.2); P(m["crate"], (*fr(3.4, 1.05), .12), rz=-.2, s=.95); P(m["crate"], (*fr(3.1, .92), .62), rz=.4, s=.8)
    lamp = MB("quay_lamp", [wd, K["mt"], M.emissive_lamp(), M.glass()]).rod((0, 0, 0), (0, 0, .95), .03, 0).cyl((0, 0, 1.0), .1, .04, 1, 12).cyl((0, 0, 1.11), .04, .13, 2, 10).cyl((0, 0, 1.11), .08, .2, 3, 16).cyl((0, 0, 1.24), .1, .06, 1, 12, r2=.03).mesh()
    for d_, lat_ in ((5.2, .92), (6.9, .8), (6.3, -1.0)):
        lx, ly = fr(d_, lat_); P(lamp, (lx, ly, .12), kind="lamp"); g["lights"].practical(sc, (lx, ly, 1.2), (1, .62, .3), 70, .1)
    P(m["net"], (*fr(3.4, -.42), .12), rz=.5, s=.5); P(m["basket"], (*fr(3.7, .25), .12), s=.9); spread(["fish"], 7, 3.1, 4.4, (-.4, .4), .13, size=(.6, .85))
    # lamps along the quay lead the eye to the fisher and the boat
    for i, d in enumerate((6.8, 8.6)): x, y = fr(d, -.7 + i * .25);
    # midground kept open; a little work kit at the quay edge, ground detail
    spread(["stones"], 34, 2.2, 8.5, (-1.2, 1.2), .13, size=(.35, .6)); cl3s("barrel", 6.9, -1.05, .12, .7); cl3s("trap", 6.6, 1.0, .12, .7)
    # the boat's surroundings and background carry the density
    for i in range(14): x, y = r.uniform(-30, 30), r.uniform(Q + 3, 40); P(m["buoy"], (x, y, -1.15), s=.7, kind="float")
    for i in range(10): x, y = r.uniform(-20, 20), r.uniform(Q + 2, 30); P(m["bird2"], (x, y, -1.12), rz=r.uniform(0, 6), s=.8, kind="gull")
    P(MB("post", [wd]).cyl((0, 0, 1), .13, 4, 0, 10).mesh(), (6, Q + .5, -1), kind="mooring post"); P(m["bird2"], (6, Q + .5, 1.02), rz=2, kind="gull")
    import detail as D
    bs = [D.planked_boat(M, "boat%d" % i, c, K) for i, c in enumerate(((190, 60, 50), (60, 130, 90), (230, 180, 60)))]
    for i, (px, py, rz) in enumerate(((-16, 34, .7), (15, 30, -.6), (24, 52, .2), (-5, 60, 1.2), (8, 70, -.2), (-26, 66, .4), (30, 76, .3), (-12, 88, .1))): P(bs[i % 3], (px, py, -1.05), rz=rz, kind="fishing boat")
    x_ = -74
    while x_ < 90:
        f = int(x_ * 7) % 6; w = [6.2, 5, 7, 5.6, 6.4, 5][f]; P(K["facade"]("far%d" % x_, w, [5.6, 8.4, 11.2, 8.4, 5.6, 11.2][f], K["br"] if f % 2 else K["pl"]), (x_ + w / 2, 104 + r.uniform(-2, 2), -1), kind="harbour house", bevel=.01); x_ += w + .3
    P(MB("mole", [K["st"]]).box((0, 100, -.6), (200, 6, 1.4)).mesh(), (0, 0, 0), kind="harbour wall")
    far = ["crate", "barrel", "sack", "basket", "stool", "bucket", "broom", "ladder", "bench", "pot", "trap", "wheelbarrow", "cart", "table", "lamp_post", "tree"]
    for i in range(330): k = far[i % len(far)]; P(m[k], (r.uniform(-74, 88), r.uniform(97.5, 102), .1), rz=r.uniform(0, 6), s=r.uniform(1.1, 1.7))
    for i in range(70): P(m["bird2"], (r.uniform(-60, 70), r.uniform(60, 96), r.uniform(-1.1, 14)), rz=r.uniform(0, 6), s=1.4, kind="gull")
    lh = MB("lighthouse", [M.get("plaster", color=(236, 232, 222)), M.get("boat_paint", color=(200, 60, 50)), M.glass()]).cyl((0, 0, 11), 2.4, 22, 0, 20, r2=1.5).cyl((0, 0, 7), 2.05, 3, 1, 20).cyl((0, 0, 15), 1.75, 3, 1, 20).cyl((0, 0, 23), 1.4, 2, 2, 16).cyl((0, 0, 24.6), 1.8, 1.2, 1, 16, r2=.2).mesh(); P(lh, (-46, 118, -1))
    hills((76, 104, 120)); spread(["bird"], 18, 28, 70, (-.8, .9), r.uniform(12, 26), size=(1.4, 2.2))
    char("fisher", T.get("fisher_d", 4.3), T.get("fisher_lat", .22)); char("fishwife", 6.3, -.72, True)
    clouds([(-320, 560, 460), (60, 700, 560), (340, 540, 420), (-120, 430, 340), (220, 380, 320)])
    return dict(air=((0, 56, 3), (160, 90, 8), .012))
