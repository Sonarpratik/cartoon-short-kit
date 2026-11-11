# Validation

- Nine scenes cover frames 0-1033 without gaps or overlaps.
- 31 review frames captured at 1080x1920 through the final browser renderer, with no shader/page errors reported.
- Every scene start and end rendered successfully in a separate browser check.
- Returning to frame 383 after another scene produced identical canvas pixels.
- Scene selection and original narration play/pause passed browser checks.
- The project production build passed.
- Input audio SHA-256 matches the uploaded original: D3696128691AE88F012EE469C1FEDCF5C40FD3140270B64E0990EE3F6325F0F8.
- Shared templates and references have no modifications.
- Final MP4 and audio mix not generated; awaiting scene review.

## Character revision v2

- Captured and inspected 24 updated full-resolution frames for seven character scenes.
- All seven scenes have new v2 sheets and before/after comparison sheets.
- Overview and review log retain all nine scenes, reusing S07/S09 v1.
- Verified original narration and S07/S09 baseline hashes again after capture.
- Off-white pixels, directional gaze and cache-consistent head poses passed browser checks.

## Final generation

- User explicitly authorized generation after review v2.
- All 1,034 frames rendered and encoded at 1080x1920, 30 fps.
- Decoded-frame QA found no black, white, frozen or unplanned large-change sections.
- Final AAC: -14.13 LUFS integrated; -1.24 dBTP true peak.
- Original narration timing retained; frame-grid duration differs by 0.0112 seconds.
- Music: -6.0206 dB vs narration gated RMS; SFX: -12.92 dB with peaks capped below voice.
- Sampled final appearance checked against approved reviews and inspected visually.
- Final file: out/final.mp4.


## Lighting and detail revision v4

User authorized shared-template and reference changes. Both builds pass; 31 full-resolution frames across nine scenes capture without page/shader errors. Shared player day/golden frames also pass. SKILL validation passes. New review sheets and comparisons are in review/mkultra-lighting-review-v4.zip. Existing final.mp4 remains the previous export; this revision awaits generation. See REVISION_v4.md.


## Character lighting v6

Rounded head lighting, brighter inner rim, soft cool form shade, stronger body/contact shadows, and corrected shadow-proxy direction. Both builds pass; shared runtime and 31 project review frames have no shader/page errors. S07/S09 sample frames are pixel-identical. See REVISION_v6.md and review/head-lighting-v6.jpg. Final MP4 remains the earlier export.


## Final generation v6

User explicitly authorized full generation. Latest reviewed sources verified before rendering. All 1,034 frames rendered; full encode and all-frame QA passed. No black/white/frozen/unplanned pop sections. Final AAC -14.13 LUFS and -1.24 dBTP. Final video out/final.mp4; previous video out/final-previous.mp4.


## Final generation v9: glossy head and clothing

User requested full generation and clarified clothing reflections mid-render. Added directional satin-like clothing reflection to project/shared character shaders and documented future default. Project/shared builds and shared runtime pass; 31 review frames pass. Latest source hashes verified; all 1,034 frames rendered. Final encoding, all-frame visual QA and audio QA pass. AAC -14.13 LUFS / -1.24 dBTP. Final video: out/mkultra-final-v9.mp4 and out/final.mp4. Prior v6 video: out/final-v6.mp4.


## Area 51 and karaoke variants

Both new exports complete. See GENERATION_AREA51.md, area51-clean-qa.json and area51-karaoke-qa.json. Original final.mp4 preserved byte-for-byte. All clean video/audio checks pass; subtitle coverage and retained picture/audio checks pass.
