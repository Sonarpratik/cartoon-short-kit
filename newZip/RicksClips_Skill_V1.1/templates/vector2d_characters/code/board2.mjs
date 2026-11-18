import { SETS, setHead, memes2Defs } from './memes2.mjs';
import { createRequire } from 'module'; const require = createRequire(import.meta.url); const { chromium } = require('/opt/node-tools/node_modules/playwright');
const set = process.argv[2], cols = +(process.argv[3] || 8), K = 1.5, CW = 470, CH = 620;
const LABEL = { sassy: 'sassy', eyeRoll: 'eye roll', judging: 'judging you', blowKiss: 'blow kiss', omg: 'OMG gasp', giggle: 'tee-hee', mascaraCry: 'mascara cry', deathGlare: 'mom death glare', swoon: 'swoon', mamaRage: 'mama rage', duckFace: 'duck-face selfie', offended: 'offended', fangirl: 'fangirl', smug: 'smug satisfied', eek: 'eek grimace', happyCry: 'happy cry',
  giggle_b: 'giggle', wail: 'wail', tantrum: 'tantrum', sleepy: 'sleepy dummy', curious: 'curious', poop: 'poop strain', amazed: 'amazed', drool: 'drool', pout: 'pout', raspberry: 'raspberry', yawn: 'yawn', sneaky: 'sneaky', shy: 'shy', hiccup: 'hiccup', foodMess: 'food mess', burp: 'burp',
  grumpy: 'grumpy', gumLaugh: 'gum laugh', eh: 'EH?', nodOff: 'nodding off', proudTears: 'proud tears', dentures: 'dentures fly', suspicious: 'suspicious', sweetSmile: 'sweet granny', angryFist: 'you kids!', confused: 'confused', nostalgic: 'nostalgic', cackle: 'cackle',
  rest: 'rest', MBP: 'M B P', AI: 'A I', E: 'E', O: 'O', U: 'U', FV: 'F V', L: 'L', WQ: 'W Q', CDGK: 'C D G K S T', open: 'blink: open', half: 'blink: half', closed: 'blink: closed', womanOpen: 'woman: open', womanHalf: 'woman: half', womanClosed: 'woman: closed' };
const fix = s => s.replace(/stroke-width="([\d.]+)"/g, (m, w) => `stroke-width="${(+w / Math.sqrt(K)).toFixed(2)}"`);
const names = Object.keys(SETS[set].faces); let body = '';
names.forEach((n, i) => {
  const cx = (i % cols) * CW + CW / 2, hy = Math.floor(i / cols) * CH + 290;
  body += `<g transform="translate(${cx},${hy}) scale(${K}) translate(${-cx},${-hy})">${fix(setHead(set, n, cx, hy))}</g>`;
  body += `<text x="${cx}" y="${hy + 300}" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle" fill="#2a1a1f">${(set === 'baby' && n === 'giggle') ? 'giggle' : (LABEL[n] || n)}</text>`;
});
const W = CW * cols, H = Math.ceil(names.length / cols) * CH + 20;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${memes2Defs()}</defs><rect width="${W}" height="${H}" fill="#e9e4da"/>${body}</svg>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.setContent(`<html><body style="margin:0">${svg}</body></html>`); await p.screenshot({ path: `out/${set}_board.png` }); await b.close(); console.log('ok', set, names.length, W, H);
