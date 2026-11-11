import {cameraJourney} from '../engine/director';
import * as THREE from 'three';
import { room } from '../world';
import { desk,cup,bottle,place } from '../props';
import { character } from '../characters';
import { ease,type SceneDefinition } from '../types';

const cameraAt=(u:number)=>cameraJourney(u,[{"at":0,"position":[1.6,2.95,7.8],"target":[-0.35,1.45,0.4],"focus":[0.65,1.6,0],"fov":39,"blur":2.5},{"at":1,"position":[0.6,2.55,5.8],"target":[0.2,1.5,0.35],"focus":[0.65,1.6,0],"fov":39,"blur":2.5}]);

export default {
 id:'S01',f0:0,f1:75,title:'An unsuspecting citizen',words:'The CIA drugged its own citizens…',review:[0,24,74],
 build(){const root=room({palette:'warm',window:true,clock:true});
  place(root,desk(2.9,1.15),0,0,.65);const coffee=place(root,cup(),.6,1.025,1.0);
  const civilian=character(root,'civilian',.65,0,-.05,3);const agent=character(root,'investigator',-1.45,0,.2,8);
  const vial=place(root,bottle(''),-.53,1.03,.96);vial.scale.setScalar(1.2);

  return {root,palette:'warm',pose(f,u){civilian.pose(f,{expr:u>.6?'smile_closed':'neutral',facing:-1,look:-.65});vial.rotation.z=-.12*ease(u*2);vial.updateMatrixWorld(true);
    // Project the bottle grip onto the actor's billboard plane so the drawn arm stays attached
    // and meets the bottle throughout the dolly. Match Character.face's yaw-only orientation.
    const eye=new THREE.Vector3(...cameraAt(u).position),origin=agent.root.position;
    const normal=eye.clone().sub(origin);normal.y=0;normal.normalize();
    const grip=new THREE.Vector3(-.12,.22,.04).applyMatrix4(vial.matrixWorld),ray=grip.clone().sub(eye);
    const distance=origin.clone().sub(eye).dot(normal)/ray.dot(normal);
    const contact=eye.clone().addScaledVector(ray,distance).sub(origin),right=new THREE.Vector3(normal.z,0,-normal.x);
    const hand:[number,number]=[300+contact.dot(right)/.0026,975-(contact.y-.008*Math.sin(f*.055+agent.seed))/.0026];
    agent.pose(f,{expr:'stern',facing:1,look:.8,hand});},
   camera:cameraAt};
 }
} satisfies SceneDefinition;
