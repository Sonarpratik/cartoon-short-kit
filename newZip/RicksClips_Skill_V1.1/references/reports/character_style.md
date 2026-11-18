# Reference character style law (studied 2026-11-04: railway frame_030, cashiers + burglar contact sheets)

HOW he does it / WHY it works / HOW WE do it:

1. **Head = same warm WHITE for everyone** (~#fffaf7 measured). Identity never lives in head colour.
   WHY: one face system, infinite cast, zero uncanny skin politics. WE: toon.ts SKIN/SKINS locked white.
2. **One ROLE ICON worn high, readable from across the street**: cop's star cap, burglar's balaclava
   band, fisherman's bucket hat with lures, clerk's huge curly mop. The icon is role-born, not random.
   WHY: thumbnails and wides must cast the scene instantly. WE: every lead carries one (Eli = white
   card tucked in the hat band; Royce = pale silk tophat; Bigelow = bowler; Pip = oversized cap+satchel;
   crews = straw discs vs kepis).
3. **Hair is a major identity shape** when there is no hat (acorn swoosh, afro mop, bun, side-part) and
   it stays CONSISTENT across views (fringe/sideburns front ↔ nape/full back).
4. **One vibrant signature colour block per character** (pure red polo, bright cop blue, yellow raincoat)
   + role details ≥5 (name tag, collar, placket, badge, chain). Shade is a clear two-tone CRESCENT
   shape, not a faint gradient. WHY: flat painted look + readable depth. WE: vibrant cast palette pass,
   cloth shade ratio ≈ [0.80,0.78,0.88].
5. **All four limbs the same dark tone** (near-ink sticks), leg+foot one bending line, no shoes
   (footwear appears only as a STORY prop, e.g. the burglar in the family's slippers).
6. Faces vary by lids/brows/specs/stubble/freckles on the one face system (our FaceDNA).

## FULL-ATLAS STUDY (CB-ordered round 3): every face in every folder — 152 face crops auto-detected
## across 19 episodes (sheets: C:\remotion-tmp\face_atlas\faces_1-4.jpg; detector: white-head blobs)

### Face taxonomy (the complete range he uses)
- EYES carry the emotion and CHANGE SIZE with it: deadpan = heavy-lid flat bars or small dots ·
  innocent/excited = big outlined circles + centred dot pupils (clerk, kid, Second-Draw cowboy) ·
  worried = round outline + tiny pupil · happy-closed = deep arcs · pain = X-scrunch. Never one
  fixed eye size across moods.
- BROWS: thick bold bars sitting CLOSE to the eyes (often touching the lid line); the ANGLE does the
  acting. (Our fix: brow weight 5u→6.5u, height 20u→16u above the eye line.)
- MOUTHS: deadpan tiny flat line · small talk = soft grey oval · big emotion = white teeth row +
  red/pink interior · full grin = teeth band · worry = wavy line.
- BLUSH EXISTS: kids, grandmas and embarrassment carry soft pink cheek ovals (Painkillers boy,
  Job grandma, Science kid). Freckles and stubble as dot marks.
- FACIAL HAIR: huge readable shapes — handlebar, walrus (covers the mouth), horseshoe, pencil,
  chin-ring beard; brown/grey/orange.
- HAIR (no hat): a FLAT FILLED SHAPE hugging the skull — bowl/helmet with ear arcs, side-part slab,
  centre-part, spiky fringe tufts, bun; cut straight or curved across the forehead. With a hat:
  usually NOTHING in front, or a temple sliver at the rim (railway bowler).
- HEAD: round/egg; features cluster centre-low; big empty forehead = the hat/hair zone.
- INK: all face features drawn BOLD; faces read at thumbnail size.

### Outfit taxonomy (CB-ordered: how everything is designed)
- Torso = the garment as ONE flat colour block with a simple neckline (V or round); layering reads as
  a second colour at the neckline/vest outline, never as drawn fabric.
- FRONT PLACKETS: vertical line + button dots / zip line (cop, fisherman, engineer) = cheapest
  "real clothes" signal.
- ROLE ICON ON THE CHEST or HEAD: name tag, badge star, apron bib, bowtie+vest+watch-chain,
  neckerchief; the costume states the JOB at a glance.
- PATTERNS are allowed and loved: pirate stripes, engineer's striped cap, plaid/check suit (Mirror),
  pinstripes — one pattern per character max.
- HATS always carry a BAND line; hat zoo: toque, bowler, tophat, kepi, crown, bandana, bucket, cap.
- ARMS: always bare dark sticks off the torso — ALL costume detail lives on the torso/head.
- ARM LENGTH: hands end at the hip (adults) / mid-torso (kids) — short, never knee-length.
  (Our fix: armK = (torso+0.08)/1.12 scales every arm drop; kid ≈ 0.83.)
- Front-view hair under a hat = EDGE SLIVERS hugging the head silhouette below the brim (fisherman's
  brown temples, railway bowler's grey patch) — clipped by the head outline, NEVER a mark inside the
  face area ("grey dot" failure).
- Arms: NO shoulder stubs after all — the dominant pattern (cop, clerk, fisherman, watchman) is clean
  dark stick arms straight off the torso; Kyle's polo stub is torso-integrated, a rare exception not
  worth the armpit misread. Costume detail lives on the TORSO (plackets, zips, tags), never the arms.
- Specs = THICK dark rings centred exactly on the eyes + bridge (clerk) — thin offset wire reads wrong.
- Mouths: small talk-mouth interior is soft GREY (Kyle); saturated red/pink interiors are reserved for
  big emotional mouths (fisherman shout, clerk wow, + teeth band on grins).
- Brows thick and close to the eyes; excited eyes = round + dot pupil; default = heavy-lidded almond.

CREATIVITY GAP: the reference never uses the hat-band as a story pocket — Eli's card-in-hatband is
ours alone; later episodes can rotate what lives in the band (telegram, flower, pay stub) as a
character-state signal the audience learns to read.

## ROUND 3 — the geometry CB signed off (2026-11-05). Measured, not guessed.
Source of truth: `<HOME>\Documents\claude-animated-shorts` — `references/reports/characters_v3.md`
("hair or a hat covers the top 25-30 %"; bare head H/W 0.95), `lab/chars_v2/heads_manual.json`
(315 measured heads), `lab/characters/toon_v3.ts` (working engine), `lab/chars_v2/rick_face_zoom.jpg`.
- HAT SEAT 0.28-0.30 of head height — and NEVER lower: eyes sit at ~0.5 and brows ~0.35, so a deeper
  seat puts the brim on the brows. There must be clear white forehead between hat edge and brows.
- HAT BODY must clear the skull by ~7 % so the head's own ink outline never shows above the hat.
- HAIRLINE IS STRAIGHT. No arch. (An arched hairline dips over the eyes in 3/4 and side = blindfold.)
- HAIR UNDER A HAT = temple wedges at the head's outer edge (outer ~18 % of head width only), from the
  seat line down to about eye height — beside the face, never across it, in any view.
- NO NOSE TICK on the side or 3/4 face.
- SIDE VIEW: stance legs SPREAD (far leg back ~-17u, near leg forward ~+19u) so both read, each with a
  filleted knee. One stilt = wrong.
- LIMB LINES: 5.5u strokes, 6u hand dots (CB's +10 % pass).
- ARMS ANCHOR TO THE TORSO'S WIDTH **AT SHOULDER HEIGHT**, not to a fraction of its widest point —
  these bodies are eggs, so wide builds are narrower at the shoulder and a fixed fraction leaves the
  arm starting in mid-air (`halfWAt()` in toon.ts).
- A ROLE ICON NEEDS A MARK: a blank white rectangle read as "what is that square?" — the playing card
  only works with card proportions, a tilt and a red pip. If the viewer has to ask, the icon failed.
- LEG SHAPE (CB ref image, 2026-11-05): a leg is ONE SMOOTH SHALLOW BOW — nearly straight, the knee a
  gentle forward curve in the line, feet as short forward ticks. NOT a dog-leg: IK with a dropped hip
  produced a zig-zag (hip forward, knee out, shin back) which CB rejected. Implementation: hip at
  ~0.975 of leg length, knee placed by hand ~7u forward of the hip-ankle midline, legLine fillets
  rounding it into a continuous curve.
