// SIT AT A DESK (seen in Rick's clips: clerk at a desk, feet up with a phone, asleep on the job). Hands END ON the desk.
import { G, track, blinkAt } from '../rig.mjs';
import { seated, seatedFeet, chair } from './emo_helpers.mjs';
const sin = Math.sin, INK = '#2a1a1f', pos = v => Math.max(0, v);
const DT = 690;
const desk = () => `<rect x="420" y="${DT + 20}" width="34" height="${G - DT - 20}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/><rect x="60" y="${DT}" width="430" height="34" rx="10" fill="#a8683a" stroke="${INK}" stroke-width="12"/>`;
const paper = (x, n = 1) => { let o = ''; for (let i = 0; i < n; i++) o += `<rect x="${x - 50}" y="${DT - 12 - i * 8}" width="100" height="10" fill="#fffdf2" stroke="${INK}" stroke-width="6"/>`; return o; };
const stamp = (x, y) => `<rect x="${x - 16}" y="${y - 40}" width="32" height="50" rx="10" fill="#e8503a" stroke="${INK}" stroke-width="10"/><rect x="${x - 34}" y="${y + 6}" width="68" height="24" rx="6" fill="#59607a" stroke="${INK}" stroke-width="10"/>`;
const phone = a => (x, y) => `<g transform="rotate(${a} ${x} ${y})"><rect x="${x - 26}" y="${y - 70}" width="52" height="104" rx="12" fill="#2b3350" stroke="${INK}" stroke-width="11"/><rect x="${x - 15}" y="${y - 56}" width="30" height="64" rx="4" fill="#7fd6ff"/></g>`;
// A STAMP MACHINE: bang, bang, bang, dead bored, never looks down
function clerk(t) { const k = (t * 2.4) % 1, up = k < .7 ? sin(Math.PI * k / .7) : 0;
  return seated({ rot: 10, back: chair() + desk() + paper(200, 1) + paper(340, 6), hands: [{ wx: 120, wy: DT - 22, bow: .5 }, { wx: 200, wy: DT - 50 - 90 * up, bow: .6 }], held: [{ hand: 1, svg: stamp }], head: -4, face: 'k:standard', blink: t % 2.6 < 1.9 ? 'half' : 'closed' }); }
// B FEET UP: leans right back, both feet on the desk, scrolling the phone, chuckles
function feetUp(t) { const ch = pos(sin(t * 9)) * (t % 3 > 2 ? 1 : 0), wig = sin(t * 4);
  return seated({ x: -70, rot: -24, back: chair(-195, 40) + desk(), feet: [{ x: 250, lift: G - DT + 28, thigh: -28, mix: 1, toe: -70 + 8 * wig }, { x: 290, lift: G - DT + 28, thigh: -22, mix: 1, toe: -70 - 8 * wig }], hands: [{ f: -.5, d: .1, bow: .9 }, { f: .62, d: -.28 + .03 * ch, bow: .9 }], held: [{ hand: 1, svg: phone(20) }], head: 14 + 2 * ch, face: ch > .3 ? 'k:happy' : 'k:smirk' }); }
// C ASLEEP ON THE JOB: face down on the desk, breathing, then jolts upright and pretends to work
function asleep(t0) { const t = t0 % 6, up = track([[0, 0], [3.6, 0], [3.75, 1, 'out'], [5.2, 1], [5.9, 0, 'io']], t), br = sin(t * 2.2) * (1 - up);
  return seated({ rot: 47 - 45 * up + 1.2 * br, back: chair() + desk() + paper(150, 2), hands: up > .5 ? [{ wx: 120, wy: DT - 22, bow: .5 }, { wx: 190 + 30 * sin(t * 30), wy: DT - 24, bow: .5 }] : [{ f: .25, d: .97 }, { wx: 160, wy: DT - 20, bow: .3 }], head: 20 * (1 - up), face: up > .5 ? 'awkward' : 'k:standard', blink: up > .5 ? null : 'closed' }); }
export default { title: 'AT A DESK  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Stamp machine', blurb: 'bang, bang, bang, dead bored', pose: clerk },
  { key: 'B', name: 'Feet up', blurb: 'leans back, feet on the desk, scrolls the phone', pose: feetUp },
  { key: 'C', name: 'Asleep on the job', blurb: 'face on the desk, jolts up, pretends to work', pose: asleep },
] };
// ---------- FRONT VIEW: the desk hides the legs ----------
const deskF = extra => `<rect x="-300" y="${DT}" width="600" height="${G - DT}" rx="12" fill="#a8683a" stroke="${INK}" stroke-width="12"/><rect x="-300" y="${DT}" width="600" height="30" rx="10" fill="#c98850" stroke="${INK}" stroke-width="10"/>${extra || ''}`;
const sitF = o => ({ view: 'front', dir: 1, x: 0, y: 190, rot: 0, feet: [{ x: -60, kneeK: .2 }, { x: 58, kneeK: .2 }], cam: 0, camY: -200, ...o });
function clerkF(t) { const k = (t * 2.4) % 1, up = k < .7 ? sin(Math.PI * k / .7) : 0;
  return sitF({ front: deskF(paper(-170, 6)), hands: [{ wx: -110, wy: DT - 18, bow: .6 }, { wx: 90, wy: DT - 44 - 90 * up, bow: .6 }], held: [{ hand: 1, svg: stamp }], head: 5, face: 'k:standard', blink: t % 2.6 < 1.9 ? 'half' : 'closed' }); }
function slouchF(t) { const ch = pos(sin(t * 9)) * (t % 3 > 2 ? 1 : 0);
  return sitF({ x: -30, y: 230, rot: -12, front: deskF(), hands: [{ lx: -128, ly: 300, bow: .9, over: true }, { lx: 60, ly: 420 + 6 * ch, bow: .9 }], held: [{ hand: 1, svg: phone(-10) }], head: -10 + 2 * ch, face: ch > .3 ? 'k:happy' : 'k:smirk' }); }
function asleepF(t0) { const t = t0 % 6, up = track([[0, 0], [3.6, 0], [3.75, 1, 'out'], [5.2, 1], [5.9, 0, 'io']], t), br = sin(t * 2.2) * (1 - up);
  return sitF({ y: 190 + 128 * (1 - up) + 3 * br, front: deskF(paper(170, 2)), hands: up > .5 ? [{ wx: -110, wy: DT - 18, bow: .6 }, { wx: 100 + 30 * sin(t * 30), wy: DT - 20, bow: .6 }] : [{ f: .9, d: .25, bow: .3 }, { f: .9, d: .25, bow: .3 }], head: 78 * (1 - up), face: up > .5 ? 'awkward' : 'k:standard', blink: up > .5 ? null : 'closed' }); }
export const front = { title: 'AT A DESK  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Stamp machine', blurb: 'bang, bang, bang, dead bored', pose: clerkF },
  { key: 'B', name: 'Slouch and scroll', blurb: 'cheek on the fist, phone up, chuckles', pose: slouchF },
  { key: 'C', name: 'Asleep on the job', blurb: 'cheek on the desk, jolts up, pretends to work', pose: asleepF },
] };
