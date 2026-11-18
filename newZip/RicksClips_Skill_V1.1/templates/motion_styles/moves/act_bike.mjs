import { G, track } from '../rig.mjs';
const sin = Math.sin, cos = Math.cos, PI = Math.PI;
const INK = '#2a1a1f', R = 112, WB = 190;          // wheel radius, half wheelbase
// a simple ink bike; wheels really turn (spokes) with the distance travelled
function bike(bx, by, ang, col = '#e8443a') {
  const wheel = cx => { const sp = [0, 1, 2, 3].map(k => { const a = ang + k * PI / 4; return `M${(cx - R * cos(a)).toFixed(1)},${(G - R - R * sin(a)).toFixed(1)} L${(cx + R * cos(a)).toFixed(1)},${(G - R + R * sin(a)).toFixed(1)}`; }).join(' ');
    return `<circle cx="${cx}" cy="${G - R}" r="${R - 8}" fill="none" stroke="${INK}" stroke-width="18"/><circle cx="${cx}" cy="${G - R}" r="${R - 8}" fill="none" stroke="#5a5560" stroke-width="7"/><path d="${sp}" stroke="${INK}" stroke-width="4"/><circle cx="${cx}" cy="${G - R}" r="12" fill="${INK}"/>`; };
  const hubY = G - R, c = [bx + 10, hubY + 10], seat = [bx - 55, hubY - 215 + by], bar = [bx + 150, hubY - 290 + by];
  const fr = `M${bx - WB},${hubY} L${c[0]},${c[1]} L${seat[0] + 12},${seat[1] + 30} L${bx - WB},${hubY} M${seat[0] + 12},${seat[1] + 30} L${bx + 120},${hubY - 190 + by} L${c[0]},${c[1]} M${bx + WB},${hubY} L${bar[0] - 10},${bar[1] + 20}`;
  return wheel(bx - WB) + wheel(bx + WB) + `<path d="${fr}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="${fr}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M${seat[0] - 30},${seat[1] + 22} L${seat[0] + 55},${seat[1] + 22}" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>` +
    `<path d="M${bar[0] - 12},${bar[1] + 20} L${bar[0] + 22},${bar[1]} L${bar[0] - 20},${bar[1] - 6}" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// rider: bottom on the saddle, hands on the bar, feet go round with the pedals (so the knees pump for real)
function ride(t, { speed, lean, bob = 0, wob = 0, face, head = 0, stand = 0, surge = 0, blink = null }) {
  const dist = speed * (t + surge * sin(2 * PI * t / .8) * .12), bx = dist, ang = dist / R, crank = dist / 150;
  const hubY = G - R, c = [bx + 10, hubY + 10], pr = 58, by = bob * Math.abs(sin(crank)) + wob * sin(t * 23);
  const feet = [0, 1].map(i => { const a = crank + i * PI, px = c[0] + pr * cos(a), py = c[1] + pr * sin(a); return { x: px - 18, lift: G - 7 - py + 10, toe: 0 }; });
  const hipY = hubY - 225 + by - 70 * stand;                 // stand = up off the saddle on the pedals
  return { view: 'side', dir: 1, x: bx - 40 + 30 * stand, y: hipY - 620, rot: lean + wob * 1.2 * sin(t * 17) + 5 * stand * sin(crank), feet,
    hands: [{ wx: bx + 140, wy: hubY - 292 + by }, { wx: bx + 150, wy: hubY - 290 + by }], head: head + wob * sin(t * 13), face, blink,
    back: bike(bx, by * .3, ang), cam: bx + 60, shadowW: 3 };
}
// A HAPPY CRUISE: steady pedalling, head bobbing, big grin
const cruise = t => ride(t, { speed: 420, lean: 16, bob: 6, face: 'k:happy', head: -10 + 4 * sin(t * 6) });
// B PANIC WOBBLE: far too fast, the whole bike shakes, eyes wide, screaming
const panic = t => ride(t, { speed: 900, lean: 10, wob: 5, face: 'terrified', head: -16 });
// C DEAD-TIRED UPHILL: standing on the pedals, each push is a fight, head hanging, about to give up
const tired = t => ride(t, { speed: 130, lean: 26, stand: 1, surge: 1, face: 'strain', head: 6 });
export default { title: 'RIDE A BIKE  ·  by feeling', dur: 6, styles: [
  { key: 'A', name: 'Happy cruise', blurb: 'steady pedalling, head bobs, big grin', pose: cruise },
  { key: 'B', name: 'Panic wobble', blurb: 'too fast, the bike shakes, terrified', pose: panic },
  { key: 'C', name: 'Dead-tired uphill', blurb: 'stands on the pedals, every push a fight', pose: tired },
] };
// ---------- FRONT VIEW: the bike comes straight at the camera; knees pump out to the sides ----------
const BARY = G - R - 290, bikeF = (by, steer = 0, col = '#e8443a') => `<g transform="rotate(${steer},0,${G})"><rect x="-17" y="${G - 2 * R}" width="34" height="${2 * R}" rx="17" fill="#5a5560" stroke="${INK}" stroke-width="12"/><path d="M-30,${G - R} L-30,${BARY + 40 + by} L30,${BARY + 40 + by} L30,${G - R}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M-30,${G - R} L-30,${BARY + 40 + by} L30,${BARY + 40 + by} L30,${G - R}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M0,${BARY + 40 + by} L0,${BARY + by} M-150,${BARY + by} L150,${BARY + by}" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/></g>`;
function rideF(t, { speed, bob = 0, wob = 0, face, head = 0, stand = 0, sway = 0, blink = null }) {
  const crank = speed * t / 150, by = bob * Math.abs(sin(crank)) + wob * sin(t * 23), sw = sway * sin(crank), steer = wob * .8 * sin(t * 17) + sw * .4;
  const feet = [0, 1].map(i => { const a = crank + i * PI; return { x: (i ? 58 : -60) + sw * 3, lift: 110 + 58 * sin(a), kneeK: 1, toe: 0 }; });
  const hipY = G - R - 225 + by - 70 * stand, x = sw * 5;
  return { view: 'front', dir: 1, x, y: hipY - 620, rot: steer + sw, feet, hands: [{ wx: -128 + x * .3, wy: BARY + by - 4 }, { wx: 128 + x * .3, wy: BARY + by - 4 }], head: head - sw * .6 + wob * sin(t * 13), face, blink,
    back: bikeF(by, steer * .6), cam: 0, camY: -260, toward: speed * t * .8, shadowW: 1.4 };
}
const cruiseF = t => rideF(t, { speed: 420, bob: 6, face: 'k:happy', head: 4 * sin(t * 6) });
const panicF = t => rideF(t, { speed: 900, wob: 5, face: 'terrified' });
const tiredF = t => rideF(t, { speed: 130, stand: 1, sway: 9, face: 'strain', head: 6 });
export const front = { title: 'RIDE A BIKE  ·  front view', dur: 6, styles: [
  { key: 'A', name: 'Happy cruise', blurb: 'steady pedalling, head bobs, big grin', pose: cruiseF },
  { key: 'B', name: 'Panic wobble', blurb: 'too fast, the bike shakes, terrified', pose: panicF },
  { key: 'C', name: 'Dead-tired uphill', blurb: 'stands on the pedals, heaves side to side', pose: tiredF },
] };
