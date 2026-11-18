# Blender pipeline (CB rule 2026-11-04: props AND textures AND effects)

Blender serves three jobs in every episode, all through the same headless path:

**1. Hero props / assets** (this file's main recipe below). Every episode gets ONE signature hero prop
(the reference's grammar: the button, the oil can, the grave bell, the jar) plus 2-3 supporting props,
each with a physical role in the cause-and-effect. Era-true, story-specific, always OUR OWN design.

**2. Baked textures.** Where paint.ts' Canvas2D procedurals fall short (complex wood grain, stone with
real occlusion in the cracks, worn metal), build the material procedurally in Blender and BAKE to PNG
(diffuse only - the world is twoTone-lit, so bake albedo, never lighting). Bake targets are the measured
numbers: lit surfaces L* 60-82, seams 3-5 px @1080 with <= 2.5 px ramps, chroma in the SCORECARD family.
Save to `public/<episode>/tex/`; wire as `map` in build.ts like any paint.ts canvas.

**3. Effects.** Two kinds:
- **Flipbook sprites**: smoke puffs, dust, splashes, debris bursts simulated or hand-keyed in Blender,
  rendered with flat/workbench shading on transparent background to a sprite-sheet PNG (4x4 or 5x5,
  30 fps), played by cast.ts effect cards (NOINK layer, same as the drawn fx). The reference's effects
  are flat 2D cartoon sprites - render toon-flat, add the plum/black outline in compositing or draw it
  into the frames.
- **Event geometry**: one-shot 3D pieces (the snapped chain link flying, deck splinters) exported as a
  GLB per piece and animated in story.ts/world.ts, or a baked keyframe sequence when the motion is
  simulated (rigid-body in Blender -> sampled positions -> a JSON track world.ts plays).

Headless entry points: `blender.exe -b --factory-startup --python <script>.py -- <args>` or the Blender
MCP (`execute_blender_code_for_cli`). Proven: forged_bolt.glb (below).

Proven 2026-11-04: `rick-shorts/public/bridge/props/forged_bolt.glb` (the 1831 stay-chain bolt, 300 tris),
built headless by `blender.exe -b --factory-startup --python make_bolt.py -- <out.glb>`.
Blender: `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe` (5.2.2 LTS). The Blender MCP
(server "Blender") also works: `execute_blender_code_for_cli` for background bpy, or the interactive
tools when the GUI is open.

## Modelling rules (so it sits in the ink world)
1. **Low-poly, faceted**: cylinders 6-12 sides, no subsurf. The reference's props are visibly faceted
   (the button dome shows facets).
2. **Bevel every edge** ~3-5 mm, 1 segment: the ink pass (ink.ts) draws on silhouettes, depth jumps and
   creases >= 35 deg - unbeveled 90 deg corners read as single crease lines, bevels give the double line
   the reference shows on thick objects.
3. **One flat Principled material per part**, roughness ~0.85, no textures: build.ts recolours by
   material NAME (RECOLOR map) and converts to MeshLambert + twoTone. Name materials semantically
   (ironDark, brassLit, woodHandle).
4. **Albedo rules** (SKILL.md): iron dark and desaturated; wood ochre; never lemon, never lavender.
   Lit surfaces must land L* 60-82 on screen (SCORECARD texture row).
5. **Real-world scale in metres**, origin at the prop's resting contact point, +Y up after export
   (Blender's glTF exporter converts Z-up -> Y-up itself).
6. **The story detail**: every hero prop carries one readable story feature (the bolt's forging-flaw
   wedge; a tally counter's worn digits). If it doesn't read at 540p, it doesn't exist.

## Into the project
- Drop the GLB in `public/bridge/props/` (or `public/<episode>/props/`).
- Load like the Kenney kit: add the name to the loader list (world.ts KENNEY pattern) or a per-episode
  PROPS list; recolour by material name in build.ts; twoTone applies scene light; NO NOINK layer (world
  ink SHOULD outline props - only character cards are NOINK).
- Give it the reference's insert-shot treatment (story.ts): camera 0.3-0.8 m away, push-in ~0.6 %/f for
  ~35 f on the punch word, DOF cInf 12-16 px with focus locked on the prop, foreground framing optional.

## QA before it ships
- `ink_scan.py` on an insert still: >= 60 % of its strong edges carry a line, EW 2.5-4.5 px @1080.
- `grade_metrics.py`: its lit faces inside L* 60-82, chroma in family.
- The silhouette test: readable black-on-white at 150 px tall.
