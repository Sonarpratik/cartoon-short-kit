# Shared character and camera direction

User requested studying the supplied roller-coaster reference's gliding camera movement and combining character and camera preferences in one shared file for future projects.

Canonical file: templates/bridge/director.ts. Includes distinct character archetypes, face brightness/base/shadow settings, head outline taper, body-edge glow widths/inset, hair reflection width and continuous camera helpers. The MKUltra project's src/engine/director.ts is a byte-identical snapshot. Its cast-design.ts now imports archetypes from that snapshot; CharacterPen/cardshade consume its style settings, and all nine scene cameras use cameraJourney. Future projects copy the canonical file with the engine helpers, preserving approved projects from later global-default edits.

Reference study: sampled the user's actual local video at three frames per second around 7-9, 17-21 and 36-40 seconds. Observed wide-to-character approaches, lateral/parallax travel and tilting reveals, alongside cuts for time/place changes. Analysis images are private and excluded from delivery.

MKUltra now has noticeable dollies, lateral travel and reframing. The lab uses multiple smoothly connected camera keys, including continuous focus changes. The destruction shot follows the stamp before approaching the shredder. Existing character designs, glossy reflections, pointed body rims, background art, narration and scene timing remain.

Validation: project/shared builds and skill validation pass. All 31 full-resolution v14 review frames across nine scenes render without shader/page errors. Every camera frame audited for finite poses, static spans and position steps (maximum 0.084 metres/frame); endpoint checks and internal tangent continuity pass. The 221-frame silent excerpt (540x960, 15 fps, 14.73 s) decodes fully without black frames. This is a motion review of S01/S03/S07, not the full final video. Inspect camera-paths-v14.jpg and camera-motion-v14.mp4.

Shared instructions updated in SKILL.md, references/camera-guide.md and visual-guide.md. Existing full MP4 remains the completed v9 export; latest changes await full generation after review.
