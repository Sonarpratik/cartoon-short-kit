"""Cut CB_RULES.md into one short rule file per department, so a helper reads 5-15 k tokens instead of the whole book (32 k) plus SKILL.md (43 k).
    python tools/slice_rules.py            # writes rules/dept/<department>.md and rules/dept/INDEX.md
CB_RULES.md stays the one master. The slices are GENERATED: never edit them; change CB_RULES.md and run this again
(tools/refresh_installed_skill.py runs it too). A slice = the core (Rule 1, Rule 2, section 11 lean pipeline and token rules)
+ the whole sections the department owns + single rules from other sections that name the department's subject.
Rule from CB 2026-11-15 ("how we can optimized that is not burn too much tokes and quicker to make", "yes please do")."""
import os, re, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "CB_RULES.md"); OUT = os.path.join(ROOT, "rules", "dept")
text = open(SRC, encoding="utf-8").read()
parts = re.split(r"(?m)^(?=## )", text)
head = parts[0]; secs = {}
for p in parts[1:]:
    title = p.split("\n", 1)[0]
    m = re.match(r"## (RULE NO\. 1|HARD RULE NO\. 2|\d+b?)\b", title)
    key = {"RULE NO. 1": "R1", "HARD RULE NO. 2": "R2"}.get(m.group(1), m.group(1)) if m else title[:20]
    secs[key] = p
CORE = ["R1", "R2", "11"]
# department -> (whole sections, words that pull single rules out of the other sections)
DEPT = {
    "writer":            (["1", "2"], r"script|voice|narrat|hook|word count|caption"),
    "rick-researcher":   (["6b"], r"reference|rick's frame|study"),
    "set-builder":       (["2", "3", "8"], r"\bset\b|sets\b|world|place|prop"),
    "props-hero":        (["2", "3", "8"], r"prop|hero object|held|grip"),
    "background-painter": (["3"], r"sky|cloud|backdrop|background|haze|horizon"),
    "3d-designer":       (["3", "8"], r"blender|material|model|texture"),
    "character-artist":  (["4"], r"character|costume|cast|view\b|hat|hair"),
    "animator":          (["2", "5", "10"], r"pose|move|motion|acting|face|feet|hand"),
    "camera-director":   (["2", "6", "6b", "10"], r"camera|lens|shot|frame edge|close-up|take\b|transition"),
    "lighting-director": (["3"], r"light|shadow|colour|color|grade|saturation|night|dusk|dawn"),
    "vfx-artist":        (["6"], r"effect|vfx|dust|spark|glow|smoke|highlight|impact"),
    "sound-designer":    ([], r"sound|sfx|music|mix|loud|ambien|voice"),
    "look-finisher":     (["8"], r"blender|runpod|render|material|lock"),
    "editor-compositor": (["7"], r"caption|grade|join|cut\b|blend|loop|export|final"),
    "storyboard-judge":  (["7"], r"judge|score|proof"),
    "studio-director":   (["7"], r"judge|proof|gate|before cb"),
    "stretch-builder":   (["2", "6", "10"], r"pose|move|motion|camera|close-up|frame edge|render|sheet|prop|hit\b"),
    "lead":              (list(secs), r"$^"),
}
def rules_of(sec):
    """split a section into its heading and its single rules (a rule = a top-level bullet with its sub-lines)"""
    lines = sec.split("\n"); out = []; cur = None
    for ln in lines[1:]:
        if re.match(r"- |\d+\. |\*\*|[A-Z]", ln) and not ln.startswith("  "):
            if cur: out.append(cur)
            cur = ln
        elif cur is not None: cur += "\n" + ln
    if cur: out.append(cur)
    return lines[0], out
os.makedirs(OUT, exist_ok=True); stamp = datetime.date.today().isoformat(); index = []
for dept, (own, words) in DEPT.items():
    body = [f"# CB RULES for the {dept} (GENERATED {stamp} by tools/slice_rules.py from CB_RULES.md; do not edit)",
            "CB_RULES.md is the master and wins. This file holds the rules that touch your job. Read it instead of the whole book. "
            "If a rule you need seems missing, grep CB_RULES.md for the word; do not read it top to bottom.\n"]
    full = [k for k in CORE + own if k in secs]; seen = set()
    for k in full:
        if k not in seen: body.append(secs[k].rstrip() + "\n"); seen.add(k)
    pat = re.compile(words, re.I); extra = []
    for k, sec in secs.items():
        if k in seen: continue
        title, rules = rules_of(sec)
        hit = [r for r in rules if pat.search(r[:140])]        # the subject of a rule is named in its first words; a later mention is not enough
        if hit: extra.append(f"### from {title.lstrip('# ')[:90]}\n" + "\n".join(hit))
    if extra and dept != "lead": body.append("## RULES FROM OTHER SECTIONS THAT NAME YOUR SUBJECT\n" + "\n\n".join(extra) + "\n")
    txt = "\n".join(body)
    open(os.path.join(OUT, dept + ".md"), "w", encoding="utf-8", newline="\n").write(txt)
    index.append((dept, len(txt.encode())))
src_n = len(text.encode())
with open(os.path.join(OUT, "INDEX.md"), "w", encoding="utf-8", newline="\n") as f:
    f.write(f"# Rule slices (GENERATED {stamp}). Master CB_RULES.md = {src_n:,} bytes, about {src_n // 4:,} tokens.\n\n| department | bytes | about tokens | share of the master |\n|---|---|---|---|\n")
    for d, n in index: f.write(f"| {d} | {n:,} | {n // 4:,} | {100 * n // src_n} % |\n")
for d, n in index: print(f"{d:20s} {n:8,d} bytes  ~{n // 4:6,d} tokens  {100 * n // src_n:3d} %")
