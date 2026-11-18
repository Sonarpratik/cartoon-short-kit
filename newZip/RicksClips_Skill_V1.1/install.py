"""Ricks Clips Animation Skill V1.1 installer.
Run once from the skill folder:   python install.py
It does three things:
 1. Replaces <SKILL_ROOT> in every text file with the real path of this folder (so the briefs work).
 2. Writes ~/.claude/skills/ricks-clips-v1-1/SKILL.md (same text, absolute paths).
 3. Copies agents/*.md to ~/.claude/agents/ (same paths made absolute).
It is safe to run again, also after you move the folder."""
import os, re, glob, sys
ROOT = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
HOME = os.path.expanduser("~")
MARK = os.path.join(ROOT, ".install_root")
TEXT = (".md", ".txt", ".py", ".mjs", ".js", ".json", ".sh", ".html", ".csv", ".css", ".tsx", ".ts")
PLACE = "<SKILL_ROOT>"

# 1. placeholder -> real path (and old real path -> new real path if the folder was moved)
old = open(MARK, encoding="utf-8").read().strip() if os.path.exists(MARK) else None
targets = [PLACE] + ([old] if old and old != ROOT else [])
changed = repl = 0
for dp, dn, fn in os.walk(ROOT):
    dn[:] = [d for d in dn if d not in ("node_modules", ".git")]
    for f in fn:
        if not f.lower().endswith(TEXT) or f == "install.py": continue
        p = os.path.join(dp, f)
        try: s = open(p, "rb").read().decode("utf-8")
        except Exception: continue
        o = s
        for t in targets: s = s.replace(t, ROOT)
        if s != o:
            changed += 1; repl += sum(o.count(t) for t in targets)
            open(p, "wb").write(s.encode("utf-8"))
open(MARK, "w", encoding="utf-8").write(ROOT)
print("paths: %d replacements in %d files -> %s" % (repl, changed, ROOT))

FRONT = re.compile(r"\A---\n(.*?)\n---\n", re.S)
REL = r"(?<![\w/\.:-])(templates|tools|references|library|examples|agents|rules)/"
def absolutize(s):
    return re.sub(REL, ROOT + r"/\1/", s)

# 2. skill
master = open(os.path.join(ROOT, "SKILL.md"), encoding="utf-8").read()
m = FRONT.match(master)
front, body = m.group(0), master[m.end():]
body = absolutize(body)
body = re.sub(r"\]\((WORKFLOW|DENSITY_RULES|FILE_GUIDE|CINEMATOGRAPHY|CB_RULES|START_HERE|README)\.md\)",
              lambda k: "](%s/%s.md)" % (ROOT.replace(" ", "%20"), k.group(1)), body)
note = "\n> Installed copy of `%s/SKILL.md`. Run `python \"%s/install.py\"` again after you change the master.\n" % (ROOT, ROOT)
dst = os.path.join(HOME, ".claude", "skills", "ricks-clips-v1-1")
os.makedirs(dst, exist_ok=True)
open(os.path.join(dst, "SKILL.md"), "w", encoding="utf-8", newline="\n").write(front + note + body)
print("skill  ->", os.path.join(dst, "SKILL.md"))

# 3. agents
adst = os.path.join(HOME, ".claude", "agents"); os.makedirs(adst, exist_ok=True)
for p in sorted(glob.glob(os.path.join(ROOT, "agents", "*.md"))):
    a = open(p, encoding="utf-8").read(); mm = FRONT.match(a)
    h, b = (mm.group(0), a[mm.end():]) if mm else ("", a)
    b = absolutize(b)
    for n in ("CINEMATOGRAPHY.md", "SKILL.md", "CB_RULES.md"):
        b = b.replace("`%s`" % n, "`%s/%s`" % (ROOT, n))
    open(os.path.join(adst, os.path.basename(p)), "w", encoding="utf-8", newline="\n").write(h + b)
    print("agent  ->", os.path.basename(p))
print("Done. Next: open Claude Code in this folder and paste the first prompt from INSTALL.md.")
