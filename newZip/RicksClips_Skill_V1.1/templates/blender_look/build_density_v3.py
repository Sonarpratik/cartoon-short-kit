"""NIGHT WITCHES - DENSITY TEST builder (CB 2026-11-07: "maximum density, no empty space, maximum details").
Builds ONE location per run and renders ONE full-size still (1440x2560, EEVEE), timed.

  blender -b --factory-startup --python build_density.py -- --loc airfield|camp [--samples 32] [--res 100]

Look: toon ramp (3 tones) x light hue (lanterns read warm, moon reads cool), inverted-hull ink on every prop,
painted textures on every surface, distance haze inside the material (sky untouched), cards for characters.
DENSITY LAW B: >= 12 prop types, >= 40 instances in clusters of 3, 3 place/time details + humour details,
>= 2 practical lights + a hero rim, sky filled (moon, clouds, cirrus, stars), near-lens foreground for depth.
"""
import bpy, bmesh, math, random, sys, os, time, json
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, "tex"); CARDS = os.path.join(HERE, "cards"); OUT = os.path.join(HERE, "out")
sys.path.insert(0, HERE)
import aircraft

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(k, d):
    return argv[argv.index(k) + 1] if k in argv else d
LOC = arg("--loc", "airfield"); SAMPLES = int(arg("--samples", "32")); RES = int(arg("--res", "100"))
R = random.Random(7)

# ---------------------------------------------------------------- scene reset
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
SC = bpy.context.scene
SC.render.engine = "BLENDER_EEVEE"
SC.render.resolution_x, SC.render.resolution_y, SC.render.resolution_percentage = 1440, 2560, RES
SC.view_settings.view_transform = "Khronos PBR Neutral"
SC.view_settings.look = "None"
SC.eevee.taa_render_samples = SAMPLES
try: SC.eevee.use_shadows = True; SC.eevee.shadow_pool_size = "1024"
except Exception: pass
SC.render.film_transparent = False
for k, v in (("use_raytracing", True), ("ray_tracing_method", "SCREEN"), ("fast_gi_method", "GLOBAL_ILLUMINATION")):
    try: setattr(SC.eevee, k, v)
    except Exception as e: print("eevee setting", k, e)
try:
    SC.eevee.ray_tracing_options.resolution_scale = "2"; SC.eevee.ray_tracing_options.trace_max_roughness = 0.45
except Exception as e: print("ray options", e)
if "--v1" not in sys.argv:
    try:
        SC.eevee.volumetric_end = 140.0; SC.eevee.volumetric_tile_size = "8"; SC.eevee.volumetric_samples = 48
        SC.eevee.use_volumetric_shadows = True
        SC.render.filter_size = 2.2   # softer pixel filter: removes stair-step / pixel-level crispness the reference never has
    except Exception as e: print("volumetric settings:", e)

def lin(c):
    return tuple(((x / 255 if x > 1 else x) / 12.92) if (x / 255 if x > 1 else x) <= 0.04045 else (((x / 255 if x > 1 else x) + 0.055) / 1.055) ** 2.4 for x in c)

# ---------------------------------------------------------------- materials
SOFT = "--v1" not in sys.argv
# v2: haze = the sky's horizon colour, starts nearer and goes deeper (depth fog toward the horizon)
HAZE = (0.055, 0.09, 0.22)
HAZE_START, HAZE_DEPTH, HAZE_MAX = 12.0, 130.0, 0.85
_imgs = {}
def image(name):
    if name not in _imgs:
        _imgs[name] = bpy.data.images.load(os.path.join(TEX, name), check_existing=True)
    return _imgs[name]

def _mix(nt, a_out, b_out, blend="MULTIPLY", fac=1.0):
    m = nt.nodes.new("ShaderNodeMix"); m.data_type = "RGBA"; m.blend_type = blend; m.inputs[0].default_value = fac
    nt.links.new(a_out, m.inputs[6]); nt.links.new(b_out, m.inputs[7]); return m

def toon(name, lit, shade=None, rim=None, img=None, scale=1.0, flat=False, gain=1.0, haze=True, emit=0.0):
    """3-tone constant ramp x light hue (+ optional painted texture, rim, distance haze)."""
    if name in bpy.data.materials: return bpy.data.materials[name]
    if name not in TOON_KEEP: return pbr(name, lit, img, scale, flat, gain)
    lit = lin(lit); shade = lin(shade) if shade else tuple(x * 0.32 for x in lit)
    mid = tuple((a * 0.55 + b * 0.45) for a, b in zip(lit, shade))
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); s2r = nt.nodes.new("ShaderNodeShaderToRGB"); L(dif.outputs[0], s2r.inputs[0])
    bw = nt.nodes.new("ShaderNodeRGBToBW"); L(s2r.outputs[0], bw.inputs[0])
    rp = nt.nodes.new("ShaderNodeValToRGB"); cr = rp.color_ramp; cr.interpolation = "EASE" if SOFT else "CONSTANT"
    cr.elements[0].position = 0.0; cr.elements[0].color = (*shade, 1); cr.elements[1].position = 0.05; cr.elements[1].color = (*mid, 1)
    e3 = cr.elements.new(0.22); e3.color = (*lit, 1); L(bw.outputs[0], rp.inputs[0])
    if SOFT:  # v2: hold each tone, ease only across a narrow band -> soft terminator, still reads as 3 tones
        cr.elements[1].position = 0.06; ea = cr.elements.new(0.035); ea.color = (*shade, 1); eb = cr.elements.new(0.17); eb.color = (*mid, 1); e3.position = 0.24
    # light hue = (rgb + k) / (bw + k), clamped -> lanterns tint warm, moon cool
    add = nt.nodes.new("ShaderNodeVectorMath"); add.operation = "ADD"; add.inputs[1].default_value = (0.04, 0.04, 0.04); L(s2r.outputs[0], add.inputs[0])
    bk = nt.nodes.new("ShaderNodeMath"); bk.operation = "ADD"; bk.inputs[1].default_value = 0.04; L(bw.outputs[0], bk.inputs[0])
    cx = nt.nodes.new("ShaderNodeCombineXYZ"); [L(bk.outputs[0], cx.inputs[i]) for i in range(3)]
    dv = nt.nodes.new("ShaderNodeVectorMath"); dv.operation = "DIVIDE"; L(add.outputs[0], dv.inputs[0]); L(cx.outputs[0], dv.inputs[1])
    mn = nt.nodes.new("ShaderNodeVectorMath"); mn.operation = "MINIMUM"; mn.inputs[1].default_value = (1.7, 1.7, 1.7); L(dv.outputs[0], mn.inputs[0])
    col = _mix(nt, rp.outputs[0], mn.outputs[0]).outputs[2]
    if SOFT:
        # warm practicals: add the raw light colour so pools fall off smoothly with distance (not a hard tone step)
        wk = nt.nodes.new("ShaderNodeVectorMath"); wk.operation = "SCALE"; wk.inputs[3].default_value = 0.22; L(s2r.outputs[0], wk.inputs[0])
        wl = nt.nodes.new("ShaderNodeVectorMath"); wl.operation = "MULTIPLY"; wl.inputs[1].default_value = lit; L(wk.outputs[0], wl.inputs[0])
        ad2 = nt.nodes.new("ShaderNodeVectorMath"); ad2.operation = "ADD"; L(col, ad2.inputs[0]); L(wl.outputs[0], ad2.inputs[1]); col = ad2.outputs[0]
        # contact shadow: ambient occlusion darkens creases and where props meet the ground
        ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value = 0.5; ao.samples = 8
        am = nt.nodes.new("ShaderNodeMapRange"); am.inputs[3].default_value = 0.5; am.inputs[4].default_value = 1.0; L(ao.outputs["AO"], am.inputs[0])
        sc = nt.nodes.new("ShaderNodeVectorMath"); sc.operation = "SCALE"; L(col, sc.inputs[0]); L(am.outputs[0], sc.inputs[3]); col = sc.outputs[0]
        # painted variation: soft object-space noise (+-12 %), no new hard edges
        tcn = nt.nodes.new("ShaderNodeTexCoord"); nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 2.2; nz.inputs["Detail"].default_value = 3
        L(tcn.outputs["Object"], nz.inputs[0]); nm = nt.nodes.new("ShaderNodeMapRange"); nm.inputs[3].default_value = 0.86; nm.inputs[4].default_value = 1.12; L(nz.outputs[0], nm.inputs[0])
        sc2 = nt.nodes.new("ShaderNodeVectorMath"); sc2.operation = "SCALE"; L(col, sc2.inputs[0]); L(nm.outputs[0], sc2.inputs[3]); col = sc2.outputs[0]
    if img:
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale, scale, scale)
        L(tc.outputs["Object"], mp.inputs[0]); it = nt.nodes.new("ShaderNodeTexImage"); it.image = image(img); it.interpolation = "Cubic"
        if not flat: it.projection = "BOX"; it.projection_blend = 0.25
        L(mp.outputs[0], it.inputs[0])
        g = nt.nodes.new("ShaderNodeMath"); g.operation = "MULTIPLY"; g.inputs[1].default_value = 1.9 * gain
        im = _mix(nt, col, it.outputs[0]); col2 = nt.nodes.new("ShaderNodeVectorMath"); col2.operation = "SCALE"
        L(im.outputs[2], col2.inputs[0]); col2.inputs[3].default_value = 1.9 * gain; col = col2.outputs[0]
    if rim:
        lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs[0].default_value = 0.5
        gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.86; L(lw.outputs["Facing"], gt.inputs[0])
        rc = nt.nodes.new("ShaderNodeRGB"); rc.outputs[0].default_value = (*lin(rim), 1)
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; L(gt.outputs[0], mx.inputs[0]); L(col, mx.inputs[6]); L(rc.outputs[0], mx.inputs[7]); col = mx.outputs[2]
    if haze:
        cd = nt.nodes.new("ShaderNodeCameraData"); mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs[1].default_value = HAZE_START; mr.inputs[2].default_value = HAZE_START + HAZE_DEPTH; mr.inputs[3].default_value = 0; mr.inputs[4].default_value = HAZE_MAX
        L(cd.outputs["View Distance"], mr.inputs[0]); hc = nt.nodes.new("ShaderNodeRGB"); hc.outputs[0].default_value = (*HAZE, 1)
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; L(mr.outputs[0], mx.inputs[0]); L(col, mx.inputs[6]); L(hc.outputs[0], mx.inputs[7]); col = mx.outputs[2]
    L(col, em.inputs[0]); em.inputs[1].default_value = 1.0
    if emit:
        pass
    L(em.outputs[0], out.inputs[0]); return m

def glow(name, rgb, k):
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; e = nt.nodes["Principled BSDF"]; nt.nodes.remove(e)
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value = (*lin(rgb), 1); em.inputs[1].default_value = k
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0]); return m

def beam_mat(name, rgb, k):
    """additive light shaft: emission x (1 - facing^2) x fade along the cone (Generated z)."""
    if name in bpy.data.materials: return bpy.data.materials[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value = (*lin(rgb), 1)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); ad = nt.nodes.new("ShaderNodeAddShader")
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs[0].default_value = 0.35
    p = nt.nodes.new("ShaderNodeMath"); p.operation = "POWER"; p.inputs[1].default_value = 2.0; L(lw.outputs["Facing"], p.inputs[0])
    inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0; L(p.outputs[0], inv.inputs[1])
    tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["Generated"], sx.inputs[0])
    fd = nt.nodes.new("ShaderNodeMath"); fd.operation = "MULTIPLY"; L(inv.outputs[0], fd.inputs[0]); L(sx.outputs[2], fd.inputs[1])
    kk = nt.nodes.new("ShaderNodeMath"); kk.operation = "MULTIPLY"; kk.inputs[1].default_value = k; L(fd.outputs[0], kk.inputs[0])
    L(kk.outputs[0], em.inputs[1]); L(em.outputs[0], ad.inputs[0]); L(tr.outputs[0], ad.inputs[1]); L(ad.outputs[0], out.inputs[0])
    try: m.surface_render_method = "BLENDED"
    except Exception: pass
    return m

