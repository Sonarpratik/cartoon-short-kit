import { knockScene } from './S07';
import { show } from '../hud';
import type { Overlay,SceneDefinition } from '../types';
const F0=1008,F1=1051;
// "What would you do?" Freeze on Troy's begging face: cold wash, question card + arrow pointing at the comments.
export default {
 id:'S08',f0:F0,f1:F1,title:'Freeze · would you let him in?',words:'What would you do?',review:[1008,1020,1035,1050],
 build(){const inst=knockScene(1006);
  return {...inst,tint:(f:number)=>[.08,.1,.22,f<1011?.55-(f-1008)*.07:.34] as [number,number,number,number],flash:undefined,
   overlays:(f:number)=>{const q=show<Extract<Overlay,{kind:'question'}>>(f,1010,1051,{kind:'question',text:'WOULD YOU\nLET HIM IN?',sub:'COMMENT  YES  or  NO'},12);return q?[q]:[];}};
 }
} satisfies SceneDefinition;
