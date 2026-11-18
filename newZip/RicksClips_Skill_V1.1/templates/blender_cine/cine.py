"""Camera rigs for action shots. Everything is a function of the frame number and gets BAKED to keyframes,
so a shot is deterministic, renders the same every time and needs no constraints.

    P  = cine.object_path(obj, f0, f1)   ANY animated object in the scene (car, horse, card, boat, crate): the universal entry
         cine.line_path / spline_path / loop_path / ballistic_path (jump, fall, throw) / mix_path (two subjects)
    cine.bake_subject(obj, P, f0, f1)                                         keys the subject on that path
    shot = cine.Shot(scene, cam, f0, f1, fps=30)
    shot.add(f_start, rig, blend=24)           rigs below; consecutive rigs cross-blend with smootherstep (no cut)
    shot.shake(f_hit, amp=1.0)                 motion.md kick: flips sign every frame, gone in 7 f
    info = shot.bake(aim_lag=0.0)              keys location/rotation/lens/focus; returns the speed report

Rigs (each returns rig(f) -> dict(pos, aim, up, roll, lens)):
    chase(P, offset, look_ahead)       behind/beside the subject, in its heading frame (world up): tracking shot
    mount(P, offset, look)             fixed to the subject, inherits its bank/roll: POV / wing cam
    orbit(P, radius, az, el, f0, f1)   circles the moving subject (az/el in degrees, relative to its heading)
    catch(cam_pos, P, lead, headroom)  camera at a (slowly moving) point, framing the subject with lead room
    static(pos, aim)                   locked-off or slowly pushed frame; give pos/aim as functions for moves
Units: metres, degrees, frames. Forward = +Y, up = +Z (same as aircraft.py)."""
import math
import bpy
from mathutils import Vector, Quaternion, Matrix

def smooth(u):
    u = max(0.0, min(1.0, u)); return u * u * u * (u * (6 * u - 15) + 10)

def V(x): return Vector(x) if not isinstance(x, Vector) else x.copy()

# ---------------------------------------------------------------- subject paths
def _frame(fwd, up_hint):
    fwd = fwd.normalized(); right = fwd.cross(up_hint)
    if right.length < 1e-4: right = fwd.cross(Vector((0, 1, 0)))
    right.normalize(); up = right.cross(fwd)
    return Matrix((right, fwd, up)).transposed().to_quaternion()     # local X right, Y forward, Z up

def line_path(p0, vel, bank=0.0):
    """straight flight/drive: pos = p0 + vel * f (vel in m per frame)."""
    p0, vel = V(p0), V(vel)
    q = _frame(vel, Vector((0, 0, 1))) @ Quaternion((0, 1, 0), math.radians(bank))
    return lambda f: (p0 + vel * f, q)

def loop_path(entry, heading_deg, speed, radius, f_loop, f_end=None, climb_out=0.0):
    """level flight -> full vertical loop -> level flight. speed m/frame, loop starts at frame f_loop.
    Returns f -> (pos, quat). The loop is a circle in the vertical plane of the heading; the subject is upside down at the top."""
    e, h = V(entry), math.radians(heading_deg)
    fwd = Vector((math.sin(h), math.cos(h), 0)); circ = 2 * math.pi * radius; n_loop = circ / speed
    def at(f):
        if f <= f_loop:
            return e + fwd * speed * f, _frame(fwd, Vector((0, 0, 1)))
        s = (f - f_loop) * speed; start = e + fwd * speed * f_loop
        if s < circ:
            a = s / radius                                        # angle travelled round the loop
            centre = start + Vector((0, 0, radius))
            pos = centre + fwd * (radius * math.sin(a)) - Vector((0, 0, radius * math.cos(a)))
            tan = fwd * math.cos(a) + Vector((0, 0, math.sin(a)))
            upv = (centre - pos).normalized()                    # pilot's head points to the loop centre
            return pos, _frame(tan, upv)
        rest = s - circ
        return start + fwd * rest + Vector((0, 0, climb_out * rest)), _frame(fwd + Vector((0, 0, climb_out)), Vector((0, 0, 1)))
    at.n_loop = n_loop; at.f_loop = f_loop; at.radius = radius
    return at

