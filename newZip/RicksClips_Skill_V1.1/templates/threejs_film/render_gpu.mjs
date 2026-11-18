// render_gpu.mjs = render.mjs + drawing on the PC's graphics card (2026-11-14). Same usage and options as render.mjs. See GPU_RENDER.md.
//   Extra options: --software (the old software WebGL, for comparing) · --grab screenshot|canvas (how a frame is read back; default canvas = the page joins its canvases and hands back a PNG)
//                  --frames a-b (a range, besides a,b,c) · --cache <dir> (private copy of the character package; default = a temp folder per process, so parallel runs never share one)
//                  --headed (a real, off-screen window instead of the new headless mode) · --gpu-info (print the GPU facts and stop)
// Differences from render.mjs are marked "GPU:".
// Render the three.js film from the baked plan. Run tools/film_plan.py check first (it writes out/plan/*.json).
//   node render.mjs <film.json> --storyboard            every station: START + END panel, one page (out/storyboard.html + .png)
//   node render.mjs <film.json> --animatic [--step 1]   the whole film -> out/animatic.mp4 (voice/voice.wav is muxed if it exists)
//   node render.mjs <film.json> --frames 0,45,120       stills -> out/stills/f_#####.png
//   node render.mjs <film.json> --visibility            out/plan/visibility.json (who / what is inside the frame, per frame)
//   node render.mjs <film.json> --export-lock           out/lock/: sets/<place>.glb, cards/<who>/s####.png + index.json, lock.json (what the Blender look pass reads)
//   node render.mjs <film.json> --serve [port]          watch it play in a browser, with sound
// Options: --scale 0.5 (of film.size) · --card-px 2 (lock drawings, pixels per rig pixel) · --no-captions · --puppets <dir-or-file,...> (the character package; wins over film.json "puppet_pkg") · --tmp <dir>
import http from 'http'; import fs from 'fs'; import path from 'path'; import os from 'os'; import { fileURLToPath } from 'url'; import { spawnSync } from 'child_process'; import { createRequire } from 'module'; import crypto from 'crypto'; import zlib from 'zlib';
const KIT = path.dirname(fileURLToPath(import.meta.url)), require = createRequire(import.meta.url);
const A = process.argv.slice(2), has = k => A.includes(k), val = (k, d) => { const i = A.indexOf(k); return i >= 0 && A[i + 1] && !A[i + 1].startsWith('--') ? A[i + 1] : d; };
if (!A[0] || A[0].startsWith('--')) { console.log('usage: node render.mjs <film.json> --storyboard | --animatic | --frames a,b | --visibility | --export-lock | --overlay | --serve'); process.exit(1); }
const FILM = path.resolve(A[0]), EP = path.dirname(FILM), film = JSON.parse(fs.readFileSync(FILM, 'utf8')), OUT = path.join(EP, 'out');
if (!fs.existsSync(path.join(OUT, 'plan', 'camera_baked.json'))) { console.error('No out/plan/camera_baked.json. Run: python tools/film_plan.py check ' + A[0]); process.exit(1); }

// ---- character package: copied into a cache so their folder is never touched and relative imports ('./char2d.mjs') still work.
// Sources are searched in order, the first file with a name wins. Default = the locked character package next to this kit (templates/vector2d_characters/code, CB's lock of 2026-11-09), else its cloud copy.
// A source folder's sheets/ (cast sheets, each exports CAST) is copied too, so film.json can name any cast character: "puppet": "cast:<name>".
const LOCAL = path.join(KIT, '..', 'vector2d_characters', 'code'), DEF = [fs.existsSync(path.join(LOCAL, 'char2d.mjs')) ? LOCAL : '/mnt/project-files/new-characters/vector2d/LOCKED_cast_v2_NEW_STYLE/code/'];
const src = (val('--puppets') ? val('--puppets').split(',') : process.env.PUPPET_PKG ? process.env.PUPPET_PKG.split(',') : film.puppet_pkg ? [].concat(film.puppet_pkg) : DEF).map(p => path.resolve(EP, p));
const CACHE = val('--cache') ? path.resolve(val('--cache')) : path.join(os.tmpdir(), 'film_puppet_cache_' + process.pid);   // GPU: was out/.puppet_cache, which two processes on one episode would delete under each other
fs.rmSync(CACHE, { recursive: true, force: true }); fs.mkdirSync(CACHE, { recursive: true });
for (const s of src) { if (!fs.existsSync(s)) { console.error('puppet package not found: ' + s); process.exit(1); }
  for (const f of fs.statSync(s).isDirectory() ? fs.readdirSync(s).filter(n => n.endsWith('.mjs')).map(n => path.join(s, n)) : [s]) { const d = path.join(CACHE, path.basename(f)); if (!fs.existsSync(d)) fs.copyFileSync(f, d); } }
