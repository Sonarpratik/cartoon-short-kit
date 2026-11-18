// LAST ONES (seen in Rick's clips): climb in a window, handshake, hand over at a counter, stand in a queue, watch the sunset (back view).
import { G, track, reachDrop, blinkAt, cycle } from '../rig.mjs';
import { S, mk, isF, sin, PI, pos, INK } from './gest_helpers.mjs';
// ---- CLIMB IN A WINDOW (side): the wall is seen edge-on, the body goes OVER the sill, never through the wall
const SILL = 640;
const wallW = () => `<rect x="-30" y="${SILL}" width="60" height="${G - SILL}" fill="#b4573f" stroke="${INK}" stroke-width="12"/><rect x="-50" y="${SILL - 20}" width="100" height="30" rx="8" fill="#f3efe6" stroke="${INK}" stroke-width="10"/><rect x="-30" y="-900" width="60" height="1000" fill="#b4573f" stroke="${INK}" stroke-width="12"/>`;
const HS = SILL - 55;   // hip height when the belly lies on the sill
function flop(t0) { const t = t0 % 6, u = track([[0, 0], [1.0, 1, 'io'], [3.2, 1], [4.2, 2, 'in'], [6, 2]], t), a = Math.min(u, 1), over = pos(u - 1), k = sin(t * 12) * (1 - over);
  return { view: 'side', dir: 1, x: -150 + 150 * a + 230 * over, y: (620 - 0) * 0 + (0 + (HS - 620) * a) + (918 - HS) * over, rot: 80 * a, feet: over > .5 ? [{ x: 20, lift: 30, kneeK: .1 }, { x: -10, lift: 60, kneeK: .1 }] : [{ x: -230 + 60 * a + 50 * k * a, lift: (G - SILL + 20) * a + 60 * k * a, kneeK: .3 }, { x: -200 + 60 * a - 50 * k * a, lift: (G - SILL + 60) * a - 60 * k * a, kneeK: .3 }], hands: [{ f: .3, d: -.9 + 1.5 * (1 - a), bow: .4 }, { f: .4, d: -.9 + 1.5 * (1 - a), bow: .4 }], head: -20 * a, face: over > .5 ? 'k:sad' : 'strain', back: wallW(), cam: 60, camY: -420 }; }
function straddle(t0) { const t = t0 % 6, u = track([[0, 0], [1.2, 1, 'io'], [2.6, 1], [3.8, 2, 'io'], [6, 2]], t), a = Math.min(u, 1), b = pos(u - 1);
  return { view: 'side', dir: 1, x: -170 + 170 * a + 190 * b, y: (SILL - 640) * Math.sin(PI * Math.min(u, 2) / 2) * 1 + 0, rot: 6 * sin(PI * u), feet: [{ x: -200 + 370 * b, lift: 0 }, { x: -150 + 330 * a + 60 * b, lift: a < 1 ? (G - SILL + 80) * sin(PI * a) : 0, kneeK: .8 }], hands: a < 1 || b < 1 ? [{ wx: -20, wy: SILL - 40, bow: .6 }, { wx: 20, wy: SILL - 40, bow: .6 }] : [null, null], head: 10 * sin(t * 2), face: b >= 1 ? 'k:smirk' : 'awkward', back: wallW(), cam: 60, camY: -420 }; }
function stuck(t) { const k = sin(t * 9), w = sin(t * 4);
  return { view: 'side', dir: 1, x: 0, y: HS - 620, rot: 80 + 5 * w, feet: [{ x: -200 + 70 * k, lift: G - SILL + 60 + 70 * k, kneeK: .4 }, { x: -180 - 70 * k, lift: G - SILL + 60 - 70 * k, kneeK: .4 }], hands: [{ f: .3 + .3 * k, d: -.8, bow: .4 }, { f: .3 - .3 * k, d: -.85, bow: .4 }], head: -24, face: 'scream', back: wallW(), cam: 60, camY: -420 }; }
