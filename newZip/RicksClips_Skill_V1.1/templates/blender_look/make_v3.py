"""Generates build_density_v3.py from build_density.py (v2 stays untouched).
Round 3 = SKILL.md "3D WORLD STYLE" (CB 2026-11-08: "try these 2 with blender material effects"):
procedural stylised-PBR world, no world ink, toon.ts cards half self-lit, raytraced reflections, hard moon, god rays."""
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
s = open("build_density.py", encoding="utf-8").read()
def rep(a, b, c=1):
    global s
    assert s.count(a) == c, (a[:80], s.count(a)); s = s.replace(a, b)

PBR = open("pbr_v3.txt", encoding="utf-8").read()
rep('INK = None\ndef ink_mat():', PBR + '\nINK = None\ndef ink_mat():')
rep('''    if name in bpy.data.materials: return bpy.data.materials[name]
    lit = lin(lit); shade = lin(shade) if shade else tuple(x * 0.32 for x in lit)''',
'''    if name in bpy.data.materials: return bpy.data.materials[name]
    if name not in TOON_KEEP: return pbr(name, lit, img, scale, flat, gain)
    lit = lin(lit); shade = lin(shade) if shade else tuple(x * 0.32 for x in lit)''')
# no ink on the world
rep('''    """inverted hull: solidify outward, flipped normals, back-face culled near-black (ink slot = last, offset clamps)."""
''', '''    return  # 3D WORLD STYLE: no ink on the world; the only ink is on the character cards
''')
rep('outline=True', 'outline=False', 3)
# smooth + real bevels
rep('''        for p in me.polygons: p.use_smooth = False
        return me''', '''        for p in me.polygons: p.use_smooth = True
        me.set_sharp_from_angle(angle=math.radians(50))
        return me''')
rep('''    k = kind or me.name; COUNT[k] = COUNT.get(k, 0) + 1
    return o''', '''    if me.name in BEVEL and (Vector(loc) - SC.camera.location).length < 25:
        b = o.modifiers.new("Bevel", "BEVEL"); b.width = 0.01; b.segments = 1; b.limit_method = "ANGLE"; b.angle_limit = math.radians(40)
    k = kind or me.name; COUNT[k] = COUNT.get(k, 0) + 1
    return o''')
# blade: PBR version
rep('''    m = toon("Blade", (96, 128, 120), (36, 52, 66))   # low-contrast against the turf: texture, not noise
''', '''    return toon("Blade", (70, 118, 92))
    m = None
''')
# sagging canvas tents, more tree detail, glass lanterns
rep('tb.cyl((0, 0, 1.2), 2.2, 2.4, 0, 4, r2=0.02, rot=(0, 0, math.pi / 4))', 'sag_pyr(tb, 2.2, 2.4, 0)')
rep('tg.cyl((0, 0, 1.1), 2.0, 2.2, 0, 4, r2=0.02, rot=(0, 0, math.pi / 4))', 'sag_pyr(tg, 2.0, 2.2, 0)')
rep('R.uniform(1.4, 2.3), 1 + (i % 2), 1)', 'R.uniform(1.4, 2.3), 1 + (i % 2), 2)')
rep('''MB("lantern", [M["wood"], M["metal"], M["lamp"]])''', '''MB("lantern", [M["wood"], M["metal"], M["lamp"], M["glass"]])''')
rep('.cyl((0, 0, 1.06), 0.07, 0.18, 2, 10)', '.cyl((0, 0, 1.06), 0.035, 0.12, 2, 10).cyl((0, 0, 1.06), 0.07, 0.18, 3, 16)')
rep('''    M["lamp"] = glow("LanternGlow", (255, 190, 100), 14)''', '''    M["glass"] = glass_mat()
    M["tarp"] = toon("Tarp", (112, 122, 100))
    M["lamp"] = glow("LanternGlow", (255, 190, 100), 30)''')