for (const s of src) { const sd = path.join(s, 'sheets'); if (fs.existsSync(s) && fs.statSync(s).isDirectory() && fs.existsSync(sd)) { fs.mkdirSync(path.join(CACHE, 'sheets'), { recursive: true }); for (const n of fs.readdirSync(sd).filter(n => n.endsWith('.mjs'))) { const d = path.join(CACHE, 'sheets', n); if (!fs.existsSync(d)) fs.copyFileSync(path.join(sd, n), d); } } }
// motion library (templates/motion_styles): copied into the cache as motion/, with rig.mjs pointed at the cached character package
{ const MS = path.join(KIT, '..', 'motion_styles'); if (fs.existsSync(path.join(MS, 'library.mjs'))) { fs.mkdirSync(path.join(CACHE, 'motion', 'moves'), { recursive: true });
    for (const n of ['library.mjs', 'rig.mjs', 'cloth_live.mjs'].filter(n => fs.existsSync(path.join(MS, n)))) fs.writeFileSync(path.join(CACHE, 'motion', n), fs.readFileSync(path.join(MS, n), 'utf8').replaceAll("'../vector2d_characters/code/", "'../"));
    for (const n of fs.readdirSync(path.join(MS, 'moves')).filter(n => n.endsWith('.mjs'))) fs.copyFileSync(path.join(MS, 'moves', n), path.join(CACHE, 'motion', 'moves', n)); } }
const SHEETS = fs.existsSync(path.join(CACHE, 'sheets')) ? fs.readdirSync(path.join(CACHE, 'sheets')).sort() : [];
for (const need of ['char2d', 'memes', 'memes2', 'bodies']) if (!fs.existsSync(path.join(CACHE, need + '.mjs'))) { console.error(`puppet package is missing ${need}.mjs (looked in ${src.join(', ')})`); process.exit(1); }

// ---- tiny static server: /kit = this folder, /ep = the episode, /puppets = the cache
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml', '.css': 'text/css' };
const ROOTS = { kit: KIT, ep: EP, puppets: CACHE };
// GPU: the three small changes film.js needs (see GPU_RENDER.md). The look pass keeps its picture in a half-float buffer; ONE not-a-number pixel from any set shader was smeared by the bloom blur and the
// soft-focus loop into a big BLACK RECTANGLE (the failed --gpu try of 2026-11-13). Software WebGL never makes such pixels, the graphics card does. Reading the buffer through clamp() stops the spread.
const FILM_PATCHES = has('--no-patch') ? [] : [
  ['void main(){ vec3 c = texture2D(tC, vUv).rgb; float l = dot(', 'void main(){ vec3 c = clamp(texture2D(tC, vUv).rgb, 0., 1e4); float l = dot('],   // bloom bright pass
  ['vec3 sharp = texture2D(tC, vUv).rgb; float m =', 'vec3 sharp = clamp(texture2D(tC, vUv).rgb, 0., 1e4); float m ='],                           // final pass, the sharp picture
  ['acc += texture2D(tC, uv).rgb * w; wsum += w;', 'acc += clamp(texture2D(tC, uv).rgb, 0., 1e4) * w; wsum += w;'],                               // final pass, the soft-focus samples
];
// GPU: the source of such pixels is pow() with a base below zero (undefined in GLSL: SwiftShader gives a number, Direct3D gives not-a-number), e.g. the light cones of the armor sets (pow(1. - vY, k) with vY a hair over 1 at an edge).
// Every shader the page compiles gets a pow() that holds its base at zero or above: no change for a valid base. --no-guard switches it off.
const POW_GUARD = String.raw`(() => { const P = '#define pow(a, b) pow(__GUARD__, b)\n'; for (const C of [self.WebGL2RenderingContext, self.WebGLRenderingContext]) { if (!C) continue; const ss = C.prototype.shaderSource;
  C.prototype.shaderSource = function (sh, src) { src = String(src); const m = /^\s*#version[^\n]*\n/.exec(src); return ss.call(this, sh, m ? m[0] + P + src.slice(m[0].length) : P + src); }; } })()`;