def spline_path(points, speed, bank_k=0.0):
    """Catmull-Rom through points at roughly constant speed (m/frame); bank_k banks into turns (deg per deg/frame of yaw)."""
    pts = [V(p) for p in points]; seg = []
    def cr(i, t):
        p0, p1, p2, p3 = pts[max(i - 1, 0)], pts[i], pts[min(i + 1, len(pts) - 1)], pts[min(i + 2, len(pts) - 1)]
        return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t)
    samples = [cr(i, k / 40) for i in range(len(pts) - 1) for k in range(40)] + [pts[-1]]
    L = [0.0]
    for a, b in zip(samples, samples[1:]): L.append(L[-1] + (b - a).length)
    def pos_at(s):
        s = max(0.0, min(L[-1], s)); lo, hi = 0, len(L) - 1
        while hi - lo > 1:
            m = (lo + hi) // 2; lo, hi = (m, hi) if L[m] <= s else (lo, m)
        u = (s - L[lo]) / max(1e-6, L[hi] - L[lo]); return samples[lo].lerp(samples[hi], u)
    def at(f):
        s = f * speed; p = pos_at(s); a, b = pos_at(s - speed), pos_at(s + speed); fwd = (b - a)
        if fwd.length < 1e-6: fwd = Vector((0, 1, 0))
        yaw0 = math.atan2((p - a).x, (p - a).y); yaw1 = math.atan2((b - p).x, (b - p).y)
        dyaw = math.degrees((yaw1 - yaw0 + math.pi) % (2 * math.pi) - math.pi)
        q = _frame(fwd, Vector((0, 0, 1))) @ Quaternion((0, 1, 0), math.radians(-bank_k * dyaw))
        return p, q
    at.length = L[-1]; return at

def object_path(obj, f0, f1, scene=None):
    """ANY animated thing in the scene becomes a path: car, horse, character card, boat, falling crate, an empty on a
    Follow Path constraint. Samples the object's evaluated world transform once per frame (f0..f1), clamps outside."""
    scene = scene or bpy.context.scene; keep = scene.frame_current; S = {}
    for f in range(f0, f1 + 1):
        scene.frame_set(f); mw = obj.matrix_world
        S[f] = (mw.translation.copy(), mw.to_quaternion())
    scene.frame_set(keep)
    def at(f):
        fi = int(math.floor(f)); u = f - fi; a = S[max(f0, min(f1, fi))]; b = S[max(f0, min(f1, fi + 1))]
        return a[0].lerp(b[0], u), a[1].slerp(b[1], u)
    return at

def ballistic_path(p0, v0, g=9.81 / 900, f0=0, heading=None):
    """jump, fall, throw: p = p0 + v0*t + g/2*t^2 (v0 in m per frame, g in m per frame^2; 9.81/900 = real gravity at 30 fps).
    The subject faces along its velocity (or a fixed heading vector)."""
    p0, v0 = V(p0), V(v0)
    def at(f):
        t = max(0.0, f - f0); v = v0 + Vector((0, 0, -g * t))
        return p0 + v0 * t + Vector((0, 0, -.5 * g * t * t)), _frame(V(heading) if heading else v, Vector((0, 0, 1)))
    return at

def mix_path(P1, P2, t=.5):
    """a point between two subjects (a duel, a pursuer and its prey): orbit or catch this to keep both in frame."""
    def at(f):
        a, qa = P1(f); b, qb = P2(f); return a.lerp(b, t), qa.slerp(qb, t)
    return at

def bake_subject(obj, P, f0, f1, step=1):
    obj.rotation_mode = "QUATERNION"; prev = None
    for f in range(f0, f1 + 1, step):
        p, q = P(f)
        if prev is not None and prev.dot(q) < 0: q = -q
        obj.location = p; obj.rotation_quaternion = q; prev = q
        obj.keyframe_insert("location", frame=f); obj.keyframe_insert("rotation_quaternion", frame=f)

# ---------------------------------------------------------------- rigs
def _rig(pos, aim, up=(0, 0, 1), roll=0.0, lens=24.0, focus_on=None):
    return dict(pos=V(pos), aim=V(aim), up=V(up), roll=roll, lens=lens, focus=V(focus_on) if focus_on is not None else V(aim))

def _num(x, f): return x(f) if callable(x) else x

def chase(P, offset=(-3.0, -9.0, 1.6), look_ahead=6.0, lens=28.0, bank_follow=0.0, aim_offset=(0, 0, 0)):
    """camera rides with the subject in its HEADING frame (yaw only, world up), so the horizon stays level
    and the world streams past: the tracking / follow shot. offset is (right, forward, up) metres from the subject;
    bank_follow 0..1 lets some of the subject's roll into the camera."""
    def rig(f):
        p, q = P(f); fwd = q @ Vector((0, 1, 0)); hd = Vector((fwd.x, fwd.y, 0))
        hd = hd.normalized() if hd.length > 1e-3 else Vector((0, 1, 0)); rt = hd.cross(Vector((0, 0, 1)))
        o = _num(offset, f); pos = p + rt * o[0] + hd * o[1] + Vector((0, 0, o[2]))
        ao = _num(aim_offset, f); aim = p + fwd * _num(look_ahead, f) + rt * ao[0] + Vector((0, 0, ao[2]))
        up = Vector((0, 0, 1)).lerp(q @ Vector((0, 0, 1)), bank_follow)
        return _rig(pos, aim, up, 0.0, _num(lens, f), p)
    return rig

