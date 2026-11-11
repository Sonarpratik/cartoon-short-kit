# Separate Area 51 and karaoke exports

User explicitly requested adding AREA 51 and written content to the paper in the final scene, plus active-word karaoke subtitles in goldenrod, preserving the previous final.

Preserved: out/final.mp4 and identical backup out/mkultra-final-v16.mp4. New clean export: out/mkultra-area51-clean.mp4. New captioned export: out/mkultra-area51-karaoke.mp4.

Only S09 scene source changed. Paper faces the camera, has a large AREA 51 title and original fictional routine-operations copy, and feeds into the shredder. No narration edits. Reused all eight unchanged scene captures; captured 86 updated S09 frames. finish.py now accepts distinct output/report filenames so variants do not overwrite the original final.

Karaoke: 28 phrase groups from existing word timings, white inactive words and goldenrod #DAA520 active word, Arial Bold 76 with dark outline. Short phrases stay inside the vertical safe area. Twenty thousand displays as 20,000 over its combined spoken interval. ASS and plain SRT are supplied alongside the video. Audio bitstream copied unchanged from the new clean export.

Validation: all 1,034 clean frames checked for black/white/freeze/pop events, all nine scenes compared to latest reviews; all pass. Subtitled export decodes 1,034 frames with no black/white frames. Every one of the 78 displayed active-word intervals has encoded goldenrod pixels at its timed midpoint. Picture above the caption region stays within 0.356 mean RGB levels of the clean encode. AAC audio bitstream is identical to clean (-14.13 LUFS, -1.24 dBTP). Prior final hash unchanged. Inspected initial word styling and final AREA 51 / shredded? frame.

Commands: python scripts/finish.py --output mkultra-area51-clean.mp4 --report area51-clean-qa.json; python scripts/karaoke.py; python scripts/karaoke_qa.py.
