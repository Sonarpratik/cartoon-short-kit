# the reference channel style bible (study of latest 20 shorts, 2026-10-30; corrected 2026-11-04)
Private study only. In THIS package: videos in `video references/` (title filenames; vNN map in
reports/VIDEO_MAP.md), transcripts in `scripts/` (per-episode stats: reports/script_stats.md),
full 30 fps contact sheets in `measure/sheets/<Title>/` (each sheet = 2 s, 60 frames, 582 sheets),
extracted frames in `frames/`, measuring tools in `../tools/measure/`, quality bar in `SCORECARD.md`.

## Format
- Vertical 1080x1920, 30 fps, 31-78 s (median ~60 s), voice starts at frame 1-4 (no intro, no logo, no outro, no CTA).
- Voice: one male narrator, fast and steady: 3.5-4.1 words/s (median 3.7), almost no pauses (word gaps >0.25 s total <1 s per video).
- Loudness -14 LUFS integrated, LRA ~2.4 LU (heavily compressed). Music/SFX bed under voice only ~5-10 dB below speech.
- Captions: one word (sometimes 2-3) at a time, white bold sans, thin black outline, lower-middle, hard swaps on each word.
  (OUR RULE: no captions unless the user asks.)

## Script formula (20/20 follow it)
1. **Hook = paradox stated as fact, sentence 1, no setup.** A person did something that sounds dumb/impossible with stakes,
   or "If you X, you'd Y", or "X is illegal, yet ...". ~10-16 words.
2. **Setting in 1-2 lines**, present tense, concrete details (time of day, a named everyman, numbers).
3. **Escalation, 3-6 beats**: others laugh / doubt / mock (short in-character dialogue lines), stakes climb.
   1-2 exaggeration jokes per video (claim vs reality, "so slow X, and X was ...").
4. **Mystery beat**: a question or "Wait, ...?" (~1 per video).
5. **Pivot word "You see,"** (14 of 20 videos) → the real mechanism. Often an everyday analogy
   ("Ever ...?", "think about the last time ...", "picture your body as ...").
6. **Ironic payoff** in the last 1-2 sentences, short, lands the twist. Video ends on the last word.
- Measured per episode (reports/script_stats.md): w/s median 3.64 (3.12-3.97), hook median 14 words,
  **the "You see," pivot lands at a median 67.5 % of the script's words** — put the twist at ~2/3, not at the end.
- Two modes: story mode (third person "he", named everyman, present tense) and "Imagine you're..." second person.
- Sentences ~13.5 words median, plain spoken English, contractions, no jargon unless explained in the next clause.

## Picture
- 2D flat cartoon characters (simple outlined faces, thin black outline, flat colors) standing in **3D toon environments**.
- 3D environments: hand-painted textures, saturated colors, **thin black ink outlines on 3D geometry** (edges + creases),
  soft depth of field on backgrounds, warm key light + blue/purple shadows, light pools (window light) that also tint the characters.
- Characters receive scene light/shadow (they are lit, not pure emission), cast ground shadows.
- Color stats (per video median): lum mean 0.43-0.54, lum std 0.21-0.29, p2 0.03-0.11 (deep darks), p98 0.9-1.0,
  saturation 0.38-0.65 (very saturated). Lighting changes with story beats (noon -> sunset -> night-blue for the explanation).
- Every sentence is illustrated literally; props carry the joke (beers, frogs, milk cart).

## Camera / editing (measured; CORRECTED 2026-11-04)
> The first-pass claims "camera holds ~80 % of frames" and "ease-out bursts peaking at the first frame"
> were WRONG: the integer phase correlation could not see motion under ~4 px/f. The sub-pixel re-measurement
> (reports/motion.md, 32,337 frames) replaces them. Use only the numbers below.
- **Hard cuts almost never**: 0-1 per video in 12/20 videos; most "cuts" detected are 4-frame flash effects.
- **The camera is moving in ~65 % of frames** (median speed 3.6 px/f at 720p, p90 16.9). True holds (< 0.3 px/f)
  are only ~10 % of frames.
- Moves are **symmetric ease-in-out glides**: ~10 f in, ~10 f out, ~23 f total, median peak 13.7 px/f
  (p75 24.6, p90 36) — never snaps. ~6 moves per 10 s.
- **Even "still" frames push in**: zoom active in 70 % of quiet frames, 83 % of those pushing in,
  median 0.14 %/f (emphasis pushes ~0.6 %/f for ~35 f). No hand-held float at all (HF residual ≤ 0.29 px).
- Impact shakes **flip sign every frame** (~3 px at 720p), decay in 6-8 f, roll ±0.1-0.35°.
- Transitions = continuous camera moves: follow an object (bullet, oil stream, ball) from one subject to the next,
  whip pans with motion blur (45-93 px/f over 7-25 f, 2-3 f ramps, ~0.45/min), fly-through (window/porthole),
  or a 6-8 frame crossfade dissolve when changing place.
- Low camera heights (median 0.79 × character height, 82 % eye level); frequent dutch tilts for drama/falls
  (3.2 roll moves per 10 s, median 3.6° over 18 f).

## Effects
- Muzzle fire, glow/aura bursts, sparkles on impact, splash sprites, speed lines, dust puffs, music notes, stars,
  light shafts; all flat 2D cartoon sprites composited into the 3D scene.
