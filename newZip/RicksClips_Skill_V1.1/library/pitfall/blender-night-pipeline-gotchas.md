# pitfall: Blender night-short gotchas (earned NIGHT WITCHES, 2026-11-05) — HIGH

1. **Colours written as sRGB but fed to Blender as linear** -> every set rendered 2-3x too bright. Blender colour sockets
   are LINEAR. Write palette values as sRGB (what you see) and convert once (`lin()` in build_nw.py).
2. **EEVEE world volume swallows the sky**: a world Principled Volume (even density 0.0009) attenuated the background
   to black and darkened every frame. Use the compositor mist pass for depth haze instead (cheap, keeps the sky).
3. **Freestyle draws card borders**: flat image cards (characters) got a rectangle ink box. Turn `select_border` off
   and keep cards in the excluded (NoInk) collection.
4. **`bpy.ops.render.render(write_still=True)` with a relative output path wrote nothing** (no error). Always pass
   absolute paths.
5. **Blender's bundled Python has no PIL**: any helper imported inside Blender must import PIL lazily (only when it
   actually paints a texture) or Blender aborts the build.
6. **Toon clouds from fused spheres**: voxel Remesh + Smooth modifiers turn sphere piles into one painted shape; without
   it Freestyle inks every internal intersection. Painterly noise on the toon band must be large-scale (object coords
   scale ~0.025 for 100 m clouds) or it reads as speckle.
7. **9:16 framing**: horizontal FOV is ~0.56x the vertical; aim at the subject, stage in depth (see
   vertical-frame-narrow-hfov.md).
8. **Billable cloud actions are blocked by the auto-mode permission guard** in this harness even with the user's go in a
   relayed note: plan a local fallback (parallel Blender processes, Freestyle is single-threaded per process).
**Priority:** HIGH.
