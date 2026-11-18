# Texture + VFX study notes (railway, lottery, slots, random-numbers, jar eps; CB-directed 2026-11-04)

## WHEN to give something a VFX / highlight effect (the decision rules)
An effect is never decoration — it marks a STORY FUNCTION, exactly one effect per beat, landing on the
word onset (0-3 f early, like every reaction). The trigger table, measured from the reference:

| Story function (the trigger) | The effect | Seen in |
|---|---|---|
| A REVEAL — the audience learns what something is | light-sweep reveal (repaint, not brighten) or spotlight/halo | yacht v08 s010; trash-POV halo v08 s007 |
| A REWARD / prize / "the good thing" on screen | the object carries its own light: string bulbs, glow-from-within, warm palette vs cool world | yacht v08 |
| A COUNT the narration speaks | emissive number device ticks per word: LED counter, tally slots, drum digits (+SFX tick) | v17 CREDITS, v19 board, button ep 0047 |
| An OBJECT OF DESIRE / temptation pulling a character | emissive device lighting the character's face; hot button in dark surround | v17 slots |
| An IMPACT / hit / break | impact flash + 4-5 f ring/burst + camera kick (flip-sign, 7 f) | v14 spear; our SNAP |
| SPEED / a throw / a dash | speed lines + whip blur (only with real motion ≥45 px/f) | whips v07/v09 |
| MAGIC / value / "special" sparkle moment | 4-6 four-point stars, 4-5 f life, at the object's edge | v19 board, tickets |
| A MOOD/TIME shift the story needs | whole-scene palette change (noon→sunset→night-blue), or dawn→day THROUGH a shot | duel s026, v08 s013 |
| DANGER / catastrophe far away | dust plume (3-tone flipbook) + debris specks + birds scatter | jar ep s024 |
| Nothing is being revealed, counted, rewarded, hit or feared | **NO effect.** Holds stay clean; the camera push-in is the only emphasis | 80 % of all reference frames |

Rules: never two effects on one beat; never an effect on a beat the narration doesn't mark; the effect's
light obeys the scene palette (warm reward in cool scene, etc.); every effect is a WORLD object or a
NOINK sprite card, never a screen overlay.

CB pointed at this clip as a texture/effects reference (2026-11-04). Sheets: `references/measure/sheets/Why_Perfect_Railroads_Don_t_Work/` (33). Evidence frames: s008 (ballast + inspector), more to mine.

## Railway textures, full-res pass (frame_030, CB asked twice - this is the texture bar)
**HOW:** 1) BALLAST: every stone individually drawn - own base hue from a 5-hue set (terracotta/peach/
slate-blue/cream/brown), a simple 2-tone form shade (lit top, dark bottom), thin dark contour, dark gap
between stones, sizes varying ~2x; in shadow the stones go cool blue-grey but KEEP the 2-tone structure.
2) RAIL: dark desaturated iron body with a near-white WORN BAND along the running surface (the painted
matcap convention our chainHD already uses). 3) SLEEPERS: pale weathered grey-brown, long grain streaks,
ink edges. 4) The purple viaduct band behind striped horizontally, hazing toward the edges. 5) Big soft
SUN GLOW in the day sky. 6) The white measuring tab at the rail joint = in-world explainer prop.
**WHY:** ground planes carry the premium feel - the camera lives at knee height in this style, so the
floor is the biggest surface on screen; per-unit shading makes it painterly instead of tiled.
**HOW WE do it:** paint.ts `stoneField()` generator (packed rounded polys, 5-hue palette, 2-tone split
by a wobbled horizontal, gap ink) or a Blender bake for very dense fields (PIPELINE job 2); apply the
worn-band convention to every edge-on iron prop; sleepers = planksHD variant with grey-brown fills.
**CREATIVITY GAP:** our stones get occasional story litter (a dropped button, a horseshoe) - 1-2 per
episode, findable on freeze-frame; the ref's ballast is uniform.

## What it sets the bar for
1. **Ground texture density — the ballast rule.** Track ballast is painted as INDIVIDUAL stones: warm
   terracotta / brown / grey-blue mixed per stone, each stone with its own light side and a dark gap
   ring around it. No two neighbours the same tone. This is the density target for any ground plane
   (gravel, riverbank, cobble fields). Implementation: paint.ts stone-field generator or a Blender bake
   (PIPELINE.md job 2); the dark gaps are part of the texture, never the ink pass.
