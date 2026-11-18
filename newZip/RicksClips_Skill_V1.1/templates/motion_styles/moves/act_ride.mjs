// RIDES (seen in Rick's clips): steer a ship's wheel, drive a car, ride a horse. Hands END ON the wheel or the reins.
import { G, track } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f', pos = v => Math.max(0, v), D = PI / 180;
// ================= SHIP'S WHEEL =================
const WY = 500, WR = 150;
const wheelB = a => { let sp = ''; for (let k = 0; k < 8; k++) { const b = a * D + k * PI / 4; sp += `M0,${WY} L${((WR + 46) * cos(b)).toFixed(1)},${(WY + (WR + 46) * sin(b)).toFixed(1)} `; }
  return `<rect x="-26" y="${WY}" width="52" height="${G - WY}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/><path d="${sp}" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="${sp}" stroke="#a8683a" stroke-width="10" stroke-linecap="round"/><circle cx="0" cy="${WY}" r="${WR}" fill="none" stroke="${INK}" stroke-width="34"/><circle cx="0" cy="${WY}" r="${WR}" fill="none" stroke="#a8683a" stroke-width="18"/><circle cx="0" cy="${WY}" r="30" fill="#e2b13c" stroke="${INK}" stroke-width="10"/>`; };
const wheelS = (x, a) => { let sp = ''; for (let k = 0; k < 4; k++) { const b = a * D + k * PI / 4, y = (WR + 46) * sin(b); sp += `M${x},${WY - y} L${x},${WY + y} `; }
  return `<rect x="${x + 10}" y="${WY}" width="44" height="${G - WY}" fill="#7a4a2a" stroke="${INK}" stroke-width="12"/><path d="${sp}" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="${sp}" stroke="#a8683a" stroke-width="10" stroke-linecap="round"/><ellipse cx="${x}" cy="${WY}" rx="20" ry="${WR}" fill="#a8683a" stroke="${INK}" stroke-width="12"/>`; };
