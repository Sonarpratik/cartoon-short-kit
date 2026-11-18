"""
aircraft.py - stylized, historically based aircraft for "The Night Witches".

    import sys; sys.path.insert(0, r"...\\night-witches\\blender")
    import aircraft
    po2  = aircraft.make_po2("Po2")      # Polikarpov Po-2 (U-2) night bomber
    bf   = aircraft.make_bf109("Bf109")  # Messerschmitt Bf 109E

Conventions
- Real scale in metres, forward = +Y, up = +Z, right wing = +X.
- Built in level-flight attitude; main wheels rest on z = 0 (the tail skid /
  tail wheel hangs a little above the ground - tilt the root for a parked shot).
- Every function returns the ROOT EMPTY (named `name`). All objects live in a
  collection named `name`, every mesh is f"{name}_<part>", scale is applied.
- Calling a builder again with the same name deletes the old plane first.
- Flat matte materials (Principled, roughness 0.8, metallic 0), shared by name
  ("NW_*"). Optional inverted-hull ink outline (outline=True) for the toon look.

Animatable children
- f"{name}_prop"   : spins about its LOCAL Y axis (rotation_euler[1]).
- Po-2 bombs        : f"{name}_bombL", f"{name}_bombR" (origin at bomb centre).
- Po-2 wheels       : f"{name}_wheelL", f"{name}_wheelR" spin about local X.
- f"{name}_rudder"  : origin on the hinge line, swings about local Z.
- Po-2 control surfaces: f"{name}_wing_upper_aileronL/R",
  f"{name}_wing_lower_aileronL/R" (origin on hinge, rotate about local X),
  f"{name}_tailplane_elevator" (origin on hinge, rotate about local X).
- Empties: Po-2 f"{name}_seat_front", f"{name}_seat_rear", f"{name}_engine";
  Bf 109 f"{name}_seat", f"{name}_engine". Bf 109 gear is one object
  f"{name}_gear" so the film can hide it in flight.
"""

import math

import bmesh
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

__all__ = ["make_po2", "make_bf109", "remove_aircraft"]

# --------------------------------------------------------------------------
# colours (sRGB 0-255) and materials
# --------------------------------------------------------------------------


def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


COLORS = {
    "po2_olive": (66, 82, 40),        # dark olive-green upper surfaces
    "po2_under": (138, 152, 128),     # light grey-green underside
    "star_red": (196, 28, 26),
    "wood": (176, 112, 54),           # natural wood propeller
    "metal_dark": (46, 48, 52),       # dark grey metal
    "metal": (78, 80, 86),
    "metal_light": (120, 122, 126),
    "exhaust": (88, 58, 40),
    "interior": (28, 24, 20),
    "leather": (82, 50, 30),
    "tyre": (26, 26, 28),
    "wire": (30, 32, 34),
    "glass": (170, 205, 215),
    "bomb": (92, 98, 88),
    "ink": (16, 14, 12),
    "rlm74": (72, 78, 76),            # Bf 109 dark grey-green
    "rlm75": (100, 98, 108),          # grey-violet
    "rlm76": (176, 192, 202),         # light blue-grey underside
    "rlm04": (232, 178, 22),          # yellow cowling
    "rlm70": (38, 46, 38),            # black-green prop / spinner
}


def _rgba(key):
    r, g, b = COLORS[key]
    return (_lin(r), _lin(g), _lin(b), 1.0)


def _new_mat(key):
    name = "NW_" + key
    m = bpy.data.materials.get(name)
    created = m is None
    if created:
        m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    return m, created


def _mat(key, rough=0.8, alpha=1.0):
    """Flat matte Principled material, created once and reused."""
    m, created = _new_mat(key)
    if not created and m.get("nw_ok"):
        return m
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    col = _rgba(key)
    bsdf.inputs["Base Color"].default_value = col
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = 0.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bsdf.inputs:
            bsdf.inputs[nm].default_value = 0.25
            break
    bsdf.inputs["Alpha"].default_value = alpha
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    m.diffuse_color = col
    m.roughness = rough
    if alpha < 1.0:
        try:
            m.surface_render_method = "BLENDED"
        except Exception:
            m.blend_method = "BLEND"
        m.use_backface_culling = False
    m["nw_ok"] = True
    return m


def _ink_mat():
    m, created = _new_mat("ink_outline")
    if not created and m.get("nw_ok"):
        return m
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = _rgba("ink")
    em.inputs["Strength"].default_value = 1.0
    nt.links.new(em.outputs[0], out.inputs[0])
    m.diffuse_color = _rgba("ink")
    m.use_backface_culling = True
    for attr in ("use_backface_culling_shadow",):
        if hasattr(m, attr):
            setattr(m, attr, True)
    m["nw_ok"] = True
    return m


