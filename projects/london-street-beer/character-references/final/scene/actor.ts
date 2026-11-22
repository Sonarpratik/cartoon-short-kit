// Characters: a camera-facing card (600 x 1000 design space, feet at y = 971) drawn each frame by the puppet engine.
// Library moves are framed to fit their whole path, so a raw move draws the figure smaller than its idle; moveFix
// re-scales every move to the idle figure, anchored on the feet. The card casts a real shadow from its alpha, and a
// dark contact patch sits under the soles (Rick scheme §3).
import * as THREE from 'three';
import { rcSvg, rcMoveSvg, rcView } from './engine/puppet';
import { drawAnyCharacter } from './engine/character-draw';   // also registers the player's frame-settle hook
import { textTex } from './tex';

export type Pose = { yaw?: number; time?: number; action?: string; expression?: string; fromExpression?: string; expressionAge?: number; micro?: boolean };
export type ActorState = { id: string; who: string; p: [number, number, number]; pose: Pose; scale?: number; contact?: boolean; lean?: number };

export const CARD_H = 2.6, CARD_W = 1.56, FEET = .971;
const vbOf = (svg?: string) => { const m = svg && /viewBox="([^"]+)"/.exec(svg); return m ? m[1].trim().split(/[\s,]+/).map(Number) : undefined; };
const fixes = new Map<string, { s: number; pm: number }>(), idleVB = new Map<string, number[]>();
function moveFix(design: any, action: string, yaw: number) {
  const view = rcView(yaw)[0], key = design.id + '|' + action + '|' + view;
  let f = fixes.get(key); if (f) return f;
  let iv = idleVB.get(design.id); if (!iv) { iv = vbOf(rcSvg(design, 0)); if (iv) idleVB.set(design.id, iv); }
  const m = vbOf(rcMoveSvg(design, action, 0, undefined, view));
  if (!iv || !m) return { s: 1, pm: 971 };
  const yg = iv[1] + FEET * iv[3]; f = { s: m[3] / iv[3], pm: (yg - m[1]) / m[3] * 1000 }; fixes.set(key, f); return f;
}
const tmp = document.createElement('canvas'); tmp.width = 600; tmp.height = 1000; const tg = tmp.getContext('2d')!;
/** Draw a character on a 600 x 1000 context: idle as is, moves re-scaled to the idle size. */
export function drawPuppet(g: CanvasRenderingContext2D, design: any, pose: Pose) {
  g.clearRect(0, 0, 600, 1000);
  const action = pose.action && pose.action !== 'idle' ? pose.action : undefined;
  if (!action) { drawAnyCharacter(g, design, pose); return; }
  const f = moveFix(design, action, pose.yaw ?? 0);
  tg.clearRect(0, 0, 600, 1000); drawAnyCharacter(tg, design, pose);
  g.save(); g.translate(300, 971); g.scale(f.s, f.s); g.translate(-300, -f.pm); g.drawImage(tmp, 0, 0); g.restore();
}

let contactTex: THREE.Texture | undefined;
const contact = () => contactTex ??= textTex(128, 64, g => { const gr = g.createRadialGradient(64, 32, 0, 64, 32, 60); gr.addColorStop(0, 'rgba(10,6,4,.85)'); gr.addColorStop(.5, 'rgba(10,6,4,.45)'); gr.addColorStop(1, 'rgba(10,6,4,0)'); g.setTransform(1, 0, 0, .5, 0, 16); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

export class Card {
  root = new THREE.Group(); private board: THREE.Mesh; private canvas = document.createElement('canvas'); private g: CanvasRenderingContext2D; private tex: THREE.CanvasTexture;
  private mat: THREE.MeshBasicMaterial; private patch: THREE.Mesh;
  constructor(public id: string) {
    this.canvas.width = 600; this.canvas.height = 1000; this.g = this.canvas.getContext('2d')!;
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, alphaTest: .35, side: THREE.DoubleSide, toneMapped: false });
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H); geo.translate(0, CARD_H / 2 - (1 - FEET) * CARD_H, 0);
    this.board = new THREE.Mesh(geo, this.mat); this.board.castShadow = true;
    this.board.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.tex, alphaTest: .35 });
    this.board.userData.actor = id; this.root.add(this.board);
    this.patch = new THREE.Mesh(new THREE.PlaneGeometry(.9, .36), new THREE.MeshBasicMaterial({ map: contact(), transparent: true, depthWrite: false }));
    this.patch.rotation.x = -Math.PI / 2; this.patch.position.y = .012; this.root.add(this.patch);
  }
  /** Position only (the camera probe uses this without drawing). */
  place(st: ActorState, camera: THREE.Camera) {
    this.root.visible = true; this.root.position.set(...st.p); this.root.scale.setScalar(st.scale ?? 1);
    this.board.rotation.set(0, Math.atan2(camera.position.x - st.p[0], camera.position.z - st.p[2]), st.lean ?? 0);
    this.patch.visible = st.contact !== false;
  }
  update(st: ActorState, design: any, camera: THREE.Camera, tint: [number, number, number]) {
    this.place(st, camera);
    drawPuppet(this.g, design, st.pose); this.tex.needsUpdate = true; this.mat.color.setRGB(...tint);
  }
  hide() { this.root.visible = false; }
}
