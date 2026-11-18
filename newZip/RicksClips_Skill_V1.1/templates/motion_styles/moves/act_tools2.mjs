// MORE ACTIONS (seen in Rick's clips): fishing from a dock, walking with a lantern, pouring out a pot.
import { G, track, cycle, reachDrop, blinkAt } from '../rig.mjs';
import { steps } from './front_helpers.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f', pos = v => Math.max(0, v), isF = v => v === 'front';
// ================= FISHING (sits on the dock edge, legs dangling) =================
const DK = 822;
const dock = t => `<rect x="-900" y="${DK}" width="1010" height="40" rx="8" fill="#a8683a" stroke="${INK}" stroke-width="12"/><rect x="40" y="${DK + 30}" width="44" height="${G - DK + 200}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/><rect x="-400" y="${DK + 30}" width="44" height="${G - DK + 200}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/>`;
const water = t => `<path d="M-1400,${G - 40} ${[...Array(30)].map((_, k) => `q50,${k % 2 ? 26 : -26} 100,0`).join(' ')} V${G + 700} H-1400 Z" fill="#3f7fd6" stroke="${INK}" stroke-width="10" transform="translate(${-((t * 40) % 200)},0)"/>`;
// rod: from the hand up and out; bend pulls the tip down; the line drops from the tip into the water
const rod = (bend, bob) => (x, y) => { const tx = x + 430, ty = y - 250 + 260 * bend; return `<path d="M${x - 30},${y + 20} Q${x + 220},${y - 190} ${tx},${ty}" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M${x - 30},${y + 20} Q${x + 220},${y - 190} ${tx},${ty}" fill="none" stroke="#e2b13c" stroke-width="8" stroke-linecap="round"/><path d="M${tx},${ty} L${tx + 10},${G - 50 + bob}" stroke="${INK}" stroke-width="5"/><circle cx="${tx + 10}" cy="${G - 56 + bob}" r="16" fill="#e8443a" stroke="${INK}" stroke-width="8"/>`; };
const fisher = (t, o) => ({ view: 'side', dir: 1, x: -60, y: DK - 640 + 8, rot: 0, feet: [{ x: 120, thigh: 8, mix: 1, lift: 20 }, { x: 150, thigh: 4, mix: 1, lift: 30 }], back: dock(t), front: water(t), cam: 160, camY: -200, noShadow: true, ...o });
const patient = t => { const sw = sin(t * 2.2); return fisher(t, { feet: [{ x: 120 + 30 * sw, thigh: 8, mix: 1, lift: 30 }, { x: 150 - 30 * sw, thigh: 4, mix: 1, lift: 30 }], hands: [{ f: .6, d: .45 }, { f: .7, d: .4 }], held: [{ hand: 1, svg: rod(0, 6 * sin(t * 3)) }], head: 3 * sin(t), face: 'k:standard', blink: blinkAt(t) }); };
const bite = t0 => { const t = t0 % 6, b = track([[0, 0], [1.6, 0], [1.75, 1, 'out'], [5.0, 1], [5.4, 0, 'io']], t), tug = b * sin(t * 18); return fisher(t, { x: -60 + 50 * b + 10 * tug, rot: 22 * b + 4 * tug, hands: [{ f: .7, d: .3, bow: .4 }, { f: .85, d: .2, bow: .4 }], held: [{ hand: 1, svg: rod(.8 * b + .1 * tug, 40 * b) }], head: -6 * b, face: b > .5 ? 'strain' : 'k:standard' }); };
const dozing = t0 => { const t = t0 % 6, s = track([[0, 0], [3.6, 1, 'io'], [3.7, 0, 'out'], [6, 0]], t); return fisher(t, { rot: 14 * s, hands: [{ f: .6, d: .45 + .3 * s }, { f: .7, d: .4 + .35 * s }], held: [{ hand: 1, svg: rod(.25 * s, 6 * sin(t * 3)) }], head: 20 * s, face: t > 3.7 && t < 4.6 ? 'awkward' : 'k:standard', blink: s > .5 ? 'closed' : s > .15 ? 'half' : null }); };
export default { title: 'FISHING  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Patient', blurb: 'still as a rock, legs swinging', pose: patient },
  { key: 'B', name: 'A bite!', blurb: 'rod bends double, nearly pulled in', pose: bite },
  { key: 'C', name: 'Dozing', blurb: 'nods off, the rod dips, jolts awake', pose: dozing },
] };
// ================= LANTERN WALK =================
const lamp = (x, y) => `<circle cx="${x}" cy="${y + 70}" r="170" fill="#ffe08a" opacity=".22"/><path d="M${x},${y} v24" stroke="${INK}" stroke-width="10"/><rect x="${x - 30}" y="${y + 24}" width="60" height="16" rx="6" fill="#59607a" stroke="${INK}" stroke-width="9"/><rect x="${x - 26}" y="${y + 40}" width="52" height="70" rx="8" fill="#ffd45a" stroke="${INK}" stroke-width="10"/><rect x="${x - 34}" y="${y + 108}" width="68" height="16" rx="6" fill="#59607a" stroke="${INK}" stroke-width="9"/>`;
const night = cx => `<rect x="${cx - 1500}" y="-1500" width="3000" height="${G + 1500}" fill="#141833" opacity=".62"/>`;
const lanternS = (kind) => (t0, ch) => { const t = t0, stop = kind === 2 && (t % 3) > 1.6, tt = kind === 2 ? Math.floor(t / 3) * 1.6 + Math.min(t % 3, 1.6) : t, T = [.75, .36, .3][kind], Sx = [70, 130, 40][kind];
  const c = cycle(tt, { T, S: Sx, duty: .6, swing: u => ({ lift: [90, 70, 30][kind] * sin(PI * u), toe: kind === 0 ? 40 : 0 }) }), w = sin(2 * PI * c.p), sh = stop ? 3 * sin(t * 40) : 0, look = kind === 0 ? sin(t * 1.6) : 0;
  const P = { view: 'side', dir: 1, x: c.bx + sh, rot: [8, 6, -8][kind], feet: c.feet, hands: [{ f: -.3, d: .6, bow: .9 }, { f: .9, d: [-.35, -.1, -.2][kind] + (stop ? .04 * sin(t * 40) : 0), bow: .4 }], held: [{ hand: 1, svg: lamp }], head: 14 * look + (kind === 2 ? -10 : 0), face: ['awkward', 'k:angry', stop ? 'terrified' : 'awkward'][kind] };
  P.y = Math.max(reachDrop(ch, P), [40, 0, 30][kind]); return { ...P, back: night(c.bx), cam: c.bx + 100 }; };