def _camo_mat():
    """Bf 109 grey scheme: 74/75 blotches on top, 76 sides with 74/75 mottle,
    76 underside. Region chosen from the OBJECT-space normal so it stays put
    when the plane banks. Flat colours only (constant colour ramp)."""
    m, created = _new_mat("bf109_camo")
    if not created and m.get("nw_ok"):
        return m
    nt = m.node_tree
    nt.nodes.clear()
    N = nt.nodes.new
    L = nt.links.new
    out = N("ShaderNodeOutputMaterial")
    bsdf = N("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.8
    bsdf.inputs["Metallic"].default_value = 0.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bsdf.inputs:
            bsdf.inputs[nm].default_value = 0.25
            break
    tc = N("ShaderNodeTexCoord")
    sep = N("ShaderNodeSeparateXYZ")
    L(tc.outputs["Normal"], sep.inputs[0])

    def math_node(op, a=None, b=None, va=0.0, vb=0.0):
        n = N("ShaderNodeMath")
        n.operation = op
        if a is not None:
            L(a, n.inputs[0])
        else:
            n.inputs[0].default_value = va
        if b is not None:
            L(b, n.inputs[1])
        else:
            n.inputs[1].default_value = vb
        return n.outputs[0]

    nz = sep.outputs[2]
    under = math_node("LESS_THAN", nz, None, vb=-0.30)       # 1 underside
    top = math_node("GREATER_THAN", nz, None, vb=0.45)       # 1 top

    def noise(scale, thr):
        nn = N("ShaderNodeTexNoise")
        nn.inputs["Scale"].default_value = scale
        nn.inputs["Detail"].default_value = 1.5
        nn.inputs["Roughness"].default_value = 0.5
        L(tc.outputs["Object"], nn.inputs["Vector"])
        return math_node("GREATER_THAN", nn.outputs["Fac"], None, vb=thr)

    mottle = noise(4.5, 0.64)                                # side mottle
    splinter = noise(0.55, 0.50)                             # top pattern
    side_val = math_node("ADD", math_node("MULTIPLY", mottle, None, vb=0.2),
                         None, vb=0.30)                      # 0.30 / 0.50
    top_val = math_node("ADD", math_node("MULTIPLY", splinter, None, vb=0.2),
                        None, vb=0.75)                       # 0.75 / 0.95
    side_w = math_node("SUBTRACT", math_node("SUBTRACT", None, under, va=1.0),
                       top)
    val = math_node("ADD",
                    math_node("ADD", math_node("MULTIPLY", under, None, vb=0.05),
                              math_node("MULTIPLY", top, top_val)),
                    math_node("MULTIPLY", side_w, side_val))
    ramp = N("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position = 0.0
    cr.elements[0].color = _rgba("rlm76")
    cr.elements[1].position = 0.40
    cr.elements[1].color = _rgba("rlm75")
    e = cr.elements.new(0.70)
    e.color = _rgba("rlm74")
    e = cr.elements.new(0.85)
    e.color = _rgba("rlm75")
    L(val, ramp.inputs[0])
    L(ramp.outputs[0], bsdf.inputs["Base Color"])
    L(bsdf.outputs[0], out.inputs[0])
    m.diffuse_color = _rgba("rlm74")
    m["nw_ok"] = True
    return m


# --------------------------------------------------------------------------
# geometry helpers
# --------------------------------------------------------------------------


class _Part:
    """A bmesh plus its material slot list."""

    def __init__(self):
        self.bm = bmesh.new()
        self.mats = []

    def slot(self, mat):
        if mat not in self.mats:
            self.mats.append(mat)
        return self.mats.index(mat)

    def mark(self):
        return len(self.bm.faces)

    def faces_from(self, start):
        self.bm.faces.ensure_lookup_table()
        return [self.bm.faces[i] for i in range(start, len(self.bm.faces))]

    def paint(self, start, mat):
        idx = self.slot(mat)
        for f in self.faces_from(start):
            f.material_index = idx

    def fix_normals(self, start=0):
        fs = self.faces_from(start)
        if fs:
            bmesh.ops.recalc_face_normals(self.bm, faces=fs)
            for f in fs:
                f.normal_update()

    def paint_by_normal(self, start, up_mat, down_mat, thresh=-0.3):
        """Faces whose normal z < thresh get down_mat, the rest up_mat."""
        self.fix_normals(start)
        iu, idn = self.slot(up_mat), self.slot(down_mat)
        for f in self.faces_from(start):
            f.material_index = idn if f.normal.z < thresh else iu

    def paint_where(self, start, mat, pred):
        idx = self.slot(mat)
        for f in self.faces_from(start):
            if pred(f.calc_center_median()):
                f.material_index = idx

    def bvh(self):
        self.fix_normals()
        return BVHTree.FromBMesh(self.bm)


def _loft(bm, rings, cap_start=True, cap_end=True, closed=True, loop=False):
    """Skin consecutive rings (lists of Vectors, equal length; a ring of one
    point is an apex). Returns the created faces."""
    vrings = [[bm.verts.new(Vector(p)) for p in r] for r in rings]
    faces = []
    count = len(vrings)
    pairs = [(i, i + 1) for i in range(count - 1)]
    if loop:
        pairs.append((count - 1, 0))
    for ia, ib in pairs:
        a, b = vrings[ia], vrings[ib]
        if len(a) == 1 and len(b) == 1:
            continue
        if len(a) == 1 or len(b) == 1:
            apex, ring = (a[0], b) if len(a) == 1 else (b[0], a)
            n = len(ring)
            rng = n if closed else n - 1
            for j in range(rng):
                faces.append(bm.faces.new((apex, ring[j], ring[(j + 1) % n])))
            continue
        n = len(a)
        rng = n if closed else n - 1
        for j in range(rng):
            k = (j + 1) % n
            faces.append(bm.faces.new((a[j], a[k], b[k], b[j])))
    if not loop:
        if cap_start and len(vrings[0]) > 2:
            faces.append(bm.faces.new(list(reversed(vrings[0]))))
        if cap_end and len(vrings[-1]) > 2:
            faces.append(bm.faces.new(vrings[-1]))
    return faces


def _basis(axis, hint=None):
    a = Vector(axis).normalized()
    if hint is not None:
        u = Vector(hint) - a * a.dot(Vector(hint))
        if u.length > 1e-6:
            u.normalize()
            return a, u, a.cross(u).normalized()
    t = Vector((0, 0, 1)) if abs(a.z) < 0.9 else Vector((1, 0, 0))
    u = a.cross(t).normalized()
    v = a.cross(u).normalized()
    return a, u, v


def _lathe(bm, origin, axis, profile, seg=16, su=1.0, sv=1.0, hint=None):
    """Surface of revolution. profile = [(s along axis, radius), ...]."""
    a, u, v = _basis(axis, hint)
    o = Vector(origin)
    rings = []
    for s, r in profile:
        c = o + a * s
        if r <= 1e-6:
            rings.append([c])
        else:
            rings.append([c + u * (r * su * math.cos(2 * math.pi * i / seg)) +
                          v * (r * sv * math.sin(2 * math.pi * i / seg))
                          for i in range(seg)])
    return _loft(bm, rings)


def _rod(bm, p0, p1, r, seg=8, fore=1.0, r1=None):
    """Cylinder between two points. fore>1 makes a streamlined strut whose
    long cross-section axis lies along the flight direction (+Y)."""
    p0, p1 = Vector(p0), Vector(p1)
    d = p1 - p0
    length = d.length
    return _lathe(bm, p0, d, [(0, r), (length, r if r1 is None else r1)],
                  seg=seg, su=fore, sv=1.0, hint=(0, 1, 0))


def _box(bm, center, size, rot=None):
    m = Matrix.Translation(Vector(center))
    if rot is not None:
        m = m @ rot
    m = m @ Matrix.Diagonal(Vector((size[0], size[1], size[2], 1.0)))
    res = bmesh.ops.create_cube(bm, size=1.0, matrix=m)
    return res["verts"]


def _rrect_xz(y, hw, zb, zt, rt, rb, k=4, cx=0.0):
    """Rounded rectangle cross-section in the XZ plane at station y."""
    h2 = (zt - zb) / 2.0
    rt = max(0.002, min(rt, 0.98 * hw, 0.98 * h2))
    rb = max(0.002, min(rb, 0.98 * hw, 0.98 * h2))
    corners = [(cx + hw - rt, zt - rt, rt, 0.0),
               (cx - hw + rt, zt - rt, rt, 90.0),
               (cx - hw + rb, zb + rb, rb, 180.0),
               (cx + hw - rb, zb + rb, rb, 270.0)]
    pts = []
    for ccx, ccz, r, a0 in corners:
        for i in range(k + 1):
            a = math.radians(a0 + 90.0 * i / k)
            pts.append(Vector((ccx + r * math.cos(a), y, ccz + r * math.sin(a))))
    return pts


def _rrect_xy(z, cx, cy, hw, hl, r, k=4):
    """Rounded rectangle in the XY plane (plan view) at height z."""
    r = max(0.002, min(r, 0.98 * hw, 0.98 * hl))
    corners = [(cx + hw - r, cy + hl - r, 0.0), (cx - hw + r, cy + hl - r, 90.0),
               (cx - hw + r, cy - hl + r, 180.0), (cx + hw - r, cy - hl + r, 270.0)]
    pts = []
    for ccx, ccy, a0 in corners:
        for i in range(k + 1):
            a = math.radians(a0 + 90.0 * i / k)
            pts.append(Vector((ccx + r * math.cos(a), ccy + r * math.sin(a), z)))
    return pts


def _airfoil(n=10, thick=0.12, camber=0.03, blunt=0.004):
    """Closed airfoil loop [(u, z)], u = chord fraction from the leading edge.
    Order: TE upper -> LE -> TE lower."""
    us = [(1 - math.cos(math.pi * i / n)) / 2 for i in range(n + 1)]

    def yt(x):
        return 5 * thick * (0.2969 * math.sqrt(x) - 0.126 * x - 0.3516 * x * x +
                            0.2843 * x ** 3 - 0.1036 * x ** 4) + blunt * x

    def yc(x):
        p = 0.4
        if x < p:
            return camber / p ** 2 * (2 * p * x - x * x)
        return camber / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * x - x * x)

    upper = [(x, yc(x) + yt(x)) for x in reversed(us)]
    lower = [(x, yc(x) - yt(x)) for x in us[1:]]
    return upper + lower[:-1] if blunt <= 0 else upper + lower


def _surface(part, stations, foil, vertical=False):
    """Loft a lifting surface. stations = [(s, le_y, chord, base, tscale)].
    Horizontal: span along X, thickness along Z (base = z of chord line).
    Vertical:   span along Z, thickness along X (base = x of chord line)."""
    rings = []
    for s, le, ch, base, ts in stations:
        ring = []
        for u, z in foil:
            y = le - u * ch
            t = base + z * ch * ts
            ring.append(Vector((t, y, s)) if vertical else Vector((s, y, t)))
        rings.append(ring)
    return _loft(part.bm, rings)


def _span_stations(half, chord, le, zfun, tip_r, inner, cut=None, tip="round"):
    """Symmetric wing stations with rounded (or squared) tips and an optional
    trailing-edge cut-out at the centre: cut = (half_width, depth)."""
    xs_inner = sorted(set([0.0] + [x for x in inner if 0 < x < half - tip_r] +
                          [half - tip_r]))
    if tip == "round":
        ds = [0.3, 0.55, 0.75, 0.88, 0.96, 0.995]
    else:
        ds = [0.6, 0.9, 1.0]
    one = []
    for x in xs_inner:
        ch, l0 = chord(x) if callable(chord) else chord, le(x) if callable(le) else le
        if cut and x < cut[0]:
            ch -= cut[1] * math.sqrt(max(0.0, 1 - (x / cut[0]) ** 2))
        one.append((x, l0, ch, zfun(x), 1.0))
    xt = half - tip_r
    ch0 = chord(xt) if callable(chord) else chord
    le0 = le(xt) if callable(le) else le
    for d in ds:
        x = xt + d * tip_r
        if tip == "round":
            f = math.sqrt(max(0.0, 1 - d * d))
            ch = ch0 * max(f, 0.10)
            one.append((x, le0 - (ch0 - ch) * 0.45, ch, zfun(x), 1.0))
        else:
            ch = (chord(x) if callable(chord) else chord)
            l1 = le(x) if callable(le) else le
            f = {0.6: 1.0, 0.9: 0.93, 1.0: 0.80}[d]
            ch2 = ch * f
            one.append((x, l1 - (ch - ch2) * 0.5, ch2, zfun(x), {0.6: 1, 0.9: 0.8, 1.0: 0.45}[d]))
    left = [(-x, l, c, b, t) for (x, l, c, b, t) in reversed(one) if x > 0]
    return left + one


def _hit(bvh, origin, direction, dist=10.0):
    loc, nrm, idx, d = bvh.ray_cast(Vector(origin), Vector(direction).normalized(), dist)
    return loc


def _star_outline(R, inner=0.382, sub=2):
    pts = []
    for i in range(10):
        a = math.pi / 2 + i * math.pi / 5
        r = R if i % 2 == 0 else R * inner
        pts.append((r * math.cos(a), r * math.sin(a)))
    out = []
    for i in range(10):
        p, q = pts[i], pts[(i + 1) % 10]
        for k in range(sub):
            t = k / sub
            out.append((p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t))
    return out


def _decal_star(part, bvh, center, normal, up, R, mat, off=0.006):
    """Red star projected onto the surface found by casting from `center`
    against -normal. `normal` points out of the surface towards the viewer."""
    n = Vector(normal).normalized()
    up = Vector(up)
    up = (up - n * up.dot(n)).normalized()
    right = up.cross(n).normalized()
    c = Vector(center)

    def proj(p):
        h = _hit(bvh, p + n * 0.4, -n, 1.0)
        return (h if h is not None else p) + n * off

    outline = _star_outline(R)
    start = part.mark()
    bm = part.bm
    cv = bm.verts.new(proj(c))
    inner = [bm.verts.new(proj(c + right * (x * 0.5) + up * (y * 0.5))) for x, y in outline]
    outer = [bm.verts.new(proj(c + right * x + up * y)) for x, y in outline]
    m = len(outline)
    for j in range(m):
        k = (j + 1) % m
        bm.faces.new((cv, inner[j], inner[k]))
        bm.faces.new((inner[j], outer[j], outer[k], inner[k]))
    # orient towards the viewer side
    fs = part.faces_from(start)
    for f in fs:
        f.normal_update()
        if f.normal.dot(n) < 0:
            f.normal_flip()
    part.paint(start, mat)


# --------------------------------------------------------------------------
# object assembly
# --------------------------------------------------------------------------


def remove_aircraft(name):
    """Delete a previously built plane (collection `name`, its objects, meshes)."""
    meshes = set()
    objs = set()
    coll = bpy.data.collections.get(name)
    if coll is not None:
        objs.update(coll.all_objects)
    for o in bpy.data.objects:
        if o.name == name or o.name.startswith(name + "_"):
            objs.add(o)
    for o in objs:
        if o.type == "MESH" and o.data is not None:
            meshes.add(o.data)
        bpy.data.objects.remove(o, do_unlink=True)
    for me in meshes:
        if me.users == 0:
            bpy.data.meshes.remove(me)
    for me in list(bpy.data.meshes):
        if me.users == 0 and (me.name == name or me.name.startswith(name + "_")):
            bpy.data.meshes.remove(me)
    if coll is not None:
        for c in list(coll.children):
            bpy.data.collections.remove(c)
        bpy.data.collections.remove(coll)


class _Builder:
    def __init__(self, name, outline):
        remove_aircraft(name)
        self.name = name
        self.outline = outline
        self.coll = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(self.coll)
        self.root = bpy.data.objects.new(name, None)
        self.root.empty_display_type = "ARROWS"
        self.root.empty_display_size = 1.0
        self.coll.objects.link(self.root)

    def empty(self, part, loc, size=0.25, display="SPHERE"):
        e = bpy.data.objects.new(f"{self.name}_{part}", None)
        e.empty_display_type = display
        e.empty_display_size = size
        e.location = Vector(loc)
        e.parent = self.root
        self.coll.objects.link(e)
        return e

    def obj(self, part_name, part, origin=None, smooth=35.0, outline=None,
            parent=None):
        """Turn a _Part into a mesh object parented to the root."""
        nm = f"{self.name}_{part_name}"
        bm = part.bm
        part.fix_normals()
        if origin is None:
            if bm.verts:
                lo = Vector((min(v.co[i] for v in bm.verts) for i in range(3)))
                hi = Vector((max(v.co[i] for v in bm.verts) for i in range(3)))
                origin = (lo + hi) / 2
            else:
                origin = Vector()
        origin = Vector(origin)
        bmesh.ops.translate(bm, vec=-origin, verts=bm.verts[:])
        me = bpy.data.meshes.new(nm)
        bm.to_mesh(me)
        bm.free()
        for m in part.mats:
            me.materials.append(m)
        ob = bpy.data.objects.new(nm, me)
        self.coll.objects.link(ob)
        par = parent or self.root
        ob.parent = par
        ob.location = origin - (par.location if par is not self.root else Vector())
        self.shade(ob, smooth)
        self.add_outline(ob, outline)
        return ob

    @staticmethod
    def shade(ob, smooth):
        me = ob.data
        if smooth is None or smooth <= 0:
            try:
                me.shade_flat()
            except Exception:
                pass
            return
        try:
            me.shade_smooth()
            me.set_sharp_from_angle(angle=math.radians(smooth))
        except Exception:
            for p in me.polygons:
                p.use_smooth = True

    def add_outline(self, ob, thickness):
        if thickness is None:
            thickness = 0.012
        if not self.outline or thickness <= 0:
            return
        me = ob.data
        n = len(me.materials)
        me.materials.append(_ink_mat())
        mod = ob.modifiers.new("ink_outline", "SOLIDIFY")
        mod.thickness = thickness
        mod.offset = 1.0
        mod.use_flip_normals = True
        mod.use_rim = False
        mod.use_even_offset = True
        mod.material_offset = max(n, 1) * 4  # clamps to the last slot = ink

    def boolean_pockets(self, ob, cutters):
        """Subtract cutter parts (their faces keep the cutter material)."""
        cut_objs = []
        for i, cpart in enumerate(cutters):
            cpart.fix_normals()
            cme = bpy.data.meshes.new(f"{self.name}__cutter{i}")
            cpart.bm.to_mesh(cme)
            cpart.bm.free()
            for m in cpart.mats:
                cme.materials.append(m)
            co = bpy.data.objects.new(f"{self.name}__cutter{i}", cme)
            self.coll.objects.link(co)
            co.matrix_world = ob.matrix_world.copy()
            co.hide_render = True
            cut_objs.append(co)
            mod = ob.modifiers.new(f"pocket{i}", "BOOLEAN")
            mod.operation = "DIFFERENCE"
            mod.solver = "EXACT"
            mod.object = co
            try:
                mod.material_mode = "TRANSFER"
            except Exception:
                pass
        bpy.context.view_layer.update()
        dg = bpy.context.evaluated_depsgraph_get()
        ev = ob.evaluated_get(dg)
        new_me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True,
                                                 depsgraph=dg)
        old = ob.data
        for md in list(ob.modifiers):
            ob.modifiers.remove(md)
        ob.data = new_me
        bpy.data.meshes.remove(old)
        new_me.name = ob.name
        for co in cut_objs:
            cme = co.data
            bpy.data.objects.remove(co, do_unlink=True)
            bpy.data.meshes.remove(cme)