2. **Soft sun glow by DAY.** A broad soft bright region in the day sky (upper centre), ~1/4 frame wide,
   reading as sun-through-haze — not only at golden hour. Ours currently has no day glow. Candidate:
   an HDR-ish soft sprite near the sun azimuth so bloom catches it gently (threshold 1.0 stays).
3. **Rail-level insert staging.** Camera ON the rail looking down its length: extreme low angle, strong
   diagonal convergence, heavy dutch, foreground ballast in DOF. A reusable insert-shot pattern for
   hero props lying on/along a line (rails, chains, planks). Take the METHOD, never the shot.
4. **Acting micro-changes on ones.** The inspector's brow angles shift nearly every frame during the
   "measuring the gap" beat while the silhouette stays locked; features slide with the 3/4 view exactly
   per the view grammar. Confirms: expression life comes from brows/eyes, not from body noise.
5. **Costume as prop language.** Bowler + yellow waistcoat + pocket-watch chain = the inspector read in
   one silhouette. Every named character should carry one such wearable prop.

## Lottery ep (Why Cashiers Keep Winning The Lottery, v08) — VFX / highlight effects
Sheets: s003 (mouth sync), s010 (the yacht reveal, ~18-20 s). The "reward moment" grammar:
1. **Light-sweep reveal.** The yacht sits in night blue; a lighting boundary TRAVELS bow->stern over
   ~15 f, and everything behind it is REPAINTED warm (cream hull, gold lettering, glowing cyan pool) —
   not brightened, re-palettized. The world around stays night purple/blue. Implementation: a second
   "lit" material set + a moving world-space clip plane (or shader mix by x), swept by story.ts.
2. **String-light bulbs**: emissive HDR dots with soft halos along the rails — feed the bloom
   (threshold 1.0). The reference uses rows of them to outline the prized object.
3. **Glow-from-within**: the pool water is a soft cyan emissive — prized objects carry their own light.
4. **Moon/sun halo**: huge pale disc with a wide radial gradient halo (depth.md glow: e-fold 14-21 px
   @720, +0.23-0.50 near the edge). Also usable for the day soft sun glow (railway notes above).
5. **Night reward palette**: purple->pink horizon bands, teal water, pink lotus accents; the lit object
   is the only warm thing in frame. Lighting arc: this is the "payoff" beat's look.
6. **Mouth sync evidence** (s003): Kyle's mouth changes shape nearly every frame while talking —
   line / small-o / wide-o / tongue — Phase 4.1's frame source.

## Highlight / number VFX kit (CB: "the lottery number effects and other highlight VFX matter")
In-world emphasis effects (props and numbers are world objects, never caption overlays — the no-captions
rule stands): number/digit pop (scale-up 2-3 f + settle, with a glint), ticket/sign SHINE SWEEP (a bright
diagonal band crossing the face once), sparkle burst on reveals (4-6 four-point stars, 4-5 f life),
radial glow pulse behind the hero object, gold-glint dots on money/metal. All flat sprite cards on NOINK,
same as the drawn fx; Blender flipbooks welcome (PIPELINE.md job 3). Grammar: ONE highlight effect per
reveal beat, on the word onset, 0-3 f early like every reaction.

## Emotion micro-movement grammar (CB-asked; memory ep s020 + railway s008 + lottery s003/s008 + motion.md)
The reference has TWO acting speeds, and the difference IS the humanity:
1. **REACTIONS (gags, shocks): instant.** 1-frame expression swap, hidden under a blink, landing 0-3 f
   BEFORE the word (measured, motion.md). No in-betweens. Comedy = suddenness.