const sea = t => `<path d="M-900,330 ${[...Array(13)].map((_, k) => `q75,${k % 2 ? 40 : -40} 150,0`).join(' ')} V700 H-900 Z" fill="#3f7fd6" opacity=".55" transform="translate(${-((t * 60) % 300)},${12 * sin(t * 2)})"/>`;
const helm = (v, t, a, o) => { const b = v === 'back'; const P = { view: v, dir: 1, x: b ? 0 : -150, y: 0, rot: 0, feet: b ? [{ x: -60 }, { x: 58 }] : [{ x: -180 }, { x: -110 }], hands: b ? [{ wx: -WR * cos(a * D), wy: WY - WR * sin(a * D), bow: .6 }, { wx: WR * cos(a * D), wy: WY + WR * sin(a * D), bow: .6 }] : [{ wx: 20, wy: WY - 110 * cos(a * D), bow: .5 }, { wx: 20, wy: WY + 100 * cos(a * D) - 40, bow: .5 }], back: (b ? wheelB(a) : wheelS(40, a)), cam: b ? 0 : -40, ...o }; return P; };
const captain = v => (t, ch) => { const a = 14 * sin(t * 1.4); return helm(v, t, a, { rot: v === 'back' ? a * .25 : 4, head: a * .3, face: 'k:smirk' }); };
const storm = v => (t, ch) => { const a = 55 * sin(t * 6), sw = sin(t * 3); return helm(v, t, a, { x: (v === 'back' ? 0 : -150) + (v === 'back' ? 0 : 14 * sw), rot: v === 'back' ? 10 * sw : 8 + 8 * sw, feet: v === 'back' ? [{ x: -110 }, { x: 108 }] : [{ x: -220 }, { x: -90 }], y: 40, head: 8 * sw, face: 'terrified' }); };
const dozy = v => (t0, ch) => { const t = t0 % 6, s = track([[0, 0], [3.4, 1, 'io'], [3.5, 0, 'out'], [6, 0]], t), a = 30 * s; return helm(v, t, a, { rot: v === 'back' ? 8 * s : 14 * s, head: 16 * s, face: t > 3.5 && t < 4.6 ? 'awkward' : 'k:standard', blink: s > .6 ? 'closed' : s > .2 ? 'half' : null }); };
const mkW = v => ({ title: `STEER A SHIP'S WHEEL  ·  ${v === 'back' ? 'back' : 'side'} view`, dur: 6, styles: [
  { key: 'A', name: 'The captain', blurb: 'small sure turns, chin up', pose: captain(v) },
  { key: 'B', name: 'Storm', blurb: 'wheel thrown both ways, feet wide, terrified', pose: storm(v) },
  { key: 'C', name: 'Nodding off', blurb: 'drifts off, the wheel drifts with it, jolts awake', pose: dozy(v) },
] });
export default mkW('side'); export const front = mkW('back');
// ================= DRIVE A CAR =================
const tyre = (cx, ang, r = 96) => { const sp = [0, 1, 2].map(k => { const a = ang + k * PI / 3; return `M${(cx - r * cos(a)).toFixed(1)},${(G - r - r * sin(a)).toFixed(1)} L${(cx + r * cos(a)).toFixed(1)},${(G - r + r * sin(a)).toFixed(1)}`; }).join(' '); return `<circle cx="${cx}" cy="${G - r}" r="${r - 10}" fill="#3a3540" stroke="${INK}" stroke-width="20"/><path d="${sp}" stroke="#8d8896" stroke-width="8"/><circle cx="${cx}" cy="${G - r}" r="24" fill="#d9dde6" stroke="${INK}" stroke-width="8"/>`; };
const DL = 650;   // door line: the car body hides everything below it
const carBack = (bx, by) => `<path d="M${bx - 250},${DL + by} L${bx - 200},${DL - 470 + by} L${bx + 150},${DL - 470 + by} L${bx + 260},${DL + by}" fill="none" stroke="${INK}" stroke-width="34" stroke-linejoin="round"/><path d="M${bx - 250},${DL + by} L${bx - 200},${DL - 470 + by} L${bx + 150},${DL - 470 + by} L${bx + 260},${DL + by}" fill="none" stroke="#e8443a" stroke-width="18" stroke-linejoin="round"/>`;
const carFront = (bx, by, ang) => `<path d="M${bx - 420},${DL + by} H${bx + 300} Q${bx + 470},${DL + 10 + by} ${bx + 480},${DL + 150 + by} V${G - 110 + by} H${bx - 440} V${DL + 40 + by} Z" fill="#e8443a" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/><circle cx="${bx + 440}" cy="${DL + 130 + by}" r="26" fill="#fff6c2" stroke="${INK}" stroke-width="10"/><path d="M${bx - 60},${DL + 40 + by} V${G - 150 + by}" stroke="${INK}" stroke-opacity=".5" stroke-width="10"/>` + tyre(bx - 270, ang) + tyre(bx + 300, ang);
const swh = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="60" fill="#3a3540" stroke="${INK}" stroke-width="12" transform="rotate(-20 ${x} ${y})"/>`;
const car = (t, { speed, bump = 0, o }) => { const bx = speed * t, by = bump * sin(t * 19), ang = bx / 96; return { view: 'side', dir: 1, x: bx - 60, y: 170 + by, rot: 0, feet: [{ x: bx + 90, lift: 215, kneeK: .2 }, { x: bx + 110, lift: 215, kneeK: .2 }], back: carBack(bx, by), front: carFront(bx, by, ang) + swh(bx + 130, 590 + by), cam: bx + 40, shadowW: 5, ...o(bx, by) }; };
const sunday = t => car(t, { speed: 260, bump: 3, o: (bx, by) => ({ rot: -8, hands: [{ wx: bx + 118, wy: 560 + by, bow: .5 }, { f: -.2, d: .55, bow: 1 }], head: 4 * sin(t * 2), face: 'k:smirk' }) });
const rage = t => car(t, { speed: 620, bump: 6, o: (bx, by) => { const hk = pos(sin(t * 16)); return { rot: 14, hands: [{ wx: bx + 118, wy: 560 + by, bow: .5 }, { wx: bx + 124, wy: 600 + by - 70 * hk, bow: .6 }], head: 3 * sin(t * 30), face: Math.floor(t * 6) % 2 ? 'scream' : 'k:angry' }; } });
const learner = t => car(t, { speed: 150 + 60 * Math.sign(sin(t * 5)), bump: 4, o: (bx, by) => ({ rot: 6 + 6 * Math.sign(sin(t * 5)), hands: [{ wx: bx + 114, wy: 548 + by, bow: .7 }, { wx: bx + 122, wy: 610 + by, bow: .7 }], head: 2 * sin(t * 36), face: 'terrified' }) });
export const drive = { title: 'DRIVE A CAR  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Sunday driver', blurb: 'leans back, one hand on the wheel, no hurry', pose: sunday },
  { key: 'B', name: 'Road rage', blurb: 'nose on the wheel, hammering the horn, shouting', pose: rage },
  { key: 'C', name: 'Learner', blurb: 'both hands tight, jerks forward and stops', pose: learner },
] };
// front: the bonnet is in front, the driver is seen over it through the windscreen
const carF = by => `<path d="M-330,${DL + by} H330 Q390,${DL + 30 + by} 400,${DL + 120 + by} V${G - 80 + by} H-400 V${DL + 120 + by} Q-390,${DL + 30 + by} -330,${DL + by} Z" fill="#e8443a" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/><rect x="-150" y="${DL + 150 + by}" width="300" height="80" rx="20" fill="#3a3540" stroke="${INK}" stroke-width="10"/><circle cx="-290" cy="${DL + 150 + by}" r="46" fill="#fff6c2" stroke="${INK}" stroke-width="12"/><circle cx="290" cy="${DL + 150 + by}" r="46" fill="#fff6c2" stroke="${INK}" stroke-width="12"/><rect x="-420" y="${G - 110}" width="120" height="110" rx="20" fill="#3a3540" stroke="${INK}" stroke-width="12"/><rect x="300" y="${G - 110}" width="120" height="110" rx="20" fill="#3a3540" stroke="${INK}" stroke-width="12"/>`;
const roofF = by => `<path d="M-330,${DL + by} L-280,${DL - 470 + by} H280 L330,${DL + by}" fill="#bfe6ff" fill-opacity=".25" stroke="${INK}" stroke-width="34" stroke-linejoin="round"/><path d="M-330,${DL + by} L-280,${DL - 470 + by} H280 L330,${DL + by}" fill="none" stroke="#e8443a" stroke-width="18" stroke-linejoin="round"/>`;
const swF = (by, a) => `<g transform="rotate(${a} 0 ${DL - 30 + by})"><circle cx="0" cy="${DL - 30 + by}" r="92" fill="none" stroke="${INK}" stroke-width="30"/><circle cx="0" cy="${DL - 30 + by}" r="92" fill="none" stroke="#3a3540" stroke-width="16"/><path d="M-92,${DL - 30 + by} H92" stroke="#3a3540" stroke-width="14"/></g>`;
const carFr = (t, speed, bump, a, o) => { const by = bump * sin(t * 19), r = a * D; return { view: 'front', dir: 1, x: 0, y: 170 + by, rot: 0, feet: [{ x: -60, lift: 215, kneeK: .2 }, { x: 58, lift: 215, kneeK: .2 }], hands: [{ wx: -92 * cos(r), wy: DL - 30 + by - 92 * sin(r), bow: .8 }, { wx: 92 * cos(r), wy: DL - 30 + by + 92 * sin(r), bow: .8 }], back: roofF(by), front: swF(by, a) + carF(by), cam: 0, toward: t * speed, shadowW: 6, ...o }; };
const sundayF = t => carFr(t, 260, 3, 8 * sin(t * 1.5), { rot: -5, head: 4 * sin(t * 2), face: 'k:smirk' });
const rageF = t => carFr(t, 620, 6, 14 * sin(t * 9), { head: 3 * sin(t * 30), face: Math.floor(t * 6) % 2 ? 'scream' : 'k:angry' });
const learnerF = t => carFr(t, 150, 4, 26 * Math.sign(sin(t * 5)), { head: 2 * sin(t * 36), face: 'terrified' });
export const driveFront = { title: 'DRIVE A CAR  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Sunday driver', blurb: 'leans back, no hurry', pose: sundayF },
  { key: 'B', name: 'Road rage', blurb: 'yanks the wheel, shouting', pose: rageF },
  { key: 'C', name: 'Learner', blurb: 'both hands tight, jerks left and right', pose: learnerF },
] };
// ================= RIDE A HORSE =================
const HB = 600;  // horse back height (the rider's bottom sits here)
const horse = (bx, by, ph, col = '#b9793f') => { const leg = (x, a, far) => { const kx = x + 60 * sin(a), ky = HB + 190 + by, fx = x + 150 * sin(a) * .9, fy = G - 6 - 60 * pos(cos(a)); return `<path d="M${x},${HB + 60 + by} L${kx.toFixed(1)},${ky} L${fx.toFixed(1)},${fy.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/><path d="M${x},${HB + 60 + by} L${kx.toFixed(1)},${ky} L${fx.toFixed(1)},${fy.toFixed(1)}" fill="none" stroke="${far ? '#8f5a2c' : col}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`; };
  const hx = bx + 300, hy = HB - 150 + by - 10 * sin(ph);
  return leg(bx - 190, ph + 2, 1) + leg(bx + 170, ph + 3.6, 1) + `<path d="M${bx - 250},${HB + 30 + by} q-90,40 -80,${170 + 30 * sin(ph)}" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/>` +
    `<path d="M${bx + 170},${HB + 20 + by} L${hx - 40},${hy + 20} L${hx + 40},${hy + 60} L${bx + 250},${HB + 130 + by} Z" fill="${col}" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>` +
    `<ellipse cx="${bx}" cy="${HB + 90 + by}" rx="270" ry="105" fill="${col}" stroke="${INK}" stroke-width="14"/>` +
    `<path d="M${hx - 60},${hy - 30} L${hx + 150},${hy + 50} Q${hx + 190},${hy + 110} ${hx + 130},${hy + 130} L${hx - 40},${hy + 80} Z" fill="${col}" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/><path d="M${hx - 50},${hy - 26} l-10,-60 l50,40" fill="${col}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><circle cx="${hx + 40}" cy="${hy + 40}" r="13" fill="${INK}"/><circle cx="${hx + 44}" cy="${hy + 36}" r="4" fill="#fff"/>` +
    leg(bx - 150, ph, 0) + leg(bx + 210, ph + 1.6, 0); };
