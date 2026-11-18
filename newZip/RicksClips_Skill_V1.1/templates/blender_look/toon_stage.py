"""Stage A look: the finished toon style (round-2 airfield) as a reusable module.
get_toon(name, color, ...) = soft 3-tone ramp x light hue, warm additive pools, AO contact shadow, painted texture, noise variation, distance haze.
Inverted-hull ink on every prop. Stage A of the workflow."""
import bpy, os, math
from . import materials as RM
HERE = os.path.dirname(os.path.abspath(__file__)); TEX = os.path.join(HERE, "tex")
# library name -> (painted image, texture scale, flat projection)
PAINT = {"cobble": ("cobble_tile.png", .2, True), "turf": ("grass_tile2.png", 1 / 12, True), "plaster": ("plaster_tile.png", .22, False), "brick": ("brick_tile.png", .3, False), "roof_tile": ("roof_tile.png", .25, False), "straw": ("straw_tile.png", .4, False), "water": ("water_tile.png", .08, True), "canvas": ("canvas.png", .35, False), "tarp": ("canvas.png", .35, False), "burlap": ("burlap.png", 2.0, False), "wood_grain": ("planks.png", 1.4, False), "tar_wood": ("deck_tile.png", .3, False), "rope": ("burlap.png", 4.0, False), "dirt": ("mud_tile2.png", .1, True)}
RIM = (190, 215, 255)
_c = {}; _im = {}
def _img(n):
    if n not in _im:
        p = os.path.join(TEX, n)
        if not os.path.exists(p): p = os.path.join(RM.STATE["tex"], n)
        _im[n] = bpy.data.images.load(p, check_existing=True)
    return _im[n]
def _mix(nt, a, b):
    m = nt.nodes.new("ShaderNodeMix"); m.data_type = "RGBA"; m.blend_type = "MULTIPLY"; m.inputs[0].default_value = 1; nt.links.new(a, m.inputs[6]); nt.links.new(b, m.inputs[7]); return m.outputs[2]
def _scale(nt, a, f):
    v = nt.nodes.new("ShaderNodeVectorMath"); v.operation = "SCALE"; nt.links.new(a, v.inputs[0])
    if isinstance(f, (int, float)): v.inputs[3].default_value = f
    else: nt.links.new(f, v.inputs[3])
    return v.outputs[0]
