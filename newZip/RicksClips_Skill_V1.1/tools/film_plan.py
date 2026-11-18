"""film_plan.py: ONE film file, baked once, checked before anything renders.

    python tools/film_plan.py check episodes/<name>/film.json     gates on the plan + writes out/plan/*.json + plan_report.md
    python tools/film_plan.py bake  episodes/<name>/film.json     only write the baked files

film.json is the single table every stage reads (shot blueprint + camera + acting + sound cues). This module turns it into
per-frame data that BOTH the three.js film and the Blender look pass read, so the camera, the character positions and the
timing can never drift between the two:
    out/plan/camera_baked.json       per frame: pos, aim, roll, lens_mm, fov_v, state (rest / travel), take, station
    out/plan/performance_baked.json  per character: run-length states (view, dir, pose, face, mouth, blink, prop, pos)
    out/plan/sound_events.json       [{t, name}] for the mix, from the same word anchors
    out/plan/plan_report.md / .json  every gate with value, target, PASS / WARN / FAIL and the fix

Pure Python (math + json only) so Blender's Python can import it:  import film_plan as FP; F = FP.load(path); cam = FP.bake_camera(F)

Coordinates: metres, Z up, Y forward (Blender). three.js converts (x, y, z) -> (x, z, -y).
Time values anywhere in film.json:  12 (frame)  |  ["word", n, offset_frames]  = T(word, n) + offset  |  {"s": 1.5} (seconds)
Gate numbers come from 24 of Rick's Shorts, same instruments as tools/check_film.py (references/measure/gates_film.json).
"""
import os, sys, json, math, hashlib

FPS = 30
PXW, PXH = 720, 1280                 # the measuring size used by every motion number in the skill
CORNER = 734.0                       # zoom fraction/f -> px/f at the frame corner (motion.md def A)
SETTLED = 2.0                        # px/f: under this the camera is "at rest" (a slow creep still counts)
CAPTION_BAND = (0.58, 0.76)          # of frame height: no face centre in here
D = dict(lead=5, hold=0.7, min_hold=0.45, travel_max=3.0, travel_min=0.35, lens=24.0, sensor=36.0, peak=26.0)
REST_PX = dict(C=0.6, M=1.3, W=1.6, P=1.8, O=1.6)   # how fast the picture drifts while the camera "rests", px/f as measured, by framing: under the 2 px/f rest line, above the 0.7 line that reads as frozen (Rick is dead still on only 9 % of frames)

# ------------------------------------------------------------------ small vector maths
def vsub(a, b): return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
def vadd(a, b): return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
def vmul(a, k): return [a[0] * k, a[1] * k, a[2] * k]
def vdot(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def vlen(a): return math.sqrt(vdot(a, a))
def vnorm(a):
    l = vlen(a); return [a[0] / l, a[1] / l, a[2] / l] if l > 1e-9 else [0.0, 1.0, 0.0]
def vcross(a, b): return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
def vlerp(a, b, u): return [a[i] + (b[i] - a[i]) * u for i in range(3)]
def smoother(u):
    u = max(0.0, min(1.0, u)); return u * u * u * (u * (6 * u - 15) + 10)     # zero speed AND zero acceleration at both ends
def fast_in(u, k=3.2):
    """character moves: 60-70 % of the way in the first third, then a slow settle, no overshoot (Rick, measured)"""
    u = max(0.0, min(1.0, u)); return 1 - (1 - u) ** k
def pct(v, q):
    if not v: return 0.0
    s = sorted(v); i = (len(s) - 1) * q / 100.0; a = int(math.floor(i)); b = min(len(s) - 1, a + 1); return s[a] + (s[b] - s[a]) * (i - a)
def fov_v(lens, sensor=36.0): return 2 * math.degrees(math.atan(sensor / 2 / lens))     # portrait frame: Blender fits the sensor to the long (vertical) side
def rnd(key, lo, hi):
    h = int(hashlib.md5(str(key).encode()).hexdigest()[:8], 16) / 0xffffffff; return lo + (hi - lo) * h

# ------------------------------------------------------------------ load + time
def load(path):
    F = json.load(open(path, encoding="utf-8")); F["_dir"] = os.path.dirname(os.path.abspath(path)); F.setdefault("fps", FPS)
    wp = os.path.join(F["_dir"], F.get("words", "voice/words.json"))
    F["_words"] = json.load(open(wp, encoding="utf-8")) if os.path.exists(wp) else []
    for w in F["_words"]: w["_k"] = w["w"].strip(" .,?!\"';:-").lower()
    F["_end"] = fr(F, F["end"]) if "end" in F else int(round((F["_words"][-1]["e"] + 0.6) * F["fps"])) if F["_words"] else 300
    return F
def T(F, word, n=1):
    hits = [w["s"] for w in F["_words"] if w["_k"] == word.lower()]
    if len(hits) < n: raise KeyError("word %r (#%d) is not in words.json" % (word, n))
    return int(round(hits[n - 1] * F["fps"]))
def fr(F, t):
    if isinstance(t, (int, float)): return int(round(t))
    if isinstance(t, dict): return int(round(t["s"] * F["fps"]))
    return T(F, t[0], t[1] if len(t) > 1 else 1) + (t[2] if len(t) > 2 else 0)

# ------------------------------------------------------------------ camera
def _basis(pos, aim, up_hint=None):
    f = vnorm(vsub(aim, pos)); up = up_hint or ([0, 1, 0] if abs(f[2]) > 0.97 else [0, 0, 1])   # top-down shots: keep "up" = world Y so the heading cannot spin
    r = vnorm(vcross(f, up)); u = vcross(r, f); return f, r, u
def _catmull(pts, u):
    """centripetal-ish Catmull-Rom through pts (no overshoot keys), u 0..1 over the whole chain"""
    if len(pts) == 2: return vlerp(pts[0], pts[1], u)
    n = len(pts) - 1; x = min(n - 1e-9, u * n); i = int(x); t = x - i
    p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(n, i + 2)]
    return [0.5 * ((2 * p1[c]) + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t * t + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t ** 3) for c in range(3)]

