# MKUltra — isolated video project

Narration and script are in `input/`. Source under `src/` belongs only to this video. `src/engine/` contains local copies of the reusable renderer; the repository templates and reference images were not modified.

Run from this folder:

```powershell
npm.cmd run dev
```

Open http://127.0.0.1:8790. Use **Play narration** for the animated preview with the original audio, or select a scene and scrub. The first render can take a few seconds on CPU WebGL. Dependencies currently resolve from the parent repository; when moving this folder elsewhere, run `npm.cmd install` here first.

Scene content: `src/scenes/S01.ts` through `S09.ts`. Custom characters and hand targets: `src/characters.ts`. Story props: `src/props.ts`. Interior construction and lighting: `src/world.ts`. `src/story.ts` dispatches scenes by global frame number.

Character review v2 uses off-white faces with a soft lavender edge, reduced facial lighting tint, scene-specific gaze and visible head reactions. Glasses follow head turns. Compare designs at http://127.0.0.1:8790/characters.html. The update affects S01-S06 and S08; S07/S09 retain their v1 files and frames. Versioned scene sheets and before/after comparisons are in `review/`.

`work/PLAN.md` has the shot plan. `work/timing.json` contains locally extracted word timestamps. `work/SOURCES.md` records historical verification and the pages/documents wording note. The supplied audio is unchanged.

To capture review frames, keep the server running and use another terminal:

```powershell
$env:CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:REVIEW_VERSION = 'v2'
npm.cmd run review -- S03
python scripts/sheets.py v2
```

Choose a new version instead of overwriting earlier frames. Omit the scene ID to capture all scenes. REVIEW_SCALE defaults to 1 for 1080x1920 capture. The capture script writes source/dependency hashes with each review manifest; it does not implement final-frame resume or a full video encode.

The approved video is rendered at `out/final.mp4`: 1080x1920, 30 fps, 1,034 frames, approximately 34.46 seconds, H.264 video with AAC audio. It uses the original narration timing, an original synthesized score and synthesized sound effects. `work/final-qa.json` contains final media checks and `out/qa-contact-sheet.jpg` contains sampled frames.

Generation helpers are project-local:

```powershell
npm.cmd run audio
npm.cmd run render
npm.cmd run finish
```

The render helper expects a fixed production preview at http://127.0.0.1:8791 (or PREVIEW_URL). Build with `npm.cmd run build`, then serve with `npx.cmd vite preview --host 127.0.0.1 --port 8791 --strictPort`. It captures at 1080x1920 using hardware D3D11 on this machine, keeps scene frames under source-hash folders, and reuses existing matching frames after interruption. The finish helper encodes and checks every decoded frame plus the final AAC loudness and true peak. Dependencies for Python helpers include imageio-ffmpeg, NumPy, SciPy and Pillow.

Any subsequent scene correction returns to review before generating a replacement final video. Shared templates and reference files remain unchanged.
