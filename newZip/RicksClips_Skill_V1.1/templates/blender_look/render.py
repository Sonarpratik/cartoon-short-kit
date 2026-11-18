"""EEVEE on the local GPU (never cloud): 1440x2560, 64 samples, raytraced reflections, volumetrics, f/5.6, optional motion blur."""
import bpy, time, json, os
from mathutils import Vector

def setup_eevee(scene, samples=64, res=100, motion_blur=False):
    r = scene.render; r.engine = "BLENDER_EEVEE"; r.resolution_x, r.resolution_y, r.resolution_percentage = 1440, 2560, res; r.film_transparent = False; r.use_motion_blur = motion_blur; r.filter_size = 2.2
    v = scene.view_settings; v.view_transform = "Khronos PBR Neutral"; v.look = "None"
    e = scene.eevee; e.taa_render_samples = samples
    for k, val in (("use_shadows", True), ("shadow_pool_size", "1024"), ("use_raytracing", True), ("ray_tracing_method", "SCREEN"), ("fast_gi_method", "GLOBAL_ILLUMINATION"),
                   ("volumetric_end", 140.0), ("volumetric_tile_size", "8"), ("volumetric_samples", 48), ("use_volumetric_shadows", True)):
        try: setattr(e, k, val)
        except Exception as x: print("eevee setting skipped:", k, x)
    try: e.ray_tracing_options.resolution_scale = "2"; e.ray_tracing_options.trace_max_roughness = .45
    except Exception as x: print("ray options skipped:", x)

def camera(scene, loc, look_at, lens=20, focus=4.5, fstop=5.6):
    """f/5.6: f/2.8 blurred the foreground and failed edge density. Vertical sensor 24 mm: 9:16 sees only about 37 deg across at 20 mm, so stage in depth."""
    d = bpy.data.cameras.new("Cam"); d.lens = lens; d.sensor_fit = "VERTICAL"; d.sensor_height = 24; d.clip_start = .1; d.clip_end = 20000; d.dof.use_dof = True; d.dof.focus_distance = focus; d.dof.aperture_fstop = fstop
    o = bpy.data.objects.new("Cam", d); scene.collection.objects.link(o); o.location = loc; o.rotation_euler = (Vector(look_at) - Vector(loc)).to_track_quat("-Z", "Y").to_euler(); scene.camera = o; bpy.context.view_layer.update(); return o

def still(scene, path, frame=None):
    """absolute path. Returns seconds."""
    if frame is not None: scene.frame_set(frame)
    scene.render.filepath = os.path.abspath(path); scene.render.image_settings.file_format = "PNG"; t = time.time(); bpy.ops.render.render(write_still=True); return round(time.time() - t, 1)

def slowest_frame_test(scene, outdir, frames, budget=15.0):
    """render the candidate frames of a shot at full size first; flags anything over budget before animation."""
    os.makedirs(outdir, exist_ok=True); r = {f: still(scene, os.path.join(outdir, "test_%04d.png" % f), f) for f in frames}
    s = {"seconds": r, "slowest": max(r, key=r.get), "over_budget": [f for f, v in r.items() if v > budget]}; json.dump(s, open(os.path.join(outdir, "slowest_frame.json"), "w"), indent=1); return s
