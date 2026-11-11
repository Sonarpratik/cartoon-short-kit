import * as THREE from 'three';
import {twoTone} from './shade';
import type {CameraPose} from './director';
type V3=[number,number,number];
export const STAGING_DEFAULTS={threeQuarterDegrees:35,window:{width:1.8,height:1.35},road:{laneWidth:3.5,pavementWidth:3.6,pavementHeight:.18},sky:{dayZenith:'#168fe5',dayHorizon:'#64b5e9',nightZenith:'#102640'},crew:{controlRoom:7,laboratory:3}} as const;
export function threeQuarterCamera(subject:V3,distance:number,elevation=1,side:1|-1=1,degrees:number=STAGING_DEFAULTS.threeQuarterDegrees,fov=48):CameraPose{
 const a=degrees*Math.PI/180;return {position:[subject[0]+side*Math.sin(a)*distance,subject[1]+elevation,subject[2]+Math.cos(a)*distance],target:[...subject],fov};
}
export type Opening={x:number;y:number;z:number;width:number;height:number};
export function apertureCrossing(a:V3,b:V3,opening:Opening,margin=.12){
 const dz=b[2]-a[2];if(Math.abs(dz)<1e-8)return null;const t=(opening.z-a[2])/dz;if(t<0||t>1)return null;
 const x=a[0]+t*(b[0]-a[0]),y=a[1]+t*(b[1]-a[1]);return {x,y,t,clear:Math.abs(x-opening.x)<=opening.width/2-margin&&Math.abs(y-opening.y)<=opening.height/2-margin};
}
function slab(root:THREE.Object3D,size:V3,p:V3,colour:string){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),twoTone(new THREE.MeshLambertMaterial({color:colour})));m.position.set(...p);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;}
/** All six room surfaces stay present. Only the measured window is an opening. */
export function enclosedShell(options:{width:number;depth:number;height:number;opening:Opening;wall?:string;floor?:string}){
 const {width:w,depth:d,height:h,opening:o}=options,root=new THREE.Group(),colour=options.wall??'#8caaa4';root.name='enclosed-room';
 slab(root,[w,.16,d],[0,-.08,0],options.floor??'#a5afa2');slab(root,[w,.18,d],[0,h+.09,0],'#b4c0b4');
 slab(root,[w,h,.2],[0,h/2,-d/2],colour);for(const x of [-w/2,w/2])slab(root,[.2,h,d],[x,h/2,0],colour);
 const left=o.x-o.width/2,right=o.x+o.width/2,bottom=o.y-o.height/2,top=o.y+o.height/2;
 if(left<=-w/2||right>=w/2||bottom<=0||top>=h)throw Error('Window does not fit the enclosing wall');
 slab(root,[left+w/2,h,.2],[(-w/2+left)/2,h/2,d/2],colour);slab(root,[w/2-right,h,.2],[(right+w/2)/2,h/2,d/2],colour);
 slab(root,[o.width,bottom,.2],[o.x,bottom/2,d/2],colour);slab(root,[o.width,h-top,.2],[o.x,(top+h)/2,d/2],colour);
 for(const x of [left,right])slab(root,[.075,o.height+.12,.15],[x,o.y,d/2+.1],'#d4dccd');for(const y of [bottom,top])slab(root,[o.width+.13,.075,.15],[o.x,y,d/2+.1],'#d4dccd');
 slab(root,[o.width+.25,.08,.35],[o.x,bottom-.05,d/2+.17],'#b8c8bc');root.userData.opening=o;root.userData.envelope={width:w,depth:d,height:h};return root;
}
/** A joined ribbon, including bends; endpoints can meet a gate and an existing avenue exactly. */
export function connectedRoad(root:THREE.Object3D,points:V3[],width=7){
 if(points.length<2)throw Error('Road needs at least two connected waypoints');const vertices:number[]=[],indices:number[]=[];
 points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];let nx=-(b[2]-a[2]),nz=b[0]-a[0];if(i>0&&i<points.length-1){const before=Math.hypot(p[0]-a[0],p[2]-a[2]),after=Math.hypot(b[0]-p[0],b[2]-p[2]);if(!before||!after)throw Error('Duplicate road waypoint');nx=-(p[2]-a[2])/before-(b[2]-p[2])/after;nz=(p[0]-a[0])/before+(b[0]-p[0])/after;}const n=Math.hypot(nx,nz);if(!n)throw Error('Duplicate road waypoint');nx/=n;nz/=n;let scale=width/2;if(i>0&&i<points.length-1){const dx=p[0]-a[0],dz=p[2]-a[2],len=Math.hypot(dx,dz);scale/=Math.max(.5,Math.abs(nx*(-dz/len)+nz*(dx/len)));}vertices.push(p[0]+nx*scale,p[1],p[2]+nz*scale,p[0]-nx*scale,p[1],p[2]-nz*scale);if(i)indices.push(2*i-2,2*i,2*i-1,2*i-1,2*i,2*i+1);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,twoTone(new THREE.MeshLambertMaterial({color:'#75868b',side:THREE.DoubleSide})));mesh.receiveShadow=true;root.add(mesh);root.userData.accessRoute={width,points};return mesh;
}
