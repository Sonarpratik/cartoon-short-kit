// Scene joins without hard cuts, plus camera measurements (cuts, push-in, down-angle to characters).
// Camera rules (references/camera-guide.md):
//  - Scenes join with a MOVE, not a cut: 'whip' (fast pan out, arrive from the other side), 'push' (fly into the outgoing
//    shot, arrive moving forward in the next), 'blend' (soft crossfade for time jumps), or a same-place travel inside one
//    scene module. 'cut' is kept for one deliberate jolt per short at most.
//  - Every shot changes scale: the subject grows 30-100 % over the shot (pushIn() in director.ts).
//  - With a character in frame the camera sits at character height: at most 10 deg looking down at the chest.
//    High and top-down views only when no character is visible; crane down as one enters.
// A single-renderer player draws a join by rendering the outgoing scene, capturing it (JoinCompositor.capture),
// rendering the incoming scene, then laying the capture over it with opacity 1 - alphaIn (JoinCompositor.overlay).
import * as THREE from 'three';

type V3 = [number, number, number];
export type CamPose = { position: V3; target: V3; fov?: number; blur?: number; focus?: V3; near?: number; far?: number };

export type JoinKind = 'cut' | 'blend' | 'whip' | 'push';
/** A join on the boundary frame `at` (first frame of the incoming scene). dir: whip direction (1 = pan right). */
export type Join = { at: number; kind: JoinKind; frames?: number; dir?: 1 | -1; angle?: number; depth?: number };
/** Window lengths in frames. Whip peak ~2 deg/frame (~90 px/f at 1080 px), the reference's fast-move speed. */
export const JOIN_FRAMES: Record<JoinKind, number> = { cut: 0, blend: 10, whip: 10, push: 12 };
export const CAMERA_RULES = {
  /** subject growth over one shot: at least 30 %, typically 30-100 % */
  minPushGrow: 0.3, targetPushGrow: [0.3, 1.0] as const,
  /** max look-down from the lens to a visible character's chest */
  maxDownDegWithCharacter: 10,
  /** hard cuts per short (a deliberate jolt), everything else joins with a move */
  maxHardCuts: 1,
} as const;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);

/** Turn the aim about the vertical axis through the lens (a pan). */
export function panCam(c: CamPose, deg: number): CamPose {
  const d = sub(c.target, c.position), r = (deg * Math.PI) / 180, cs = Math.cos(r), sn = Math.sin(r);
  return { ...c, target: add(c.position, [d[0] * cs - d[2] * sn, d[1], d[0] * sn + d[2] * cs]) };
}
/** Slide the lens along its aim: k < 1 moves toward the target, k > 1 backs away. */
export function dollyCam(c: CamPose, k: number): CamPose {
  return { ...c, position: add(c.target, mul(sub(c.position, c.target), k)) };
}
/** Continue a camera past its last frame (or before its first) at its current velocity, so nothing freezes in a join. */
export function extrapolateCam(at: CamPose, neighbour: CamPose, steps: number): CamPose {
  const v = (a: V3, b: V3): V3 => add(a, mul(sub(a, b), steps));
  return { ...at, position: v(at.position, neighbour.position), target: v(at.target, neighbour.target), fov: (at.fov ?? 39) + ((at.fov ?? 39) - (neighbour.fov ?? 39)) * steps };
}

export type JoinState = {
  join: Join; u: number;
  /** frames to pose each scene at (clamped inside its own range) and how far past it the camera must extrapolate */
  outFrame: number; outOver: number; inFrame: number; inUnder: number;
  /** weight of the incoming picture */
  alphaIn: number;
  outCam: (c: CamPose) => CamPose; inCam: (c: CamPose) => CamPose;
};
/** The join active on frame f, if any. Windows are centred on the boundary. */
export function joinAt(f: number, joins: readonly Join[]): JoinState | undefined {
  for (const j of joins) {
    const n = j.frames ?? JOIN_FRAMES[j.kind];
    if (j.kind === 'cut' || !n) continue;
    const a = j.at - Math.floor(n / 2);
    if (f < a || f >= a + n) continue;
    const u = (f - a + 0.5) / n, outFrame = Math.min(f, j.at - 1), inFrame = Math.max(f, j.at);
    const base = { join: j, u, outFrame, outOver: f - outFrame, inFrame, inUnder: inFrame - f };
    if (j.kind === 'whip') {
      const dir = j.dir ?? 1, A = j.angle ?? 20;
      const blur = (c: CamPose) => ({ ...c, blur: (c.blur ?? 0) + 18 * Math.sin(Math.PI * u) });
      return { ...base, alphaIn: smooth((u - 0.4) / 0.2),
        outCam: (c) => blur(panCam(c, dir * A * u * u)), inCam: (c) => blur(panCam(c, -dir * A * (1 - u) * (1 - u))) };
    }
    if (j.kind === 'push') {
      const D = j.depth ?? 0.55;
      return { ...base, alphaIn: smooth((u - 0.3) / 0.4),
        outCam: (c) => dollyCam(c, 1 - D * u * u), inCam: (c) => dollyCam(c, 1 + (D * 1.4) * (1 - u) * (1 - u)) };
    }
    return { ...base, alphaIn: smooth(u), outCam: (c) => c, inCam: (c) => c };
  }
  return undefined;
}