const server = http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]), m = /^\/(kit|ep|puppets)\/(.*)$/.exec(u), f = m && path.normalize(path.join(ROOTS[m[1]], m[2]));
  if (!f || !f.startsWith(ROOTS[m[1]]) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
  if (m[1] === 'kit' && m[2] === 'film.js') { let s = fs.readFileSync(f, 'utf8'); for (const [a, b] of FILM_PATCHES) { if (!s.includes(a)) console.warn('render_gpu: film.js patch did not find its place: ' + a.slice(0, 60)); s = s.replace(a, b); } r.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' }); return r.end(s + ' ;window.__R = () => R;'); }   // GPU: film.js is served with the small changes of FILM_PATCHES; the file on disk is never touched
  r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }); fs.createReadStream(f).pipe(r);
});
const port = await new Promise(ok => server.listen(has('--serve') ? +val('--serve', 8765) : 0, '127.0.0.1', () => ok(server.address().port)));
const BASE = `http://127.0.0.1:${port}`;
if (has('--serve')) { console.log(`Open ${BASE}/kit/film_page.html?film=/ep/${path.basename(FILM)}   (space = pause, arrows = step, &captions=0 hides captions). Ctrl+C to stop.`); await new Promise(() => {}); }

let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_DIR || '/opt/node-tools/node_modules/playwright')); }
const [FW, FH] = film.size || [1080, 1920], scale = +val('--scale', has('--storyboard') ? 0.4 : 0.5), W = Math.round(FW * scale / 2) * 2, H = Math.round(FH * scale / 2) * 2;
// GPU: the default launch is the old headless shell, which draws WebGL with SwiftShader (the CPU). The full Chromium in the new headless mode can use the graphics card through ANGLE on Direct3D 11.
const SOFT = has('--software'), GRAB = val('--grab', SOFT ? 'screenshot' : 'canvas');
const GPU_ARGS = ['--use-angle=d3d11', '--use-gl=angle', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-gpu-vsync', '--disable-frame-rate-limit', '--force_high_performance_gpu',
  '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--force-color-profile=srgb'];
