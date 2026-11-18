import { HATS2, PIECES2 } from './head_wear.mjs'; import { execFileSync } from 'child_process';
const hairs = ['sidePart','longStraight','curlyCrop','ponytail','slickBack','bowlCut','afro','lowBun','texturedCrop','beachWaves','buzz','braids'];
const coats = ['#5f7fa6','#a6564f','#4f8a5b','#8a6a3a','#6b5aa6','#c08a2e'];
const hk = Object.keys(HATS2), pk = Object.keys(PIECES2);
const mk = (keys, isHat) => keys.map((k, i) => [hairs[i % hairs.length], isHat ? k : null, isHat ? null : [k], (isHat ? HATS2 : PIECES2)[k].label || k, coats[i % coats.length]]);
const run = (out, c, o) => console.log(out, execFileSync('node', ['wear_sheet.mjs', out, JSON.stringify(c), JSON.stringify(o)]).toString());
run('hats_34.png', mk(hk, 1), { perRow: 6, views: ['front', 'side'], tw: 160, th: 215, up: 60 });
run('head_pieces_16.png', mk(pk, 0), { perRow: 4, views: ['front', '34', 'side', 'back'], tw: 150, th: 180 });
