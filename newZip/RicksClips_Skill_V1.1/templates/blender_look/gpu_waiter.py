"""gpu_waiter.py <episode folder> <label> -- <command ...>: run one GPU job when the shared GPU is free, following the PC's one-Blender-job rule.
From the Wrong Helmet EP 1 look frames (episodes/wrong-helmet/look/run_v3_when_free.py, 2026-11-11), made generic. Start it detached
(PowerShell Start-Process ... -WindowStyle Hidden) so it survives the chat session; it logs to <episode>/out/gpu_waiter_<label>.log.

Waits while ANY of these is true (checked every 60 s):
  - an episodes/*/out/RENDER_RUNNING.txt exists (a final render runs; it always has priority),
  - an episodes/*/out/*WAIT*.txt of ANOTHER episode exists (that episode asked for the next slot, e.g. a few stills),
  - a background Blender process runs (blender.exe with --background or -b). CB's open Blender windows do not count.
Then it writes <episode>/out/LOOK_WAITING.txt (so a waiting final gives it the slot), runs the command, and removes the file when the command ends.
For a final render, use the episode's render driver instead: it writes RENDER_RUNNING.txt itself. Look-frame drivers should still check the GPU
again before each place (look_frames.py gpu_busy()), so another episode's single stills can slot in between places."""
import os, sys, subprocess, time, glob, datetime
EP, label = os.path.abspath(sys.argv[1]), sys.argv[2]; CMD = sys.argv[sys.argv.index("--") + 1:]
SK = os.path.dirname(os.path.dirname(EP)); OUT = os.path.join(EP, "out"); os.makedirs(OUT, exist_ok=True)
LOG = os.path.join(OUT, "gpu_waiter_%s.log" % label); MINE = os.path.join(OUT, "LOOK_WAITING.txt"); NO = 0x08000000 if os.name == "nt" else 0
def log(s):
    with open(LOG, "a", encoding="utf-8") as f: f.write(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S ") + s + "\n")
def bg_blender():
    try:
        t = subprocess.run(["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_Process -Filter \"Name='blender.exe'\" | ForEach-Object { $_.CommandLine }"], capture_output=True, text=True, creationflags=NO).stdout
        return sum(1 for l in t.splitlines() if "--background" in l or " -b " in l)
    except Exception: return 0
def busy():
    why = [f for f in glob.glob(os.path.join(SK, "episodes", "*", "out", "RENDER_RUNNING.txt"))]
    why += [f for f in glob.glob(os.path.join(SK, "episodes", "*", "out", "*WAIT*.txt")) if os.path.normcase(os.path.dirname(os.path.dirname(f))) != os.path.normcase(EP)]
    n = bg_blender()
    if n: why.append("%d background blender" % n)
    return why
log("queued: " + " ".join(CMD)); last = None
while True:
    w = busy()
    if not w: break
    if w != last: log("waiting: " + "; ".join(os.path.relpath(x, SK) if os.path.isabs(x) else x for x in w)); last = w
    time.sleep(60)
open(MINE, "w").write("%s waiting/rendering since %s (templates/blender_look/gpu_waiter.py). Deleted when done.\n" % (label, datetime.datetime.now().isoformat()))
log("GPU free: running")
try:
    r = subprocess.run(CMD, cwd=EP, creationflags=NO); log("finished, exit %d" % r.returncode)
finally:
    if os.path.exists(MINE): os.remove(MINE)
    log("LOOK_WAITING.txt removed")
