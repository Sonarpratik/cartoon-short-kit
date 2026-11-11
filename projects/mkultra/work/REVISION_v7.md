# Brighter face layer and tapered head outline

The user requested the luminous face layer and visibly uneven line weight in the supplied private reference.

CharacterPen now draws a soft pearl light band clipped to the actual bean-head contour, before ink and facial features. Head ink uses 0.74x base width and taper 0.76: the shaded edge is about 7.3 times the minimum lit-edge width. The head stays deterministic through expressions and tilt. Hair/body ink and facial marks retain their existing weights.

The face shader lifts the lit face, brightens the inner crescent, adds a restrained pearl edge and retains a softer cool shadow. Current backgrounds, camera framing, props, narration and timing are preserved. Shared face-style.ts, cast.ts, cardshade.ts and lighting-guide.md include the treatment for future projects.

Validation: both builds pass; shared day/golden runtime has no page/shader errors. All 31 full-resolution project frames across nine scenes pass capture. No-character S07/S09 sample frames are pixel-identical to v6. Compare review/face-glow-outline-v7.jpg; all scenes in overview_v7.jpg.

Existing out/final.mp4 remains the completed v6 export. This correction is at the review stage, awaiting generation under the skill workflow.
