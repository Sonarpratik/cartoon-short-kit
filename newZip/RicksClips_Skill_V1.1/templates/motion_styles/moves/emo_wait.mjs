import { track, blinkAt } from '../rig.mjs';
import { seated, seatedFeet } from './emo_helpers.mjs';
const sin = Math.sin, PI = Math.PI, pos = v => Math.max(0, v);
// A FOOT TAP: sits on the chair, one foot taps fast, fingers drum on the knee, sighs, looks at the "clock" (up).
function tap(t) {
  const tp = pos(sin(2 * PI * t * 3)), drum = pos(sin(2 * PI * t * 6));
  const look = track([[0, 0], [2.4, 0], [2.7, 1], [3.6, 1], [3.9, 0]], t % 6);
  return seated({ feet: seatedFeet([{}, { lift: 4 * tp, toe: 28 * tp }]),
    hands: [{ f: .75, d: .55 }, { f: .82, d: .5 - .06 * drum }], head: -14 * look + 2 * sin(t * 2), face: look > .5 ? 'k:angry' : 'k:standard', blink: blinkAt(t) });
}
// B JITTER KNEE: the knee bounces non-stop like a nervous meme, keeps checking the wrist.
function jitter(t) {
  const j = sin(2 * PI * t * 7), chk = track([[0, 0], [1.0, 0], [1.2, 1, 'out'], [1.9, 1], [2.1, 0], [3.6, 0], [3.8, 1, 'out'], [4.4, 1], [4.6, 0]], t % 6);
  return seated({ feet: seatedFeet([{}, { lift: 14 + 14 * j, toe: -20 }]),
    hands: [{ f: .7, d: .55 }, { f: .55 + .2 * chk, d: .5 - .45 * chk, bow: .8 }], head: 8 * chk + 1.5 * j, face: chk > .5 ? 'k:open' : 'awkward' });
}
// C MELTING BORED: slowly slides down the chair, cheek on the fist, sighs, tired face.
function melt(t) {
  const s = track([[0, 0], [1.0, 0], [4.0, 1, 'io'], [5.6, 1], [6, 0]], t % 6);
  return seated({ x: -50 + 60 * s, y: 190 + 8 * s, rot: -14 * s, feet: seatedFeet([{ x: 112 + 70 * s, thigh: 6 - 18 * s }, { x: 152 + 70 * s, thigh: 2 - 18 * s }]),
    hands: [{ f: .55, d: .65 }, { f: .2 + .2 * s, d: -.05 + .2 * s, bow: .9, over: true }], head: 12 + 8 * s, face: s > .3 ? 'tired' : 'k:sad', blink: s > .3 ? (t % 2.4 < .5 ? 'half' : null) : null });
}
export default { title: 'WAITING (seated)  ·  pick A, B or C', dur: 6, styles: [
  { key: 'A', name: 'Foot tap', blurb: 'foot taps, fingers drum, glares at the clock', pose: tap },
  { key: 'B', name: 'Jitter knee', blurb: 'knee bounces nonstop, checks the wrist', pose: jitter },
  { key: 'C', name: 'Melting bored', blurb: 'slides down the chair, face on the fist', pose: melt },
] };
// ---------- FRONT VIEW: sitting on a crate facing the camera ----------
import { G } from '../rig.mjs';
const CTOP = 822, SEATF = CTOP - 640 + 10, FXF = [-60, 58];
const crateW = () => `<rect x="-150" y="${CTOP}" width="300" height="${G - CTOP}" rx="10" fill="#3f7fd6" stroke="#2a1a1f" stroke-width="12"/><rect x="-150" y="${CTOP}" width="300" height="16" rx="8" fill="#6fa3ea"/>`;
const sitF = o => ({ view: 'front', dir: 1, x: 0, y: SEATF, rot: 0, back: crateW(), feet: FXF.map(x => ({ x, kneeK: .2 })), cam: 0, camY: -200, ...o });
function tapF(t) { const tp = pos(sin(2 * PI * t * 3)), drum = pos(sin(2 * PI * t * 6)), look = track([[0, 0], [2.4, 0], [2.7, 1], [3.6, 1], [3.9, 0]], t % 6);
  return sitF({ feet: [{ x: FXF[0], kneeK: .2 }, { x: FXF[1] + 10, lift: 5 * tp, toe: 30 * tp, kneeK: .2 }], hands: [{ f: .3, d: .85 }, { f: .3, d: .85 - .06 * drum }], head: 10 * look + 2 * sin(t * 2), face: look > .5 ? 'k:angry' : 'k:standard', blink: blinkAt(t) }); }
function jitterF(t) { const j = sin(2 * PI * t * 7), chk = track([[0, 0], [1.0, 0], [1.2, 1, 'out'], [1.9, 1], [2.1, 0], [3.6, 0], [3.8, 1, 'out'], [4.4, 1], [4.6, 0]], t % 6);
  return sitF({ feet: [{ x: FXF[0], kneeK: .2 }, { x: FXF[1], lift: 13 + 13 * j, kneeK: .2 }], hands: [{ f: .3, d: .85 }, { f: .3 - .35 * chk, d: .85 - .55 * chk, bow: .8 }], head: 8 * chk + 1.5 * j, face: chk > .5 ? 'k:open' : 'awkward' }); }
function meltF(t) { const s = track([[0, 0], [1.0, 0], [4.0, 1, 'io'], [5.6, 1], [6, 0]], t % 6);
  return sitF({ x: -30 * s, y: SEATF + 14 * s, rot: -14 * s, feet: [{ x: FXF[0] - 30 * s, kneeK: .2 }, { x: FXF[1] + 50 * s, kneeK: .2 }], hands: [{ lx: -120 + 18 * s, ly: 573 - 235 * s, bow: .9, over: s > .5 }, { f: .3 + .2 * s, d: .9 }], head: -6 * s, face: s > .3 ? 'tired' : 'k:sad', blink: null }); }
export const front = { title: 'WAITING (seated)  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Foot tap', blurb: 'foot taps, fingers drum, glares at the clock', pose: tapF },
  { key: 'B', name: 'Jitter knee', blurb: 'knee bounces nonstop, checks the wrist', pose: jitterF },
  { key: 'C', name: 'Melting bored', blurb: 'slumps sideways, face on the fist', pose: meltF },
] };