# ---------------------------------------------------------------- v3: procedural stylised-PBR world (no downloaded textures)
TOON_KEEP = {"CloudToon", "FlakPuff", "Smoke"}   # stylised on purpose: soft cel-like clouds and smoke
BEVEL = {"crate", "crateL", "truck", "truckG", "gun", "bombcart", "jerry", "table", "bench", "dugout", "chalkboard", "searchlight"}
# rough, metal, coat, sheen, height kind, height scale, bump strength, chips, wet share
PBR = {
    "Crate": (.68, 0, 0, 0, "img", 1, .55, 0, 0), "Wood": (.62, 0, 0, 0, "grain", 34, .1, 0, 0), "Trunk": (.85, 0, 0, 0, "grain", 4, .8, 0, 0),
    "Drum": (.42, .35, .2, 0, "paint", 240, .06, .6, 0), "DrumRed": (.36, .25, .4, 0, "paint", 240, .06, .6, 0),
    "GunMetal": (.34, 1, 0, 0, "paint", 90, .18, 0, 0), "Olive": (.4, 0, .45, 0, "paint", 240, .05, .605, 0), "FieldGrey": (.42, 0, .35, 0, "paint", 240, .05, .605, 0),
    "Bomb": (.32, .2, .55, 0, "paint", 240, .05, .605, 0), "Brass": (.24, 1, 0, 0, "paint", 90, .12, 0, 0),
    "Sandbag": (.95, 0, 0, .5, "weave", 150, .75, 0, 0), "Canvas": (.86, 0, 0, .35, "weave", 110, .4, 0, 0), "CanvasGrey": (.86, 0, 0, .35, "weave", 110, .4, 0, 0),
    "Tarp": (.74, 0, 0, .4, "weave", 150, .3, 0, 0), "RedCloth": (.8, 0, 0, .6, "weave", 200, .25, 0, 0), "BlueCloth": (.8, 0, 0, .6, "weave", 200, .25, 0, 0),
    "Tyre": (.82, 0, 0, 0, "paint", 180, .4, 0, 0), "Leaf": (.55, 0, 0, .2, "paint", 9, .9, 0, 0), "Leaf2": (.55, 0, 0, .2, "paint", 9, .9, 0, 0), "Pine": (.6, 0, 0, .2, "paint", 12, .9, 0, 0),
    "Stone": (.78, 0, 0, 0, "paint", 40, .7, 0, 0), "Stone2": (.8, 0, 0, 0, "paint", 40, .7, 0, 0), "Stone3": (.7, 0, 0, 0, "paint", 40, .7, 0, 0),
    "Blade": (.46, 0, 0, .4, None, 0, 0, 0, 0), "Cat": (.75, 0, 0, 1, "paint", 120, .15, 0, 0), "Board": (.8, 0, 0, 0, "paint", 40, .1, 0, 0),
    "Ground_grass_tile2.png": (.62, 0, 0, .25, "img+paint", 26, 1.4, 0, .08), "Ground_mud_tile2.png": (.55, 0, 0, 0, "img+paint", 18, 1.8, 0, .4),
}

def _height(nt, kind, sc, img_out):
    """returns a socket with a surface height for the Bump node (object-space, procedural)."""
    L = nt.links.new; tc = nt.nodes.new("ShaderNodeTexCoord").outputs["Object"]
    def noise(scale, detail=6):
        n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = scale; n.inputs["Detail"].default_value = detail; L(tc, n.inputs[0]); return n.outputs[0]
    def wave(scale, axis):
        w = nt.nodes.new("ShaderNodeTexWave"); w.bands_direction = axis; w.inputs["Scale"].default_value = scale; w.inputs["Distortion"].default_value = 0.6; L(tc, w.inputs[0]); return w.outputs[1]
    def add(a, b, k=1.0):
        m = nt.nodes.new("ShaderNodeMath"); m.operation = "MULTIPLY_ADD"; L(a, m.inputs[0]); m.inputs[1].default_value = k; L(b, m.inputs[2]); return m.outputs[0]
    if kind == "weave": return add(wave(sc, "X"), wave(sc, "Y"), 1.0)
    if kind == "grain":
        w = nt.nodes.new("ShaderNodeTexWave"); w.bands_direction = "Y"; w.inputs["Scale"].default_value = sc; w.inputs["Distortion"].default_value = 3; w.inputs["Detail"].default_value = 4; L(tc, w.inputs[0]); return w.outputs[1]
    if kind == "img": return img_out
    if kind == "img+paint": return add(img_out, noise(sc), 1.0)
    return noise(sc)

def pbr(name, lit, img=None, scale=1.0, flat=False, gain=1.0):
    rough, metal, coat, sheen, hk, hs, bs, chips, wet = PBR.get(name, (.6, 0, 0, 0, "paint", 40, .15, 0, 0))
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    rgb = nt.nodes.new("ShaderNodeRGB"); rgb.outputs[0].default_value = (*lin(lit), 1); col = rgb.outputs[0]; img_out = None
    if img:
        tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale, scale, scale); L(tc.outputs["Object"], mp.inputs[0])
        it = nt.nodes.new("ShaderNodeTexImage"); it.image = image(img); it.interpolation = "Cubic"
        if not flat: it.projection = "BOX"; it.projection_blend = 0.25
        L(mp.outputs[0], it.inputs[0]); img_out = it.outputs[0]
        sc = nt.nodes.new("ShaderNodeVectorMath"); sc.operation = "SCALE"; sc.inputs[3].default_value = 2.2 * gain; L(_mix(nt, col, img_out).outputs[2], sc.inputs[0]); col = sc.outputs[0]
    # painted tonal variation: broad + fine
    tco = nt.nodes.new("ShaderNodeTexCoord").outputs["Object"]
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 2.4; nz.inputs["Detail"].default_value = 5; L(tco, nz.inputs[0])
    nm = nt.nodes.new("ShaderNodeMapRange"); nm.inputs[3].default_value = 0.68; nm.inputs[4].default_value = 1.3; L(nz.outputs[0], nm.inputs[0])
    v = nt.nodes.new("ShaderNodeVectorMath"); v.operation = "SCALE"; L(col, v.inputs[0]); L(nm.outputs[0], v.inputs[3]); col = v.outputs[0]
    if name == "Blade":   # lighter toward the tip
        g = nt.nodes.new("ShaderNodeTexCoord"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); L(g.outputs["Generated"], sp.inputs[0])
        r = nt.nodes.new("ShaderNodeMapRange"); r.inputs[3].default_value = 0.45; r.inputs[4].default_value = 1.5; L(sp.outputs[2], r.inputs[0])
        t = nt.nodes.new("ShaderNodeVectorMath"); t.operation = "SCALE"; L(col, t.inputs[0]); L(r.outputs[0], t.inputs[3]); col = t.outputs[0]
    b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal; b.inputs["Coat Weight"].default_value = coat; b.inputs["Coat Roughness"].default_value = 0.12; b.inputs["Sheen Weight"].default_value = sheen
    chip_mask = None
    if chips:   # chipped paint: bare steel shows where the noise breaks the coat, the coat edge is raised in the bump
        cn = nt.nodes.new("ShaderNodeTexNoise"); cn.inputs["Scale"].default_value = 18; cn.inputs["Detail"].default_value = 9; cn.inputs["Roughness"].default_value = 0.65; L(tco, cn.inputs[0])
        cm = nt.nodes.new("ShaderNodeMapRange"); cm.inputs[1].default_value = chips; cm.inputs[2].default_value = chips + 0.025; L(cn.outputs[0], cm.inputs[0]); chip_mask = cm.outputs[0]
        steel = nt.nodes.new("ShaderNodeRGB"); steel.outputs[0].default_value = (.42, .40, .38, 1)
        mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; L(chip_mask, mx.inputs[0]); L(col, mx.inputs[6]); L(steel.outputs[0], mx.inputs[7]); col = mx.outputs[2]
        mm = nt.nodes.new("ShaderNodeMapRange"); mm.inputs[3].default_value = metal; mm.inputs[4].default_value = 1.0; L(chip_mask, mm.inputs[0]); L(mm.outputs[0], b.inputs["Metallic"])
    wet_mask = None
    if wet:     # puddles / damp patches: darker, mirror-smooth, flat normal; lanterns and the moon reflect in them
        wn = nt.nodes.new("ShaderNodeTexNoise"); wn.inputs["Scale"].default_value = 0.42; wn.inputs["Detail"].default_value = 3; L(tco, wn.inputs[0])
        edge = 0.5 + (0.5 - wet) * 0.35
        wm = nt.nodes.new("ShaderNodeMapRange"); wm.inputs[1].default_value = edge; wm.inputs[2].default_value = edge + 0.018; L(wn.outputs[0], wm.inputs[0]); wet_mask = wm.outputs[0]
        rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs[3].default_value = rough; rr.inputs[4].default_value = 0.035; L(wet_mask, rr.inputs[0]); L(rr.outputs[0], b.inputs["Roughness"])
        dk = nt.nodes.new("ShaderNodeMapRange"); dk.inputs[3].default_value = 1.0; dk.inputs[4].default_value = 0.22; L(wet_mask, dk.inputs[0])
        d = nt.nodes.new("ShaderNodeVectorMath"); d.operation = "SCALE"; L(col, d.inputs[0]); L(dk.outputs[0], d.inputs[3]); col = d.outputs[0]
    L(col, b.inputs["Base Color"])
    if hk:
        bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Distance"].default_value = 0.03; bp.inputs["Strength"].default_value = bs
        h = _height(nt, hk, hs, img_out); L(h, bp.inputs["Height"])
        if chip_mask:
            ad = nt.nodes.new("ShaderNodeMath"); ad.operation = "MULTIPLY_ADD"; L(chip_mask, ad.inputs[0]); ad.inputs[1].default_value = -0.6; L(h, ad.inputs[2]); L(ad.outputs[0], bp.inputs["Height"])
        if wet_mask:
            st = nt.nodes.new("ShaderNodeMapRange"); st.inputs[3].default_value = bs; st.inputs[4].default_value = 0.0; L(wet_mask, st.inputs[0]); L(st.outputs[0], bp.inputs["Strength"])
        L(bp.outputs[0], b.inputs["Normal"])
    shader = b.outputs[0]
    # aerial perspective toward the night horizon colour
    cd = nt.nodes.new("ShaderNodeCameraData"); mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs[1].default_value = HAZE_START; mr.inputs[2].default_value = HAZE_START + HAZE_DEPTH; mr.inputs[3].default_value = 0; mr.inputs[4].default_value = HAZE_MAX
    L(cd.outputs["View Distance"], mr.inputs[0]); he = nt.nodes.new("ShaderNodeEmission"); he.inputs[0].default_value = (*HAZE, 1); ms = nt.nodes.new("ShaderNodeMixShader")
    L(mr.outputs[0], ms.inputs[0]); L(shader, ms.inputs[1]); L(he.outputs[0], ms.inputs[2]); L(ms.outputs[0], out.inputs[0])
    if name == "Blade": m.use_backface_culling = False
    return m

def glass_mat():
    m = bpy.data.materials.new("LampGlass"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputMaterial"); b = nt.nodes.new("ShaderNodeBsdfPrincipled"); b.inputs["Base Color"].default_value = (.9, .95, 1, 1); b.inputs["Roughness"].default_value = .04; b.inputs["Alpha"].default_value = .22
    nt.links.new(b.outputs[0], o.inputs[0]); m.surface_render_method = "BLENDED"; return m

def sag_pyr(mb, r, h, mat, n=9, sag=0.16):
    """tent canvas that really hangs: each side a grid that sags between the seams."""
    t = bmesh.new(); k = r / math.sqrt(2); apex = Vector((0, 0, h)); cs = [Vector(p) for p in ((k, -k, 0), (k, k, 0), (-k, k, 0), (-k, -k, 0))]
    for i in range(4):
        c0, c1 = cs[i], cs[(i + 1) % 4]; nrm = (c1 - c0).cross(apex - c0).normalized(); grid = []
        for a in range(n + 1):
            row = []
            for b_ in range(n + 1):
                u, v = a / n, b_ / n; p = c0.lerp(c1, u).lerp(apex, v * 0.985) - nrm * sag * math.sin(math.pi * u) * math.sin(math.pi * v)
                row.append(t.verts.new(p))
            grid.append(row)
        for a in range(n):
            for b_ in range(n): t.faces.new((grid[a][b_], grid[a + 1][b_], grid[a + 1][b_ + 1], grid[a][b_ + 1]))
    mb._take(t, mat, Matrix.Identity(4))

def upgrade_aircraft():
    """Po-2s: doped fabric with sheen, plywood grain on the olive skin, painted steel, real metal, glass."""
    for m in bpy.data.materials:
        if not m.name.startswith("NW_") or not m.use_nodes: continue
        nt = m.node_tree; L = nt.links.new; b = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if b is None: continue
        key = m.name[3:]; I = b.inputs
        bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Distance"].default_value = 0.02
        if key in ("po2_olive", "po2_under"):
            I["Roughness"].default_value = .46; I["Sheen Weight"].default_value = .45; I["Coat Weight"].default_value = .22; I["Coat Roughness"].default_value = .25; I["Specular IOR Level"].default_value = .5
            I["Base Color"].default_value = tuple(min(1, c * 1.5) for c in I["Base Color"].default_value[:3]) + (1,)
            bp.inputs["Strength"].default_value = .28; L(_height(nt, "grain", 9, None), bp.inputs["Height"])
        elif key.startswith("metal") or key == "exhaust":
            I["Metallic"].default_value = 1.0; I["Roughness"].default_value = .36; I["Specular IOR Level"].default_value = .5
            bp.inputs["Strength"].default_value = .15; L(_height(nt, "paint", 90, None), bp.inputs["Height"])
        elif key == "wood":
            I["Roughness"].default_value = .32; I["Coat Weight"].default_value = .6; bp.inputs["Strength"].default_value = .3; L(_height(nt, "grain", 20, None), bp.inputs["Height"])
        elif key == "bomb":
            I["Roughness"].default_value = .34; I["Coat Weight"].default_value = .5; bp.inputs["Strength"].default_value = .12; L(_height(nt, "paint", 70, None), bp.inputs["Height"])
        elif key == "glass":
            I["Roughness"].default_value = .03; I["Specular IOR Level"].default_value = .8; nt.nodes.remove(bp); continue
        elif key == "star_red":
            I["Base Color"].default_value = (*lin((225, 22, 26)), 1); I["Roughness"].default_value = .42; nt.nodes.remove(bp); continue
        else:
            nt.nodes.remove(bp); continue
        L(bp.outputs[0], I["Normal"])


INK = None
def ink_mat():
    global INK
    if INK: return INK
    m = bpy.data.materials.new("HullInk"); m.use_nodes = True; nt = m.node_tree; nt.nodes.remove(nt.nodes["Principled BSDF"])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value = (0.0035, 0.003, 0.004, 1); em.inputs[1].default_value = 1
    nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0]); m.use_backface_culling = True
    INK = m; return m

