"""from_lock.py: the Blender look pass starts from the LOCK, never from a rebuild.

The three.js film is approved first (storyboard, animatic). `node templates/threejs_film/render.mjs film.json --export-lock`
then freezes it into <episode>/out/lock/ (set geometry, character card drawings) next to out/plan/ (camera, performance).
This module rebuilds exactly that in Blender, so the only things the look pass adds are materials, light, air and effects:

    import sys; sys.path.insert(0, r"<skill>/templates")
    from blender_look import from_lock as FL
    K = FL.build(bpy.context.scene, r"<skill>/episodes/<name>", place="platform", preset="morning")
    # K["camera"], K["cards"], K["frames"] (f0, f1), K["keep_clear"] for scatter.field(exclude=...)

What it guarantees:
- camera: one key per frame from camera_baked.json: position, aim, roll and field of view (transferred as the vertical angle,
  so sensor sizes cannot disagree), focus on the subject's card every frame at f/5.6 (characters are never the blurred thing)
- cards: one plane per character, same size and place as in three.js, drawings swapped per frame from index.json, facing the
  camera about the vertical axis, half self-lit (MAIN LOOK), hidden when the plan hides them
- set: the same meshes; every material named mat:<name> becomes the library material of that name (templates/blender_look/
  materials.py), keeping the three.js colour as its base colour; untagged ones become "matte" in their own colour
- keep-clear discs along the camera path and around every character position, so dressing never blocks a lens or a face
- a refusal to run if the plan changed after the lock was exported (sha1 in lock.json)
Blender frame = plan frame (the scene starts at frame 0).
"""
import bpy, json, os, math, hashlib
from mathutils import Vector, Matrix
from . import materials as M, look as LOOK, render as R

def _j(p): return json.load(open(p, encoding="utf-8"))
def _sha(p): return hashlib.sha1(open(p, "rb").read()).hexdigest()

def read(ep):
    plan, lock = os.path.join(ep, "out", "plan"), os.path.join(ep, "out", "lock"); L = _j(os.path.join(lock, "lock.json"))
    for name in ("camera_baked.json", "performance_baked.json"):
        want = (L.get("sha1") or {}).get(name)
        if want and _sha(os.path.join(plan, name)) != want: raise RuntimeError("%s changed after the lock was exported. Re-run: node templates/threejs_film/render.mjs film.json --export-lock (and get the animatic re-approved if the picture changed)" % name)
    cam = _j(os.path.join(plan, "camera_baked.json")); return L, cam["frames"], plan, lock

ALIAS = {"gravel": "dirt", "ink_flat": "flat", "clock_face": "flat", "sign_flat": "flat"}   # set names that are not library recipes
def _flat(col):
    """printed or painted flat art (clock faces, signs, tick marks): its own colour, half self-lit like the cards, no bump"""
    m = bpy.data.materials.new("flat_%02x%02x%02x" % col); m.use_nodes = True; nt = m.node_tree; b = nt.nodes.get("Principled BSDF"); c = tuple(M.lin(col)) + (1,)
    b.inputs["Base Color"].default_value = c; b.inputs["Roughness"].default_value = .7; b.inputs["Emission Color"].default_value = c; b.inputs["Emission Strength"].default_value = .35; return m

def import_set(scene, lock, place):
    """the approved three.js set, same geometry; library materials by tag"""
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(lock, "sets", place + ".glb")); objs = [o for o in bpy.data.objects if o not in before]; made = {}; report = {}; unknown = set(); done = set()
    for o in objs:
        for s in o.material_slots:
            m = s.material
            if not m or m in done: continue                 # instances share one mesh, so they share its slots: a slot that already holds a library material is done (the old name test never matched and the last instance turned the whole group matte)
            base = m.name.split(".")[0]; col = (150, 150, 150); p = m.node_tree.nodes.get("Principled BSDF") if m.use_nodes else None
            if p: c = p.inputs["Base Color"].default_value; col = tuple(int(round(255 * (v ** (1 / 2.2)))) for v in c[:3])
            tag = base[4:] if base.startswith("mat:") else "matte"; tag = ALIAS.get(tag, tag)
            if tag not in M.LIB and tag not in ("glass", "emissive_lamp", "flat"): unknown.add(tag); tag = "matte"
            key = (tag, col)
            if key not in made: made[key] = M.glass() if tag == "glass" else M.emissive_lamp(col) if tag == "emissive_lamp" else _flat(col) if tag == "flat" else M.get(tag, color=col)
            s.material = made[key]; done.add(made[key]); report[tag] = report.get(tag, 0) + 1
    if unknown: report["_unknown_as_matte"] = sorted(unknown)
    return objs, report