def camera_segments(F, tv_fix=None):
    """Resolve every station to frames: arrive (at rest from here), depart (travel starts), and the travel into it."""
    tv_fix = tv_fix or {}
    takes = []
    for ti, tk in enumerate(F["takes"]):
        S = []
        for s in tk["stations"]:
            a = fr(F, s["at"]); lead = s.get("lead", D["lead"] if s.get("word") or not isinstance(s["at"], (int, float)) else 0)
            far = F.get("places", {}).get(tk.get("place", ""), {}).get("backdrop", 12.0); d_aim = max(0.3, vlen(vsub(s["aim"], s["pos"])))
            S.append(dict(s, _at=a, _arrive=max(0, a - lead), _far=far))
        S.sort(key=lambda s: s["_arrive"]); takes.append(dict(tk, _i=ti, _S=S))
    takes.sort(key=lambda t: t["_S"][0]["_arrive"])
    for i, tk in enumerate(takes):
        tk["_f0"] = 0 if i == 0 else tk["_S"][0]["_arrive"]; tk["_S"][0]["_arrive"] = tk["_f0"]
        tk["_f1"] = (takes[i + 1]["_S"][0]["_arrive"] if i + 1 < len(takes) else F["_end"]) - 1
        S = tk["_S"]; fps = F["fps"]
        for j, s in enumerate(S):
            if j + 1 < len(S):
                nx = S[j + 1]; gap = nx["_arrive"] - s["_arrive"]
                want = int(round(nx.get("travel", D["travel_max"]) * fps)); hold = int(round(s.get("hold", D["hold"]) * fps))
                tv = max(1, min(want, gap - hold)) if gap - hold >= int(D["travel_min"] * fps) else max(1, min(want, gap // 2))   # too tight: split the gap, the gate will flag it
                if "travel" not in nx: tv = min(tv, int(D["travel_max"] * fps))
                tv = tv_fix.get((ti, nx["_at"]), tv); nx["_tv"] = tv; nx["_gap"] = gap
                s["_depart"] = nx["_arrive"] - tv
            else: s["_depart"] = tk["_f1"] + 1
        for j, s in enumerate(S): _rest_motion(s, S[j - 1] if j else None, takes[0]["_S"][0])
    return takes

def _rest_motion(s, prev, first):
    """How the camera stays alive while it rests at s. Default: a small push (at most PUSH of the distance per frame) plus a slow sideways
    slide round the subject, sized so the backdrop drifts REST_PX px/f as measured (a push alone would have to drive the lens into the
    subject to move a far wall). It keeps sliding the way the camera came from. A station with its own "creep" or "drift" keeps those.
    "ends": true = pos and aim are where the rest ENDS, not where it starts; "loop": true = it ends on the film's first frame."""
    if s.get("loop"): s["pos"] = list(first.get("_pos0", first["pos"])); s["aim"] = list(first.get("_aim0", first["aim"])); s["lens"] = first.get("lens", D["lens"]); s["ends"] = True
    s["_pos0"] = list(s["pos"]); s["_aim0"] = list(s["aim"])
    v = vsub(s["aim"], s["pos"]); d = max(0.3, vlen(v)); far = s["_far"]; want = REST_PX.get(s.get("framing", "W"), 1.4)
    own = "creep" in s or "drift" in s
    s["_creep"] = s["creep"] if "creep" in s else PUSH
    if "drift" in s: s["_slide"] = vmul(s["drift"], 1.0 / FPS); s["_slide_aim"] = s.get("drift_aim", 0.0)
    elif own: s["_slide"] = [0.0, 0.0, 0.0]; s["_slide_aim"] = 0.0
    else:
        up = s.get("up") or [0, 0, 1]; r = vcross(v, up); r = vnorm(r) if vlen(r) > 1e-6 else [1.0, 0.0, 0.0]
        if prev is not None and not s.get("loop") and vdot(r, vsub(s["pos"], prev["_pos0"])) < 0: r = vmul(r, -1.0)    # a loop's last rest slides like the first one, so the join has no change of direction
        fpx = 0.5 / math.tan(math.radians(fov_v(s.get("lens", D["lens"]))) / 2) * PXH
        if far > 1.5 * d: m = want * d * far / (SEEN * fpx * (far - d)); s["_slide_aim"] = 0.0          # an arc round the aim
        else: m = want * far / (SEEN * fpx); s["_slide_aim"] = 1.0                                         # backdrop right behind the subject: a truck
        s["_slide"] = vmul(r, m)
    if s.get("ends"):                                                                                      # walk the rest backwards from its last frame
        k = max(0, s["_depart"] - s["_arrive"] - 1); c = s["_creep"]; dk = vmul(s["_slide"], k)
        a0 = vsub(s["aim"], vmul(dk, s["_slide_aim"])); p_push = vsub(s["pos"], dk)
        s["pos"] = vadd(a0, vmul(vsub(p_push, a0), 1.0 / (1 - c) ** k)) if c else p_push; s["aim"] = a0

def _rest_pose(s, k):
    """pose k frames into the rest at station s: a slow push toward the aim (creep), never parked unless creep = 0"""
    c = s.get("_creep", s.get("creep", PUSH)); pos = s["pos"]; aim = s["aim"]
    if c: pos = vadd(pos, vmul(vsub(aim, pos), 1 - (1 - c) ** k))
    if s.get("_slide"): d = vmul(s["_slide"], float(k)); pos = vadd(pos, d); aim = vadd(aim, vmul(d, s.get("_slide_aim", 0.0)))    # sideways slide; _slide_aim 1 = a pure truck, 0 = an arc around the aim
    return pos, aim, s.get("lens", D["lens"])

def bake_camera(F):
    """Bake, then give every travel that would run too fast more frames (taken from the rest before it, down to min_hold). Two passes."""
    fix = {}
    for _ in range(3):
        cam, takes = _bake(F, fix); sp = screen_speed(cam); changed = False; f2i = {c["f"]: i for i, c in enumerate(cam)}
        for tk in takes:
            S = tk["_S"]
            for j in range(len(S) - 1):
                nx = S[j + 1]; a, b = S[j]["_depart"], nx["_arrive"]; pk = max([sp[f2i[f]] for f in range(a, b + 1) if f in f2i] or [0])
                if pk > D["peak"] * 1.08 and "travel" not in nx:
                    room = nx["_gap"] - int(round(S[j].get("min_hold", D["min_hold"]) * F["fps"])); want = int(math.ceil(nx["_tv"] * pk / D["peak"]))
                    new = max(nx["_tv"], min(want, room, int(D["travel_max"] * F["fps"])))
                    if new > nx["_tv"]: fix[(tk["_i"], nx["_at"])] = new; changed = True
        if not changed: break
    apply_clings(F, cam); apply_looks(F, cam)
    return cam, takes

def _bake(F, tv_fix=None):
    takes = camera_segments(F, tv_fix); out = []; fps = F["fps"]
    perf = F.get("_perf") or F.setdefault("_perf", bake_performance(F))             # stations with "follow": the camera trucks with that character
    kicks = [(fr(F, k["at"]), k.get("amp", 1.5)) for k in F.get("kicks", [])]
    for tk in takes:
        S = tk["_S"]
        for f in range(tk["_f0"], tk["_f1"] + 1):
            j = max(i for i, s in enumerate(S) if s["_arrive"] <= f); s = S[j]; roll = s.get("roll", 0.0); state = "rest"
            if f < s["_depart"] or j + 1 >= len(S):
                pos, aim, lens = _rest_pose(s, f - s["_arrive"])
                if s.get("follow") in perf:                                            # tracking burst: keep the walker in frame, same offset as on arrival
                    d = vmul(vsub(perf_at(perf[s["follow"]], f)["pos"], perf_at(perf[s["follow"]], s["_arrive"])["pos"]), s.get("follow_k", 1.0)); pos = vadd(pos, d); aim = vadd(aim, d)
            else:
                nx = S[j + 1]; p0, a0, l0 = _rest_pose(s, s["_depart"] - s["_arrive"])
                if s.get("follow") in perf:
                    d = vmul(vsub(perf_at(perf[s["follow"]], s["_depart"])["pos"], perf_at(perf[s["follow"]], s["_arrive"])["pos"]), s.get("follow_k", 1.0)); p0 = vadd(p0, d); a0 = vadd(a0, d)
                u = smoother((f - s["_depart"]) / float(nx["_arrive"] - s["_depart"])); state = "travel"
                pos = _catmull([p0] + [list(v) for v in nx.get("via", [])] + [nx["pos"]], u); aim = vlerp(a0, nx["aim"], u)
                lens = math.exp(math.log(l0) + (math.log(nx.get("lens", D["lens"])) - math.log(l0)) * u)        # zoom feels even in log focal length
                roll = s.get("roll", 0.0) + (nx.get("roll", 0.0) - s.get("roll", 0.0)) * u + nx.get("travel_roll", 0.0) * math.sin(math.pi * u) ** 2   # dutch only inside the move, back to level on landing
            for kf, amp in kicks:                                                                                  # impact kick: flips sign every frame, gone in 7
                if 0 <= f - kf < 7: roll += amp * (1 - (f - kf) / 7.0) * (1 if (f - kf) % 2 == 0 else -1); aim = vadd(aim, [0, 0, 0.012 * amp * (1 - (f - kf) / 7.0) * (1 if (f - kf) % 2 == 0 else -1)])
            kicked = any(0 <= f - kf < 8 for kf, amp in kicks)
            out.append(dict(f=f, kick=kicked, take=tk.get("id", "t%d" % tk["_i"]), place=tk.get("place", ""), backdrop=F.get("places", {}).get(tk.get("place", ""), {}).get("backdrop", 12.0), station=j, state=state, cut=(f == tk["_f0"] and f > 0),
                            pos=[round(v, 4) for v in pos], aim=[round(v, 4) for v in aim], up=s.get("up"), roll=round(roll, 3), lens=round(lens, 2), fov_v=round(fov_v(lens), 2),
                            subject=s.get("subject"), framing=s.get("framing", "W"), shows=s.get("shows", [])))
    return out, takes

def project(c, P):
    """world point -> (x, y) as fractions of frame width / height (0,0 top-left), plus depth. None if behind the lens."""
    f, r, u = _basis(c["pos"], c["aim"], c.get("up")); d = vsub(P, c["pos"]); z = vdot(d, f)
    if z <= 0.02: return None
    fy = 0.5 / math.tan(math.radians(c["fov_v"]) / 2); x, y = vdot(d, r) / z * fy * PXH, vdot(d, u) / z * fy * PXH
    if c["roll"]:
        a = math.radians(c["roll"]); x, y = x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)
    return 0.5 + x / PXW, 0.5 - y / PXH, z

TILES = [((cx + 0.5) / 3.0, y) for y in (0.16, 0.425, 0.885) for cx in range(3)]      # the pixel instrument's 9 tiles (it masks the caption band too)
PUSH = 0.0015                        # default push while resting: share of the distance to the aim per frame (about 3 % over a 0.7 s rest)
SEEN = 0.70                          # the instrument reads about 70 % of the geometric background motion (fitted on three renders of the example film, 2026-11-09)
def _solve(A, y):
    n = len(y)
    for i in range(n):
        p = max(range(i, n), key=lambda k: abs(A[k][i])); A[i], A[p] = A[p], A[i]; y[i], y[p] = y[p], y[i]
        if abs(A[i][i]) < 1e-12: return [0.0] * n
        for k in range(i + 1, n):
            m = A[k][i] / A[i][i]; y[k] -= m * y[i]
            for l in range(i, n): A[k][l] -= m * A[i][l]
    x = [0.0] * n
    for i in range(n - 1, -1, -1): x[i] = (y[i] - sum(A[i][l] * x[l] for l in range(i + 1, n))) / A[i][i]
    return x

def _smooth(v, s=1.2):
    r = int(4 * s); k = [math.exp(-0.5 * (i / s) ** 2) for i in range(-r, r + 1)]; t = sum(k); n = len(v)
    return [sum(k[j + r] * v[min(n - 1, max(0, i + j))] for j in range(-r, r + 1)) / t for i in range(n)]

def screen_speed(cam):
    """px/f at 720x1280 as tools/measure/film_motion.py will MEASURE it on the rendered film, so plan numbers and Rick's numbers are
    the same unit. The instrument fits one shift + zoom to 9 tiles of the picture, and the picture is mostly background, so this
    projects the backdrop (place key "backdrop", metres from the lens, default 12) through consecutive cameras, fits the same model,
    smooths the same way and scales by SEEN. Checked against five measured renders of the example film: rest share within 10 points on all five;
    with close cameras (the fifth) the plan reads moving speeds low (median 2.6 against 4.6 measured, p90 18 against 24). Re-fit SEEN after a real episode.
    Under about 0.7 px/f here the instrument reads the camera as dead still (< 0.3 px/f measured)."""
    n = len(cam); T = [(0.0, 0.0, 0.0)] * n
    for i in range(1, n):
        a, b = cam[i - 1], cam[i]
        if b["cut"]: continue
        far = a.get("backdrop") or 12.0; f, r, u = _basis(a["pos"], a["aim"], a.get("up")); fy = 0.5 / math.tan(math.radians(a["fov_v"]) / 2); N = [[0.0] * 4 for _ in range(4)]; Y = [0.0] * 4
        for sx, sy in TILES:
            x, y = (sx - 0.5) * PXW / (fy * PXH), (0.5 - sy) / fy
            if a["roll"]:
                g = -math.radians(a["roll"]); x, y = x * math.cos(g) - y * math.sin(g), x * math.sin(g) + y * math.cos(g)
            q = project(b, vadd(a["pos"], vmul(vnorm(vadd(f, vadd(vmul(r, x), vmul(u, y)))), far)))
            if not q: continue
            px, py = (sx - 0.5) * PXW, (sy - 0.5) * PXH; dx, dy = (q[0] - sx) * PXW, (q[1] - sy) * PXH
            for row, val in (([1, 0, px, -py], dx), ([0, 1, py, px], dy)):
                for k in range(4):
                    Y[k] += row[k] * val
                    for l in range(4): N[k][l] += row[k] * row[l]
        tx, ty, za, _ = _solve(N, Y); T[i] = (tx, ty, za)
    sp = [0.0] * n; i = 0
    while i < n:                                     # smooth inside each take only (the instrument zeroes the cut frames)
        j = i + 1
        while j < n and not cam[j]["cut"]: j += 1
        X, Yv, Z = (_smooth([t[k] for t in T[i:j]]) for k in range(3))
        for k in range(i, j): sp[k] = SEEN * math.hypot(math.hypot(X[k - i], Yv[k - i]), Z[k - i] * CORNER)
        i = j
    return sp

# ------------------------------------------------------------------ performance (acting, faces, mouths, blinks)
VIS = [("mbp", "MBP"), ("fv", "FV"), ("l", "L"), ("wq", "WQ"), ("cdgkstnxzjryh", "CDGK"), ("ai", "AI"), ("e", "E"), ("o", "O"), ("u", "U")]
def visemes(word):
    out = []
    for ch in word.lower():
        for letters, name in VIS:
            if ch in letters:
                if not out or out[-1] != name: out.append(name)
                break
    return out or ["rest"]

def bake_performance(F):
    """Per character: one state per frame, then run-length packed. Rules baked in (all measured on Rick or set by CB):
    face swaps 0-3 f BEFORE the word (lead varies so it never reads as machine timing), the body pose follows the face by 1 f,
    a blink covers every face swap, blinks every 0.5-2.3 s for 4 f (half, shut, shut, half), never while that character talks,
    never inside a punch hold; mouths change every 2 f across quoted words; a landed pose is dead still (no idle motion);
    position changes are fast-in / slow-settle with no overshoot; walks move at a steady pace with a step cycle."""
    fps = F["fps"]; end = F["_end"]; res = {}
    acts = sorted(F.get("acts", []), key=lambda a: fr(F, a["at"]))
    for who, info in F.get("cast", {}).items():
        mine = [a for a in acts if a["who"] == who]
        if not mine: continue
        f0 = fr(F, mine[0]["at"]) if mine[0].get("enter") else 0
        st = dict(view="front", dir=1, pose="stand", face="standard", prop=None, hand=None, pos=list(mine[0].get("pos", [0, 0, 0])), visible=True, look=None, look_full=False, walk_pose=None, cling=None)
        frames = [None] * end; talk = [False] * end; punch = [False] * end; swaps = []
        keys = []                                                                # (frame, field changes)
        for a in mine:
            t = fr(F, a["at"]); isword = not isinstance(a["at"], (int, float)) and not isinstance(a["at"], dict)
            lead = int(round(rnd((who, t, "lead"), 0, 3))) if isword and a.get("lead") is None else a.get("lead", 0)
            tf = max(0, t - lead); first = a is mine[0]                          # the face moves first
            if "face" in a:
                keys.append((tf, dict(face=a["face"])))
                if not first: swaps.append(tf)
            body = {k: a[k] for k in ("view", "dir", "pose", "prop", "hand", "visible", "look", "look_full", "walk_pose", "cling") if k in a}
            if body: keys.append((tf + (1 if "face" in a and not first else 0), body))   # the body follows one frame later
            if "pos" in a and not first: keys.append((tf + 1, dict(_move=(list(a["pos"]), a.get("walk", False), int(round(a.get("move_s", 0.5) * fps)), bool(a.get("linear"))))))
            if a.get("exit"): keys.append((tf, dict(visible=False)))
            if "say" in a:                                                       # quoted line: [first word index, last word index] in words.json
                i0, i1 = a["say"]
                for w in F["_words"][i0:i1 + 1]:
                    a0, b0 = int(round(w["s"] * fps)), int(round(w["e"] * fps)); v = visemes(w["_k"]); n = max(1, (b0 - a0) // 2)
                    for k in range(a0, min(end, b0)): talk[k] = True; frames_m = v[min(len(v) - 1, (k - a0) * len(v) // max(1, b0 - a0))] if len(v) > n else v[min(len(v) - 1, (k - a0) // 2)]; keys.append((k, dict(_mouth=frames_m)))
            if a.get("punch"):
                for k in range(tf, min(end, tf + int(a.get("punch_s", 1.0) * fps))): punch[k] = True
        keys.sort(key=lambda k: k[0]); ki = 0; move = None; mouth = None
        for f in range(end):
            mouth = None
            while ki < len(keys) and keys[ki][0] <= f:
                ch = dict(keys[ki][1]); ki += 1
                if "_move" in ch:
                    to, walk, dur, lin = ch.pop("_move")
                    if move:                                                                                 # a new move that starts before the last one has landed starts from where the figure IS (2026-11-10: it used to snap back to the old start)
                        m0, d0, a_, b_ = move[:4]; u0 = min(1.0, (f - m0) / float(d0)); st["pos"] = vlerp(a_, b_, u0 if (move[4] or move[5]) else fast_in(u0))
                    dist = vlen(vsub(to, st["pos"]))
                    if walk: dur = max(dur, int(dist / info.get("walk_speed", 1.1) * fps))
                    move = (f, max(1, dur), list(st["pos"]), to, walk, lin)
                if "_mouth" in ch: mouth = ch.pop("_mouth")
                st.update(ch)
            if talk[f] and mouth is None: mouth = frames[f - 1]["mouth"] if f and frames[f - 1] and frames[f - 1]["mouth"] else "rest"
            pos = st["pos"]; step = None
            if move:
                m0, dur, a_, b_, walk, lin = move; u = (f - m0) / float(dur)
                if u >= 1: st["pos"] = pos = list(b_); move = None
                else:
                    pos = vlerp(a_, b_, u if (walk or lin) else fast_in(u)); step = int((f - m0) / (fps * 0.27)) % 2 if walk else None    # walk: a step every ~8 f (Rick stride 1.07 head widths)
            frames[f] = dict(view=st["view"], dir=st["dir"], pose=st["pose"] if step is None else "%s%d" % (st.get("walk_pose") or "walk", step), face=st["face"], mouth=mouth if talk[f] else None,
                             blink=None, prop=st["prop"], hand=st["hand"], pos=[round(v, 4) for v in pos], visible=st["visible"] and f >= f0)
            walking = bool(move and move[4] and F.get("auto_view"))
            look = list(move[3]) if walking else st.get("look")                                              # a walker faces where it walks to
            if look is not None:
                frames[f]["look"] = look
                if walking or st.get("look_full"): frames[f]["look_full"] = True
            if st.get("cling"): frames[f]["cling"] = st["cling"]
        # blinks: one covering each face swap, then every 0.5-2.3 s; 4 frames; never while talking or in a punch hold
        marks = sorted(set(max(0, s - 1) for s in swaps)); f = int(rnd((who, "b0"), 0.5, 2.3) * fps)
        while f < end: marks.append(f); f += int(rnd((who, f), 0.5, 2.3) * fps)
        last = -99
        for m in sorted(marks):
            if m - last < 8 or m + 4 > end or any(talk[m:m + 4]) or (any(punch[m:m + 4]) and m + 1 not in swaps): continue
            for k, b in enumerate(("half", "closed", "closed", "half")): frames[m + k]["blink"] = b
            last = m
        runs = []
        for f, s in enumerate(frames):
            if runs and runs[-1]["state"] == s: runs[-1]["f1"] = f
            else: runs.append(dict(f0=f, f1=f, state=s))
        res[who] = runs
    return res

def _pack(frames):
    runs = []
    for f, s in enumerate(frames):
        if runs and runs[-1]["state"] == s: runs[-1]["f1"] = f
        else: runs.append(dict(f0=f, f1=f, state=s))
    return runs

def apply_looks(F, cam):
    """CB 2026-11-10: never squash a character; show the full silhouette from front, 3/4, side or back. A character with "look"
    (a world point, a cast name or "cam") gets the drawn view that fits the angle between where it faces and where the lens is:
    under 28 deg front, under 68 deg 3/4, under 125 deg side, else back; dir = the screen side it faces. 6 deg hysteresis, so a slow
    camera move does not flicker between two drawings."""
    perf = F.get("_perf") or {}; lim = (28.0, 68.0, 125.0); names = ("front", "34", "side", "back"); cmap = {c.get("f", i): c for i, c in enumerate(cam)}
    for who, runs in perf.items():
        if not any("look" in r["state"] for r in runs): continue
        frames = []
        for r in runs: frames += [dict(r["state"]) for _ in range(r["f0"], r["f1"] + 1)]
        prev = None
        for f, s in enumerate(frames):
            lk = s.get("look")
            if lk is None or f not in cmap: prev = None; continue
            P = s["pos"]; C = cmap[f]["pos"]
            T = C if lk == "cam" else perf_at(perf[lk], f)["pos"] if isinstance(lk, str) else lk
            d = (T[0] - P[0], T[1] - P[1]); c = (C[0] - P[0], C[1] - P[1]); ld = math.hypot(*d); lc = math.hypot(*c)
            if ld < 1e-4 or lc < 1e-4: prev = None; continue
            d = (d[0] / ld, d[1] / ld); c = (c[0] / lc, c[1] / lc)
            ang = math.degrees(math.acos(max(-1.0, min(1.0, d[0] * c[0] + d[1] * c[1]))))
            L = lim if s.get("look_full") else (28.0, 110.0, 150.0)             # standing and acting: cheated open to the lens (3/4 up to 110 deg, side up to 150 deg, back only for a target straight behind); walking or look_full: the true view, back included
            i = 0 if ang < L[0] else 1 if ang < L[1] else 2 if ang < L[2] else 3
            if prev is not None and abs(prev - i) == 1 and abs(ang - L[min(prev, i)]) < 6.0: i = prev       # only between NEIGHBOUR views (2026-11-10: a jump from back to front near 28 deg used to stay 'back')
            side = d[0] * (-c[1]) + d[1] * c[0]                                  # + = it faces the right of the picture (right = forward x up, forward = -c)
            s["view"] = names[i]; s["dir"] = (1 if side >= 0 else -1) if i in (1, 2) else s.get("dir", 1) if i == 0 else 1; prev = i
        perf[who] = _pack(frames)
    return perf

def apply_clings(F, cam):
    """CB 2026-11-10: a body cannot pass through a lever. An act with "cling": "<solid name>" hangs the character on that rod: its hands are on
    the rod's top end ON SCREEN, and the card sits just on the lens side of the whole rod, whatever the rod's angle and wherever the camera is.
    (A card always faces the lens, so the gap in depth between hands and knob is never seen.) cast "grip_h" = hand height above the feet when hanging."""
    perf = F.get("_perf") or {}; solids = {so["name"]: so for so in F.get("solids") or []}; cmap = {c.get("f", i): c for i, c in enumerate(cam)}
    for who, runs in perf.items():
        if not any(r["state"].get("cling") for r in runs): continue
        frames = []
        for r in runs: frames += [dict(r["state"]) for _ in range(r["f0"], r["f1"] + 1)]
        cc = F["cast"][who]; H = cc.get("height", 1.7); grip = cc.get("grip_h", 1.3 * H); off = None; since = 0; start = None
        for f, s in enumerate(frames):
            so = solids.get(s.get("cling") or "")
            if so is None or f not in cmap:
                start = None
                if off is not None and since < 5: since += 1; k = 1 - since / 5.0; s["pos"] = [round(s["pos"][i] + off[i] * k, 4) for i in range(3)]     # let go: ease back onto the acted position
                else: off = None
                continue
            if start is None: start = f
            A, B = solid_seg(F, so, f); C = cmap[f]["pos"]; w = vnorm(vsub(C, B)); e = max(0.0, vdot(vsub(A, B), w)); m = so.get("r", 0.03) + 0.07 + e
            G = [B[0] + w[0] * m, B[1] + w[1] * m, B[2] + w[2] * m]                                          # G = where the hands are: on the knob as the lens sees it, a little nearer
            g_up, g_lat = grip, 0.0
            if str(s.get("pose") or "").startswith("hang_s"):                                                # SIDE hang (poses.mjs 'aboveSide', SIDE_GRIP): the hands are up beside the head, so the body hangs NEXT to the rod and the rod stays in view
                HR = H / cc.get("heads_tall", 2.9) / 2.0; gs = cc.get("grip_side") or [1.7 * HR, H + 0.05 * HR]
                g_lat = gs[0] * (s.get("dir") or 1) * (-1 if s.get("view") == "back" else 1); g_up = gs[1]
            want = [G[0], G[1], G[2] - g_up]
            for _ in range(3):                                                                               # the card tips to face a high or low lens (pivot at the feet), so the feet go where the tipped card puts the hands on G
                n_ = vnorm(vsub(C, [want[0], want[1], want[2] + H * 0.55])); r_ = vnorm(vcross([0, 0, 1], n_)); up_ = vcross(n_, r_); want = [G[i] - up_[i] * g_up - r_[i] * g_lat for i in range(3)]
            k = 1.0 if start == 0 else min(1.0, (f - start + 1) / 5.0)                                   # grab: ease from the acted position onto the rod (a film that opens on a hang starts on the rod)
            new = [s["pos"][i] + (want[i] - s["pos"][i]) * k for i in range(3)]
            off = [new[i] - s["pos"][i] for i in range(3)]; s["pos"] = [round(v, 4) for v in new]; since = 0
        perf[who] = _pack(frames)
    return perf

def perf_at(runs, f):
    lo, hi = 0, len(runs) - 1
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if runs[mid]["f0"] <= f: lo = mid
        else: hi = mid - 1
    return runs[lo]["state"]

# ------------------------------------------------------------------ gates
def head_box(F, who, st):
    c = F["cast"][who]; H = c.get("height", 1.7); hh = H / c.get("heads_tall", 2.9); hw = hh * c.get("head_aspect", 0.95)
    p = st["pos"]; return [p[0], p[1], p[2] + H - hh / 2], hw, hh, H

def _ev_val(evs, obj, f, default=0.0):
    """Value of a place event object at frame f (same easing as the sets: smootherstep between f0 and f1)."""
    l = [e for e in evs if e.get("obj") == obj]
    if not l: return default
    l.sort(key=lambda e: e["f0"])
    if f <= l[0]["f0"]: return l[0]["from"]
    e = l[0]
    for k in l:
        if k["f0"] <= f: e = k
    if f >= e["f1"]: return e["to"]
    u = (f - e["f0"]) / float(max(1, e["f1"] - e["f0"])); u = u * u * u * (u * (u * 6 - 15) + 10)
    a, b = e["from"], e["to"]
    return [a[i] + (b[i] - a[i]) * u for i in range(len(a))] if isinstance(a, list) else a + (b - a) * u

def solid_seg(F, so, f):
    """A solid of film.json "solids" as a segment [A, B] at frame f. {"seg": [A, B]} is fixed; {"pivot", "len", "lean_deg": [d0, d1], "obj"} is a
    rod hinged at pivot that leans toward -Y by d0..d1 degrees with the place event `obj` (0..1), like a signal lever."""
    if "seg" in so: return so["seg"][0], so["seg"][1]
    evs = F.get("places", {}).get(so.get("place", ""), {}).get("events", [])
    d0, d1 = so.get("lean_deg", [0, 0]); a = math.radians(d0 + (d1 - d0) * float(_ev_val(evs, so.get("obj"), f, 0.0))); P = so["pivot"]; L = so["len"]
    return P, [P[0], P[1] - math.sin(a) * L, P[2] + math.cos(a) * L]

def pierced(F, cam, perf):
    """PHYSICAL gate (CB 2026-11-10: "the monkey body go through the lever many times ... a physical person can not do that").
    A character is a flat card that faces the lens. A rod that is partly in front of the card and partly behind it, inside the body's outline,
    is seen coming out THROUGH the body. Returns {(who, solid): [frames]} for every frame where that is on screen."""
    out = {}; solids = F.get("solids") or []
    if not solids: return out
    for c in cam:
        f = c["f"]; C = c["pos"]
        for who, runs in perf.items():
            st = perf_at(runs, f)
            if not st.get("visible", True): continue
            info = F["cast"][who]; H = info.get("height", 1.7); hw = info.get("body_halfwidth", 0.2 * H if info.get("heads_tall", 3) > 2.4 else 0.34 * H); P = st["pos"]
            if "hang" in str(st.get("pose", "")) or "reach" in str(st.get("pose", "")) or "hold_up" in str(st.get("pose", "")): top = H * 1.25
            else: top = H
            n = [C[0] - P[0], C[1] - P[1], C[2] - (P[2] + H * 0.55)]; ln = vlen(n)
            if ln < 1e-6: continue
            n = vmul(n, 1.0 / ln); right = vnorm(vcross([0, 0, 1], n)); up = vcross(n, right)
            for so in solids:
                if so.get("place") and so["place"] != c.get("place"): continue
                A, B = solid_seg(F, so, f); r = so.get("r", 0.03)
                dA = vdot(vsub(A, P), n); dB = vdot(vsub(B, P), n)
                if (dA > r and dB > r) or (dA < -r and dB < -r): continue                 # wholly in front of the card, or wholly behind it
                # the stretch of the rod that lies within r of the card plane or crosses it
                den = dB - dA; ts = [0.0, 1.0] if abs(den) < 1e-9 else sorted([max(0.0, min(1.0, (-r - dA) / den)), max(0.0, min(1.0, (r - dA) / den))])
                hit = False
                for t in (ts[0], (ts[0] + ts[1]) / 2, ts[1]):
                    X = vlerp(A, B, t); d = vsub(X, P); u = vdot(d, right); v = vdot(d, up)
                    inside_head = (v > H - 2 * (H / info.get("heads_tall", 2.9)) * 0.5 and abs(u) < hw)
                    if abs(u) < hw * 0.8 and 0.02 * H < v < top * 0.97 and project(c, X) is not None: hit = True
                if hit: out.setdefault((who, so["name"]), []).append(f)
    return out

def check(F, cam=None, perf=None):
    fps = F["fps"]; cam, takes = (cam, camera_segments(F)) if cam else bake_camera(F); perf = perf or F.get("_perf") or bake_performance(F)
    n = len(cam); dur = n / float(fps); sp = screen_speed(cam); R = []
    def gate(group, name, val, ok, warn, target, fix): R.append(dict(group=group, name=name, value=val, status="PASS" if ok else "WARN" if warn else "FAIL", target=target, fix="" if ok else fix))
    live = [i for i in range(n) if not cam[i]["cut"]]
    settled = [sp[i] < SETTLED for i in range(n)]
    # runs of rest / travel on the measured definition (gaps <= 2 f joined, holds >= 6 f)
    def spans(mask, merge=2):
        m = list(mask); i = 0
        while i < n:
            if not m[i]:
                j = i
                while j < n and not m[j]: j += 1
                if 0 < i and j < n and j - i <= merge:
                    for k in range(i, j): m[k] = True
                i = j
            else: i += 1
        out = []; i = 0
        while i < n:
            if m[i]:
                j = i
                while j < n and m[j] and not (cam[j]["cut"] and j > i): j += 1
                out.append((i, j - i)); i = j
            else: i += 1
        return out
    holds = [(a, l) for a, l in spans(settled) if l >= 6]; travels = [(a, l) for a, l in spans([not s for s in settled])]
    hl = [l / float(fps) for a, l in holds]; tl = [l / float(fps) for a, l in travels]
    v = [sp[i] for i in live]
    ps = 100.0 * sum(settled[i] for i in live) / max(1, len(live))
    gate("camera", "at rest (< 2 px/f), % of frames", round(ps, 1), ps >= 30, ps >= 21, ">= 30 (Rick median 32, range 6-58)", "add or lengthen station holds; fewer stations per sentence")
    h10 = 10.0 * len(holds) / dur
    gate("camera", "rests per 10 s", round(h10, 2), 2.2 <= h10 <= 4.5 or (h10 > 4.5 and dur < 30), h10 >= 0.9, "2.2-4.5, aim 3 (Rick 3.1, range 0.9-4.7; the plan reads about 1 higher than the picture). CB 2026-11-10: the scene decides, but the camera must flow like his", "break long travels with a resting station on the next noun" if h10 < 2.2 else "station hopping: merge neighbouring stations and let ONE move flow through them (follow the thing that moves, cross the set, rise over it)")
    hp = pct(hl, 50)
    gate("camera", "rest length median, s", round(hp, 2), hp >= 0.6, hp >= 0.45, ">= 0.6 (Rick 0.62); one in ten >= 1.8", "raise hold on short stations, or drop a station")
    tp = max(tl) if tl else 0.0
    gate("camera", "longest travel, s", round(tp, 2), (3.0 <= tp <= 7.0) or dur < 30, tp <= 9.5, "3-7 in a film of 30 s or more: at least one long flowing move (Rick's long travels: median 3.0, upper quarter 4.8-9.5; Railroads and Roller Coasters 4.7)", "insert a resting station inside the long move" if tp > 7.0 else "every move is a short hop: where the scene has something to follow (a train, a walk, a falling thing, a line of rails) let one move run 4-5 s (station key travel)")
    p50, p90 = pct(v, 50), pct(v, 90)
    gate("camera", "speed median px/f", round(p50, 2), 2.0 <= p50 <= 6.1, 1.55 <= p50 <= 8.1, "about 4 (Rick 4.1, middle half 2.5-6.1)", "too calm: raise the creep on the rests, add a drift, or lengthen the travels" if p50 < 2.0 else "too busy: fewer stations, slower travels")
    gate("camera", "speed p90 px/f", round(p90, 1), 15 <= p90 <= 27.4, 9.8 <= p90 <= 33.8, "about 23 (Rick 23, range 9.8-33.8)", "the travels crawl: cover more distance or take fewer frames (set travel on the station)" if p90 < 15 else "give fast travels more frames or less distance")
    fz = 100.0 * sum(1 for i in live if sp[i] < 0.7) / max(1, len(live))
    gate("camera", "dead still (reads under 0.3 px/f when measured), % of frames", round(fz, 1), fz <= 21, fz <= 29, "<= 21, aim 9 (Rick 9.3, range 1-29)", "the rests are parked: raise creep on those stations or add a drift")
    pk = max(v) if v else 0
    gate("camera", "speed peak px/f", round(pk, 1), pk <= 60, pk <= 90, "<= 60 outside planned whips", "only passes and whips may exceed 40, for <= 10 f with motion blur")
    cuts = sum(1 for c in cam if c["cut"]); c10 = 10.0 * cuts / dur
    gate("camera", "cuts per 10 s", round(c10, 2), c10 <= 0.9, c10 <= 1.66, "<= 0.9, aim 0.4 (Rick 0.4; CB: fewer cuts)", "merge takes: travel between framings inside one take, cut only on a place or time jump")
    rr = [abs(cam[i]["roll"] - cam[i - 1]["roll"]) for i in live if i > 0 and not cam[i]["cut"] and not cam[i]["kick"]]
    rest_roll = max([abs(cam[i]["roll"]) for i in live if cam[i]["state"] == "rest" and settled[i] and not cam[i]["kick"]] or [0])
    gate("camera", "tilt while resting, deg", round(rest_roll, 2), rest_roll <= 0.5, rest_roll <= 1.8, "level (<= 0.5); tilt only inside a move (Rick: 0 % of holds)", "use travel_roll on the move instead of roll on the station")
    gate("camera", "roll rate peak deg/f", round(max(rr or [0]), 2), max(rr or [0]) <= 1.1, max(rr or [0]) <= 2.4, "<= 1.1 (Rick p99 1.08)", "lower travel_roll or lengthen that travel")
    lens_bad = [c["lens"] for c in cam if c["framing"] != "O" and not 16 <= c["lens"] <= 55]
    gate("camera", "lens outside 16-55 mm on non-insert frames, %", round(100.0 * len(lens_bad) / n, 1), not lens_bad, len(lens_bad) < 0.05 * n, "wide and close: about 24 mm = 73 deg tall (Rick, measured); long lenses only for object inserts", "move the camera closer instead of zooming")
    # turning round: a travel that swings the view more than 120 deg reads as a jump cut
    rev = 0
    for tk in takes:
        S = tk["_S"]
        for s0, s1 in zip(S, S[1:]):
            h0, h1 = vsub(s0["aim"], s0["pos"]), vsub(s1["aim"], s1["pos"]); h0[2] = h1[2] = 0
            if vlen(h0) > 0.05 and vlen(h1) > 0.05 and vdot(vnorm(h0), vnorm(h1)) < -0.5: rev += 1
    gate("camera", "travels that swing the view over 120 deg", rev, rev == 0, rev <= 1, "0: lay the places along the travel direction so the camera never turns back", "re-order the stations, mirror the set, or make that change a hidden cut")
    # word stations: at rest before the word
    late = []
    for tk in takes:
        for s in tk["_S"]:
            if s.get("word") or isinstance(s["at"], list):
                a = s["_at"]
                if a < n and not all(settled[k] for k in range(max(0, a - 1), min(n, a + 3))): late.append("%s@%d" % (s.get("word") or s["at"][0], a))
    gate("camera", "word stations not at rest on their word", len(late), not late, len(late) <= 1, "0: key nouns land with the camera at rest, 0-6 f before the word (CB's rule)", "too little time before: %s. Drop a station or shorten the travel into it" % ", ".join(late[:6]))
    # ---------------- framing, from the baked camera + character positions
    face = [False] * n; headw = []; heady = []; figh = []; feety = []; heads_all = 0; band_all = 0; cutn = 0; fitn = 0; facen = 0; inband = 0; rest_face = 0
    mix = dict(W=0, M=0, C=0, P=0, O=0)
    for i, c in enumerate(cam):
        mix[c["framing"] if c["framing"] in mix else "W"] += 1
        best = None
        for who in perf:
            st = perf_at(perf[who], i)
            if not st["visible"] or st["view"] == "back": continue
            hc, hw, hh, H = head_box(F, who, st); p = project(c, hc)
            if not p: continue
            w = hw / p[2] * (0.5 / math.tan(math.radians(c["fov_v"]) / 2)) * PXH / PXW; h_ = w * PXW / PXH * hh / hw
            if not (-w / 2 < p[0] < 1 + w / 2 and -h_ / 2 < p[1] < 1 + h_ / 2) or w < 0.04: continue
            cut = p[0] - w / 2 < 0 or p[0] + w / 2 > 1 or p[1] - h_ / 2 < 0 or p[1] + h_ / 2 > 1
            if 0 <= p[0] <= 1 and 0 <= p[1] <= 1: heads_all += 1; band_all += CAPTION_BAND[0] <= p[1] <= CAPTION_BAND[1]      # every head counts here: a short character's face under the caption is still a hidden face
            feet = project(c, st["pos"]); fits = (not cut) and feet is not None and 0 <= feet[1] <= 1 and 0 <= feet[0] <= 1
            if best is None or w > best[0]: best = (w, p[1], cut, fits, (feet[1] - (p[1] - h_ / 2)) if feet else None, feet[1] if feet else None)
        if best:
            face[i] = True; facen += 1; headw.append(best[0]); heady.append(best[1]); cutn += best[2]; fitn += best[3]; inband += CAPTION_BAND[0] <= best[1] <= CAPTION_BAND[1]; rest_face += settled[i]
            if c["framing"] == "W" and settled[i] and best[4] is not None: figh.append(best[4]); feety.append(best[5])
    first = next((i for i in range(n) if face[i]), None)
    gate("framing", "first face, s", None if first is None else round(first / float(fps), 2), first is not None and first <= 1.5 * fps, first is not None and first <= 4.5 * fps, "<= 1.5 (Rick median 0.0)", "open on the hero doing the strange act, not on a prop or a place")
    for win in (5, 15):
        k = min(n, win * fps); share = 100.0 * sum(face[:k]) / max(1, k)
        gate("framing", "face on screen, first %d s, %%" % win, round(share, 0), share >= 50, share >= 34, ">= 50 (Rick 55-63)", "keep the hero in frame while the set is introduced")
    g = 0; gmax = 0
    for i in range(n):
        g = 0 if face[i] else g + 1; gmax = max(gmax, g)
    gate("framing", "longest stretch without a face, s", round(gmax / float(fps), 1), gmax <= 6 * fps, gmax <= 9 * fps, "<= 6", "show the noun WITH a character (in hand, beside them) instead of an empty insert")
    fs = 100.0 * facen / n
    gate("framing", "frames with a face, %", round(fs, 0), 45 <= fs <= 68 or (fs > 68 and dur < 30), fs >= 23, "45-68 (Rick 55, range 23-66): about a third of the film belongs to the world and the story object", "fewer object and place frames" if fs < 45 else "a face is on screen almost all the time: give beats to the world (a towering wall, the machine, the vehicle, a view from the air) with the character tiny or absent")
    if headw:
        w50, w90 = pct(headw, 50), pct(headw, 90)
        gate("framing", "head width / frame width, median", round(w50, 2), 0.20 <= w50 <= 0.40, 0.16 <= w50 <= 0.52, "about 0.25 (Rick 0.25, range 0.16-0.52)", "figures are too small: move the camera closer (a whole-body rest sits about 2.4 m from a standing adult at 24 mm)" if w50 < 0.20 else "too close on average: pull back on the whole-body rests")
        gate("framing", "head width / frame width, p90", round(w90, 2), w90 <= 0.55, w90 <= 0.67, "<= 0.55", "the biggest close-ups are too close")
        if figh:
            fh, fy = pct(figh, 50), pct(feety, 50)
            gate("framing", "whole-body rests: figure height / frame height, median", round(fh, 2), 0.36 <= fh <= 0.62, 0.28 <= fh <= 0.70, "about 0.45 (his head width of 0.25 at puppet proportions)", "the figure is small and the floor is empty: move the camera closer, do not zoom" if fh < 0.36 else "the whole body no longer fits with air around it: pull back")
            gate("framing", "whole-body rests: feet height (0 = top), median", round(fy, 2), 0.78 <= fy <= 0.97, 0.70 <= fy <= 1.0, "0.80-0.95: feet near the bottom, at most a fifth of the frame is empty floor", "raise the aim point or come closer so the floor does not fill the lower third" if fy < 0.78 else "lower the aim: the feet leave the frame")
        y50 = pct(heady, 50)
        gate("framing", "head centre height, median (0 = top)", round(y50, 2), 0.39 <= y50 <= 0.51, 0.36 <= y50 <= 0.55, "0.45 (Rick 0.39-0.51), above the caption band", "raise or lower the aim point so faces sit just above centre")
        ib = 100.0 * band_all / max(1, heads_all)
        gate("framing", "head centres inside the caption band, % of all heads on screen", round(ib, 1), ib <= 3, ib <= 8, "<= 3 (Rick 2.7)", "a face sits under the caption (often the short character): re-aim, raise them on a step, or move them out of the 58-76 % band")
        ct = 100.0 * cutn / facen
        gate("framing", "face frames with the head cut by the edge, %", round(ct, 0), ct <= 13, ct <= 31, "<= 13 (Rick 13)", "widen or re-aim the cut-off stations")
        ft = 100.0 * fitn / facen
        gate("framing", "face frames where the whole body fits, %", round(ft, 0), ft >= 65, ft >= 39, ">= 65 (Rick 68)", "pull a medium back until the feet are in, or change who is in the picture instead of the shot size")
        rf = 100.0 * rest_face / facen
        gate("camera", "at rest while a face is on screen, %", round(rf, 0), rf >= 40, rf >= 25, ">= 40 (Rick 41): rest on faces, move on places and objects", "hold on the face, travel between faces")
    tot = float(n); m = {k: 100.0 * v_ / tot for k, v_ in mix.items()}
    gate("framing", "shot mix W/M/C/P/O, % of time", "/".join("%d" % round(m[k]) for k in "WMCPO"), m["O"] <= 15 and m["C"] <= 10 and m["W"] >= 35, m["O"] <= 25 and m["C"] <= 15, "whole body 45, medium 20, close <= 7, place 15, object insert <= 15 (Rick)", "object inserts and close-ups are the two that run over")
    po = m["P"] + m["O"]
    gate("framing", "world-led frames (place + object framing), % of time", round(po), 22 <= po <= 45 or dur < 30, True, "25-40 (Rick: place 15 + object up to 15; his 3D films are about half world-led by eye)", "let the world or the story object fill the frame and make the character tiny or leave them out for that beat; then go very close" if po < 22 else "too few faces: bring the hero back")
    gate("framing", "medium shots, % of time", round(m["M"]), m["M"] <= 28 or dur < 30, True, "about 20 (Rick): the middle size is the dull one", "go wide with the whole body small in a big world, or go close; put something big and close behind the character")
    # ---------------- world: places and light (CB 2026-11-10, comparison with five of Rick's films)
    kinds = sorted(set(c["place"] for c in cam)); lights = {}
    for c in cam: l_ = F.get("places", {}).get(c["place"], {}).get("light", "day"); lights[l_] = lights.get(l_, 0) + 1
    gate("world", "places in the film", len(kinds), len(kinds) >= 4 or dur < 30, True, ">= 4, aim 5-8 at 55 s or more (Rick's 3D films: 5-8 places)", "a story in one place still gets more views of it as places of their own (from the air, inside the vehicle, under the machine, the same set at night); an analogy or cutaway is a small 3D place, never a flat card")
    top = 100.0 * max(lights.values()) / n
    gate("world", "share of the film in its most used light, %", round(top), top <= 75 or dur < 30, True, "<= 75: 2-3 kinds of light per film (day, golden, morning, night, interior); the light changes at the turn of the story", "give the turn or the ending its own light: a second place entry on the same set with another light (golden, night), or move that beat indoors")
    seq = [(s.get("framing", "W"), s.get("subject")) for tk in takes for s in tk["_S"]]; run = mx = 1         # a whole-body shot of someone else is a new picture: Rick is whole-body 68 % of the time, so only the same size on the same subject counts as a repeat
    for a, b in zip(seq, seq[1:]): run = run + 1 if a == b else 1; mx = max(mx, run)
    gate("framing", "same framing on the same subject in a row (stations)", mx, mx <= 3, mx <= 4, "<= 3", "change the shot size, or put someone else in the picture")
    # ---------------- story: every sentence shown, every noun on its word
    sent = F.get("sentences", [])
    if sent:
        shown = 0; missing = []; nouns_bad = []
        for s in sent:
            w0, w1 = s["words"]; a = int(F["_words"][w0]["s"] * fps); b = min(n - 1, int(F["_words"][w1]["e"] * fps)); want = set([s.get("subject")] + s.get("show", [])) - {None}
            vis = set()
            for i in range(a, b + 1): vis.add(cam[i]["subject"]); vis.update(cam[i]["shows"])
            ok = bool(want & vis) if want else True; shown += ok
            if not ok: missing.append(s.get("text", "")[:40])
            for noun in s.get("nouns", []):
                nf = fr(F, noun["at"]) if "at" in noun else T(F, noun["word"], noun.get("n", 1)); what = noun.get("show", noun.get("word"))
                near = range(max(0, nf - int(0.5 * fps)), min(n, nf + int(0.5 * fps)))
                if not any(what == cam[i]["subject"] or what in cam[i]["shows"] for i in near): nouns_bad.append(noun.get("word", what))
        sh = 100.0 * shown / len(sent)
        gate("story", "sentences whose subject or action is on screen, %", round(sh, 0), sh >= 90, sh >= 75, ">= 90 (Rick 91)", "not shown: " + "; ".join(missing[:5]))
        gate("story", "named nouns not on screen within 0.5 s of their word", len(nouns_bad), not nouns_bad, len(nouns_bad) <= 1, "0", "add the noun to a station's subject/shows at its word: " + ", ".join(nouns_bad[:8]))
    else: gate("story", "sentences table", "missing", False, True, "film.json needs 'sentences' so the story gates can run", "add one row per sentence: words [first, last], subject, nouns")
    # ---------------- acting
    changes = 0; frozen = 0.0; frozen_who = ""
    for who, runs in perf.items():
        prev = None; last_change = None
        for r in runs:
            s = r["state"]
            if not s["visible"]: prev = None; last_change = None; continue
            key = ("walk" if s["pose"].startswith("walk") else s["pose"], s["face"], s["view"], s["dir"])
            if prev is not None and key != prev: changes += 1
            if prev is not None and (key != prev or s["pose"].startswith("walk") or s["mouth"]): last_change = r["f0"]
            if last_change is None: last_change = r["f0"]
            still = (r["f1"] - last_change) / float(fps)
            if still > frozen and face[min(n - 1, r["f1"])]:
                # frozen only counts if the camera is also resting and nobody else acts in that window
                if all(settled[k] for k in range(last_change, min(n, r["f1"] + 1))): frozen, frozen_who = still, who
            prev = key
    onscreen = max(1.0, sum(face) / float(fps)); pc = 10.0 * changes / onscreen
    gate("acting", "pose or face changes per 10 s on screen", round(pc, 1), pc >= 4, pc >= 3, ">= 4 (Rick 4.5 on one figure, range 3-7; this counts every figure on screen)", "add an act (face, pose, turn, step, prop beat) on the content words")
    gate("acting", "longest fully frozen figure with a resting camera, s", round(frozen, 1), frozen <= 3, frozen <= 4.5, "<= 3 unless something else moves", "%s: add a face change, or let the camera creep / another character act" % frozen_who)
    props = [a for a in F.get("acts", []) if a.get("prop") and not a.get("hand")]
    gate("acting", "held props without a hand", len(props), not props, False, "0: every held prop is attached to a hand on every frame", "give each prop act a hand: L or R")
    if F.get("solids"):
        pr = pierced(F, cam, perf); bad = []
        for (who, so), fs in sorted(pr.items(), key=lambda kv: kv[1][0]):
            runs_ = []
            for f in fs:
                if runs_ and f <= runs_[-1][1] + 2: runs_[-1][1] = f
                else: runs_.append([f, f])
            bad += ["%s through %s at f %s" % (who, so, ", ".join("%d-%d" % (a_, b_) if b_ > a_ else "%d" % a_ for a_, b_ in runs_[:6]))]
        nfr = len(set(f for fs in pr.values() for f in fs))
        gate("acting", "frames where a solid thing passes THROUGH a character", nfr, nfr == 0, False, "0: a body cannot be inside a lever, a post or a rail (CB 2026-11-10)", "; ".join(bad[:8]) + ". Move the figure to the lens side of the whole rod (or wholly behind it), or change the angle")
    fx = len(F.get("fx", [])); f10 = 10.0 * fx / dur
    gate("acting", "effects per 10 s", round(f10, 1), 1 <= f10 <= 2.5, 0.5 <= f10 <= 3.5, "1-2, on the action noun or verb (Rick)", "add a glint, glow, stamp, coin or dust hit on the key nouns" if f10 < 1 else "too many effects: keep the ones on action words")
    moods = len(F.get("moods", [])); mm = 60.0 * moods / dur
    gate("acting", "mood (light / colour) changes per minute", round(mm, 1), mm >= 10, mm >= 4, ">= 12, in-shot on the word (Rick 13.7, range 3.9-15.5)", "add light or colour shifts on the turn, the proof and the payoff")
    return R, cam, perf, sp

def stations_table(F, cam):
    """one row per camera rest, read back from the bake: the storyboard, the judge and Blender all use these frame numbers"""
    plan = {}
    for ti, tk in enumerate(F["takes"]):
        S = []
        for s in tk["stations"]:
            a = fr(F, s["at"]); lead = s.get("lead", D["lead"] if s.get("word") or not isinstance(s["at"], (int, float)) else 0); S.append((max(0, a - lead), a, s))
        S.sort(key=lambda x: x[0]); plan[tk.get("id", "t%d" % ti)] = S
    rows = []; seen = []
    for c in cam:
        k = (c["take"], c["station"])
        if k not in seen: seen.append(k)
    for k in seen:
        mine = [c for c in cam if (c["take"], c["station"]) == k]; rest = [c["f"] for c in mine if c["state"] == "rest"]; trav = [c["f"] for c in mine if c["state"] == "travel"]
        moving = not rest
        if moving: rest = [mine[0]["f"]]                 # hold 0: the camera passes this pose without stopping; the storyboard still shows it (often frame 0)
        S = plan.get(k[0], []); a, s = (S[k[1]][1], S[k[1]][2]) if k[1] < len(S) else (rest[0], {})
        rows.append(dict(take=k[0], station=k[1], place=mine[0]["place"], word=s.get("word") or (s["at"][0] if isinstance(s.get("at"), list) else None), at=a, arrive=rest[0], depart=rest[-1] + 1,
                         travel_out=len(trav), passes=moving, framing=mine[0]["framing"] if rest[0] == mine[0]["f"] else cam[rest[0]]["framing"], lens=cam[rest[0]]["lens"], subject=cam[rest[0]]["subject"], shows=cam[rest[0]]["shows"]))
    return rows

def write(F, R, cam, perf, sp):
    out = os.path.join(F["_dir"], "out", "plan"); os.makedirs(out, exist_ok=True)
    json.dump(dict(fps=F["fps"], size=F.get("size", [1080, 1920]), stations=stations_table(F, cam), frames=cam), open(os.path.join(out, "camera_baked.json"), "w"))
    json.dump(perf, open(os.path.join(out, "performance_baked.json"), "w"))
    ev = sorted([dict(t=round(fr(F, s["at"]) / float(F["fps"]), 3), name=s["name"], gain=s.get("gain", 0)) for s in F.get("sound", [])], key=lambda e: e["t"])
    json.dump(ev, open(os.path.join(out, "sound_events.json"), "w"), indent=1)
    json.dump(dict(gates=R, speed=[round(s, 2) for s in sp]), open(os.path.join(out, "plan_report.json"), "w"))
    fails = sum(r["status"] == "FAIL" for r in R); warns = sum(r["status"] == "WARN" for r in R)
    L = ["# Plan check: %s" % F.get("title", ""), "", "Camera idea: **%s**. %s" % (F.get("camera_idea", {}).get("name", "none named"), F.get("camera_idea", {}).get("why", "")), "",
         "%d gates: %d pass, %d warn, %d fail. %d frames, %.1f s, %d takes." % (len(R), len(R) - fails - warns, warns, fails, len(cam), len(cam) / float(F["fps"]), len(F["takes"])), "",
         "| | Gate | Value | Target | Fix |", "|-|-|-|-|-|"]
    for r in R: L.append("| %s | %s: %s | %s | %s | %s |" % (r["status"], r["group"], r["name"], r["value"], r["target"], r["fix"]))
    open(os.path.join(out, "plan_report.md"), "w", encoding="utf-8").write("\n".join(L) + "\n")
    return out, fails, warns

if __name__ == "__main__":
    mode, path = sys.argv[1], sys.argv[2]; F = load(path)
    if mode == "bake":
        cam, _ = bake_camera(F); perf = F["_perf"]; out, _, _ = write(F, [], cam, perf, screen_speed(cam)); print("baked", len(cam), "frames ->", out); sys.exit(0)
    R, cam, perf, sp = check(F); out, fails, warns = write(F, R, cam, perf, sp)
    for r in R: print("  %-4s %-8s %-58s %-14s target %s%s" % (r["status"], r["group"], r["name"], r["value"], r["target"], ("\n         FIX: " + r["fix"]) if r["fix"] else ""))
    print("RESULT: %d FAIL, %d WARN of %d gates. Baked files and plan_report.md in %s" % (fails, warns, len(R), out))
    sys.exit(1 if fails else 0)
