// MULTI-TARGET CAMERA MOVES — a shot that carries the audience from one object to another without a cut.
//
// CB 2026-11-05: "how you handle continious camera movement to different objects". The answer was that
// we couldn't: a beat is `cam: (w) => ({ pos, look })` — ONE look target. A beat could push or track,
// but it always aimed at a single point, so changing subject meant ending the beat and dissolving.
//
// Measured on the reference (references/reports/camera_census.md §6): 17 % of his uncut takes contain a
// real travel between two parks, and his takes run 2.1 s median. The shape is always the same:
//
//        PARK (dead still, on the subject)  ->  TRAVEL  ->  PARK (dead still, on the next subject)
//
// Two things make it read, and both are easy to get wrong:
//   1. the PARK is DEAD still — not "slow". Any residual drift on arrival and the shot reads as a
//      wander that happened to pass something, which is exactly what ours were doing (43 % of our
//      uncut takes had a travel between parks, but none of them arrived).
//   2. the ARRIVAL has zero velocity AND zero acceleration, so the camera settles onto the subject
//      instead of stopping at it. That is smootherstep, not smoothstep (CB, same day: a move that
//      starts or stops visibly reads as a hiccup).
export type V3 = [number, number, number];

/** one thing the camera stops on: where it watches from, what it watches, and how long it stays */
export type Station = { pos: V3; look: V3; dwell: number; fov?: number };

/** smootherstep: zero velocity AND zero acceleration at both ends — the camera settles, never stops */
const sm = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * t * (t * (t * 6 - 15) + 10); };
const mix3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** total length of a station run, in frames */
export const stationFrames = (st: Station[], travel: number) =>
  st.reduce((a, s) => a + s.dwell, 0) + Math.max(0, st.length - 1) * travel;

/**
 * The camera at frame `f` of a multi-station move.
 * Parks are held EXACTLY — the returned value is identical frame to frame inside a dwell, so a "still"
 * park really is still rather than nearly still. Travels ease with smootherstep at both ends.
 */
export const stationAt = (st: Station[], travel: number, f: number): { pos: V3; look: V3; fov?: number } => {
  if (st.length === 0) throw new Error("stationAt needs at least one station");
  let t = 0;
  for (let i = 0; i < st.length; i++) {
    // --- the park: identical every frame, so it is dead still, not slow ---
    if (f < t + st[i].dwell) return { pos: st[i].pos, look: st[i].look, fov: st[i].fov };
    t += st[i].dwell;
    // --- the travel to the next station ---
    if (i < st.length - 1) {
      if (f < t + travel) {
        const k = sm((f - t) / travel), a = st[i], b = st[i + 1];
        return {
          pos: mix3(a.pos, b.pos, k),
          look: mix3(a.look, b.look, k),
          fov: a.fov !== undefined && b.fov !== undefined ? a.fov + (b.fov - a.fov) * k : (a.fov ?? b.fov),
        };
      }
      t += travel;
    }
  }
  const last = st[st.length - 1];
  return { pos: last.pos, look: last.look, fov: last.fov };
};

/**
 * Aim-only version: the camera body stays where it is and only the AIM carries from object to object.
 * This is the cheap one, and it reads very differently from travelling the body — use it when the
 * subjects are far apart and moving the camera would take too long.
 */
export const aimAt = (from: V3, targets: { at: V3; dwell: number }[], travel: number, f: number) =>
  stationAt(targets.map((t) => ({ pos: from, look: t.at, dwell: t.dwell })), travel, f);
