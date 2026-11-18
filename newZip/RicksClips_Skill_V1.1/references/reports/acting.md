# REACTIONS — acting beats, timed against the word

Built 2026-11-05, the third of CB's three: "Now animate all faces, then all movents, reactions etx."
Composition: `src/videos/bridge/Reacts.tsx` (Remotion id `Reacts`).

A face is a state. A **reaction is a shape in time**: something arrives, the body answers before the
mind does, the face lands, then it settles. Twelve complete beats, 2.4 s each.

## The law each beat is built to (measured, `motion.md` §3)

1. **The change lands 0–3 frames BEFORE the word onset** — measured at −1, −3, 0 and 0 across four
   reference episodes. Never on the word, never after it.
2. **The swap is instant** — one frame. A reaction never cross-fades.
3. **A blink covers the swap.** That is his own habit, and it is why an instant change doesn't read as
   a cut.
4. **The body takes the hit first and settles slowly** — rise over 3 f, monotonic decay over ~26 f.
   (CB 2026-11-05: a short settle is a hiccup; a damped cosine rings into a wobble.)

## The twelve

| beat | the idea | lead before the word |
|---|---|---|
| DOUBLE TAKE | looks away, snaps back | 3 f |
| FLINCH | the body answers before the face | 1 f |
| REALISATION | the penny drops — slow in, hard landing | 2 f |
| STARTLE | whole-body jolt, pupils collapse | 0 f |
| SLOW BURN | **no hit at all** — anger arrives, it doesn't land | 3 f |
| DEFLATE | the smile doesn't snap off, it drains | 1 f |
| PERK UP | bored to interested in one frame | 0 f |
| BRACE | sees it coming, clenches, survives | 2 f |
| EYE ROLL | disdain, then back to not caring | 1 f |
| RECOIL | leans IN, then away — the smell arrives late | 3 f |
| RELIEF | the held breath goes out | 0 f |
| TOLD YOU SO | lands small, then grows | 2 f |

**Verified against the data, not by eye:** all twelve fall inside 0–3 f. The leads are deliberately
**spread across 0, 1, 2 and 3** rather than set to one value — the reference's own measurements vary,
and twelve beats all landing at exactly 2 f reads as machine timing. My first pass did exactly that and
had to be redone.

Two beats carry **no impact at all** (SLOW BURN, RELIEF, EYE ROLL): a feeling that arrives is not a
thing that hits, and giving it a jolt is the commonest way to make acting look fake.

The composition prints a **timing ribbon** under each beat — every expression swap as a tick, the word
as the tall marker, the playhead moving across — so the timing can be judged directly instead of
trusted.
