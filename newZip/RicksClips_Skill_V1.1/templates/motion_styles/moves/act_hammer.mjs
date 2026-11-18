import { G, track, blinkAt, reachDrop } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const INK = '#2a1a1f', PX = 292, PT = 478;          // post x and its top (the nail goes in here)
// a wooden post with a nail; `sunk` 0..1 = how far the nail is in; `jolt` shakes the post on a hit
const post = (sunk, jolt = 0, bent = 0) => `<g transform="translate(${jolt},0)"><rect x="${PX - 60}" y="${PT}" width="120" height="${G - PT}" rx="10" fill="#b77a3f" stroke="${INK}" stroke-width="12"/><path d="M${PX - 40},${PT + 60} L${PX - 40},${G - 20} M${PX + 20},${PT + 30} L${PX + 20},${G - 60}" stroke="#8a5a2c" stroke-width="8" stroke-linecap="round"/>` +
  `<g transform="rotate(${bent},${PX},${PT})"><path d="M${PX},${PT - 70 + 62 * sunk} L${PX},${PT}" stroke="${INK}" stroke-width="12"/><path d="M${PX - 20},${PT - 70 + 62 * sunk} L${PX + 20},${PT - 70 + 62 * sunk}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/></g></g>`;
// the hammer is drawn AT the hand; a = its angle (0 = straight up, 90 = pointing forward and flat)
const hammer = a => (x, y) => `<g transform="translate(${x},${y}) rotate(${a})"><path d="M0,14 L0,-100" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M0,14 L0,-100" stroke="#9b6b3e" stroke-width="10" stroke-linecap="round"/><rect x="-34" y="-136" width="92" height="50" rx="8" fill="#aeb4c2" stroke="${INK}" stroke-width="9"/></g>`;
// one swing: w 0 = wound up high behind the head, 1 = hammer on the nail
const swing = w => ({ hand: { f: .25 + .6 * w, d: -.55 + .55 * w, bow: .9 - .5 * w, over: w < .45 }, ang: -50 + 140 * w, rot: -8 + 16 * w });
const base = (ch, P) => { P.y = Math.max(P.y || 0, reachDrop(ch, P)); return P; };
// A PROUD CRAFTSMAN: slow big wind-up, one clean hit, the nail goes in a third each time, proud nod after the last one
function proud(t0, ch) {
  const t = t0 % 6, k = Math.min(2.999, t / 1.4), n = Math.floor(k), u = k - n, hitting = t < 4.2;
  const w = hitting ? (u < .6 ? 1 - Math.sin(PI * u / .6 * .5) ** .6 * 1 + 0 : u < .72 ? ((u - .6) / .12) ** 2 : 1) : .6;
  const ww = hitting ? (u < .6 ? 1 - Math.sin(PI / 2 * u / .6) : u < .72 ? ((u - .6) / .12) ** 2 : 1) : .55, s = swing(ww);
  const sunk = hitting ? (n + (u > .72 ? 1 : 0)) / 3 : 1, jolt = hitting && u > .72 && u < .8 ? 6 : 0;
  const nod = track([[0, 0], [4.3, 0], [4.6, 10], [4.9, 0], [5.2, 10], [5.5, 0]], t);
  return base(ch, { view: 'side', dir: 1, x: 0, rot: hitting ? s.rot : 0, feet: [{ x: -40 }, { x: 40 }], hands: [{ f: .3, d: .6 }, s.hand], held: [{ hand: 1, svg: hammer(hitting ? s.ang : 20), wrap: (hitting ? s.ang : 20) - 90 }],
    head: nod + (hitting ? s.rot * .4 : 0), face: hitting ? 'k:standard' : 'proud', blink: blinkAt(t), back: post(sunk, jolt), cam: 120, camY: -260 });
}
// B ANGRY FRENZY: hammers like mad, 6 hits a second, body bouncing, nail long gone, still hammering
function frenzy(t0, ch) {
  const t = t0 % 6, u = (t * 6) % 1, ww = u < .5 ? 1 - u / .5 * .7 : .3 + .7 * ((u - .5) / .5) ** 2, s = swing(ww), hit = u > .92 || u < .06;
  return base(ch, { view: 'side', dir: 1, x: 4 * sin(t * 40), y: hit ? 14 : 0, rot: s.rot + 6, feet: [{ x: -50 }, { x: 46 }], hands: [{ f: .6, d: .2 + .2 * sin(t * 38), bow: .8 }, s.hand], held: [{ hand: 1, svg: hammer(s.ang), wrap: s.ang - 90 }],
    head: 6 + 4 * sin(t * 38), face: 'rage', back: post(Math.min(1, t / 1.2), hit ? 7 : 0), cam: 120, camY: -260 });
}
// C HITS THE THUMB: holds the nail, careful wind-up... WHACK on the thumb. Freezes. Then hops about shaking the hand, wailing.
function thumb(t0, ch) {
  const t = t0 % 6;
  if (t < 1.6) { const u = t / 1.6, ww = u < .8 ? 1 - Math.sin(PI / 2 * u / .8) : ((u - .8) / .2) ** 2, s = swing(ww);
    return base(ch, { view: 'side', dir: 1, x: 0, rot: s.rot, feet: [{ x: -40 }, { x: 40 }], hands: [{ wx: PX - 50, wy: PT - 20, bow: .4 }, s.hand], held: [{ hand: 1, svg: hammer(s.ang), wrap: s.ang - 90 }], head: s.rot * .4, face: 'k:standard', blink: blinkAt(t), back: post(0, 0), cam: 120, camY: -260 }); }
  if (t < 2.3) return base(ch, { view: 'side', dir: 1, x: 0, rot: 8, feet: [{ x: -40 }, { x: 40 }], hands: [{ wx: PX - 50, wy: PT - 20, bow: .4 }, swing(1).hand], held: [{ hand: 1, svg: hammer(90) }], head: 3, face: t < 1.9 ? 'k:open' : 'jawdrop', back: post(0, t < 1.7 ? 7 : 0, 14), cam: 120, camY: -260 });
  const u = t - 2.3, hop = Math.abs(sin(PI * u / .35)), h = -70 * hop;
  return { view: 'front', dir: 1, x: -60 + 50 * sin(u * 2.2), y: h, rot: 6 * sin(u * 9), feet: [{ x: -96 + 50 * sin(u * 2.2), lift: -h }, { x: -26 + 50 * sin(u * 2.2), lift: -h + 110, kneeK: .7 }],
    hands: [{ f: .7, d: -.2 + .25 * sin(u * 30), bow: .3 }, { f: .5, d: .5 }], head: 8 * sin(u * 9), face: 'wail', back: post(0, 0, 14), cam: 120, camY: -260 };
}
export default { title: 'HAMMER  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Proud craftsman', blurb: 'big clean hits, nail goes in, proud nod', pose: proud },
  { key: 'B', name: 'Angry frenzy', blurb: 'six hits a second, will not stop', pose: frenzy },
  { key: 'C', name: 'Hits the thumb', blurb: 'careful... WHACK. hops about wailing', pose: thumb },
] };
// ---------- FRONT VIEW: the post stands in front of the body; the hammer comes down from the right onto its top ----------
const PTF = 548, postF = (sunk, jolt = 0, bent = 0) => `<g transform="translate(${jolt},0)"><rect x="-58" y="${PTF}" width="116" height="${G - PTF}" rx="10" fill="#b77a3f" stroke="${INK}" stroke-width="12"/><path d="M-30,${PTF + 60} L-30,${G - 20} M24,${PTF + 30} L24,${G - 60}" stroke="#8a5a2c" stroke-width="10" stroke-linecap="round"/><g transform="rotate(${bent},0,${PTF})"><path d="M0,${PTF - 60 + 54 * sunk} L0,${PTF}" stroke="${INK}" stroke-width="12"/><path d="M-18,${PTF - 60 + 54 * sunk} L18,${PTF - 60 + 54 * sunk}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/></g></g>`;
// w 0 = wound up high at the right, 1 = hammer head on the nail (hand lands beside the post, head swings in over it)
const swingF = (w, sunk = 0) => ({ hand: { wx: 170 - 62 * w, wy: 300 + (188 + 50 * sunk) * w, bow: .7 - .3 * w, over: w < .3 }, ang: 25 - 133 * w });
const hamF = (ch, o) => base(ch, { view: 'front', dir: 1, x: 0, rot: 0, feet: [{ x: -46 }, { x: 44 }], cam: 0, camY: -260, ...o });
function proudF(t0, ch) { const t = t0 % 6, k = Math.min(2.999, t / 1.4), n = Math.floor(k), u = k - n, hitting = t < 4.2;
  const ww = hitting ? (u < .6 ? 1 - Math.sin(PI / 2 * u / .6) : u < .72 ? ((u - .6) / .12) ** 2 : 1) : .5, sunk = hitting ? (n + (u > .72 ? 1 : 0)) / 3 : 1, s = swingF(ww, Math.min(sunk, n / 3 + .0001) );
  const nod = track([[0, 0], [4.3, 0], [4.6, 8], [4.9, 0], [5.2, 8], [5.5, 0]], t);
  return hamF(ch, { rot: hitting ? 3 - 6 * ww : 0, hands: [{ f: .3, d: .85 }, s.hand], held: [{ hand: 1, svg: hammer(s.ang), wrap: s.ang - 90 }], head: nod, face: hitting ? 'k:standard' : 'proud', blink: blinkAt(t), front: postF(sunk, hitting && u > .72 && u < .8 ? 5 : 0) }); }