def mount(P, offset=(1.8, -1.0, .6), look=(0, 12, 0), lens=18.0):
    """fixed to the subject's body (wing, hood, cockpit): inherits pitch and roll, so the WORLD rolls. POV / mounted shot."""
    def rig(f):
        p, q = P(f); o, l = _num(offset, f), _num(look, f)
        return _rig(p + q @ Vector(o), p + q @ Vector(l), q @ Vector((0, 0, 1)), 0.0, _num(lens, f), p)
    return rig

def orbit(P, radius, az, el, f0, f1, lens=28.0, heading_relative=True, aim_offset=(0, 0, 0)):
    """circle the moving subject from az[0] to az[1] and el[0] to el[1] (degrees) between f0 and f1, eased.
    az 0 = behind, 90 = right side, 180 = in front. radius may be a (r0, r1) pair."""
    r0, r1 = radius if isinstance(radius, (tuple, list)) else (radius, radius)
    def rig(f):
        p, q = P(f); u = smooth((f - f0) / max(1, f1 - f0))
        a, e, r = math.radians(az[0] + (az[1] - az[0]) * u), math.radians(el[0] + (el[1] - el[0]) * u), r0 + (r1 - r0) * u
        fwd = q @ Vector((0, 1, 0)) if heading_relative else Vector((0, 1, 0)); hd = Vector((fwd.x, fwd.y, 0))
        hd = hd.normalized() if hd.length > 1e-3 else Vector((0, 1, 0)); rt = hd.cross(Vector((0, 0, 1)))
        d = (-hd * math.cos(a) + rt * math.sin(a)) * math.cos(e) + Vector((0, 0, math.sin(e)))
        ao = _num(aim_offset, f)
        return _rig(p + d * r, p + rt * ao[0] + hd * ao[1] + Vector((0, 0, ao[2])), (0, 0, 1), 0.0, _num(lens, f), p)
    return rig

def catch(cam_pos, P, lead=0.25, headroom=0.0, lens=35.0, roll_with=0.0):
    """the operator shot: the camera stands (or drifts, cam_pos may be a function of f) and turns to keep the subject
    in frame, aiming a little AHEAD of it (lead = seconds of travel, 0.2-0.4 reads as anticipation).
    Combine with Shot.bake(aim_lag=...) so the frame lags and then catches up. roll_with 0..1 tilts the horizon with the subject."""
    def rig(f):
        c = V(_num(cam_pos, f)); p, q = P(f); p2, _ = P(f + 1); v = (p2 - p) * 30 * _num(lead, f)
        los = p - c; dist = max(1e-3, los.length); los /= dist
        v = v - los * v.dot(los)                                  # lead room is SIDEWAYS on screen: drop the part along the view line
        if v.length > .35 * dist: v *= .35 * dist / v.length      # never lead past the lens (a fly-by would aim behind the camera)
        up = Vector((0, 0, 1)).lerp(q @ Vector((0, 0, 1)), roll_with)
        return _rig(c, p + v + Vector((0, 0, _num(headroom, f))), up, 0.0, _num(lens, f), p)
    return rig

def static(pos, aim, lens=24.0, roll=0.0):
    return lambda f: _rig(_num(pos, f), _num(aim, f), (0, 0, 1), _num(roll, f), _num(lens, f))

def push(pos, aim, f0, rate=.0025):
    """motion.md hold push: the subject grows ~rate per frame (0.15-0.35 %/f on holds, 0.6 %/f on punch words)."""
    pos, aim = V(pos), V(aim)
    return lambda f: aim + (pos - aim) * (1 - rate) ** max(0, f - f0)

