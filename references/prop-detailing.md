# Prop detailing: the reference approach

How the reference channel details its props, as rules for our three.js props (no Blender pass). Source: the Ricks Clips V1.1 kit (`newZip/RicksClips_Skill_V1.1/`: `CB_RULES.md` section 3 "PREMIUM DETAIL IN EVERYTHING", `agents/props-hero.md`, `templates/props/PIPELINE.md`). This adds to `scene-design.md` (set density, story props) and `visual-guide.md` (createProp, hand contact); where they overlap, this file is the more detailed one.

## 1. The hero object comes first

- Every short has ONE signature hero object: the thing that causes the story (the button, the oil can, the bell, the jar), plus 2-3 supporting props, each with a physical role in the cause and effect. Era-true, story-specific, always our own design.
- **Build the hero object first, alone,** before any set: full detail, checked at full size as a close-up. It is the star of the film and must survive a full-screen close-up.
- If the story builds or changes the hero object, make every intermediate state (one model per build step), so the camera can show the build in macro shots, including one shot with the camera inside it.

## 2. Detail is in the model, not the texture

**A plain box with a wood pattern on it is not detail.** Build the parts as geometry first; surface patterns come after.

- **Hero objects and vehicles: real parts.** Boards with a rim, hinges, handles, bolts, a frame, wheels and axles, a padded seat with a pattern, chrome trim, tyre tread, plates, lamps.
- **Structures:** thin lattice trusses with cross braces, footings, guy wires with anchors, rust and wear, and the structure's shadow on the ground. No thick plain bars.
- **Fine build lines** show how a thing is made: plank seams, panel edges, stitching, bolts, folds, cracks, grain. They are part of the model (thin geometry or line meshes), not a world outline pass.
- **Count the parts.** Look at a reference frame of the same kind of object: if it shows ten things and ours shows three, it is not done. Write **five specific details per main object** in the plan before building it.
- **Detail on everything in frame**, not only the hero object: stalls have goods, walls carry life, the ground has worn patches, pebbles and tufts.

## 3. Modelling rules (so props sit in our ink world)

1. **Real-world scale in metres**, origin at the prop's resting contact point (base-centred, like `createProp`), so it stands on the real ground height.
2. **Low-poly and faceted**: cylinders 6-12 sides, no smoothing subdivisions. The reference's props show their facets.
3. **Bevel every edge** (about 3-5 mm, one segment). The ink pass draws silhouettes, depth jumps and creases of 35° or more; unbevelled 90° corners read as a single line, bevels give the double line the reference shows on thick objects.
4. **One material per part, named by what it is** (`ironDark`, `brassLit`, `woodHandle`), so the scheme can recolour or swap materials by name.
5. **Albedo**: iron dark and desaturated; wood ochre; never lemon, never lavender. Lit surfaces land at L* 60-82 on screen.
6. **Mechanically plausible**: hinges on real pivots, wheels on axles, screws and bolts joining parts, supports that carry the load, clearance for moving parts. No decorative mechanics that could not work.
7. **Clean geometry**: real thickness, no holes, no overlapping faces, no z-fighting between coplanar surfaces (offset them or use polygon offset).

## 4. Materials

Name each part's real material (wood, iron, steel, bronze, brass, gold, stone, brick, glass, rubber, fabric, soil, grass, water) and give it a matching look:

- **Wood:** grain follows the shape and how the part was made; end grain on cross cuts; separate planks.
- **Metal is shiny:** rails, chrome and tools catch the light with a bright streak; polished, brushed, painted and rusty metal look different. Impacts on metal throw sparks with a flash on the hit frame.
- **Stone, brick, concrete:** irregular surfaces, chips, cracks; brick by brick, never one flat colour.
- **Glass:** reflection and a highlight; clear and frosted read differently.
- **Grass and plants:** clumps and blades with light and dark patches; trees in clumps and lines, never evenly spread ball trees.
- **Shine comes from material and light**, never painted-on white glare. Glints cover about 1-2 % of the frame.
- **Continuity:** a prop keeps its material, wear and scale in every scene and from every angle.

Which shader renders them depends on the light scheme chosen for the short (ask the user; see `rick-light-scheme.md`): with our scheme use our toon and `paint.ts` materials; with the Rick scheme use its PBR metal and real-size relief surfaces.

## 5. Story marks and lettering

- **Every hero prop carries one readable story feature** (the bolt's forging flaw, the bell's four bronze handprints with drips at the lip, a counter's worn digits). If it does not read at phone size, it does not exist.
- **Lettering fits the story:** every sign, cart, label and banner carries words from THIS story (the ride's name, the event, the stall names), 1-4 words, hand-painted to suit its surface, spelled right, readable at phone size. No filler words, no stars in place of words. Signs with words hang still, so they can be read.
- **Environmental storytelling:** visual evidence of what happened before the scene: unfinished work, failed attempts, damage, wear, notes, leftover materials, how things are arranged. Nothing generic or random: every prominent object connects to the story, a character's goal, the activity or the place.

## 6. Held props

- **Held and near props are real 3D objects** (a glossy balloon with a highlight), never drawn inside the flat character card.
- **The hand grips it:** the object is placed first, then the round ink fist sits ON its grip, centred on the shaft, with a thumb and creases. The prop moves with the hand every frame; no floating prop beside a hand.
- **Props in hands on day one:** before the first review frames, test every held prop in its character's hand in three views. Review frames with placeholder props are not sent.
- Keep the acting hand and the hero prop unblocked (scene-design.md action area).

## 7. The prop on camera

- **Insert inside the take, not a cut:** the camera pushes in on the prop (about 0.3-0.8 m away, a longer lens, focus locked on it, background blur on) on the word that names it, then glides back out (camera-guide.md section 3).
- **The named thing is on screen when its word is spoken**, large enough to read on a phone.
- **Sized to read:** the small story thing (a pin, a chip, a chalk ring) is large enough to read at the moment its word is said.

## 8. Check before the user sees a frame

- The hero object alone, at full size, beside a reference frame of the same kind of object: parts counted, the five details present.
- Phone check at 360 px wide: the prop's silhouette reads, its story mark and lettering read.
- Contact: feet of furniture, wheels and the base of every prop sit on the ground with a contact shadow; nothing floats, nothing sinks.
