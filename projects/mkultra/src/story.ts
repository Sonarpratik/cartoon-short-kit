import S01 from './scenes/S01';import S02 from './scenes/S02';import S03 from './scenes/S03';
import S04 from './scenes/S04';import S05 from './scenes/S05';import S06 from './scenes/S06';
import S07 from './scenes/S07';import S08 from './scenes/S08';import S09 from './scenes/S09';
import {TOTAL} from './types';
export const SCENES=[S01,S02,S03,S04,S05,S06,S07,S08,S09];
export function sceneAt(f:number){if(!Number.isInteger(f)||f<0||f>=TOTAL)throw new Error('Frame out of range');return SCENES.find(s=>f>=s.f0&&f<s.f1)!;}
