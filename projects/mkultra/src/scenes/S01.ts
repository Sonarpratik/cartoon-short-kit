import * as THREE from 'three';
import { room } from '../world';
import { desk,cup,bottle,place,box,C } from '../props';
import { character } from '../characters';
import { ease,lerp,type SceneDefinition } from '../types';

export default {
 id:'S01',f0:0,f1:75,title:'An unsuspecting citizen',words:'The CIA drugged its own citizens…',review:[0,24,74],
 build(){const root=room({palette:'warm',window:true,clock:true});
  place(root,desk(2.9,1.15),0,0,.65);const coffee=place(root,cup(),.6,1.025,1.0);
  const civilian=character(root,'civilian',.65,0,-.05,3);const agent=character(root,'investigator',-1.45,0,.2,8);
  const vial=place(root,bottle(''),-.53,1.03,.96);vial.scale.setScalar(1.2);
  const hand=new THREE.Group();box(hand,.5,.12,.17,0,0,0,'#63766d');const palm=new THREE.Mesh(new THREE.SphereGeometry(.11,20,16),new THREE.MeshLambertMaterial({color:'#e7bb99'}));palm.position.x=.3;hand.add(palm);place(root,hand,-1.15,1.28,1.07);
  return {root,palette:'warm',pose(f,u){civilian.pose(f,{expr:u>.6?'smile_closed':'neutral',facing:-1,look:-.65});agent.pose(f,{expr:'stern',facing:1,look:.8});hand.position.x=-1.15+.24*ease(u*1.8);vial.rotation.z=-.12*ease(u*2);},
   camera(u){return {position:[lerp(1.25,1.0,ease(u)),2.65,lerp(6.4,5.9,ease(u))],target:[-.1,1.48,.4],fov:39,focus:[.65,1.6,0],blur:2.5};}};
 }
} satisfies SceneDefinition;