2. **FEELINGS (warmth, sadness, longing, smugness): gradual.** Confirmed across FOUR episodes:
   - Memory ep s020 (warmth): the seller's smile builds ~15-20 f through lid in-betweens (half-lid ->
     easing closed -> contented closed-eye smile) + a small head tip.
   - Japan-job s014 (resentment): the fired man holds DEAD STILL ~3 s while his eyes narrow over
     ~20 f; his happy replacement's face bubbles beside him - **contrast staging: the sad one is the
     still one**, the busy-happy neighbour makes the stillness read.
   - Memory ep s036 (loss, "Jerry has no idea"): a CHAIN of small expression steps - blank -> unease ->
     brow-knit -> hollow stare - each step a near-neighbour expression held 8-15 f, ~2.5 s total,
     face only, body frozen; the warm->cold-blue dissolve carries half the emotion (grade = feeling).
   - Railway s008 (thinking): brow angles micro-shift near-every-frame during the inspect beat.
   So: single arcs 15-25 f for simple feelings; CHAINED STEPS (8-15 f holds, 2-3 s total) for complex
   ones; stillness + micro-change for grief/resentment; colour shift paired with the big ones.
   (Our lid system already has 0 / 0.5 / 1 states - the arc helper and step-chain are what's missing.)
Supporting rules, all observed:
- The FACE acts, the body stays still (no idle noise; the body only joins for big beats - loll, slump).
- Brow micro-angles may shift near-every-frame during a thinking/inspecting beat (railway inspector).
- Eye darts (look +-1) = nervous/shifty; tiny pupils = shock; half-lids = deadpan/smug; closed+smile
  = warmth. Head tilt accompanies tenderness; head loll = dazed (12 deg in 9 f, hold, return).
- Emotional REVERSALS are staged as two-expression cuts (celebrating -> caught-deadpan, lottery s008):
  no in-between, the gap IS the joke.
- One emotion prop at a time, sparse: sweat drop, music note, "!" - never cluttered.
**HOW WE do it:** add an `emote(from, to, dur 12-20f)` arc helper in cast.ts that eases lid (0->0.5->1
or reverse), mouth shape index and a 1-3 deg headTilt together, quantized to ~6 steps for the card
cache; keep instant swaps + blink-cover for reactions. Brow micro-angle param (+-3 deg on ones) for
inspect/think beats.
**CREATIVITY GAP:** the "afterglow" micro-beat - 6-8 f after a big swap, one small secondary settle
(brows relax one step) - human without breaking the no-idle law; and let one emotion arc CROSS a
camera glide (the ref always acts in holds).

## BONUS transition from the same sheet (memory ep): ENTER-THE-PHOTO
Camera pushes into a held Polaroid until its image fills the frame (light-ray sweep crosses it),
the white border slides off, and the STILL IMAGE COMES ALIVE as the flashback scene. Flashback carries
its own dreamy grade (higher key, warm, soft rays) vs the present's night blue - two time layers
distinguished by grade alone. Handwritten caption + smiley on the border = humor signage again.
Ours: the photo-enter variant of TRANSIT (static texture of scene B's first frame on the prop, swap to
live scene at border-exit). GAP: let one element move INSIDE the photo a beat BEFORE entry (the frog
blinks in the still) - a wink the ref never does.

## Smart transitions: pull in/out through a connected object (CB-asked; painkillers s003 measured)
Four reference variants, one grammar — **something continuous carries the eye across the change**:
1. **Object-carry dissolve** (painkillers: swallow -> stomach): the object (pill) is visible and MOVING
   in scene A; a ~4-6 f dissolve happens AROUND it while its screen trajectory continues unbroken into
   scene B; the camera is attached to the object; arrival lands on an event (splash + burst + gag).
2. **Fly-through** (duel porthole): camera pushes INTO an opening until it fills the frame; the dissolve
   hides inside the push; camera exits moving in scene B along the same axis.
3. **POV dive** (lottery trash can): push into a container, white ring flash, continue as inside-POV.
4. **Follow-the-stream** (storm oil): camera tracks a poured/thrown stream from hand to destination.
**WHY:** the channel almost never hard-cuts (0-1 per video) - travel IS the edit; the carried object
makes two places feel like one world.
**HOW WE do it (story.ts spec):** a TRANSIT entry { fMid, dur 6-8, objPath(f): V3 } - both shots' CAMS
lock `look` to objPath around fMid; XFADE at fMid (both layers already render with their own DOF -
keep blur matched, the burglar-ep rule); the object exists in BOTH worlds during the overlap (same
screen position, cast.ts fx card or real prop); arrival event + SFX on the landing word.
**Bridge demo candidate:** shot 8->9 - follow the SNAPPED BOLT (our hero prop) falling off the bridge,
dissolve mid-fall, it splashes in among the sitting soldiers. Story-true and reuses the Blender bolt.
**CREATIVITY GAP:** chain two carries in one breath (object A hands off to object B mid-dissolve, e.g.
bolt -> ripple ring -> hat floating by) - the ref only ever carries one object at a time.
**Bonus from the same sheet:** in-world humor signage as world-building ("ACID SPA 98.6 F / NO PILLS
AFTER 9", "TO BLOOD ->") - signs carry jokes and wayfinding; our sets should each have 1-2.

## The one-accent interior (CB-directed: Pink Prison Cell Experiment, s010 — added 2026-11-04)
**HOW:** the entire prison is a controlled institutional two-tone — teal/grey-blue block walls, pale
floor, clean overhead strip fixtures, soft even top light, long soft contact shadows — and the PINK
cell door is the ONLY saturated thing in frame, its window slits GLOWING pink from inside (the
glow-from-within family: the experiment radiates its own colour). A yellow floor line leads the eye
straight to the door. The warden's pocket watch gets the full hero-prop insert (the "15 minutes"
count — number-device grammar again), its face tinted by the scene.
**WHY:** colour IS the story — pink means the experiment; keeping everything else desaturated makes
one hue carry the whole premise, readable at thumbnail size.
**HOW WE do it:** an "accent interior" lighting pattern for day interiors: muted two-tone set palette
+ exactly ONE story-coloured element with a mild emissive core (untone target) so bloom lifts it;
graphic floor lines as leading lines in institutional sets.
**CREATIVITY GAP:** let the accent colour LEAK as the story progresses — a faint pink spill on the
floor that grows a touch each time the door opens (the experiment spreading), which the ref never does.

## Night lighting + the REAL vignette (CB-directed: burglar ep v10 s001; also the blur/dissolve match s005)
**HOW:** the night scene is lit as ONE elliptical POOL of cool blue-white moonlight centred on the
action; the house wall takes a soft diagonal light slash; everything outside the pool falls to deep
navy. The "vignette" is DIEGETIC - made by the light, not a post overlay (that is why it never reads
as a cheap filter; our post vig must stay at the measured 0.86 corner and no more). The burglar plays
as a near-silhouette inside the pool, only the mask's white eye-band bright - dark-on-dark staging
with one readable feature. Scene changes are LONG (~15 f) dissolves where BOTH layers share the same
softness (the blur match CB noticed), and time-passage dissolves sweep a sun-pool across the floor
(s005 kitchen checkerboard).
**WHY:** the pool directs the eye like a stage spot, makes night readable without raising ambient, and
the matched-blur dissolve keeps transitions feeling continuous instead of layered.
**HOW WE do it:** night preset (Phase 4 lighting arc): a wide SpotLight/elliptical gradient pool +
wall-slash gradient instead of flat hemisphere; characters in pools keep face luma via their card
lighting; XFADE layers already render with their own shot's DOF (verify both sides' blur levels match
at the cut points). Post vignette stays subtle; mood vignettes come from LIGHT.
**CREATIVITY GAP:** let the pool BREATHE - a barely visible 0.3 %/f radius drift synced to the music's
bar, and in our night scenes one warm counter-pool (a window, a lantern) so night frames always carry
a warm/cool dialogue the ref only sometimes has.