export default { title: 'CLIMB IN A WINDOW  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Belly flop', blurb: 'heaves up onto the sill, tips over, lands in a heap', pose: flop },
  { key: 'B', name: 'One leg at a time', blurb: 'swings a leg over, sits, steps down, smug', pose: straddle },
  { key: 'C', name: 'Stuck', blurb: 'balanced on the belly, arms and legs paddling', pose: stuck },
] };
// ---- HANDSHAKE (side, two characters; the hands END ON each other)
const pair = (ch, t, A, B) => { const mkP = (dir, x, o) => { const P = { view: 'side', dir, x, rot: 0, feet: [{ x: x - 22 }, { x: x + 22 }], hands: [null, null], head: 0, face: 'k:standard', ...o }; P.y = Math.max(reachDrop(ch, P), o.dy || 0); return P; }; return { poses: [mkP(1, -165, A), mkP(-1, 165, B)], cam: 0 }; };
const HX = 0, HYs = 500;
function firm(t, ch) { const p = 26 * sin(t * 9) * (t % 3 < 2 ? 1 : 0); return pair(ch, t, { hands: [null, { wx: HX - 8, wy: HYs + p, bow: .6 }], face: 'k:smirk' }, { hands: [null, { wx: HX + 8, wy: HYs + p, bow: .6 }], face: 'k:happy' }); }
function crush(t, ch) { const j = sin(t * 30); return pair(ch, t, { hands: [null, { wx: HX - 8, wy: HYs, bow: .6 }], face: 'k:smirk', head: 4 }, { rot: -10, dy: 90 + 6 * j, hands: [{ f: .7, d: -.2 + .1 * j, bow: .5 }, { wx: HX + 8, wy: HYs, bow: .5 }], face: 'strain', head: 3 * j }); }
function missed(t0, ch) { const t = t0 % 3, u = track([[0, 0], [.5, 1, 'out'], [1.2, 1], [1.6, 0, 'io']], t), u2 = track([[0, 0], [1.3, 0], [1.8, 1, 'out'], [2.5, 1], [2.9, 0, 'io']], t); return pair(ch, t, { hands: [null, u > .05 ? { wx: -165 + 150 * u, wy: 620 - 120 * u, bow: .6 } : null], face: u2 > .5 ? 'awkward' : 'k:happy' }, { hands: [null, u2 > .05 ? { wx: 165 - 150 * u2, wy: 620 - 120 * u2, bow: .6 } : null], face: u > .5 && u2 < .5 ? 'k:standard' : u2 > .5 ? 'k:happy' : 'k:standard', blink: u > .5 && u2 < .3 ? 'half' : null }); }
export const shake = { title: 'HANDSHAKE  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Firm', blurb: 'big pumps up and down, both pleased', pose: firm },
  { key: 'B', name: 'The crusher', blurb: 'one squeezes, the other sinks to the knees', pose: crush },
  { key: 'C', name: 'Bad timing', blurb: 'one offers, gives up, then the other offers', pose: missed },
] };
// ---- HAND OVER AT A COUNTER
const CT = 600;
const counterS = () => `<rect x="130" y="${CT}" width="330" height="${G - CT}" fill="#a8683a" stroke="${INK}" stroke-width="12"/><rect x="110" y="${CT - 26}" width="370" height="36" rx="10" fill="#c98850" stroke="${INK}" stroke-width="12"/>`;
const counterF = () => `<rect x="-420" y="${CT}" width="840" height="${G - CT}" fill="#a8683a" stroke="${INK}" stroke-width="12"/><rect x="-440" y="${CT - 26}" width="880" height="36" rx="10" fill="#c98850" stroke="${INK}" stroke-width="12"/>`;
const coin = (x, y) => `<circle cx="${x}" cy="${y - 16}" r="26" fill="#f2c230" stroke="${INK}" stroke-width="9"/>`;
const counter = mk('PAY AT A COUNTER', [
  ['Here you go', 'puts the coin down, slides it over, nods', v => (t0, ch) => { const t = t0 % 3, u = track([[0, 0], [.6, 1, 'io'], [1.2, 2, 'io'], [2.0, 2], [2.6, 0, 'io']], t), a = Math.min(u, 1), sl = pos(u - 1), f = isF(v); return S(v, ch, { rot: f ? 0 : 6 * a, hands: f ? [null, { wx: 40 + 60 * sl, wy: CT - 40 - 120 * (1 - a), bow: .7 }] : [null, { wx: 150 + 70 * sl, wy: CT - 40 - 100 * (1 - a), bow: .5 }], held: [{ hand: 1, svg: coin }], front: f ? counterF() : '', back: f ? '' : counterS(), cam: f ? 0 : 120, head: 5 * sl, face: 'k:happy' }); }],
  ['Does not want to pay', 'coin comes out slowly, will not let go', v => (t0, ch) => { const t = t0 % 6, u = track([[0, 0], [2.6, 1, 'io'], [3.4, .8, 'io'], [4.2, 1, 'io'], [5.0, .8], [5.7, 0, 'io']], t), sh = 2 * sin(t * 30), f = isF(v); return S(v, ch, { rot: f ? -4 : -6, hands: f ? [null, { wx: 40 + sh, wy: CT - 40 - 150 * (1 - u), bow: .7 }] : [null, { wx: 150 + sh, wy: CT - 40 - 130 * (1 - u), bow: .5 }], held: [{ hand: 1, svg: coin }], front: f ? counterF() : '', back: f ? '' : counterS(), cam: f ? 0 : 120, head: f ? -8 : -8, face: 'strain' }); }],
  ['Slam', 'bangs the coin down, points, wants it now', v => (t0, ch) => { const t = t0 % 3, k = (t * 2.5) % 1, up = t < 1.6 ? (k < .6 ? sin(PI * k / .6) : 0) : 0, f = isF(v); return S(v, ch, { rot: f ? 0 : 10, hands: f ? [t > 1.6 ? { f: .9, d: -.1, bow: .2 } : null, { wx: 40, wy: CT - 40 - 120 * up, bow: .7 }] : [t > 1.6 ? { f: .95, d: -.15, bow: .2 } : { f: -.4, d: .5, bow: .7 }, { wx: 150, wy: CT - 40 - 110 * up, bow: .5 }], held: [{ hand: 1, svg: coin }], front: f ? counterF() : '', back: f ? '' : counterS(), cam: f ? 0 : 120, head: 2 * sin(t * 30), face: 'k:angry' }); }],
]);
export const counterSide = counter('side'), counterFront = counter('front');
// ---- STAND IN A QUEUE (side; shuffles forward one step at a time)
const queue = kind => (t0, ch) => { const t = t0 % 3, n = Math.floor(t0 / 3), st = track([[0, 0], [2.3, 0], [2.9, 1, 'io']], t), x = (n + st) * 70 - 100, lift = 50 * sin(PI * st);
  const base = { view: 'side', dir: 1, x, rot: 0, feet: [{ x: x - 22 + 0, lift: st < .5 ? lift : 0 }, { x: x + 22, lift: st >= .5 ? lift : 0 }], hands: [null, null], head: 0, face: 'k:standard' };
  const o = kind === 0 ? { hands: [{ f: .4, d: .5, bow: .9 }, { f: .34, d: .58, bow: .9 }], head: 6 * sin(t0 * 1.3), face: 'k:standard', blink: 'half' } : kind === 1 ? { rot: 8 + 4 * sin(t0 * 5), hands: [null, { f: .5, d: -.4, bow: .9, over: true }], head: -12 + 6 * sin(t0 * 5), face: 'k:angry' } : { rot: 10, dy: 60, hands: [{ f: .1, d: .97 }, { f: .15, d: .97 }], head: 18, face: 'k:sad', blink: t % 2 < 1.5 ? 'closed' : 'half' };
  const P = { ...base, ...o }; P.y = Math.max(reachDrop(ch, P), o.dy || 0); return { ...P, cam: x + 100 }; };
