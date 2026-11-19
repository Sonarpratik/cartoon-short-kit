import * as THREE from 'three';
import { compound,floodPower } from '../world';
import { character,type ActorState } from '../characters';
import { place,puff } from '../props';
import { dust } from '../atmosphere';
import { truck } from '../world3';
import { byFrame,exprAt,shake } from './common';
import { name,list,COLORS } from './kit';
import { clamp,lerp,type SceneDefinition } from '../types';
const F0=1295,F1=1462;
// "Two nights later… headlights. Engines. Ten men at your gate. And he's standing in front of them."
// Black → white flash: seen from inside, two trucks blaze on beyond the gate. On "ten men" we cut OUTSIDE the gate for a
// low hero shot of the gang (no bars in the way): headlights glare behind them, the compound floods light their fronts,
// eyes and weapons catch the light (reference: backlit outlaws). Slade centre, shotgun on his shoulder. Then Troy steps out of the line.
const camera=byFrame(F0,F1,[
 {f:1295,position:[0,5.4,-8],target:[0,1.3,6],fov:44,blur:.6},
 {f:1362,position:[0,5.3,-7.4],target:[0,1.3,6],fov:44,blur:.6,ease:'lin'},
 {f:1366,position:[0,.8,.5],target:[0,1.85,8],fov:56,blur:.6,ease:'snap'},
 {f:1402,position:[0,.9,1.2],target:[0,1.85,8],fov:54,blur:.7,ease:'lin'},
 {f:1408,position:[.2,1.6,.4],target:[.2,1.45,4.5],fov:46,blur:1.4,ease:'snap'},
 {f:1461,position:[.2,1.58,.9],target:[.2,1.45,4.5],fov:42,blur:1.6,ease:'lin'},
]);
type W=NonNullable<ActorState['weapon']>;
export default {
 id:'S13',f0:F0,f1:F1,title:'Headlights · ten men',words:"Two nights later, headlights, engines, ten men at your gate. And he's standing in front of them.",review:[1300,1323,1340,1366,1376,1390,1402,1412,1430,1461],
 build(){const s=compound({sky:'night'});s.gate.leaf.position.x=0;
  const t1=place(s.root,truck('#5a3b2a'),-3.4,0,12.5,Math.PI+.12),t2=place(s.root,truck('#3d4a3a'),3.6,0,13,Math.PI-.16);
  // Ten men. Front row = the designed cast (Slade + 4 raiders) lit from the front; back row = 5 shadow silhouettes,
  // only their eyes and weapon glints catching the light.
  const slade=character(s.root,'slade',0,0,5.6);
  const spots:[number,number][]=[[-1.05,5.9],[1.05,5.9],[-2.0,6.4],[2.0,6.3],[-1.6,7.8],[-.55,8.1],[.55,8.1],[1.6,7.8],[2.8,7.5]];
  const kinds=['rBeanie','rSpikes','rHelmet','rCap','rHelmetB','rBeanieB','rCapB','rSpikesB','rHelmetC'] as const;
  const arms:W[]=['machete','bat','pipe','rifle','crowbar','shotgun','bat','machete','pipe'];
  const men=spots.map(([x,z],i)=>character(s.root,kinds[i],x,0,z));const SHADOW=(i:number)=>i>=4;
  const glowAt=(f:number,start:number)=>f<start?0:Math.max(.75,1-Math.max(0,f-start-10)/30)+(f>=start&&f<start+6?.4*Math.sin((f-start)/6*Math.PI):0);
  const troy=character(s.root,'troy',2.5,0,7.2);
  const jack=character(s.root,'jack',-2.6,0,-3.6),brock=character(s.root,'brock',2.7,0,-3.8);
  dust(s.root,{center:[0,1.8,4.2],size:[5,3,4],count:70,color:'#ffffff',scale:.035,opacity:.9,seed:5});
  const exhaust=[t1,t2].map(()=>[0,1,2].map(()=>puff(s.root,'#7a7a88',.35)));
  return {root:s.root,palette:'dark',pose(f){
   const outside=f>=1366;
   floodPower([...s.floods,...s.floodsIn],f<1322?0:outside?.42:.18);s.blueL.intensity=f<1322?0:.6;
   t1.power(f<1322?0:clamp((f-1322)/3)*(outside?.55:1));t2.power(f<1330?0:clamp((f-1330)/3)*(outside?.55:1));
   s.fog.visible=!outside;
   if(outside)[t1,t2].forEach(t=>t.beams.forEach(c=>{(c.material as THREE.MeshBasicMaterial).opacity=.025;}));
   const rev=f>=1343;[t1,t2].forEach((t,i)=>{t.body.position.y=rev?.02*Math.sin(f*2.3+i):0;});
   exhaust.forEach((ps,i)=>ps.forEach((p,k)=>{const t=((f/24)+k/3)%1,tr=i?t2:t1;p.position.set(tr.position.x+(i?-.8:.8),.5+t*1.2,tr.position.z+2.3+t*.8);p.scale.setScalar(.3+t*1.2);(p.material as THREE.SpriteMaterial).opacity=rev?.35*Math.sin(Math.PI*t):0;}));
   // Walk-up: each man strides in from the dark over ~14 frames, staggered; then stands with his weapon.
   men.forEach((m,i)=>{const k=clamp((f-(1350+i*2))/14);m.root.position.z=spots[i][1]+(1-k)*2.2;m.visible=f>=1322;
    m.pose(f,{expr:exprAt(f,[[1295,'stern'],[1380+i*3,i%3?'grin':'stern']]),turn:(spots[i][0]>0?-1:1)*14,mode:k>0&&k<1?'stroll':'stand',tilt:.03*Math.sin(f*.05+i),
     silhouette:SHADOW(i)?1:0,eyeGlow:Math.min(1,glowAt(f,1364+i*2)),eyeColor:SHADOW(i)?'#ffd27a':['#ffe9a8','#ff9ad0','#b8f0ff','#ffe9a8'][i],
     weapon:arms[i],weaponGlint:outside?(SHADOW(i)?.7:1):.4});});
   slade.visible=f>=1322;
   slade.pose(f,{expr:exprAt(f,[[1295,'stern'],[1385,'grin'],[1430,'laugh']]),turn:-8,eyeGlow:Math.min(1,glowAt(f,1368)),eyeColor:'#ff6a5a',weapon:'shotgun-shoulder',weaponGlint:outside?1:.4});
   // Troy waits beside Slade, then steps out in front of the gang toward the gate (camera).
   const step=clamp((f-1404)/20);troy.root.position.set(lerp(2.5,.2,step),0,lerp(7.2,2.6,step));troy.visible=f>=1322;
   troy.pose(f,{expr:exprAt(f,[[1295,'stern'],[1414,'grin'],[1440,'smile_closed']]),turn:-6,mode:step>0&&step<1?'stroll':'stand',eyeGlow:0,weapon:'pipe',weaponGlint:outside?.8:0});
   jack.pose(f,{expr:exprAt(f,[[1295,'neutral'],[1323,'shock'],[1372,'nervous']]),turn:45});
   brock.pose(f,{expr:exprAt(f,[[1295,'neutral'],[1325,'shock'],[1375,'stern']]),turn:-45});},
   camera:u=>{const f=F0+u*(F1-1-F0);return shake(camera(u),f,1343,18,.05);},
   tint:f=>f<1322?[0,0,0,1]:undefined,
   flash:f=>f>=1322&&f<1330?.95-(f-1322)*.11:0,
   overlays:f=>list(name(f,1374,1404,'SLADE','Raider boss',COLORS.slade,'right',1480),name(f,1416,1462,'TROY','He came back',COLORS.troy,'left',1480))};
 }
} satisfies SceneDefinition;