## The ticket-glow highlight (CB's crown example: v06 frame_080 — "the VFX here is nice")
**HOW he did it:** scratch tickets as dark navy panels of DOT-MATRIX digits (LED-dot font), every number
a different cool pastel hue (pink/blue/lavender/mint) at low brightness — and the WINNING numbers glow
warm GOLD with a soft radial halo behind each. Three tickets tiled in one frame, gold numbers recurring
→ the pattern reads at a glance. A coins/vault emblem with a ray burst crowns the frame.
**WHY:** the story is "he can SEE which tickets win" — the glow turns the character's PERCEPTION into a
visible layer. The repetition across tickets proves system-not-luck without a word of narration.
**HOW WE do it:** Canvas2D dotted-digit font on a near-black prop face; per-digit hue jitter from a cool
palette at low V; winner digits drawn #ffd27a at HDR (untone, feeds bloom) + an additive radial glow
sprite per digit; tile the prop 2-3x in frame.
**CREATIVITY GAP (ours):** animate the glows ON in sequence following a scan path — the character's gaze
visualized as a moving reveal (the ref's glow is static), one soft SFX tick per ignition from CB's
library; and let the LAST number flicker before it commits (micro-suspense the ref never does).

## Number-count VFX, completed (CB: slot-machines ep v17 s006/s008 + random-numbers ep v19 s012)
The reference's rule: **a number is always an EMISSIVE DEVICE in the world, never a flat overlay.**
1. **Seven-segment LED counter** (v17 "CREDITS" display): glowing red digits on a near-black housing,
   heavy glow; counts roll digit-by-digit (2-3 f per step, ease-out at the end). Build: an emissive
   7-segment texture (untone target) on a counter prop; digits driven from story.ts.
2. **The tally board** (v19): arched golden board, slots LIGHT UP one per counted word, sparkle accents
   at the newly lit slot, whole board emissive + halo.
3. **Mechanical counter** (button ep "0047"): rolling drum digits, snap per increment.
4. **Device light on the face**: the machine's glow lights the character's head warm-white (local light
   pool tinting the card — STYLE_BIBLE's "light pools tint characters").
5. **Glass sweep**: a diagonal white reflection streak crossing the reel/screen glass once per beat.
6. **Emissive button** (SPIN): hot red button in a dark surround = the "press me" cue before a payoff.
Grammar: the count lands ON the narration's number words; each increment is a hit (SFX tick + light).

## Landscape wide ("the guy on the hill" — Ancient Jar ep, sheet s024, ~46-48 s)
The reference's scenic-wide grammar, and how we build it in our stack:
1. **Three depth bands.** (a) FOREGROUND hill: saturated grass, a path, the figure plus 2-3 camp props
   (cauldron, lantern pole, drying fish) — full colour, sharp. (b) MID: patchwork farm fields — a quilt
   of 4-5 greens/ochres with hedge lines and a winding road (paint.ts "fields quilt" ground texture on a
   far plane). (c) FAR: the city/palace + mountain nearly washed to sky luminance (albedo pale + the
   re-gated fog; far ink faded per ink.ts fade).
2. **A framing tree** over a top corner, close to the lens, mildly blurred (Kenney canopy scaled up).
3. **Big sky with a visible soft sun glow** off one corner; birds as 2-3 px accents.
4. **The event in the far band** (the palace collapse): dust plume = 3-tone cloud-style flipbook,
   debris specks arcing, THEN the dissolve-to-aftermath. The figure in the foreground reacts small.
5. Night->morning time changes as a 2 s cross-dissolve on the whole landscape (row 1 of the sheet).
Build list for our stack: fields-quilt texture (paint.ts or Blender bake), hill mound mesh, far-city
block cluster with pale albedo, framing canopy, dust flipbook, birds sprite. Use for any "meanwhile,
across the valley" beat and for episode establishing shots.

## Status
- This video has frames/, full sheets, loudness and script stats like the rest, but NO per-topic
  measurements (it joined after the study). Treat these notes as visual evidence pointers.
- CB also mentioned a "pink paint in prison" episode (likely the drunk-tank-pink story) — NOT in the
  reference folder. If it lands in `video references/`, run sheets + loudness + transcript like the others.

## HOW HE HANDLES TRAINS (studied 2026-11-05 after CB: "the train looks so cheap")
Scanned the whole railroad episode: **he almost never shows a locomotive in the open.** Across 119
frames the train appears as (a) a dark SILHOUETTE in a tunnel mouth with one hot headlamp, (b) a tiny
shape far down the line, or (c) off-screen entirely while the rails, the people and the structures
carry the story. There is no clean, fully-lit, mid-distance locomotive anywhere in the episode.
WHY: a flat-shaded cartoon loco has nothing to look at up close, and he knows it. Rails, ballast,
canyon walls and faces are where his detail budget goes.
WE: two rules from this.
1. **Stage trains the way he does** — backlit silhouette with an emissive headlamp and steam, or small
   with atmosphere between. A plainly-lit hero loco at mid-size is the one framing that exposes the
   model (exactly what EP01's B14 did).
2. If a prop must be shown big and lit, it has to carry real geometry at that scale — detail where the
   camera looks (for a loco head-on: smokebox door, lamp, number plate, buffer beam, cowcatcher slats).
GAP: his trains stay mysterious; ours can earn ONE properly detailed hero loco reveal per series,
precisely because he never gives one.
