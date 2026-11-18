"""card_edge_shadow.py: Rick's soft far-edge shadow on the white head of a flat character card, made in the card shader (no drawn shading).
From the Wrong Helmet EP 1 look (episodes/wrong-helmet/look/look_trench.py, edge_shadow(), 2026-11-11), where it is tested on all 1500 final
frames. This shared copy is the same logic with the episode's light list passed in; run it once on a new episode's look frames before relying on it.

How it works: the card material (lock2.card, node "seq" = the card image) samples its own image 3 more times, shifted away from the key light by up
to edge_uv of the card width. Where those samples leave the drawing (alpha 0) the pixel is near the far edge; only near-white pixels darken there
(by up to edge_dark at the very edge, neutral), so ink and costume stay. It follows any pose (seated, crouched), because it follows the drawing.
The shift side is keyed per frame from the card's position and turn and the key light: pass key_at(f, head_point) -> unit Vector toward the key.
A colour multiply (ctint) can ride along to compensate a grade's tint on faces.

    from blender_look import card_edge_shadow as CES
    def key_at(f, head):                       # Wrong Helmet: a lamp within 3.5 m, else the flare while lit, else the moon
        ...
    CES.apply(K, key_at, edge_uv=.075, edge_dark=.32, ctint=(1, 1, 1))   # K = lock2.build(...) result
White faces: on Wrong Helmet the card self-lit mix was 0.8 and the card emission 0.5-0.9 per place, so the lit side reads L* 93-97 on the graded
frame; finish with blender_look/face_fix.py after the grade."""
import math
import bpy
from mathutils import Vector

def fcurves_of(idb):
    """f-curves of an ID in Blender 5 (layered actions: the channelbag of the assigned slot); older Blender: action.fcurves"""
    ad = idb.animation_data
    if not ad or not ad.action: return []
    try:
        from bpy_extras import anim_utils
        cb = anim_utils.action_get_channelbag_for_slot(ad.action, ad.action_slot)
        return list(cb.fcurves) if cb else []
    except Exception: return list(getattr(ad.action, "fcurves", []))

def apply(K, key_at, edge_uv=.075, edge_dark=.32, ctint=(1.0, 1.0, 1.0), head_z=1.4):
    from blender_look import lock2
    out = {}
    for who, c in K["cards"].items():
        m = c["material"]; nt = m.node_tree; seq = nt.nodes["seq"]; L = nt.links.new; ob = c["object"]
        fc = next((x for x in fcurves_of(nt) if x.data_path == 'nodes["seq"].image_user.frame_offset'), None)
        pts = [(k.co[0], k.co[1]) for k in fc.keyframe_points] if fc else []
        uvn = nt.nodes.new("ShaderNodeTexCoord"); dxv = nt.nodes.new("ShaderNodeValue"); dxv.name = "edge_dx"; acc = None
        for i, s in enumerate((.33, .66, 1.0)):
            sm = nt.nodes.new("ShaderNodeMath"); sm.operation = "MULTIPLY"; L(dxv.outputs[0], sm.inputs[0]); sm.inputs[1].default_value = s
            cx = nt.nodes.new("ShaderNodeCombineXYZ"); L(sm.outputs[0], cx.inputs[0]); va = nt.nodes.new("ShaderNodeVectorMath"); va.operation = "ADD"; L(uvn.outputs["UV"], va.inputs[0]); L(cx.outputs[0], va.inputs[1])
            t2 = nt.nodes.new("ShaderNodeTexImage"); t2.name = "seqE%d" % i; t2.image = seq.image; t2.interpolation = "Linear"; t2.extension = "CLIP"
            for a in ("frame_duration", "frame_start", "frame_offset", "use_auto_refresh", "use_cyclic"): setattr(t2.image_user, a, getattr(seq.image_user, a))
            L(va.outputs[0], t2.inputs[0])
            if pts: lock2._curve(nt, 'nodes["%s"].image_user.frame_offset' % t2.name, 0, [p[0] for p in pts], [p[1] for p in pts], 0)
            if acc is None: acc = t2.outputs[1]
            else: ad = nt.nodes.new("ShaderNodeMath"); ad.operation = "ADD"; L(acc, ad.inputs[0]); L(t2.outputs[1], ad.inputs[1]); acc = ad.outputs[0]
        av = nt.nodes.new("ShaderNodeMath"); av.operation = "DIVIDE"; L(acc, av.inputs[0]); av.inputs[1].default_value = 3.0
        inv = nt.nodes.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0; L(av.outputs[0], inv.inputs[1])
        bw = nt.nodes.new("ShaderNodeRGBToBW"); L(seq.outputs[0], bw.inputs[0]); wm = nt.nodes.new("ShaderNodeMapRange"); wm.clamp = True; L(bw.outputs[0], wm.inputs[0]); wm.inputs[1].default_value = .72; wm.inputs[2].default_value = .9
        e1 = nt.nodes.new("ShaderNodeMath"); e1.operation = "MULTIPLY"; L(inv.outputs[0], e1.inputs[0]); L(wm.outputs[0], e1.inputs[1])
        e2 = nt.nodes.new("ShaderNodeMath"); e2.operation = "MULTIPLY_ADD"; L(e1.outputs[0], e2.inputs[0]); e2.inputs[1].default_value = -edge_dark; e2.inputs[2].default_value = 1.0
        mc0 = nt.nodes.new("ShaderNodeVectorMath"); mc0.operation = "SCALE"; L(seq.outputs[0], mc0.inputs[0]); L(e2.outputs[0], mc0.inputs[3])
        mc = nt.nodes.new("ShaderNodeVectorMath"); mc.operation = "MULTIPLY"; L(mc0.outputs[0], mc.inputs[0]); mc.inputs[1].default_value = ctint
        for n2 in nt.nodes:                                                              # tighter alpha: the half-transparent PNG rim made a white fringe
            if n2.type == "MIX_SHADER" and n2.inputs[0].is_linked and n2.inputs[0].links[0].from_node == seq and n2.inputs[0].links[0].from_socket == seq.outputs[1]:
                am = nt.nodes.new("ShaderNodeMapRange"); am.clamp = True; L(seq.outputs[1], am.inputs[0]); am.inputs[1].default_value = .45; am.inputs[2].default_value = .9; L(am.outputs[0], n2.inputs[0])
        for n2 in nt.nodes:
            if n2.type in ("EMISSION", "BSDF_PRINCIPLED"):
                s0 = n2.inputs[0]
                if s0.is_linked and s0.links[0].from_node == seq: L(mc.outputs[0], s0)
        F = sorted(K["frames"]); DX = []; plus = 0
        fcs = {(x.data_path, x.array_index): x for x in fcurves_of(ob)}
        ev = lambda path, i, f, d: fcs[(path, i)].evaluate(f) if (path, i) in fcs else d
        for f in F:
            loc = Vector([ev("location", i, f, ob.location[i]) for i in range(3)]); yaw = ev("rotation_euler", 2, f, ob.rotation_euler[2])
            head = loc + Vector((0, 0, head_z)); xw = Vector((math.cos(yaw), math.sin(yaw), 0)); key = key_at(f, head)
            side = 1.0 if key.dot(xw) > 0 else -1.0; plus += side > 0; DX.append(-side * edge_uv)
        lock2._curve(nt, 'nodes["edge_dx"].outputs[0].default_value', 0, F, DX, 0)
        out[who] = dict(frames=len(F), key_plus_x=plus)
    return out
