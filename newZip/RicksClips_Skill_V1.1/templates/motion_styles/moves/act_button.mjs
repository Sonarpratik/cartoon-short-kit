// PRESS A BUTTON (seen in Rick's clips: big red button, elevator, slot machine). The finger ENDS ON the button.
import { G, track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, PI = Math.PI, INK = '#2a1a1f', pos = v => Math.max(0, v);
// side: a post with a box on top, the button sticks out of the box toward the character. p = 0..1 pressed
const BX = 215, BY = 500;
const post = p => `<rect x="${BX + 40}" y="${BY + 70}" width="36" height="${G - BY - 70}" fill="#59607a" stroke="${INK}" stroke-width="12"/><rect x="${BX + 6}" y="${BY - 80}" width="110" height="160" rx="14" fill="#f2c230" stroke="${INK}" stroke-width="12"/><rect x="${BX - 30 + 24 * p}" y="${BY - 42}" width="${40 - 24 * p}" height="84" rx="12" fill="${p > .5 ? '#ff7a6b' : '#e23b2e'}" stroke="${INK}" stroke-width="12"/><circle cx="${BX + 61}" cy="${BY - 112}" r="20" fill="${p > .5 ? '#fff6c2' : '#6b6f80'}" stroke="${INK}" stroke-width="10"/>`;
const tip = p => BX - 38 + 24 * p;
// A THE BIG MOMENT: winds the finger up slowly, holds, one proud poke
function moment(t0, ch) { const t = t0 % 6, r = track([[0, 0], [1.6, .55, 'io'], [2.6, .55], [2.85, 1, 'out'], [4.4, 1], [4.9, 0, 'io'], [6, 0]], t), p = r > .98 ? 1 : 0;
  const P = { view: 'side', dir: 1, x: -40, rot: 4 + 6 * r, feet: [{ x: -62 }, { x: -18 }], hands: [{ f: -.3, d: .6, bow: .9 }, r > .05 ? { wx: tip(p) - 150 * (1 - r), wy: BY + 60 * (1 - r), bow: .5 } : { f: .2, d: .85 }], head: -4 * r, face: p ? 'k:happy' : r > .3 ? 'k:smirk' : 'k:standard', blink: r < .05 ? blinkAt(t) : null };
  P.y = reachDrop(ch, P); return { ...P, back: post(p), cam: 60 }; }
// B PANIC MASH: both hands hammer the button as fast as they can, nothing happens
function mash(t, ch) { const k = (t * 7) % 1, h = k < .5 ? k * 2 : 2 - k * 2, p = h > .8 ? 1 : 0, j = sin(t * 44);
  const P = { view: 'side', dir: 1, x: -30 + 2 * j, rot: 12, feet: [{ x: -70 }, { x: -6 }], hands: [{ wx: tip(1 - p) - 70 * h, wy: BY + 14, bow: .6 }, { wx: tip(p) - 70 * (1 - h), wy: BY - 10, bow: .6 }], head: 3 * j, face: 'scream' };
  P.y = reachDrop(ch, P); return { ...P, back: post(1), cam: 60 }; }
// C TOO SCARED: reaches, pulls back, reaches, looks away, pokes with the eyes shut
function scared(t0, ch) { const t = t0 % 6, r = track([[0, 0], [.8, .7, 'io'], [1.3, .2, 'out'], [2.2, .8, 'io'], [2.7, .3, 'out'], [3.8, 1, 'io'], [4.6, 1], [4.9, 0, 'out'], [6, 0]], t), p = r > .98 ? 1 : 0, away = track([[0, 0], [2.9, 0], [3.3, 1, 'io'], [4.6, 1], [5, 0]], t), sh = 2 * sin(t * 38);
  const P = { view: 'side', dir: 1, x: -70 + 30 * r + sh, rot: -8 + 14 * r, feet: [{ x: -110 }, { x: -50 + 30 * r }], hands: [{ f: -.2, d: .5, bow: .9 }, { wx: tip(p) - 200 * (1 - r), wy: BY + 20 * (1 - r), bow: .4 }], head: -22 * away, face: away > .5 ? 'terrified' : 'awkward' };
  P.y = reachDrop(ch, P); return { ...P, back: post(p), cam: 60 }; }
export default { title: 'PRESS A BUTTON  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'The big moment', blurb: 'winds the finger up, holds, one proud poke', pose: moment },
  { key: 'B', name: 'Panic mash', blurb: 'both hands hammer it, screaming', pose: mash },
  { key: 'C', name: 'Too scared', blurb: 'reaches, flinches back, pokes looking away', pose: scared },
] };
// ---------- FRONT VIEW: a stand in front of the character, the button on top ----------
const BT = 560;
const stand = p => `<rect x="-36" y="${BT + 50}" width="72" height="${G - BT - 30}" fill="#59607a" stroke="${INK}" stroke-width="12"/><rect x="-120" y="${BT}" width="240" height="70" rx="14" fill="#f2c230" stroke="${INK}" stroke-width="12"/><rect x="-62" y="${BT - 36 + 22 * p}" width="124" height="${42 - 22 * p}" rx="14" fill="${p > .5 ? '#ff7a6b' : '#e23b2e'}" stroke="${INK}" stroke-width="12"/>`;
const top = p => BT - 46 + 22 * p;
function momentF(t0, ch) { const t = t0 % 6, r = track([[0, 0], [1.6, .55, 'io'], [2.6, .55], [2.85, 1, 'out'], [4.4, 1], [4.9, 0, 'io'], [6, 0]], t), p = r > .98 ? 1 : 0;
  const P = { view: 'front', dir: 1, x: 0, rot: 0, feet: [{ x: -40 }, { x: 38 }], hands: [{ f: .3, d: .7, bow: 1 }, { wx: 10 + 110 * (1 - r), wy: top(p) - 150 * (1 - r), bow: .6 }], head: 6 * r, face: p ? 'k:happy' : r > .3 ? 'k:smirk' : 'k:standard', blink: r < .05 ? blinkAt(t) : null };
  P.y = reachDrop(ch, P); return { ...P, front: stand(p), cam: 0 }; }
