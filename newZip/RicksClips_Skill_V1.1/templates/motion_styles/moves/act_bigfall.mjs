// BIG FALLS (seen in Rick's clips: free fall flailing, thrown out of a door, dragged by the feet). Bodies stay rigid, land ON the floor.
import { G, track, cycle } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f', isF = v => v === 'front', pos = v => Math.max(0, v);
// ---------- FREE FALL: the camera falls with the character, clouds rush up past ----------
const clouds = t => { let o = ''; for (let k = 0; k < 7; k++) { const y = 900 - ((t * 1500 + k * 330) % 2300), x = [-330, 260, -120, 380, -400, 90, 300][k]; o += `<g opacity=".8"><ellipse cx="${x}" cy="${y}" rx="130" ry="46" fill="#fff"/><ellipse cx="${x + 70}" cy="${y - 30}" rx="80" ry="44" fill="#fff"/></g>`; } return `<rect x="-1500" y="-1500" width="3000" height="3000" fill="#6fb6f2"/>` + o; };
const HY = -40, air = (v, t, o) => ({ view: v, dir: 1, x: 0, y: HY - 620, rot: 0, back: clouds(t), cam: 0, camY: -820, noShadow: true, ...o });
const L = G - (HY + 300);
const flail = v => (t, ch) => { const a = t * 13, f = isF(v); return air(v, t, { x: 14 * sin(t * 7), rot: 10 * sin(t * 5), feet: [{ x: (f ? -80 : -40) + 110 * sin(a), lift: L + 80 * cos(a), kneeK: .6 }, { x: (f ? 80 : 40) - 110 * sin(a), lift: L - 80 * cos(a), kneeK: .6 }], hands: [{ f: .8 * cos(a), d: -.5 + .4 * sin(a), bow: .4 }, { f: .8 * cos(a + 2), d: -.5 + .4 * sin(a + 2), bow: .4 }], head: 6 * sin(a), face: 'scream' }); };
const fate = v => (t, ch) => { const b = sin(t * 2), f = isF(v); return air(v, t, { rot: f ? 0 : -30, y: HY - 620 + 10 * b, feet: [{ x: f ? -30 : 150, lift: L + (f ? 0 : 150), kneeK: .2 }, { x: f ? 60 : 190, lift: L + (f ? 30 : 170), kneeK: .2 }], hands: f ? [{ lx: 46, ly: 470 }, { lx: -40, ly: 492 }] : [{ f: .4, d: .5, bow: .9 }, { f: .34, d: .58, bow: .9 }], head: f ? 4 : 20, face: 'k:standard', blink: 'half' }); };
const swim = v => (t, ch) => { const k = (t * 1.4) % 1, s = sin(PI * k), fr = k < .5, f = isF(v); return air(v, t, { y: HY - 620 - 30 * s, feet: [{ x: (f ? -60 : -20) - 80 * s, lift: L - 40 + 120 * s, kneeK: 1 }, { x: (f ? 60 : 20) + 80 * s, lift: L - 40 + 120 * s, kneeK: 1 }], hands: f ? [{ f: .3 + .65 * s, d: -.6 + .7 * k, bow: .5 }, { f: .3 + .65 * s, d: -.6 + .7 * k, bow: .5 }] : [{ f: .6 - .9 * k, d: -.7 + .5 * s, bow: .5 }, { f: .7 - .9 * k, d: -.75 + .5 * s, bow: .5 }], head: -8, face: 'strain' }); };
const mkA = v => ({ title: `FREE FALL  ·  ${isF(v) ? 'front' : 'side'} view`, dur: 6, styles: [
  { key: 'A', name: 'Flail', blurb: 'arms and legs windmill, screaming', pose: flail(v) },
  { key: 'B', name: 'Accepted it', blurb: 'arms crossed, lies back, waits', pose: fate(v) },
  { key: 'C', name: 'Swim back up', blurb: 'breaststroke against gravity, straining', pose: swim(v) },
] });
export default mkA('side'); export const front = mkA('front');
// ---------- THROWN OUT OF A DOOR (side) ----------
const LIE = 918;
const house = () => `<rect x="-900" y="-900" width="620" height="${G + 900}" fill="#b4573f" stroke="${INK}" stroke-width="12"/><rect x="-470" y="330" width="190" height="${G - 330}" fill="#2a1a1f"/><rect x="-490" y="310" width="230" height="30" rx="8" fill="#f2c230" stroke="${INK}" stroke-width="10"/>`;
function plank(t0) { const t = t0 % 4, x = track([[0, -420], [.5, -420], [1.1, 260, 'out'], [1.5, 330, 'out'], [4, 330]], t), y = track([[0, 520], [.5, 520], [.8, 470, 'out'], [1.1, LIE, 'in'], [1.25, LIE - 40, 'out'], [1.4, LIE, 'in']], t), fl = track([[0, 0], [1.1, 0], [1.3, 1, 'out'], [1.9, 0, 'in']], t);
  return { view: 'side', dir: 1, x, y: y - 620, rot: 80, feet: [{ x: x - 320, lift: G - y - 10 + 200 * fl, kneeK: .1 }, { x: x - 340, lift: G - y + 20 + 260 * fl, kneeK: .1 }], hands: [{ f: .2, d: -.9, bow: .2 }, { f: .3, d: -.9, bow: .2 }], head: -24, face: t < 1.1 ? 'scream' : 'k:sad', blink: t > 1.4 ? 'closed' : null, back: house(), cam: 200, camY: -420, noShadow: t < 1.1 }; }