# --------------------------------------------------------------------------
# shared sub-assemblies
# --------------------------------------------------------------------------


def _wheel(part, center, radius, width, tyre_mat, hub_mat, axis=(1, 0, 0)):
    w = width / 2
    prof = [(-w * 0.8, 0.0), (-w * 0.8, radius * 0.32), (-w, radius * 0.66),
            (-w, radius * 0.86), (-w * 0.65, radius * 0.975), (0, radius),
            (w * 0.65, radius * 0.975), (w, radius * 0.86), (w, radius * 0.66),
            (w * 0.8, radius * 0.32), (w * 0.8, 0.0)]
    start = part.mark()
    _lathe(part.bm, center, axis, prof, seg=20)
    part.paint(start, hub_mat)
    c = Vector(center)
    a = Vector(axis).normalized()
    part.paint_where(start, tyre_mat,
                     lambda p: ((p - c) - a * (p - c).dot(a)).length > radius * 0.70)


def _prop_blade(part, hub, axis, radial, r0, r1, chord_fn, pitch_fn,
                thick=0.12, steps=10, thick_fn=None):
    a = Vector(axis).normalized()
    d = Vector(radial).normalized()
    tan = a.cross(d).normalized()
    foil = _airfoil(n=6, thick=thick, camber=0.02, blunt=0.01)
    rings = []
    for i in range(steps + 1):
        f = i / steps
        r = r0 + (r1 - r0) * f
        c = chord_fn(f)
        p = pitch_fn(f)
        cdir = (tan * math.cos(p) - a * math.sin(p)).normalized()
        tdir = (a * math.cos(p) + tan * math.sin(p)).normalized()
        centre = Vector(hub) + d * r
        zs = thick_fn(f) / thick if thick_fn else 1.0
        rings.append([centre + cdir * ((u - 0.4) * c) + tdir * (z * c * zs) for u, z in foil])
    _loft(part.bm, rings)


# --------------------------------------------------------------------------
# Polikarpov Po-2
# --------------------------------------------------------------------------

COLORS.update({
    "po2_tape": (76, 94, 47),          # rib tape, upper (slightly lighter)
    "po2_tape_under": (152, 165, 141),
    "po2_seam": (54, 68, 33),          # panel / stringer lines
    "po2_patch": (88, 106, 52),        # doped fabric repair patches
    "po2_walk": (46, 54, 30),          # worn wing walk
    "mud": (58, 48, 34),
    "dial": (214, 204, 176),
    "bungee": (176, 160, 120),
})

# fuselage stations: (y, half width, z bottom, z top, top radius, bottom radius)
# flat-topped through the cockpits, rounded turtle-deck behind the rear one
_PO2_FUSE = [
    (1.80, 0.30, 1.20, 1.80, 0.29, 0.29),
    (1.70, 0.35, 1.14, 1.86, 0.30, 0.28),
    (1.55, 0.40, 1.07, 1.92, 0.26, 0.22),
    (1.30, 0.43, 1.00, 1.96, 0.18, 0.15),
    (0.60, 0.44, 0.96, 1.98, 0.13, 0.11),
    (-0.40, 0.44, 0.96, 1.98, 0.13, 0.11),
    (-2.40, 0.40, 1.04, 1.97, 0.12, 0.10),
    (-2.80, 0.385, 1.07, 2.00, 0.24, 0.10),
    (-3.60, 0.30, 1.18, 1.94, 0.24, 0.08),
    (-4.70, 0.18, 1.35, 1.84, 0.15, 0.05),
    (-5.45, 0.08, 1.48, 1.78, 0.06, 0.03),
    (-5.75, 0.025, 1.56, 1.74, 0.02, 0.01),
]


def _station(table, y):
    for a, b in zip(table, table[1:]):
        if a[0] >= y >= b[0]:
            t = (a[0] - y) / (a[0] - b[0])
            return tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))
    return table[0] if y > table[0][0] else table[-1]


# ---- Po-2 detail helpers ----------------------------------------------------


def _interp_st(stations, s):
    """Lifting-surface station at span position s (stations sorted by s)."""
    if s <= stations[0][0]:
        return (s,) + tuple(stations[0][1:])
    for a, b in zip(stations, stations[1:]):
        if a[0] <= s <= b[0]:
            t = (s - a[0]) / (b[0] - a[0]) if b[0] > a[0] else 0.0
            return tuple(a[i] + (b[i] - a[i]) * t for i in range(5))
    return (s,) + tuple(stations[-1][1:])


def _slice_st(stations, s0, s1):
    s0 = max(s0, stations[0][0])
    s1 = min(s1, stations[-1][0])
    return ([_interp_st(stations, s0)] +
            [st for st in stations if s0 + 1e-6 < st[0] < s1 - 1e-6] +
            [_interp_st(stations, s1)])


def _cut_loop(foil, u0, u1):
    """Closed section of an airfoil loop between chord fractions u0..u1."""
    i_le = min(range(len(foil)), key=lambda i: foil[i][0])
    up = list(reversed(foil[:i_le + 1]))        # u increasing, upper surface
    lo = foil[i_le:]                             # u increasing, lower surface

    def at(seq, u):
        for a, b in zip(seq, seq[1:]):
            if a[0] <= u <= b[0]:
                t = (u - a[0]) / (b[0] - a[0]) if b[0] > a[0] else 0.0
                return (u, a[1] + (b[1] - a[1]) * t)
        return seq[-1]

    def sub(seq):
        return [at(seq, u0)] + [p for p in seq if u0 + 1e-6 < p[0] < u1 - 1e-6] + [at(seq, u1)]

    U, L = sub(up), sub(lo)
    if u0 <= 1e-6:
        return list(reversed(U)) + L[1:]
    return list(reversed(U)) + L


def _rib_band(part, st, loop, hw=0.014, h=0.004, vertical=False, embed=0.003):
    """Raised rib-tape band wrapped around a surface section."""
    s, le, ch, base, ts = st
    P = [(le - u * ch, base + z * ch * ts) for u, z in loop]
    n = len(P)
    area = sum(P[i][0] * P[(i + 1) % n][1] - P[(i + 1) % n][0] * P[i][1] for i in range(n))
    sg = 1.0 if area > 0 else -1.0
    N = []
    for i in range(n):
        a, b = P[i - 1], P[(i + 1) % n]
        ty, tt = b[0] - a[0], b[1] - a[1]
        ln = math.hypot(ty, tt) or 1.0
        N.append((sg * tt / ln, -sg * ty / ln))

    def ring(ds, off):
        out = []
        for (y, t), (ny, nt) in zip(P, N):
            yy, t2 = y + ny * off, t + nt * off
            out.append(Vector((t2, yy, s + ds)) if vertical else Vector((s + ds, yy, t2)))
        return out

    return _loft(part.bm, [ring(-hw, -embed), ring(-hw, h), ring(hw, h), ring(hw, -embed)],
                 loop=True)


def _torus(bm, center, axis, R, r, seg=24, seg2=8, sR=(1.0, 1.0)):
    a, u, v = _basis(axis)
    c = Vector(center)
    rings = []
    for i in range(seg):
        th = 2 * math.pi * i / seg
        p = c + u * (R * sR[0] * math.cos(th)) + v * (R * sR[1] * math.sin(th))
        rd = (p - c).normalized()
        rings.append([p + rd * (r * math.cos(2 * math.pi * j / seg2)) +
                      a * (r * math.sin(2 * math.pi * j / seg2)) for j in range(seg2)])
    return _loft(bm, rings, loop=True)