function mashF(t, ch) { const k = (t * 7) % 1, h = k < .5 ? k * 2 : 2 - k * 2, p = h > .8 ? 1 : 0, j = sin(t * 44);
  const P = { view: 'front', dir: 1, x: 2 * j, rot: 0, feet: [{ x: -50 }, { x: 48 }], hands: [{ wx: -26, wy: top(1 - p) - 70 * h, bow: .7 }, { wx: 26, wy: top(p) - 70 * (1 - h), bow: .7 }], head: 3 * j, face: 'scream' };
  P.y = reachDrop(ch, P); return { ...P, front: stand(1), cam: 0 }; }
function scaredF(t0, ch) { const t = t0 % 6, r = track([[0, 0], [.8, .7, 'io'], [1.3, .2, 'out'], [2.2, .8, 'io'], [2.7, .3, 'out'], [3.8, 1, 'io'], [4.6, 1], [4.9, 0, 'out'], [6, 0]], t), p = r > .98 ? 1 : 0, away = track([[0, 0], [2.9, 0], [3.3, 1, 'io'], [4.6, 1], [5, 0]], t), sh = 2 * sin(t * 38);
  const P = { view: 'front', dir: 1, x: -50 + 30 * r + sh, rot: -8 + 6 * r, feet: [{ x: -90 }, { x: -6 }], hands: [{ f: .4, d: .5, bow: 1 }, { wx: 6 + 60 * (1 - r), wy: top(p) - 170 * (1 - r), bow: .5 }], head: -18 * away, face: away > .5 ? 'terrified' : 'awkward' };
  P.y = reachDrop(ch, P); return { ...P, front: stand(p), cam: 0 }; }
export const front = { title: 'PRESS A BUTTON  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'The big moment', blurb: 'finger rises, holds, one proud press', pose: momentF },
  { key: 'B', name: 'Panic mash', blurb: 'both hands hammer it, screaming', pose: mashF },
  { key: 'C', name: 'Too scared', blurb: 'leans away, flinches, presses looking away', pose: scaredF },
] };