# ---------------------------------------------------------------- the shot
class Shot:
    def __init__(self, scene, cam, f0, f1, fps=30):
        self.sc, self.cam, self.f0, self.f1, self.fps = scene, cam, f0, f1, fps
        self.segs, self.kicks, self.rolls = [], [], []
    def add(self, f_start, rig, blend=24):
        """from f_start this rig takes over, cross-blending positions and aims over `blend` frames (smootherstep).
        blend 0 = a hard cut inside the shot (avoid: CB wants fewer cuts)."""
        self.segs.append((f_start, rig, blend)); self.segs.sort(key=lambda s: s[0]); return self
    def shake(self, f_hit, amp=1.0, frames=7):
        """impact / fly-by kick (motion.md 2.1): ~3 px at 720p per unit, sign flips every frame, gone in 7 f."""
        self.kicks.append((f_hit, amp, frames)); return self
    def roll(self, f_a, f_b, deg):
        """eased dutch roll between two frames (his rolls: 4-8 deg over >= 18 f; action up to ~17)."""
        self.rolls.append((f_a, f_b, deg)); return self
    def eval(self, f):
        cur = None
        for i, (fs, rig, bl) in enumerate(self.segs):
            if f < fs and cur is not None: break
            r = rig(f)
            if cur is None or bl <= 0: cur = r; continue
            u = smooth((f - fs) / bl)
            cur = dict(pos=cur["pos"].lerp(r["pos"], u), aim=cur["aim"].lerp(r["aim"], u), up=cur["up"].lerp(r["up"], u).normalized(),
                       roll=cur["roll"] + (r["roll"] - cur["roll"]) * u, lens=cur["lens"] + (r["lens"] - cur["lens"]) * u,
                       focus=cur["focus"].lerp(r["focus"], u))
        return cur
    def bake(self, aim_lag=0.0, fstop=5.6):
        """aim_lag 0 = perfect operator; 0.1-0.25 s = the frame trails a fast subject and catches up (feels hand-operated
        without any float). Returns the speed report (motion.md units: px/f at 720x1280)."""
        cam, sc = self.cam, self.sc; cam.rotation_mode = "QUATERNION"; d = cam.data; d.dof.use_dof = True; d.dof.aperture_fstop = fstop
        prevq, aim_s, aim_v, prev_fwd, prev_right = None, None, Vector(), None, None
        w = (2 * math.pi / (aim_lag * self.fps * 2.2)) if aim_lag > 0 else None   # spring settling ~= aim_lag seconds
        speeds = []
        for f in range(self.f0, self.f1 + 1):
            r = self.eval(f); aim = r["aim"]
            if w:
                if aim_s is None: aim_s = aim.copy()
                for _ in range(4):                                 # critically damped spring, 4 substeps
                    acc = (aim - aim_s) * (w * w) - aim_v * (2 * w); aim_v += acc * .25; aim_s += aim_v * .25
                aim = aim_s
            fwd = (aim - r["pos"]).normalized(); right = fwd.cross(r["up"])
            if right.length < 1e-3: right = prev_right or fwd.cross(Vector((0, 1, 0)))
            right.normalize(); up = right.cross(fwd)
            q = Matrix((right, up, -fwd)).transposed().to_quaternion()
            roll = r["roll"]
            for a, b, deg in self.rolls: roll += math.radians(deg) * (smooth((f - a) / max(1, b - a)) if f < b else 1) if f >= a else 0
            k = 0.0
            for fh, amp, n in self.kicks:
                m = f - fh
                if 0 <= m < n: k += amp * (-1 if m % 2 else 1) * (1 - m / n) ** 1.5
            vfov = 2 * math.atan(12 / r["lens"])
            yaw_k = k * (3 / 640) * 2 * math.tan(vfov / 2)          # ~3 px at 720p per unit (motion.md kick)
            q = q @ Quaternion((0, 0, 1), roll + k * .004) @ Quaternion((0, 1, 0), yaw_k) @ Quaternion((1, 0, 0), .6 * yaw_k)
            if prevq is not None and prevq.dot(q) < 0: q = -q
            cam.location = r["pos"]; cam.rotation_quaternion = q; d.lens = r["lens"]
            d.dof.focus_distance = max(.5, (r["focus"] - r["pos"]).length)
            cam.keyframe_insert("location", frame=f); cam.keyframe_insert("rotation_quaternion", frame=f)
            d.keyframe_insert("lens", frame=f); d.dof.keyframe_insert("focus_distance", frame=f)
            if prev_fwd is not None:                               # angular speed -> px/f at 720 x 1280 (vertical fov)
                ang = math.acos(max(-1, min(1, prev_fwd.dot(-(q @ Vector((0, 0, 1)))))))
                speeds.append((ang * 640 / math.tan(vfov / 2), f))
            prev_fwd, prevq, prev_right = -(q @ Vector((0, 0, 1))), q, right
        for fc in (cam.animation_data.action.fcurves if hasattr(cam.animation_data.action, "fcurves") else []):
            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
        top = sorted(speeds, reverse=True)[:6]; s = sorted(x for x, _ in speeds) or [0]
        return {"peaks": [(f_, round(x, 1)) for x, f_ in top],"frames": self.f1 - self.f0 + 1, "rot_speed_p50": round(s[len(s) // 2], 1), "rot_speed_p90": round(s[int(len(s) * .9)], 1),
                "rot_speed_max": round(s[-1], 1), "turning_pct": round(100 * sum(x >= 2 for x in s) / len(s), 1),
                "note": "rotation only; translation adds parallax. Measure the render with cine_stats.py for the real number."}

def motion_blur(scene, shutter=.5):
    """his whips and fly-bys are always smeared; ours too. EEVEE motion blur, 0.5 shutter."""
    scene.render.use_motion_blur = True
    try: scene.render.motion_blur_shutter = shutter
    except Exception: pass
    try: scene.eevee.motion_blur_steps = 2
    except Exception: pass
