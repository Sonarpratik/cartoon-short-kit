"""python r.py <pass1|toon|final> <round label> "<what changed>"  renders the hero harbour, grades, logs gates, writes out/_v.png for review."""
import sys, os, subprocess, time, json
H = os.path.dirname(os.path.abspath(__file__)); B = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"; R = os.path.abspath(os.path.join(H, "..", ".."))
stage, rnd, note = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
def busy():
    o = subprocess.run(["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_Process -Filter \"Name='blender.exe'\").CommandLine"], capture_output=True, text=True).stdout
    return any((" -b " in l or " --background" in l) for l in o.splitlines())
while busy(): time.sleep(8)
p = subprocess.run([B, "-b", "--factory-startup", "--python", os.path.join(H, "build.py"), "--", "--scene", "hero", "--stage", stage, "--round", rnd], capture_output=True, text=True)
sec = None
for l in p.stdout.splitlines() + p.stderr.splitlines():
    if any(k in l for k in ("Traceback", "Error:", "  File ")) and "Shadow buffer" not in l: print(l[:190])
    if l.startswith("SCENE "): print(l[:80]); sec = l.split()[2]
raw, out = os.path.join(H, "out", "hero_%s_raw.png" % rnd), os.path.join(H, "out", "hero_%s.png" % rnd)
if stage == "final": subprocess.run([sys.executable, os.path.join(H, "post_b.py"), raw, out, "morning"])
else: subprocess.run([sys.executable, os.path.join(H, "post_toon.py"), raw, out, "morning"])
g = subprocess.run([sys.executable, os.path.join(R, "tools", "measure", "density_check.py"), "--day", out], capture_output=True, text=True).stdout.strip(); print(g[:260])
open(os.path.join(H, "render_log.md"), "a", encoding="utf-8").write("- **%s** (%s, %s s): %s\n  %s\n" % (rnd, stage, sec, note, g))
from PIL import Image
Image.open(out).convert("RGB").resize((450, 800)).save(os.path.join(H, "out", "_v.png"))
