# Opening bottle grip correction

The user identified the detached 3D sleeve/palm in the opening shot. Removed that standalone object and used the investigator's native drawn arm, connected at the shoulder. The grip target is projected from the bottle's surface onto the actor billboard plane using the actual gliding camera, with the small character bob compensated. Bottle, camera, narration, scene length and all other scene sources remain unchanged.

Validation: project build passes. Captured S01 frames 0, 24 and 74 without page/shader errors, inspected the opening and mid-shot. Audited all 75 opening frames: the drawn hand projects to the bottle grip within numerical precision and stays inside the drawing canvas. Results in hand-contact-v16.json. Only S01 has new review frames; other scenes retain v14. overview_v16.jpg includes all nine scenes.

Existing full MP4 remains the completed v9 export; this correction is in the latest preview/review sources.
