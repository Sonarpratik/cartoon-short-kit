"""lock2.py: LOCK v2 (2026-11-10, first real episode). One place of a locked film in Blender with EVERYTHING the approved animatic showed:

- cards: the in-between drawings (tweens, eased faces, face tints) from out/lock/cards, placed, turned AND tipped to the lens exactly as
  templates/threejs_film does it (CB: never squash a character)
- motion: the set's moving parts (trains, levers, signal arms, trolleys, smoke) on every frame, from out/lock/motion/<place>.json
- highlights: the object a line talks about glows in the highlight colour (object properties hl / hl_col drive an emission that is hooked
  into its material), with coloured point lights at the bloom points, from out/lock/highlights.json
The drawn layer (effects, lens glints, transitions, captions) is not rebuilt: render.mjs --overlay writes it and it is laid over the render.

    import sys; sys.path.insert(0, r"<skill>/templates")
    from blender_look import lock2
    K = lock2.build(bpy.context.scene, r"<skill>/episodes/<name>", "junction", preset="day")
    # K: camera, cards, set, by_id, materials, frames (list of this place's frame numbers), keep_clear, lock, lights
Blender frame = plan frame. A place whose frames are not one stretch (a visit, then a return) keeps its true frame numbers: render the
ranges in K["ranges"].
"""
import bpy, json, os, math
from mathutils import Vector, Quaternion
from . import from_lock as FL, materials as M, look as LOOK, render as R

def _j(p): return json.load(open(p, encoding="utf-8"))
def _varies(v, eps=1e-6): return any(abs(x - v[0]) > eps for x in v)

def _curve(idb, path, index, frames, values, interp=1):
    """one f-curve written in one go (interp: 0 constant, 1 linear). keyframe_insert per frame is far too slow for a whole film."""
    if idb.animation_data is None: idb.animation_data_create()
    act = idb.animation_data.action
    if act is None: act = bpy.data.actions.new(idb.name + "_lock"); idb.animation_data.action = act
    try: fc = act.fcurve_ensure_for_datablock(idb, path, index=index)
    except Exception: fc = act.fcurves.find(path, index=index) or act.fcurves.new(path, index=index)
    keep = [i for i in range(len(frames)) if i == 0 or i == len(frames) - 1 or (values[i] != values[i - 1] if interp == 0 else not (values[i - 1] == values[i] == values[i + 1]))]
    n = len(keep); fc.keyframe_points.clear(); fc.keyframe_points.add(n); co = [0.0] * (2 * n); co[0::2] = [float(frames[i]) for i in keep]; co[1::2] = [float(values[i]) for i in keep]
    fc.keyframe_points.foreach_set("co", co); fc.keyframe_points.foreach_set("interpolation", [interp] * n); fc.update(); return fc

def by_id(objs): return {int(o["lock_id"]): o for o in objs if "lock_id" in o.keys()}

