# Reference index: what to read, what to study, what to ignore

All reference images and videos here are **private study material**. Never deliver, publish or copy them; never reproduce their characters, stories, text or shots.

## Read these (current rules)

| File | Use it for |
|---|---|
| [character-design.md](character-design.md) | Designing a distinct cast: wardrobe options, distinctness test, no-backs rule, micro-motion, expression-change reaction (jaw squash/woggle, §6) |
| [scene-design.md](scene-design.md) | World concept, location list, set density, ambient life, lighting by story beat |
| [camera-guide.md](camera-guide.md) | The reference camera approach: camera idea, always-moving takes, push-in per shot, joins instead of cuts, camera height, camera report |
| [lighting-guide.md](lighting-guide.md) | Our default light scheme: light sources per location, face/hair/clothing highlights, window light |
| [rick-light-scheme.md](rick-light-scheme.md) | Optional Rick light scheme and shaders (ask the user per short): light kinds per chapter, PBR metal, relief surfaces, painted sky, bright soft grade |
| [prop-detailing.md](prop-detailing.md) | Prop detailing: hero object first, real parts in the geometry, materials, story marks and lettering, held props |
| [physical-staging.md](physical-staging.md) | Enclosed rooms, connected roads, crowds, believable scale |
| [character-motion.md](character-motion.md) | Turn/walk rig details and the face style |
| [caption-guide.md](caption-guide.md) | **Default place / date / year card** (typewriter title + small date line + rule); code in templates/overlays/doc-caption.ts |
| [karaoke-guide.md](karaoke-guide.md) | Only when the user asks for subtitles |
| [STYLE_BIBLE.md](STYLE_BIBLE.md) | Measured facts about the reference channel: script formula, colour stats, camera timing |

When two documents disagree, SKILL.md wins, then this order: character-design, scene-design, camera-guide, lighting-guide, physical-staging, everything else.

## Study these (images)

| Folder | What it shows | How to use it |
|---|---|---|
| `sheets/short01..20_sheet.jpg` | One frame every ~2 s from 20 reference shorts | **Primary target.** Compare variety of locations, scale, camera height and costume against your review sheets. |
| `frames/` | Two full frames per reference short | Lighting, ink weight, material detail at full size |
| `camera-study/` (push, reveal, travel) | Sampled camera moves from a reference video | Speed and parallax of pushes, reveals and travel |
| `lighting/` | Face-light studies | Face rim/pearl highlight placement |
| `user-supplied/pirate-cannonballs/` | User's reference video and extracted frames | Curved travel, high-to-low reveals, foreground parallax |
| `user-supplied/japan-gambling-window/` + `lighting/*night*`, `lighting/*window*`, `lighting/warm-fluorescent-hall-haze.jpg`, `props/` | User's night-city reference: indigo ambient, one warm hero source with bloom, neon signs, wet reflections, dense wall/shelf props | **Lighting and prop-density target for night, alley and shop scenes.** See lighting-guide.md (Night city) and scene-design.md (Set density). |
| `user-supplied/second-draw/` + `characters/second-draw-*.jpg`, `lighting/second-draw-saloon-lamp-interior.jpg` | User's character + filming reference: warm skin, Studio-weight ink (not thicker), costume detail, portrait-mode DOF, rack focus | **Target for character drawing and highlight shots.** See character-design.md §5. |
| `style-examples/` | **Our own** rendered examples (face, hair gloss, clothing rim, karaoke) | Rendering details only. The background example is one office room: do not reuse its layout, palette or shelf for every story. |
| `scenes/flying-dutchman-v4/PLAN.md` | A complete per-scene plan | Format example for `work/PLAN.md`. Its S03 "travel behind shoulder" predates the no-backs rule; do not copy that move. |

## Ignore unless asked

- `../archive/reports/`: older research notes measured against a previous renderer. Several prescriptions no longer match the code.
- `projects/*/character-references/`: frozen snapshots of finished videos. Do not edit; do not treat their casts as defaults.
- The camera guide's roller-coaster study and the pirate-cannonballs video are two different references. Both are camera studies only.