const lanternF = (kind) => (t0, ch) => { const t = t0, stop = kind === 2 && (t % 3) > 1.6, tt = kind === 2 ? Math.floor(t / 3) * 1.6 + Math.min(t % 3, 1.6) : t, T = [.75, .36, .3][kind];
  const c = steps(tt, { T, lift: [90, 70, 30][kind] }), w = sin(2 * PI * c.stride), sh = stop ? 3 * sin(t * 40) : 0, look = kind === 0 ? sin(t * 1.6) : 0;
  const P = { view: 'front', dir: 1, x: 14 * w + sh, rot: 4 * w, feet: c.feet.map((f, i) => ({ x: [-44, 42][i], lift: f.lift, kneeK: .6 })), hands: [null, { f: .85, d: [-.4, -.1, -.25][kind] + (stop ? .04 * sin(t * 40) : 0), bow: .4 }], held: [{ hand: 1, svg: lamp }], head: 14 * look, face: ['awkward', 'k:angry', stop ? 'terrified' : 'awkward'][kind] };
  P.y = Math.max(reachDrop(ch, P), [40, 0, 30][kind]); return { ...P, back: night(0), cam: 0, toward: tt * [100, 360, 130][kind] }; };
const mkL = (f, fn) => ({ title: `WALK WITH A LANTERN  ·  ${f ? 'front' : 'side'} view`, dur: 6, styles: [
  { key: 'A', name: 'Careful', blurb: 'slow steps on the toes, lantern high, looks about', pose: fn(0) },
  { key: 'B', name: 'Brave march', blurb: 'stomps ahead, jaw set, lantern out', pose: fn(1) },
  { key: 'C', name: 'Spooked', blurb: 'tiny steps, stops dead, the lantern shakes', pose: fn(2) },
] });
export const lantern = mkL(false, lanternS), lanternFront = mkL(true, lanternF);
// ================= POUR OUT A POT =================
const pot = (a, s = 1) => (x, y) => { const r = a * PI / 180, lx = x + s * (95 * cos(r) + 60 * sin(r)), ly = y + (s * 95 * sin(r) * s - 60 * cos(r)); const str = a * s > 35 ? `<path d="M${lx.toFixed(1)},${ly.toFixed(1)} q${s * 40},60 ${s * 30},${(G - ly - 8).toFixed(1)}" fill="none" stroke="#6fb6f2" stroke-width="${Math.min(34, (a * s - 35) * 1.2)}" stroke-linecap="round"/>` : ''; return str + `<g transform="rotate(${a} ${x} ${y})"><path d="M${x - 95},${y - 60} h190 l-18,130 q-77,26 -154,0 Z" fill="#59607a" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/><ellipse cx="${x}" cy="${y - 60}" rx="95" ry="16" fill="#6fb6f2" stroke="${INK}" stroke-width="10"/></g>`; };
const pourP = (v, ch, a, o) => { const f = isF(v); const P = { view: v, dir: 1, x: 0, rot: 0, feet: f ? [{ x: -50 }, { x: 48 }] : [{ x: -30 }, { x: 30 }], hands: f ? [{ lx: 20, ly: 500, bow: .9 }, { lx: 120, ly: 480, bow: .9 }] : [{ f: .62, d: .5, bow: .7 }, { f: .7, d: .45, bow: .7 }], held: [{ hand: 1, svg: pot(a, 1) }], head: 0, face: 'k:standard', ...o }; P.y = Math.max(reachDrop(ch, P), P.dy || 0); return { ...P, cam: 80 }; };
const heave = v => (t0, ch) => { const t = t0 % 3, u = track([[0, 0], [.5, -.4, 'io'], [.8, 1, 'out'], [1.9, 1], [2.5, 0, 'io']], t); return pourP(v, ch, 95 * pos(u) - 20 * pos(-u), { rot: 10 * u, head: 4 * u, face: u > .5 ? 'k:happy' : 'k:standard' }); };
const dribble = v => (t0, ch) => { const t = t0 % 6, u = track([[0, 0], [2.4, .42, 'io'], [4.6, .46], [5.4, 0, 'io']], t); return pourP(v, ch, 95 * u, { rot: 4, dy: 30, head: 12, face: 'awkward' }); };
const heavy = v => (t0, ch) => { const t = t0 % 3, u = track([[0, 0], [1.0, .3, 'io'], [1.3, 1, 'in'], [2.2, 1], [2.8, 0, 'io']], t), sh = 2 * sin(t * 36); return pourP(v, ch, 100 * u, { x: sh + 40 * u, rot: 6 + 22 * u, dy: 40 + 60 * u, feet: isF(v) ? [{ x: -70 }, { x: 80 + 50 * u }] : [{ x: -40 }, { x: 40 + 70 * u }], head: 8 * u, face: 'strain' }); };
const mkP = v => ({ title: `POUR OUT A POT  ·  ${isF(v) ? 'front' : 'side'} view`, dur: 6, styles: [
  { key: 'A', name: 'Heave-ho', blurb: 'swings back, tips the lot, pleased', pose: heave(v) },
  { key: 'B', name: 'Careful dribble', blurb: 'tips a tiny bit, watches every drop', pose: dribble(v) },
  { key: 'C', name: 'Too heavy', blurb: 'the pot wins and pulls it over', pose: heavy(v) },
] });
export const pour = mkP('side'), pourFront = mkP('front');