def _tube(bm, pts, r, seg=6):
    """Tube along a polyline (rings perpendicular to the local tangent)."""
    pts = [Vector(p) for p in pts]
    n = len(pts)
    rings = []
    hint = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
        a, u, v = _basis(t, hint)
        hint = u
        rings.append([p + u * (r * math.cos(2 * math.pi * j / seg)) +
                      v * (r * math.sin(2 * math.pi * j / seg)) for j in range(seg)])
    return _loft(bm, rings)


def _proj_frame(normal, up):
    n = Vector(normal).normalized()
    up = Vector(up)
    up = (up - n * up.dot(n)).normalized()
    return n, up, up.cross(n).normalized()


def _orient(part, start, n):
    for f in part.faces_from(start):
        f.normal_update()
        if f.normal.dot(n) < 0:
            f.normal_flip()


def _decal_poly(part, bvh, center, normal, up, outline, mat, off=0.006):
    """Flat decal (fan with a mid ring) projected onto the surface."""
    n, up, right = _proj_frame(normal, up)
    c = Vector(center)

    def proj(p):
        h = _hit(bvh, p + n * 0.4, -n, 1.0)
        return (h if h is not None else p) + n * off

    start = part.mark()
    bm = part.bm
    cv = bm.verts.new(proj(c))
    inner = [bm.verts.new(proj(c + right * (x * 0.5) + up * (y * 0.5))) for x, y in outline]
    outer = [bm.verts.new(proj(c + right * x + up * y)) for x, y in outline]
    m = len(outline)
    for j in range(m):
        k = (j + 1) % m
        bm.faces.new((cv, inner[j], inner[k]))
        bm.faces.new((inner[j], outer[j], outer[k], inner[k]))
    _orient(part, start, n)
    part.paint(start, mat)


def _decal_grid(part, bvh, center, normal, up, w, h, nu, nv, mat, off=0.006):
    """Rectangular decal sampled as a grid so it hugs curved surfaces."""
    n, up, right = _proj_frame(normal, up)
    c = Vector(center)
    start = part.mark()
    bm = part.bm
    grid = []
    for j in range(nv + 1):
        row = []
        for i in range(nu + 1):
            p = c + right * (w * (i / nu - 0.5)) + up * (h * (j / nv - 0.5))
            hh = _hit(bvh, p + n * 0.4, -n, 1.0)
            row.append(bm.verts.new((hh if hh is not None else p) + n * off))
        grid.append(row)
    for j in range(nv):
        for i in range(nu):
            bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
    _orient(part, start, n)
    part.paint(start, mat)


def _blob(R, n=14, seed=1.0):
    out = []
    for i in range(n):
        a = 2 * math.pi * i / n
        v = math.sin(i * 12.9898 + seed * 78.233) * 43758.5453
        r = R * (0.62 + 0.38 * (v - math.floor(v)))
        out.append((r * math.cos(a), r * math.sin(a)))
    return out


def _patch(part, bvh, origin, direction, size, spin, mat):
    """Slightly raised rectangular fabric patch on a surface."""
    d = Vector(direction).normalized()
    loc, nrm, _, _ = bvh.ray_cast(Vector(origin), d, 5.0)
    if loc is None:
        return
    if nrm.dot(d) > 0:
        nrm = -nrm
    rot = nrm.to_track_quat("Z", "Y").to_matrix().to_4x4() @ Matrix.Rotation(spin, 4, "Z")
    start = part.mark()
    _box(part.bm, loc + nrm * (size[2] / 2 - 0.002), size, rot)
    part.paint(start, mat)


def _band_xz(part, table, y, w=0.012, h=0.005, embed=0.004, k=6):
    """Raised panel line around the fuselage at station y."""
    def ring(yy, o):
        s = _station(table, yy)
        return _rrect_xz(yy, s[1] + o, s[2] - o, s[3] + o, s[4] + o, s[5] + o, k=k)
    return _loft(part.bm, [ring(y - w, -embed), ring(y - w, h), ring(y + w, h),
                           ring(y + w, -embed)], loop=True)


# --------------------------------------------------------------------------