const browser = SOFT ? await chromium.launch() : await chromium.launch({ channel: 'chromium', headless: !has('--headed'), args: has('--headed') ? [...GPU_ARGS, '--window-position=-32000,-32000'] : GPU_ARGS });
process.on('exit', () => { if (!val('--cache')) fs.rmSync(CACHE, { recursive: true, force: true }); });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
if (!SOFT && !has('--no-guard')) await page.addInitScript(POW_GUARD.replace('__GUARD__', val('--guard', 'abs') === 'max' ? 'max(a, 0.)' : 'abs(a)'));
if (has('--seed')) await page.addInitScript(`(() => { let a = ${+val('--seed', 1) >>> 0} || 1; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })()`);   // GPU: --seed N = the same 'random' dust and set scatter on every run, so two renders can be compared pixel by pixel
page.on('console', m => { if ((m.type() === 'warning' || m.type() === 'error') && !/GL Driver Message/.test(m.text())) console.log('[page]', m.text()); }); page.on('pageerror', e => console.log('[page error]', e.message));
await page.goto(`${BASE}/kit/film_page.html`);
const info = await page.evaluate(c => window.setup(c), { film: '/ep/' + path.basename(FILM), W, H, captions: !has('--no-captions'), sheets: SHEETS, epSets: fs.existsSync(path.join(EP, 'sets')) ? fs.readdirSync(path.join(EP, 'sets')) : [] });
const stage = page.locator('#stage');
// GPU: prove which device draws (the film's own WebGL context), and stop if the graphics card was asked for but the CPU answered
const glInfo = await page.evaluate(() => { const c = document.querySelector('#stage canvas'), gl = c.getContext('webgl2') || c.getContext('webgl'), e = gl.getExtension('WEBGL_debug_renderer_info'); return { vendor: e ? gl.getParameter(e.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR), renderer: e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), version: gl.getParameter(gl.VERSION), maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE), maxSamples: gl.getParameter(gl.MAX_SAMPLES), aa: gl.getContextAttributes().antialias }; });
console.log(`WebGL renderer: ${glInfo.renderer}  |  vendor: ${glInfo.vendor}  |  ${glInfo.version}  |  browser ${browser.version()}  |  mode ${SOFT ? 'software' : 'gpu'}, grab ${GRAB}`);
const onCPU = /swiftshader|llvmpipe|software|basic render/i.test(glInfo.renderer);
if (!SOFT && onCPU && !has('--allow-cpu')) { console.error('The graphics card is NOT drawing (renderer above is a CPU one). Stopped. Use --software to render on the CPU on purpose.'); await browser.close(); server.close(); process.exit(2); }
if (has('--gpu-info')) { console.log(JSON.stringify(glInfo)); await browser.close(); server.close(); process.exit(0); }
// GPU: 'canvas' grab = the page draws its canvases (the WebGL picture, then the drawn overlay) onto one 2D canvas and hands back the PNG bytes; no compositor screenshot is involved, so a GPU canvas can never come back black or a frame late
const grab = async (file, clear) => {
  if (GRAB !== 'canvas') return stage.screenshot({ path: file, omitBackground: !!clear });
  const b64 = await page.evaluate(async () => { const st = document.getElementById('stage'), cs = [...st.querySelectorAll('canvas')], W = cs[0].width, H = cs[0].height, o = (window.__grab ??= Object.assign(document.createElement('canvas'), { width: W, height: H })), g = o.getContext('2d');
    g.clearRect(0, 0, W, H); for (const c of cs) if (getComputedStyle(c).visibility !== 'hidden' && getComputedStyle(c).display !== 'none') g.drawImage(c, 0, 0, W, H);
    const blob = await new Promise(ok => o.toBlob(ok, 'image/png')), u8 = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768)); return btoa(s); });
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
};
const TM = { draw: 0, grab: 0, n: 0 };   // GPU: where the time goes (draw = film.js builds and draws the frame; grab = reading it back and writing the PNG)
const shot = async (f, file) => { const t0 = Date.now(); await page.evaluate(f => window.renderFrame(f), f); const t1 = Date.now(); await grab(file); TM.draw += t1 - t0; TM.grab += Date.now() - t1; TM.n++; };
console.log(`film: ${info.frames} frames at ${info.fps} fps, ${W}x${H}, cast ${info.cast.join(', ')}`);

