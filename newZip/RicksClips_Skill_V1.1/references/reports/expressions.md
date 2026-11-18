# EXPRESSION CENSUS — the reference's face vocabulary

**Method.** `face_harvest.py` pulled frames at 2 fps from all 22 reference episodes, found near-white
head blobs by flood fill, cropped them to 190×190 and dropped near-duplicates (16×16 signature
correlation > 0.80). **1,445 distinct faces, 19 contact sheets.** I read sheets 03, 07, 11, 13, 16
and 19 — **about 420 faces, 6 of 19 sheets, 5 episodes heavily represented**
(He Could Spot Winning, How Painkillers Actual, The Burglar Who Only…, The Job Nobody Wants,
The Scientist's Insane, Why Humans Can't Pick, Why Perfect Railroads, The Window That Breaks,
This Knight Found the…). Counts below are my read by eye, not a classifier — they are stated as
dominant / common / rare, not as percentages I can defend to a decimal.

Private study material. The vocabulary is a drawing grammar, not artwork: we take the grammar and
draw our own faces with it. Nothing here is traced.

---

## 1. THE HEADLINE — three facts that change our engine

**1. The lid IS the brow.** The overwhelming majority of his faces have **no separate eyebrow
stroke at all**. A thick slanted bar over (or instead of) the eye carries the whole read. A floating
brow line appears only on anger and on raised-brow surprise — maybe one face in six.
*Ours draws two brow strokes on every single face.* That one difference is why our faces read busy
and interchangeable and his read clean.

**2. A large share of faces have NO MOUTH.** Not a dash — nothing. Deadpan reaction shots, listening
shots, most of the "camera holds on a face while the narrator talks" beats: eyes only. By eye this is
roughly a third of all faces, and it is the most common single mouth state in the corpus.
*Our `MouthK` has no "none" value.* Every face we draw has a mouth.

**3. Features sit LOW and WIDE.** The eyes are around 55–62 % down the head, not centred; the forehead
is a big empty dome. Eyes sit near the outer thirds. The mouth is small — about a fifth of head width
except on the open shapes — and close under the eyes. Everything lives in the bottom 40 % of the head.

---

## 2. EYE SHAPES — the complete set I can find

