import { classroom,waterBottle } from '../world3';
import { character } from '../characters';
import { place } from '../props';
import { byFrame,exprAt } from './common';
import { hold,bowl,bandage,list,title } from './kit';
import { clamp,type SceneDefinition } from '../types';
const F0=1089,F1=1157;
// "You give him food, water, a bed." Classroom dorm by lantern: Tina bandages his arm, Milo brings a bowl and a bottle, the cot is his.
const camera=byFrame(F0,F1,[
 {f:1089,position:[.1,1.6,4.0],target:[.1,1.0,-.2],fov:44,blur:1.2},
 {f:1100,position:[-.2,1.5,3.3],target:[-.3,1.05,-.2],fov:42,blur:1.4,ease:'out'},
 {f:1119,position:[-.15,1.5,3.2],target:[-.3,1.05,-.2],fov:42,blur:1.4,ease:'lin'},
 {f:1126,position:[.4,1.5,3.3],target:[.4,1.0,-.2],fov:42,blur:1.4,ease:'out'},
 {f:1134,position:[.4,1.5,3.2],target:[.4,1.0,-.2],fov:42,blur:1.4,ease:'lin'},
 {f:1156,position:[.1,2.0,4.4],target:[.1,.8,-.4],fov:46,blur:1.1,ease:'io'},
]);
export default {
 id:'S10',f0:F0,f1:F1,title:'Food, water, a bed',words:'You give him food, water, a bed.',review:[1089,1104,1124,1140,1156],
 build(){const s=classroom({night:true});
  const troy=character(s.root,'troy',.1,0,-.15),tina=character(s.root,'tina',.95,0,.05),milo=character(s.root,'milo',-.75,0,.15);
  const b=place(s.root,bowl(),0,0,0),w=place(s.root,waterBottle(),0,0,0),band=place(s.root,bandage(),0,0,0);w.scale.setScalar(.7);
  return {root:s.root,palette:'lampnight',pose(f,local){const eye=camera(local).position;const blanket=s.cots[2].userData.blanket;blanket.position.x=-.6+.6*clamp((f-1136)/10);
   troy.pose(f,{expr:exprAt(f,[[1089,'pained'],[1105,'relief'],[1130,'smile']]),turn:-5,mode:'sit'});
   tina.pose(f,{expr:exprAt(f,[[1089,'smile_closed'],[1120,'smile']]),turn:-50,hand:hold(tina,band,eye,f,[-.55,1.0+.04*Math.sin(f*.5),.1])});
   const giveW=f>=1118;milo.pose(f,{expr:exprAt(f,[[1089,'grin'],[1104,'smile']]),turn:45,hand:giveW?hold(milo,w,eye,f,[.5,1.0,.12]):hold(milo,b,eye,f,[.5,1.0,.12])});
   b.visible=!giveW;w.visible=giveW;if(giveW){b.visible=true;b.position.set(.42,.6,.02);} },
   camera,overlays:f=>list(title(f,1103,1121,'FOOD','#ffffff',1650),title(f,1121,1136,'WATER','#ffffff',1650),title(f,1136,1157,'A BED','#ffffff',1650))};
 }
} satisfies SceneDefinition;
