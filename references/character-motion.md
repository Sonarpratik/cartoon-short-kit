# Reusable character views and facial motion

The user's persistent preference is a cast that can turn naturally, with lidded uneven eyes and small chin/cheek changes rather than a face frozen onto a front-facing body. The supplied images and private camera-reference video informed this preference. Do not redistribute those references or reproduce their characters.

Use [the shared library](../character-library/README.md), its original character designs and procedural rig for future projects. Save new designs and variants globally; copy selected cast definitions and the rig into each project before staging. Preserve each snapshot so future library changes do not change older projects.

Review a 12-view turntable (0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330 degrees), top and bottom views, sitting, walking, bending, task poses and the expression range. Check the side silhouette, rear hair, far-arm occlusion, coat details and hidden facial features from behind. Derive view angles from world heading and camera elevation. A camera-facing card must not imply a front-facing drawing.

Facial motion should be gentle and reproducible from the timeline: staggered blinking, slow gaze changes, expression-driven lids/brows/mouth and low-amplitude chin width changes. Avoid random per-frame noise and whole-face scaling. The micro-expression switch in Character Studio allows comparing a neutral model sheet with the animated version.

Character Studio is a review tool, not a replacement for scene-specific animation. Match walk speed to travel, align hands to props, put sitting characters on seats, and review expressions and visible silhouettes through the actual camera.

For turn corrections, check hair/skull occlusion and shoulder/arm overlap at intermediate angles, not just the four cardinal views. In a top view the scalp belongs over the crown; do not translate the frontal fringe backward. Walks at 30° and 60° must use the same stance/swing timing and world-space feet as the full profiles. Review eight phases of each walk and compare frames immediately around 90°/270° to catch renderer switches. After QA, preserve the shared sources with `node character-library/preserve-shared.mjs`.

The user tried the 3D hair experiment, then explicitly preferred the previous authored hair animation. The shared rig now restores that earlier hair, including its turn occlusion and crown view, while retaining softer facial features and the body/walk fixes. `hair-3d.ts` and `hair-models-3d.json` are inactive experimental assets; do not enable them by default.

For faces, follow the private studies in `references/frames/` and the user's supplied examples: small rounded pupils beneath thin, slightly uneven lidded eye curves; rounded, gently curved eyebrows with round ends; compact curved or oval mouths. Avoid broad solid half-disc eyes and sharp tapered brows. Adapt expression-driven lids and mouth shapes while preserving our own head seed, face colour, body and outfit. Original completed-video design sources stay archived; shared studio previews record the revised face/hair style separately.