| # | Name | Drawing | Carries | Frequency |
|---|------|---------|---------|-----------|
| E1 | **flat lid bar** | one thick horizontal-to-slightly-slanted bar, no pupil under it | deadpan, dry, listening, "go on then" | **dominant** — the single most common eye in the corpus |
| E2 | **half-lidded disc** | filled black disc with a heavy lid cutting its top third | unimpressed, tired, sly | **dominant** |
| E3 | **ring eye** | white sclera circle, ink outline, black pupil dot inside | alert, attentive, sincere, speaking | common |
| E4 | **solid dot** | small filled disc, no sclera | plain / background read | common |
| E5 | **wide ring, shrunk pupil** | big sclera, pupil shrunk to a small dot | shock, terror, "oh no" | occasional, always on a beat |
| E6 | **up-arc closed** `^ ^` | an arc bowing upward | joy — rides with every big smile | common |
| E7 | **down-arc closed** `v v` | an arc bowing downward | content, eyes shut, asleep | occasional |
| E8 | **angry wedge** | a steep diagonal where lid and brow have merged into one thick wedge, inner corner down | anger, glare, determination | common (the railroad conductor's default) |
| E9 | **scrunch** | a short double curve, eyes pressed shut hard | pain, effort, strain, hard laugh | occasional |
| E10 | **side glance** | pupil shoved to one side inside the ring | suspicion, side-eye, "really?" | occasional |

That is **ten shapes**. He gets his whole emotional range out of them. There is no eleventh.

**What is NOT in the set:** no spiral/dizzy eyes, no heart eyes, no star eyes, no X eyes, no pie-eye
cartoon takes. (Ours has `spiral`.)

## 3. MOUTH SHAPES

| # | Name | Drawing | Carries | Frequency |
|---|------|---------|---------|-----------|
| M0 | **none** | nothing drawn | deadpan, listening, reaction | **dominant** |
| M1 | **short dash** | a thin short line, often tilted a few degrees | neutral, speaking softly | common |
| M2 | **shallow up-arc** | a gentle closed smile | pleased, warm | common |
| M3 | **shallow down-arc** | a gentle frown | concern, disapproval | common |
| M4 | **squiggle** | a `~` wave | unease, cringe, discomfort | occasional |
| M5 | **grit rectangle** | a wide rounded rectangle filled with 5–6 vertical tooth divisions | strain, fear, effort, terror, forced smile | common — one of his signatures |
| M6 | **open D-grin** | a big arc, dark inside, horizontal tooth row across the top | laughing, delight | common |
| M7 | **small open oval** | a little dark oval | speaking, "oh" | common |
| M8 | **smirk** | an asymmetric short curve, lifted on one side only | smug, sly, scheming | occasional |

**No tongue-out mouths** in anything I read. (Ours has `lick`.)

## 4. MARKS — he is far more restrained than we are

| Mark | Seen? | Note |
|------|-------|------|
| **sweat bead** | **yes** — the one mark he actually uses. A single blue teardrop at the upper temple, half outside the head outline | nervous, strained, caught out |
| steam / cloud puff | yes, but as a *prop* beside the head (an exhaling puff), not a face mark | |
| anger cross at the temple | **not seen in ~420 faces** | **we draw one on angry / rage / irritated.** Ours, not his |
| tear streams | **not seen** | **we draw them on `crying`.** Ours, not his |
| blush on adults | **not seen** — confirms `characters.md` ("0 of ~40 faces") | we draw blush on drunk / shame / flirty |
| shiver lines | not seen | ours |
| green sick blob | not seen | ours |

He carries pain, rage and grief with **eye shape and mouth alone**. The mark vocabulary is one item long.

## 5. GEOMETRY

- **eye height** ≈ 0.55–0.62 of head height from the top → the empty forehead is the signature
- **eye spacing** wide — pupils near the outer thirds of the head width
- **mouth** ≈ 0.72–0.78 down, width ≈ 0.18–0.25 W closed, up to ≈ 0.45 W on the open shapes
- **glasses** are a frequent character marker and ride over the eye unchanged — the eye shape is still
  readable through the lens; the lens never replaces the expression
- **3/4 view**: the whole feature cluster slides toward the near side and the far eye compresses.
  The features are not rotated or re-drawn.

## 6. WHAT OURS GETS WRONG — the fix list

| # | Our engine | His reference | Fix |
|---|-----------|---------------|-----|
| 1 | a brow stroke on **every** face | no brow on most faces | make the brow optional; draw it only on the anger and raised-surprise families |
| 2 | a mouth on **every** face | no mouth on roughly a third | add `MouthK = "none"`, use it as the default for deadpan/listening states |
| 3 | 48 expressions separated mostly by **brow angle** | ~10 eye shapes × 9 mouths | re-map every expression onto an eye shape + mouth pair; brow angle stops being the carrier |
| 4 | anger cross, tear streams, shiver lines, green blob, adult blush | sweat bead only | delete the invented marks; keep the sweat bead |
| 5 | `spiral` eyes, `lick` mouth | neither exists | drop them from the vocabulary |
| 6 | no merged brow+lid angry wedge | his default angry eye | add eye kind `wedge` |
| 7 | `teeth` = 3 dividers, shallow | 5–6 dividers, taller, rounder | re-cut the grit rectangle |
| 8 | `calm` and `smile_closed` draw almost identically | every state is distinct | separate by **eye shape**, not brow |

## 7. THE DEFAULT FACE

If there is one face to get right, it is this, because it is the most common frame in the corpus:

> **flat lid bar eyes, slightly slanted, set low and wide — and no mouth at all.**

Dry, patient, slightly unimpressed. It is the face the camera holds on while the narrator talks, and
it is the face our engine currently cannot draw.
