# solution: lock file lets parallel builders share the one-Chrome-render rule

**Problem:** the pitfall "parallel-chrome-renders-kill-batches" forces one Chrome render at a time,
which used to serialize whole build agents even though their CODE work is independent.
**Solution:** run builders in parallel but gate only the render step with a lock file:
before each render, loop while `C:/remotion-tmp/render.lock` exists (sleep 15 s, give up + report
after 10 min), then create the lock, render ONE still, delete the lock. TEMP/TMP=C:/remotion-tmp as always.
**Why it works:** renders are seconds-long; builds are minutes-long. The lock serializes only the
scarce resource (Chrome) and keeps everything else concurrent.
**Used:** EP01 build wave (S1/S4 builder + S2/S3 builder rendering first-light stills concurrently).
**Detect misuse:** a stale lock older than ~15 min means a builder crashed mid-render — delete it.
**Creativity gap:** a tiny render-queue daemon could take named jobs and return stills to all
builders, letting N agents request renders without any waiting loops.

**Update 2026-11-15 (GOLDRUSH v2):** a lock held over the whole GPU queue wait, plus one shared out/plan folder, serialised 7
builders and a dead render kept the lock 30 min. The lock must cover only the scarce step, and parallel jobs must not share a
written folder at all: see pitfall/shared-plan-folder-serialises-parallel-renders.md and
solution/private-render-folder-per-stretch.md. Open (HANDOFF 0h spear): the shared GPU queue is not first-come; a ticket
queue is the planned fix.
