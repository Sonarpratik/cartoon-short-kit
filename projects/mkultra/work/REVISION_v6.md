# Character light and shadow revision

Requested: retain the window-lit backgrounds and give the characters rounded, glowing head lighting and appropriate shadows matching the supplied workshop reference.

Changes are confined to character drawing/shading and its shadow proxy. Room geometry, props, window light, grade, camera framing, narration and scene timing are preserved. The previous sign-clearance fix remains.

- Rounded head lighting follows the scene key rather than a flat card normal. Per-character UV head bounds follow the actual head seed, facing and tilt.
- A broad, soft lit crescent and inner rim brighten the source-facing edge; cool soft form shade gives the opposite side depth. Dark ink and facial features remain readable.
- Hair receives a restrained reflected highlight. Clothing has stronger form shading and receives environmental cast shadows. Face shadows retain a bright floor.
- Contact shadows are stronger, and silhouette shadow proxies face the source relative to each actor's world position.
- Shared cardshade.ts and lighting-guide.md carry the improvement into future projects.

Review images are versioned and earlier frames remain intact. No updated full MP4 has been generated; out/final.mp4 remains the earlier completed export.

Validation: both production builds pass, shared day/golden runtime has no shader/page errors, and all 31 project review frames across nine scenes pass. Non-character S07/S09 sample frames are pixel-identical to the prior revision.
