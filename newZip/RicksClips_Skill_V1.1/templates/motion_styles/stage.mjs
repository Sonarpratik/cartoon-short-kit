// Side-by-side sheet: 3 panels (A, B, C), each with its own camera, on a colourful world-locked floor so planted feet can be checked.
import { G, drawPose } from './rig.mjs';
const W = 1920, H = 1080, PW = 610, PH = 900, TOP = 120, GAP = (W - 3 * PW) / 4;
const PAL = [
  { wall: '#1f8f8a', wall2: '#17716e', floor: '#e8664f', floor2: '#c94f3e', trim: '#f2c14e' },
  { wall: '#5b4bb3', wall2: '#4a3c99', floor: '#f2a541', floor2: '#d98a2b', trim: '#4fd1c5' },
  { wall: '#c2457a', wall2: '#a33665', floor: '#57b26a', floor2: '#43965a', trim: '#ffd166' },
];
// world window per panel: height 1500 world px; width from the panel aspect
const WH0 = 1500, WW0 = WH0 * PW / PH;
function world(cx, pal, props = '', camY = -260, toward = null, WW = WW0) {
  const x0 = cx - WW / 2, x1 = cx + WW / 2, o = [];
  o.push(`<rect x="${x0 - 10}" y="${camY - 10}" width="${WW + 20}" height="${G - camY + 10}" fill="${pal.wall}"/>`);
  for (let k = Math.floor(x0 / 260) - 1; k <= Math.ceil(x1 / 260) + 1; k++) o.push(`<rect x="${k * 260}" y="${camY - 10}" width="130" height="${G - camY + 10}" fill="${pal.wall2}" opacity=".55"/>`);
  o.push(`<rect x="${x0 - 10}" y="${G - 60}" width="${WW + 20}" height="60" fill="${pal.trim}"/>`);
  // ceiling lamps: the light source (top-left), glowing white
  for (let k = Math.floor(x0 / 900) - 1; k <= Math.ceil(x1 / 900) + 1; k++) { const lx = k * 900 - 200, ly = camY + 70;
    o.push(`<circle cx="${lx}" cy="${ly}" r="230" fill="url(#bloom)"/><rect x="${lx - 90}" y="${ly - 22}" width="180" height="44" rx="22" fill="#ffffff"/>`); }
  o.push(`<rect x="${x0 - 10}" y="${G}" width="${WW + 20}" height="600" fill="${pal.floor}"/>`);
  if (toward == null) for (let k = Math.floor(x0 / 150) - 2; k <= Math.ceil(x1 / 150) + 2; k++) o.push(`<path d="M${k * 150},${G} L${k * 150 - 70},${G + 600}" stroke="${pal.floor2}" stroke-width="10"/>`);
  else {   // walking TOWARD the camera: floor lines come toward us (perspective spacing), side rails converge
    const ph = ((toward / 260) % 1 + 1) % 1;
    for (let i = 0; i < 9; i++) { const u = (i + ph) / 8, yy = G + 520 * u * u; o.push(`<rect x="${x0 - 10}" y="${yy.toFixed(1)}" width="${WW + 20}" height="${(4 + 16 * u).toFixed(1)}" fill="${pal.floor2}"/>`); }
    for (const s of [-1, 1]) o.push(`<path d="M${cx + s * 140},${G} L${cx + s * 520},${G + 600}" stroke="${pal.floor2}" stroke-width="10"/>`);
  }
  o.push(`<rect x="${x0 - 10}" y="${G}" width="${WW + 20}" height="10" fill="#000" opacity=".12"/>`);
  return o.join('') + props;
}
export function frameSvg(move, t, chars) {
  const defs = [`<radialGradient id="bloom"><stop offset="0" stop-color="#fffbe8" stop-opacity=".75"/><stop offset=".35" stop-color="#fff3c4" stop-opacity=".25"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>`];
  const panels = move.styles.map((st, i) => {
    const out = st.pose(t, chars[i]), poses = Array.isArray(out.poses) ? out.poses : [out];
    const cam = st.cam ? st.cam(t, out) : (out.cam ?? 0), camY = out.camY ?? -260;
    let ids = 0; const body = poses.map(P => { const r = drawPose(chars[i], P), pre = `p${i}_${ids++}_`;
      defs.push(r.defs.replace(/id="([gc]\d+)"/g, (m, id) => `id="${pre}${id}"`)); return r.svg.replace(/url\(#([gc]\d+)\)/g, (m, id) => `url(#${pre}${id})`); }).join('');
    const px = GAP + i * (PW + GAP);
    const WH = out.camH || WH0, WW = WH * PW / PH, sc = PH / WH;
    return `<g transform="translate(${px},${TOP})"><clipPath id="clip${i}"><rect width="${PW}" height="${PH}" rx="18"/></clipPath>
      <g clip-path="url(#clip${i})"><g transform="scale(${sc}) translate(${-(cam - WW / 2)},${-camY})">${world(cam, PAL[i], out.back || '', camY, out.toward, WW)}${body}${out.front || ''}</g></g>
      <rect width="${PW}" height="${PH}" rx="18" fill="none" stroke="#111" stroke-width="6"/>
      <g transform="translate(18,${18 + 92})"><rect x="0" y="-92" width="${PW - 36}" height="92" rx="14" fill="#111" opacity=".78"/>
      <text x="22" y="-26" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="58" fill="#ffd166">${st.key}</text>
      <text x="86" y="-50" font-family="Arial, sans-serif" font-weight="800" font-size="30" fill="#fff">${st.name}</text>
      <text x="86" y="-16" font-family="Arial, sans-serif" font-size="22" fill="#ddd">${st.blurb}</text></g></g>`;
  }).join('');
  const title = `<text x="${W / 2}" y="78" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="58" fill="#fff">${move.title}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs><rect width="${W}" height="${H}" fill="#151520"/>${title}${panels}</svg>`;
}