/** Lays a captured picture of the outgoing scene over the incoming one (no second renderer, no second post chain). */
export class JoinCompositor {
  private snap = document.createElement('canvas');
  private ctx = this.snap.getContext('2d')!;
  private tex = new THREE.CanvasTexture(this.snap);
  private mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  private scene = new THREE.Scene();
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  constructor() { this.tex.colorSpace = THREE.SRGBColorSpace; this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat)); }
  /** Call right after the outgoing scene was rendered to the canvas (renderer needs preserveDrawingBuffer: true). */
  capture(canvas: HTMLCanvasElement) {
    if (this.snap.width !== canvas.width || this.snap.height !== canvas.height) { this.snap.width = canvas.width; this.snap.height = canvas.height; this.tex.dispose(); }
    this.ctx.clearRect(0, 0, this.snap.width, this.snap.height); this.ctx.drawImage(canvas, 0, 0); this.tex.needsUpdate = true;
  }
  /** Call after the incoming scene was rendered: draws the capture on top with the given opacity. */
  overlay(renderer: THREE.WebGLRenderer, opacity: number) {
    this.mat.opacity = clamp01(opacity);
    const auto = renderer.autoClear; renderer.autoClear = false; renderer.setRenderTarget(null);
    renderer.render(this.scene, this.cam); renderer.autoClear = auto;
  }
}

// ---------------- measurements ----------------
/** Screen scale of whatever sits at the look target (bigger = closer framing). */
export const framingScale = (c: CamPose) => 1 / (len(sub(c.target, c.position)) * Math.tan(((c.fov ?? 39) * Math.PI) / 360));
/** How much the subject grows between two poses (0.3 = 30 % bigger). */
export const shotGrow = (a: CamPose, b: CamPose) => framingScale(b) / framingScale(a) - 1;
/** Degrees the lens looks DOWN at point p (negative = looking up). */
export const downAngle = (c: { position: V3 }, p: V3) => {
  const d = sub(c.position, p); return (Math.atan2(d[1], Math.hypot(d[0], d[2])) * 180) / Math.PI;
};
/** A camera jump between consecutive frames that reads as a cut. A fast dolly straight along the aim (a dive into the
 *  subject) is a move, not a cut: only the sideways part of the jump counts, unless the lens leaps past its subject. */
export function isCameraCut(a: CamPose, b: CamPose) {
  const da = sub(a.target, a.position), db = sub(b.target, b.position), dist = Math.max(0.5, len(da)), u = mul(da, 1 / (len(da) || 1));
  const cos = (da[0] * db[0] + da[1] * db[1] + da[2] * db[2]) / (len(da) * len(db) || 1);
  const step = sub(b.position, a.position), along = step[0] * u[0] + step[1] * u[1] + step[2] * u[2], side = len(sub(step, mul(u, along)));
  return side > 0.25 * dist || Math.abs(along) > 0.9 * dist || Math.acos(Math.max(-1, Math.min(1, cos))) > (20 * Math.PI) / 180;
}

/** Per-frame camera sample written by a player probe (see installCameraProbe). */
export type CameraSample = { f: number; scene: string; cam: CamPose; joined: boolean;
  /** visible characters inside the frame: [id, chestX, chestY, chestZ] */ actors: [string, number, number, number][] };
/** Exposes window.cameraSample(f): poses frame f without rendering and reports the camera and visible characters.
 *  `prepare(f)` must pose the scene for f and return the camera (already positioned) and the root to search for actors;
 *  `isActor(o)` picks character roots; `chestHeight` is the world height of the chest above the actor root. */
