import { buildChar } from './castkit.mjs'; import { drawCharacter } from './char2d.mjs'; import { dress } from './outfit_lib.mjs'; import { createHash } from 'crypto';
const h = S => { S.view = 'front'; const r = drawCharacter(S); return createHash('md5').update((r.defs + r.body).replace(/(id="|url\(#)[a-zA-Z]+\d+/g, '$1X')).digest('hex').slice(0, 8); };
const base = { name: 't', form: 'standard', face: 'standard', size: 'fat' }, pal = { a: '#4f9a6a', b: '#f3efe6' };
const ref = buildChar(base, 300); dress(ref, 'samurai', pal);
console.log('ref', h(ref), 'str+pal', h(buildChar({ ...base, outfit: 'samurai', outfitPal: pal }, 300)), 'pair', h(buildChar({ ...base, outfit: ['samurai', pal] }, 300)), 'obj', h(buildChar({ ...base, outfit: { key: 'samurai', pal } }, 300)), 'fn', h(buildChar({ ...base, dress: S => dress(S, 'samurai', pal) }, 300)), 'twice', h((() => { const S = buildChar({ ...base, outfit: ['samurai', pal] }, 300); dress(S, 'samurai', pal); return S; })()));
try { buildChar({ ...base, outfit: 'nope' }, 300); } catch (e) { console.log('bad key ->', e.message); }
