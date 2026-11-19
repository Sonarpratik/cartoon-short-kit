import S01 from './scenes/S01';
import S02 from './scenes/S02';
import S03 from './scenes/S03';
import S04 from './scenes/S04';
import S05 from './scenes/S05';
import S06 from './scenes/S06';
import S07 from './scenes/S07';
import S08 from './scenes/S08';
import S09 from './scenes/S09';
import S10 from './scenes/S10';
import S11 from './scenes/S11';
import S12 from './scenes/S12';
import S13 from './scenes/S13';
import S14 from './scenes/S14';
import S15 from './scenes/S15';
import S16 from './scenes/S16';
import S17 from './scenes/S17';
import S18 from './scenes/S18';
import S19 from './scenes/S19';
import S20 from './scenes/S20';
import S21 from './scenes/S21';
import S22 from './scenes/S22';
import S23 from './scenes/S23';
import {TOTAL} from './types';
export const SCENES=[S01,S02,S03,S04,S05,S06,S07,S08,S09,S10,S11,S12,S13,S14,S15,S16,S17,S18,S19,S20,S21,S22,S23];
for(let i=0;i<SCENES.length;i++){const s=SCENES[i];if(s.f0!==(i?SCENES[i-1].f1:0))throw new Error(`Scene gap before ${s.id}`);}
if(SCENES[SCENES.length-1].f1!==TOTAL)throw new Error('Scenes do not cover the narration');
export function sceneAt(f:number){if(!Number.isInteger(f)||f<0||f>=TOTAL)throw new Error('Frame out of range');return SCENES.find(s=>f>=s.f0&&f<s.f1)!;}