# ---------------------------------------------------------------- cards
def card(scene, lock, who, frames, self_lit=.5, emit=1.0):
    """frames = this place's camera frames. The card stands on run.pos, turns to the lens about the vertical axis and tips to it."""
    folder = os.path.join(lock, "cards", who); I = _j(os.path.join(folder, "index.json")); k = I["metres_per_px"]; w, h = I["px"]
    m = bpy.data.materials.new("Card_" + who); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); it = nt.nodes.new("ShaderNodeTexImage"); it.name = "seq"; img = bpy.data.images.load(os.path.join(folder, "s0001.png")); img.source = "SEQUENCE"; it.image = img; it.interpolation = "Cubic"; it.extension = "CLIP"
    iu = it.image_user; iu.frame_duration = 1000000; iu.frame_start = 1; iu.use_auto_refresh = True; iu.use_cyclic = False
    e = nt.nodes.new("ShaderNodeEmission"); e.name = "self"; e.inputs[1].default_value = emit; L(it.outputs[0], e.inputs[0]); p = nt.nodes.new("ShaderNodeBsdfPrincipled"); p.inputs["Roughness"].default_value = .8; L(it.outputs[0], p.inputs["Base Color"])
    mix = nt.nodes.new("ShaderNodeMixShader"); mix.name = "self_mix"; mix.inputs[0].default_value = self_lit; L(p.outputs[0], mix.inputs[1]); L(e.outputs[0], mix.inputs[2])
    t = nt.nodes.new("ShaderNodeBsdfTransparent"); a = nt.nodes.new("ShaderNodeMixShader"); L(it.outputs[1], a.inputs[0]); L(t.outputs[0], a.inputs[1]); L(mix.outputs[0], a.inputs[2]); L(a.outputs[0], out.inputs[0])
    try: m.surface_render_method = "DITHERED"
    except Exception: m.blend_method = "HASHED"
    m.use_backface_culling = False
    me = bpy.data.meshes.new("Card_" + who); x0, x1 = -w * k / 2, w * k / 2; z0 = -(h - I["ground_px"]) * k
    me.from_pydata([(x0, 0, z0), (x1, 0, z0), (x1, 0, z0 + h * k), (x0, 0, z0 + h * k)], [], [(0, 1, 2, 3)]); uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = c
    me.materials.append(m); ob = bpy.data.objects.new("Card_" + who, me); scene.collection.objects.link(ob); ob.rotation_mode = "XYZ"
    runs = I["runs"]; hk = (I.get("tip") or {}).get("head_k", .55) * I.get("height_m", 1.7); ri = 0
    fr, X, Y, Z, RX, RZ, HIDE, OFF = [], [], [], [], [], [], [], []; prev = None
    for c in frames:
        f = c["f"]
        while ri < len(runs) - 1 and runs[ri]["f1"] < f: ri += 1
        while ri > 0 and runs[ri]["f0"] > f: ri -= 1
        r = runs[ri]; q = r["pos"]; cp = c["pos"]; dx, dy = cp[0] - q[0], cp[1] - q[1]
        yaw = math.atan2(dx, -dy); tilt = math.atan2(cp[2] - (q[2] + hk), math.hypot(dx, dy))
        if prev is not None:                                     # no jump through +-180 deg between two frames (motion blur would spin the card)
            while yaw - prev > math.pi: yaw -= 2 * math.pi
            while yaw - prev < -math.pi: yaw += 2 * math.pi
        prev = yaw; fr.append(f); X.append(q[0]); Y.append(q[1]); Z.append(q[2]); RX.append(-tilt); RZ.append(yaw); HIDE.append(0 if r.get("visible", True) else 1); OFF.append(r["img"] - f)
    for i, v in enumerate((X, Y, Z)): _curve(ob, "location", i, fr, v)
    _curve(ob, "rotation_euler", 0, fr, RX); _curve(ob, "rotation_euler", 2, fr, RZ)
    _curve(ob, "hide_render", 0, fr, HIDE, 0); _curve(ob, "hide_viewport", 0, fr, HIDE, 0)
    _curve(nt, 'nodes["seq"].image_user.frame_offset', 0, fr, OFF, 0)
    def pos_at(f):
        for r in runs:
            if r["f0"] <= f <= r["f1"]: return r["pos"] if r.get("visible", True) else None
        return None
    return dict(object=ob, material=m, pos_at=pos_at, index=I)

# ---------------------------------------------------------------- moving set parts
def motion(lock, place, objs):
    p = os.path.join(lock, "motion", place + ".json")
    if not os.path.exists(p): return {"moving": 0}
    mo = _j(p); ids = by_id(objs); fr = mo["frames"]; rep = {"moving": 0, "missing": []}
    for lid, nd in mo["nodes"].items():
        o = ids.get(int(lid)); t = nd["trs"]
        if o is None: rep["missing"].append(nd["name"]); continue
        o.rotation_mode = "QUATERNION"; rep["moving"] += 1
        loc = ([v[0] for v in t], [-v[2] for v in t], [v[1] for v in t]); scl = ([v[7] for v in t], [v[9] for v in t], [v[8] for v in t]); qs = []; prev = None
        for v in t:                                               # three.js (x, y, z, w), Y up -> Blender (w, x, -z, y), as the glTF importer does
            q = Quaternion((v[6], v[3], -v[5], v[4]))
            if prev is not None and q.dot(prev) < 0: q.negate()
            qs.append(q); prev = q
        for i in range(3):
            if _varies(loc[i]): _curve(o, "location", i, fr, loc[i])
            if _varies(scl[i]): _curve(o, "scale", i, fr, scl[i])
        if any(_varies([q[i] for q in qs]) for i in range(4)):
            for i in range(4): _curve(o, "rotation_quaternion", i, fr, [q[i] for q in qs])
        op = [v[10] for v in t]
        if _varies(op): o.color = (1, 1, 1, op[0]); _curve(o, "color", 3, fr, op); o["lock_opacity"] = True     # a material reads it with Object Info > Alpha
    return rep

