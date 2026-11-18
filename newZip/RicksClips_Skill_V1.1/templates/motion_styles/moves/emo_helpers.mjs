// shared bits for the EMOTION moves: a chair, seated legs, standing feet
import { G, cycle, reachDrop } from '../rig.mjs';
export const SEAT_TOP = 822, SEAT_Y = SEAT_TOP - 640 + 8, SEAT_X = -50;
export const F0 = 112, F1 = 152;            // seated feet marks (side view, facing right)
// side-view chair: seat under the bottom, backrest behind the back (drawn behind the character)
export const chair = (x0 = -175, x1 = 60) => {
  const top = SEAT_TOP, ink = '#2a1a1f', wood = '#3f7fd6', woodD = '#2f63ad';
  return `<rect x="${x0 - 14}" y="${top - 300}" width="30" height="${G - top + 300}" rx="12" fill="${woodD}" stroke="${ink}" stroke-width="10"/>` +
    `<rect x="${x0 - 30}" y="${top - 320}" width="60" height="140" rx="22" fill="${wood}" stroke="${ink}" stroke-width="10"/>` +
    `<rect x="${x1 - 26}" y="${top}" width="26" height="${G - top}" rx="10" fill="${woodD}" stroke="${ink}" stroke-width="10"/>` +
    `<rect x="${x0 - 20}" y="${top - 6}" width="${x1 - x0 + 30}" height="34" rx="14" fill="${wood}" stroke="${ink}" stroke-width="10"/>`;
};
export const seatedFeet = (extra = [{}, {}]) => [{ x: F0, thigh: 6, mix: 1, ...extra[0] }, { x: F1, thigh: 2, mix: 1, ...extra[1] }];
export const seated = o => ({ view: 'side', dir: 1, x: SEAT_X, y: SEAT_Y, rot: 0, back: chair(), feet: seatedFeet(), cam: 0, camY: -200, ...o });
export const standFront = [{ x: -36 }, { x: 34 }];
export const standSide = [{ x: -18 }, { x: 18 }];
// standing pose with planted feet, body lowered just enough to reach them
export function stand(ch, P) { P.y = Math.max(P.y || 0, reachDrop(ch, P)); return P; }
export { cycle };