def _rot(pos, aim, up_hint, roll_deg):
    f = (Vector(aim) - Vector(pos)).normalized(); up = Vector(up_hint) if up_hint else (Vector((0, 1, 0)) if abs(f.z) > .97 else Vector((0, 0, 1)))
    r = f.cross(up).normalized(); u = r.cross(f)
    a = math.radians(roll_deg) * ROLL_SIGN; r, u = r * math.cos(a) + u * math.sin(a), u * math.cos(a) - r * math.sin(a)
    return Matrix((r, u, -f)).transposed().to_quaternion()
ROLL_SIGN = 1.0     # +roll in the plan = the horizon drops on the right of the frame, the same as templates/threejs_film (checked on the demo)

def camera(scene, frames, cards=None, fstop=5.6, sensor=24.0):
    d = bpy.data.cameras.new("FilmCam"); d.sensor_fit = "VERTICAL"; d.sensor_height = sensor; d.clip_start = .05; d.clip_end = 20000; d.dof.use_dof = True; d.dof.aperture_fstop = fstop
    o = bpy.data.objects.new("FilmCam", d); scene.collection.objects.link(o); o.rotation_mode = "QUATERNION"; scene.camera = o; prev = None
    for c in frames:
        f = c["f"]; o.location = c["pos"]; q = _rot(c["pos"], c["aim"], c.get("up"), c.get("roll", 0.0))
        if prev is not None and q.dot(prev) < 0: q.negate()                       # keep the short way round between keys
        o.rotation_quaternion = q; prev = q.copy(); d.lens = sensor / 2 / math.tan(math.radians(c["fov_v"]) / 2)
        focus = (Vector(c["aim"]) - Vector(c["pos"])).length
        if cards and c.get("subject") in cards:                                    # focus on the character the shot is about
            p = cards[c["subject"]]["pos_at"](f)
            if p: focus = max(.3, (Vector(p) - Vector(c["pos"])).dot((Vector(c["aim"]) - Vector(c["pos"])).normalized()))
        d.dof.focus_distance = focus
        o.keyframe_insert("location", frame=f); o.keyframe_insert("rotation_quaternion", frame=f); d.keyframe_insert("lens", frame=f); d.dof.keyframe_insert("focus_distance", frame=f)
    for ad in (o.animation_data, d.animation_data):
        if ad and ad.action:
            for fc in _fcurves(ad.action):
                for k in fc.keyframe_points: k.interpolation = "LINEAR"            # the easing is already in the bake
    return o

def _fcurves(action):
    try: return list(action.fcurves)
    except Exception:                                                              # layered actions (Blender 4.4+)
        return [fc for layer in action.layers for strip in layer.strips for bag in strip.channelbags for fc in bag.fcurves]

