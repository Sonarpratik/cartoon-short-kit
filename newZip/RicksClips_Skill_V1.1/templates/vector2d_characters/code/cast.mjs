import { INK, headPts } from './char2d.mjs';
const GOLD = '#e2b13c', NAVY = '#26356a', GREY = '#b9b6bf';
// stationmaster(x, view = 'front'|'34'|'side'|'back', dir = 1|-1). Old numeric 2nd arg still works as a turn value.
export const stationmaster = (x = 300, view = 'front', dir = 1, expr = 'standard') => {
  const S = typeof view === 'number' ? { turn: view, view: view > .8 ? 'side' : view ? '34' : 'front' } : { view };
  return {
    x, dir, ...S, legs: '#1f2440', coat: NAVY, wTop: 72, wBot: 106, bodyBot: 640, ground: 1010, dy: 150,
    head: 'rick', face: expr === 'standard' ? { expr, mouth: 'none' } : expr, eyeY: 8, mouthY: 56, memeDy: 18,   // mouth shows under the moustache
    arms: ({ cx, view, dir }) => {
      if (view === 'side') return { front: { d: `M${cx + dir * 8},392 Q${cx + dir * 30},480 ${cx + dir * 14},572`, hand: [cx + dir * 13, 578] } };
      if (view === 'back') return { front: [{ d: `M${cx - 60},385 Q${cx - 132},470 ${cx - 122},572`, hand: [cx - 121, 578] }, { d: `M${cx + 60},385 Q${cx + 132},470 ${cx + 122},572`, hand: [cx + 121, 578] }] };
      return { front: { d: `M${cx - 60},385 Q${cx - 132},470 ${cx - 122},572`, hand: [cx - 121, 578] } };
    },
    details: ({ cx, view, dir, bodyTop, bodyBot, defs, path, clothGrad, shade, THIN, side }) => {
      const o = [], y0 = bodyTop, btn = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${GOLD}" stroke="${INK}" stroke-width="3"/><circle cx="${x - 2}" cy="${y - 2}" r="${r * .33}" fill="#fff6d0"/>`;
      const hem = `<path d="M${cx - 160},${bodyBot - 34} Q${cx},${bodyBot - 20} ${cx + 160},${bodyBot - 34} L${cx + 160},${bodyBot + 20} L${cx - 160},${bodyBot + 20} Z" fill="${shade(NAVY, .72, 1)}" stroke="${INK}" stroke-width="${THIN}"/>`;
      if (view === 'back') {   // plain coat back: centre vent, two waist buttons, hem band
        o.push(`<path d="M${cx},${y0 + 150} L${cx},${bodyBot}" stroke="${INK}" stroke-width="${THIN}" stroke-linecap="round"/>`);
        o.push(`<path d="M${cx - 60},${y0 + 150} Q${cx},${y0 + 160} ${cx + 60},${y0 + 150}" fill="none" stroke="${INK}" stroke-width="${THIN}"/>`);
        o.push(btn(cx - 26, y0 + 152, 6.5), btn(cx + 26, y0 + 152, 6.5), hem);
        return o;
      }
      o.push(path(`M${cx - 26},${y0 + 10} L${cx + 26},${y0 + 10} L${cx + 22},${y0 + 175} Q${cx},${y0 + 190} ${cx - 22},${y0 + 175} Z`, clothGrad(defs, '#c23d33', cx - 26, cx + 26), INK, THIN));
      for (const k of [0, 1, 2]) o.push(btn(cx, y0 + 70 + k * 36, 6.5));
      for (const s of side ? [-dir] : [-1, 1]) o.push(path(`M${cx + s * 22},${y0 + 4} L${cx + s * 74},${y0 + 22} Q${cx + s * 56},${y0 + 90} ${cx + s * 24},${y0 + 182} Z`, shade(NAVY, .78, 1), INK, THIN));
      for (const s of side ? [-dir] : [-1, 1]) for (const k of [0, 1]) o.push(btn(cx + s * 44, y0 + 205 + k * 44));
      o.push(`<path d="M${cx},${y0 + 185} L${cx + 2},${bodyBot}" stroke="${INK}" stroke-width="${THIN}" stroke-linecap="round"/>`);
      for (const s of side ? [-dir] : [-1, 1]) o.push(path(`M${cx + s * 50},${y0 + 236} Q${cx + s * 74},${y0 + 230} ${cx + s * 96},${y0 + 238} L${cx + s * 92},${y0 + 256} Q${cx + s * 72},${y0 + 250} ${cx + s * 52},${y0 + 254} Z`, shade(NAVY, .8, 1), INK, THIN));
      o.push(hem);
      if (!side) o.push(`<path d="M${cx},${y0 + 106} Q${cx + 40},${y0 + 150} ${cx + 72},${y0 + 128}" fill="none" stroke="${GOLD}" stroke-width="4.5" stroke-dasharray="1 6" stroke-linecap="round"/>`);
      return o;
    },
    props: ({ cx, view }) => view === 'side' ? [] : [
      `<path d="M${cx + 52},380 Q${cx + 124},420 ${cx + 118},468" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>`,
      `<circle cx="${cx + 118}" cy="474" r="15" fill="${INK}"/>`,
      `<circle cx="${cx + 120}" cy="450" r="24" fill="${GOLD}" stroke="${INK}" stroke-width="5"/><circle cx="${cx + 120}" cy="450" r="16" fill="#fbf6e8" stroke="${INK}" stroke-width="2.5"/>`,
      `<path d="M${cx + 120},450 L${cx + 120},439 M${cx + 120},450 L${cx + 128},454" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`,
      `<circle cx="${cx + 120}" cy="424" r="5" fill="${GOLD}" stroke="${INK}" stroke-width="2.5"/>`,
      `<path d="M${cx + 112},440 A12,12 0 0,1 ${cx + 122},433" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`,
    ],
    faceExtras: ({ view, dir, turn, fx, cx, hy, path, hairFill, defs, smooth }) => {
      const o = [], hf = () => hairFill(defs, GREY, hy - 50, view === 'back' ? hy + 24 : hy + 30);
      if (view === 'back') {   // grey hair wraps the back of the head under the cap
        o.push(path(smooth([[cx - 99, hy - 52], [cx, hy - 58], [cx + 99, hy - 52], [cx + 100, hy - 10], [cx + 84, hy + 14], [cx + 56, hy + 22], [cx + 28, hy + 12], [cx, hy + 22], [cx - 28, hy + 14], [cx - 56, hy + 22], [cx - 86, hy + 12], [cx - 100, hy - 12]]), hf(), INK, 5));
        for (const k of [-2, -1, 0, 1, 2]) o.push(`<path d="M${cx + k * 34},${hy - 44} q${k * 4},26 ${k * 3},${44 - Math.abs(k) * 6}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="2.6" stroke-linecap="round"/>`);
        return o;
      }
      if (view === 'side') {   // 2026-11-10 (CB: the side view must show his hair, with no gap to the back of the head): grey hair follows the head's own back edge, from under the cap to the nape
        const X = u => cx + dir * u, A = ([x, y]) => { const a = Math.atan2(y - hy, (x - cx) * dir) * 180 / Math.PI; return a <= 0 ? a : a - 360; };   // 0 = where he looks, -90 = top, -180 = back
        const rim = headPts(cx, hy, 100, 'rick', dir < 0).map(([x, y]) => [cx + (x - cx) * 1.03, hy + (y - hy) * 1.03]).map(q => [A(q), q]).filter(([a]) => a <= -96 && a >= -190).sort((q, r) => r[0] - q[0]).map(([, q]) => q);
        o.push(path(smooth([...rim, [X(-84), hy + 24], [X(-66), hy + 15], [X(-50), hy + 22], [X(-42), hy - 4], [X(-37), hy - 32], [X(-32), hy - 60]]), hf(), INK, 5));   // CB 03:29: ends half way down the head, like the front tufts and the back view
        for (const k of [0, 1]) o.push(`<path d="M${X(-84 + k * 20)},${hy - 44} q${-dir * 4},22 ${dir * 2},${40 - k * 6}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="2.6" stroke-linecap="round"/>`);
      }
      const sides = view === 'side' ? [] : [-1, 1];                  // 3/4 keeps the front head (CB 2026-11-10 03:22: only eyes, brows and mouth shift)
      for (const s of sides) {
        const big = view === 'side' ? 1.6 : 1, near = s === Math.sign(turn) ? 1 - .5 * Math.abs(turn) : 1;
        o.push(path(smooth([[cx + s * 99, hy - 44], [cx + s * (99 - 25 * big * near), hy - 50], [cx + s * (99 - 19 * big * near), hy - 18], [cx + s * 94, hy + 18 * big], [cx + s * 101, hy - 6]]), hf(), INK, 5));
      }
      const my = hy + 40, at = Math.abs(turn);
      const q = v => v * (v * turn > 0 ? 1 - Math.min(.5, at * .6) : 1);
      const m = smooth([[fx, my - 14], [fx + q(22), my - 18], [fx + q(48), my - 6], [fx + q(52), my + 10], [fx + q(30), my + 8], [fx + q(12), my + 14], [fx, my + 6], [fx + q(-12), my + 14], [fx + q(-30), my + 8], [fx + q(-52), my + 10], [fx + q(-48), my - 6], [fx + q(-22), my - 18]]);
      o.push(path(m, hairFill(defs, GREY, my - 18, my + 14), INK, 5.5));
      for (const s of [-1, 1]) for (const k of [0, 1, 2]) o.push(`<path d="M${fx + q(s * (12 + k * 11))},${my - 8} q${q(s * 6)},8 ${q(s * 10)},12" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round"/>`);
      o.push(`<path d="M${fx},${my - 13} L${fx},${my + 4}" stroke="#6e6a78" stroke-width="3" stroke-linecap="round"/>`);
      return o;
    },
    hat: ({ view, dir, turn, cx, fx, hy, defs, path, clothGrad, smooth, shade }) => {
      const o = [], side = view === 'side', lean = side ? dir * 8 : 0;
      const crown = smooth([[cx - 94, hy - 64], [cx - 124 + lean, hy - 112], [cx - 104 + lean, hy - 136], [cx + lean, hy - 146], [cx + 104 + lean, hy - 136], [cx + 124 + lean, hy - 112], [cx + 94, hy - 64], [cx, hy - 58]]);
      o.push(path(crown, clothGrad(defs, NAVY, cx - 124, cx + 124)));
      o.push(`<path d="M${cx - 92},${hy - 128} Q${cx - 20},${hy - 146} ${cx + 40},${hy - 140}" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/>`);
      o.push(path(`M${cx - 96},${hy - 92} Q${cx},${hy - 104} ${cx + 96},${hy - 92} L${cx + 94},${hy - 62} Q${cx},${hy - 72} ${cx - 94},${hy - 62} Z`, clothGrad(defs, GOLD, cx - 96, cx + 96), INK, 6));
      o.push(`<path d="M${cx - 92},${hy - 77} Q${cx},${hy - 89} ${cx + 92},${hy - 77}" fill="none" stroke="${shade(GOLD, .62)}" stroke-width="3.5" stroke-dasharray="7 5"/>`);
      if (view === 'back') return o;
      const bx = side ? cx + dir * 78 : cx + (fx - cx) * 1.1, bk = side ? .7 : 1;
      o.push(`<g transform="translate(${bx},${hy - 116}) scale(${bk},1) translate(${-bx},${-(hy - 116)})"><circle cx="${bx}" cy="${hy - 116}" r="16" fill="${GOLD}" stroke="${INK}" stroke-width="5"/><path d="M${bx},${hy - 126} l4,7 8,1 -6,5 2,8 -8,-4 -8,4 2,-8 -6,-5 8,-1Z" fill="${shade(GOLD, .7)}"/><circle cx="${bx - 5}" cy="${hy - 121}" r="3" fill="#fff6d0"/></g>`);
      if (side) {   // visor sticks out to the front
        o.push(path(`M${cx + dir * 20},${hy - 66} Q${cx + dir * 100},${hy - 72} ${cx + dir * 150},${hy - 50} Q${cx + dir * 140},${hy - 36} ${cx + dir * 96},${hy - 40} Q${cx + dir * 50},${hy - 46} ${cx + dir * 20},${hy - 66} Z`, '#17181f', INK, 8));
        o.push(`<path d="M${cx + dir * 60},${hy - 60} Q${cx + dir * 100},${hy - 62} ${cx + dir * 130},${hy - 52}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>`);
        return o;
      }
      const vx = cx + (fx - cx) * .9;
      o.push(path(`M${cx - 88},${hy - 64} Q${cx},${hy - 76} ${cx + 88},${hy - 64} Q${vx + 60},${hy - 34} ${vx},${hy - 32} Q${vx - 60},${hy - 34} ${cx - 88},${hy - 64} Z`, '#17181f', INK, 8));
      o.push(`<path d="M${cx - 56},${hy - 56} Q${cx - 10},${hy - 62} ${cx + 30},${hy - 58}" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>`);
      return o;
    },
  };
};
