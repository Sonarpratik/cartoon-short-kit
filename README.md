# Animated Shorts

Canvas2D cartoon characters in a Three.js world. Playwright captures frames and FFmpeg encodes video.

New projects inherit the user's [lighting and detail preferences](references/lighting-guide.md): off-white faces with soft inner highlights, window-shaped light across interiors, and detailed original furniture and sets. Shared helpers live in `templates/bridge/lighting.ts`, `shade.ts`, `cardshade.ts` and `props.ts`. Outdoor scenes leave the window projector disabled.

## Character preview

Requires Node 22.6+. Run `node preview-characters.mjs` and open http://127.0.0.1:8787. Edit `templates/bridge/toon.ts` and refresh. No dependency installation is needed.

## 3D scene preview

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://127.0.0.1:8788 to play or scrub through the scene. Optional Kenney models belong in `public/bridge/kenney/`; they are not included. Missing models are skipped and procedural scenery remains. Audio assets are not included; the preview is silent.

## Capture frames and encode video

Keep the preview server running. In another terminal:

```powershell
npx.cmd playwright install chromium
npm.cmd run stills -- out/bridge/f 0,100,400 0.5
```

Capture all 2,025 frames at 1080x1920 and encode:

```powershell
npm.cmd run stills -- out/bridge/f 0-2024 1
ffmpeg -framerate 30 -i out/bridge/f%04d.jpg -c:v libx264 -crf 17 -pix_fmt yuv420p out/bridge/video.mp4
```

For 1440x2560 use scale `1.3333333333333333`. Add a separately prepared audio mix:

```powershell
ffmpeg -i out/bridge/video.mp4 -i mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest out/bridge/final.mp4
```

`CHROME_PATH` selects an existing Chrome executable. `PREVIEW_URL` selects another running preview server. `npm.cmd run build` builds the browser app.

## Source

- `preview-characters.mjs`: standalone character gallery.
- `templates/bridge/player.ts`: Three.js playback, effects and deterministic `window.renderFrame(frame)` API.
- `templates/bridge/toon.ts`: character drawing.
- `templates/bridge/style.ts`: reusable line, blur and texture-detail settings.
- `templates/bridge/props.ts`: painted crate, barrel, bench and table builders.
- `templates/bridge/story.ts`: frame timing, cameras and shots.
- `templates/bridge/world.ts`: scenery and character staging.
- `templates/scripts/bridge-stills.mjs`: Playwright frame capture.
- `templates/audio/`: Python audio synthesis and mixing templates (requires NumPy).
- `references/`: private style study material; do not publish reference images.

Reference reports are historical research notes and may describe the former renderer. Current setup and commands are above.

The skill plans props from the narration automatically. You only need to specify objects when you have a particular preference. New settings still require scene design and sometimes new prop code; the library is a starting point. The scene-review workflow is documented in `SKILL.md`, with visual guidance in `references/visual-guide.md`.

Code and documentation are MIT licensed. See LICENSE.