export const queueSide = { title: 'STAND IN A QUEUE  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Patient', blurb: 'arms crossed, one small step when the line moves', pose: queue(0) },
  { key: 'B', name: 'How much longer', blurb: 'leans out to look ahead, hand over the eyes, fuming', pose: queue(1) },
  { key: 'C', name: 'Asleep on its feet', blurb: 'sags, snoozes, shuffles forward without waking', pose: queue(2) },
] };
// ---- WATCH THE SUNSET (back view)
const sun = t => `<rect x="-1500" y="-1500" width="3000" height="${G + 1500}" fill="#f29a4a"/><circle cx="0" cy="${520 + 14 * t}" r="300" fill="#ffe08a"/><rect x="-1500" y="700" width="3000" height="${G - 700}" fill="#b4573f"/>`;
const sunset = k => (t, ch) => { const o = k === 0 ? { hands: [null, null], head: 3 * sin(t) } : k === 1 ? { hands: [{ f: .75, d: -.5 + .05 * sin(t * 3), bow: .3 }, { f: .75, d: -.5 - .05 * sin(t * 3), bow: .3 }], head: -4, hop: -10 * pos(sin(t * 3)) } : { rot: 6 * sin(t * .8), hands: [{ lx: -70, ly: 560 }, { lx: 70, ly: 560 }], head: 14 * sin(t * .8), dy: 20 }; const P = { view: 'back', dir: 1, x: 0, rot: 0, feet: [{ x: -40 }, { x: 38 }], ...o }; P.y = Math.max(reachDrop(ch, P), o.dy || 0) + (o.hop || 0); return { ...P, back: sun(t), cam: 0 }; };
export const sunsetBack = { title: 'WATCH THE SUNSET  ·  back view', dur: 6, styles: [
  { key: 'A', name: 'Still', blurb: 'just stands and looks, one slow breath', pose: sunset(0) },
  { key: 'B', name: 'Arms wide', blurb: 'takes it all in, arms out, rises on the toes', pose: sunset(1) },
  { key: 'C', name: 'Sways', blurb: 'hands on the hips, rocks side to side, head tilting', pose: sunset(2) },
] };
