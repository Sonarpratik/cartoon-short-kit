"""LOCKED LOOK material library (CB-approved 2026-11-08). Procedural stylised-PBR, no downloads, no world ink.
    from blender_look import materials as M;  mat = M.get("painted_metal_chipped", color=(84, 100, 66))
Every material fades to the preset's haze colour with camera distance (set by look.apply_look).
Colours are sRGB 0-255. Names: see LIB. Parameters can be overridden per call and give a distinct material (cached by key)."""
import bpy, os

STATE = {"haze": (0.055, 0.09, 0.22), "haze_start": 12.0, "haze_depth": 130.0, "haze_max": 0.85, "tex": os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")}
_cache, _imgs = {}, {}

def lin(c):
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return tuple(f(x / 255) for x in c)

# rough, metal, coat, sheen = surface response. height = (kind, scale, strength). chips / wet = share thresholds (0 = off).
LIB = {
    "fabric_doped":   dict(color=(92, 112, 62), rough=.46, coat=.22, sheen=.45, height=("grain", 9, .28)),
    "canvas":         dict(color=(168, 176, 134), rough=.86, sheen=.35, height=("weave", 150, .3)),
    "tarp":           dict(color=(112, 122, 100), rough=.74, sheen=.4, height=("weave", 150, .3)),   # fine weave only: scale 38 read as a wireframe
    "burlap":         dict(color=(190, 166, 122), rough=.95, sheen=.5, height=("noise", 90, .5)),   # weave aliases to a checker at distance
    "cloth":          dict(color=(200, 60, 60), rough=.8, sheen=.6, height=("weave", 200, .25)),
    "wood_grain":     dict(color=(132, 108, 88), rough=.62, height=("grain", 34, .1)),
    "plywood":        dict(color=(170, 136, 96), rough=.55, coat=.15, height=("grain", 60, .08)),
    "bark":           dict(color=(100, 78, 64), rough=.88, height=("grain", 4, .8)),
    "plaster":        dict(color=(214, 200, 176), rough=.85, height=("noise", 14, .55), vary=.3),
    "brick":          dict(color=(150, 86, 66), rough=.82, height=("noise", 30, .4), vary=.4),
    "roof_tile":      dict(color=(140, 76, 58), rough=.7, height=("weave", 8, .5), vary=.35),
    "painted_metal_chipped": dict(color=(84, 100, 66), rough=.4, coat=.45, height=("noise", 240, .05), chips=.6),
    "metal":          dict(color=(110, 130, 140), rough=.34, metal=1, height=("noise", 90, .15)),
    "brass":          dict(color=(220, 170, 80), rough=.24, metal=1, height=("noise", 90, .1)),
    "rubber":         dict(color=(44, 42, 48), rough=.82, height=("noise", 180, .4)),
    "turf":           dict(color=(90, 124, 72), rough=.62, sheen=.25, height=("noise", 26, 1.4), vary=.55, wet=.08),
    "wet_mud_puddle": dict(color=(104, 92, 84), rough=.55, height=("noise", 18, 1.8), vary=.5, wet=.4),
    "cobble":         dict(color=(128, 124, 124), rough=.6, height=("voronoi", 5.5, 1.6), vary=.25, voronoi_tint=True, wet=.05),
    "stone":          dict(color=(150, 156, 170), rough=.78, height=("noise", 40, .7)),
    "foliage":        dict(color=(70, 130, 96), rough=.55, sheen=.2, height=("noise", 9, .9), vary=.5),
    "blade":          dict(color=(70, 118, 92), rough=.46, sheen=.4, tip=True, cull=False),
    "matte":          dict(color=(150, 150, 150), rough=.7, height=("noise", 40, .1)),
}

def image(name):
    if name not in _imgs: _imgs[name] = bpy.data.images.load(os.path.join(STATE["tex"], name), check_existing=True)
    return _imgs[name]

def _new(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; m.node_tree.nodes.clear(); return m, m.node_tree

def _scale(nt, col, fac):
    v = nt.nodes.new("ShaderNodeVectorMath"); v.operation = "SCALE"; nt.links.new(col, v.inputs[0])
    if isinstance(fac, (int, float)): v.inputs[3].default_value = fac
    else: nt.links.new(fac, v.inputs[3])
    return v.outputs[0]

def _range(nt, src, a, b, c, d):
    r = nt.nodes.new("ShaderNodeMapRange"); r.inputs[1].default_value = a; r.inputs[2].default_value = b; r.inputs[3].default_value = c; r.inputs[4].default_value = d
    nt.links.new(src, r.inputs[0]); return r.outputs[0]

def _noise(nt, tc, scale, detail=6, rough=.5):
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = detail; n.inputs["Roughness"].default_value = rough; nt.links.new(tc, n.inputs[0]); return n.outputs[0]

def _height(nt, tc, kind, sc):
    L = nt.links.new
    if kind == "voronoi":
        v = nt.nodes.new("ShaderNodeTexVoronoi"); v.feature = "DISTANCE_TO_EDGE"; v.inputs["Scale"].default_value = sc; L(tc, v.inputs[0]); return _range(nt, v.outputs[0], 0, .12, 0, 1)
    if kind == "grain":
        w = nt.nodes.new("ShaderNodeTexWave"); w.bands_direction = "Y"; w.inputs["Scale"].default_value = sc; w.inputs["Distortion"].default_value = 3; w.inputs["Detail"].default_value = 4; L(tc, w.inputs[0]); return w.outputs[1]
    if kind == "weave":
        ws = []
        for ax in "XY":
            w = nt.nodes.new("ShaderNodeTexWave"); w.bands_direction = ax; w.inputs["Scale"].default_value = sc; w.inputs["Distortion"].default_value = .6; L(tc, w.inputs[0]); ws.append(w.outputs[1])
        a = nt.nodes.new("ShaderNodeMath"); a.operation = "ADD"; L(ws[0], a.inputs[0]); L(ws[1], a.inputs[1]); return a.outputs[0]
    return _noise(nt, tc, sc)

def _finish(m, nt, shader):
    """aerial perspective: mix toward the preset's horizon colour with camera distance."""
    L = nt.links.new; out = nt.nodes.new("ShaderNodeOutputMaterial")
    cd = nt.nodes.new("ShaderNodeCameraData"); f = _range(nt, cd.outputs["View Distance"], STATE["haze_start"], STATE["haze_start"] + STATE["haze_depth"], 0, STATE["haze_max"])
    he = nt.nodes.new("ShaderNodeEmission"); he.inputs[0].default_value = (*STATE["haze"], 1); ms = nt.nodes.new("ShaderNodeMixShader")
    L(f, ms.inputs[0]); L(shader, ms.inputs[1]); L(he.outputs[0], ms.inputs[2]); L(ms.outputs[0], out.inputs[0]); return m

def get(name, image_name=None, image_scale=1.0, flat=False, gain=1.0, **over):
    key = (name, image_name, image_scale, gain, tuple(sorted(over.items())))
    if key in _cache: return _cache[key]
    p = dict(LIB[name]); p.update(over)
    if STATE.get("dew") and name in ("turf", "blade"): p["rough"] = p.get("rough", .6) * .5; p["coat"] = .6   # morning dew
    m, nt = _new("%s_%d" % (name, len(_cache))); L = nt.links.new
    b = nt.nodes.new("ShaderNodeBsdfPrincipled"); tc = nt.nodes.new("ShaderNodeTexCoord").outputs["Object"]
    rgb = nt.nodes.new("ShaderNodeRGB"); rgb.outputs[0].default_value = (*lin(p["color"]), 1); col = rgb.outputs[0]; img = None
    if image_name:
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (image_scale,) * 3; L(tc, mp.inputs[0]); it = nt.nodes.new("ShaderNodeTexImage"); it.image = image(image_name); it.interpolation = "Cubic"
        if not flat: it.projection = "BOX"; it.projection_blend = .25
        L(mp.outputs[0], it.inputs[0]); img = it.outputs[0]
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs[0].default_value = 1; L(col, mx.inputs[6]); L(img, mx.inputs[7]); col = _scale(nt, mx.outputs[2], 2.2 * gain)
    v = p.get("vary", .3); col = _scale(nt, col, _range(nt, _noise(nt, tc, 2.4, 5), .25, .75, 1 - v, 1 + v))   # painted tonal variation
    if p.get("voronoi_tint"):
        vc = nt.nodes.new("ShaderNodeTexVoronoi"); vc.inputs["Scale"].default_value = p["height"][1]; L(tc, vc.inputs[0]); sp = nt.nodes.new("ShaderNodeSeparateColor"); L(vc.outputs["Color"], sp.inputs[0]); col = _scale(nt, col, _range(nt, sp.outputs[0], 0, 1, .72, 1.25))
    if p.get("tip"):
        g = nt.nodes.new("ShaderNodeTexCoord"); s = nt.nodes.new("ShaderNodeSeparateXYZ"); L(g.outputs["Generated"], s.inputs[0]); col = _scale(nt, col, _range(nt, s.outputs[2], 0, 1, .45, 1.5))
    I = b.inputs; I["Roughness"].default_value = p.get("rough", .6); I["Metallic"].default_value = p.get("metal", 0); I["Coat Weight"].default_value = p.get("coat", 0); I["Coat Roughness"].default_value = .12; I["Sheen Weight"].default_value = p.get("sheen", 0)
    chip = None
    if p.get("chips"):
        # chips gather on convex edges: AO "inside" reads how exposed the edge is (EEVEE has no pointiness); noise breaks them up
        ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.inside = True; ao.samples = 8; ao.inputs["Distance"].default_value = .04
        edge = _range(nt, ao.outputs["AO"], .55, 1, .16, 0)
        add = nt.nodes.new("ShaderNodeMath"); add.operation = "ADD"; L(_noise(nt, tc, 18, 9, .65), add.inputs[0]); L(edge, add.inputs[1])
        chip = _range(nt, add.outputs[0], p["chips"], p["chips"] + .025, 0, 1)
        st = nt.nodes.new("ShaderNodeRGB"); st.outputs[0].default_value = (.42, .40, .38, 1)
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; L(chip, mx.inputs[0]); L(col, mx.inputs[6]); L(st.outputs[0], mx.inputs[7]); col = mx.outputs[2]
        L(_range(nt, chip, 0, 1, p.get("metal", 0), 1), I["Metallic"])
    wet = None
    if p.get("wet"):
        # puddles: darker, mirror-smooth, flat normal. Needs look.apply_look raytracing to reflect lamps, sky and moon.
        e = .5 + (.5 - p["wet"]) * .35; wet = _range(nt, _noise(nt, tc, .42, 3), e, e + .018, 0, 1)
        L(_range(nt, wet, 0, 1, p.get("rough", .6), .035), I["Roughness"]); col = _scale(nt, col, _range(nt, wet, 0, 1, 1, .22))
    L(col, I["Base Color"])
    if p.get("height"):
        kind, hs, bs = p["height"]; bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Distance"].default_value = .03; bp.inputs["Strength"].default_value = bs
        h = _height(nt, tc, kind, hs)
        if img is not None:
            a = nt.nodes.new("ShaderNodeMath"); a.operation = "ADD"; L(h, a.inputs[0]); L(img, a.inputs[1]); h = a.outputs[0]
        if chip is not None:
            a = nt.nodes.new("ShaderNodeMath"); a.operation = "MULTIPLY_ADD"; L(chip, a.inputs[0]); a.inputs[1].default_value = -.6; L(h, a.inputs[2]); h = a.outputs[0]
        L(h, bp.inputs["Height"])
        if wet is not None: L(_range(nt, wet, 0, 1, bs, 0), bp.inputs["Strength"])
        L(bp.outputs[0], I["Normal"])
    if p.get("cull") is False: m.use_backface_culling = False
    _cache[key] = _finish(m, nt, b.outputs[0]); return _cache[key]

def glass():
    if "glass" not in _cache:
        m, nt = _new("glass"); o = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled"); b.inputs["Base Color"].default_value = (.9, .95, 1, 1); b.inputs["Roughness"].default_value = .04; b.inputs["Alpha"].default_value = .22
        nt.links.new(b.outputs[0], o.inputs[0]); m.surface_render_method = "BLENDED"; _cache["glass"] = m
    return _cache["glass"]

def emissive_lamp(color=(255, 170, 84), strength=2.6):
    """clamped core: strength stays below where the view transform turns the hue white, so a lamp reads warm; bloom comes from grade.py."""
    key = ("lamp", color, strength)
    if key not in _cache:
        m, nt = _new("lamp_%d" % len(_cache)); o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (*lin(color), 1); e.inputs[1].default_value = strength; nt.links.new(e.outputs[0], o.inputs[0]); _cache[key] = m
    return _cache[key]

def fire(): return emissive_lamp((255, 130, 40), 5.0)

def cloud_soft(lit=(.34, .42, .66), shade=(.05, .075, .2)):
    """stylised on purpose: soft cel clouds with a darker underside (never PBR)."""
    key = ("cloud", lit, shade)
    if key not in _cache:
        m, nt = _new("cloud_%d" % len(_cache)); L = nt.links.new; o = nt.nodes.new("ShaderNodeOutputMaterial"); d = nt.nodes.new("ShaderNodeBsdfDiffuse"); s = nt.nodes.new("ShaderNodeShaderToRGB"); L(d.outputs[0], s.inputs[0])
        bw = nt.nodes.new("ShaderNodeRGBToBW"); L(s.outputs[0], bw.inputs[0]); r = nt.nodes.new("ShaderNodeValToRGB"); c = r.color_ramp; c.interpolation = "EASE"; c.elements[0].position = .03; c.elements[0].color = (*shade, 1); c.elements[1].position = .3; c.elements[1].color = (*lit, 1); L(bw.outputs[0], r.inputs[0])
        e = nt.nodes.new("ShaderNodeEmission"); L(r.outputs[0], e.inputs[0]); L(e.outputs[0], o.inputs[0]); _cache[key] = m
    return _cache[key]

def upgrade_principled(m, lib, bright=1.0):
    """give an existing Principled material (imported models) a library recipe's surface response and bump, keeping its colour."""
    p = LIB[lib]; nt = m.node_tree; b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"); I = b.inputs
    I["Roughness"].default_value = p.get("rough", .6); I["Metallic"].default_value = p.get("metal", 0); I["Coat Weight"].default_value = p.get("coat", 0); I["Coat Roughness"].default_value = .15; I["Sheen Weight"].default_value = p.get("sheen", 0)
    I["Base Color"].default_value = tuple(min(1, c * bright) for c in I["Base Color"].default_value[:3]) + (1,)
    if p.get("height"):
        kind, hs, bs = p["height"]; tc = nt.nodes.new("ShaderNodeTexCoord").outputs["Object"]; bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Distance"].default_value = .02; bp.inputs["Strength"].default_value = bs; nt.links.new(_height(nt, tc, kind, hs), bp.inputs["Height"]); nt.links.new(bp.outputs[0], I["Normal"])

# recipes added by the three-scene test (2026-11-09)
LIB.update({
    "water":  dict(color=(46, 86, 104), rough=.06, coat=1, height=("noise", 3.5, .35), vary=.15),
    "straw":  dict(color=(200, 178, 120), rough=.82, sheen=.3, height=("grain", 60, .9), vary=.35),
    "wool":   dict(color=(232, 226, 210), rough=.95, sheen=1, height=("noise", 60, .9), vary=.12),
    "rope":   dict(color=(176, 148, 100), rough=.9, height=("weave", 120, .6), vary=.2),
    "tar_wood": dict(color=(70, 56, 50), rough=.5, coat=.2, height=("grain", 24, .25), vary=.3),
    "boat_paint": dict(color=(190, 60, 50), rough=.32, coat=.7, height=("noise", 240, .05), chips=.67),
    "dirt":   dict(color=(132, 106, 78), rough=.86, height=("noise", 20, 1.2), vary=.5),
})
