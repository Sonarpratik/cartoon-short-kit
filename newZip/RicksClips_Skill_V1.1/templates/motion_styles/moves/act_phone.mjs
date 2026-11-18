// ON THE PHONE (seen in Rick's clips: phone held to the ear). The phone is drawn AT the hand.
import { track, reachDrop, blinkAt } from '../rig.mjs';
const sin = Math.sin, INK = '#2a1a1f', pos = v => Math.max(0, v);
const phone = a => (x, y) => `<g transform="rotate(${a.toFixed(1)} ${x} ${y})"><rect x="${x - 26}" y="${y - 70}" width="52" height="104" rx="12" fill="#2b3350" stroke="${INK}" stroke-width="11"/><rect x="${x - 15}" y="${y - 56}" width="30" height="64" rx="4" fill="#7fd6ff"/></g>`;
const talk = t => (Math.floor(t * 7) % 2 ? 'k:open' : 'k:smirk');
const F = v => v === 'front';
// A SMOOTH TALKER: leans back, phone at the ear, free hand waves the story along
const smooth = v => (t, ch) => { const w = sin(t * 3), f = F(v);
  const P = { view: v, dir: 1, x: 0, rot: f ? 4 * w : -8 + 2 * w, feet: f ? [{ x: -50 }, { x: 44 }] : [{ x: -26 }, { x: 30 }], hands: f ? [{ f: .75, d: .1 + .25 * w, bow: .6 }, { lx: 138, ly: 262, bow: .9, over: true }] : [{ f: .7, d: .1 + .25 * w, bow: .6 }, { f: .12, d: -.6, bow: 1, over: true }], held: [{ hand: 1, svg: phone(f ? 12 : -8) }], head: f ? 6 : -4, face: talk(t) };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
// B GETTING YELLED AT: holds the phone at arm's length, leans away, flinches at every shout
const yelled = v => (t, ch) => { const k = (t * 2.2) % 1, fl = k < .2 ? 1 - k / .2 : 0, f = F(v);
  const P = { view: v, dir: 1, x: -8 * fl, rot: f ? -8 - 4 * fl : -12 - 5 * fl, feet: f ? [{ x: -60 }, { x: 30 }] : [{ x: -50 }, { x: 10 }], hands: f ? [{ f: .3, d: .7, bow: 1 }, { f: .98, d: -.05 - .05 * fl, bow: .15 }] : [{ f: -.3, d: .6, bow: .9 }, { f: .98, d: -.1 - .05 * fl, bow: .15 }], held: [{ hand: 1, svg: phone(6 * sin(t * 50) * (fl > 0 ? 1 : 0)) }], head: f ? -12 - 6 * fl : -10 - 6 * fl, face: fl > .2 ? 'terrified' : 'awkward' };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
// C SHOUTS INTO IT: holds it flat in front of the mouth like a walkie-talkie, screams, stamps
const shout = v => (t, ch) => { const st = sin(t * 11), j = sin(t * 40), f = F(v);
  const P = { view: v, dir: 1, x: 2 * j, rot: f ? 0 : 12, feet: f ? [{ x: -50, lift: 40 * pos(st) }, { x: 46, lift: 40 * pos(-st) }] : [{ x: -30, lift: 40 * pos(st) }, { x: 30, lift: 40 * pos(-st) }], hands: f ? [{ f: .5, d: .6, bow: 1 }, { lx: 90, ly: 345, bow: .9, over: true }] : [{ f: -.5, d: .5, bow: .7 }, { f: .72, d: -.32, bow: .7, over: true }], held: [{ hand: 1, svg: phone(f ? 70 : -70) }], head: 3 * j, face: 'scream' };
  P.y = reachDrop(ch, P); return { ...P, cam: 0 }; };
const mk = (v, label) => ({ title: `ON THE PHONE  ·  ${label}`, dur: 6, styles: [
  { key: 'A', name: 'Smooth talker', blurb: 'leans back, chats, free hand tells the story', pose: smooth(v) },
  { key: 'B', name: 'Getting yelled at', blurb: 'phone at arm\'s length, flinches at every shout', pose: yelled(v) },
  { key: 'C', name: 'Shouts into it', blurb: 'phone at the mouth, screams, stamps', pose: shout(v) },
] });
export default mk('side', 'side view');
export const front = mk('front', 'front view');