def make_po2(name="Po2", outline=True):
    """Build a detailed Polikarpov Po-2 (U-2) night bomber. Returns the root
    empty. Fabric parts keep "wing", "tail", "fin", "rudder" or "fuselage" in
    their names."""
    B = _Builder(name, outline)
    olive, under = _mat("po2_olive"), _mat("po2_under")
    tape, tape_u = _mat("po2_tape"), _mat("po2_tape_under")
    seam, patch_m, walk = _mat("po2_seam"), _mat("po2_patch"), _mat("po2_walk")
    mud, dial, bungee = _mat("mud"), _mat("dial"), _mat("bungee")
    red, wood = _mat("star_red"), _mat("wood")
    mdark, metal, mlight = _mat("metal_dark"), _mat("metal"), _mat("metal_light")
    interior, leather, tyre = _mat("interior"), _mat("leather"), _mat("tyre")
    wire_m, glass, bomb_m = _mat("wire"), _mat("glass", alpha=0.35), _mat("bomb")
    exhaust = _mat("exhaust")

    THRUST_Z = 1.50
    HALF = 5.70                      # 11.4 m span
    CHORD = 1.65
    UP_LE, LO_LE = 0.90, 0.60        # stagger 0.3 m
    UP_Z0, LO_Z0 = 2.62, 1.02
    UP_DIH, LO_DIH = math.radians(1.0), math.radians(3.0)
    A0, A1, GAP = 2.40, 4.85, 0.025  # aileron span and hinge gap
    CU = 0.74                        # hinge line at 74 % chord

    def up_z(x):
        return UP_Z0 + abs(x) * math.tan(UP_DIH)

    def lo_z(x):
        return LO_Z0 + abs(x) * math.tan(LO_DIH)

    foil = _airfoil(n=10, thick=0.12, camber=0.035)
    main_cut = _cut_loop(foil, 0.0, CU)
    ail_loop = _cut_loop(foil, CU + GAP / CHORD * 1.0, 1.0)
    inner = [0.15, 0.30, 0.40, 0.45, 0.6, 1.2, 2.0, A0, A0 + GAP, 2.8, 3.5, 4.2,
             A1 - GAP]
    rib_x = [0.36 * k for k in range(1, 14)]

    # ---- wings with ribs and separate ailerons ---------------------------
    def build_wing(tag, le0, zfun, cut, skip_root):
        st = _span_stations(HALF, CHORD, le0, zfun, 0.80, inner, cut=cut)
        P = _Part()
        s0 = P.mark()
        for a, b, lp in ((-99, -A1, foil), (-A1, -A0, main_cut), (-A0, A0, foil),
                         (A0, A1, main_cut), (A1, 99, foil)):
            _surface(P, _slice_st(st, a, b), lp)
        P.paint_by_normal(s0, olive, under, thresh=-0.2)
        bvh = P.bvh()
        ails = {}
        for sx, side in ((-1, "L"), (1, "R")):
            AP = _Part()
            s1 = AP.mark()
            a, b = sorted((sx * (A0 + GAP), sx * (A1 - GAP)))
            _surface(AP, _slice_st(st, a, b), ail_loop)
            AP.paint_by_normal(s1, olive, under, thresh=-0.2)
            ails[sx] = (AP, side)
        for x in rib_x:
            if x < skip_root:
                continue
            for sx in (-1, 1):
                s_ = _interp_st(st, sx * x)
                s1 = P.mark()
                if A0 < x < A1:
                    _rib_band(P, s_, main_cut)
                    AP = ails[sx][0]
                    s2 = AP.mark()
                    _rib_band(AP, s_, ail_loop)
                    AP.paint_by_normal(s2, tape, tape_u, thresh=-0.2)
                else:
                    _rib_band(P, s_, foil)
                P.paint_by_normal(s1, tape, tape_u, thresh=-0.2)
        for sx, (AP, side) in ails.items():
            xm = sx * (A0 + A1) / 2
            s_ = _interp_st(st, xm)
            hinge = Vector((xm, s_[1] - CU * s_[2], s_[3]))
            B.obj(f"{tag}_aileron{side}", AP, origin=hinge, outline=0.008)
        return P, bvh

    wu, bvh_u = build_wing("wing_upper", UP_LE, up_z, (0.46, 0.38), 0.0)
    _patch(wu, bvh_u, (-2.15, 0.25, up_z(2.15) + 1.0), (0, 0, -1), (0.30, 0.22, 0.007),
           0.20, patch_m)
    _patch(wu, bvh_u, (3.05, -0.05, up_z(3.05) + 1.0), (0, 0, -1), (0.22, 0.18, 0.007),
           -0.35, patch_m)
    B.obj("wing_upper", wu)

    wl, bvh_l = build_wing("wing_lower", LO_LE, lo_z, None, 0.5)
    for sx in (-1, 1):  # red stars under the lower wing (ahead of the ailerons)
        x = sx * 4.25
        yc = LO_LE - CHORD * 0.40
        anchor = _hit(bvh_l, (x, yc, lo_z(x) - 1.0), (0, 0, 1))
        _decal_star(wl, bvh_l, anchor, (0, 0, -1), (0, 1, 0), 0.45, red, off=0.008)
        # worn wing walk on the lower wing root (upper surface)
        anchor = _hit(bvh_l, (sx * 0.74, LO_LE - 0.62, lo_z(0.74) + 1.0), (0, 0, -1))
        _decal_grid(wl, bvh_l, anchor, (0, 0, 1), (0, 1, 0), 0.48, 1.10, 3, 8, walk,
                    off=0.007)
        # mud thrown up by the wheels onto the underside
        for i, (mx, my, mr) in enumerate(((0.95, -0.15, 0.10), (1.10, -0.45, 0.07),
                                          (0.80, -0.70, 0.06))):
            anchor = _hit(bvh_l, (sx * mx, my, lo_z(mx) - 1.0), (0, 0, 1))
            if anchor is not None:
                _decal_poly(wl, bvh_l, anchor, (0, 0, -1), (0, 1, 0),
                            _blob(mr, seed=i + sx * 3.1), mud, off=0.008)
    B.obj("wing_lower", wl)

    def under_upper(x, y, emb=0.05):
        h = _hit(bvh_u, (x, y, up_z(x) - 1.0), (0, 0, 1))
        return Vector((x, y, (h.z if h else up_z(x)) + emb))

    def top_lower(x, y, emb=0.05):
        h = _hit(bvh_l, (x, y, lo_z(x) + 1.0), (0, 0, -1))
        return Vector((x, y, (h.z if h else lo_z(x)) - emb))

    def bottom_lower(x, y):
        h = _hit(bvh_l, (x, y, lo_z(x) - 1.0), (0, 0, 1))
        return Vector((x, y, (h.z if h else lo_z(x))))

    # ---- struts: interplane N-struts + cabane, with end fittings ------------
    sp = _Part()
    XI = 3.45                                       # interplane strut station
    fit_pts = []
    s0 = sp.mark()
    for sx in (-1, 1):
        x = sx * XI
        yf_l, yr_l = LO_LE - CHORD * 0.16, LO_LE - CHORD * 0.66
        yf_u, yr_u = UP_LE - CHORD * 0.16, UP_LE - CHORD * 0.66
        _rod(sp.bm, top_lower(x, yf_l), under_upper(x, yf_u), 0.024, fore=2.0)
        _rod(sp.bm, top_lower(x, yr_l), under_upper(x, yr_u), 0.024, fore=2.0)
        _rod(sp.bm, top_lower(x, yr_l + 0.06), under_upper(x, yf_u - 0.06), 0.020, fore=2.0)
        fit_pts += [(top_lower(x, yf_l, 0), 1), (top_lower(x, yr_l, 0), 1),
                    (under_upper(x, yf_u, 0), -1), (under_upper(x, yr_u, 0), -1)]
        # cabane N-struts: fuselage top longeron -> upper wing centre section
        xf, xw = sx * 0.40, sx * 0.47
        zf = _station(_PO2_FUSE, 0.75)[3] - 0.04
        zr = _station(_PO2_FUSE, 0.05)[3] - 0.04
        top_f = under_upper(xw, UP_LE - CHORD * 0.16)
        top_r = under_upper(xw, UP_LE - CHORD * 0.62)
        _rod(sp.bm, (xf, 0.75, zf), top_f, 0.021, fore=1.8)
        _rod(sp.bm, (xf, 0.05, zr), top_r, 0.021, fore=1.8)
        _rod(sp.bm, (xf, 0.75, zf), top_r, 0.018, fore=1.8)
        fit_pts += [(under_upper(xw, UP_LE - CHORD * 0.16, 0), -1),
                    (under_upper(xw, UP_LE - CHORD * 0.62, 0), -1)]
    sp.paint(s0, mdark)
    s0 = sp.mark()
    for p, sgn in fit_pts:                          # strut end fittings
        _box(sp.bm, p + Vector((0, 0, sgn * 0.012)), (0.075, 0.11, 0.03))
    sp.paint(s0, mlight)
    B.obj("struts", sp, outline=0.006)

    # ---- wires: doubled flying / landing wires with turnbuckles, tail bracing,
    #      control cables ------------------------------------------------------
    wr = _Part()
    tb = []
    s0 = wr.mark()
    for sx in (-1, 1):
        for frac in (0.18, 0.64):
            yl, yu = LO_LE - CHORD * frac, UP_LE - CHORD * frac
            root_lo = top_lower(sx * 0.46, yl) + Vector((0, 0, 0.03))
            root_up = under_upper(sx * 0.50, yu) - Vector((0, 0, 0.03))
            tip_up = under_upper(sx * (XI - 0.06), yu) - Vector((0, 0, 0.03))
            tip_lo = top_lower(sx * (XI - 0.06), yl) + Vector((0, 0, 0.03))
            for dy in (-0.022, 0.022):              # doubled wires
                o = Vector((0, dy, 0))
                for a, b in ((root_lo, tip_up), (root_up, tip_lo)):
                    _rod(wr.bm, a + o, b + o, 0.008, seg=6)
                    lo_end = a if a.z < b.z else b
                    hi_end = b if lo_end is a else a
                    tb.append((lo_end + o + (hi_end - lo_end) * 0.10,
                               lo_end + o + (hi_end - lo_end) * 0.17))
    # tail bracing wires (fin -> tailplane upper surface)
    for sx in (-1, 1):
        for yf, yt in ((-5.40, -5.10), (-5.58, -5.32)):
            _rod(wr.bm, (0, yf, 2.15), (sx * 0.95, yt, 1.74), 0.006, seg=5)
    # control cables: rudder horns and elevator horns to the fuselage
    HINGE = -5.70
    for sx in (-1, 1):
        _rod(wr.bm, (sx * 0.15, HINGE - 0.04, 1.57), (sx * 0.17, -4.85, 1.55), 0.006, seg=5)
        _rod(wr.bm, (sx * 0.12, -5.41, 1.86), (sx * 0.10, -4.85, 1.80), 0.006, seg=5)
        _rod(wr.bm, (sx * 0.12, -5.41, 1.56), (sx * 0.12, -4.85, 1.42), 0.006, seg=5)
    wr.paint(s0, wire_m)
    s0 = wr.mark()
    for a, b in tb:                                  # turnbuckles
        _rod(wr.bm, a, b, 0.016, seg=6)
    wr.paint(s0, mlight)
    B.obj("wires", wr, outline=0)

    # ---- fuselage: turtle-deck, two open cockpits ---------------------------
    fu = _Part()
    s0 = fu.mark()
    ys = sorted(set([s[0] for s in _PO2_FUSE] + [1.0, 0.0, -1.0, -1.6, -2.1, -3.2,
                                                   -4.2, -5.1]), reverse=True)
    _loft(fu.bm, [_rrect_xz(*_station(_PO2_FUSE, y), k=6) for y in ys])
    fu.paint_by_normal(s0, olive, under, thresh=-0.55)
    bvh_f = fu.bvh()
    fuse = B.obj("fuselage", fu, origin=(0, 0, 0), smooth=40, outline=0)
    cockpits = [(-0.85, 0.25, 0.36), (-1.95, 0.24, 0.36)]   # (y, half w, half l)
    cutters = []
    for cy, hw, hl in cockpits:
        zt = _station(_PO2_FUSE, cy)[3]
        c = _Part()
        s1 = c.mark()
        _loft(c.bm, [_rrect_xy(zt - 0.50, 0, cy, hw, hl, 0.12),
                     _rrect_xy(zt + 0.30, 0, cy, hw, hl, 0.12)])
        c.paint(s1, interior)
        cutters.append(c)
    B.boolean_pockets(fuse, cutters)
    B.shade(fuse, 40)
    B.add_outline(fuse, 0.014)

    # fuselage details: panel lines, stringers, patches, mud splashes
    fd = _Part()
    s0 = fd.mark()
    for y in (1.30, 0.25, -0.33, -1.40, -2.55, -3.30, -4.00, -4.70):
        _band_xz(fd, _PO2_FUSE, y)
    fd.paint_by_normal(s0, seam, tape_u, thresh=-0.55)
    s0 = fd.mark()
    for sx in (-1, 1):                               # longeron / stringer lines
        for zf in (0.40, 0.72):
            pts = []
            for i in range(17):
                y = 1.25 - i * (1.25 + 5.20) / 16
                s = _station(_PO2_FUSE, y)
                zlo, zhi = s[2] + s[5], s[3] - s[4]
                pts.append((sx * (s[1] + 0.002), y, zlo + (zhi - zlo) * zf))
            _tube(fd.bm, pts, 0.006, seg=5)
    fd.paint(s0, seam)
    for sx, y, z, size, spin in ((1, -3.15, 1.55, (0.30, 0.22, 0.007), 0.15),
                                 (-1, -0.10, 1.35, (0.22, 0.16, 0.007), -0.25),
                                 (-1, -3.90, 1.62, (0.18, 0.14, 0.007), 0.4)):
        _patch(fd, bvh_f, (sx * 1.5, y, z), (-sx, 0, 0), size, spin, patch_m)
    for sx in (-1, 1):                               # mud near the gear
        for i, (my, mz, mr) in enumerate(((0.95, 1.15, 0.08), (0.75, 1.24, 0.06),
                                          (0.30, 1.30, 0.06), (-0.45, 1.28, 0.05))):
            hw = _station(_PO2_FUSE, my)[1]
            _decal_poly(fd, bvh_f, (sx * hw, my, mz), (sx, 0, 0), (0, 0, 1),
                        _blob(mr, seed=i * 1.7 + sx), mud, off=0.007)
    B.obj("fuselage_details", fd, smooth=30, outline=0)

    # coaming with leather padding rolls, instrument panels, windscreens
    co = _Part()
    ws = _Part()
    ins = _Part()
    for ci, (cy, hw, hl) in enumerate(cockpits):
        zt = _station(_PO2_FUSE, cy + hl)[3]
        rr = 0.032
        prof = [(rr + rr * math.cos(2 * math.pi * j / 10), 0.012 + rr * math.sin(2 * math.pi * j / 10))
                for j in range(10)]
        s1 = co.mark()
        _loft(co.bm, [_rrect_xy(zt + dz, 0, cy, hw + o - 0.01, hl + o - 0.01, 0.12 + o)
                      for o, dz in prof], loop=True)
        co.paint(s1, leather)
        # instrument panel just inside the front of the hole, dials face aft
        py = cy + hl - 0.05
        s1 = ins.mark()
        _box(ins.bm, (0, py, zt - 0.14), (2 * hw - 0.05, 0.02, 0.20),
             Matrix.Rotation(math.radians(-8), 4, "X"))
        ins.paint(s1, mdark)
        dials = ((-0.11, -0.09), (-0.04, -0.13), (0.04, -0.09), (0.11, -0.13))
        if ci == 1:
            dials = dials[:3]
        for dx, dz in dials:
            org = Vector((dx, py - 0.011, zt + dz))
            s1 = ins.mark()
            _lathe(ins.bm, org, (0, -1, 0), [(0, 0.0), (0, 0.034), (0.008, 0.034),
                                             (0.008, 0.0)], seg=12)
            ins.paint(s1, metal)
            s1 = ins.mark()
            _lathe(ins.bm, org, (0, -1, 0), [(0, 0.0), (0, 0.026), (0.011, 0.026),
                                             (0.011, 0.0)], seg=12)
            ins.paint(s1, dial)
        # windscreen: a small tilted panel ahead of the hole, with a frame
        tilt = math.radians(28)
        h, wdt = 0.24, 0.40
        y0 = cy + hl + 0.06
        cz = zt + 0.035 + h / 2 * math.cos(tilt)
        cyy = y0 - h / 2 * math.sin(tilt)
        s1 = ws.mark()
        _box(ws.bm, (0, cyy, cz), (wdt, 0.008, h), Matrix.Rotation(tilt, 4, "X"))
        ws.paint(s1, glass)
        s1 = ws.mark()
        top = Vector((0, y0 - h * math.sin(tilt), zt + 0.035 + h * math.cos(tilt)))
        bl = Vector((wdt / 2, y0, zt + 0.02))
        tl = Vector((wdt / 2, top.y, top.z))
        for sx in (-1, 1):
            _rod(ws.bm, (sx * bl.x, bl.y, bl.z), (sx * tl.x, tl.y, tl.z), 0.008, seg=6)
        _rod(ws.bm, (-tl.x, tl.y, tl.z), (tl.x, tl.y, tl.z), 0.008, seg=6)
        ws.paint(s1, mdark)
    B.obj("coaming", co, outline=0.006)
    B.obj("instruments", ins, smooth=30, outline=0)
    B.obj("windscreens", ws, smooth=0, outline=0)

    # step + handhold on the left side (boarding side)
    stp = _Part()
    s0 = stp.mark()
    zb = _station(_PO2_FUSE, -1.25)[2]
    hw = _station(_PO2_FUSE, -1.25)[1]
    a = Vector((-hw + 0.05, -1.15, zb + 0.04))
    b = Vector((-hw + 0.05, -1.35, zb + 0.04))
    a2 = Vector((-hw - 0.06, -1.15, zb - 0.20))
    b2 = Vector((-hw - 0.06, -1.35, zb - 0.20))
    _rod(stp.bm, a, a2, 0.014, seg=6)
    _rod(stp.bm, b, b2, 0.014, seg=6)
    _box(stp.bm, (a2 + b2) / 2, (0.08, 0.24, 0.02))
    s = _station(_PO2_FUSE, -2.55)
    hz = s[3] - s[4] - 0.06
    p0 = Vector((-s[1] + 0.01, -2.45, hz))
    p1 = Vector((-s[1] + 0.01, -2.70, hz))
    _rod(stp.bm, p0, p0 + Vector((-0.06, 0, 0)), 0.011, seg=6)
    _rod(stp.bm, p1, p1 + Vector((-0.06, 0, 0)), 0.011, seg=6)
    _rod(stp.bm, p0 + Vector((-0.06, 0.011, 0)), p1 + Vector((-0.06, -0.011, 0)), 0.011, seg=6)
    stp.paint(s0, mdark)
    B.obj("steps", stp, smooth=30, outline=0.004)

    # ---- tail: tailplane + elevator, fin, rudder (all with rib tapes) ------
    sym = _airfoil(n=8, thick=0.09, camber=0.0)
    TCU = 0.55
    stab_loop = _cut_loop(sym, 0.0, TCU)
    elev_loop = _cut_loop(sym, TCU + 0.03, 1.0)
    tst = _span_stations(1.55, 0.75, -4.95, lambda x: 1.71, 0.36, [0.07, 0.3, 0.7, 1.0])
    tp = _Part()
    s0 = tp.mark()
    _surface(tp, tst, stab_loop)
    tp.paint_by_normal(s0, olive, under, thresh=-0.2)
    el = _Part()
    s0 = el.mark()
    for a, b in ((-99, -0.07), (0.07, 99)):
        _surface(el, _slice_st(tst, a, b), elev_loop)
    el.paint_by_normal(s0, olive, under, thresh=-0.2)
    for x in (0.30, 0.60, 0.90, 1.18):
        for sx in (-1, 1):
            s_ = _interp_st(tst, sx * x)
            s1 = tp.mark()
            _rib_band(tp, s_, stab_loop, hw=0.010, h=0.003)
            tp.paint_by_normal(s1, tape, tape_u, thresh=-0.2)
            s1 = el.mark()
            _rib_band(el, s_, elev_loop, hw=0.010, h=0.003)
            el.paint_by_normal(s1, tape, tape_u, thresh=-0.2)
    s0 = tp.mark()
    for sx in (-1, 1):   # small bracing struts under the tailplane
        _rod(tp.bm, (sx * 0.10, -5.10, 1.52), (sx * 0.85, -5.22, 1.70), 0.014, fore=2.0)
    tp.paint(s0, mdark)
    s0 = el.mark()
    for sx in (-1, 1):   # elevator control horns (above and below)
        for dz in (0.085, -0.085):
            _box(el.bm, (sx * 0.12, -5.40, 1.71 + dz), (0.006, 0.07, 0.15))
    el.paint(s0, mdark)
    B.obj("tailplane", tp, outline=0.008)
    hinge_y = -4.95 - (TCU + 0.03) * 0.75
    B.obj("tailplane_elevator", el, origin=(0, hinge_y, 1.71), outline=0.008)

    fin = _Part()
    fin_st = [(1.66, -4.92, 0.78, 0, 1), (1.85, -5.03, 0.67, 0, 1),
              (2.05, -5.17, 0.53, 0, 1), (2.20, -5.30, 0.40, 0, 1),
              (2.30, -5.42, 0.28, 0, 1), (2.37, -5.53, 0.17, 0, 1),
              (2.41, -5.62, 0.08, 0, 1)]
    ffoil = _airfoil(n=8, thick=0.10, camber=0.0)
    s0 = fin.mark()
    _surface(fin, fin_st, ffoil, vertical=True)
    fin.paint(s0, olive)
    for z in (1.92, 2.12, 2.28):
        s0 = fin.mark()
        _rib_band(fin, _interp_st(fin_st, z), ffoil, hw=0.010, h=0.003, vertical=True)
        fin.paint(s0, tape)
    B.obj("fin", fin, outline=0.008)

    rud = _Part()
    rch = [(1.47, 0.20), (1.53, 0.34), (1.63, 0.42), (1.80, 0.45), (2.10, 0.45),
           (2.30, 0.42), (2.42, 0.34), (2.50, 0.22), (2.55, 0.08)]
    rst = [(z, HINGE, c, 0, 1) for z, c in rch]
    rfoil = _airfoil(n=8, thick=0.13, camber=0.0)
    s0 = rud.mark()
    _surface(rud, rst, rfoil, vertical=True)
    rud.paint(s0, olive)
    bvh_r = rud.bvh()
    for z in (1.62, 1.80, 2.20, 2.38):
        s0 = rud.mark()
        _rib_band(rud, _interp_st(rst, z), rfoil, hw=0.010, h=0.003, vertical=True)
        rud.paint(s0, tape)
    for sx in (-1, 1):
        _decal_star(rud, bvh_r, (sx * 0.1, HINGE - 0.21, 2.0), (sx, 0, 0), (0, 0, 1),
                    0.17, red, off=0.006)
    s0 = rud.mark()
    _box(rud.bm, (0, HINGE - 0.05, 1.57), (0.32, 0.07, 0.008))     # rudder horns
    rud.paint(s0, mdark)
    B.obj("rudder", rud, origin=(0, HINGE, 2.0), outline=0.008)

    # ---- M-11 five-cylinder radial ----------------------------------------
    en = _Part()
    ec = Vector((0, 1.88, THRUST_Z))
    Y = Vector((0, 1, 0))
    s0 = en.mark()
    _lathe(en.bm, (0, 1.66, THRUST_Z), (0, 1, 0),
           [(0, 0.0), (0, 0.17), (0.08, 0.18), (0.10, 0.215), (0.12, 0.235),
            (0.30, 0.235), (0.33, 0.20), (0.35, 0.12), (0.40, 0.10), (0.44, 0.075),
            (0.47, 0.04), (0.48, 0.0)], seg=20)
    en.paint(s0, mdark)
    s0 = en.mark()
    for k in range(5):                                # nose-case bolts
        a = math.radians(54 + k * 72)
        p = ec + Y * 0.09 + Vector((math.cos(a), 0, math.sin(a))) * 0.17
        _rod(en.bm, p - Y * 0.01, p + Y * 0.02, 0.014, seg=6)
    en.paint(s0, mlight)
    ring_c = Vector((0, 1.74, THRUST_Z))
    for k in range(5):
        a = math.radians(90 + k * 72)
        d = Vector((math.cos(a), 0, math.sin(a)))
        side = Vector((-d.z, 0, d.x))
        s1 = en.mark()
        prof = [(0.15, 0.0), (0.15, 0.072)]
        s = 0.19
        while s < 0.43:
            prof += [(s, 0.072), (s, 0.104), (s + 0.010, 0.104), (s + 0.010, 0.072)]
            s += 0.024
        prof += [(0.44, 0.078), (0.46, 0.088), (0.50, 0.088), (0.525, 0.07), (0.535, 0.0)]
        _lathe(en.bm, ec, d, prof, seg=12)
        en.paint(s1, metal)
        s1 = en.mark()      # rocker box on the head (front-to-back)
        rot = Matrix((side, Y, d)).transposed().to_4x4()
        _box(en.bm, ec + d * 0.55, (0.075, 0.19, 0.05), rot)
        en.paint(s1, mdark)
        s1 = en.mark()      # pushrod tubes, crankcase -> rocker box
        for sgn in (-1, 1):
            p0 = ec + d * 0.16 + Y * 0.11 + side * (0.028 * sgn)
            p1 = ec + d * 0.54 + Y * 0.075 + side * (0.028 * sgn)
            _rod(en.bm, p0, p1, 0.011, seg=6)
        # intake pipe from the rear case to the back of the head
        _rod(en.bm, ec + d * 0.14 - Y * 0.17, ec + d * 0.47 - Y * 0.075, 0.020, seg=8)
        en.paint(s1, mlight)
        s1 = en.mark()      # exhaust stub into the collector ring
        _rod(en.bm, ec + d * 0.48 - Y * 0.07, ring_c + d * 0.50, 0.026, seg=8)
        en.paint(s1, exhaust)
    s0 = en.mark()
    _torus(en.bm, ring_c, (0, 1, 0), 0.50, 0.034, seg=30, seg2=8)    # collector ring
    a = math.radians(215)
    rp = ring_c + Vector((math.cos(a), 0, math.sin(a))) * 0.50
    out_pts = [rp, rp + Vector((-0.04, -0.20, -0.02)),
               Vector((-0.50, 1.20, 1.12)), Vector((-0.51, 0.80, 1.11))]
    _tube(en.bm, out_pts, 0.036, seg=8)              # exhaust pipe along the side
    _lathe(en.bm, out_pts[-1], (0, -1, 0), [(0, 0.036), (0.06, 0.05)], seg=8)
    en.paint(s0, exhaust)
    B.obj("radial", en, outline=0.006)
    B.empty("engine", ec, size=0.3, display="PLAIN_AXES")

    # ---- two-blade wooden propeller (separate, spins about local Y) --------
    hub = Vector((0, 2.06, THRUST_Z))
    pr = _Part()

    def p_chord(f):
        if f < 0.55:
            c = 0.11 + 0.085 * math.sin(0.5 * math.pi * f / 0.55)
        else:
            c = 0.195 - 0.07 * ((f - 0.55) / 0.45) ** 2
        if f > 0.9:
            c *= max(0.28, math.sqrt(max(0.0, 1 - ((f - 0.9) / 0.1) ** 2)))
        return c

    def p_thick(f):
        return 0.09 + 0.33 * max(0.0, 1 - f / 0.35) ** 2

    s0 = pr.mark()
    for sgn in (1, -1):
        _prop_blade(pr, hub, (0, 1, 0), (sgn, 0, 0), 0.04, 1.175,
                    chord_fn=p_chord,
                    pitch_fn=lambda f, s=sgn: s * math.radians(46 - 32 * f),
                    thick=0.12, steps=16, thick_fn=p_thick)
    _lathe(pr.bm, hub - Y * 0.075, (0, 1, 0),
           [(0, 0.0), (0, 0.12), (0.15, 0.12), (0.15, 0.0)], seg=16)    # wooden boss
    pr.paint(s0, wood)
    s0 = pr.mark()
    for yy in (-0.095, 0.075):                        # steel hub flanges
        _lathe(pr.bm, hub + Y * yy, (0, 1, 0),
               [(0, 0.0), (0, 0.105), (0.02, 0.105), (0.02, 0.0)], seg=16)
    for k in range(6):                                # through-bolts
        a = math.radians(30 + 60 * k)
        p = hub + Vector((math.cos(a), 0, math.sin(a))) * 0.078
        _rod(pr.bm, p - Y * 0.11, p + Y * 0.11, 0.011, seg=6)
    _lathe(pr.bm, hub + Y * 0.095, (0, 1, 0),
           [(0, 0.05), (0.03, 0.045), (0.05, 0.02), (0.055, 0.0)], seg=12)  # nut cap
    pr.paint(s0, mlight)
    prop = B.obj("prop", pr, origin=hub, outline=0.008)
    prop.rotation_mode = "XYZ"

    # ---- main gear: V struts, axle, bungee cords; covered wheels ------------
    ge = _Part()
    s0 = ge.mark()
    R_W, Y_AX, X_W = 0.385, 0.50, 0.86
    for sx in (-1, 1):
        apex = Vector((sx * 0.74, Y_AX, R_W))
        _rod(ge.bm, apex, (sx * 0.36, 0.95, 1.00), 0.032, fore=1.8)
        _rod(ge.bm, apex, (sx * 0.36, -0.10, 1.00), 0.032, fore=1.8)
        _lathe(ge.bm, apex - Vector((sx * 0.02, 0, 0)), (sx, 0, 0),
               [(0, 0.0), (0, 0.05), (0.06, 0.05), (0.06, 0.0)], seg=10)
    _rod(ge.bm, (-0.95, Y_AX, R_W), (0.95, Y_AX, R_W), 0.026)
    ge.paint(s0, mdark)
    s0 = ge.mark()
    for sx in (-1, 1):                                # bungee shock cords
        for dx in (0.60, 0.645, 0.69):
            _torus(ge.bm, (sx * dx, Y_AX, R_W + 0.035), (1, 0, 0), 0.055, 0.013,
                   seg=14, seg2=6, sR=(1.0, 1.6))
    ge.paint(s0, bungee)
    B.obj("gear", ge, outline=0.006)
    for sx, tag in ((-1, "L"), (1, "R")):
        wh = _Part()
        c = Vector((sx * X_W, Y_AX, R_W))
        w = 0.075
        prof = [(-w * 1.1, 0.0), (-w * 1.1, 0.04), (-w * 0.75, 0.06), (-w * 0.6, 0.075),
                (-w * 0.45, 0.16), (-w * 0.55, R_W * 0.62), (-w * 0.95, R_W * 0.68),
                (-w, R_W * 0.86), (-w * 0.65, R_W * 0.975), (0, R_W),
                (w * 0.65, R_W * 0.975), (w, R_W * 0.86), (w * 0.95, R_W * 0.68),
                (w * 0.55, R_W * 0.62), (w * 0.45, 0.16), (w * 0.6, 0.075),
                (w * 0.75, 0.06), (w * 1.1, 0.04), (w * 1.1, 0.0)]
        s0 = wh.mark()
        _lathe(wh.bm, c, (1, 0, 0), prof, seg=24)
        wh.paint(s0, olive)                           # fabric wheel covers
        ax = Vector((1, 0, 0))

        def rad(p, c=c):
            q = p - c
            return (q - ax * q.dot(ax)).length

        wh.paint_where(s0, tyre, lambda p: rad(p) > R_W * 0.66)
        wh.paint_where(s0, mdark, lambda p: rad(p) < 0.07)
        B.obj("wheel" + tag, wh, origin=c, outline=0.008)

    # ---- tail skid with its spring -----------------------------------------
    sk = _Part()
    s0 = sk.mark()
    zb = _station(_PO2_FUSE, -5.0)[2]
    piv = Vector((0, -4.95, zb + 0.06))
    shoe = Vector((0, -5.40, zb - 0.30))
    _rod(sk.bm, piv, shoe, 0.03, fore=1.6, r1=0.02)
    _box(sk.bm, shoe + Vector((0, -0.03, -0.01)), (0.05, 0.16, 0.035))
    _box(sk.bm, piv, (0.09, 0.06, 0.05))
    sk.paint(s0, mdark)
    s0 = sk.mark()
    a = piv.lerp(shoe, 0.55)
    zb2 = _station(_PO2_FUSE, -5.35)[2]
    b = Vector((0, -5.35, zb2 + 0.02))
    ax = (b - a)
    _, u, v = _basis(ax)
    pts = []
    turns, n = 6, 6 * 10
    for i in range(n + 1):
        t = i / n
        th = 2 * math.pi * turns * t
        pts.append(a + ax * t + u * (0.028 * math.cos(th)) + v * (0.028 * math.sin(th)))
    _tube(sk.bm, pts, 0.0065, seg=5)
    sk.paint(s0, mlight)
    B.obj("tailskid", sk, outline=0.004)

    # ---- bombs + racks under the lower wing ---------------------------------
    BOMB_R = 0.12
    for sx, tag in ((-1, "L"), (1, "R")):
        x, yc = sx * 1.35, LO_LE - CHORD * 0.50
        zu = bottom_lower(x, yc).z
        bc = Vector((x, yc, zu - 0.09 - BOMB_R))
        rk = _Part()
        s0 = rk.mark()
        _box(rk.bm, (x, yc, zu - 0.03), (0.08, 0.60, 0.10))          # rack beam
        for dy in (-0.20, 0.20):
            _box(rk.bm, (x, yc + dy, zu - 0.07), (0.05, 0.05, 0.06))  # shackles
            for dx in (-1, 1):                                    # sway braces
                top = Vector((x + dx * 0.05, yc + dy, zu - 0.05))
                foot = Vector((x + dx * 0.085, yc + dy, bc.z + BOMB_R * 0.55))
                _rod(rk.bm, top, foot, 0.010, seg=6)
                _box(rk.bm, foot, (0.03, 0.04, 0.012),
                     Matrix.Rotation(dx * math.radians(-40), 4, "Y"))
        rk.paint(s0, mdark)
        B.obj("rack" + tag, rk, outline=0.005)
        bp = _Part()
        s0 = bp.mark()
        _lathe(bp.bm, bc, (0, 1, 0),
               [(0.56, 0.0), (0.53, 0.05), (0.46, 0.09), (0.34, 0.115), (0.16, BOMB_R),
                (-0.22, BOMB_R), (-0.36, 0.095), (-0.50, 0.05), (-0.56, 0.035),
                (-0.56, 0.0)], seg=16)
        bp.paint(s0, bomb_m)
        s0 = bp.mark()
        for k in range(4):   # cross tail fins + ring
            rot = Matrix.Rotation(math.radians(45 + 90 * k), 4, "Y")
            off = rot @ Vector((0, 0, 0.10))
            _box(bp.bm, bc + Vector((off.x, -0.56, off.z)), (0.008, 0.24, 0.14), rot)
        _torus(bp.bm, bc + Vector((0, -0.62, 0)), (0, 1, 0), 0.165, 0.012, seg=20, seg2=6)
        for dy in (-0.20, 0.20):                     # suspension lugs
            _box(bp.bm, bc + Vector((0, dy, BOMB_R + 0.01)), (0.02, 0.04, 0.04))
        bp.paint(s0, bomb_m)
        s0 = bp.mark()
        _lathe(bp.bm, bc + Vector((0, 0.40, 0)), (0, 1, 0),
               [(0, 0.104), (0.035, 0.098)], seg=16)    # red nose band
        bp.paint(s0, red)
        B.obj("bomb" + tag, bp, origin=bc, outline=0.008)

    # ---- empties for character cards -------------------------------------
    for (cy, _, _), tag in zip(cockpits, ("front", "rear")):
        zt = _station(_PO2_FUSE, cy)[3]
        B.empty("seat_" + tag, (0, cy, zt + 0.24), size=0.2, display="CUBE")

    return B.root


