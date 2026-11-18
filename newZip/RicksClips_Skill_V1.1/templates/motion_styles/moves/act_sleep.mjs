import { G, track } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI, INK = '#2a1a1f';
const MT = 800;                                    // mattress top
// ---------- SIDE VIEW: bed from the side, head on the pillow at the left ----------
const bedBack = () => `<rect x="-520" y="${MT - 250}" width="60" height="${G - MT + 250}" rx="16" fill="#8a5a2c" stroke="${INK}" stroke-width="12"/><rect x="480" y="${MT - 60}" width="50" height="${G - MT + 60}" rx="14" fill="#8a5a2c" stroke="${INK}" stroke-width="12"/>` +
  `<rect x="-480" y="${MT}" width="980" height="${G - MT - 50}" rx="26" fill="#f3efe6" stroke="${INK}" stroke-width="12"/><rect x="-490" y="${G - 70}" width="1000" height="40" rx="10" fill="#8a5a2c" stroke="${INK}" stroke-width="10"/>` +
  `<ellipse cx="-330" cy="${MT - 26}" rx="170" ry="52" fill="#ffffff" stroke="${INK}" stroke-width="11"/>`;
// blanket: one soft shape over the body; x0 = how far up it is pulled, hump = breathing / knees, kick = a lump that moves
const blanket = ({ x0 = -130, breath = 0, kick = 0, col = '#4f8fe0', foot = 0 }) => {
  const top = MT - 150 - 16 * breath, d = `M${x0},${MT + 10} Q${x0 + 10},${top + 30} ${x0 + 90},${top} Q${150 + 60 * kick},${top - 26 - 70 * Math.abs(kick)} ${330},${top + 30} Q${440},${top + 50} ${470 - 60 * foot},${MT + 10} L${490 - 60 * foot},${MT + 120} L${x0 - 20},${MT + 120} Z`;
  return `<path d="${d}" fill="${col}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><path d="M${x0 + 40},${top + 50} Q${200},${top + 10} ${400},${top + 70}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="10" stroke-linecap="round"/><path d="M${x0 - 14},${MT + 60} L${486 - 60 * foot},${MT + 60}" stroke="#3a6fbe" stroke-width="10"/>`;
};
const lying = o => ({ view: 'side', dir: 1, x: 70, y: (MT - 72) - 620, rot: -80, feet: [{ x: 420, lift: G - 7 - (MT - 40), kneeK: .1, toe: 60 }, { x: 440, lift: G - 7 - (MT - 50), kneeK: .1, toe: 60 }], hands: [{ f: .1, d: .95 }, { f: .15, d: .95 }], back: bedBack(), cam: 0, camY: -420, noShadow: true, ...o });
// A PEACEFUL: slow deep breathing, the blanket rises and falls, little smile
function peace(t) { const b = sin(2 * PI * t / 3.6); return lying({ y: (MT - 72) - 620 - 4 * b, head: 76 + 2 * b, face: 'k:standard', blink: 'closed', front: blanket({ breath: b }) }); }
// B RESTLESS: tosses about, kicks the blanket, one foot pokes out and wiggles, an arm flops out
function restless(t0) { const t = t0 % 6, k = sin(2 * PI * t / 1.3) * (t % 2.6 < 1.3 ? 1 : .2), foot = track([[0, 0], [2.6, 0], [3.0, 1, 'back'], [5.4, 1], [5.8, 0]], t), wig = foot * 20 * sin(t * 14);
  return lying({ rot: -80 + 5 * k, head: 76 + 14 * k, feet: [{ x: 420, lift: G - 7 - (MT - 40), kneeK: .1, toe: 60 }, { x: 440 + 70 * foot, lift: G - 7 - (MT - 60) + wig, kneeK: .1, toe: 70 }],
    hands: [{ f: .1, d: .95 }, foot > .5 ? { f: .9, d: .3 + .1 * sin(t * 3), over: true } : { f: .15, d: .95 }], face: 'k:angry', blink: null, front: blanket({ kick: k, foot }) }); }
// C SCARED OF THE DARK: blanket pulled right up to the eyes, shaking, peeks out, hides again
function scared(t0) { const t = t0 % 5, hide = track([[0, 0], [1.6, 0], [1.75, 1, 'in'], [3.2, 1], [3.6, 0, 'io']], t), sh = 2.5 * sin(t * 45);
  return lying({ x: 70 + sh, head: 76, face: 'terrified', front: blanket({ x0: -300 - 150 * hide, breath: sh * .3 }) }); }