if (has('--frames')) {
  const d = has('--stills-dir') ? path.resolve(val('--stills-dir', '')) : path.join(OUT, 'stills'); fs.mkdirSync(d, { recursive: true });   // kit_patch (animator): --stills-dir = a private folder, not the shared out/stills
  const list = val('--frames', '0').split(',').flatMap(x => { const m = /^(\d+)-(\d+)$/.exec(x); return m ? Array.from({ length: +m[2] - +m[1] + 1 }, (_, i) => +m[1] + i) : [Number(x)]; }), t0 = Date.now();   // GPU: a-b ranges, and the time per frame
  for (const f of list) { const p = path.join(d, `f_${String(f).padStart(5, '0')}.png`); await shot(f, p); if (list.length <= 12) console.log('still', p); }
  if (has('--eval')) { const code = fs.readFileSync(path.resolve(val('--eval', '')), 'utf8'); console.log('eval', JSON.stringify(await page.evaluate(code))); }   // GPU: debug hook, runs a script in the page after the last still
  console.log(`stills: ${list.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s = ${((Date.now() - t0) / list.length).toFixed(0)} ms/frame (draw ${(TM.draw / TM.n).toFixed(0)} + grab ${(TM.grab / TM.n).toFixed(0)}) -> ${d}`);
}

if (has('--held')) {   // kit 2026-11-13 (props-hero): every generic held 3D prop (film.json held3d with "grip") on the given frames: grip, tip, anchors and fists in plan metres, each fist's place on screen (px, fractions of the frame) and the gap between arm end and fist (m). --held 0,45 [--held-out <file>]; default out/plan/held3d.json
  const rows = []; for (const f of val('--held', '0').split(',').map(Number)) rows.push(...await page.evaluate(f => window.held3dAll ? window.held3dAll(f) : [], f));
  const hp = has('--held-out') ? path.resolve(val('--held-out', '')) : path.join(OUT, 'plan', 'held3d.json'); fs.mkdirSync(path.dirname(hp), { recursive: true }); fs.writeFileSync(hp, JSON.stringify(rows, null, 1)); console.log('held3d', hp, rows.length, 'rows');
}

if (has('--hands')) {   // kit_patch (animator): where each card's move hands are, per frame, in plan metres (for vfx / lighting): out/plan/hands.json
  const HV = val('--hands', ''); if (!/^[^:]+:\d+-\d+$/.test(HV)) { console.log('usage: --hands <who>:<f0>-<f1>'); process.exit(1); } const [w, r] = HV.split(':'), [a, b] = r.split('-').map(Number), rows = [];
  for (let f = a; f <= b; f++) rows.push(await page.evaluate(([w, f]) => window.handWorld ? { ...window.handWorld(w, f), held3d: window.held3dWorld ? window.held3dWorld(w, f) : null } : null, [w, f]));
  fs.writeFileSync(path.join(OUT, 'plan', 'hands.json'), JSON.stringify(rows)); console.log('hands', rows.length, JSON.stringify(rows[Math.min(rows.length - 1, +val('--show', 0))]));
}
if (has('--visibility')) {
  const vis = []; for (let f = 0; f < info.frames; f++) vis.push(await page.evaluate(f => window.visibility(f), f));
  fs.writeFileSync(path.join(OUT, 'plan', 'visibility.json'), JSON.stringify({ note: 'projection only, no occlusion test: x, y = fractions of the frame (0,0 top-left), h = height fraction', frames: vis }));
  console.log('visibility ->', path.join(OUT, 'plan', 'visibility.json'));
}

