import * as THREE from 'three';
import { Pen, bodyFront, bodySide, headBlob, type Outfit, type Expr } from './engine/toon';
import { cardShade } from './engine/cardshade';
import { NOINK } from './engine/ink';
import { CharacterPen, FACE_COLOR } from './face-style';

import {CAST_DESIGNS,type CharacterKind} from './cast-design';
export type {CharacterKind} from './cast-design';
export type ActorState={expr?:Expr;side?:boolean;wave?:number;mode?:'stand'|'sit';headTilt?:number;hand?:[number,number];facing?:-1|0|1;look?:number};
export class Character {
 root=new THREE.Group(); mesh:THREE.Mesh; private cv:HTMLCanvasElement;private texture:THREE.CanvasTexture; private key='';
 private proxy:THREE.Mesh;private outfit:Outfit;
 private faceFrame={value:new THREE.Vector4(.5,.691,.197,.111)};
 constructor(public kind:CharacterKind,public seed=1){
  this.root.userData.actor=this;
  this.outfit={...CAST_DESIGNS[kind].outfit,skin:FACE_COLOR};this.cv=document.createElement('canvas');this.cv.width=900;this.cv.height=1500;
  this.texture=new THREE.CanvasTexture(this.cv);this.texture.colorSpace=THREE.SRGBColorSpace;this.texture.anisotropy=8;
  const geo=new THREE.PlaneGeometry(1.56,2.6);geo.translate(0,(975-500)*.0026,0);
  const material=cardShade(new THREE.MeshLambertMaterial({map:this.texture,transparent:false,alphaTest:.5,side:THREE.DoubleSide}),this.faceFrame);
  this.mesh=new THREE.Mesh(geo,material);this.mesh.receiveShadow=true;this.mesh.layers.set(NOINK);this.root.add(this.mesh);
  this.proxy=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}));
  this.proxy.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:this.texture,alphaTest:.5});
  this.proxy.castShadow=true;this.proxy.layers.set(NOINK);this.root.add(this.proxy);
  const blobCv=document.createElement('canvas');blobCv.width=blobCv.height=128;const g=blobCv.getContext('2d')!;
  const gr=g.createRadialGradient(64,64,8,64,64,63);gr.addColorStop(0,'rgba(20,16,32,.46)');gr.addColorStop(1,'rgba(20,16,32,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  const blob=new THREE.Mesh(new THREE.PlaneGeometry(.85,.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(blobCv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  blob.rotation.x=-Math.PI/2;blob.position.y=.009;blob.layers.set(NOINK);this.root.add(blob);
 }
 pose(frame:number,state:ActorState={}){
  const blink=(frame+this.seed*39)%109<4;
  const facing=state.facing??0;
  const headTilt=Math.round(((state.headTilt??0)+1.25*Math.sin(frame*.045+this.seed))*100)/100;
  const opts={seed:this.seed,mode:state.mode??'stand',expr:state.expr??'neutral',blink,facing,look:state.look??facing*.8,
   headTilt,wave:state.wave,hand:state.hand,phase:0};
  const key=JSON.stringify({...opts,headTilt:Math.round(opts.headTilt*100)/100,side:state.side});
  if(key!==this.key){const g=this.cv.getContext('2d')!;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,900,1500);g.scale(1.5,1.5);
   if(state.side)bodySide(new CharacterPen(g),this.outfit,{seed:this.seed,mode:'stand',expr:opts.expr,blink});else {
    const pen=new CharacterPen(g);bodyFront(pen,this.outfit,opts);
    const h=headBlob(this.seed,118,facing),hh=h.b*2,chin=975-2.5*hh,hc=chin-h.b,fx=300+7*(2*h.a/100)*facing;
    const tilt=headTilt*Math.PI/180;
    this.faceFrame.value.set((300+(fx-300)*Math.cos(tilt)-(hc-chin)*Math.sin(tilt))/600,1-(chin+(fx-300)*Math.sin(tilt)+(hc-chin)*Math.cos(tilt))/1000,h.a/600,h.b/1000);
    // Project-specific costume details keep the professions visually distinct.
    pen.rot=opts.headTilt?[opts.headTilt*Math.PI/180,300,chin]:null;
    if(this.kind==='researcher'||this.kind==='archivist'){
     for(const s of [-1,1])pen.ell(fx+s*13*(2*h.a/100),hc,26,23,null,4);
     pen.stroke([[fx-6,hc],[fx+6,hc]],4);pen.stroke([[fx-55,hc-3],[fx-65,hc-6]],3);pen.stroke([[fx+55,hc-3],[fx+65,hc-6]],3);
    }
    pen.rot=null;
    if(this.kind==='official'||this.kind==='investigator'){
     pen.poly([[285,chin+15],[300,chin+30],[315,chin+15],[310,chin+53],[322,chin+111],[300,chin+135],[278,chin+111],[290,chin+53]],this.kind==='official'?'#a7554d':'#31495b',3);
     pen.poly([[260,chin+10],[300,chin+30],[275,chin+66]],'#e3ddc9',2);pen.poly([[340,chin+10],[300,chin+30],[325,chin+66]],'#e3ddc9',2);
    }
    if(this.kind==='researcher')pen.poly([[330,chin+78],[365,chin+78],[363,chin+110],[332,chin+110]],'#9dafab',2);
   }
   this.texture.needsUpdate=true;this.key=key;
  }
  this.mesh.position.y=.008*Math.sin(frame*.055+this.seed);
 }
 face(camera:THREE.Camera,sun:THREE.Vector3){
  const p=new THREE.Vector3();this.root.getWorldPosition(p);this.mesh.rotation.y=Math.atan2(camera.position.x-p.x,camera.position.z-p.z);
  this.proxy.rotation.y=Math.atan2(sun.x-p.x,sun.z-p.z);
 }
}
export function character(root:THREE.Object3D,kind:CharacterKind,x:number,y:number,z:number,seed=1){const actor=new Character(kind,seed);actor.root.position.set(x,y,z);root.add(actor.root);return actor;}
