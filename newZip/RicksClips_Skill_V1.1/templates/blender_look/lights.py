"""Rigs: painted sky, hard sun key (angle 0.006 rad = hard shadows), fill, practicals with falloff, god-ray air volume, ground mist, stylised clouds."""
import bpy, bmesh, random
from mathutils import Vector
from . import materials as M
from .cards import plane

def _coll(scene): return scene.collection

def sky(scene, stops, stars=False, strength=1.0):
    w = bpy.data.worlds.new("Sky"); scene.world = w; w.use_nodes = True; nt = w.node_tree; nt.nodes.clear(); L = nt.links.new
    o = nt.nodes.new("ShaderNodeOutputWorld"); bg = nt.nodes.new("ShaderNodeBackground"); tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["Generated"], sx.inputs[0])
    r = nt.nodes.new("ShaderNodeValToRGB"); c = r.color_ramp; c.elements[0].position = stops[0][0]; c.elements[0].color = (*stops[0][1], 1); c.elements[1].position = stops[-1][0]; c.elements[1].color = (*stops[-1][1], 1)
    for pos, col in stops[1:-1]: c.elements.new(pos).color = (*col, 1)
    L(sx.outputs[2], r.inputs[0]); out = r.outputs[0]
    if stars:
        v = nt.nodes.new("ShaderNodeTexVoronoi"); v.inputs["Scale"].default_value = 170; L(tc.outputs["Generated"], v.inputs[0])
        lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = .09; L(v.outputs["Distance"], lt.inputs[0])
        sp = nt.nodes.new("ShaderNodeSeparateColor"); L(v.outputs["Color"], sp.inputs[0]); gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = .72; L(sp.outputs[0], gt.inputs[0])
        m = nt.nodes.new("ShaderNodeMath"); m.operation = "MULTIPLY"; L(lt.outputs[0], m.inputs[0]); L(gt.outputs[0], m.inputs[1])
        cx = nt.nodes.new("ShaderNodeCombineXYZ"); [L(m.outputs[0], cx.inputs[i]) for i in range(3)]; a = nt.nodes.new("ShaderNodeVectorMath"); a.operation = "ADD"; L(out, a.inputs[0]); L(cx.outputs[0], a.inputs[1]); out = a.outputs[0]
    L(out, bg.inputs[0]); bg.inputs[1].default_value = strength; L(bg.outputs[0], o.inputs[0])

def sun(scene, name, energy, color, direction, angle=.006):
    d = bpy.data.lights.new(name, "SUN"); d.energy = energy; d.color = color; d.angle = angle
    o = bpy.data.objects.new(name, d); _coll(scene).objects.link(o); o.rotation_euler = Vector(direction).normalized().to_track_quat("Z", "Y").to_euler(); return o

def practical(scene, loc, rgb=(1, .62, .3), energy=40, radius=.1):
    d = bpy.data.lights.new("Practical", "POINT"); d.energy = energy; d.color = rgb; d.shadow_soft_size = radius
    o = bpy.data.objects.new("Practical", d); _coll(scene).objects.link(o); o.location = loc; return o

def air(scene, center, size, density=.02, col=(.62, .6, .9)):
    """scattering volume for shafts and halos. Start it about 9 m from the lens: near stays crisp, the distance lifts."""
    me = bpy.data.meshes.new("Air"); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bm.to_mesh(me); bm.free()
    m = bpy.data.materials.new("Air"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); o = nt.nodes.new("ShaderNodeOutputMaterial"); v = nt.nodes.new("ShaderNodeVolumePrincipled"); v.inputs["Density"].default_value = density; v.inputs["Color"].default_value = (*col, 1); v.inputs["Anisotropy"].default_value = .35; nt.links.new(v.outputs[0], o.inputs["Volume"])
    me.materials.append(m); ob = bpy.data.objects.new("Air", me); _coll(scene).objects.link(ob); ob.location = center; ob.scale = size; return ob

def mist(scene, center, w, h, cam_loc, k=.35, col=(.1, .15, .3)):
    m = bpy.data.materials.new("Mist"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new; o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (*col, 1); tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    tc = nt.nodes.new("ShaderNodeTexCoord"); sx = nt.nodes.new("ShaderNodeSeparateXYZ"); L(tc.outputs["UV"], sx.inputs[0]); g = nt.nodes.new("ShaderNodeMapRange"); g.inputs[3].default_value = k; g.inputs[4].default_value = 0; L(sx.outputs[1], g.inputs[0])
    z = nt.nodes.new("ShaderNodeTexNoise"); z.inputs["Scale"].default_value = 4; L(tc.outputs["UV"], z.inputs[0]); nr = nt.nodes.new("ShaderNodeMapRange"); nr.inputs[3].default_value = .35; nr.inputs[4].default_value = 1.3; L(z.outputs[0], nr.inputs[0])
    t = nt.nodes.new("ShaderNodeMath"); t.operation = "MULTIPLY"; L(g.outputs[0], t.inputs[0]); L(nr.outputs[0], t.inputs[1]); L(t.outputs[0], mx.inputs[0]); L(tr.outputs[0], mx.inputs[1]); L(e.outputs[0], mx.inputs[2]); L(mx.outputs[0], o.inputs[0]); m.surface_render_method = "BLENDED"
    return plane(scene, "Mist", m, w, h, center, face_to=cam_loc)

def cloud(scene, center, w, mat, seed=1, n=16):
    r = random.Random(seed); h = w * .32; bm = bmesh.new()
    for i in range(n):
        x = r.uniform(-w / 2, w / 2); rr = r.uniform(.18, .34) * h * (1.4 - abs(x) / w); ret = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=rr); bmesh.ops.translate(bm, verts=ret["verts"], vec=(x, r.uniform(-h * .3, h * .3), r.uniform(0, h * .35) + rr * .3))
    me = bpy.data.meshes.new("Cloud"); bm.to_mesh(me); bm.free(); me.materials.append(mat); o = bpy.data.objects.new("Cloud", me); _coll(scene).objects.link(o); o.location = center
    a = o.modifiers.new("R", "REMESH"); a.mode = "VOXEL"; a.voxel_size = max(2, w / 55); s = o.modifiers.new("S", "SMOOTH"); s.iterations = 6; return o

def moon(scene, direction, radius=210, strength=14.0, dist=6000):
    """visible moon disc far away, textured emission (tex/moon.png). Night key light comes from look.apply_look."""
    d = Vector(direction).normalized(); bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=48, radius=1); me = bpy.data.meshes.new("Moon"); bm.to_mesh(me); bm.free(); me.uv_layers.new()
    for l in me.loops:
        v = me.vertices[l.vertex_index].co; me.uv_layers[0].data[l.index].uv = (v.x * .5 + .5, v.y * .5 + .5)
    m = bpy.data.materials.new("Moon"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); o = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission"); t = nt.nodes.new("ShaderNodeTexImage"); t.image = M.image("moon.png"); e.inputs[1].default_value = strength; nt.links.new(t.outputs[0], e.inputs[0]); nt.links.new(e.outputs[0], o.inputs[0]); me.materials.append(m)
    ob = bpy.data.objects.new("Moon", me); _coll(scene).objects.link(ob); ob.location = d * dist; ob.scale = (radius,) * 3; ob.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler(); return ob
