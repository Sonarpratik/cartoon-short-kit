"""Tokens and working time of a film, per helper (CB_RULES section 11, T9). Reads Claude Code's own session files; nothing is sent anywhere.
    python tools/token_report.py                     # the newest session of this project
    python tools/token_report.py <session id>        # a named session
    python tools/token_report.py <id> --until 2026-11-14T19:26+07:00   # stop counting at a moment (e.g. the film's approval)
Prints: tokens of the lead session and of every helper (largest first), the share that was re-reading, wall time,
working time (gaps that end with a message typed by the user are left out), and writes token_report.json beside the session.
Faults to explain at delivery: a helper over 60 million tokens; a film over 450 million."""
import json, glob, os, sys, datetime as dt, collections
HOME = os.path.expanduser("~"); ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
slug = ROOT.replace(":", "-").replace("\\", "-").replace("/", "-").replace(" ", "-")
PROJ = os.path.join(HOME, ".claude", "projects", slug)
args = [a for a in sys.argv[1:] if not a.startswith("--")]
until = None
if "--until" in sys.argv: until = dt.datetime.fromisoformat(sys.argv[sys.argv.index("--until") + 1])
if not os.path.isdir(PROJ): sys.exit("no session folder: " + PROJ)
sid = args[0] if args else os.path.basename(max(glob.glob(os.path.join(PROJ, "*.jsonl")), key=os.path.getmtime))[:-6]
KEYS = ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens", "output_tokens")
def iso(t): return dt.datetime.fromisoformat(t.replace("Z", "+00:00"))
def human(d):
    if d.get("type") != "user" or d.get("isMeta"): return False
    c = (d.get("message") or {}).get("content")
    if isinstance(c, list):
        if any(isinstance(x, dict) and x.get("type") == "tool_result" for x in c): return False
        c = " ".join(x.get("text", "") for x in c if isinstance(x, dict))
    s = (c or "").strip() if isinstance(c, str) else ""
    return bool(s) and not s.startswith(("<", "[SYSTEM")) and "task-notification" not in s[:200] and "hand-back" not in s[:300]
def scan(f):
    seen = {}; ts = []; hum = []
    for line in open(f, encoding="utf-8", errors="replace"):
        try: d = json.loads(line)
        except Exception: continue
        t = d.get("timestamp")
        if not t: continue
        t = iso(t)
        if until and t > until: continue
        if d.get("type") in ("user", "assistant"): ts.append(t)
        if human(d): hum.append(t)
        m = d.get("message") or {}
        if d.get("type") == "assistant" and isinstance(m, dict) and m.get("usage"): seen[m.get("id") or d.get("uuid")] = m["usage"]
    tot = collections.Counter()
    for u in seen.values():
        for k in KEYS: tot[k] += u.get(k) or 0
    return tot, sorted(ts), sorted(hum), len(seen)
main = scan(os.path.join(PROJ, sid + ".jsonl")); rows = []; allt = collections.Counter(main[0]); spans = []
H = set(main[2])
for a, b in zip(main[1], main[1][1:]):
    if b not in H: spans.append((a, b))                    # a gap that ends with the user's message = waiting for the user
for f in glob.glob(os.path.join(PROJ, sid, "subagents", "*.jsonl")):
    tot, ts, _, n = scan(f)
    if not ts: continue
    meta = f[:-6] + ".meta.json"; desc = ""
    try: desc = json.load(open(meta)).get("description", "")
    except Exception: pass
    a = b = ts[0]; act = 0
    for x in ts[1:]:
        if (x - b).total_seconds() < 2700: b = x
        else: spans.append((a, b)); act += (b - a).total_seconds(); a = b = x
    spans.append((a, b)); act += (b - a).total_seconds()
    rows.append({"helper": desc or os.path.basename(f)[:24], "tokens": sum(tot.values()), "reread": tot["cache_read_input_tokens"], "written": tot["output_tokens"], "steps": n, "hours": round(act / 3600, 2)})
    allt.update(tot)
spans.sort(); U = []
for a, b in spans:
    if U and a <= U[-1][1]: U[-1] = (U[-1][0], max(U[-1][1], b))
    else: U.append((a, b))
work = sum((b - a).total_seconds() for a, b in U) / 3600
wall = (main[1][-1] - main[1][0]).total_seconds() / 3600 if main[1] else 0
rows.sort(key=lambda r: -r["tokens"]); G = sum(allt.values())
print(f"session {sid}")
print(f"TOTAL {G / 1e6:,.1f} M tokens | re-reading {100 * allt['cache_read_input_tokens'] / max(G, 1):.1f} % | new reading {allt['cache_creation_input_tokens'] / 1e6:,.1f} M | written {allt['output_tokens'] / 1e6:,.1f} M")
print(f"lead session {sum(main[0].values()) / 1e6:,.1f} M in {main[3]} steps | helpers {len(rows)} | wall {wall:.1f} h | working {work:.1f} h | helper-hours {sum(r['hours'] for r in rows):.1f}")
print(f"{'helper':46s} {'M tokens':>9s} {'steps':>6s} {'hours':>6s}")
for r in rows: print(f"{r['helper'][:46]:46s} {r['tokens'] / 1e6:9.1f} {r['steps']:6d} {r['hours']:6.2f}" + ("   <-- over 60 M: explain" if r["tokens"] > 60e6 else ""))
if G > 450e6: print("FILM OVER THE 450 M TARGET (CB_RULES section 11)")
json.dump({"session": sid, "total": G, "by_kind": dict(allt), "lead": sum(main[0].values()), "wall_h": round(wall, 2), "work_h": round(work, 2), "helpers": rows},
          open(os.path.join(PROJ, sid + ".token_report.json"), "w"), indent=1)
