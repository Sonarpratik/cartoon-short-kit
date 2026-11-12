# Motion review against supplied reference — revision 3

Studied the supplied 63.5-second, 720 × 1280 reference at 1 fps, plus a 6 fps sequence from 7–9 seconds. Private reference extracts remain under `work/private-motion-study/` and are not delivery artwork. Observations: clear thin-limb silhouettes, restrained body movement, connected expressions/headwear and readable foot contacts. We study these qualities without copying characters or shots.

The clothing redesign did not change the gait implementation. It exposed existing movement/staging problems and added oversized hair and an unintended facing change:

- Fixed cadence was 1.4 cycles/s with 0.8325 m/cycle at the actual 2.5 m card height: 1.1655 m/s of gait versus 0.65 m/s of travel. Distance now determines gait phase. A 0.35 s acceleration/deceleration ramp and blended limbs remove abrupt start/stop poses.
- Camera-bearing subtraction was opposite to the projected limb axes. Corrected relative view sign; verified all 12 headings against all 12 camera bearings.
- Cards copied camera pitch while the rig projected camera elevation again. Cards are now upright. Gait joints are projected from their actual 3D locations onto the card along the camera ray, keeping foot endpoints aligned with the deck under perspective.
- Midshipman walked almost through George (x=.6 vs x=.5). New route x=2.1 has clearance, and S04 camera tracks that route.
- Spiky hairstyle implicitly changed head asymmetry via the facing default. Active cast now has explicit facing=1. Spikes remain distinct but are reduced in height/width.
- Thinned and darkened limbs for clearer silhouette; reduced weight-shift amplitude. Preserved different costumes, hair, beard and moustaches.
- Eye outlines/pupils were visibility-tested separately, so a side-view outline could survive while its pupil vanished. An eye now shares one head-surface anchor for outline, lid and pupil.

Validation: production build passed; 6,480 stance comparisons, 448 rendered direction/gait poses, camera-axis checks, zero-speed start/end checks, 48 side-view eye cases and actual 3D-to-card foot projection checks passed. The continuous full-stride numerical stance drift is below 1e-14 m; this is a mathematical rig check, not a claim that every eased transition is perfectly stationary. Per-frame foot perspective projection error is below 2e-12 NDC. See `review/motion-v3/checks.json` and `eyes-ground-checks.json`.

Delivery: `review/motion-v3/walk-before-after.mp4` (original renderer/design vs correction on a fixed-ground stage); `review/motion-v3/scene-motion-preview.mp4` (8.5 s of the actual corrected scene with unchanged narration timing). Original sources archived under `work/motion-before/`. The prior full MP4 remains the earlier version; this task produces review clips and updated source, not a silently replaced full export.

Current working renderer: `projects/flying-dutchman/characters/`. Preserved corrected snapshot: `references/characters/flying-dutchman-motion-v3/engine/`. Earlier folders `references/characters/flying-dutchman/` and `flying-dutchman-v2/` remain original design history, not the active motion source. The shared template and unrelated completed projects were not changed by this motion correction.
