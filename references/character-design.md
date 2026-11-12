# Character design: distinct, well-dressed, always facing us

The shared rig (`templates/bridge/character-rig.ts`, `toon.ts`, `angle-designs.ts`) keeps the house style: off-white bean heads, plum ink, thin limbs, glossy hair. Inside that style every character must be recognisable at phone size **from silhouette and costume alone**.

## 1. Design the cast for this story

Never start from the legacy `CHARACTER_ARCHETYPES` (a 1950s office cast). For each character, choose from `WARDROBE` in `director.ts`:

| Layer | Options | Field |
|---|---|---|
| Head silhouette | `sidepart` `receding` `bob` `spiky` `curly` `afro` `bun` `ponytail` `long` `buzz` | `hairStyle` |
| Headwear | `cap` `fedora` `beanie` `helmet` `peaked` (police/officer/captain) `tricorn` `bandana` `tophat` | `outfit.hat`, colour `outfit.cap`, trim `outfit.hatAccent` |
| Garment | `jacket` `shirt` `sweater` `vest` `hoodie` `coat` (long tails) `overalls` `apron` | `outfit.top`, colour `jacket`, under-layer `outfit.shirt` |
| Fabric | `stripes` `hstripes` `plaid` `knit` `dots` | `outfit.pattern`, `outfit.patternColor` |
| Neck | `shirt` collar, `turtleneck`, `vneck`; `tie`, `scarf` | `outfit.collar`, `outfit.tie`, `outfit.scarf` |
| Details | `badge` (star), `pocket`, `buttonCount`, `sleeves` colour, `belt`, `sash`, `labCoat` | `outfit.*` |
| Face | `glasses` `sunglasses` `eyepatch` `freckles` `blush`; `moustache`, `beard` | `accessories`, `outfit.moustache`, `outfit.beard` |
| Body | `adult` `stout` `kid` | `build` |

Costume tells the story: a cook has an apron, a captain a coat and peaked cap, a builder a helmet and overalls, a pirate a bandana, stripes and a beard. Pick clothing that says the character's job, era and status before they speak.

### Distinctness test (required)

Run `castDistinctness(cast)` from `director.ts` on the planned cast and fix every clash before staging. Two characters may share at most **one** of: head silhouette (hair style or hat), garment (top + pattern + build), main colour family. Also:

- Main characters get a pattern or a strong accent (scarf, tie, badge, hat trim) that minor characters do not.
- Use the colour wheel: no two speaking characters in the same hue family.
- Crowds: vary hat/hair, garment and colour per person with a seeded picker. Never repeat one design across a crowd.

### Example

```json
{"id":"cook","seed":37,"hairStyle":"bun","jacket":"#7aa36a","pants":"#3a3f4f","boots":"#3a2c2a","hair":"#c46a3a",
 "skin":"#faf9f5","coat":false,"accessories":["freckles","blush"],
 "outfit":{"top":"apron","apron":"#f1ebdd","pattern":"plaid","patternColor":"#e9d9a0"}}
```

Save new characters through Character Studio or `character-library/cast.json`, then review them in the studio at the size they will appear on screen.

## 2. No backs on screen (hard rule)

Characters face the camera: front, three-quarter or profile. **Never show the back of a character's head or body**, and no over-the-shoulder shots.

- Stage each actor's world heading so the camera-relative view stays within ±60° (`PREFERRED_SCREEN_YAW`). ±90° (pure profile) is the hard limit (`MAX_SCREEN_YAW`).
- When the story moves someone away from camera (walking off, climbing, leaving), move the camera ahead of them so they walk *towards* it, or show them in profile.
- Pass every on-screen yaw through `frontSafeYaw(yaw)` from `character-rig.ts`. It clamps the view while keeping the side the character faces.
- `npm run stills` fails and writes `<prefix>back-views.json` if any frame draws a character past profile. Set `ALLOW_BACK_VIEWS=1` only when the user explicitly asks for a back view.
- Character Studio still renders all 12 views for model-sheet review; that is not permission to use them on screen.

## 3. Alive, smooth micro-motion

The rig adds this automatically whenever `micro` is not false. It is deterministic from `time` (timeline seconds), so review stills and exports match.

| Motion | Behaviour |
|---|---|
| Breathing | Upper body lifts ~0.6% on a 3.6 s cycle; feet stay planted |
| Weight shift | Hips sway on two overlapping periods (5.3 s and 2.3 s), so it never reads as a loop |
| Head | Slow drift, plus a damped nod each time the expression changes |
| Blinks | Seeded and irregular (2–5 s apart), with occasional double blinks; half-lid frames in between |
| Gaze | Holds on a point, then a quick 3-frame saccade to the next one |
| Follow-through | Long hair, ponytails, bobs under hats, curls, buns, pom-poms and bandana knots lag behind head and walk motion |
| Reactions | Jaw/cheek settle with overshoot after `fromExpression` → `expression` (drive `expressionAge` from the timeline) |

Scene work still needs acting on top of this:

- Give each line of dialogue an expression change and set `expressionAge` from the cue, 0–3 frames before the word.
- Anticipate big actions (small dip before a jump or swing, lean back before a throw) and let them settle.
- Listeners react too: a glance, a blink or an expression change while someone else talks. Nobody stands frozen for more than ~2 s.
- Never add random per-frame noise. Use frame-based, seeded motion only.

## 4. Face and rendering style (unchanged preferences)

Off-white faces (#faf9f5), small round pupils under thin lidded eye curves, rounded brows, compact curved mouths. Tapered glossy reflection on hair and headwear; narrow contour-following rim on clothing; key-side pearl light inside the head contour. See [lighting-guide.md](lighting-guide.md) and [character-motion.md](character-motion.md).
