# Scene design: worlds that fit the story and feel alive

Compare your review sheets with `references/sheets/` before showing them to the user. The reference changes place, scale, camera height and light every few seconds. A short that spends every scene in one room with one shelf is not finished.

## 1. World concept first

Before writing `work/PLAN.md`, write a short **world concept** at the top of it:

1. **Signature set-piece**: one big, story-specific structure the short is remembered by. Design its geometry around the story's mechanism (a circular walled town around a button, a ship with gunports and rigging, a lab with the actual apparatus).
2. **Locations**: at least **3 visually distinct places** for a 20–30 s short (5+ for 60 s). Each one differs in at least two of: interior vs exterior, palette, scale, time of day.
3. **Scale ladder**: at least one huge wide shot (aerial or high establishing view of the whole world), one medium action space, and one macro close-up of a story prop.
4. **Light arc**: lighting follows the story, e.g. noon for the setup → golden for escalation → blue night for the explanation → morning for the payoff. Record the source for each change.

## 2. Set density

Keep the action area clear, and fill everything around it. These rules replace the older "only a few props" guidance.

| Zone | What goes there |
|---|---|
| Action area (hands, faces, hero prop) | Clear. Nothing blocks the face, the acting hand or the hero object. |
| Midground | Dense, story-specific dressing: furniture with joinery, tools of the trade, signage that reads correctly, stacked or used objects |
| Background | Architecture with trim, windows with light, distant buildings, trees, terrain; less contrast and thinner ink with distance |
| Foreground (optional) | One out-of-focus object for parallax during camera moves |

- Every location needs its own furniture and dressing. Never reuse the same shelf, desk or wall layout across locations.
- Props must belong to the story: if the narration says "47 scratches", show a close-up with the scratches and a counter.
- Use `createProp` and `templates/interior/` as building blocks, then write new story-specific geometry for the set-piece. Do not reuse the bridge or office set because it exists.

## 3. Ambient life (required in every shot)

Each shot needs **at least two** continuously moving background elements, deterministic from the frame number:

- Outdoors: drifting clouds, swaying trees or grass, birds, flags or pennants, smoke from chimneys, water shimmer, passing distant people or vehicles.
- Indoors: lamp or candle flicker, dust in window light, steam from cups or machines, clock hands, blinking instrument lights, curtains moving in a draught.
- People: background characters idle with their own micro-motion and small tasks (sweeping, reading, chatting), never frozen.
- Effects for story beats: puffs, sparkles, speed lines, impact bursts, music notes (`fx*` helpers in `toon.ts`).

Keep ambient motion slower and lower-contrast than the main action so it never steals focus.

## 4. Planning checklist per scene (work/PLAN.md row)

Scene ID and global frames · spoken words · location (from the concept) · camera beat type and move (see camera-guide.md) · characters, their headings (front-safe) and actions · hero prop · midground dressing · two ambient-life elements · light source/direction/colour · sound cue.

Before review, check each scene against: different from the previous scene? Faces visible and front-facing? Something moving in the background? Prop tells the story at phone size?
