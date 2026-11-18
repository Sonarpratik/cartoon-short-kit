"""apply_look(scene, preset): the LOCKED LOOK in one call. Presets: night (the CB-approved round 3), morning, day (midday: high hard sun), golden, interior.
Sets engine + raytracing, sky, key/fill, haze colour for materials. Grade numbers live in grade.py under the same preset names."""
import bpy
from mathutils import Vector
from . import materials as M, lights, render as R

PRESETS = {
    "night": dict(sky=[(0, (.085, .14, .34)), (.14, (.03, .055, .17)), (.55, (.006, .012, .05))], stars=True, world=1.0,
                  key=(1.5, (.78, .84, 1.0)), fill=(.85, (.62, .72, 1.0)), haze=(.055, .09, .22), haze_range=(12, 130, .85), cloud=((.21, .34, .92), (.028, .058, .28)), mist=(.1, .15, .3), air=((.62, .6, .9), 1.0)),
    "morning": dict(sky=[(0, (.98, .66, .5)), (.1, (.86, .62, .62)), (.28, (.46, .54, .86)), (.65, (.14, .28, .68))], stars=False, world=.7, key=(3.4, (1.0, .74, .5)), fill=(.5, (.42, .58, 1.0)), haze=(.62, .68, .86), haze_range=(40, 260, .42),
                    cloud=((.8, .62, .56), (.36, .36, .56)), key_dir=(.82, -.5, .24), mist=(.78, .78, .86), air=((.95, .88, .8), .45), dew=True),
    "day": dict(sky=[(0, (.62, .78, .98)), (.2, (.26, .5, .92)), (.6, (.07, .22, .68))], stars=False, world=.75,
                key=(4.2, (1.0, .96, .9)), fill=(.5, (.7, .8, 1.0)), haze=(.55, .68, .9), haze_range=(25, 220, .7), cloud=((.72, .76, .84), (.36, .44, .62)), key_dir=(.3, -.2, .93), mist=(.72, .78, .9), air=((.95, .92, .85), .2)),
    "golden": dict(sky=[(0, (1.0, .6, .3)), (.16, (.72, .52, .5)), (.6, (.14, .28, .66))], stars=False, world=.7,
                   key=(3.8, (1.0, .7, .42)), fill=(.5, (.5, .6, 1.0)), haze=(.8, .52, .38), haze_range=(25, 200, .6), cloud=((1.0, .78, .6), (.42, .3, .5)), key_dir=(-.86, -.38, .2), mist=(.78, .55, .45), air=((1.0, .75, .5), .5)),
    "interior": dict(sky=[(0, (.1, .12, .2)), (.6, (.05, .06, .12))], stars=False, world=.35,
                     key=(2.2, (1.0, .92, .8)), fill=(.3, (.6, .7, 1.0)), haze=(.12, .13, .2), haze_range=(6, 40, .5), cloud=((.8, .8, .8), (.3, .3, .4)), mist=(.2, .2, .28), air=((.9, .85, .75), .4)),
}

def set_materials_state(preset):
    """call before creating any material, so haze and dew match the light."""
    p = PRESETS[preset]; a, b, c = p["haze_range"]; M.STATE.update(haze=p["haze"], haze_start=a, haze_depth=b, haze_max=c, dew=p.get("dew", False))

def apply_look(scene, preset="night", key_dir=None, fill_dir=(-.5, -.72, .5), samples=64, res=100):
    """call BEFORE creating materials so they pick up this preset's haze."""
    p = PRESETS[preset]; set_materials_state(preset); key_dir = key_dir or p.get("key_dir", (-.3, .9, .3))
    R.setup_eevee(scene, samples=samples, res=res)
    lights.sky(scene, p["sky"], p["stars"], p["world"])
    lights.sun(scene, "Key", p["key"][0], p["key"][1], key_dir); lights.sun(scene, "Fill", p["fill"][0], p["fill"][1], fill_dir)
    scene["look_preset"] = preset; return p