# ---------------------------------------------------------------- instanced set parts (pebbles, sleepers, grass)
def merged(scene, name, base, mats, cols, material, color_name="inst_col"):
    """one mesh from many placed copies of `base` (a mesh): mats = 4x4 world matrices, cols = linear rgb per copy, written to a point colour
    attribute the material can read. Thousands of objects become one."""
    import numpy as np
    nv, nl, npoly, n = len(base.vertices), len(base.loops), len(base.polygons), len(mats)
    co = np.empty(nv * 3); base.vertices.foreach_get("co", co); co = co.reshape(nv, 3); lv = np.empty(nl, np.int32); base.loops.foreach_get("vertex_index", lv)
    ls = np.empty(npoly, np.int32); lt = np.empty(npoly, np.int32); base.polygons.foreach_get("loop_start", ls); base.polygons.foreach_get("loop_total", lt)
    allco = np.empty((n, nv, 3)); allcol = np.ones((n, nv, 4))
    for i, mx in enumerate(mats):
        A = np.array(mx); allco[i] = co @ A[:3, :3].T + A[:3, 3]; allcol[i, :, :3] = cols[i][:3]
    me = bpy.data.meshes.new(name); me.vertices.add(n * nv); me.loops.add(n * nl); me.polygons.add(n * npoly); off = np.arange(n, dtype=np.int32)
    me.vertices.foreach_set("co", allco.ravel()); me.loops.foreach_set("vertex_index", (lv[None, :] + off[:, None] * nv).ravel())
    me.polygons.foreach_set("loop_start", (ls[None, :] + off[:, None] * nl).ravel()); me.polygons.foreach_set("loop_total", np.tile(lt, n)); me.update(calc_edges=True)
    ca = me.color_attributes.new(color_name, "FLOAT_COLOR", "POINT"); ca.data.foreach_set("color", allcol.ravel())
    if material: me.materials.append(material)
    ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob); return ob

def with_inst_col(mat, color_name="inst_col"):
    """a copy of a library material whose base colour comes from the mesh's point colours (each pebble its own colour)"""
    m = mat.copy(); m.name = mat.name + "_inst"; nt = m.node_tree; rgb = next((n for n in nt.nodes if n.type == "RGB"), None)
    if rgb is None: return m
    at = nt.nodes.new("ShaderNodeAttribute"); at.attribute_type = "GEOMETRY"; at.attribute_name = color_name
    for l in list(rgb.outputs[0].links): nt.links.new(at.outputs["Color"], l.to_socket)
    return m

def merge_instances(scene, lock, place, objs):
    """the glTF importer makes one object per instance (11 000 objects for one junction) and their colours are lost: join each group
    into one mesh with its colours from out/lock/instances.json. Returns (objs, report)."""
    p = os.path.join(lock, "instances.json")
    if not os.path.exists(p): return objs, {"groups": 0}
    bpy.context.view_layer.update(); ids = by_id(objs); gone = set(); new = []; rep = {"groups": 0, "instances": 0}
    num = lambda o: int(o.name.rsplit(".", 1)[1]) if "." in o.name and o.name.rsplit(".", 1)[1].isdigit() else 0
    for g in _j(p).get(place, []):
        e = ids.get(int(g["id"]))
        if e is None or not e.children: continue
        kids = sorted(e.children, key=num); n = min(len(kids), len(g["colors"])); base = kids[0].data
        mat = kids[0].material_slots[0].material if kids[0].material_slots else None
        ob = merged(scene, g["name"], base, [k.matrix_world.copy() for k in kids[:n]], [_rgb(c) for c in g["colors"][:n]], with_inst_col(mat) if mat else None)
        ob["lock_id"] = int(g["id"]); ob["instances"] = n; new.append(ob); rep["groups"] += 1; rep["instances"] += n
        for k in kids: gone.add(k.as_pointer()); bpy.data.objects.remove(k, do_unlink=True)
        gone.add(e.as_pointer()); bpy.data.objects.remove(e, do_unlink=True)
    keep = []
    for o in objs:
        try:
            if o.as_pointer() not in gone: keep.append(o)
        except ReferenceError: pass
    return keep + new, rep

# ---------------------------------------------------------------- highlights
def _hook(m, strength):
    """emission in the highlight colour, mixed in by the object's own hl value: every object without the property stays as it is"""
    if not m.use_nodes or m.get("hl_hook"): return
    nt = m.node_tree; out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL" and n.is_active_output), None)
    if out is None or not out.inputs["Surface"].links: return
    src = out.inputs["Surface"].links[0].from_socket; L = nt.links.new
    a = nt.nodes.new("ShaderNodeAttribute"); a.attribute_type = "OBJECT"; a.attribute_name = "hl"; c = nt.nodes.new("ShaderNodeAttribute"); c.attribute_type = "OBJECT"; c.attribute_name = "hl_col"
    e = nt.nodes.new("ShaderNodeEmission"); e.name = "hl_emit"; e.inputs[1].default_value = strength; L(c.outputs["Color"], e.inputs[0])
    cl = nt.nodes.new("ShaderNodeClamp"); L(a.outputs["Fac"], cl.inputs[0]); mx = nt.nodes.new("ShaderNodeMixShader"); L(cl.outputs[0], mx.inputs[0]); L(src, mx.inputs[1]); L(e.outputs[0], mx.inputs[2]); L(mx.outputs[0], out.inputs["Surface"]); m["hl_hook"] = True

def _rgb(hexcol): h = hexcol.lstrip("#"); return M.lin(tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)))

