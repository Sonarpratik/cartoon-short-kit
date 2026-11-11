// Browser player and deterministic frame API, shared by preview and offline capture.
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, BloomEffect, BlendFunction, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { World, loadKit } from './world';
import { InkPass, noInkFallback } from './ink';
import { LensBlur } from './lensblur';
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from './grade';
import { FPS, TOTAL, FLASH_AT, SHOTS, layersAt, dofAt } from './story';

const screen = document.querySelector<HTMLDivElement>('#screen')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
const slider = document.querySelector<HTMLInputElement>('#frame')!;
const play = document.querySelector<HTMLButtonElement>('#play')!;
const output = document.querySelector<HTMLOutputElement>('#time')!;
const api = window as unknown as { ready: boolean; renderFrame: (f: number) => void; totalFrames: number; fps: number };
api.ready = false;
const scale = Number(new URLSearchParams(location.search).get('scale') || 0.5);
if (!Number.isFinite(scale) || scale <= 0 || scale > 2) throw new Error('Scale must be greater than 0 and at most 2.');
const width = Math.round(1080 * scale), height = Math.round(1920 * scale);
slider.max = String(TOTAL - 1);

async function init() {
  const kit = await loadKit();
  const buffers = [0, 1].map(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, preserveDrawingBuffer: true });
    renderer.setSize(width, height); renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    screen.append(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(40, 9 / 16, 0.2, 1500);
    const scene = new THREE.Scene(), world = new World(kit);
    scene.add(world.root);
    const lens = new LensBlur(), grade = new GradeEffect(GRADES.day, GRADE_STRENGTH.day);
    const bloom = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
    const composer = new EffectComposer(renderer, { multisampling: 4, frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new InkPass(scene, camera));
    composer.addPass(new EffectPass(camera, lens.pre));
    composer.addPass(new EffectPass(camera, lens.main));
    composer.addPass(new EffectPass(camera, bloom, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), grade));
    composer.setSize(width, height);
    return { renderer, camera, scene, world, lens, grade, composer };
  });
  const flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:white;pointer-events:none;opacity:0';
  screen.append(flash);
  const forward = new THREE.Vector3(), focus = new THREE.Vector3();
  let frame = 0, playing = false, start = 0, startFrame = 0;
  api.renderFrame = (f) => {
    if (!Number.isInteger(f) || f < 0 || f >= TOTAL) throw new Error('Frame out of range: ' + f);
    frame = f;
    const layers = layersAt(f);
    buffers.forEach((b, i) => {
      const layer = layers[i];
      b.renderer.domElement.style.display = layer ? 'block' : 'none';
      if (!layer) return;
      b.renderer.domElement.style.opacity = String(layer.alpha);
      const target = b.world.update(layer.id, f, b.camera, b.scene);
      noInkFallback(b.world.root);
      const d = dofAt(f);
      b.camera.getWorldDirection(forward);
      if (d.focus) focus.set(...d.focus(f)); else focus.copy(target);
      b.lens.focus = Math.max(0.3, focus.sub(b.camera.position).dot(forward));
      b.lens.cInf = d.cInf; gradeFor(b.grade, SHOTS[layer.id - 1].light);
      b.composer.render(1 / FPS);
    });
    flash.style.opacity = String(f >= FLASH_AT && f < FLASH_AT + 4 ? [1, .75, .45, .2][f - FLASH_AT] : 0);
    slider.value = String(f); output.value = f + ' · ' + (f / FPS).toFixed(2) + 's';
  };
  function pause() { playing = false; play.textContent = 'Play'; }
  play.onclick = () => {
    if (playing) return pause();
    if (frame === TOTAL - 1) api.renderFrame(0);
    playing = true; start = performance.now(); startFrame = frame; play.textContent = 'Pause';
  };
  slider.oninput = () => { pause(); api.renderFrame(Number(slider.value)); };
  function tick(now: number) {
    if (playing) {
      const next = Math.min(TOTAL - 1, startFrame + Math.floor((now - start) * FPS / 1000));
      if (next !== frame) api.renderFrame(next);
      if (next === TOTAL - 1) pause();
    }
    requestAnimationFrame(tick);
  }
  api.renderFrame(0); api.totalFrames = TOTAL; api.fps = FPS; api.ready = true;
  status.textContent = Object.keys(kit).length ? 'Scene ready. Preview is silent.' : 'Scene ready. Optional Kenney GLB assets are absent; procedural scenery is used. Preview is silent.';
  requestAnimationFrame(tick);
}
init().catch((error) => { status.textContent = error.stack || String(error); console.error(error); });
