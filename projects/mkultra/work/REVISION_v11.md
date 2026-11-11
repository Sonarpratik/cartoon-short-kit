# Investigator and archivist body glow

Fixed a shared-helper bug: the previous `top < 350` filter rejected valid torsos whose shoulders shifted upward due to seeded head proportions. Replaced it with a garment-bottom/size check. Both investigator and archivist now receive the same narrow pointed body-edge reflection as the civilian. No outfit, camera, background, audio or timing changes.

Updated project and shared templates/bridge/face-style.ts. Project and shared production builds pass. All 31 v11 review frames capture without shader/page errors. Visually verified investigator S05 f458 and archivist S08 f902. Prior v10 frames retained; overview_v11.jpg and investigator-archivist-v11.jpg show the correction.

The existing MP4 remains the completed v9 export; latest correction is at review stage.
