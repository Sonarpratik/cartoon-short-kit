# Character revision v2

Requested change: apply the off-white character study to the reviewed MKUltra scenes.

- Off-white facial fill and faint lavender edge, shared with the character drawing preview.
- Reduced facial lighting tint and directional shading; clothing lighting remains active.
- Face meshes remain excluded from cast-shadow reception; ground-shadow proxies remain active.
- Scene-specific side glances and more visible head reactions. Glasses follow the facial offset and head tilt.
- Cached head poses use the same quantized angle for both drawing and cache keys, preserving frame determinism.
- Updated scenes: S01, S02, S03, S04, S05, S06 and S08.
- S07 and S09 scene sources, old review frames and sheets are byte-identical to their recorded baseline. Original narration is also byte-identical.
- Prior review sheets are retained. The latest overview reuses S07/S09 v1 alongside the seven v2 character scenes.
- Narration timing, scene ranges, props and cameras are unchanged.

Validation: project build passed; isolated browser checks passed for off-white face pixels, left/right gaze, deterministic cached head poses, and night/archive scene rendering. Review capture uses the built app to avoid live-reload interruptions.

The full video remains pending explicit generation after scene review.