const rideH = (t, { speed, T, bob, o }) => { const bx = speed * t, ph = 2 * PI * t / T, by = -bob * Math.abs(sin(ph)); const base = { view: 'side', dir: 1, x: bx - 20, y: HB - 20 + by - 620, rot: 0, feet: [{ x: bx + 20, lift: G - (HB + 290 + by), kneeK: .5 }, { x: bx + 40, lift: G - (HB + 290 + by), kneeK: .5 }], back: horse(bx, by * .6, ph), cam: bx + 80, camY: -420, shadowW: 6 }; return { ...base, ...o(bx, by, ph) }; };
const trot = t => rideH(t, { speed: 260, T: .5, bob: 34, o: (bx, by) => ({ rot: -4, hands: [{ wx: bx + 150, wy: HB - 40 + by, bow: .6 }, { wx: bx + 160, wy: HB - 30 + by, bow: .6 }], head: 5 * sin(t * 12), face: 'k:smirk' }) });
const gallop = t => rideH(t, { speed: 760, T: .3, bob: 50, o: (bx, by) => ({ rot: 44, x: bx - 60, hands: [{ wx: bx + 150, wy: HB + 20 + by, bow: .4 }, { wx: bx + 190, wy: HB + 40 + by, bow: .4 }], head: -20, face: 'terrified' }) });
const backwards = t => rideH(t, { speed: 110, T: .9, bob: 12, o: (bx, by) => ({ dir: -1, x: bx - 10, hands: [{ f: .2, d: .8 }, { f: .25, d: .85 }], head: 10 * sin(t * 1.5), face: 'awkward' }) });
export const horseSide = { title: 'RIDE A HORSE  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Proud trot', blurb: 'bounces in the saddle, nose in the air', pose: trot },
  { key: 'B', name: 'Hanging on', blurb: 'flat out, hugging the neck, terrified', pose: gallop },
  { key: 'C', name: 'Wrong way round', blurb: 'sits backwards, looks for the head', pose: backwards },
] };
// front: the horse's head and chest are in front, the rider is seen above them
const horseF = (by, nod, col = '#b9793f') => `<rect x="-190" y="${HB + 40 + by}" width="380" height="330" rx="150" fill="${col}" stroke="${INK}" stroke-width="14"/><path d="M-120,${G - 120} V${G - 8} M120,${G - 120} V${G - 8}" stroke="${INK}" stroke-width="40" stroke-linecap="round"/><path d="M-120,${G - 120} V${G - 12} M120,${G - 120} V${G - 12}" stroke="${col}" stroke-width="22" stroke-linecap="round"/><g transform="translate(0,${nod})"><path d="M-90,${HB - 150 + by} l-30,-70 l70,40 M90,${HB - 150 + by} l30,-70 l-70,40" fill="${col}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><path d="M-100,${HB - 160 + by} H100 L80,${HB + 150 + by} Q0,${HB + 220 + by} -80,${HB + 150 + by} Z" fill="${col}" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/><circle cx="-56" cy="${HB - 70 + by}" r="15" fill="${INK}"/><circle cx="56" cy="${HB - 70 + by}" r="15" fill="${INK}"/><ellipse cx="-30" cy="${HB + 130 + by}" rx="10" ry="16" fill="${INK}"/><ellipse cx="30" cy="${HB + 130 + by}" rx="10" ry="16" fill="${INK}"/></g>`;
const rideHF = (t, T, bob, speed, o) => { const ph = 2 * PI * t / T, by = -bob * Math.abs(sin(ph)); return { view: 'front', dir: 1, x: 0, y: HB - 130 + by - 620, rot: 0, feet: [{ x: -215, lift: G - (HB + 200 + by), kneeK: .3 }, { x: 215, lift: G - (HB + 200 + by), kneeK: .3 }], hands: [{ lx: -30, ly: 560 }, { lx: 30, ly: 560 }], front: horseF(by * .6, 14 * sin(ph)), cam: 0, camY: -420, toward: t * speed, shadowW: 6, ...o }; };
const trotF = t => rideHF(t, .5, 34, 260, { head: 5 * sin(t * 12), face: 'k:smirk' });
const gallopF = t => rideHF(t, .3, 50, 760, { rot: 6 * sin(t * 10), hands: [{ f: .7, d: -.3 + .2 * sin(t * 20), bow: .4 }, { f: .7, d: -.3 - .2 * sin(t * 20), bow: .4 }], head: 4 * sin(t * 20), face: 'terrified' });
const backF = t => rideHF(t, .9, 12, 110, { view: 'back', head: 10 * sin(t * 1.5), hands: [null, null] });
export const horseFront = { title: 'RIDE A HORSE  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Proud trot', blurb: 'bounces in the saddle, nose in the air', pose: trotF },
  { key: 'B', name: 'Hanging on', blurb: 'arms in the air, terrified', pose: gallopF },
  { key: 'C', name: 'Wrong way round', blurb: 'sits backwards, we see the back of the head', pose: backF },
] };
