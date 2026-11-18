"""One character card from a PNG, placed in the 3D world (hand placement for look tests). In a film the cards come from the lock:
`from_lock.card()` reads `out/lock/cards/<who>/` (the 2D vector puppets of `templates/vector2d_characters`, drawn by `templates/threejs_film`).
The old toon.ts / Remotion card stills were removed on 2026-11-09.
Shader = lit Principled + Emission mixed 0.5, alpha through Transparent. The ink is in the drawing: the only ink in the frame.
CB-approved emission gain is 1.0 (1.25 blew faces out at night)."""
import os, bpy
from mathutils import Vector
import math

MPX = .0009              # metres per card pixel, for 1200x2000 cards with soles at y = 1950

def plane(scene, name, mat, w, h, loc, face_to=None, z0=0.0):
    me = bpy.data.meshes.new(name); x0, x1 = -w / 2, w / 2
    me.from_pydata([(x0, 0, z0), (x1, 0, z0), (x1, 0, z0 + h), (x0, 0, z0 + h)], [], [(0, 1, 2, 3)]); uv = me.uv_layers.new()
    for i, c in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)]): uv.data[i].uv = c
    me.materials.append(mat); o = bpy.data.objects.new(name, me); scene.collection.objects.link(o); o.location = loc
    if face_to is not None:
        d = Vector(face_to) - Vector(loc); o.rotation_euler = (0, 0, math.atan2(d.x, -d.y))
    return o

def card(scene, png, loc, cam, self_lit=.5, emit=1.0, mirror=False, px_w=1200, px_h=2000, sole_y=1950):
    m = bpy.data.materials.new("Card_" + os.path.basename(png)); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); L = nt.links.new
    o = nt.nodes.new("ShaderNodeOutputMaterial"); it = nt.nodes.new("ShaderNodeTexImage"); it.image = bpy.data.images.load(png); it.interpolation = "Cubic"
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
    if mirror: mp.inputs["Scale"].default_value = (-1, 1, 1); mp.inputs["Location"].default_value = (1, 0, 0)
    L(tc.outputs["UV"], mp.inputs[0]); L(mp.outputs[0], it.inputs[0])
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[1].default_value = emit; L(it.outputs[0], e.inputs[0]); p = nt.nodes.new("ShaderNodeBsdfPrincipled"); p.inputs["Roughness"].default_value = .8; L(it.outputs[0], p.inputs["Base Color"])
    h = nt.nodes.new("ShaderNodeMixShader"); h.inputs[0].default_value = self_lit; L(p.outputs[0], h.inputs[1]); L(e.outputs[0], h.inputs[2])
    t = nt.nodes.new("ShaderNodeBsdfTransparent"); a = nt.nodes.new("ShaderNodeMixShader"); L(it.outputs[1], a.inputs[0]); L(t.outputs[0], a.inputs[1]); L(h.outputs[0], a.inputs[2]); L(a.outputs[0], o.inputs[0]); m.surface_render_method = "DITHERED"
    ob = plane(scene, "Card", m, px_w * MPX, px_h * MPX, loc, z0=-(px_h - sole_y) * MPX)
    c = ob.constraints.new("LOCKED_TRACK"); c.target = cam; c.track_axis = "TRACK_NEGATIVE_Y"; c.lock_axis = "LOCK_Z"; return ob