# --------------------------------------------------------------------------
# Messerschmitt Bf 109E
# --------------------------------------------------------------------------

_BF_FUSE = [
    (2.86, 0.29, 1.26, 1.84, 0.285, 0.285),
    (2.60, 0.37, 1.12, 1.93, 0.30, 0.30),
    (2.05, 0.42, 1.01, 1.99, 0.27, 0.24),
    (1.20, 0.44, 0.96, 2.02, 0.24, 0.22),
    (0.30, 0.44, 0.95, 2.00, 0.22, 0.22),
    (-0.70, 0.41, 0.98, 1.98, 0.22, 0.20),
    (-1.80, 0.33, 1.08, 1.93, 0.20, 0.18),
    (-3.00, 0.25, 1.22, 1.87, 0.15, 0.14),
    (-4.20, 0.16, 1.40, 1.82, 0.10, 0.09),
    (-5.00, 0.09, 1.52, 1.80, 0.06, 0.05),
    (-5.25, 0.035, 1.58, 1.78, 0.02, 0.02),
]


def make_bf109(name="Bf109", outline=True, gear=True):
    """Build a simplified Messerschmitt Bf 109E. No national insignia.
    gear=False skips the undercarriage (in flight)."""
    B = _Builder(name, outline)
    camo, yellow = _camo_mat(), _mat("rlm04")
    r70, glass = _mat("rlm70"), _mat("glass", alpha=0.30)
    interior, mdark, tyre = _mat("interior"), _mat("metal_dark"), _mat("tyre")
    exhaust = _mat("exhaust")
    THRUST_Z = 1.55

    # ---- fuselage (yellow cowling) ----------------------------------------
    fu = _Part()
    s0 = fu.mark()
    _loft(fu.bm, [_rrect_xz(*s, k=4) for s in _BF_FUSE])
    fu.paint(s0, camo)
    fu.paint_where(s0, yellow, lambda p: p.y > 1.30)
    fuse = B.obj("fuselage", fu, origin=(0, 0, 0), smooth=40, outline=0)
    c = _Part()
    s1 = c.mark()
    _loft(c.bm, [_rrect_xy(1.55, 0, 0.05, 0.30, 0.48, 0.12),
                 _rrect_xy(2.30, 0, 0.05, 0.30, 0.48, 0.12)])
    c.paint(s1, interior)
    B.boolean_pockets(fuse, [c])
    B.shade(fuse, 40)
    B.add_outline(fuse, 0.012)

    # ---- canopy with squared framing --------------------------------------
    # (y, z sill, z top, sill half width, top half width)
    cs = [(0.98, 1.95, 2.06, 0.30, 0.20), (0.55, 1.95, 2.40, 0.34, 0.19),
          (-0.42, 1.95, 2.40, 0.34, 0.19), (-0.98, 1.95, 2.05, 0.27, 0.16)]
    cp = _Part()
    s0 = cp.mark()
    rings = [[Vector((-bw, y, zb)), Vector((-tw, y, zt)), Vector((tw, y, zt)),
              Vector((bw, y, zb))] for y, zb, zt, bw, tw in cs]
    _loft(cp.bm, rings, closed=False)
    cp.paint(s0, glass)
    B.obj("canopy", cp, smooth=0, outline=0)

    fr = _Part()
    s0 = fr.mark()
    R = 0.016
    for i in range(len(rings) - 1):   # longitudinal frames (top edges + sills)
        for j in range(4):
            _rod(fr.bm, rings[i][j], rings[i + 1][j], R, seg=6)
    for ring in rings:                # cross frames at each station
        for j in range(3):
            _rod(fr.bm, ring[j], ring[j + 1], R, seg=6)

    def lerp_ring(t):
        a, b = rings[1], rings[2]
        return [a[j].lerp(b[j], t) for j in range(4)]

    for t in (0.42,):                 # sliding-hood joint
        rr = lerp_ring(t)
        for j in range(3):
            _rod(fr.bm, rr[j], rr[j + 1], R, seg=6)
    for sx_idx in ((0, 1), (3, 2)):   # horizontal bar across the side panels
        a0 = rings[1][sx_idx[0]].lerp(rings[1][sx_idx[1]], 0.5)
        a1 = rings[2][sx_idx[0]].lerp(rings[2][sx_idx[1]], 0.5)
        _rod(fr.bm, a0, a1, R * 0.8, seg=6)
    fr.paint(s0, camo)
    B.obj("canopy_frame", fr, smooth=30, outline=0.004)
    B.empty("seat", (0, 0.02, 2.20), size=0.2, display="CUBE")

    # ---- low wing, squared tips, dihedral -----------------------------------
    HALF = 4.93
    Z0, DIH = 1.07, math.radians(6.5)

    def wz(x):
        return Z0 + abs(x) * math.tan(DIH)

    def chord(x):
        return 2.00 - 0.80 * abs(x) / HALF

    def le(x):
        return 1.12 - 0.22 * abs(x) / HALF

    wg = _Part()
    st = _span_stations(HALF, chord, le, wz, 0.22, [0.4, 0.9, 1.5, 2.2, 3.0, 3.8],
                        tip="square")
    s0 = wg.mark()
    _surface(wg, st, _airfoil(n=10, thick=0.14, camber=0.02))
    wg.paint(s0, camo)
    bvh_w = wg.bvh()
    B.obj("wing", wg, outline=0.012)

    def wing_under(x, y):
        h = _hit(bvh_w, (x, y, wz(x) - 1.0), (0, 0, 1))
        return h.z if h else wz(x) - 0.1

    # radiator scoops under each wing (dark intake face, rear flap)
    rd = _Part()
    for sx in (-1, 1):
        x = sx * 1.75
        zu = wing_under(x, -0.15)
        rings = []
        for y, f in ((0.30, 0.85), (0.20, 1.0), (-0.40, 1.0), (-0.55, 0.8)):
            rings.append(_rrect_xz(y, 0.26 * (0.9 + 0.1 * f), zu - 0.16 * f, zu + 0.10,
                                   0.05, 0.05, k=2, cx=x))
        s0 = rd.mark()
        faces = _loft(rd.bm, rings)
        rd.paint(s0, camo)
        faces[-2].material_index = rd.slot(interior)   # front intake (start cap)
        s0 = rd.mark()
        _box(rd.bm, (x, -0.64, zu - 0.12), (0.46, 0.20, 0.012),
             Matrix.Rotation(math.radians(-18), 4, "X"))
        rd.paint(s0, camo)
    B.obj("radiators", rd, smooth=30, outline=0.008)

    # ---- tail: tailplane on struts, fin, rudder ----------------------------
    tp = _Part()
    s0 = tp.mark()
    st = _span_stations(1.55, 0.86, -4.42, lambda x: 1.86, 0.45, [0.3, 0.7])
    _surface(tp, st, _airfoil(n=8, thick=0.09, camber=0.0))
    tp.paint(s0, camo)
    B.obj("tailplane", tp, outline=0.008)
    ts = _Part()
    s0 = ts.mark()
    for sx in (-1, 1):
        zfb = _station(_BF_FUSE, -4.55)[2]
        _rod(ts.bm, (sx * 0.10, -4.62, zfb + 0.10), (sx * 0.72, -4.72, 1.85), 0.018,
             fore=2.2)
    ts.paint(s0, camo)
    B.obj("tailstruts", ts, outline=0.005)

    fin = _Part()
    s0 = fin.mark()
    fin_st = [(1.70, -4.30, 0.88, 0, 1), (1.95, -4.42, 0.76, 0, 1),
              (2.20, -4.56, 0.62, 0, 1), (2.42, -4.72, 0.46, 0, 1),
              (2.56, -4.86, 0.32, 0, 1), (2.64, -5.00, 0.18, 0, 1),
              (2.67, -5.10, 0.08, 0, 1)]
    _surface(fin, fin_st, _airfoil(n=8, thick=0.09, camber=0.0), vertical=True)
    fin.paint(s0, camo)
    B.obj("fin", fin, outline=0.008)
    HINGE = -5.18
    rud = _Part()
    s0 = rud.mark()
    rch = [(1.58, 0.22), (1.66, 0.40), (1.80, 0.50), (2.10, 0.52), (2.40, 0.48),
           (2.58, 0.38), (2.68, 0.24), (2.72, 0.08)]
    _surface(rud, [(z, HINGE, c, 0, 1) for z, c in rch],
             _airfoil(n=8, thick=0.12, camber=0.0), vertical=True)
    rud.paint(s0, camo)
    B.obj("rudder", rud, origin=(0, HINGE, 2.1), outline=0.008)

    # ---- nose details: exhaust stubs, supercharger intake, oil cooler -------
    nd = _Part()
    for sx in (-1, 1):
        for i in range(6):
            y = 2.32 - i * 0.13
            st_ = _station(_BF_FUSE, y)
            x0 = sx * (st_[1] - 0.03)
            s0 = nd.mark()
            _rod(nd.bm, (x0, y, 1.40), (x0 + sx * 0.09, y - 0.07, 1.37), 0.030,
                 seg=6, fore=1.6)
            nd.paint(s0, exhaust)
    s0 = nd.mark()
    st_ = _station(_BF_FUSE, 1.55)
    _lathe(nd.bm, (-(st_[1] + 0.03), 1.25, 1.70), (0, 1, 0),
           [(0, 0.0), (0.0, 0.05), (0.30, 0.075), (0.42, 0.075), (0.43, 0.0)], seg=10)
    nd.paint(s0, yellow)
    s0 = nd.mark()
    _loft(nd.bm, [_rrect_xz(2.10, 0.15, 0.92, 1.06, 0.04, 0.05, k=2),
                  _rrect_xz(1.60, 0.16, 0.90, 1.04, 0.04, 0.05, k=2),
                  _rrect_xz(1.35, 0.12, 0.97, 1.04, 0.03, 0.03, k=2)])
    nd.paint(s0, yellow)
    B.obj("nose_details", nd, smooth=30, outline=0.006)

    # ---- spinner + three-blade prop (separate, spins about local Y) ---------
    hub = Vector((0, 2.98, THRUST_Z))
    pr = _Part()
    s0 = pr.mark()
    _lathe(pr.bm, (0, 2.84, THRUST_Z), (0, 1, 0),
           [(0, 0.0), (0, 0.285), (0.06, 0.28), (0.14, 0.25), (0.22, 0.19),
            (0.29, 0.11), (0.33, 0.04), (0.345, 0.0)], seg=24)
    pr.paint(s0, r70)
    s0 = pr.mark()
    for k in range(3):
        a = math.radians(90 + 120 * k)
        d = Vector((math.cos(a), 0, math.sin(a)))
        _prop_blade(pr, hub, (0, 1, 0), d, 0.12, 1.55,
                    chord_fn=lambda f: (0.17 + 0.09 * math.sin(math.pi * min(1, f * 1.2) * 0.8))
                    * (1 if f < 0.90 else max(0.3, 1 - (f - 0.90) * 7)),
                    pitch_fn=lambda f: math.radians(38 - 22 * f), thick=0.10)
    pr.paint(s0, r70)
    prop = B.obj("prop", pr, origin=hub, outline=0.008)
    prop.rotation_mode = "XYZ"
    B.empty("engine", (0, 2.2, THRUST_Z), size=0.3, display="PLAIN_AXES")

    # ---- undercarriage (one object so the film can hide it) ----------------
    if gear:
        ge = _Part()
        RW = 0.33
        for sx in (-1, 1):
            top = Vector((sx * 0.42, 0.62, wing_under(sx * 0.42, 0.62) + 0.06))
            axle = Vector((sx * 0.98, 0.78, RW))
            s0 = ge.mark()
            _rod(ge.bm, top, axle + Vector((-sx * 0.10, 0, 0.02)), 0.045, seg=10)
            _rod(ge.bm, axle + Vector((-sx * 0.12, 0, 0)), axle, 0.03, seg=8)
            # gear door on the leg
            _box(ge.bm, (top + axle) / 2 + Vector((sx * 0.03, 0.05, 0)),
                 (0.012, 0.22, (top - axle).length * 0.8),
                 (top - axle).to_track_quat("Z", "Y").to_matrix().to_4x4())
            ge.paint(s0, camo)
            s0 = ge.mark()
            _wheel(ge, axle + Vector((sx * 0.02, 0, 0)), RW, 0.17, tyre, camo)
        s0 = ge.mark()   # tail wheel
        zb = _station(_BF_FUSE, -4.55)[2]
        _rod(ge.bm, (0, -4.45, zb + 0.08), (0, -4.62, zb - 0.22), 0.03, seg=8)
        ge.paint(s0, camo)
        _wheel(ge, (0, -4.66, zb - 0.27), 0.11, 0.07, tyre, camo)
        B.obj("gear", ge, outline=0.007)

    return B.root