rep('tme.materials.append(M["canvas"])', 'tme.materials.append(M["tarp"])')
# cool painted sky, cooler clouds
rep('cr.elements[0].color = (0.30, 0.22, 0.44, 1); cr.elements[1].position = 0.55; cr.elements[1].color = (0.04, 0.06, 0.17, 1)', 'cr.elements[0].color = (0.085, 0.14, 0.34, 1); cr.elements[1].position = 0.55; cr.elements[1].color = (0.006, 0.012, 0.05, 1)')
rep('e = cr.elements.new(0.14); e.color = (0.12, 0.11, 0.30, 1)', 'e = cr.elements.new(0.14); e.color = (0.03, 0.055, 0.17, 1)')
rep('lin_inv((0.56, 0.58, 0.82)), lin_inv((0.19, 0.17, 0.40)), rim=lin_inv((0.30, 0.32, 0.55))', 'lin_inv((0.34, 0.42, 0.66)), lin_inv((0.05, 0.075, 0.2)), rim=None')
rep('HAZE = (0.30, 0.22, 0.44) if SOFT else lin((0.30, 0.30, 0.52))', 'HAZE = (0.055, 0.09, 0.22)')
rep('HAZE_START, HAZE_DEPTH, HAZE_MAX = (10.0, 140.0, 0.72) if SOFT else (25.0, 220.0, 0.62)', 'HAZE_START, HAZE_DEPTH, HAZE_MAX = 12.0, 130.0, 0.85')
rep('col=(0.36, 0.30, 0.55)):', 'col=(0.10, 0.15, 0.30)):')
# hard moon, restrained practicals
rep('("MoonKey", 5.0,', '("MoonKey", 1.5,'); rep('("SkyFill", 0.25, (0.6, 0.65, 1.0), Vector((0.3, -0.5, 1)))', '("SkyFill", 0.85, (0.62, 0.72, 1.0), Vector((-0.5, -0.72, 0.5)))')
rep('ld.angle = 0.06 if SOFT else 0.02', 'ld.angle = 0.006')
rep('ld.energy = energy; ld.color = rgb; ld.shadow_soft_size = max(radius, 0.3) if SOFT else radius', 'ld.energy = energy * 0.5; ld.color = rgb; ld.shadow_soft_size = radius')
# lens lesson from the 3D test: f/5.6
rep('fstop=4.0 if not SOFT else 3.2', 'fstop=5.6', 2)
# stronger air for god rays
rep('(50, 54, 7), 0.008)', '(50, 54, 12), 0.02)'); rep('(60, 56, 10), 0.008)', '(60, 56, 14), 0.02)')
# raytraced reflections
rep('''SC.render.film_transparent = False
if "--v1"''', '''SC.render.film_transparent = False
for k, v in (("use_raytracing", True), ("ray_tracing_method", "SCREEN"), ("fast_gi_method", "GLOBAL_ILLUMINATION")):
    try: setattr(SC.eevee, k, v)
    except Exception as e: print("eevee setting", k, e)
try:
    SC.eevee.ray_tracing_options.resolution_scale = "2"; SC.eevee.ray_tracing_options.trace_max_roughness = 0.45
except Exception as e: print("ray options", e)
if "--v1"''')
# half self-lit cards
rep('''    tint = nt.nodes.new("ShaderNodeRGB"); tint.outputs[0].default_value = (*light, 1)
    mul = _mix(nt, it.outputs[0], tint.outputs[0]); em = nt.nodes.new("ShaderNodeEmission"); em.inputs[1].default_value = k; L(mul.outputs[2], em.inputs[0])
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    L(it.outputs[1], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(em.outputs[0], mx.inputs[2]); L(mx.outputs[0], out.inputs[0])''',
'''    em = nt.nodes.new("ShaderNodeEmission"); em.inputs[1].default_value = 1.0; L(it.outputs[0], em.inputs[0])
    pb = nt.nodes.new("ShaderNodeBsdfPrincipled"); pb.inputs["Roughness"].default_value = 0.8; L(it.outputs[0], pb.inputs["Base Color"])
    half = nt.nodes.new("ShaderNodeMixShader"); half.inputs[0].default_value = 0.5; L(pb.outputs[0], half.inputs[1]); L(em.outputs[0], half.inputs[2])
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    L(it.outputs[1], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(half.outputs[0], mx.inputs[2]); L(mx.outputs[0], out.inputs[0])''')
# Po-2 materials + outputs
rep('''cam = build_airfield() if LOC == "airfield" else build_camp()
''', '''cam = build_airfield() if LOC == "airfield" else build_camp()
upgrade_aircraft()
''')
rep('TAG = "" if not SOFT else "_v2"', 'TAG = "_v3"')
rep('v.co.z = 0.035 * math.sin(v.co.x * 5.2 + 1.3 * v.co.y) + 0.02 * math.sin(v.co.y * 9.0) + 0.04', 'v.co.z = 0.035 * math.sin(v.co.x * 5.2 + 1.3 * v.co.y) + 0.02 * math.sin(v.co.y * 9.0) + 0.09')
rep('M["crate"] = toon("Crate", (196, 150, 98)', 'M["crate"] = toon("Crate", (150, 130, 108)')
rep('M["wood"] = toon("Wood", (170, 120, 80)', 'M["wood"] = toon("Wood", (132, 108, 88)')
rep('M["olive"] = toon("Olive", (120, 140, 70)', 'M["olive"] = toon("Olive", (84, 100, 66)')
rep('m = toon("Ground_" + img, (190, 204, 220), (62, 66, 98), img=img, scale=1.0 / (tile or size), flat=True, gain=1.0)', 'm = toon("Ground_" + img, (235, 240, 245), (62, 66, 98), img=img, scale=1.0 / (tile or size), flat=True, gain=1.35)')
rep('v.co.z = 0.035 * math.sin(v.co.x * 5.2 + 1.3 * v.co.y) + 0.02 * math.sin(v.co.y * 9.0) + 0.09', 'v.co.z = 0.05 * math.sin(v.co.x * 5.2 + 1.3 * v.co.y) + 0.03 * math.sin(v.co.y * 9.0 + 2.2 * v.co.x) + 0.012 * math.sin(v.co.x * 17 - v.co.y * 11) + 0.13')
rep('glow_tex("MoonTex", "moon.png", 5.0)', 'glow_tex("MoonTex", "moon.png", 14.0)')
open("build_density_v3.py", "w", encoding="utf-8").write(s); print("generated build_density_v3.py")
