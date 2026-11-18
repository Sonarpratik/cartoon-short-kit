import { track, blinkAt } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI;
const loop = 4;
// feet per locked view (a view change is a swap between drawn views, never a squash)
const FEET = { front: [-36, 34], back: [-36, 34], '34': [-30, 42], side: [-18, 18] };
const pose = (view, dir, o = {}) => ({ view, dir, x: 0, y: o.y || 0, rot: o.rot || 0, feet: FEET[view].map((x, i) => ({ x: x * (view === 'side' ? dir : 1), lift: o.lift && o.lift[i] || 0 })), hands: o.hands || [null, null], head: o.head || 0, face: o.face || 'k:standard', blink: o.blink, cam: 0 });
// A DOUBLE TAKE: walks his eyes past it, looks away... SNAP back to the camera with a jump and a jaw-drop.
function double(t0) {
  const t = t0 % loop;
  if (t < .8) return pose('side', 1, { blink: blinkAt(t) });
  if (t < 1.15) return pose('front', 1, { face: 'k:standard' });
  if (t < 1.75) return pose('side', 1, { head: track([[1.15, 0], [1.4, -4], [1.75, 0]], t) });
  const u = t - 1.75, hop = track([[0, 0], [.08, -70, 'out'], [.25, 0, 'in'], [.32, 12, 'out'], [.4, 0]], u);
  return pose('front', 1, { y: hop, lift: [-Math.min(0, hop), -Math.min(0, hop)], face: 'jawdrop', hands: [{ f: .7, d: .1, bow: .3 }, { f: .7, d: .1, bow: .3 }], head: track([[0, 0], [.08, -8], [.4, 4], [.8, 0]], u) });
}
// B SPIN: spins round on the spot (front, side, back, side... 3 frames each, with a hop), then wobbles dizzy.
function spin(t0) {
  const t = t0 % loop, SEQ = [['front', 1], ['side', 1], ['back', 1], ['side', -1]];
  if (t < .6) return pose('front', 1, { blink: blinkAt(t) });
  if (t < 1.6) { const k = Math.floor((t - .6) * 10), [v, d] = SEQ[k % 4], hop = -60 * sin(PI * (t - .6));
    return pose(v, d, { y: hop, lift: [-hop, -hop], face: 'k:open', hands: [{ f: .8, d: .2 }, { f: .8, d: .2 }] }); }
  const u = t - 1.6, sway = 8 * sin(u * 7) * Math.exp(-u * .7);
  return pose('front', 1, { rot: sway, head: -sway * 1.5, face: 'confused', hands: [{ f: .5, d: .5 + .2 * sin(u * 7) }, { f: .5, d: .5 - .2 * sin(u * 7) }] });
}
// C SUSPICIOUS SLOW TURN: only the eyes first... then the face (3/4)... then the whole body, leaning in, squinting.
function sus(t0) {
  const t = t0 % loop;
  if (t < .7) return pose('front', 1, { blink: blinkAt(t) });
  if (t < 1.5) return pose('front', 1, { face: 'sideeye' });
  if (t < 2.4) return pose('34', 1, { face: 'sideeye', lift: [t < 1.65 ? 20 : 0, 0], head: 4 });
  const lean = track([[2.4, 0], [3.0, 8, 'io']], t);
  return pose('side', 1, { face: 'sus', rot: lean, lift: [t < 2.55 ? 20 : 0, 0], head: track([[2.4, 0], [3.0, 10]], t), hands: [{ f: -.3, d: .8 }, { f: -.25, d: .8 }] });
}
export default { title: 'TURN AROUND  ·  pick A, B or C', dur: loop, reps: 2, styles: [
  { key: 'A', name: 'Double take', blurb: 'looks, looks away, SNAPS back, jaw drops', pose: double },
  { key: 'B', name: 'Dizzy spin', blurb: 'spins on the spot with a hop, wobbles', pose: spin },
  { key: 'C', name: 'Suspicious turn', blurb: 'eyes first, then face, then body', pose: sus },
] };
