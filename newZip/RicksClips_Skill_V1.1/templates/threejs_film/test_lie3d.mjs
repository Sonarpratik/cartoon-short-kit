// node test_lie3d.mjs out.png '<json>'  - lying characters in a real three.js perspective scene, many camera angles (lie_cam.mjs picks the drawing)
// rows: [[pose, label, {bed, size, outfit, hair, yaw}]]; each row is shot from every camera in CAMS
import { buildChar } from '../vector2d_characters/code/castkit.mjs';
import { drawCharacter, INK } from '../vector2d_characters/code/char2d.mjs';
import { withHair } from '../vector2d_characters/code/hair_lib.mjs';
import { applyPose, lieOf } from './poses.mjs'; import { grip as gripFn } from '../vector2d_characters/code/grips.mjs';
import { createRequire } from 'module'; import http from 'http'; import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url)), O = JSON.parse(process.argv[3] || '{}');
const ROWS = O.rows || [['lie_back', 'on the back', {}], ['lie_front', 'on the belly', {}], ['lie_back', 'on the back, on a bed', { bed: 1 }]];
const CAMS = O.cams || [['level, side', [0, .55, 4.6], [0, .3, 0]], ['3/4 high', [3, 2.6, 3.1], [0, .25, 0]], ['above', [.4, 5.2, 1.3], [0, 0, 0]], ['low 3/4', [3.6, .7, 2.4], [0, .3, 0]], ['from the feet', [4.6, .75, .35], [0, .35, 0]], ['from the head', [-4.4, 1.7, .4], [0, .3, 0]]];
const GY = 1440, dd = t => t.replace(/<[a-zA-Z][^>]*>/g, tag => { const seen = new Set(); return tag.replace(/\s([a-zA-Z:-]+)="[^"]*"/g, (m, k) => seen.has(k) ? '' : (seen.add(k), m)); });
function cardSvg(pose, art, dir, X) {
  let spec = { name: 'x', form: 'standard', size: X.size || 'standard', coat: '#5f7fa6', face: 'standard', outfit: X.outfit ?? 'peasant' }; if (!spec.outfit) delete spec.outfit; spec = withHair(spec, X.hair || 'sidePart');
  const view = art === 'side' ? 'side' : (lieOf({ pose }) === 'front' ? 'back' : 'front');
  const S = buildChar(spec, 400); S.view = view; S.dir = dir;
  const K = S.headK ?? 1.5, hy = (S.bodyTop ?? 333) - 100 * K * .78, gy = S.ground ?? 900;
  const st = { pose, view, dir, lie_art: art };
  const P = applyPose(S, st, { INK, headK: K, hy, dropProps: false, grip: gripFn });
  const r = drawCharacter(S), over = P.over.join(''), under = (P.under || []).join('');
  const tf = ` transform="translate(0,${GY - gy}) translate(0,${P.dy || 0}) rotate(${P.rot || 0},400,${gy})"`;
  const hpx = gy - (hy - 100 * K);
  return { svg: dd(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1500" width="800" height="1500"><defs>${r.defs}</defs><g${tf}>${under}${r.body}${over}</g></svg>`), hpx, headR: 100 * K };
}
const cases = ROWS.map(([pose, label, X = {}]) => { const c = {}; for (const art of ['side', 'top', 'feet', 'head']) for (const dir of [1, -1]) c[art + dir] = cardSvg(pose, art, dir, X); return { pose, label, X, lie: lieOf({ pose }), c }; });
const W = O.w || 420, H = O.h || 560;
const html = `<html><body style="margin:0;background:#e4e9f1"><canvas id="c" width="${W}" height="${H}"></canvas><script type="module">
import * as THREE from '/vendor/three.module.js'; import { lieLayout, placeLying } from '/lie_cam.mjs';
const R = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true }); R.setClearColor('#cfe3f2');
const loadTex = s => new Promise(r => { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'); cv.width = 800; cv.height = 1500; cv.getContext('2d').drawImage(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; r(t); }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); });
window.shoot = async (cs, cam0) => {
  const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight('#ffffff', '#8a7a66', 2.2));
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 512; const g = cvs.getContext('2d'); for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { g.fillStyle = (i + j) % 2 ? '#d9cfb8' : '#c8bc9f'; g.fillRect(i * 32, j * 32, 32, 32); }
  const ft = new THREE.CanvasTexture(cvs); ft.colorSpace = THREE.SRGBColorSpace; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(2, 2);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ map: ft })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  let floorY = 0;
  if (cs.X.bed) { floorY = .5; const wood = new THREE.MeshBasicMaterial({ color: '#8a5a3a' }), sheet = new THREE.MeshBasicMaterial({ color: '#f4f1ea' }), ink = new THREE.LineBasicMaterial({ color: '#2a1a1f' });
    const add = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); scene.add(b); const e = new THREE.LineSegments(new THREE.EdgesGeometry(b.geometry), ink); e.position.copy(b.position); scene.add(e); };
    add(2.3, .3, 1.2, 0, .15, 0, wood); add(2.2, .2, 1.1, 0, .4, 0, sheet); add(.08, 1.0, 1.2, -1.19, .5, 0, wood); add(.5, .12, .7, -.8, .56, 0, new THREE.MeshBasicMaterial({ color: '#dfe8f5' })); }
  const cam = new THREE.PerspectiveCamera(34, ${W} / ${H}, .05, 100); cam.position.set(...cam0[1]); cam.lookAt(new THREE.Vector3(...cam0[2]).add(new THREE.Vector3(0, floorY, 0))); cam.updateMatrixWorld(true);
  const len = 1.62, centre = new THREE.Vector3(.0, floorY, 0);
  const L = lieLayout(THREE, cam, { centre, yaw: cs.X.yaw || 0, lie: cs.lie, len });
  const key = L.art + (L.art === 'side' ? L.dir : 1), cd = cs.c[key], k = 1.7 / cd.hpx;
  const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, .5 - (1500 - ${GY}) / 1500, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: await loadTex(cd.svg), transparent: true, alphaTest: .03, side: THREE.DoubleSide })); mesh.scale.set(800 * k, 1500 * k, 1); scene.add(mesh);
  placeLying(THREE, cam, mesh, L, { centre, lie: cs.lie, len, hc: 1.7 * .5, lift: cd.headR * k * .95, bodyN: cd.hpx / 1500, wN: cd.headR / 800, floorY });
  R.render(scene, cam); return { art: L.art, e: Math.round(L.e), ratio: +L.ratio.toFixed(2), url: R.domElement.toDataURL('image/png') };
};
window.ready = true;</script></body></html>`;
const srv = http.createServer((q, s) => { const u = q.url.split('?')[0]; if (u === '/') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(html); } const f = path.join(HERE, u); if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': 'text/javascript' }); fs.createReadStream(f).pipe(s); }).listen(0);
const port = srv.address().port, b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }), pg = await b.newPage({ viewport: { width: W, height: H } });
pg.on('console', m => console.log('page:', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${port}/`); await pg.waitForFunction('window.ready');
let out = '', Y = 10;
for (const cs of cases) { out += `<div style="position:absolute;left:8px;top:${Y}px;font:bold 22px sans-serif;color:#1d2f6f">${cs.label}</div>`; Y += 32;
  for (const [i, cm] of CAMS.entries()) { const r = await pg.evaluate(([cs, cm]) => window.shoot(cs, cm), [cs, cm]);
    out += `<div style="position:absolute;left:${8 + i * (W + 4)}px;top:${Y}px;width:${W}px;font:13px sans-serif;color:#555;text-align:center">${cm[0]} · drawing: ${r.art}</div><img style="position:absolute;left:${8 + i * (W + 4)}px;top:${Y + 18}px;border:1px solid #c5cddb" width="${W}" height="${H}" src="${r.url}">`; console.log(cs.label, cm[0], r.art, r.e, r.ratio); }
  Y += H + 30; }
const TW = 16 + CAMS.length * (W + 4); await pg.setViewportSize({ width: TW, height: Y + 6 });
await pg.setContent(`<html><body style="margin:0;background:#e4e9f1;position:relative;width:${TW}px;height:${Y + 6}px">${out}</body></html>`); await pg.screenshot({ path: process.argv[2], fullPage: true });
await b.close(); srv.close(); console.log('ok');