function frenzyF(t0, ch) { const t = t0 % 6, u = (t * 6) % 1, ww = u < .5 ? 1 - u / .5 * .7 : .3 + .7 * ((u - .5) / .5) ** 2, s = swingF(ww, 1), hit = u > .92 || u < .06;
  return hamF(ch, { x: 3 * sin(t * 40), y: hit ? 12 : 0, hands: [{ f: .6, d: .3 + .2 * sin(t * 38), bow: .8 }, s.hand], held: [{ hand: 1, svg: hammer(s.ang), wrap: s.ang - 90 }], head: 4 * sin(t * 38), face: 'rage', front: postF(Math.min(1, t / 1.2), hit ? 6 : 0) }); }
function thumbF(t0, ch) { const t = t0 % 6, hold = { wx: -44, wy: PTF - 26, bow: .5 };
  if (t < 1.6) { const u = t / 1.6, ww = u < .8 ? 1 - Math.sin(PI / 2 * u / .8) : ((u - .8) / .2) ** 2, s = swingF(ww);
    return hamF(ch, { hands: [hold, s.hand], held: [{ hand: 1, svg: hammer(s.ang), wrap: s.ang - 90 }], face: 'k:standard', blink: blinkAt(t), front: postF(0) }); }
  if (t < 2.3) return hamF(ch, { hands: [hold, swingF(1).hand], held: [{ hand: 1, svg: hammer(swingF(1).ang) }], head: 3, face: t < 1.9 ? 'k:open' : 'jawdrop', front: postF(0, t < 1.7 ? 6 : 0, 14) });
  const u = t - 2.3, hop = Math.abs(sin(PI * u / .35)), h = -70 * hop, dx = -230 + 40 * sin(u * 2.2);
  return { view: 'front', dir: 1, x: dx, y: h, rot: 6 * sin(u * 9), feet: [{ x: dx - 36, lift: -h }, { x: dx + 34, lift: -h + 110, kneeK: .7 }], hands: [{ f: .7, d: -.2 + .25 * sin(u * 30), bow: .3 }, { f: .5, d: .5 }], head: 8 * sin(u * 9), face: 'wail', front: postF(0, 0, 14), cam: -100, camY: -260 }; }
export const front = { title: 'HAMMER  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Proud craftsman', blurb: 'big clean hits, nail goes in, proud nod', pose: proudF },
  { key: 'B', name: 'Angry frenzy', blurb: 'six hits a second, will not stop', pose: frenzyF },
  { key: 'C', name: 'Hits the thumb', blurb: 'careful... WHACK. hops about wailing', pose: thumbF },
] };