if (has('--storyboard')) {
  const st = await page.evaluate(() => window.stations()), pd = path.join(OUT, 'storyboard_panels'); fs.rmSync(pd, { recursive: true, force: true }); fs.mkdirSync(pd, { recursive: true });
  const FR = { W: 'whole', M: 'medium', C: 'close', P: 'place', O: 'object' }, esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  let html = `<!doctype html><meta charset="utf-8"><title>Storyboard: ${esc(film.title)}</title><style>body{margin:0;padding:24px;background:#f4f1ea;color:#231218;font:14px/1.35 system-ui,sans-serif}h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:26px 0 10px;border-bottom:2px solid #231218;padding-bottom:4px}.idea{max-width:900px;margin:0 0 6px}.row{display:flex;flex-wrap:wrap;gap:14px}.st{display:flex;gap:6px;background:#fff;padding:8px;border-radius:8px;box-shadow:0 1px 3px #0002}.p{width:${Math.round(W / 2)}px}.p img{width:100%;display:block;border-radius:4px}.p b{display:inline-block;width:46px;color:#8a7f72;font-size:11px}.p div{font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tag{font-size:11px;font-weight:700;color:#fff;background:#231218;border-radius:3px;padding:1px 5px;margin-bottom:4px;display:inline-block}</style>`;
  html += `<h1>${esc(film.title)}</h1><p class="idea"><b>Camera idea:</b> ${esc(film.camera_idea?.name || 'none named')}. ${esc(film.camera_idea?.why || '')}</p><p class="idea">Each station shows the frame the camera ARRIVES at rest (START) and the last frame before it LEAVES (END). Captions are on. ${st.length} stations, ${info.frames} frames, ${(info.frames / info.fps).toFixed(1)} s.</p>`;
  let take = null, n = 0;
  for (const s of st) {
    if (s.take !== take) { if (take !== null) html += '</div>'; take = s.take; html += `<h2>Take ${esc(s.take)} · ${esc(s.place)}</h2><div class="row">`; }
    n++; const a = `s${String(n).padStart(2, '0')}_start_f${s.start}.png`, b = `s${String(n).padStart(2, '0')}_end_f${s.end}.png`; await shot(s.start, path.join(pd, a)); await shot(s.end, path.join(pd, b));
    const cam1 = `${FR[s.framing] || s.framing} · ${Math.round(s.lens)} mm · ${s.passes ? 'passes, no rest' : 'rest ' + s.rest_s + ' s'}`, cam2 = s.travel_s ? `then ${s.travel_s} s move${s.next ? ' to ' + (FR[s.next] || s.next) : ''}` : 'last frame';
    const panel = (img, tag, f, cam, mv) => `<div class="p"><span class="tag">${n} ${tag} · f ${f} · ${(f / info.fps).toFixed(2)} s</span><img src="storyboard_panels/${img}"><div><b>CAM</b>${esc(cam)}</div><div><b>MOVE</b>${esc(mv)}</div><div><b>WORD</b>${esc(s.word ? '"' + s.word + '"' : '(none)')}${s.shows?.length ? ' · shows ' + esc(s.shows.join(', ')) : ''}</div></div>`;
    html += `<div class="st">${panel(a, 'START', s.start, cam1, s.move_start)}${panel(b, 'END', s.end, cam2, s.move_end)}</div>`;
    console.log(`station ${n}: f ${s.start}-${s.end} ${s.framing} "${s.word || ''}"`);
  }
  html += '</div>'; fs.writeFileSync(path.join(OUT, 'storyboard.html'), html);
  const p2 = await browser.newPage({ viewport: { width: 3 * (W + 22) + 2 * 14 + 48, height: 900 }, deviceScaleFactor: 1 }); await p2.goto(`${BASE}/ep/out/storyboard.html`); await p2.waitForLoadState('networkidle');
  await p2.screenshot({ path: path.join(OUT, 'storyboard.png'), fullPage: true }); await p2.close(); console.log('storyboard ->', path.join(OUT, 'storyboard.html'), '+ storyboard.png');
}