export default { title: 'SLEEP UNDER A BLANKET  ·  side view', dur: 6, styles: [
  { key: 'A', name: 'Peaceful', blurb: 'slow breathing, blanket rises and falls', pose: peace },
  { key: 'B', name: 'Restless', blurb: 'tosses, kicks, a foot pokes out and wiggles', pose: restless },
  { key: 'C', name: 'Scared of the dark', blurb: 'blanket up to the eyes, shakes, hides', pose: scared },
] };
// ---------- FRONT VIEW: looking down the bed from its foot; the head on the pillow faces us ----------
const bedF = () => `<rect x="-470" y="-60" width="940" height="520" rx="40" fill="#8a5a2c" stroke="${INK}" stroke-width="14"/><rect x="-430" y="330" width="860" height="900" rx="30" fill="#f3efe6" stroke="${INK}" stroke-width="12"/><ellipse cx="0" cy="300" rx="300" ry="150" fill="#ffffff" stroke="${INK}" stroke-width="12"/>`;
const blanketF = ({ top = 440, breath = 0, lump = 0, col = '#4f8fe0', fists = 0, feet = 0 }) => {
  const y = top - 14 * breath, d = `M-440,${y + 40} Q-200,${y - 30} 0,${y - 10 - 10 * breath} Q200,${y - 30} 440,${y + 40} L470,1260 L-470,1260 Z`;
  const f = fists ? [-110, 110].map(x => `<circle cx="${x}" cy="${y + 4}" r="34" fill="${INK}"/>`).join('') : '';
  const ft = feet ? [-70, 70].map((x, i) => `<path d="M${x},1010 q${i ? 26 : -26},${-90 - 20 * Math.sin(feet * (i ? 1 : 1.3))} ${i ? 50 : -50},-110" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>`).join('') : '';
  return `<path d="${d}" fill="${col}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/><path d="M${-260 + 200 * lump},${y + 200} q120,${-80 - 60 * Math.abs(lump)} 240,0" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="12" stroke-linecap="round"/><path d="M-440,${y + 110} Q0,${y + 50} 440,${y + 110}" fill="none" stroke="#3a6fbe" stroke-width="12"/>${f}${ft}`;
};
const lyingF = o => ({ view: 'front', dir: 1, x: 0, y: 60, rot: 0, feet: [{ x: -36 }, { x: 34 }], hands: [null, null], back: bedF(), cam: 0, camY: -330, noShadow: true, ...o });
function peaceF(t) { const b = sin(2 * PI * t / 3.6); return lyingF({ head: 4 + 2 * b, face: 'k:standard', blink: 'closed', front: blanketF({ breath: b }) }); }
function restlessF(t0) { const t = t0 % 6, k = sin(2 * PI * t / 1.3) * (t % 2.6 < 1.3 ? 1 : .25), foot = track([[0, 0], [2.6, 0], [3.0, 1], [5.4, 1], [5.8, 0]], t);
  return lyingF({ x: 50 * k, rot: 4 * k, head: 22 * k, face: 'k:angry', hands: [null, foot > .5 ? { f: 1, d: -.1 + .1 * sin(t * 3), over: true } : null], front: blanketF({ lump: k, feet: foot > .5 ? t * 14 : 0 }) }); }
function scaredF(t0) { const t = t0 % 5, hide = track([[0, 0], [1.6, 0], [1.75, 1, 'in'], [3.2, 1], [3.6, 0, 'io']], t), sh = 2.5 * sin(t * 45);
  return lyingF({ x: sh, face: 'terrified', front: blanketF({ top: 250 - 230 * hide, breath: sh * .3, fists: 1 }) }); }
export const front = { title: 'SLEEP UNDER A BLANKET  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Peaceful', blurb: 'slow breathing, blanket rises and falls', pose: peaceF },
  { key: 'B', name: 'Restless', blurb: 'rolls about, arm flops out, feet pop out', pose: restlessF },
  { key: 'C', name: 'Scared of the dark', blurb: 'blanket up to the eyes, fists grip it, hides', pose: scaredF },
] };