export function installCameraProbe(prepare: (f: number) => { camera: THREE.PerspectiveCamera; root: THREE.Object3D; scene: string; pose: CamPose; joined?: boolean },
  isActor: (o: THREE.Object3D) => string | undefined, chestHeight = 1.1) {
  const v = new THREE.Vector3();
  const shown = (o: THREE.Object3D | null): boolean => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  (window as unknown as { cameraSample: (f: number) => CameraSample }).cameraSample = (f) => {
    const { camera, root, scene, pose, joined } = prepare(f);
    camera.updateMatrixWorld(true); root.updateMatrixWorld(true);
    // `pose` is the scene's own camera (its target = what the shot frames), so push-in can be measured from it
    const cam: CamPose = { position: [...pose.position] as V3, target: [...pose.target] as V3, fov: pose.fov ?? camera.fov };
    const actors: CameraSample['actors'] = [];
    root.traverse((o) => {
      const id = isActor(o); if (!id || !shown(o)) return;
      o.getWorldPosition(v); v.y += chestHeight; const p = v.toArray() as V3;
      v.project(camera); if (v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1) actors.push([id, ...p]);
    });
    return { f, scene, cam, joined: !!joined, actors };
  };
  (window as unknown as { cameraReport: (total: number, fps?: number) => CameraReport }).cameraReport = (total, fps = 30) =>
    cameraReport(Array.from({ length: total }, (_, f) => (window as unknown as { cameraSample: (f: number) => CameraSample }).cameraSample(f)), fps);
}

export type ShotReport = { f0: number; f1: number; scenes: string[]; grow: number; maxDown?: { deg: number; who: string; f: number } };
export type CameraReport = { frames: number; hardCuts: { f: number; from: string; to: string }[]; cutsPer10s: number;
  shots: ShotReport[]; weakPush: ShotReport[]; downViolations: ShotReport[]; verdict: string[] };
/** Split the film into shots at hard cuts (a camera jump on a frame outside any join) and score each shot. */
export function cameraReport(samples: CameraSample[], fps = 30): CameraReport {
  const hardCuts: CameraReport['hardCuts'] = [], shots: ShotReport[] = [];
  let start = 0;
  const close = (end: number) => {
    if (start < 0) return;
    const s = samples.slice(start, end); if (!s.length) return;
    let maxDown: ShotReport['maxDown'];
    for (const x of s) for (const [who, ...p] of x.actors) { const deg = downAngle(x.cam, p as V3); if (!maxDown || deg > maxDown.deg) maxDown = { deg: +deg.toFixed(1), who, f: x.f }; }
    const plain = s.filter((x) => !x.joined), a = plain[0] ?? s[0], b = plain[plain.length - 1] ?? s[s.length - 1];
    shots.push({ f0: s[0].f, f1: s[s.length - 1].f, scenes: [...new Set(s.map((x) => x.scene))], grow: +shotGrow(a.cam, b.cam).toFixed(2), maxDown });
  };
  // shots = runs of frames outside any join; a join ends one shot and starts the next, a camera jump outside a join is a hard cut
  for (let i = 1; i < samples.length; i++) {
    const p = samples[i - 1], c = samples[i];
    if (!p.joined && c.joined) { close(i); start = -1; continue; }
    if (p.joined && !c.joined) { start = i; continue; }
    if (p.joined || c.joined) continue;
    if (p.scene !== c.scene || isCameraCut(p.cam, c.cam)) { hardCuts.push({ f: c.f, from: p.scene, to: c.scene }); close(i); start = i; }
  }
  if (start >= 0) close(samples.length);
  const R = CAMERA_RULES, longShots = shots.filter((s) => s.f1 - s.f0 >= fps); // shots under 1 s are inserts; push is not judged
  const weakPush = longShots.filter((s) => Math.abs(s.grow) < R.minPushGrow);
  const downViolations = shots.filter((s) => s.maxDown && s.maxDown.deg > R.maxDownDegWithCharacter);
  const cutsPer10s = +((hardCuts.length / Math.max(1, samples.length / fps)) * 10).toFixed(2);
  const verdict = [
    `${hardCuts.length > R.maxHardCuts ? 'FAIL' : 'PASS'} hard cuts: ${hardCuts.length} (max ${R.maxHardCuts}; ${cutsPer10s} per 10 s)`,
    `${weakPush.length ? 'FAIL' : 'PASS'} push-in: ${weakPush.length} of ${longShots.length} shots of 1 s+ grow less than ${R.minPushGrow * 100} %`,
    `${downViolations.length ? 'FAIL' : 'PASS'} camera height: ${downViolations.length} shots look down more than ${R.maxDownDegWithCharacter} deg at a visible character`,
  ];
  return { frames: samples.length, hardCuts, cutsPer10s, shots, weakPush, downViolations, verdict };
}