if (has('--animatic')) {
  const step = +val('--step', 1), tmp = path.join(val('--tmp', process.env.FILM_TMP || os.tmpdir()), 'film_frames_' + process.pid); fs.mkdirSync(tmp, { recursive: true });   // frames go to a temp folder, never into the project
  const t0 = Date.now(); let n = 0;
  for (let f = 0; f < info.frames; f += step) { await shot(f, path.join(tmp, `f_${String(n++).padStart(5, '0')}.png`)); if (n % 60 === 0) console.log(`  ${f}/${info.frames}  ${((Date.now() - t0) / n).toFixed(0)} ms/frame`); }
  const voice = ['voice/voice.wav', 'voice/voice.mp3'].map(v => path.join(EP, v)).find(fs.existsSync), mp4 = path.join(OUT, 'animatic.mp4');
  const args = ['-y', '-v', 'error', '-framerate', String(info.fps / step), '-i', path.join(tmp, 'f_%05d.png'), ...(voice ? ['-i', voice, '-map', '0:v:0', '-map', '1:a:0', '-c:a', 'aac', '-af', 'apad', '-shortest']   /* kit 2026-11-13 (fireworks test): apad pads the voice with silence so -shortest ends on the LAST VIDEO frame; a 20.13 s voice cut a 21.2 s film */ : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-r', String(info.fps), mp4];
  const r = spawnSync('ffmpeg', args, { stdio: 'inherit' }); fs.rmSync(tmp, { recursive: true, force: true });
  console.log(r.status === 0 ? `animatic -> ${mp4}  (${n} frames, ${((Date.now() - t0) / n).toFixed(0)} ms/frame${voice ? ', with voice' : ', silent: no voice/voice.wav'})` : 'ffmpeg failed');
}
if (has('--export-instances')) {      // only the instance colours, into an existing lock (the full --export-lock writes them too)
  const out = {}; for (const name of info.places) { await page.evaluate(n => window.lockIds(n), name); out[name] = await page.evaluate(n => window.exportInstances(n), name); }
  fs.writeFileSync(path.join(OUT, 'lock', 'instances.json'), JSON.stringify(out)); console.log('instances ->', Object.entries(out).map(([k, v]) => `${k}: ${v.length} groups, ${v.reduce((a, b) => a + b.n, 0)} instances`).join('; '));
}
if (has('--overlay')) {
  // The drawn layer alone, on a clear ground, one PNG per frame: effects, lens glints, transitions and captions exactly as the animatic drew them.
  // The look pass lays it over the Blender picture. Use --scale 1 for the final size; --range a-b for a part.
  const d = path.join(OUT, 'overlay'), [a, b] = val('--range', `0-${info.frames - 1}`).split('-').map(Number); fs.mkdirSync(d, { recursive: true }); const t0 = Date.now(); let n = 0;
  for (let f = a; f <= b; f++) { await page.evaluate(f => window.renderFrame(f, { overlayOnly: true }), f); await stage.screenshot({ path: path.join(d, `o_${String(f).padStart(5, '0')}.png`), omitBackground: true }); if (++n % 200 === 0) console.log(`  ${f}/${b}  ${((Date.now() - t0) / n).toFixed(0)} ms/frame`); }
  console.log('overlay ->', d, `(${n} frames)`);
}
if (has('--export-lock')) {
  // Freeze the approved layout for the look pass. Everything is written from the same page state that drew the animatic.
  const LOCK = path.join(OUT, 'lock'), plan = path.join(OUT, 'plan'), sha = f => crypto.createHash('sha1').update(fs.readFileSync(path.join(plan, f))).digest('hex');
  fs.rmSync(LOCK, { recursive: true, force: true }); fs.mkdirSync(path.join(LOCK, 'sets'), { recursive: true });
  const cam = JSON.parse(fs.readFileSync(path.join(plan, 'camera_baked.json'), 'utf8')).frames, places = [], cards = [], card_info = {}, cpx = +val('--card-px', 2);
  const CRC = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; }), crc = zlib.crc32 || (b => { let c = ~0; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return ~c >>> 0; });
  const repng = buf => {                                                            // the browser writes fast, loose PNGs: pack the same pixels again at zlib level 9 (lossless, about half the size)
    const head = [buf.subarray(0, 8)], idat = [], tail = []; for (let o = 8; o < buf.length;) { const len = buf.readUInt32BE(o), ch = buf.subarray(o, o + 12 + len); (ch.toString('latin1', 4, 8) === 'IDAT' ? idat : idat.length ? tail : head).push(ch.toString('latin1', 4, 8) === 'IDAT' ? ch.subarray(8, 8 + len) : ch); o += 12 + len; }
    const body = Buffer.concat([Buffer.from('IDAT'), zlib.deflateSync(zlib.inflateSync(Buffer.concat(idat)), { level: 9 })]), n = Buffer.alloc(4), c = Buffer.alloc(4); n.writeUInt32BE(body.length - 4); c.writeUInt32BE(crc(body));
    return Buffer.concat([...head, n, body, c, ...tail]);
  };
  fs.mkdirSync(path.join(LOCK, 'motion'), { recursive: true }); const lights = {};
  for (const name of info.places) {
    const nIds = await page.evaluate(n => window.lockIds(n), name); lights[name] = await page.evaluate(n => window.placeLight(n), name);
    const r = await page.evaluate(n => window.exportSet(n), name), file = `sets/${name}.glb`; fs.writeFileSync(path.join(LOCK, file), Buffer.from(r.b64, 'base64'));
    const takes = []; for (const c of cam) if ((c.place || info.places[0]) === name) { const l = takes[takes.length - 1]; if (l && l.take === c.take && l.f1 === c.f - 1) l.f1 = c.f; else takes.push({ take: c.take, f0: c.f, f1: c.f }); }
    places.push({ name, set: film.places[name].set || name, light: film.places[name].light || 'day', glb: file, meshes: r.meshes, materials: r.materials, takes });
    const mo = await page.evaluate(n => window.exportMotion(n), name); fs.writeFileSync(path.join(LOCK, 'motion', name + '.json'), JSON.stringify(mo)); console.log(`motion ${name}: ${Object.keys(mo.nodes).length} moving nodes of ${nIds}, ${mo.frames.length} frames`);
    console.log(`set ${name} -> ${file}  (${r.meshes} meshes, ${r.materials.length} materials, ${(fs.statSync(path.join(LOCK, file)).size / 1024).toFixed(0)} KB)`);
  }
  for (const who of info.cast) {
    const d = path.join(LOCK, 'cards', who); fs.mkdirSync(d, { recursive: true });
    const idx = await page.evaluate(([w, p]) => window.cardIndex(w, p), [who, cpx]);
    for (const im of idx.images) fs.writeFileSync(path.join(d, im.file), repng(Buffer.from(await page.evaluate(([w, n, p]) => window.cardPNG(w, n, p), [who, im.img, cpx]), 'base64')));
    fs.writeFileSync(path.join(d, 'index.json'), JSON.stringify(idx)); cards.push(who);
    card_info[who] = { puppet: idx.puppet, index: `cards/${who}/index.json`, images: idx.images.length, runs: idx.runs.length, height_m: idx.height_m };
    console.log(`cards ${who} -> ${idx.images.length} drawings, ${idx.runs.length} runs`);
  }
  { const inst = {}; for (const name of info.places) inst[name] = await page.evaluate(n => window.exportInstances(n), name); fs.writeFileSync(path.join(LOCK, 'instances.json'), JSON.stringify(inst)); }
  const hl = await page.evaluate(() => window.exportHighlights()); fs.writeFileSync(path.join(LOCK, 'highlights.json'), JSON.stringify(hl)); console.log(`highlights: ${hl.length}`);
  fs.writeFileSync(path.join(LOCK, 'lock.json'), JSON.stringify({ kit: 'threejs_film', lock_version: 2, lights, motion: 'motion/<place>.json', highlights: 'highlights.json', overlay: 'out/overlay/o_#####.png (render.mjs --overlay --scale 1)', title: film.title || null, fps: info.fps, frames: info.frames, size: [FW, FH],
    coords: 'plan coordinates: metres, Z up, Y away from the opening camera. The .glb files are Y up (three.js); the Blender glTF importer turns them back into plan coordinates. Frame numbers start at 0.',
    places, cards, card_info, sha1: { 'camera_baked.json': sha('camera_baked.json'), 'performance_baked.json': sha('performance_baked.json') } }, null, 1));
  console.log('lock ->', LOCK);
}
await browser.close(); server.close();
