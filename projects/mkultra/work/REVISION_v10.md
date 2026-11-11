# Corrected clothing reflection placement and shape

The user clarified that the reference body glow hugs the curved border and has pointed ends. Replaced the central shader streak with a narrow contour-following ribbon drawn by CharacterPen.gradFill, inset from the source-facing ink. Ribbon width tapers smoothly to zero at both ends, with a restrained soft glow underneath. The actual garment polygon determines its curve, including leaning or posed bodies. Buttons, collars and costume marks draw afterward and remain clear. Shader retains only a subtle broad wrap.

Promoted the change to templates/bridge/face-style.ts and cardshade.ts and corrected references/lighting-guide.md so future projects avoid the former central streak. Head reflection, face lighting, outlines, backgrounds, camera and audio are unchanged.

Validation: project/shared builds pass; 31 review frames across nine scenes render with no page/shader errors. Shared day/golden runtime passes. Non-character S07/S09 samples remain pixel-identical to v9.

Comparison: review/body-edge-v10.jpg. Existing out/mkultra-final-v9.mp4 and out/final.mp4 remain the completed v9 export; this correction is at the review stage.
