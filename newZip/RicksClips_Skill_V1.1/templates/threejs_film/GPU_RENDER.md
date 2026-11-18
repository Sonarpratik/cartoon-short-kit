# GPU render for the three.js film kit (`render_gpu.mjs`)

Written 2026-11-14. Tested on this PC: RTX 2070 SUPER (8 GB, driver 560.94), Windows 10, Ryzen 9 3900X, Playwright 1.49.1 with its Chromium 131.
Test film: `episodes/armor-no-holes/stretches/armor-s2-rule/film.json` (292 frames, 1080x1920, about 43,700 objects, read only). All test files are in `_gpu_test/`.

**Result: it works.** The graphics card draws the frames, the picture matches the software picture, and a full-size frame takes about 0.55-0.9 s instead of about 4.7 s.

Proof of the device (printed by the script on every run, read from the film's own WebGL context with `WEBGL_debug_renderer_info`):

```
GPU:      ANGLE (NVIDIA, NVIDIA GeForce RTX 2070 SUPER (0x00001E84) Direct3D11 vs_5_0 ps_5_0, D3D11)
software: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)
```

## How to use

Same commands and options as `render.mjs`, run from this folder:

```
node render_gpu.mjs <film.json> --frames 0,60,150 --scale 1 --stills-dir <dir>
node render_gpu.mjs <film.json> --frames 100-129 --scale 1 --stills-dir <dir>     (a range is new)
node render_gpu.mjs <film.json> --animatic --scale 1
```

Extra options:

| Option | What it does |
|---|---|
| `--software` | The old software WebGL (same launch as `render.mjs`), for comparing. |
| `--gpu-info` | Print the renderer string and stop. |
| `--seed N` | Fixed "random" numbers in the page (dust motes, set scatter). Needed to compare two renders pixel by pixel; without it the dust differs on every run, in `render.mjs` too. |
| `--grab screenshot` | Read the frame with a browser screenshot instead of the page's canvases (default `canvas`). Both give the same pixels (measured: max difference 1 of 255). |
| `--cache <dir>` | Where the copy of the character package goes. Default: a temp folder per process, deleted at exit. |
| `--no-patch`, `--no-guard`, `--guard max` | Switch off the two fixes below (for testing only). |
| `--headed` | A real off-screen window instead of headless. Not needed; headless works. |
| `--eval <file.js>` | Debug: run a script in the page after the last still (`_gpu_test/diag_*.js`). |

If the graphics card is asked for but a CPU renderer answers, the script stops with exit code 2 instead of silently rendering slowly.

## How the browser is launched, and why the first try was black

`render.mjs` calls `chromium.launch()` with no options. Playwright then starts the **headless shell** (`chromium_headless_shell`), which has no GPU path and falls back to SwiftShader on the CPU (the page even logs "Automatic fallback to software WebGL").

`render_gpu.mjs` starts the **full Chromium in the new headless mode** and asks for Direct3D 11:

```js
chromium.launch({ channel: 'chromium', headless: true, args: ['--use-angle=d3d11', '--use-gl=angle', '--enable-gpu', '--ignore-gpu-blocklist', ...] })
```

That alone gave the BLACK RECTANGLE again (frames 0 and 60, the "inside" place). The causes that were ruled out: headless mode, `preserveDrawingBuffer` (already true), screenshot versus canvas read-back (identical pixels), render target formats, the mask pass. The real cause, proven step by step:

1. `_gpu_test/diag_nan.js` read the look pass's scene buffer: **175 not-a-number pixels** on the GPU (a thin line), 0 in software.
2. `_gpu_test/diag_bisect.js` hid materials by halves: all of them come from one material, **`fx_light_cones`** in the episode's `sets/fx_armor.js`. Its shader has `pow(1. - vY, vK.a)`. At a cone's far rim `vY` is a hair over 1 on edge pixels (multisampling), so the base is below zero. GLSL leaves that undefined: SwiftShader returns a number, Direct3D returns not-a-number.
3. The look pass in `film.js` keeps its picture in a half-float buffer. Its bloom blur (two rounds of 25 taps at quarter size) and its soft-focus loop average neighbours, and one not-a-number in an average makes the whole average not-a-number, which is drawn as black. A 1-pixel line became a black block about 500 pixels wide.

## The two fixes (both applied by `render_gpu.mjs` only, no file on disk is changed)

**Fix 1, look pass (served copy of `film.js` is edited in memory, `FILM_PATCHES`):** read the scene buffer through `clamp()`, so a bad pixel stays one pixel and can never spread.

**Fix 2, pow guard (init script, wraps `shaderSource`):** every shader gets `#define pow(a, b) pow(abs(a), b)`. This is what SwiftShader does in effect, so the light cones look as they do in software. With this the scene buffer has 0 bad pixels.
Tried and dropped: `pow(max(a, 0.), b)`. It changed a shadow under the scale in the hangar (`_gpu_test/note_pow_guard_max_changes_picture_f228.png`: software, GPU with abs, GPU with max), so some other shader relies on a negative base. `abs` gave pixel-identical hangar frames to no guard at all.

## Picture: GPU against software

Frames 0, 60, 150, 228, 280 at `--scale 1`, both with `--seed 7`. Sheet: `_gpu_test/compare.jpg` (software, GPU, difference x4 per frame); closest look at the worst spot of each frame: `_gpu_test/compare_worst_crops.png`; frames in `_gpu_test/soft/` and `_gpu_test/gpu/`.

| Frame | Mean difference (0-255) | Max | Pixels off by more than 32 |
|---|---|---|---|
| 0 | 0.58 | 90 | 0.012 % |
| 60 | 0.22 | 153 | 0.053 % |
| 150 | 0.27 | 100 | 0.039 % |
| 228 | 0.67 | 140 | 0.019 % |
| 280 | 0.23 | 101 | 0.022 % |
| 100-129 (30 frames) | 0.23 average, 0.27 worst | 212 | 0.046 % average |

Looked at side by side: shadows, the character mask (sharp cards on a soft set), outlines, see-through pieces (light cones, pools, dust, halos), bloom, captions and colours are all there and the same. Mean colour per frame differs by at most 0.4 of 255.
What does differ, all of it small:
- Edge pixels (antialiasing is resolved slightly differently): thin bright or dark outlines in the difference picture.
- Hairlines thinner than a pixel (far hangar window bars at frame 228, a thin floor line at frame 150) are drawn a little longer or shorter.
- Nothing is missing. No list of lost shadows, masks or colours.

The GPU is also repeatable: the same frames from two different processes and from a 30-frame and a 120-frame run differ by at most 1 of 255.

## Speed (full size, 1080x1920, frames 100-129 of the test film)

| Run | Seconds per frame | Notes |
|---|---|---|
| Software, 1 process | **4.65** (30 frames in 139.6 s) | |
| GPU, 1 process | **0.88** (30 frames in 26.4 s) | first frames compile shaders; 0.65 after the first frame |
| GPU, 1 process, 120 frames | **0.54** (64.2 s) | 0.31 drawing + 0.22 reading back and writing the PNG |
| GPU, 2 processes side by side | 0.82 and 0.86 each = **0.43 per frame together** (60 frames in about 26 s) | no slowdown per process |
| GPU, 3 processes | **not measured** | the limit for this test was 2 browsers at a time; memory says it would not fit (below) |

So: about 5 times faster on 30 frames, about 8 times on a long run, about 10 times with 2 processes. The whole 292-frame film: about 21 minutes in software, about 3 minutes on the GPU with one process.
Start-up (building the 43,700-object scene, about 30 s) is CPU work and is the same in both modes. For a handful of stills the start-up is most of the time.
**The numbers are noisy:** the PC's CPU was about 70 % busy with other renders during all runs. GPU load was only 12-26 %: the remaining time per frame is JavaScript on one CPU core (moving 43,700 objects, drawing cards, the PNG), not the graphics card.

GPU memory (`nvidia-smi`, whole card; other programs already held 1.6-1.8 GB):
- Software: no change.
- GPU, 1 process: rises to **+3.9 GB at the peak** (5.7 GB total), then Chromium frees some and it settles near +2.9 GB.
- GPU, 2 processes: peak **7.96 GB of 8.19 GB**: the card was full.

## How many processes

- **1 process** is the safe default, and the only choice while Blender (EEVEE or Cycles) is using the card.
- **2 processes** only when nothing else needs the card. They just fit on this film.
- **Not 3**: the card has no room; Windows would move textures into ordinary memory and everything gets slower, or a context is lost.

## Known risks

- **Not-a-number pixels from other set shaders.** Any set shader with `pow` of a negative base, `sqrt` of a negative number, `normalize` of a zero vector or a division by zero can make them on the GPU and not in software. Fix 2 covers `pow`; fix 1 keeps the others to single black pixels instead of a rectangle. To check a film: `node render_gpu.mjs <film.json> --frames <f> --stills-dir <dir> --eval _gpu_test/diag_nan.js` must report `"nan":0,"inf":0`; `--no-guard` plus `diag_bisect.js` names the guilty material.
- **Only one film and five + 150 frames were checked.** Night places, other sets and other effects have not been looked at on the GPU. Compare a few stills with `--software --seed 7` before trusting a new episode.
- **Not tested on the GPU:** `--storyboard`, `--export-lock`, `--overlay`, `--visibility`, `--held`, `--hands`, `--serve` (they write into the episode folder, which this test was not allowed to touch). They use the same page; `--overlay` still uses the browser screenshot as in `render.mjs`.
- **Memory** as above. A film with more or larger card drawings needs more.
- **A driver or Chromium update** can change edge pixels slightly. Do not mix software frames and GPU frames inside one shot (edges would shimmer at the join); render a whole film one way.
- The Playwright default browser stays software. Other scripts in this folder (`test_faces.mjs`, `test_grips.mjs`, `lie_cam.mjs`, `dump_decals.mjs`) launch their own browser and are unchanged.
- `render_gpu.mjs` is a copy of `render.mjs` as of 2026-11-13 20:42. Later changes to `render.mjs` are not in it.

## To make it the default later (exact changes)

1. **`film.js`, look pass, three reads of the scene buffer** (this is what `FILM_PATCHES` does):
   - in `L.brightMat`: `vec3 c = texture2D(tC, vUv).rgb;` becomes `vec3 c = clamp(texture2D(tC, vUv).rgb, 0., 1e4);`
   - in `L.finalMat`: `vec3 sharp = texture2D(tC, vUv).rgb;` becomes `vec3 sharp = clamp(texture2D(tC, vUv).rgb, 0., 1e4);`
   - in `L.finalMat`: `acc += texture2D(tC, uv).rgb * w;` becomes `acc += clamp(texture2D(tC, uv).rgb, 0., 1e4) * w;`
2. **`sets/fx_armor.js` (every episode copy, 15 files have it), light cone shader:** `pow(1. - vY, vK.a)` becomes `pow(max(1. - vY, 0.), vK.a)`. With this the pow guard is not needed for these sets. (Keeping the guard as well is harmless and protects against the next such shader.)
3. **`render.mjs`, the launch line:** `const browser = await chromium.launch()` becomes
   `const browser = await chromium.launch(has('--software') ? {} : { channel: 'chromium', args: ['--use-angle=d3d11', '--use-gl=angle', '--enable-gpu', '--ignore-gpu-blocklist'] })`
   and, after `window.setup`, print the renderer string and stop if it names SwiftShader (copy the `glInfo` block from `render_gpu.mjs`).
4. **`render.mjs`, the character cache:** `out/.puppet_cache` is deleted and rebuilt at every start, so two processes on one episode pull it from under each other. Use a folder per process as `render_gpu.mjs` does (`os.tmpdir()/film_puppet_cache_<pid>`).
5. Optional: `--frames a-b` ranges and the canvas read-back (`grab`) from `render_gpu.mjs`.

Until then: use `render_gpu.mjs` as it is. It needs none of these edits.
