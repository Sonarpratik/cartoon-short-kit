"""check_film.py: the automatic film gate for a RENDERED video (three.js animatic, Blender preview or final).
Run it on every preview before CB sees it, and again on the final. It measures the picture, not the plan, so it also
catches what the plan cannot know (action rigs, parallax, a render that drifted from the bake).

    python tools/check_film.py <video.mp4> [--film episodes/<name>/film.json] [--words voice/words.json] [--out <folder>]

1. Camera, measured from the pixels with the instrument used on Rick's 24 Shorts (tools/measure/film_motion.py), judged
   against his numbers in references/measure/gates_film.json: rest share, rests per 10 s, rest length, travel length,
   speed, cuts, roll, whips, rest on long words, voice pace.
2. Plan vs picture (with --film): the measured rest share and speed against out/plan/plan_report.json, so a render
   that no longer follows the bake is caught.
3. Frame scan: frozen spans (camera and picture both still for 12+ f), travels over 3 s, one-frame flashes and A-B-A flickers.
4. Faces and captions (with --film and out/plan/visibility.json from the three.js kit): face centre inside the caption band,
   first face, faceless gaps: read from the real projected positions, not from a detector.
Writes <out>/film_check.md + film_check.json. Exit code 1 on any FAIL.
What stays manual and is printed at the end: the sound-off test, the three-point shot check, the judge agent's score.
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); sys.path.insert(0, os.path.join(HERE, "measure")); sys.path.insert(0, HERE)
import numpy as np
import film_motion as FM

A = sys.argv[1:]; video = A[0]; get = lambda k, d=None: A[A.index(k) + 1] if k in A else d
film = get("--film"); out = get("--out", os.path.join(os.path.dirname(os.path.abspath(video)), "film_check")); os.makedirs(out, exist_ok=True)
words_p = get("--words"); F = None
if film:
    import film_plan as FP
    F = FP.load(film); words = [dict(w=w["w"], s=w["s"], e=w["e"]) for w in F["_words"]] or None
else: words = None
if words_p: words = json.load(open(words_p, encoding="utf-8"))
G = json.load(open(os.path.join(ROOT, "references", "measure", "gates_film.json"), encoding="utf-8"))
R = []
def add(group, text, val, status, target, fix=""): R.append(dict(group=group, name=text, value=val, status=status, target=target, fix="" if status == "PASS" else fix))
def band(v, b): return (b[0] is None or v >= b[0]) and (b[1] is None or v <= b[1])

S = FM.series(FM.raw(video, os.path.join(out, "motion_raw.npz"))); planned = []; jumps = None
if F:
    # A mood change, an effect or an impact kick changes the whole picture on one frame, and the cut detector reads that as a cut.
    # The plan knows the real cuts and the planned flashes, so sort every detected jump into: real cut, planned flash, unexplained.
    cb = os.path.join(F["_dir"], "out", "plan", "camera_baked.json"); k = F["fps"] / float(S["fps"]); real_cuts = [c["f"] for c in json.load(open(cb))["frames"] if c["cut"]] if os.path.exists(cb) else []
    planned = [FP.fr(F, e["at"]) for key in ("moods", "fx", "kicks") for e in F.get(key, [])] + [FP.fr(F, e["at"]) + d for e in F.get("transitions", []) for d in (-int(e.get("frames", 16)) // 2, 0)]; keep = np.zeros(S["n"], bool); flash = np.zeros(S["n"], bool); jumps = []
    for i in np.where(S["cut"])[0]:
        pf = i * k
        if any(abs(pf - c) <= 2 for c in real_cuts): keep[i] = True
        elif any(-3 <= pf - e <= 0.7 * F["fps"] for e in planned): flash[i] = True
        else: keep[i] = True; jumps.append(i)
    S["cut"] = keep; S["cutm"] = keep | flash | np.roll(keep | flash, 1) | np.roll(keep | flash, -1)       # flash frames are left out of the speed numbers but are not cuts
M = FM.analyse(S, words)
for k, g in G["gate"].items():
    if k not in M: continue
    v = M[k]; st = "PASS" if band(v, g["pass"]) else "WARN" if band(v, g["warn"]) else "FAIL"
    m = G["metrics"].get(k, {}); add("camera", g["text"], round(v, 2), st, g["target"] + (" [Rick %.2f-%.2f]" % (m["min"], m["max"]) if m else ""), g["fix"])
# frame scan
fz = M["frozen_over_12f"]; add("scan", "frozen spans (camera and picture still 12+ f)", len(fz), "PASS" if not fz else "WARN" if len(fz) <= 2 else "FAIL", "0: every long hold has a creep or something moving", "at s: " + ", ".join("%.1f (%.1f s)" % (a, l) for a, l in fz[:8]))
tv = [t for t in M["travels_over_3s"] if t[1] > 7.0]; add("scan", "travels longer than 7 s", len(tv), "PASS" if not tv else "WARN" if len(tv) <= 1 else "FAIL", "0 (a flowing move of 3-7 s is wanted since 2026-11-10; Rick's long travels reach 4.8-9.5 s)", "at s: " + ", ".join("%.1f (%.1f s)" % (a, l) for a, l in tv[:8]))
hd = S["hd"]; n = S["n"]
near = lambda i: F is not None and any(-3 <= i * F["fps"] / float(S["fps"]) - e <= 0.7 * F["fps"] for e in planned)
flick = [i for i in range(2, n - 2) if not near(i) and hd[i] > .18 and hd[i + 1] > .18 and not S["cut"][i] and not S["cut"][i + 1] and np.abs(hd[i] - hd[i + 1]) < .5 * hd[i] and hd[i - 1] < .05 and hd[i + 2] < .05]
add("scan", "one-frame flashes or A-B-A flickers", len(flick), "PASS" if not flick else "WARN" if len(flick) <= 2 else "FAIL", "0 unplanned (planned flashes and washes are fine: confirm each)", "at s: " + ", ".join("%.2f" % (i / S["fps"]) for i in flick[:10]))
if jumps is not None: add("scan", "picture jumps the plan does not explain (not a planned cut, mood change, effect or kick)", len(jumps), "PASS" if not jumps else "WARN" if len(jumps) <= 1 else "FAIL", "0", "at s: " + ", ".join("%.2f" % (i / S["fps"]) for i in jumps[:10]))
# plan vs picture
if F:
    pr = os.path.join(F["_dir"], "out", "plan", "plan_report.json")
    if os.path.exists(pr):
        P = json.load(open(pr)); sp = np.array(P["speed"]); ps = 100 * float((sp < 2).mean()); d = abs(ps - M["pct_settled"])
        add("plan", "rest share: plan %.0f %% vs picture %.0f %%" % (ps, M["pct_settled"]), round(d, 1), "PASS" if d <= 12 else "WARN" if d <= 20 else "FAIL", "within 12 points", "the render does not follow the bake: re-bake, or the set has parallax the plan cannot see (check foreground props)")
        pf = [g for g in P["gates"] if g["status"] == "FAIL"]; add("plan", "plan gates failing (tools/film_plan.py check)", len(pf), "PASS" if not pf else "FAIL", "0", "; ".join(g["name"] for g in pf[:6]))
    else: add("plan", "plan report", "missing", "FAIL", "run tools/film_plan.py check first", "python tools/film_plan.py check " + film)
    vp = os.path.join(F["_dir"], "out", "plan", "visibility.json")
    if os.path.exists(vp):
        V = json.load(open(vp)); fr_ = V["frames"] if isinstance(V, dict) else V; cast = set(F.get("cast", {})); face = []; band_n = 0; tot = 0
        for row in fr_:
            hs = [(k, v) for k, v in row.items() if k in cast and v and 0 <= v.get("x", -1) <= 1 and v.get("head_y", -1) < 1]      # kit format: x, y = body centre, h = height, head_y = top of the head (fractions of the frame)
            face.append(bool(hs))
            for k, v in hs: hc = v["head_y"] + v.get("h", 0) / (2.0 * F["cast"][k].get("heads_tall", 2.9)); tot += 1; band_n += 0.58 <= hc <= 0.76
        first = next((i for i, f in enumerate(face) if f), None); g_ = gm = 0
        for f in face: g_ = 0 if f else g_ + 1; gm = max(gm, g_)
        fps = F["fps"]; step = max(1, round(F["_end"] / max(1, len(face))))
        add("faces", "first face, s", None if first is None else round(first * step / fps, 2), "PASS" if first is not None and first * step <= 1.5 * fps else "FAIL", "<= 1.5", "open on the hero")
        add("faces", "longest stretch without a face, s", round(gm * step / fps, 1), "PASS" if gm * step <= 6 * fps else "WARN" if gm * step <= 9 * fps else "FAIL", "<= 6", "show nouns with a character")
        if tot: b = 100.0 * band_n / tot; add("faces", "head centres inside the caption band, %", round(b, 1), "PASS" if b <= 3 else "WARN" if b <= 8 else "FAIL", "<= 3 (Rick 2.7)", "re-aim those stations: captions sit at 60-74 % of the height")
    else: add("faces", "visibility.json", "missing", "WARN", "render with the three.js kit: node render.mjs film.json --visibility", "face and caption gates were skipped")
fails = sum(r["status"] == "FAIL" for r in R); warns = sum(r["status"] == "WARN" for r in R)
L = ["# Film check: %s" % os.path.basename(video), "", "%d gates: %d pass, %d warn, %d fail. %.1f s." % (len(R), len(R) - fails - warns, warns, fails, M["dur"]), "", "| | Gate | Value | Target | Fix |", "|-|-|-|-|-|"]
for r in R:
    L.append("| %s | %s: %s | %s | %s | %s |" % (r["status"], r["group"], r["name"], r["value"], r["target"], r["fix"]))
    print("  %-4s %-7s %-52s %-10s target %s%s" % (r["status"], r["group"], r["name"], r["value"], r["target"], ("\n         FIX: " + r["fix"]) if r["fix"] else ""))
L += ["", "Manual, every draft: sound-off test (does each face tell the story muted?); three-point shot check (face changes on its word, key event and its sound land on their word, nothing blocks the face); judge agent score 8.5+ per storyboard panel."]
open(os.path.join(out, "film_check.md"), "w", encoding="utf-8").write("\n".join(L) + "\n"); json.dump(dict(gates=R, numbers={k: v for k, v in M.items()}), open(os.path.join(out, "film_check.json"), "w"), indent=1)
print("MANUAL  sound-off test, three-point shot check, judge agent 8.5+ per panel")
print("RESULT: %d FAIL, %d WARN of %d gates -> %s" % (fails, warns, len(R), os.path.join(out, "film_check.md")))
sys.exit(1 if fails else 0)
