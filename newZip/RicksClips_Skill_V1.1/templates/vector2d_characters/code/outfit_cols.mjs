// shared colours and short helpers for the outfit recipe files (outfits_200 ... outfits_500)
import { SK } from './outfit_lib.mjs';
export const NAVY = '#27365e', CREAM = '#efe6cf', BROWN = '#7a4a2a', TAN = '#c9a36a', GREEN = '#3f7a4a', OLIVE = '#6b7340', GREY = '#8a8f9a', PINK = '#e58aa6', PURPLE = '#6b3fa0', SKY = '#5aa0d8', ORANGE = '#e07a2a', TEAL = '#2f8f8a', MAROON = '#7a2434', MAIL = '#8e96a4', BRONZE = '#c98a3c', DENIM = '#3f5f96', KHAKI = '#b9a878',
  YELLOW = '#f2c230', LIME = '#8fc23f', MINT = '#9fd8c0', LILAC = '#b79be0', CORAL = '#f0705a', MUSTARD = '#d2a02a', SAGE = '#8fa58a', CHARCOAL = '#3a3f48', BLUE = '#2f6fd0', ROSE = '#d8456e', PEACH = '#f4b48a', WINE = '#5e1f38', FOREST = '#2f5f3a', SAND = '#dcc9a0', ICE = '#bfe0ee', HOT = '#e83a8a', CYAN = '#3fc8d8', INDIGO = '#3a3f8a', RUST = '#b4542a', SILVER = '#c9ced6', INKC = '#2a1a1f', BEIGE = '#d9c8a8', LEAF = '#3fb66a';
const ch = (c, fn) => { const n = parseInt(c.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(fn(v)))).toString(16).padStart(2, '0')).join(''); };
export const sd = (c, k = .7) => ch(c, v => v * k), tn = (c, k = .35) => ch(c, v => v + (255 - v) * k);
// K(len, col, P => opts): skirt for a recipe; col may be a palette letter
export const K = (len, c, fo) => P => SK(len, P[c] || c, fo ? fo(P) : {});
