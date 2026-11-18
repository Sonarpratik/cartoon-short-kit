"""Mesh building and density scatter. MB = primitives with material slots into one mesh (share it: instances are cheap).
place() registers every prop in TALLY; TALLY.report(types=30, instances=600) checks the world-density targets (DENSITY LAW)."""
import bpy, bmesh, math, random
from mathutils import Vector, Matrix, Euler

class Tally(dict):
    def add(self, k): self[k] = self.get(k, 0) + 1
    def report(self, types=30, instances=600):
        t, n = len(self), sum(self.values()); return {"types": t, "instances": n, "types_ok": t >= types, "instances_ok": n >= instances, "counts": dict(self)}
TALLY = Tally()

class MB:
    def __init__(self, name, mats): self.name, self.mats, self.bm = name, mats, bmesh.new()
    def take(self, t, mat, M):
        bmesh.ops.transform(t, matrix=M, verts=t.verts)
        for f in t.faces: f.material_index = mat
        me = bpy.data.meshes.new("_t"); t.to_mesh(me); t.free(); self.bm.from_mesh(me); bpy.data.meshes.remove(me); return self
    def box(self, c, s, mat=0, rx=0, ry=0, rz=0):
        t = bmesh.new(); bmesh.ops.create_cube(t, size=1); return self.take(t, mat, Matrix.Translation(c) @ Euler((rx, ry, rz)).to_matrix().to_4x4() @ Matrix.Diagonal((*s, 1)))
    def cyl(self, c, r, h, mat=0, seg=16, r2=None, rot=(0, 0, 0), caps=True):
        t = bmesh.new(); bmesh.ops.create_cone(t, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h); return self.take(t, mat, Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4())
    def sph(self, c, s, mat=0, seg=14, ring=9):
        t = bmesh.new(); bmesh.ops.create_uvsphere(t, u_segments=seg, v_segments=ring, radius=1); return self.take(t, mat, Matrix.Translation(c) @ Matrix.Diagonal((*s, 1)))
    def ico(self, c, r, mat=0, sub=2, sq=(1, 1, 1)):
        t = bmesh.new(); bmesh.ops.create_icosphere(t, subdivisions=sub, radius=1); return self.take(t, mat, Matrix.Translation(c) @ Matrix.Diagonal((r * sq[0], r * sq[1], r * sq[2], 1)))
    def rod(self, a, b, r, mat=0, seg=6):
        a, b = Vector(a), Vector(b); d = b - a; t = bmesh.new(); bmesh.ops.create_cone(t, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=d.length); return self.take(t, mat, Matrix.Translation((a + b) / 2) @ Vector((0, 0, 1)).rotation_difference(d.normalized()).to_matrix().to_4x4())
    def mesh(self):
        me = bpy.data.meshes.new(self.name); self.bm.to_mesh(me); self.bm.free()
        for m in self.mats: me.materials.append(m)
        for p in me.polygons: p.use_smooth = True
        me.set_sharp_from_angle(angle=math.radians(50)); return me

def blades(name, mat, n=11, h=.32, seed=4):
    """grass tuft from thin tapered strips. Keep them at least 1.2 m from the lens (nearer they measure as pixel noise)."""
    bm = bmesh.new(); r = random.Random(seed)
    for i in range(n):
        a = r.uniform(0, math.tau); x, y = .05 * math.cos(a) * r.random(), .05 * math.sin(a) * r.random(); hh = h * r.uniform(.6, 1.15); le = r.uniform(.15, .55); w = .011 * r.uniform(.8, 1.3); d = (math.cos(a), math.sin(a)); p = (-d[1], d[0]); ring = []
        for k in range(4):
            t = k / 3; o = le * hh * t * t; ww = w * (1 - t) + .0015; c = (x + d[0] * o, y + d[1] * o, hh * t); ring.append((bm.verts.new((c[0] - p[0] * ww, c[1] - p[1] * ww, c[2])), bm.verts.new((c[0] + p[0] * ww, c[1] + p[1] * ww, c[2]))))
        for k in range(3): bm.faces.new((ring[k][0], ring[k][1], ring[k + 1][1], ring[k + 1][0]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat); return me

def place(scene, me, loc, rz=0, s=1.0, kind=None, rx=0, ry=0, bevel=0.0):
    o = bpy.data.objects.new(me.name, me); scene.collection.objects.link(o); o.location = loc; o.rotation_euler = (rx, ry, rz); o.scale = s if isinstance(s, tuple) else (s, s, s)
    if bevel:
        b = o.modifiers.new("B", "BEVEL"); b.width = bevel; b.segments = 1; b.limit_method = "ANGLE"; b.angle_limit = math.radians(40)
    TALLY.add(kind or me.name); return o

def cluster3(scene, me, c, spread=1.2, rng=random, kind=None, sizes=(1, .82, .7), bevel=0.0):
    """DENSITY LAW: big + medium + small, never lines or grids."""
    return [place(scene, me, (c[0] + dx, c[1] + dy, c[2] if len(c) > 2 else 0), rz=rng.uniform(-.5, .5), s=s, kind=kind, bevel=bevel)
            for (dx, dy), s in zip([(0, 0), (spread * .9, spread * .35), (spread * .25, -spread * .8)], sizes)]

def field(scene, me, area, n, rng=random, exclude=(), kind=None, size=(.7, 1.3)):
    """area = (x0, x1, y0, y1); exclude = [(x, y, radius)] keeps sight lines and paths clear."""
    k = 0
    for _ in range(n * 4):
        if k >= n: break
        x, y = rng.uniform(area[0], area[1]), rng.uniform(area[2], area[3])
        if any((x - a) ** 2 + (y - b) ** 2 < r * r for a, b, r in exclude): continue
        place(scene, me, (x, y, 0), rz=rng.uniform(0, 6.28), s=rng.uniform(*size), kind=kind); k += 1
    return k
