# Scene v4 review

Implemented the requested richer sailing-ship scene and non-linear camera direction. The active scene source is under `projects/flying-dutchman/src/`; corrected character renderer remains under `characters/`.

Reviewed scene endpoints/midpoints at 1080 × 1920 and action/reveal cue frames. Inspected the moving review through a two-second contact sheet and additional captured transition frames. A hard water-plane edge found in that inspection was removed with distance haze that matches the actual sky colour; regenerated the moving review afterward.

- Sailing vessel rebuilt with rounded bilges/keel, curved bow, stern gallery, framed windows, hull strakes, gunports, cannon carriages, three masts, nine billowed square sails, two headsails, bowsprit, ratlines, rope coils, storage and detailed helm.
- Ghost uses dark wine timber, translucent torn sails with holes, crimson light and reflection, red sea haze, gentle drift/roll and fluttering pennants. It remains a dramatized reported sighting, not a new factual claim.
- Animated sea shimmer/wake, sail cloth, flags, suspended lantern and light flicker. Crew turn toward the apparition, lookout signals, midshipman retains distance-driven walking and 3D foot projection.
- Curved compass reveal, exterior descending sweep, reaction-to-apparition move, low-to-high apparition arc, curved walking track, morning mast-to-cap reveal and a restrained document arc inside the enclosed cabin. Original narration and cut timing retained.
- Geometric camera checks found all six paths non-linear, all sampled poses finite, no excessive same-shot camera jumps, and cabin camera positions inside the real walls and ceiling. Build, 448 character pose renders, 6,480 stance comparisons, 48 eye cases and foot projection checks passed.

Moving review: `review/scene-v4/The_Prince_and_the_Ghost_Ship_scene_review.mp4`, 720 × 1280, 30 fps, 1550 frames. Original narration mix is retained. See `review/scene-v4/qa.json` and `camera-checks.json` for verification. The full-resolution original MP4 is preserved separately; the new artifact is a scene review export.

Reference video and extracted reference images remain private study material and are excluded from original-source snapshots and deliverables.