def get_toon(name, color=None, rim=False, tip=False):
    key = (name, color, rim, tip)
    if key in _c: return _c[key]
    col = color or RM.LIB[name]["color"]; lit = RM.lin(col); shade = tuple(x * c for x, c in zip(lit, (.3, .34, .5))); mid = tuple(a * .55 + b * .45 for a, b in zip(lit, shade)); paint = PAINT.get(name)
    m = bpy.data.materials.new("T_%s_%d" % (name, len(_c))); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission"); d = nt.nodes.new("ShaderNodeBsdfDiffuse"); s = nt.nodes.new("ShaderNodeShaderToRGB"); L(d.outputs[0], s.inputs[0]); bw = nt.nodes.new("ShaderNodeRGBToBW"); L(s.outputs[0], bw.inputs[0])
    r = nt.nodes.new("ShaderNodeValToRGB"); c = r.color_ramp; c.interpolation = "EASE"; c.elements[0].position = 0; c.elements[0].color = (*shade, 1); c.elements[1].position = .06; c.elements[1].color = (*mid, 1); c.elements.new(.035).color = (*shade, 1); c.elements.new(.17).color = (*mid, 1); c.elements.new(.24).color = (*lit, 1); L(bw.outputs[0], r.inputs[0])
    a = nt.nodes.new("ShaderNodeVectorMath"); a.operation = "ADD"; a.inputs[1].default_value = (.04,) * 3; L(s.outputs[0], a.inputs[0]); k = nt.nodes.new("ShaderNodeMath"); k.operation = "ADD"; k.inputs[1].default_value = .04; L(bw.outputs[0], k.inputs[0]); x = nt.nodes.new("ShaderNodeCombineXYZ"); [L(k.outputs[0], x.inputs[i]) for i in range(3)]
    dv = nt.nodes.new("ShaderNodeVectorMath"); dv.operation = "DIVIDE"; L(a.outputs[0], dv.inputs[0]); L(x.outputs[0], dv.inputs[1]); mn = nt.nodes.new("ShaderNodeVectorMath"); mn.operation = "MINIMUM"; mn.inputs[1].default_value = (1.7,) * 3; L(dv.outputs[0], mn.inputs[0])
    col_s = _mix(nt, r.outputs[0], mn.outputs[0])
    tc = nt.nodes.new("ShaderNodeTexCoord").outputs["Object"]
    if paint:
        mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (paint[1],) * 3; L(tc, mp.inputs[0]); it = nt.nodes.new("ShaderNodeTexImage"); it.image = _img(paint[0]); it.interpolation = "Cubic"
        if not paint[2]: it.projection = "BOX"; it.projection_blend = .25
        L(mp.outputs[0], it.inputs[0]); col_s = _scale(nt, _mix(nt, col_s, it.outputs[0]), 2.0)
    w = nt.nodes.new("ShaderNodeVectorMath"); w.operation = "MULTIPLY"; w.inputs[1].default_value = lit; L(_scale(nt, s.outputs[0], .22), w.inputs[0]); ad = nt.nodes.new("ShaderNodeVectorMath"); ad.operation = "ADD"; L(col_s, ad.inputs[0]); L(w.outputs[0], ad.inputs[1]); out_c = ad.outputs[0]     # warm pools fall off smoothly
    ao = nt.nodes.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value = .5; ao.samples = 8; rr = nt.nodes.new("ShaderNodeMapRange"); rr.inputs[3].default_value = .5; rr.inputs[4].default_value = 1; L(ao.outputs["AO"], rr.inputs[0]); out_c = _scale(nt, out_c, rr.outputs[0])
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 2.2; n.inputs["Detail"].default_value = 3; L(tc, n.inputs[0]); nr = nt.nodes.new("ShaderNodeMapRange"); nr.inputs[3].default_value = .86; nr.inputs[4].default_value = 1.12; L(n.outputs[0], nr.inputs[0]); out_c = _scale(nt, out_c, nr.outputs[0])
    if tip:
        g = nt.nodes.new("ShaderNodeTexCoord"); z = nt.nodes.new("ShaderNodeSeparateXYZ"); L(g.outputs["Generated"], z.inputs[0]); tr = nt.nodes.new("ShaderNodeMapRange"); tr.inputs[3].default_value = .7; tr.inputs[4].default_value = 1.35; L(z.outputs[2], tr.inputs[0]); out_c = _scale(nt, out_c, tr.outputs[0]); m.use_backface_culling = False
    if rim:
        lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs[0].default_value = .5; gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = .86; L(lw.outputs["Facing"], gt.inputs[0]); rc = nt.nodes.new("ShaderNodeRGB"); rc.outputs[0].default_value = (*RM.lin(RIM), 1); mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; L(gt.outputs[0], mx.inputs[0]); L(out_c, mx.inputs[6]); L(rc.outputs[0], mx.inputs[7]); out_c = mx.outputs[2]
    S_ = RM.STATE; cd = nt.nodes.new("ShaderNodeCameraData"); mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs[1].default_value = S_["haze_start"]; mr.inputs[2].default_value = S_["haze_start"] + S_["haze_depth"]; mr.inputs[3].default_value = 0; mr.inputs[4].default_value = S_["haze_max"]; L(cd.outputs["View Distance"], mr.inputs[0]); hc = nt.nodes.new("ShaderNodeRGB"); hc.outputs[0].default_value = (*S_["haze"], 1); mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; L(mr.outputs[0], mx.inputs[0]); L(out_c, mx.inputs[6]); L(hc.outputs[0], mx.inputs[7])
    L(mx.outputs[2], em.inputs[0]); L(em.outputs[0], out.inputs[0]); _c[key] = m; return m
INK = None
def ink_mat():
    global INK
    if not INK:
        INK = bpy.data.materials.new("HullInk"); INK.use_nodes = True; nt = INK.node_tree; nt.nodes.clear(); o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (.0035, .003, .004, 1); nt.links.new(e.outputs[0], o.inputs[0]); INK.use_backface_culling = True
    return INK
def hull(o, t):
    if ink_mat().name not in [s.name for s in o.data.materials if s]: o.data.materials.append(ink_mat())
    s = o.modifiers.new("Ink", "SOLIDIFY"); s.thickness = max(.004, min(t, 1.0)); s.offset = 1; s.use_flip_normals = True; s.use_rim = False; s.material_offset = 50