def card(scene, lock, who, cam_obj, self_lit=.5, emit=1.0):
    folder = os.path.join(lock, "cards", who); I = _j(os.path.join(folder, "index.json")); k = I["metres_per_px"]; w, h = I["px"]; n = max(r["img"] for r in I["runs"])
    m = bpy.data.materials.new("Card_" + who); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); it = nt.nodes.new("ShaderNodeTexImage"); it.name = "seq"; img = bpy.data.images.load(os.path.join(folder, "s0001.png")); img.source = "SEQUENCE"; it.image = img; it.interpolation = "Cubic"
    iu = it.image_user; iu.frame_duration = 1000000; iu.frame_start = 1; iu.use_auto_refresh = True; iu.use_cyclic = False      # duration must cover every scene frame: Blender clamps (frame - start + 1) to the duration BEFORE it adds the offset (a duration of n gave magenta cards after frame n, found in the first Blender test)
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[1].default_value = emit; L(it.outputs[0], e.inputs[0]); p = nt.nodes.new("ShaderNodeBsdfPrincipled"); p.inputs["Roughness"].default_value = .8; L(it.outputs[0], p.inputs["Base Color"])
    mix = nt.nodes.new("ShaderNodeMixShader"); mix.inputs[0].default_value = self_lit; L(p.outputs[0], mix.inputs[1]); L(e.outputs[0], mix.inputs[2])
    t = nt.nodes.new("ShaderNodeBsdfTransparent"); a = nt.nodes.new("ShaderNodeMixShader"); L(it.outputs[1], a.inputs[0]); L(t.outputs[0], a.inputs[1]); L(mix.outputs[0], a.inputs[2]); L(a.outputs[0], out.inputs[0])
    try: m.surface_render_method = "DITHERED"
    except Exception: m.blend_method = "HASHED"
    me = bpy.data.meshes.new("Card_" + who); x0, x1 = -w * k / 2, w * k / 2; z0 = -(h - I["ground_px"]) * k
    me.from_pydata([(x0, 0, z0), (x1, 0, z0), (x1, 0, z0 + h * k), (x0, 0, z0 + h * k)], [], [(0, 1, 2, 3)]); uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = c
    me.materials.append(m); ob = bpy.data.objects.new("Card_" + who, me); scene.collection.objects.link(ob)
    c = ob.constraints.new("LOCKED_TRACK"); c.target = cam_obj; c.track_axis = "TRACK_NEGATIVE_Y"; c.lock_axis = "LOCK_Z"
    flip = nt.nodes.new("ShaderNodeMapping"); flip.name = "flip"; tc = nt.nodes.new("ShaderNodeTexCoord"); L(tc.outputs["UV"], flip.inputs[0]); L(flip.outputs[0], it.inputs[0])
    runs = I["runs"]
    for r in runs:                                                                 # one key at the start of every run, held (CONSTANT) until the next
        f = r["f0"]; ob.location = r["pos"]; ob.keyframe_insert("location", frame=f)
        ob.hide_render = ob.hide_viewport = not r.get("visible", True); ob.keyframe_insert("hide_render", frame=f); ob.keyframe_insert("hide_viewport", frame=f)
        fl = bool(r.get("flip")); flip.inputs["Scale"].default_value = (-1 if fl else 1, 1, 1); flip.inputs["Location"].default_value = (1 if fl else 0, 0, 0)
        flip.inputs["Scale"].keyframe_insert("default_value", frame=f); flip.inputs["Location"].keyframe_insert("default_value", frame=f)
        for g in range(r["f0"], r["f1"] + 1):                                      # image number = scene frame + offset, so the offset is keyed on every frame of the run
            iu.frame_offset = r["img"] - g; iu.keyframe_insert("frame_offset", frame=g)
    for ad in (ob.animation_data, nt.animation_data):
        if ad and ad.action:
            for fc in _fcurves(ad.action):
                for kp in fc.keyframe_points: kp.interpolation = "CONSTANT"
    def pos_at(f):
        for r in runs:
            if r["f0"] <= f <= r["f1"]: return r["pos"] if r.get("visible", True) else None
        return None
    return dict(object=ob, material=m, pos_at=pos_at, index=I)

def keep_clear(frames, cards, cam_r=.7, char_r=.6, step=6):
    """[(x, y, radius)] for scatter.field(exclude=...): the camera's path and every place a character stands"""
    out = [(c["pos"][0], c["pos"][1], cam_r) for c in frames[::step]]
    for cd in cards.values():
        seen = set()
        for r in cd["index"]["runs"]:
            key = (round(r["pos"][0], 1), round(r["pos"][1], 1))
            if key not in seen: seen.add(key); out.append((r["pos"][0], r["pos"][1], char_r))
    return out

def build(scene, ep, place, preset="day", samples=64, res=100, motion_blur=True, clear=True):
    """One place of the film, ready for the look pass. Add lights (lights.practical, lights.air, lights.mist), dressing
    (scatter.*, with exclude=K["keep_clear"]), then render stills with render.still or the frame range."""
    L, frames, plan, lock = read(ep)
    if clear:
        for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    mine = [c for c in frames if c.get("place", "") == place] or frames
    LOOK.apply_look(scene, preset, samples=samples, res=res); R.setup_eevee(scene, samples=samples, res=res, motion_blur=motion_blur)
    objs, report = import_set(scene, lock, place)
    cam = camera(scene, mine); cards = {who: card(scene, lock, who, cam) for who in L.get("cards", [])}
    camera_focus(cam, mine, cards)
    scene.frame_start, scene.frame_end = mine[0]["f"], mine[-1]["f"]; scene.render.fps = L.get("fps", 30)
    return dict(camera=cam, cards=cards, set=objs, materials=report, frames=(mine[0]["f"], mine[-1]["f"]), keep_clear=keep_clear(mine, cards), lock=L)

def camera_focus(cam, frames, cards):
    """second pass once the cards exist: focus distance = depth of the subject's card (characters stay sharp, the far set softens)"""
    d = cam.data
    for c in frames:
        if c.get("subject") in cards:
            p = cards[c["subject"]]["pos_at"](c["f"])
            if p:
                v = Vector(c["aim"]) - Vector(c["pos"]); d.dof.focus_distance = max(.3, (Vector(p) - Vector(c["pos"])).dot(v.normalized())); d.dof.keyframe_insert("focus_distance", frame=c["f"])
