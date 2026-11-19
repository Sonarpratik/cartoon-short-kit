import { compound,floodPower } from '../world';
import { place } from '../props';
import { birds } from '../atmosphere';
import { medKit } from '../world3';
import { byFrame,exprAt } from './common';
import { name,list,four,hold,wrench,COLORS } from './kit';
import { clamp,lerp,type SceneDefinition } from '../types';
const F0=126,F1=326;
// "So you form a group: your best friend, a nurse who knows first aid, and a mechanic who can fix anything."
// Lateral truck down the line: each new member steps in from the right on their word and gets a name tag.
const Z=-5,X={jack:-2.4,milo:-.8,tina:.8,brock:2.4};
const camera=byFrame(F0,F1,[
 {f:126,position:[-2.0,1.55,-1.4],target:[-2.0,1.35,Z],fov:40,blur:1.6},
 {f:160,position:[-1.8,1.55,-1.4],target:[-1.8,1.35,Z],fov:40,blur:1.6,ease:'lin'},
 {f:172,position:[-.8,1.55,-1.6],target:[-.8,1.35,Z],fov:40,blur:1.6,ease:'out'},
 {f:198,position:[-.6,1.55,-1.6],target:[-.6,1.35,Z],fov:40,blur:1.6,ease:'lin'},
 {f:208,position:[.8,1.55,-1.6],target:[.8,1.35,Z],fov:40,blur:1.6,ease:'out'},
 {f:252,position:[1.0,1.55,-1.6],target:[1.0,1.35,Z],fov:40,blur:1.6,ease:'lin'},
 {f:262,position:[2.4,1.55,-1.6],target:[2.4,1.35,Z],fov:40,blur:1.6,ease:'out'},
 {f:292,position:[2.5,1.55,-1.7],target:[2.4,1.35,Z],fov:40,blur:1.6,ease:'lin'},
 {f:325,position:[0,2.3,-.9],target:[0,1.25,Z],fov:52,blur:1.1,ease:'io'},
]);
const enter=(f:number,cue:number)=>clamp((f-(cue-16))/16);
export default {
 id:'S02',f0:F0,f1:F1,title:'Form a group',words:'So you form a group, your best friend, a nurse who knows first aid, and a mechanic who can fix anything.',review:[126,175,215,240,270,300,325],
 build(){const s=compound({sky:'day'});s.gate.leaf.position.x=0;
  const g=four(s.root,{jack:[X.jack,0,Z],milo:[X.milo+4,0,Z],tina:[X.tina+4,0,Z],brock:[X.brock+4,0,Z]});
  const kit=place(s.root,medKit(),0,0,0);kit.scale.setScalar(.6);const wr=place(s.root,wrench(),0,0,0);
  birds(s.root,{y:9,z:-18,from:-22,to:22,count:4,offset:40});
  return {root:s.root,palette:'day',pose(f,local){floodPower([...s.floods,...s.floodsIn],0);const eye=camera(local).position;
   const walk=(a:typeof g.milo,x:number,cue:number)=>{const t=enter(f,cue);a.root.position.x=lerp(x+4,x,1-(1-t)**2);return t>0&&t<1;};
   const mW=walk(g.milo,X.milo,166),tW=walk(g.tina,X.tina,203),bW=walk(g.brock,X.brock,258);
   g.jack.pose(f,{expr:exprAt(f,[[126,'smile'],[170,'grin'],[300,'laugh']]),turn:f<170?10:40});
   g.milo.pose(f,{expr:exprAt(f,[[126,'grin'],[180,'laugh'],[230,'grin']]),turn:mW?-55:-20,mode:mW?'run':'stand',wave:f>=172&&f<200?.5+.5*Math.sin(f*.5):undefined});
   g.tina.pose(f,{expr:exprAt(f,[[126,'smile'],[214,'smile_closed'],[260,'smile']]),turn:tW?-50:-10,mode:tW?'stroll':'stand',hand:tW?undefined:hold(g.tina,kit,eye,f,[.38,.82,.1])});
   g.brock.pose(f,{expr:exprAt(f,[[126,'stern'],[274,'grin']]),turn:bW?-50:-25,mode:bW?'stroll':'stand',hand:bW?undefined:hold(g.brock,wr,eye,f,[.45,1.0,.1])});
   kit.visible=!tW&&f>=187;wr.visible=!bW&&f>=242;},
   camera,overlays:f=>list(name(f,170,226,'MILO','Best friend',COLORS.milo,'left'),name(f,207,262,'TINA','Nurse · first aid',COLORS.tina,'right'),name(f,262,320,'BROCK','Mechanic · fixes anything',COLORS.brock,'left'))};
 }
} satisfies SceneDefinition;
