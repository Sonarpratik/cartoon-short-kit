# Sound: loudness and mix, measured per episode (2026-11-04)

The one study the original 8th agent never shipped. Phase A below is measured on all 21 videos
(ffmpeg ebur128, full program = voice + music + SFX as published). Phase B (cue alignment) is specified
but needs stem separation; do it before our second episode.

## A. Loudness, measured (all 21 videos)

| Episode | Integrated LUFS | LRA (LU) | True peak dBFS |
|---|---|---|---|
| An Unstoppable Spear vs an Unbreakable Shield | −15.1 | 2.3 | −3.1 |
| Every Memory Has a Price | −14.1 | 1.9 | −2.0 |
| He Could Spot Winning Tickets Just by Looking | −14.0 | 2.1 | −2.0 |
| How Painkillers Actually Work | −14.1 | 1.8 | −2.0 |
| How a Mirror Rigged a Horse Race | −14.0 | 2.6 | −2.1 |
| Levels of Pirate Cannonballs | −14.0 | 2.1 | −1.9 |
| The Ancient Jar That Warned an Empire | −14.1 | 2.1 | −2.2 |
| The Burglar Who Only Moved Furniture | −14.1 | 1.7 | −2.1 |
| The Job Nobody Wants in Japan | −14.1 | 1.8 | −2.1 |
| The Science Behind Slot Machines | −15.1 | 2.5 | −2.7 |
| The Scientist's Insane Time Test | −15.1 | 1.6 | −3.6 |
| The Town Built Around a Button | −14.1 | 1.8 | −2.2 |
| The Window That Breaks Japan's Gambling Law | −14.3 | 2.4 | −1.3 |
| This Knight Found the Ultimate Loophole | −15.0 | 2.4 | −3.0 |
| What the Grave Bell Really Meant | −14.0 | 2.3 | −1.9 |
| Why Cashiers Keep Winning The Lottery | −15.1 | 2.0 | −3.5 |
| Why Humans Can't Pick Random Numbers | −15.1 | 2.6 | −2.7 |
| Why Perfect Railroads Don't Work (not in v-study) | −14.1 | 3.2 | −2.2 |
| Why Sailors Carried Storm Oil | −14.0 | 2.4 | −2.1 |
| Why the Second Draw Always Wins | −14.0 | 1.7 | −2.4 |
| Your Brain's Secret Idea Zone | −15.6 | 3.5 | −3.1 |

**Aggregates:** integrated median **−14.1 LUFS** (range −14.0…−15.6); LRA median **2.1 LU**
(range 1.6–3.5 — heavily compressed, confirms STYLE_BIBLE's "LRA ~2.4"); true peak median
**−2.1 dBFS** (range −1.3…−3.6, i.e. ~2 dB of headroom, never slammed to 0).

**Mix targets for our episodes** (add to templates/audio/mix.py checks):
- Integrated: **−14.0 ± 0.5 LUFS** (YouTube normalizes to −14; the reference masters exactly there).
- LRA: **1.6–2.6 LU**. If our mix comes out above ~3, compress the bus harder.
- True peak: **≤ −1.5 dBFS** (median −2.1). Keep the limiter ceiling at −2.0.
- Voice/bed relation (from STYLE_BIBLE): music+SFX only 5–10 dB under speech — the bed is loud,
  presence comes from compression, not from a quiet bed.
- Dead air: word gaps > 0.25 s total under 1 s per video. The mix never breathes.

## B. Cue alignment — specified, not yet measured

What to measure (per episode, after separating voice from the bed with a source separator, or by
band-passing: narration dominates 150 Hz–4 kHz mono-centred):
1. **SFX hit offset vs picture event** on 10 visible events per episode (door, impact, splash):
   expected within ±2 f of the frame event, consistent with the reaction rule (0–3 f early).
2. **Duck depth and shape**: bed level during speech vs in gaps; expected ~5–10 dB, with fast
   (<150 ms) recovery, since LRA stays ~2.
3. **Music grammar**: when the score changes (hook, pivot "You see,", payoff), instrument family per
   act, tempo vs cut rhythm.

Method reference: templates/audio/timeline.py already defines the event-table format; the comparison
is the same table extracted from a reference episode by ear+waveform on its new full contact sheets
(references/measure/sheets/) next to the audio.

## C. What the bridge template already satisfies
- mix.py targets −14 LUFS with ducking; matches A.
- User rules (SKILL.md): music +3 dB, SFX −6 dB relative — within the measured bed-under-voice window.
- Picture time-constants locked before sound: keep; the reference's ±2 f hit discipline demands it.
