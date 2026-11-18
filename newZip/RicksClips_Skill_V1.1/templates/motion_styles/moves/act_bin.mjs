// HEADFIRST IN A BIN (seen in Rick's clips: headfirst in a bin, legs up). The bin is tall enough to hold the whole body; nothing is squashed.
import { G, track } from '../rig.mjs';
const sin = Math.sin, INK = '#2a1a1f', isF = v => v === 'front', pos = v => Math.max(0, v);
const BT = 520, HIP = 350;
const bin = () => `<path d="M-210,${BT} L-180,${G} L180,${G} L210,${BT} Z" fill="#4f8f6a" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/><path d="M-110,${BT + 60} L-96,${G - 40} M0,${BT + 60} L0,${G - 40} M110,${BT + 60} L96,${G - 40}" stroke="${INK}" stroke-opacity=".35" stroke-width="12" stroke-linecap="round"/><rect x="-232" y="${BT - 22}" width="464" height="44" rx="16" fill="#5fa67c" stroke="${INK}" stroke-width="14"/>`;
const up = (v, o) => ({ view: v, dir: 1, x: 0, y: HIP - 620, rot: 180, hands: [{ f: .1, d: .9 }, { f: .1, d: .9 }], head: 0, face: 'k:standard', front: bin(), cam: 0, noShadow: true, ...o });
const top = G - (HIP - 330);   // foot lift that puts the feet straight above the hips
const kick = v => (t, ch) => { const k = sin(t * 15), f = isF(v); return up(v, { x: 6 * sin(t * 30), feet: [{ x: (f ? -70 : -40) - 90 * k, lift: top - 60 * Math.abs(k), kneeK: .6 }, { x: (f ? 70 : 40) + 90 * k, lift: top - 60 * Math.abs(k), kneeK: .6 }] }); };
const gaveUp = v => (t0, ch) => { const t = t0 % 3, tw = t > 2.2 && t < 2.5 ? sin(t * 40) : 0, f = isF(v); return up(v, { feet: [{ x: -240, lift: G - BT - 40 + 30 * tw, kneeK: 1 }, { x: 240, lift: G - BT - 60, kneeK: 1 }] }); };
const pedal = v => (t, ch) => { const a = t * 4, f = isF(v); return up(v, { feet: [{ x: (f ? -60 : 0) + 90 * Math.cos(a), lift: top - 110 + 90 * sin(a), kneeK: .8 }, { x: (f ? 60 : 0) - 90 * Math.cos(a), lift: top - 110 - 90 * sin(a), kneeK: .8 }] }); };
const mk = v => ({ title: `HEADFIRST IN A BIN  ·  ${isF(v) ? 'front' : 'side'} view`, dur: 6, styles: [
  { key: 'A', name: 'Panic kick', blurb: 'legs scissor like mad, the bin rattles', pose: kick(v) },
  { key: 'B', name: 'Gave up', blurb: 'legs flop over the rim, one sad twitch', pose: gaveUp(v) },
  { key: 'C', name: 'Slow pedal', blurb: 'pedals the air calmly, going nowhere', pose: pedal(v) },
] });
export default mk('side'); export const front = mk('front');
