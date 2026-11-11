# Distinct cast designs

User requested moustaches, different hairstyles or hats so characters are easier to distinguish.

- Civilian: blue cap with a short visor.
- Researcher: receding grey hair, small moustache and round glasses.
- Official: silver side-parted hair, grey moustache and suit.
- Investigator: brown fedora, dark moustache and tie.
- Archivist: rounded chestnut bob and glasses, without a moustache.

The shared Outfit helper now supports a fedora and sidepart/receding/bob hair variants. Preserved white faces, glossy head reflections, variable head outline and pointed body-edge highlights. Scene timing, props, backgrounds and narration are unchanged.

Project cast-design.ts holds the single outfit definition used by both scene Character and the drawing gallery, avoiding the old duplicate gallery designs. Added reuse guidance in references/visual-guide.md. The specific story cast stays isolated in projects/mkultra.

Validation: project and shared production builds pass; all 31 review frames across nine scenes render without shader/page errors. Gallery and shared day/golden runtime pass. Checked expressions and eye clearance in actual scene previews. Clipped hair-part marks to hair shapes. Final gallery: review/cast-designs-v13.png; scene overview: review/overview_v13.jpg.

No full video exported for this review revision. The existing final.mp4 and mkultra-final-v9.mp4 remain the completed v9 export.