def hull_ink(o, t=None):
    return  # 3D WORLD STYLE: no ink on the world; the only ink is on the character cards
    if o.type != "MESH": return
    if t is None:
        t = max(o.dimensions) * 0.012
    t = min(max(t, 0.004 if SOFT else 0.012), 1.2)
    if ink_mat().name not in [s.name for s in o.data.materials if s]: o.data.materials.append(ink_mat())
    s = o.modifiers.new("Ink", "SOLIDIFY"); s.thickness = t; s.offset = 1.0; s.use_flip_normals = True
    s.use_rim = False; s.material_offset = 50

# ---------------------------------------------------------------- mesh building
class MB:
    """accumulate primitives (each with its own material slot) into one mesh."""
    def __init__(self, name, mats):
        self.name = name; self.mats = mats; self.bm = bmesh.new()
    def _take(self, tmp, mat, M):
        bmesh.ops.transform(tmp, matrix=M, verts=tmp.verts)
        for f in tmp.faces: f.material_index = mat
        me = bpy.data.meshes.new("_t"); tmp.to_mesh(me); tmp.free(); self.bm.from_mesh(me); bpy.data.meshes.remove(me)
    def box(self, c, s, mat=0, rz=0.0, rx=0.0, ry=0.0):
        t = bmesh.new(); bmesh.ops.create_cube(t, size=1.0)
        self._take(t, mat, Matrix.Translation(c) @ Euler((rx, ry, rz)).to_matrix().to_4x4() @ Matrix.Diagonal((*s, 1))); return self
    def cyl(self, c, r, h, mat=0, seg=12, r2=None, rot=(0, 0, 0), caps=True):
        t = bmesh.new(); bmesh.ops.create_cone(t, cap_ends=caps, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
        self._take(t, mat, Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4()); return self
    def sph(self, c, s, mat=0, seg=10, ring=6, rot=(0, 0, 0)):
        t = bmesh.new(); bmesh.ops.create_uvsphere(t, u_segments=seg, v_segments=ring, radius=1.0)
        self._take(t, mat, Matrix.Translation(c) @ Euler(rot).to_matrix().to_4x4() @ Matrix.Diagonal((*s, 1))); return self
    def ico(self, c, r, mat=0, sub=1, sq=(1, 1, 1)):
        t = bmesh.new(); bmesh.ops.create_icosphere(t, subdivisions=sub, radius=1.0)
        self._take(t, mat, Matrix.Translation(c) @ Matrix.Diagonal((r * sq[0], r * sq[1], r * sq[2], 1))); return self
    def rod(self, p0, p1, r, mat=0, seg=6):
        p0, p1 = Vector(p0), Vector(p1); d = p1 - p0; q = Vector((0, 0, 1)).rotation_difference(d.normalized())
        t = bmesh.new(); bmesh.ops.create_cone(t, cap_ends=True, segments=seg, radius1=r, radius2=r, depth=d.length)
        self._take(t, mat, Matrix.Translation((p0 + p1) / 2) @ q.to_matrix().to_4x4()); return self
    def mesh(self):
        me = bpy.data.meshes.new(self.name); self.bm.to_mesh(me); self.bm.free()
        for m in self.mats: me.materials.append(m)
        for p in me.polygons: p.use_smooth = True
        me.set_sharp_from_angle(angle=math.radians(50))
        return me

COLL = bpy.data.collections.new("SET"); SC.collection.children.link(COLL)
COUNT = {}
def place(me, loc, rz=0.0, s=1.0, ink=True, t=None, kind=None, rx=0.0, ry=0.0):
    o = bpy.data.objects.new(me.name, me); COLL.objects.link(o)
    o.location = loc; o.rotation_euler = (rx, ry, rz); o.scale = (s, s, s) if not isinstance(s, tuple) else s
    if SOFT and me.name.startswith(("tuft", "pebbles")): ink = me.name.startswith("pebbles"); t = 0.004
    if SOFT and SC.camera is not None and (Vector(loc) - SC.camera.location).length > 45: ink = False   # far objects lose their outline (atmospheric perspective; hazed ink measured as surface noise)
    if ink: hull_ink(o, t if t is not None else max(me_dims(me)) * (s if not isinstance(s, tuple) else max(s)) * 0.012)
    if me.name in BEVEL and (Vector(loc) - SC.camera.location).length < 25:
        b = o.modifiers.new("Bevel", "BEVEL"); b.width = 0.01; b.segments = 1; b.limit_method = "ANGLE"; b.angle_limit = math.radians(40)
    k = kind or me.name; COUNT[k] = COUNT.get(k, 0) + 1
    return o
_dims = {}
def me_dims(me):
    if me.name not in _dims:
        xs = [v.co for v in me.vertices]
        _dims[me.name] = [max(v[i] for v in xs) - min(v[i] for v in xs) for i in range(3)]
    return _dims[me.name]

def point(loc, rgb, energy, radius=0.15):
    ld = bpy.data.lights.new("L", "POINT"); ld.energy = energy * 0.5; ld.color = rgb; ld.shadow_soft_size = radius
    o = bpy.data.objects.new("L", ld); COLL.objects.link(o); o.location = loc; return o

def cluster3(fn, c, spread=1.2, **kw):
    """DENSITY LAW: props come in clusters of three (one big, two small, slightly rotated)."""
    out = []
    for i, (dx, dy, s) in enumerate([(0, 0, 1.0), (spread * 0.9, spread * 0.35, 0.82), (spread * 0.25, -spread * 0.8, 0.7)]):
        a = R.uniform(0, math.tau)
        out.append(fn((c[0] + dx * math.cos(a * 0.1), c[1] + dy, c[2] if len(c) > 2 else 0), rz=R.uniform(-0.5, 0.5), s=s, **kw))
    return out

# ---------------------------------------------------------------- palette (night, measured targets: lit C* 52-68)
M = {}
def mats():
    M["crate"] = toon("Crate", (150, 130, 108), (64, 48, 60), img="planks.png", scale=1.4, gain=0.95)
    M["drum"] = toon("Drum", (140, 170, 110), (44, 52, 64), img="drum.png", scale=1.2)
    M["drumRed"] = toon("DrumRed", (210, 90, 70), (70, 36, 52), img="drum.png", scale=1.2)
    M["sand"] = toon("Sandbag", (196, 172, 128), (66, 60, 78), img="burlap.png", scale=2.0)
    M["canvas"] = toon("Canvas", (168, 178, 132), (52, 58, 76), img="canvas.png", scale=0.35)
    M["canvasG"] = toon("CanvasGrey", (150, 160, 170), (46, 50, 72), img="canvas.png", scale=0.35)
    M["wood"] = toon("Wood", (132, 108, 88), (58, 40, 52), rim=(255, 200, 150))
    M["dark"] = toon("DarkOpening", (40, 34, 52), (18, 16, 30))
    M["metal"] = toon("GunMetal", (110, 130, 140), (34, 40, 58), rim=(170, 200, 255))
    M["olive"] = toon("Olive", (84, 100, 66), (40, 50, 50), rim=(190, 220, 255))
    M["grey"] = toon("FieldGrey", (130, 140, 140), (40, 46, 64), rim=(190, 210, 255))
    M["tyre"] = toon("Tyre", (60, 58, 66), (20, 18, 28))
    M["bomb"] = toon("Bomb", (96, 120, 96), (30, 38, 50), rim=(190, 220, 255))
    M["leaf"] = toon("Leaf", (52, 110, 96), (18, 34, 52), rim=(120, 170, 220))
    M["leaf2"] = toon("Leaf2", (70, 124, 84), (20, 40, 50))
    M["pine"] = toon("Pine", (40, 92, 92), (14, 28, 46))
    M["trunk"] = toon("Trunk", (110, 80, 66), (36, 28, 40))
    M["tuft"] = toon("Tuft", (66, 120, 92), (22, 42, 50))
    M["white"] = toon("Chalk", (236, 236, 228), (120, 120, 140))
    M["board"] = toon("Board", (40, 60, 56), (16, 24, 30))
    M["red"] = toon("RedCloth", (220, 60, 60), (80, 24, 44))
    M["yellow"] = toon("Yellow", (236, 196, 80), (90, 70, 50))
    M["blue"] = toon("BlueCloth", (90, 120, 200), (30, 36, 80))
    M["flower"] = toon("Flower", (250, 220, 90), (110, 80, 60))
    M["flowerR"] = toon("FlowerR", (240, 90, 120), (90, 30, 60))
    M["brass"] = toon("Brass", (220, 170, 80), (80, 56, 40), rim=(255, 230, 160))
    M["cat"] = toon("Cat", (226, 150, 80), (84, 50, 46))
    M["smoke"] = toon("Smoke", (110, 112, 140), (44, 44, 70))
    M["cloud"] = toon("CloudToon", lin_inv((0.34, 0.42, 0.66)), lin_inv((0.05, 0.075, 0.2)), rim=None, haze=False)
    M["flak"] = toon("FlakPuff", (70, 66, 80), (30, 28, 42), haze=False)
    M["stone"] = toon("Stone", (150, 156, 170), (46, 48, 72)); M["stone2"] = toon("Stone2", (178, 164, 140), (60, 52, 70)); M["stone3"] = toon("Stone3", (110, 116, 134), (34, 36, 58))
    M["blade"] = blade_mat() if SOFT else None
    M["glass"] = glass_mat()
    M["tarp"] = toon("Tarp", (112, 122, 100))
    M["lamp"] = glow("LanternGlow", (255, 190, 100), 30)
    M["fire"] = glow("FireGlow", (255, 140, 46), 18)
    M["fire2"] = glow("FireCore", (255, 220, 120), 24)
    M["door"] = glow("DoorGlow", (255, 170, 80), 6)
    M["beam"] = beam_mat("Beam", (200, 215, 255), 1.6)
    M["wire"] = glow("Wire", (8, 7, 10), 1)

def lin_inv(c):  # linear (0-1) -> sRGB 0-255 for toon()
    return tuple(255 * (12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055) for x in c)

# ---------------------------------------------------------------- v2 helpers (fine pass): blade tufts, stones, torus, mist, air volume
def blade_tuft(name, n, h):
    """grass tuft from thin tapered blade strips (painted tip via the Blade material), no ink hull."""
    bm = bmesh.new(); r = random.Random(sum(map(ord, name)))
    for i in range(n):
        a = r.uniform(0, math.tau); x0, y0 = 0.05 * math.cos(a) * r.random(), 0.05 * math.sin(a) * r.random()
        hh = h * r.uniform(0.6, 1.15); lean = r.uniform(0.15, 0.55); w = 0.011 * r.uniform(0.8, 1.3); d = (math.cos(a), math.sin(a)); pv = (-d[1], d[0])
        ring = []
        for k in range(4):
            t = k / 3; z = hh * t; off = lean * hh * t * t; ww = w * (1 - t) + 0.0015
            c = (x0 + d[0] * off, y0 + d[1] * off, z)
            ring.append((bm.verts.new((c[0] - pv[0] * ww, c[1] - pv[1] * ww, c[2])), bm.verts.new((c[0] + pv[0] * ww, c[1] + pv[1] * ww, c[2]))))
        for k in range(3): bm.faces.new((ring[k][0], ring[k][1], ring[k + 1][1], ring[k + 1][0]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(M["blade"]); return me

def stones(name):
    """a little scree patch: irregular, soft-shaded, flattened stones of 3 tones, sunk into the ground."""
    bm = bmesh.new(); r = random.Random(5)
    for i in range(6):
        t = bmesh.new(); bmesh.ops.create_icosphere(t, subdivisions=2, radius=1.0)
        for v in t.verts: v.co *= r.uniform(0.8, 1.16)
        sx, sy, sz = r.uniform(0.03, 0.075), r.uniform(0.025, 0.06), r.uniform(0.014, 0.03)
        bmesh.ops.transform(t, matrix=Matrix.Translation((r.uniform(-0.3, 0.3), r.uniform(-0.3, 0.3), -0.008)) @ Matrix.Rotation(r.uniform(0, 6), 4, "Z") @ Matrix.Diagonal((sx, sy, sz, 1)), verts=t.verts)
        for f in t.faces: f.material_index = i % 3; f.smooth = True
        me = bpy.data.meshes.new("_t"); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for m in (M["stone"], M["stone2"], M["stone3"]): me.materials.append(m)
    for p in me.polygons: p.use_smooth = True
    return me

def bk_torus(mb, c, R_, r, mat):
    t = bmesh.new(); seg, seg2 = 24, 6
    rings = [[t.verts.new((c[0] + (R_ + r * math.cos(b)) * math.cos(a), c[1] + (R_ + r * math.cos(b)) * math.sin(a), c[2] + r * math.sin(b)))
              for b in [j * math.tau / seg2 for j in range(seg2)]] for a in [i * math.tau / seg for i in range(seg)]]
    for i in range(seg):
        for j in range(seg2):
            t.faces.new((rings[i][j], rings[(i + 1) % seg][j], rings[(i + 1) % seg][(j + 1) % seg2], rings[i][(j + 1) % seg2]))
    mb._take(t, mat, Matrix.Identity(4))

def blade_mat():
    """grass blade: toon tones + painted tip (lighter toward the tip along Generated z)."""
    return toon("Blade", (70, 118, 92))
    m = None
    nt = m.node_tree; L = nt.links.new; em = [n for n in nt.nodes if n.type == "EMISSION"][0]; src = em.inputs[0].links[0].from_socket
    tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["Generated"], sx.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs[3].default_value = 0.85; mr.inputs[4].default_value = 1.15; L(sx.outputs[2], mr.inputs[0])
    sc = nt.nodes.new("ShaderNodeVectorMath"); sc.operation = "SCALE"; L(src, sc.inputs[0]); L(mr.outputs[0], sc.inputs[3]); L(sc.outputs[0], em.inputs[0])
    m.use_backface_culling = False; return m

def mist_layer(name, center, w, h, face_to, k=0.35, col=(0.10, 0.15, 0.30)):
    """ground mist card: horizon-coloured, densest at the ground, broken by soft noise."""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value = (*col, 1); em.inputs[1].default_value = 1.0
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["UV"], sx.inputs[0])
    g = nt.nodes.new("ShaderNodeMapRange"); g.inputs[3].default_value = k; g.inputs[4].default_value = 0.0; L(sx.outputs[1], g.inputs[0])
    ed = nt.nodes.new("ShaderNodeMath"); ed.operation = "MULTIPLY"; L(g.outputs[0], ed.inputs[0])
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 4.0; nz.inputs["Detail"].default_value = 2; L(tc.outputs["UV"], nz.inputs[0])
    nm = nt.nodes.new("ShaderNodeMapRange"); nm.inputs[3].default_value = 0.35; nm.inputs[4].default_value = 1.3; L(nz.outputs[0], nm.inputs[0]); L(nm.outputs[0], ed.inputs[1])
    L(ed.outputs[0], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(em.outputs[0], mx.inputs[2]); L(mx.outputs[0], out.inputs[0])
    try: m.surface_render_method = "BLENDED"
    except Exception: pass
    return card_plane(name, m, w, h, center, face_to)

def volume_box(center, size, density=0.012, col=(0.62, 0.6, 0.9)):
    """low-density scattering volume over the set: lanterns and searchlights get halos and shafts."""
    me = bpy.data.meshes.new("AirVol"); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    m = bpy.data.materials.new("AirVolume"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); pv = nt.nodes.new("ShaderNodeVolumePrincipled"); pv.inputs["Density"].default_value = density
    pv.inputs["Color"].default_value = (*col, 1); pv.inputs["Anisotropy"].default_value = 0.35; nt.links.new(pv.outputs[0], out.inputs["Volume"])
    me.materials.append(m); o = bpy.data.objects.new("AirVol", me); COLL.objects.link(o); o.location = center; o.scale = size; return o

def atmosphere(cam, dists=(9, 16, 26, 40, 60, 85), vol=None):
    """v2 atmosphere: ground-mist layers at increasing depth (wider, denser with distance) + optional air volume."""
    for i, d in enumerate(dists):
        c = from_cam(cam, 0, 0, d); c.z = -0.1
        mist_layer("Mist%d" % i, (c.x, c.y, c.z), 2.2 * d * 0.75 + 6, 1.2 + 0.06 * d, cam.location, k=min(0.12 + 0.012 * d, 0.6))
    if vol: volume_box(*vol)

# ---------------------------------------------------------------- prop prototypes
P = {}
def protos():
    P["crate"] = MB("crate", [M["crate"]]).box((0, 0, 0.25), (0.9, 0.6, 0.5)).mesh()
    P["crateL"] = MB("crateL", [M["crate"], M["olive"]]).box((0, 0, 0.22), (1.4, 0.5, 0.44)).box((0, 0, 0.45), (1.42, 0.52, 0.04), 1).box((0.55, 0, 0.22), (0.05, 0.52, 0.46), 1).box((-0.55, 0, 0.22), (0.05, 0.52, 0.46), 1).mesh()
    P["drum"] = MB("drum", [M["drum"], M["metal"]]).cyl((0, 0, 0.44), 0.29, 0.88, 0, 14).cyl((0, 0, 0.3), 0.3, 0.03, 1, 14).cyl((0, 0, 0.6), 0.3, 0.03, 1, 14).cyl((0.1, 0.1, 0.89), 0.04, 0.03, 1, 8).mesh()
    P["drumR"] = MB("drumR", [M["drumRed"], M["metal"]]).cyl((0, 0, 0.44), 0.29, 0.88, 0, 14).cyl((0, 0, 0.3), 0.3, 0.03, 1, 14).cyl((0, 0, 0.6), 0.3, 0.03, 1, 14).mesh()
    P["drumLying"] = MB("drumLying", [M["drum"], M["metal"]]).cyl((0, 0, 0.29), 0.29, 0.88, 0, 14, rot=(0, math.pi / 2, 0)).cyl((0.2, 0, 0.29), 0.3, 0.03, 1, 14, rot=(0, math.pi / 2, 0)).mesh()
    P["sandbag"] = MB("sandbag", [M["sand"]]).sph((0, 0, 0.1), (0.34, 0.2, 0.11), 0, 10, 6).mesh()
    tb = MB("tent", [M["canvas"], M["dark"], M["wood"]])
    sag_pyr(tb, 2.2, 2.4, 0)
    tb.box((0, -1.25, 0.55), (0.9, 0.05, 1.1), 1, rx=-0.45)
    tb.rod((0, 0, 0), (0, 0, 2.7), 0.04, 2)
    for a in range(4):
        aa = a * math.pi / 2 + math.pi / 4
        tb.rod((1.5 * math.cos(aa), 1.5 * math.sin(aa), 0.05), (3.0 * math.cos(aa), 3.0 * math.sin(aa), 0.0), 0.012, 2)
        tb.box((3.0 * math.cos(aa), 3.0 * math.sin(aa), 0.08), (0.05, 0.05, 0.25), 2)
    P["tent"] = tb.mesh()
    tg = MB("tentG", [M["canvasG"], M["dark"], M["wood"]]); sag_pyr(tg, 2.0, 2.2, 0); tg.box((0, -1.15, 0.5), (0.8, 0.05, 1.0), 1, rx=-0.45); tg.rod((0, 0, 0), (0, 0, 2.5), 0.04, 2); P["tentG"] = tg.mesh()
    # lantern (kerosene, on a stake) - glow globe; light added per instance
    P["lantern"] = MB("lantern", [M["wood"], M["metal"], M["lamp"], M["glass"]]).rod((0, 0, 0), (0, 0, 0.9), 0.03, 0).cyl((0, 0, 0.95), 0.09, 0.04, 1, 10).cyl((0, 0, 1.06), 0.035, 0.12, 2, 10).cyl((0, 0, 1.06), 0.07, 0.18, 3, 16).cyl((0, 0, 1.17), 0.09, 0.05, 1, 10, r2=0.03).mesh()
    # bomb FAB-50-ish
    bb = MB("bomb", [M["bomb"], M["red"]]); bb.cyl((0, 0, 0), 0.1, 0.7, 0, 12, rot=(math.pi / 2, 0, 0)); bb.sph((0, -0.35, 0), (0.1, 0.16, 0.1), 0, 12, 6)
    bb.cyl((0, 0.45, 0), 0.1, 0.22, 0, 12, r2=0.04, rot=(-math.pi / 2, 0, 0)); bb.box((0, 0.55, 0), (0.26, 0.12, 0.01), 0); bb.box((0, 0.55, 0), (0.01, 0.12, 0.26), 0); bb.cyl((0, -0.2, 0), 0.102, 0.03, 1, 12, rot=(math.pi / 2, 0, 0))
    P["bomb"] = bb.mesh()
    cb = MB("bombcart", [M["wood"], M["tyre"], M["metal"]]); cb.box((0, 0, 0.42), (0.9, 1.6, 0.06), 0); cb.box((0.42, 0, 0.5), (0.05, 1.6, 0.12), 0); cb.box((-0.42, 0, 0.5), (0.05, 1.6, 0.12), 0)
    for sx in (-0.5, 0.5):
        for sy in (-0.55, 0.55): cb.cyl((sx, sy, 0.22), 0.22, 0.08, 1, 14, rot=(0, math.pi / 2, 0)); cb.cyl((sx, sy, 0.22), 0.07, 0.1, 2, 8, rot=(0, math.pi / 2, 0))
    cb.rod((0, -0.8, 0.45), (0, -1.6, 0.25), 0.03, 0); cb.rod((-0.2, -1.6, 0.25), (0.2, -1.6, 0.25), 0.03, 0)
    P["bombcart"] = cb.mesh()
    # deciduous tree + conifer
    tr = MB("tree", [M["trunk"], M["leaf"], M["leaf2"]]); tr.cyl((0, 0, 2.5), 0.28, 5.0, 0, 7, r2=0.16)
    for i in range(6): tr.ico((R.uniform(-1.6, 1.6), R.uniform(-1.6, 1.6), R.uniform(4.4, 7.4)), R.uniform(1.4, 2.3), 1 + (i % 2), 2)
    P["tree"] = tr.mesh()
    cf = MB("pine", [M["trunk"], M["pine"]]); cf.cyl((0, 0, 1.0), 0.2, 2.0, 0, 6)
    for i, (z, r) in enumerate([(2.2, 2.4), (4.0, 1.9), (5.6, 1.4), (7.0, 0.9)]): cf.cyl((0, 0, z), r, 2.6, 1, 8, r2=0.05)
    P["pine"] = cf.mesh()
    P["tuftOld"] = MB("tuftOld", [M["tuft"]]).cyl((0, 0, 0.18), 0.07, 0.4, 0, 4, r2=0.0, rot=(0.25, 0, 0)).cyl((0.08, 0.04, 0.15), 0.06, 0.32, 0, 4, r2=0.0, rot=(-0.3, 0.2, 0)).cyl((-0.07, 0.05, 0.14), 0.06, 0.3, 0, 4, r2=0.0, rot=(0.1, -0.35, 0)).mesh()
    P["tuft"] = blade_tuft("tuft", 11, 0.32) if SOFT else P["tuftOld"]
    P["bush"] = MB("bush", [M["leaf2"], M["leaf"]]).ico((0, 0, 0.5), 0.7, 0, 1).ico((0.6, 0.2, 0.4), 0.5, 1, 1).ico((-0.5, 0.1, 0.35), 0.45, 0, 1).mesh()
    # telegraph pole
    tp = MB("pole", [M["wood"], M["white"]]); tp.cyl((0, 0, 3.5), 0.12, 7.0, 0, 8, r2=0.09); tp.box((0, 0, 6.6), (1.6, 0.1, 0.1), 0)
    for x in (-0.7, -0.25, 0.25, 0.7): tp.cyl((x, 0, 6.72), 0.04, 0.14, 1, 6)
    P["pole"] = tp.mesh()
    # chalkboard on easel with tally marks (no letters)
    ch = MB("chalkboard", [M["wood"], M["board"], M["white"]]); ch.box((0, 0, 1.2), (1.3, 0.05, 0.9), 1, rx=-0.15)
    for x in (-0.55, 0.55): ch.rod((x, -0.25, 0), (x, 0.05, 1.7), 0.03, 0)
    ch.rod((0, 0.5, 0), (0, 0.05, 1.6), 0.03, 0)
    for i in range(18):
        r, c = divmod(i, 6); ch.box((-0.45 + c * 0.16 + (0.05 if (i % 5 == 4) else 0), -0.04, 1.42 - r * 0.24), (0.025, 0.01, 0.16), 2, rx=-0.15, ry=0.6 if i % 5 == 4 else 0)
    P["chalkboard"] = ch.mesh()
    # windsock
    ws = MB("windsock", [M["wood"], M["red"], M["white"]]); ws.cyl((0, 0, 2.5), 0.05, 5.0, 0, 6)
    for i in range(4): ws.cyl((0.35 + i * 0.5, 0, 4.85 - i * 0.12), 0.32 - i * 0.05, 0.5, 1 + (i % 2), 10, r2=0.27 - i * 0.05, rot=(0, math.pi / 2 + 0.2, 0))
    P["windsock"] = ws.mesh()
    # truck (GAZ-style / Opel-style, no logos)
    def truck(name, body):
        t = MB(name, [body, M["tyre"], M["canvasG"], M["dark"], M["metal"], M["lamp"]])
        t.box((0, 1.6, 0.95), (1.9, 1.3, 1.1), 0); t.box((0, 2.75, 0.85), (1.3, 1.1, 0.8), 0); t.box((0, 1.0, 1.35), (1.7, 0.05, 0.5), 3)
        t.box((0, -1.0, 0.85), (2.1, 3.6, 0.15), 0); t.box((0, -1.0, 1.7), (2.05, 3.5, 1.6), 2); t.box((0, -2.8, 1.25), (1.6, 0.04, 0.9), 3)
        for sx in (-0.95, 0.95):
            for sy in (2.6, -0.4, -1.9): t.cyl((sx, sy, 0.48), 0.48, 0.32, 1, 14, rot=(0, math.pi / 2, 0)); t.cyl((sx * 1.02, sy, 0.48), 0.2, 0.34, 4, 8, rot=(0, math.pi / 2, 0))
            t.box((sx * 0.8, 3.2, 0.95), (0.18, 0.08, 0.18), 5)
        for i in range(5): t.box((0, 3.32, 0.62 + i * 0.1), (1.0, 0.03, 0.04), 4)
        return t.mesh()
    P["truck"] = truck("truck", M["olive"]); P["truckG"] = truck("truckG", M["grey"])
    # field gun
    fg = MB("gun", [M["grey"], M["tyre"], M["metal"]]); fg.box((0, 0, 0.9), (1.8, 0.08, 1.1), 0); fg.cyl((0, 1.6, 1.05), 0.08, 3.2, 2, 10, rot=(math.pi / 2 - 0.25, 0, 0)); fg.box((0, -0.3, 0.9), (0.5, 0.9, 0.4), 2)
    for sx in (-0.85, 0.85): fg.cyl((sx, 0, 0.6), 0.6, 0.12, 1, 16, rot=(0, math.pi / 2, 0))
    fg.rod((-0.3, -0.4, 0.6), (-0.6, -2.8, 0.05), 0.07, 0); fg.rod((0.3, -0.4, 0.6), (0.6, -2.8, 0.05), 0.07, 0)
    P["gun"] = fg.mesh()
    # flak 88-ish on cross base (silhouette only)
    fk = MB("flak", [M["grey"], M["metal"]]); fk.box((0, 0, 0.3), (4.0, 0.3, 0.25), 0); fk.box((0, 0, 0.3), (0.3, 4.0, 0.25), 0); fk.cyl((0, 0, 0.9), 0.5, 1.1, 0, 10); fk.box((0, 0, 1.7), (1.2, 1.6, 0.9), 0); fk.cyl((0, 2.6, 3.2), 0.1, 5.0, 1, 10, rot=(-0.65, 0, 0)); fk.box((0, 0.1, 1.9), (2.2, 0.06, 1.3), 0)
    P["flak"] = fk.mesh()
    # searchlight
    sl = MB("searchlight", [M["grey"], M["metal"], M["lamp"]]); sl.box((0, 0, 0.4), (0.9, 0.9, 0.8), 0); sl.cyl((0, 0, 1.4), 0.65, 0.9, 1, 16, rot=(0.9, 0, 0)); sl.cyl((0, 0.36, 1.68), 0.55, 0.05, 2, 16, rot=(0.9, 0, 0))
    P["searchlight"] = sl.mesh()
    # misc small kit
    if SOFT:
        jb = MB("jerry", [M["grey"], M["metal"], M["red"]]); jb.box((0, 0, 0.235), (0.165, 0.345, 0.45), 0)
        for sx in (-0.086, 0.086):  # pressed X-ribs and the raised panel on both faces
            jb.box((sx, 0, 0.235), (0.012, 0.40, 0.03), 0, rx=0.9); jb.box((sx, 0, 0.235), (0.012, 0.40, 0.03), 0, rx=-0.9)
            jb.box((sx, 0, 0.235), (0.010, 0.31, 0.40), 0)
        for y in (-0.09, 0.0, 0.09): jb.rod((0, y, 0.46), (0, y, 0.52), 0.012, 1, 6)
        jb.box((0, 0.0, 0.525), (0.03, 0.22, 0.018), 1); jb.cyl((0, 0.15, 0.47), 0.028, 0.05, 2, 10); jb.cyl((0, 0.15, 0.50), 0.034, 0.012, 1, 10)
        P["jerry"] = jb.mesh()
        bk = MB("bucket", [M["metal"], M["dark"]]); bk.cyl((0, 0, 0.17), 0.14, 0.34, 0, 18, r2=0.18, caps=False); bk.cyl((0, 0, 0.012), 0.14, 0.02, 0, 18)
        bk.cyl((0, 0, 0.32), 0.172, 0.01, 1, 18); bk_torus(bk, (0, 0, 0.34), 0.18, 0.009, 0)
        for i in range(13):  # wire bail handle (half ring)
            a0, a1 = math.pi * i / 13, math.pi * (i + 1) / 13
            bk.rod((0.18 * math.cos(a0), 0, 0.34 + 0.2 * math.sin(a0)), (0.18 * math.cos(a1), 0, 0.34 + 0.2 * math.sin(a1)), 0.006, 0, 5)
        P["bucket"] = bk.mesh()
    else:
        P["jerry"] = MB("jerry", [M["grey"]]).box((0, 0, 0.24), (0.17, 0.36, 0.48)).box((0, 0.1, 0.5), (0.04, 0.12, 0.05)).mesh()
        P["bucket"] = MB("bucket", [M["metal"]]).cyl((0, 0, 0.17), 0.15, 0.34, 0, 10, r2=0.18).mesh()
    P["shovel"] = MB("shovel", [M["wood"], M["metal"]]).rod((0, 0, 0.25), (0, 0.05, 1.3), 0.02, 0).box((0, 0, 0.15), (0.22, 0.03, 0.28), 1).mesh()
    P["bench"] = MB("bench", [M["wood"]]).box((0, 0, 0.45), (1.8, 0.35, 0.06)).box((-0.75, 0, 0.22), (0.06, 0.3, 0.44)).box((0.75, 0, 0.22), (0.06, 0.3, 0.44)).mesh()
    P["ladder"] = MB("ladder", [M["wood"]]).rod((-0.22, 0, 0), (-0.22, 0.6, 2.6), 0.03).rod((0.22, 0, 0), (0.22, 0.6, 2.6), 0.03).mesh()
    lad = P["ladder"]
    P["phone"] = MB("phone", [M["wood"], M["metal"]]).box((0, 0, 0.12), (0.28, 0.2, 0.24)).cyl((0.16, 0, 0.14), 0.03, 0.06, 1, 6, rot=(0, math.pi / 2, 0)).box((0, 0, 0.27), (0.24, 0.06, 0.05), 1).mesh()
    P["bike"] = MB("bike", [M["tyre"], M["metal"]]).cyl((0, -0.55, 0.34), 0.34, 0.04, 0, 16, rot=(0, math.pi / 2, 0), caps=False).cyl((0, 0.55, 0.34), 0.34, 0.04, 0, 16, rot=(0, math.pi / 2, 0), caps=False).rod((0, -0.55, 0.34), (0, 0, 0.8), 0.02, 1).rod((0, 0, 0.8), (0, 0.5, 0.85), 0.02, 1).rod((0, 0.55, 0.34), (0, 0.5, 0.95), 0.02, 1).rod((0, -0.1, 0.34), (0, 0, 0.8), 0.02, 1).box((0, -0.05, 0.85), (0.1, 0.22, 0.04), 1).rod((-0.25, 0.5, 0.98), (0.25, 0.5, 0.98), 0.015, 1).mesh()
    # shell-case vase with flowers (time detail: the 588th's flowers) + sleeping cat (humour)
    vb = MB("vase", [M["brass"], M["leaf2"], M["flower"], M["flowerR"]]); vb.cyl((0, 0, 0.16), 0.06, 0.32, 0, 10)
    for i in range(7):
        a = i * 0.9; p = (0.08 * math.cos(a), 0.08 * math.sin(a), 0.48 + 0.06 * (i % 3)); vb.rod((0, 0, 0.3), p, 0.008, 1); vb.ico(p, 0.04, 2 + (i % 2), 1)
    P["vase"] = vb.mesh()
    ct = MB("cat", [M["cat"], M["white"]]); ct.sph((0, 0, 0.12), (0.2, 0.13, 0.11), 0); ct.sph((0.19, 0.05, 0.15), (0.09, 0.085, 0.08), 0)
    ct.cyl((0.22, 0.0, 0.24), 0.03, 0.06, 0, 4, r2=0.0); ct.cyl((0.22, 0.1, 0.24), 0.03, 0.06, 0, 4, r2=0.0); ct.rod((-0.18, 0, 0.06), (0.05, -0.16, 0.04), 0.025, 0); ct.sph((0.26, 0.04, 0.12), (0.03, 0.04, 0.02), 1)
    P["cat"] = ct.mesh()
    # campfire: logs + flame cones (glow) ; smoke stack
    fp = MB("fire", [M["wood"], M["fire"], M["fire2"], M["grey"]])
    for a in range(5): fp.rod((0.45 * math.cos(a * 1.26), 0.45 * math.sin(a * 1.26), 0.05), (0, 0, 0.35), 0.06, 0)
    for i in range(6): fp.cyl((R.uniform(-0.15, 0.15), R.uniform(-0.15, 0.15), 0.45), R.uniform(0.1, 0.18), R.uniform(0.5, 0.9), 1 + (i % 2), 5, r2=0.0)
    for a in range(9): fp.ico((0.6 * math.cos(a * 0.7), 0.6 * math.sin(a * 0.7), 0.06), 0.11, 3, 1)
    P["fire"] = fp.mesh()
    sm = MB("smoke", [M["smoke"]])
    for i in range(7): sm.ico((0.25 * i + R.uniform(-0.2, 0.2), 0.1 * i, 1.2 + i * 0.9), 0.45 + i * 0.12, 0, 2)
    P["smoke"] = sm.mesh()
    # laundry line (humour + time detail): two posts, line, stockings + shirts
    ll = MB("laundry", [M["wood"], M["white"], M["blue"], M["canvas"], M["wire"]]); ll.rod((-2.2, 0, 0), (-2.2, 0, 1.9), 0.04, 0); ll.rod((2.2, 0, 0), (2.2, 0, 1.9), 0.04, 0)
    ll.rod((-2.2, 0, 1.85), (2.2, 0, 1.85), 0.008, 4)
    for i, x in enumerate([-1.7, -1.3, -0.8, -0.2, 0.4, 0.9, 1.5]):
        if i % 3 == 0: ll.box((x, 0, 1.55), (0.42, 0.02, 0.55), 1 + (i % 2), rz=0.05)
        else: ll.box((x, 0, 1.5), (0.09, 0.02, 0.6), 1 + (i % 3)); ll.box((x + 0.08, 0, 1.22), (0.16, 0.02, 0.08), 1 + (i % 3))
    P["laundry"] = ll.mesh()
    # dugout entrance with lit door (sandbag-lined)
    dg = MB("dugout", [M["sand"], M["door"], M["wood"]]); dg.box((0, 0, 0.6), (2.6, 1.6, 1.2), 0); dg.box((0, -0.81, 0.55), (0.8, 0.02, 1.0), 1); dg.box((0, -0.85, 1.12), (1.0, 0.1, 0.1), 2)
    dg.box((0, 0.1, 1.25), (2.9, 2.0, 0.12), 2); P["dugout"] = dg.mesh()
    # stretcher-style table with map + kettle
    tbm = MB("table", [M["wood"], M["white"], M["metal"]]); tbm.box((0, 0, 0.8), (1.4, 0.8, 0.05), 0)
    for sx in (-0.6, 0.6):
        for sy in (-0.32, 0.32): tbm.box((sx, sy, 0.4), (0.05, 0.05, 0.8), 0)
    tbm.box((-0.1, 0, 0.83), (0.6, 0.45, 0.01), 1, rz=0.2); tbm.cyl((0.45, 0.15, 0.92), 0.09, 0.18, 2, 10, r2=0.06); P["table"] = tbm.mesh()
    # rifle stack (camp) + helmet on a post (humour: helmet on the scarecrow broom)
    rs = MB("rifles", [M["wood"], M["metal"]])
    for i in range(3): a = i * 2.1; rs.rod((0.35 * math.cos(a), 0.35 * math.sin(a), 0), (0, 0, 1.25), 0.025, 0)
    P["rifles"] = rs.mesh()
    if SOFT: P["pebbles"] = stones("pebbles")
    else:
        pb = MB("pebbles", [M["metal"], M["sand"], M["grey"]])
        for i in range(7): pb.ico((R.uniform(-0.35, 0.35), R.uniform(-0.35, 0.35), 0.01), R.uniform(0.03, 0.08), i % 3, 1, sq=(1.3, 1.0, 0.5))
        P["pebbles"] = pb.mesh()
    db = MB("duckboard", [M["wood"]]); db.box((-0.3, 0, 0.04), (0.06, 2.4, 0.07)); db.box((0.3, 0, 0.04), (0.06, 2.4, 0.07))
    for i in range(10): db.box((0, -1.1 + i * 0.245, 0.1), (0.8, 0.15, 0.04), rz=R.uniform(-0.04, 0.04))
    P["duckboard"] = db.mesh()

# ---------------------------------------------------------------- sky
def sky(moon_dir):
    w = bpy.data.worlds.new("NightSky"); SC.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputWorld"); bg = nt.nodes.new("ShaderNodeBackground")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["Generated"], sx.inputs[0])
    rp = nt.nodes.new("ShaderNodeValToRGB"); cr = rp.color_ramp
    cr.elements[0].position = 0.0; cr.elements[0].color = (0.085, 0.14, 0.34, 1); cr.elements[1].position = 0.55; cr.elements[1].color = (0.006, 0.012, 0.05, 1)
    e = cr.elements.new(0.14); e.color = (0.03, 0.055, 0.17, 1); L(sx.outputs[2], rp.inputs[0])
    vo = nt.nodes.new("ShaderNodeTexVoronoi"); vo.inputs["Scale"].default_value = 170; L(tc.outputs["Generated"], vo.inputs[0])
    lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = 0.09; L(vo.outputs["Distance"], lt.inputs[0])
    sep = nt.nodes.new("ShaderNodeSeparateColor"); L(vo.outputs["Color"], sep.inputs[0])
    gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.72; L(sep.outputs[0], gt.inputs[0])
    hz = nt.nodes.new("ShaderNodeMath"); hz.operation = "GREATER_THAN"; hz.inputs[1].default_value = 0.035; L(sx.outputs[2], hz.inputs[0])
    m1 = nt.nodes.new("ShaderNodeMath"); m1.operation = "MULTIPLY"; L(lt.outputs[0], m1.inputs[0]); L(gt.outputs[0], m1.inputs[1])
    m2 = nt.nodes.new("ShaderNodeMath"); m2.operation = "MULTIPLY"; L(m1.outputs[0], m2.inputs[0]); L(hz.outputs[0], m2.inputs[1])
    br = nt.nodes.new("ShaderNodeMath"); br.operation = "MULTIPLY_ADD"; L(sep.outputs[1], br.inputs[0]); br.inputs[1].default_value = 0.9; br.inputs[2].default_value = 0.35
    m3 = nt.nodes.new("ShaderNodeMath"); m3.operation = "MULTIPLY"; L(m2.outputs[0], m3.inputs[0]); L(br.outputs[0], m3.inputs[1])
    ad = nt.nodes.new("ShaderNodeVectorMath"); ad.operation = "ADD"; L(rp.outputs[0], ad.inputs[0])
    cx = nt.nodes.new("ShaderNodeCombineXYZ"); [L(m3.outputs[0], cx.inputs[i]) for i in range(3)]; L(cx.outputs[0], ad.inputs[1])
    L(ad.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = 1.0; L(bg.outputs[0], out.inputs[0])
    # moon disc (textured emission) far away
    md = Vector(moon_dir).normalized(); mo = MB("moon", [glow_tex("MoonTex", "moon.png", 14.0)])
    t = bmesh.new(); bmesh.ops.create_circle(t, cap_ends=True, segments=48, radius=1.0); mo._take(t, 0, Matrix.Identity(4)); me = mo.mesh()
    me.uv_layers.new();
    for l in me.loops: v = me.vertices[l.vertex_index].co; me.uv_layers[0].data[l.index].uv = (v.x * 0.5 + 0.5, v.y * 0.5 + 0.5)
    o = bpy.data.objects.new("Moon", me); COLL.objects.link(o); o.location = md * 6000; o.scale = (210, 210, 210)
    o.rotation_euler = (-md).to_track_quat("-Z", "Y").to_euler()
    # moonlight + sky fill
    for nm, en, col, d in [("MoonKey", 1.5, (0.78, 0.84, 1.0), md), ("SkyFill", 0.85, (0.62, 0.72, 1.0), Vector((-0.5, -0.72, 0.5)))]:
        ld = bpy.data.lights.new(nm, "SUN"); ld.energy = en; ld.color = col; ld.angle = 0.006
        so = bpy.data.objects.new(nm, ld); COLL.objects.link(so); so.rotation_euler = Vector(d).normalized().to_track_quat("Z", "Y").to_euler()

def glow_tex(name, img, k):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.remove(nt.nodes["Principled BSDF"])
    it = nt.nodes.new("ShaderNodeTexImage"); it.image = image(img); em = nt.nodes.new("ShaderNodeEmission"); em.inputs[1].default_value = k
    nt.links.new(it.outputs[0], em.inputs[0]); nt.links.new(em.outputs[0], nt.nodes["Material Output"].inputs[0]); return m

def cloud(center, w, h, n=14, seed=1):
    r = random.Random(seed); mb = MB("cloud", [M["cloud"]])
    for i in range(n):
        x = r.uniform(-w / 2, w / 2); rr = r.uniform(0.18, 0.34) * h * (1.4 - abs(x) / w)
        mb.ico((x, r.uniform(-h * 0.3, h * 0.3), r.uniform(0, h * 0.35) + rr * 0.3), rr, 0, 2, sq=(1.3, 1.0, 0.75))
    me = mb.mesh(); o = bpy.data.objects.new("Cloud", me); COLL.objects.link(o); o.location = center
    rm = o.modifiers.new("Remesh", "REMESH"); rm.mode = "VOXEL"; rm.voxel_size = max(2.0, w / 55)
    sm = o.modifiers.new("Smooth", "SMOOTH"); sm.iterations = 6
    hull_ink(o, max(1.0, w * 0.004) * (0.6 if SOFT else 1.0)); COUNT["cloud"] = COUNT.get("cloud", 0) + 1; return o

def cirrus_band(center, w, h, face_to):
    m = bpy.data.materials.new("Cirrus"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); it = nt.nodes.new("ShaderNodeTexImage"); it.image = image("cirrus.png")
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs[1].default_value = 0.55; tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    L(it.outputs[0], em.inputs[0]); L(it.outputs[1], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(em.outputs[0], mx.inputs[2]); L(mx.outputs[0], out.inputs[0])
    try: m.surface_render_method = "BLENDED"
    except Exception: pass
    card_plane("CirrusBand", m, w, h, center, face_to, uv_full=True)

# ---------------------------------------------------------------- character cards (2.5D, camera-facing)
MPX = 0.0009  # metres per card pixel (sentry 1936 px = 1.74 m + helmet)
def card_plane(name, mat, w, h, loc, face_to=None, uv_full=False, z0=0.0):
    me = bpy.data.meshes.new(name); x0, x1 = -w / 2, w / 2
    me.from_pydata([(x0, 0, z0), (x1, 0, z0), (x1, 0, z0 + h), (x0, 0, z0 + h)], [], [(0, 1, 2, 3)]); uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = c
    me.materials.append(mat); o = bpy.data.objects.new(name, me); COLL.objects.link(o); o.location = loc
    if face_to is not None:
        d = (Vector(face_to) - Vector(loc)); o.rotation_euler = (0, 0, math.atan2(d.x, -d.y))
    return o

def card(char, loc, cam, light=(0.80, 0.84, 1.0), k=1.0, mirror=False):
    m = bpy.data.materials.new("Card_" + char); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); it = nt.nodes.new("ShaderNodeTexImage"); it.image = bpy.data.images.load(os.path.join(CARDS, char + ".png"))
    it.interpolation = "Cubic"
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    if mirror: mp.inputs["Scale"].default_value = (-1, 1, 1); mp.inputs["Location"].default_value = (1, 0, 0)
    L(tc.outputs["UV"], mp.inputs[0]); L(mp.outputs[0], it.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs[1].default_value = 1.0; L(it.outputs[0], em.inputs[0])
    pb = nt.nodes.new("ShaderNodeBsdfPrincipled"); pb.inputs["Roughness"].default_value = 0.8; L(it.outputs[0], pb.inputs["Base Color"])
    half = nt.nodes.new("ShaderNodeMixShader"); half.inputs[0].default_value = 0.5; L(pb.outputs[0], half.inputs[1]); L(em.outputs[0], half.inputs[2])
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    L(it.outputs[1], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(half.outputs[0], mx.inputs[2]); L(mx.outputs[0], out.inputs[0])
    try: m.surface_render_method = "DITHERED"
    except Exception: pass
    W, H = 1200 * MPX, 2000 * MPX; z0 = -(2000 - 1950) * MPX
    o = card_plane("Card_" + char, m, W, H, loc, z0=z0)
    c = o.constraints.new("LOCKED_TRACK"); c.target = cam; c.track_axis = "TRACK_NEGATIVE_Y"; c.lock_axis = "LOCK_Z"
    COUNT["character"] = COUNT.get("character", 0) + 1
    return o

def wire(p0, p1, sag=0.6, r=0.012):
    cu = bpy.data.curves.new("wire", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = r; cu.bevel_resolution = 1
    sp = cu.splines.new("POLY"); n = 16; sp.points.add(n - 1); a, b = Vector(p0), Vector(p1)
    for i in range(n):
        t = i / (n - 1); p = a.lerp(b, t); p.z -= sag * 4 * t * (1 - t); sp.points[i].co = (*p, 1)
    cu.materials.append(M["wire"]); o = bpy.data.objects.new("Wire", cu); COLL.objects.link(o); COUNT["wire"] = COUNT.get("wire", 0) + 1; return o

def ground(img, size, tile=None):
    me = bpy.data.meshes.new("Ground"); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=60, y_segments=60, size=size / 2)
    for v in bm.verts: v.co.z = 0.25 * math.sin(v.co.x * 0.05) * math.cos(v.co.y * 0.04) - (0.0 if abs(v.co.y) < 120 else 0.0)
    bm.to_mesh(me); bm.free()
    m = toon("Ground_" + img, (235, 240, 245), (62, 66, 98), img=img, scale=1.0 / (tile or size), flat=True, gain=1.35)
    if not tile:  # one painted sheet over the whole ground: object coords -size/2..size/2 -> 0..1
        mp = [n for n in m.node_tree.nodes if n.type == "MAPPING"][0]; mp.inputs["Location"].default_value = (0.5, 0.5, 0)
    me.materials.append(m); o = bpy.data.objects.new("Ground", me); COLL.objects.link(o); return o

# ---------------------------------------------------------------- camera
def camera(loc, look_at, lens=24, focus=None, fstop=2.8):
    cd = bpy.data.cameras.new("Cam"); cd.lens = lens; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 24; cd.clip_end = 20000; cd.clip_start = 0.1
    o = bpy.data.objects.new("Cam", cd); SC.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(look_at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); SC.camera = o
    if focus:
        cd.dof.use_dof = True; cd.dof.focus_distance = focus; cd.dof.aperture_fstop = fstop
    return o

def from_cam(cam, az_deg, el_deg, dist):
    """world point at azimuth/elevation (deg) relative to the camera's horizontal view direction."""
    f = cam.matrix_world.to_3x3() @ Vector((0, 0, -1)); yaw = math.atan2(f.y, f.x) + math.radians(az_deg)
    el = math.radians(el_deg); return Vector(cam.location) + Vector((math.cos(yaw) * math.cos(el), math.sin(yaw) * math.cos(el), math.sin(el))) * dist

# ================================================================ LOCATION: AIRFIELD (Soviet side, the 588th's field)
def build_airfield():
    cam = camera((1.8, -2.0, 1.3), (-1.2, 12.0, 0.05), lens=20, focus=4.2, fstop=5.6)
    bpy.context.view_layer.update()
    sky(from_cam(cam, -7, 17.5, 1) - cam.location)
    ground("grass_tile2.png" if SOFT else "grass_tile.png", 240, tile=12)
    # hero Po-2, parked 3/4 to camera, nose to camera-left; pilot in the front cockpit
    po = aircraft.make_po2("Po2", outline=False); po.location = (-1.4, 8.6, 0.05); po.rotation_euler = (0.07, 0, math.radians(140))
    COUNT["Po-2"] = 1
    for k, (loc, rz) in enumerate([((9.5, 34, 0.05), 200), ((-12, 46, 0.05), 160)]):
        p2 = aircraft.make_po2("Po2_%d" % k, outline=False); p2.location = loc; p2.rotation_euler = (0.07, 0, math.radians(rz)); COUNT["Po-2"] += 1
    bpy.context.view_layer.update()
    seat = bpy.data.objects["Po2_seat_front"].matrix_world.translation
    card("pilot", (seat.x, seat.y, seat.z - 0.55), cam, light=(0.78, 0.82, 1.0))
    card("crew", (1.55, 2.2, 0), cam, light=(1.0, 0.86, 0.72), k=1.05)
    card("nav", (3.9, 7.4, 0.02), cam, light=(0.95, 0.80, 0.66), k=0.95, mirror=True)
    # foreground: bomb cart with 4 bombs (left), crate stack + lantern + vase + cat (right), near-lens tufts
    place(P["bombcart"], (-0.15, 2.0, 0), rz=0.9)
    for i in range(4): place(P["bomb"], (-0.15 + 0.22 * (i % 2) - 0.11, 2.0 + 0.05 * (i // 2), 0.58 + (i // 2) * 0.2), rz=0.9, kind="bomb")
    for i, (x, y) in enumerate([(-0.6, 2.2), (-0.9, 2.7), (-0.3, 2.9)]): place(P["bomb"], (x, y, 0.1), rz=0.4 + i * 0.1)
    place(P["crate"], (2.55, 1.2, 0), rz=0.2); place(P["crate"], (2.75, 2.0, 0), rz=-0.1); place(P["crate"], (2.6, 1.45, 0.5), rz=0.35, s=0.85)
    place(P["vase"], (2.4, 1.4, 0.93)); place(P["cat"], (2.75, 1.4, 0.93), rz=2.6)
    place(P["lantern"], (2.2, 2.7, 0), rz=0); point((2.2, 2.7, 1.06), (1.0, 0.62, 0.3), 70, 0.1)
    place(P["phone"], (2.95, 2.1, 0.5), rz=0.4)
    place(P["shovel"], (-0.4, 3.6, 0), rz=0.3, ry=0.25)
    for i in range(0 if SOFT else 260):
        x, y = R.uniform(-2.5, 4.5), R.uniform(-0.6, 9.0)
        if abs(x - 1.55) < 0.45 and abs(y - 2.2) < 0.4: continue
        place(P["tuft"], (x, y, 0), rz=R.uniform(0, 6.28), s=R.uniform(0.5, 1.0), ink=True, t=0.01, kind="grass tuft")
    for i in range(9):  # sandbag blast-wall stub, bottom right (third depth layer)
        place(P["sandbag"], (2.2 + (i % 3) * 0.55, 1.0 + (i % 3) * 0.12, (i // 3) * 0.19), rz=0.3 + (0.3 if i % 2 else 0), kind="sandbag")
    place(P["bucket"], (0.9, 3.3, 0), kind="bucket"); place(P["jerry"], (0.4, 3.0, 0), rz=0.7, kind="jerrycan")
    for i in range(30):  # ground scatter in the frame's bottom band (DENSITY LAW: no bare surface)
        place(P["pebbles"], (R.uniform(-1.0, 3.6), R.uniform(-0.3, 4.0), 0), rz=R.uniform(0, 6), s=R.uniform(0.45, 0.85), kind="pebbles", t=0.005)
    place(P["crateL"], (1.55, 0.7, 0), rz=0.25, s=0.7, kind="bomb crate")
    for i in range(0 if SOFT else 14): place(P["tuft"], (R.uniform(1.4, 2.6), R.uniform(-0.6, 0.4), 0), rz=R.uniform(0, 6), s=R.uniform(0.5, 0.9), t=0.01, kind="grass tuft")
    place(P["lantern"], (2.0, 0.85, -0.2), s=0.6, kind="lantern"); point((2.0, 0.6, 0.5), (1.0, 0.62, 0.3), 30, 0.08)   # hand lamp on the near crate   # near-lens, out of focus (front depth layer)
    if SOFT:  # blade-grass carpet in the near field (fine pass): many small tufts instead of a few big cones
        for i in range(380):   # blades from 1.2 m out: near-lens blades read as pixel noise (measured: hf_surface 0.51)
            x, y = R.uniform(-2.2, 4.4), R.uniform(1.2, 7.0)
            if abs(x - 1.55) < 0.3 and abs(y - 2.2) < 0.25: continue
            place(P["tuft"], (x, y, 0), rz=R.uniform(0, 6.28), s=R.uniform(0.6, 1.3), kind="grass tuft")
        atmosphere(cam, vol=((0, 33, 3.5), (50, 54, 12), 0.02))
        point((1.0, -0.3, 0.7), (1.0, 0.62, 0.3), 45, 0.6)
        # near foreground (big, smooth, inked shapes - fills the bottom without pixel noise): a folded tarpaulin
        # with two spare FAB-50s and a coil of bomb-hoist rope, the armourers' kit laid out for the next sortie
        tme = bpy.data.meshes.new("tarp"); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=28, y_segments=18, size=1.0)
        for v in bm.verts:
            v.co.x *= 1.3; v.co.y *= 0.8; v.co.z = 0.05 * math.sin(v.co.x * 5.2 + 1.3 * v.co.y) + 0.03 * math.sin(v.co.y * 9.0 + 2.2 * v.co.x) + 0.012 * math.sin(v.co.x * 17 - v.co.y * 11) + 0.13
        bm.to_mesh(tme); bm.free(); tme.materials.append(M["tarp"])
        for p in tme.polygons: p.use_smooth = True
        place(tme, (1.05, 0.15, 0), rz=0.18, kind="tarpaulin", t=0.012)
        place(P["bomb"], (0.55, 0.25, 0.16), rz=1.35, kind="bomb"); place(P["bomb"], (1.25, 0.0, 0.16), rz=1.25, kind="bomb")
        rc = MB("rope", [M["sand"]])
        for k in range(5): bk_torus(rc, (0, 0, 0.03 + 0.035 * k), 0.24 - 0.012 * k, 0.022, 0)
        place(rc.mesh(), (2.25, 0.05, 0), kind="rope coil", t=0.01)   # lamp spill on the near grass (from the crate lamp, off-frame left)   # volume starts ~9 m out: near stays crisp, distance lifts
    for x in (() if SOFT else (0.5, 1.2, 2.0)):  # near-lens blurred tufts (bottom of frame)
        place(P["tuft"], (x, -0.2, -0.05), rz=R.uniform(0, 6), s=0.8, kind="grass tuft")
    # flare-path lanterns: two rows converging (practical lights)
    for i in range(12):
        y = 2 + i * 6.0
        for x in (-7.5, 7.5):
            if x < 0 and y < 12: continue
            place(P["lantern"], (x + R.uniform(-0.3, 0.3), y, 0), kind="lantern")
            if i < 6: point((x, y, 1.06), (1.0, 0.6, 0.28), 90, 0.1)
    # mid-ground: armourers' kit (clusters of three)
    cluster3(lambda c, rz, s: place(P["drum"], c, rz=rz, s=s, kind="fuel drum"), (4.6, 6.0))
    cluster3(lambda c, rz, s: place(P["drumR"], c, rz=rz, s=s, kind="fuel drum"), (6.0, 11.0))
    place(P["drumLying"], (5.4, 7.6, 0), rz=0.9)
    cluster3(lambda c, rz, s: place(P["crateL"], c, rz=rz, s=s, kind="bomb crate"), (-5.8, 4.0), spread=1.6)
    for i in range(6): place(P["bomb"], (-6.4 + i * 0.28, 6.2, 0.1), rz=1.57, kind="bomb")
    place(P["chalkboard"], (2.6, 5.0, 0), rz=-0.35)
    place(P["bench"], (3.9, 7.6, 0), rz=0.2); place(P["table"], (4.6, 12.5, 0), rz=-0.3)
    place(P["bike"], (-2.6, 5.2, 0), rz=1.1, ry=0.22)
    place(P["ladder"], (-0.6, 7.0, 0), rz=2.3)
    cluster3(lambda c, rz, s: place(P["jerry"], c, rz=rz, s=s, kind="jerrycan"), (3.6, 7.2), spread=0.6)
    cluster3(lambda c, rz, s: place(P["bucket"], c, rz=rz, s=s, kind="bucket"), (-3.0, 11.0), spread=0.6)
    place(P["dugout"], (7.5, 17.0, 0), rz=-0.5); point((7.2, 16.0, 0.8), (1.0, 0.6, 0.3), 120, 0.3)
    for i in range(3): place(P["tent"], (-9.0 + i * 5.2, 22.0 + i * 1.5, 0), rz=R.uniform(-0.3, 0.3), kind="tent")
    place(P["laundry"], (-3.5, 15.5, 0), rz=0.25)
    place(P["windsock"], (11.0, 24.0, 0), rz=0.3)
    place(P["truck"], (-14.0, 30.0, 0), rz=0.8); place(P["truck"], (15.0, 46.0, 0), rz=-1.1)
    for i in range(8):
        place(P["pole"], (-18 + i * 6.5, 58 + (i % 2), 0), rz=0.05, kind="telegraph pole")
        if i: wire((-18 + (i - 1) * 6.5 - 0.7, 58 + ((i - 1) % 2), 6.72), (-18 + i * 6.5 - 0.7, 58 + (i % 2), 6.72), 0.5); wire((-18 + (i - 1) * 6.5 + 0.7, 58 + ((i - 1) % 2), 6.72), (-18 + i * 6.5 + 0.7, 58 + (i % 2), 6.72), 0.55)
    for i in range(34):
        place(P["bush"], (R.uniform(-30, 30), R.uniform(26, 62), 0), rz=R.uniform(0, 6), s=R.uniform(0.8, 1.8), kind="bush")
    # tree line (fills the horizon band) - deciduous + pines, 3 depths
    for i in range(140):
        a = R.uniform(-0.75, 0.75); d = R.uniform(70, 110); x, y = d * math.sin(a) - 5, d * math.cos(a) + 0
        place(P["tree"] if i % 3 else P["pine"], (x, y, 0), rz=R.uniform(0, 6), s=R.uniform(1.0, 1.8), kind="tree", t=0.08)
    for i in range(60):
        a = R.uniform(-0.8, 0.8); d = R.uniform(150, 220); place(P["pine"], (d * math.sin(a), d * math.cos(a), 0), s=R.uniform(2.0, 3.2), kind="tree", t=0.15)
    # sky: clouds banked around the moon, cirrus, a formation of tiny Po-2s heading out (story beat)
    for i, (az, el, d, w) in enumerate([(-22, 21, 900, 420), (9, 24, 1100, 560), (-3, 12.5, 800, 300), (19, 16, 950, 380), (-17, 9.5, 700, 280), (13, 8.5, 650, 240), (2, 28, 1300, 700), (-25, 15, 1000, 300)]):
        cloud(from_cam(cam, az, el, d), w, w * 0.32, n=16, seed=i + 3)
    cirrus_band(from_cam(cam, 0, 19, 2500), 2600, 900, cam.location)
    for k, (az, el) in enumerate([(3, 18.5), (5.5, 19.3), (8, 20.0)]):
        p = aircraft.make_po2("Po2_sky%d" % k, outline=False); p.location = from_cam(cam, az, el, 260); p.rotation_euler = (0.1, 0.1, math.radians(-120)); COUNT["Po-2"] += 1
    return cam

# ================================================================ LOCATION: CAMP (the German camp under the searchlights)
def build_camp():
    cam = camera((-0.4, -6.5, 1.15), (0.6, 30.0, 1.4), lens=20, focus=4.4, fstop=5.6)
    bpy.context.view_layer.update()
    sky(from_cam(cam, 10, 13.5, 1) - cam.location)
    ground("mud_tile2.png" if SOFT else "mud_tile.png", 320, tile=10)
    card("sentry_up", (0.55, -2.2, 0), cam, light=(0.86, 0.84, 0.96), k=1.0)
    # sentry post: sandbag ring around him (near), rifle stack, phone, lantern, bucket of soup over a fire (humour)
    for i in range(26):
        a = math.radians(-60 + i * 9.5); r = 2.0
        for row in range(3):
            place(P["sandbag"], (0.85 + r * math.cos(a) * (1 + 0.02 * row), -0.6 + r * math.sin(a) * 0.6, row * 0.19), rz=a + math.pi / 2 + (0.2 if row % 2 else 0), kind="sandbag")
    for i in range(20):  # sandbag wall on the left, close to lens (blurred depth layer)
        for row in range(3):
            place(P["sandbag"], (-2.2 + (i % 10) * 0.66 * 0.0 - 0.1 * row, -4.6 + i * 0.45, row * 0.19), rz=1.57 + (0.25 if (i + row) % 2 else -0.1), kind="sandbag")
    place(P["rifles"], (1.7, -1.2, 0)); place(P["crate"], (-1.0, -1.4, 0), rz=0.2); place(P["phone"], (-1.0, -1.4, 0.5), rz=0.3)
    for i in range(3): place(P["duckboard"], (-0.2 + i * 0.25, -4.4 + i * 2.35, 0), rz=0.1 - i * 0.05, kind="duckboard")
    for i in range(40): place(P["pebbles"], (R.uniform(-1.8, 2.6), R.uniform(-5.0, -0.5), 0), rz=R.uniform(0, 6), s=R.uniform(0.45, 0.85), kind="pebbles", t=0.005)
    place(P["bucket"], (1.6, -3.6, 0), kind="bucket"); place(P["shovel"], (-1.2, -3.2, 0), rz=0.4, ry=0.3); place(P["jerry"], (1.2, -4.2, 0), rz=0.5, kind="jerrycan")
    place(P["lantern"], (2.6, -2.4, 0)); point((2.6, -2.4, 1.06), (1.0, 0.6, 0.3), 70, 0.1)
    place(P["fire"], (3.4, 1.8, 0)); place(P["bucket"], (3.4, 1.8, 0.55)); point((3.4, 1.8, 0.7), (1.0, 0.5, 0.18), 260, 0.3)
    place(P["laundry"], (4.8, 4.2, 0), rz=-0.6)
    for i in range(50):
        x, y = R.uniform(-4, 6), R.uniform(-6.2, 6)
        place(P["tuft"], (x, y, 0), rz=R.uniform(0, 6), s=R.uniform(0.6, 1.2), t=0.012, kind="grass tuft")
    if SOFT:
        for i in range(110):   # a trampled camp: sparse grass only along the edges (blades = measured surface noise)
            x, y = R.uniform(-3, 5), R.uniform(-2.5, 8)
            if -0.6 < x < 0.9 and y < 2: continue   # keep the duckboard path clear
            place(P["tuft"], (x, y, 0), rz=R.uniform(0, 6), s=R.uniform(0.5, 1.1), kind="grass tuft")
        atmosphere(cam, vol=((0, 38, 5), (60, 56, 14), 0.02))
        place(P["lantern"], (-0.95, -4.3, 0), s=0.55, kind="lantern"); point((-0.85, -4.5, 0.45), (1.0, 0.6, 0.28), 22, 0.1)
        place(P["lantern"], (1.75, -4.0, 0), s=0.55, kind="lantern"); point((1.65, -4.2, 0.45), (1.0, 0.6, 0.28), 18, 0.1)
    # tent rows (grid), keeping the sentry's sight line clear
    for row in range(5):
        for col in range(7):
            x = -16 + col * 5.6 + (row % 2) * 2.4; y = 10 + row * 7.5
            if -3 < x < 4 and y < 25: continue
            place(P["tentG"] if (row + col) % 3 else P["tent"], (x, y, 0), rz=R.uniform(-0.15, 0.15), kind="tent")
    for i, (x, y, rz) in enumerate([(-7, 8, 0.6), (9, 14, -0.4), (-12, 30, 1.2), (12, 34, 0.2)]):
        place(P["truckG"], (x, y, 0), rz=rz, kind="truck")
    for i, (x, y, rz) in enumerate([(6.5, 22, -0.3), (-9, 20, 0.4)]): place(P["gun"], (x, y, 0), rz=rz, kind="field gun")
    for (x, y) in [(-22, 44), (20, 52)]:
        place(P["flak"], (x, y, 0), rz=R.uniform(0, 6), kind="flak gun")
        for i in range(16):
            a = i * math.tau / 16; place(P["sandbag"], (x + 5 * math.cos(a), y + 5 * math.sin(a), 0), rz=a + 1.57, s=1.6, kind="sandbag")
    cluster3(lambda c, rz, s: place(P["drum"], c, rz=rz, s=s, kind="fuel drum"), (-4.5, 6.0))
    cluster3(lambda c, rz, s: place(P["drumR"], c, rz=rz, s=s, kind="fuel drum"), (6.5, 9.5))
    cluster3(lambda c, rz, s: place(P["crateL"], c, rz=rz, s=s, kind="ammo crate"), (-2.5, 12.0), spread=1.6)
    cluster3(lambda c, rz, s: place(P["jerry"], c, rz=rz, s=s, kind="jerrycan"), (2.8, 8.0), spread=0.6)
    for i in range(4): place(P["bench"], (-6 + i * 3.6, 16 + (i % 2) * 2, 0), rz=R.uniform(-0.4, 0.4), kind="bench")
    place(P["table"], (1.0, 15.0, 0), rz=0.3); place(P["bike"], (-1.8, 9.0, 0), rz=0.6, ry=0.2)
    # fires through the camp (practical lights) + smoke columns
    for i, (x, y) in enumerate([(-8, 12), (5, 18), (-3, 27), (10, 28), (-14, 38), (2, 40), (15, 42)]):
        place(P["fire"], (x, y, 0), s=1.2, kind="campfire")
        if i % 2: place(P["smoke"], (x, y, 0.6), s=0.55 + 0.05 * i, kind="smoke", t=0.03)
        if i < 5: point((x, y, 0.9), (1.0, 0.5, 0.18), 400, 0.4)
    # searchlights + beams crossing the sky
    for (x, y, az, el) in [(-11, 26, 28, 52), (9, 31, -22, 58), (-2, 50, 6, 70)]:
        place(P["searchlight"], (x, y, 0), rz=math.radians(-az), kind="searchlight")
        b = bpy.data.meshes.new("beam"); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=24, radius1=0.6, radius2=22, depth=420)
        bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, 210)); bm.to_mesh(b); bm.free(); b.materials.append(M["beam"])
        o = bpy.data.objects.new("Beam", b); COLL.objects.link(o); o.location = (x, y, 1.6)
        d = Vector((math.sin(math.radians(az)) * math.cos(math.radians(el)), math.cos(math.radians(az)) * math.cos(math.radians(el)), math.sin(math.radians(el))))
        o.rotation_euler = d.to_track_quat("Z", "Y").to_euler(); COUNT["beam"] = COUNT.get("beam", 0) + 1
    # telegraph poles + sagging wires across the frame (fills sky cells)
    pts = [(-14, 4), (-6, 6), (2, 8), (10, 10), (18, 12)]
    for i, (x, y) in enumerate(pts):
        place(P["pole"], (x, y, 0), rz=0.25, kind="telegraph pole")
        if i:
            px, py = pts[i - 1]
            for dx in (-0.7, -0.25, 0.25, 0.7): wire((px + dx, py, 6.72), (x + dx, y, 6.72), 0.6)
    for i in range(40): place(P["bush"], (R.uniform(-40, 40), R.uniform(30, 70), 0), rz=R.uniform(0, 6), s=R.uniform(0.8, 1.8), kind="bush")
    for i in range(130):
        a = R.uniform(-0.8, 0.8); d = R.uniform(75, 120); place(P["tree"] if i % 3 else P["pine"], (d * math.sin(a), d * math.cos(a), 0), rz=R.uniform(0, 6), s=R.uniform(1.0, 1.8), kind="tree", t=0.08)
    for i in range(50):
        a = R.uniform(-0.8, 0.8); d = R.uniform(160, 230); place(P["pine"], (d * math.sin(a), d * math.cos(a), 0), s=R.uniform(2, 3.2), kind="tree", t=0.15)
    # sky: clouds, cirrus, flak bursts, the Po-2 gliding in with its engine off (story beat)
    for i, (az, el, d, w) in enumerate([(-20, 17, 950, 420), (14, 19, 1100, 520), (-6, 10.5, 800, 280), (22, 9.5, 900, 300), (-18, 6.0, 700, 240), (-14, 30, 1300, 620), (12, 31, 1300, 620), (0, 35, 1500, 700), (-17, 28, 1200, 600)]):
        cloud(from_cam(cam, az, el, d), w, w * 0.32, n=16, seed=i + 11)
    cirrus_band(from_cam(cam, 0, 15, 2500), 2600, 700, cam.location)
    for i in range(14):
        c = from_cam(cam, R.uniform(-14, 14), R.uniform(12, 24), R.uniform(300, 420)); mb = MB("flak", [M["flak"]])
        for k in range(5): mb.ico((R.uniform(-3, 3), R.uniform(-3, 3), R.uniform(-2, 2)), R.uniform(1.8, 3.2), 0, 1)
        o = bpy.data.objects.new("FlakBurst", mb.mesh()); COLL.objects.link(o); o.location = c; hull_ink(o, 0.4); COUNT["flak burst"] = COUNT.get("flak burst", 0) + 1
    p = aircraft.make_po2("Po2_glide", outline=False); p.location = from_cam(cam, 3.5, 17.0, 120); p.rotation_euler = (-0.12, 0.25, math.radians(150)); COUNT["Po-2"] = 1
    return cam

# ================================================================ run
t0 = time.time(); mats(); protos()
cam = build_airfield() if LOC == "airfield" else build_camp()
upgrade_aircraft()
bpy.context.view_layer.update()
t_build = time.time() - t0
os.makedirs(OUT, exist_ok=True)
TAG = "_v3"
raw = os.path.join(OUT, "%s%s_raw.png" % (LOC, TAG))
SC.render.filepath = raw; SC.render.image_settings.file_format = "PNG"
t1 = time.time(); bpy.ops.render.render(write_still=True); t_render = time.time() - t1
tris = 0
dg = bpy.context.evaluated_depsgraph_get()
for o in SC.objects:
    if o.type == "MESH":
        try: tris += sum(len(p.vertices) - 2 for p in o.evaluated_get(dg).data.polygons)
        except Exception: pass
info = {"loc": LOC, "build_s": round(t_build, 1), "render_s": round(t_render, 1), "samples": SAMPLES, "res": [SC.render.resolution_x * RES // 100, SC.render.resolution_y * RES // 100],
        "objects": len(SC.objects), "triangles_approx": tris, "prop_counts": COUNT,
        "prop_types": len([k for k in COUNT if k not in ("character", "wire", "beam", "cloud")]), "instances": sum(v for k, v in COUNT.items() if k not in ("character", "cloud"))}
json.dump(info, open(os.path.join(OUT, "%s%s_info.json" % (LOC, TAG)), "w"), indent=1)
print("DENSITY_INFO", json.dumps(info))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "%s%s.blend" % (LOC, TAG)))
