import { track, blinkAt, reachDrop, G } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
const loop = 3.2;
// airborne feet: hang under the hips (lift follows the body), tuck pulls them up
const airFeet = (y, xs, tuck = 0, toe = 0) => xs.map(x => ({ x, lift: Math.max(0, -y + tuck), toe }));
// A BOING SPRING: deep wind-up crouch, launches, tucks the knees, lands into a crouch, settles with a wobble.
function boing(t0, ch) {
  const t = t0 % loop;
  const y = track([[0, 0], [.4, 0], [.75, 120, 'out'], [.82, 100], [.95, -420, 'out'], [1.25, -470, 'out'], [1.55, -40, 'in'], [1.62, 0, 'in'], [1.78, 110, 'out'], [2.1, -10, 'out'], [2.3, 0]], t);
  const air = t > .86 && t < 1.6;
  const tuck = track([[0, 0], [.9, 0], [1.1, 190, 'out'], [1.35, 190], [1.55, 0, 'in']], t);
  const rot = track([[0, 0], [.4, 0], [.75, 14], [.95, -6], [1.25, 4], [1.62, 10], [1.78, 16], [2.3, 0]], t);
  const xs = [-18, 18];
  const P = { view: 'side', dir: 1, x: 0, y, rot, feet: air ? airFeet(y, xs, tuck, -20) : xs.map(x => ({ x })),
    hands: [{ f: track([[0, 0], [.75, -.8], [.95, .6, 'out'], [1.5, .3], [1.78, -.6], [2.3, 0]], t), d: track([[0, .95], [.75, .3], [.95, -.4, 'out'], [1.5, .3], [1.78, .4], [2.3, .95]], t) },
      { f: track([[0, 0], [.75, -.7], [.95, .7, 'out'], [1.5, .4], [1.78, -.5], [2.3, 0]], t), d: track([[0, .95], [.75, .35], [.95, -.45, 'out'], [1.5, .3], [1.78, .4], [2.3, .95]], t), over: t > .9 && t < 1.5 }],
    head: track([[0, 0], [.75, 10], [.95, -10], [1.6, 0], [1.78, 12], [2.3, 0]], t), face: t < .4 ? 'k:standard' : t < .9 ? 'k:smirk' : t < 2.3 ? 'k:happy' : 'k:standard', blink: blinkAt(t) };
  if (!air) P.y = Math.max(P.y, reachDrop(ch, P));
  return { ...P, cam: 0, camY: -800, camH: 1950 };
}
// B STARTLED: a sudden noise -> shoots straight up in 4 frames, arms and legs splayed out, hangs in the air (cartoon hang time), drops, lands stiff.
function startled(t0, ch) {
  const t = t0 % loop;
  const y = track([[0, 0], [.7, 0], [.83, -430, 'out'], [1.55, -455], [1.75, 0, 'in3'], [1.82, 14, 'out'], [1.9, 0]], t);
  const spread = track([[0, 0], [.7, 0], [.8, 1, 'out'], [1.6, 1], [1.75, .2], [2.2, 0]], t);
  const air = t > .72 && t < 1.74;
  const shiver = air ? 3 * sin(t * 60) : 0;
  const P = { view: 'front', dir: 1, x: 0, y: y + shiver, rot: 0,
    feet: air ? [{ x: -36 - 90 * spread, lift: -y - 30 * spread }, { x: 34 + 90 * spread, lift: -y - 30 * spread }] : [{ x: -36 }, { x: 34 }],
    hands: [{ f: .3 + .7 * spread, d: .95 - 1.35 * spread, bow: .2 }, { f: .3 + .7 * spread, d: .95 - 1.35 * spread, bow: .2 }],
    head: 0, face: t < .7 ? 'k:standard' : t < 2.4 ? 'terrified' : 'k:open', blink: blinkAt(t, 3, .2) };
  if (!air) P.y = Math.max(P.y, reachDrop(ch, P));
  return { ...P, cam: 0, camY: -800, camH: 1950 };
}
// C HEEL CLICK: happy hop, both feet kick out to one side and click together at the top, a fist punches the air.
function heel(t0, ch) {
  const t = t0 % loop;
  const y = track([[0, 0], [.5, 0], [.68, 60, 'out'], [.85, -330, 'out'], [1.15, -360], [1.45, 0, 'in'], [1.55, 50, 'out'], [1.8, 0]], t);
  const air = t > .76 && t < 1.44;
  const click = track([[0, 0], [.8, 0], [1.0, 1, 'out'], [1.25, 1], [1.4, 0]], t);
  const rot = track([[0, 0], [.8, 0], [1.0, -12], [1.25, -12], [1.45, 0]], t);
  const P = { view: 'front', dir: 1, x: 0, y, rot,
    feet: air ? [{ x: -36 + 150 * click, lift: -y + 120 * click, toe: 20 * click }, { x: 34 + 105 * click, lift: -y + 120 * click, toe: 20 * click }] : [{ x: -36 }, { x: 34 }],
    hands: [{ f: .4, d: .7 - .3 * click, bow: .4 }, { f: .15 + .2 * click, d: .9 - 1.75 * click, bow: .3, over: click > .4 }],
    head: -8 * click, face: t < .5 ? 'k:standard' : 'k:happy', blink: blinkAt(t) };
  if (!air) P.y = Math.max(P.y, reachDrop(ch, P));
  return { ...P, cam: 0, camY: -800, camH: 1950 };
}
export default { title: 'JUMP  ·  pick A, B or C', dur: loop, reps: 3, styles: [
  { key: 'A', name: 'Boing spring', blurb: 'big wind-up, tucks the knees, wobbly landing', pose: boing },
  { key: 'B', name: 'Startled jump', blurb: 'shoots up, splayed, hangs in the air', pose: startled },
  { key: 'C', name: 'Heel click', blurb: 'happy hop, heels click at the top', pose: heel },
] };