def highlights(scene, lock, place, objs, strength=3.2, mix=.85, watts=55.0):
    p = os.path.join(lock, "highlights.json")
    if not os.path.exists(p): return {"highlights": 0}
    H = [h for h in _j(p) if h["place"] == place]; ids = by_id(objs); per = {}; rep = {"highlights": len(H), "objects": 0, "lights": 0, "missing": 0}
    for h in H:
        for lid in h["ids"]:
            o = ids.get(int(lid))
            if o is None: rep["missing"] += 1; continue
            d = per.setdefault(o.name, {}); f0, f1 = h["frames"][0]["f"], h["frames"][-1]["f"]
            d.setdefault(f0 - 1, (0.0, _rgb(h["frames"][0]["col"]))); d.setdefault(f1 + 1, (0.0, _rgb(h["frames"][-1]["col"])))
            for r in h["frames"]: d[r["f"]] = (r["a"] * mix, _rgb(r["col"]))
        n = max((len(r["pts"]) for r in h["frames"]), default=0)
        for j in range(n if h.get("glow") and not h.get("flare") else 0):     # the bloom points become small coloured lights: the glow falls on what is near
            ld = bpy.data.lights.new("HL", "POINT"); ld.shadow_soft_size = .12 * h.get("size", .6); lo = bpy.data.objects.new("HL_%d_%d" % (h["at"], j), ld); scene.collection.objects.link(lo); rows = [r for r in h["frames"] if len(r["pts"]) > j]
            fr = [r["f"] for r in rows]; f0, f1 = fr[0] - 1, fr[-1] + 1; en = [r["a"] * h.get("bloom", .8) * h.get("size", .6) * watts for r in rows]
            for i in range(3): _curve(lo, "location", i, fr, [r["pts"][j][i] for r in rows]); _curve(ld, "color", i, fr, [_rgb(r["col"])[i] for r in rows])
            _curve(ld, "energy", 0, [f0] + fr + [f1], [0.0] + en + [0.0]); rep["lights"] += 1
    for name, d in per.items():
        o = bpy.data.objects[name]; fr = sorted(d); o["hl"] = 0.0; o["hl_col"] = (1.0, 1.0, 1.0)
        for s in o.material_slots:
            if s.material: _hook(s.material, strength)
        _curve(o, '["hl"]', 0, fr, [d[f][0] for f in fr])
        for i in range(3): _curve(o, '["hl_col"]', i, fr, [d[f][1][i] for f in fr])
        rep["objects"] += 1
    return rep

# ---------------------------------------------------------------- one place
def ranges(frames):
    out = []
    for c in frames:
        if out and out[-1][1] == c["f"] - 1: out[-1][1] = c["f"]
        else: out.append([c["f"], c["f"]])
    return out

def build(scene, ep, place, preset="day", samples=64, res=100, motion_blur=True, clear=True, key_dir="lock", glow=None):
    """key_dir="lock": the sun stands where the animatic had it (shadows fall the same way); or a direction, or None for the preset's own.
    glow: dict(strength, mix, watts) for highlights(); a dim room needs far less than daylight (office: strength 1.1, mix .7, watts 6)."""
    L, frames, plan, lock = FL.read(ep)
    if clear:
        for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    mine = [c for c in frames if c.get("place", "") == place] or frames
    lt = (L.get("lights") or {}).get(place) or {}
    if key_dir == "lock": d = lt.get("dir"); key_dir = (d[0], -d[2], d[1]) if d else None         # three.js (x, y, z) -> plan (x, -z, y)
    LOOK.apply_look(scene, preset, key_dir=key_dir, samples=samples, res=res); R.setup_eevee(scene, samples=samples, res=res, motion_blur=motion_blur)
    objs, report = FL.import_set(scene, lock, place); gone = {o.as_pointer() for o in objs}; objs, inst = merge_instances(scene, lock, place, objs); report["_instances"] = inst
    cam = FL.camera(scene, mine); cards = {who: card(scene, lock, who, mine) for who in L.get("cards", [])}
    FL.camera_focus(cam, mine, cards)
    for ad in (cam.animation_data, cam.data.animation_data):
        if ad and ad.action:
            for fc in FL._fcurves(ad.action):
                for k in fc.keyframe_points: k.interpolation = "LINEAR"
    mv = motion(lock, place, objs); hl = highlights(scene, lock, place, objs, **(glow or {}))
    scene.frame_start, scene.frame_end = mine[0]["f"], mine[-1]["f"]; scene.render.fps = L.get("fps", 30)
    return dict(camera=cam, cards=cards, set=objs, by_id=by_id(objs), materials=report, motion=mv, highlights=hl, frames=[c["f"] for c in mine], ranges=ranges(mine),
                keep_clear=FL.keep_clear(mine, cards), lock=L, lights=lt)
