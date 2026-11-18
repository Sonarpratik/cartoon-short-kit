// Character Studio renderer for the Ricks Clips vector puppets (150 characters, sheets 01-15) and their motion
// library (195 move styles in 61 actions: sit, kneel, lie, dig, sweep, carry, ladder, crawl, fall ...).
// The puppet and motion code is NOT in this repo: preview-characters.mjs serves it read-only from
// newZip/RicksClips_Skill_V1.1/templates (personal-use licence, gitignored; override with RC_TEMPLATES).
// Studio contract: drawCharacter(context, design, pose) in a 600x1000 design space, feet near y=975.
//  - action 'idle': the still puppet in one of its four views (yaw snapped to front, 3/4, side, back).
//  - action '<move>/<style>' (e.g. 'sit/A', 'kneel/B'): that library style, looping on the studio clock, drawn with the
//    motion rig (planted bending legs, arms, lean; the body card is never squashed), with the move's own props.
// The SVG decodes asynchronously; until a new frame is ready the last decoded frame of the same move is shown.
const RC = '/vendor/rc';
import { buildChar } from '/vendor/rc/vector2d_characters/code/castkit.mjs';
import { drawCharacter as drawSvg } from '/vendor/rc/vector2d_characters/code/char2d.mjs';
import { makeChar, drawPose } from '/vendor/rc/motion_styles/rig_cast.mjs';
import { LIB } from '/vendor/rc/motion_styles/library.mjs';

const SHEETS = await Promise.all(Array.from({ length: 15 }, (_, i) => import(`${RC}/vector2d_characters/code/sheets/sheet${String(i + 1).padStart(2, '0')}.mjs`)));
export const VIEWS = Array.from({ length: 12 }, (_, i) => i * 30);
/** 'idle' plus every library style id, grouped by action (sit/A, sit/B, sit/C, kneel/A ...). */
export const ACTIONS = ['idle', ...LIB.map((s: any) => s.id)];
export const EXPRESSIONS = ['neutral'];
/** Library entry for an action id: feelings it fits, energy 1-3, views it exists in. */
export const moveInfo = (id: string) => LIB.find((s: any) => s.id === id);

// yaw 0 = front, 90 = facing screen-right, 180 = back, 270 = facing screen-left.
export function rcView(yaw: number) {
  const d = ((Number(yaw) || 0) % 360 + 360) % 360;
  if (d <= 15 || d >= 345) return ['front', 1] as const;
  if (d < 75) return ['34', 1] as const;
  if (d <= 120) return ['side', 1] as const;
  if (d < 240) return ['back', 1] as const;
  if (d <= 285) return ['side', -1] as const;
  return ['34', -1] as const;
}

export function rcSpec(design: any) {
  const spec = SHEETS[(design.rc?.sheet ?? 0) - 1]?.CAST.find((s: any) => s.name === design.rc?.name);
  if (!spec) throw Error('Unknown Ricks Clips character: ' + JSON.stringify(design.rc));
  // Garment colour edited in the Studio replaces the sheet's coat colour
  return design.jacket && design.rc?.coat && design.jacket.toLowerCase() !== design.rc.coat.toLowerCase() ? { ...spec, coat: design.jacket } : spec;
}

// Still puppet: character centred at x=300, ground y=1010. Painted extents of all 150 (4 views, measured 2026-11-18):
// top -330, x -86..684, bottom 1040. One fixed viewBox keeps a common scale; feet land at y~971 of the 1000 canvas.
const VB = '-117 -340 834 1390';
export function rcSvg(design: any, yaw = 0) {
  const [view, dir] = rcView(yaw), S = buildChar(rcSpec(design), 300);
  S.view = view; S.dir = dir;
  const r = drawSvg(S);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000" viewBox="${VB}"><defs>${r.defs}</defs>${r.body}</svg>`;
}

// ---------- moves ----------
const modules = new Map<string, any>(), loading = new Set<string>();
function moveOf(id: string) {
  const s = moveInfo(id); if (!s) return undefined;
  const [file, exp = 'default'] = s.module.split('#'), mod = modules.get(file);
  if (!mod) { if (!loading.has(file)) { loading.add(file); import(`${RC}/motion_styles/moves/${file}.mjs`).then(m => modules.set(file, m)).catch(e => console.error('move', file, e)); } return undefined; }
  const mv = mod[exp], st = mv?.styles.find((x: any) => x.key === s.style);
  return st ? { mv, st } : undefined;
}
const chars = new Map<string, any>();
/** One move frame as SVG at time t (seconds, looping over the move's length), framed like the library's own stage. */
export function rcMoveSvg(design: any, id: string, t: number) {
  const m = moveOf(id); if (!m) return undefined;
  const spec = rcSpec(design), ck = `${design.rc.sheet}|${design.rc.name}|${spec.coat}`;
  let ch = chars.get(ck); if (!ch) { ch = makeChar(spec.form || 'standard', { spec }); chars.set(ck, ch); }
  const tt = ((t % m.mv.dur) + m.mv.dur) % m.mv.dur, out = m.st.pose(tt, ch), poses = Array.isArray(out.poses) ? out.poses : [out];
  const defs: string[] = [], body = poses.map((P: any, i: number) => {
    const r = drawPose(ch, P), pre = `m${i}_`;
    defs.push(r.defs.replace(/id="([gc]\d+)"/g, (_: string, k: string) => `id="${pre}${k}"`));
    return r.svg.replace(/url\(#([gc]\d+)\)/g, (_: string, k: string) => `url(#${pre}${k})`);
  }).join('');
  const cam = m.st.cam ? m.st.cam(tt, out) : (out.cam ?? 0), camY = out.camY ?? -260, H = out.camH || 1500, W = H * 0.6;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1000" viewBox="${cam - W / 2} ${camY} ${W} ${H}"><defs>${defs.join('')}</defs>${out.back || ''}${body}${out.front || ''}</svg>`;
}

// ---------- drawing ----------
const cache = new Map<string, HTMLImageElement>(), lastShown = new Map<string, HTMLImageElement>();
function image(key: string, svg: () => string | undefined) {
  let img = cache.get(key);
  if (!img) {
    const s = svg(); if (!s) return undefined;
    if (cache.size > 600) cache.delete(cache.keys().next().value!);
    img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s); cache.set(key, img);
  }
  return img;
}
export function drawCharacter(context: CanvasRenderingContext2D, design: any, pose: any = {}) {
  if (!design?.rc) return;
  const action = pose.action && pose.action !== 'idle' && moveInfo(pose.action) ? pose.action : 'idle';
  let key: string, img: HTMLImageElement | undefined;
  if (action === 'idle') {
    const [view, dir] = rcView(pose.yaw);
    key = [design.rc.sheet, design.rc.name, design.jacket, 'idle', view, dir].join('|');
    img = image(key, () => rcSvg(design, pose.yaw));
  } else {
    const frame = Math.floor((pose.time ?? 0) * 30);   // 30 fps steps, like the library's renders
    key = [design.rc.sheet, design.rc.name, design.jacket, action, frame].join('|');
    img = image(key, () => rcMoveSvg(design, action, frame / 30));
  }
  const slot = `${design.id}|${action}`;
  if (img?.complete && img.naturalWidth) lastShown.set(slot, img); else img = lastShown.get(slot);
  if (img?.complete && img.naturalWidth) context.drawImage(img, 0, 0, 600, 1000);
}