function roll(t0) { const t = t0 % 4, u = track([[0, 0], [.5, 0], [1.9, 1, 'out'], [4, 1]], t), sit = u > .98, x = -420 + 760 * u, rot = sit ? -12 : 720 * u, daze = sit ? 8 * sin(t * 4) : 0;
  return { view: 'side', dir: 1, x, y: (sit ? 975 : 700 + 60 * Math.abs(sin(u * 12))) - 620, rot, feet: sit ? [{ x: x + 300, kneeK: .1, toe: 60 }, { x: x + 330, kneeK: .1, toe: 60, lift: 20 }] : [{ x: x + 120 * cos(rot * PI / 180 + 1.6), lift: 320 + 120 * sin(rot * PI / 180 + 1.6), kneeK: 1.2 }, { x: x + 140 * cos(rot * PI / 180 + 1.9), lift: 320 + 140 * sin(rot * PI / 180 + 1.9), kneeK: 1.2 }], hands: sit ? [{ f: -.3, d: .9 }, { f: .3, d: .9 }] : [{ f: .5, d: .3, bow: 1 }, { f: .5, d: .4, bow: 1 }], head: daze, face: sit ? 'awkward' : 'scream', back: house(), cam: 200, camY: -420, noShadow: !sit }; }
function landed(t0) { const t = t0 % 4, x = track([[0, -420], [.5, -420], [1.2, 220, 'out'], [4, 220]], t), air = t > .5 && t < 1.2, h = air ? -260 * sin(PI * (t - .5) / .7) : 0, cr = track([[0, 0], [1.2, 0], [1.3, 120, 'out'], [1.8, 0, 'io']], t), dust = t > 2 && t < 3.2 ? sin(t * 14) : 0;
  return { view: 'side', dir: 1, x, y: h + cr, rot: air ? 20 : 0, feet: air ? [{ x: x - 60, lift: -h + 60, kneeK: .8 }, { x: x + 40, lift: -h + 90, kneeK: .8 }] : [{ x: x - 30 }, { x: x + 30 }], hands: air ? [{ f: -.7, d: -.3 }, { f: .8, d: -.3 }] : dust ? [{ f: .4, d: .45 + .1 * dust, bow: 1 }, { f: .45, d: .5 - .1 * dust, bow: 1 }] : [null, null], head: 0, face: air ? 'scream' : t > 1.9 ? 'k:smirk' : 'awkward', back: house(), cam: 200, camY: -420 }; }
export const thrown = { title: 'THROWN OUT OF A DOOR  ·  side view', dur: 4, styles: [
  { key: 'A', name: 'Plank', blurb: 'flies out flat, lands on the face, legs flop', pose: plank },
  { key: 'B', name: 'Tumble', blurb: 'rolls out like a wheel, ends sitting, dizzy', pose: roll },
  { key: 'C', name: 'Lands it', blurb: 'flies out, lands on the feet, dusts off, smug', pose: landed },
] };
// ---------- DRAGGED BY THE FEET (side) ----------
const rope = (x, y) => `<path d="M${x},${y} L${x + 1400},${y - 60}" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M${x},${y} L${x + 1400},${y - 60}" stroke="#c9a15a" stroke-width="7" stroke-linecap="round"/>`;
const drag = (t, o, face) => { const x = -300 + 220 * t, fy = G - 150; return { view: 'side', dir: face ? -1 : 1, x, y: LIE - 620, rot: -80, feet: [{ x: x + 350, lift: 150, kneeK: .1, toe: face ? -60 : 60 }, { x: x + 356, lift: 162, kneeK: .1, toe: face ? -60 : 60 }], front: rope(x + 360, fy), cam: x - 40, camY: -420, ...o }; };
function claw(t) { const k = sin(t * 12); return drag(t, { hands: [{ f: .2, d: -.95 + .08 * k, bow: .2 }, { f: .1, d: -.95 - .08 * k, bow: .2 }], head: 30, face: 'scream' }, true); }
function calm(t) { return drag(t, { hands: [{ f: .4, d: .5, bow: .9 }, { f: .34, d: .58, bow: .9 }], head: 70, face: 'k:standard', blink: 'half' }, false); }
function bye(t) { const w = sin(t * 10); return drag(t, { hands: [{ f: .2, d: .9 }, { f: .85 + .1 * w, d: -.35, bow: .4 }], head: 60, face: 'k:happy' }, false); }
export const dragged = { title: 'DRAGGED BY THE FEET  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Claws the floor', blurb: 'face down, fingers scraping, screaming', pose: claw },
  { key: 'B', name: 'Accepted it', blurb: 'on the back, arms crossed, bored', pose: calm },
  { key: 'C', name: 'Bye!', blurb: 'on the back, waves happily at everyone', pose: bye },
] };
