import { storeroom } from '../world3';
import { character } from '../characters';
import { byFrame,exprAt } from './common';
import { rule,list } from './kit';
import { clamp,type SceneDefinition } from '../types';
const F0=1896,F1=1998;
// "Rule 1. Never show strangers your supplies." A stranger leans into the store doorway; Jack steps across and slams the door.
const camera=byFrame(F0,F1,[
 {f:1896,position:[1.6,2.2,5.6],target:[4.8,1.1,.9],fov:46,blur:.9},
 {f:1997,position:[2.0,2.15,5.2],target:[4.8,1.1,.9],fov:45,blur:1,ease:'lin'},
]);
export default {
 id:'S17',f0:F0,f1:F1,title:'Rule 1',words:'Rule 1. Never show strangers your supplies.',review:[1896,1920,1945,1962,1975,1997],
 build(){const s=storeroom();
  const peek=character(s.root,'rCapB',5.5,0,1.05),jack=character(s.root,'jack',2.9,0,1.9);
  return {root:s.root,palette:'lamp',pose(f){
   const shut=clamp((f-1958)/5);s.door.rotation.y=-1.35*(1-shut*shut);peek.visible=f<1966;
   peek.pose(f,{expr:exprAt(f,[[1896,'grin'],[1937,'lick'],[1960,'shock']]),turn:-40,tilt:-.12});
   const t=clamp((f-1938)/18);jack.root.position.set(2.9+1.5*t,0,1.9-.3*t);
   jack.pose(f,{expr:exprAt(f,[[1896,'neutral'],[1930,'stern'],[1966,'smile_closed']]),turn:t>0&&t<1?-50:-20,mode:t>0&&t<1?'stroll':'stand',action:f>=1954&&f<1964?'reach':undefined});},
   camera,flash:f=>f>=1963&&f<1966?.15:0,overlays:f=>list(rule(f,1898,1998,1,'NEVER SHOW STRANGERS YOUR SUPPLIES'))};
 }
} satisfies SceneDefinition;
