import * as THREE from 'three';
import { Pen, bodyFront, bodySide, headBlob, type Outfit, type Expr } from './engine/toon';
import { cardShade } from './engine/cardshade';
import { NOINK } from './engine/ink';
import { CharacterPen, FACE_COLOR } from './engine/face-style';

import {CAST_DESIGNS,type CharacterKind} from './cast-design';
export type {CharacterKind} from './cast-design';
export type ActorState={expr?:Expr;side?:boolean;wave?:number;mode?:'stand'|'sit';headTilt?:number;hand?:[number,number];facing?:-1|0|1;look?:number;seatHeight?:number;fixedYaw?:number;viewYaw?:number;zipMouth?:boolean;zipProgress?:number};
export class Character {
 root=new THREE.Group(); mesh:THREE.Mesh; private cv:HTMLCanvasElement;private texture:THREE.CanvasTexture; private key='';
 private proxy:THREE.Mesh;private outfit:Outfit;private viewYaw=0;private fixedYaw:number|undefined;
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
 setAppearance(variation:Partial<Outfit>){this.outfit={...this.outfit,...variation,skin:FACE_COLOR};this.key='';this.root.userData.appearance={...variation};return this;}
 pose(frame:number,state:ActorState={}){
  this.viewYaw=state.viewYaw??0;this.fixedYaw=state.fixedYaw;const blink=(frame+this.seed*39)%109<4;
  const facing=state.facing??0;
  const headTilt=Math.round(((state.headTilt??0)+1.25*Math.sin(frame*.045+this.seed))*100)/100;
  const opts={seatHeight:state.seatHeight===undefined?undefined:state.seatHeight/.0026,seed:this.seed,mode:state.mode??'stand',expr:state.expr??'neutral',blink,facing,look:state.look??facing*.8,
   headTilt,wave:state.wave,hand:state.hand,phase:0};
  const key=JSON.stringify({...opts,headTilt:Math.round(opts.headTilt*100)/100,side:state.side,zipMouth:state.zipMouth,zipProgress:state.zipProgress});
  if(key!==this.key){const g=this.cv.getContext('2d')!;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,900,1500);g.scale(1.5,1.5);
   if(state.side){bodySide(new CharacterPen(g),this.outfit,{seed:this.seed,mode:'stand',expr:opts.expr,blink});const h=headBlob(this.seed,118,1),hh=2*h.b,u=2*h.a/100,hip=975-4*u-((1.4+.12)*hh-4*u)*.995,chin=hip+.12*hh-1.1*hh;this.faceFrame.value.set(.5,1-(chin-h.b)/1000,h.a/600,h.b/1000);}else {
    const pen=new CharacterPen(g);bodyFront(pen,this.outfit,opts);
    const h=headBlob(this.seed,118,facing),hh=h.b*2,chin=state.mode==='sit'?(975-(opts.seatHeight??(.32*hh))+.12*hh)-1.1*hh:975-2.5*hh,hc=chin-h.b,fx=300+7*(2*h.a/100)*facing;
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
    if(state.zipMouth){
     const u=2*h.a/100,mx=300+8*u*facing,my=hc+20*u,w=h.a*.97;
     const progress=Math.max(0,Math.min(1,state.zipProgress??1)),left=mx-w/2,right=mx+w/2,slider=left+7+(w-14)*progress;
     const gap=(x:number)=>x<=slider?0:Math.sin((x-slider)/Math.max(1,right-slider)*Math.PI)*12*(1-progress*.2);
     g.save();g.translate(300,chin);g.rotate(tilt);g.translate(-300,-chin);
     // The open mouth lies between separating tapes ahead of the moving slider.
     g.fillStyle='#29232d';g.strokeStyle='#252331';g.lineWidth=3;g.beginPath();g.moveTo(left,my-7);
     for(let x=left;x<=right;x+=3)g.lineTo(x,my-7-gap(x));g.lineTo(right,my+7);
     for(let x=right;x>=left;x-=3)g.lineTo(x,my+7+gap(x));g.closePath();g.fill();g.stroke();
     for(let x=left+4;x<right-3;x+=7){const open=gap(x);g.fillStyle='#d1d4cb';g.fillRect(x,my-7-open,4,6);g.fillStyle='#9da9ae';g.fillRect(x+2,my+1+open,4,6);}
     g.strokeStyle='#687b87';g.lineWidth=2;g.beginPath();g.moveTo(left,my);g.lineTo(slider,my);g.stroke();
     g.fillStyle='#d5c190';g.strokeStyle='#3d3d42';g.lineWidth=2;g.beginPath();g.roundRect(slider-7,my-12,14,23,3);g.fill();g.stroke();
     g.fillStyle='#f0dfaf';g.fillRect(slider-4,my-9,3,15);
     g.save();g.translate(slider,my+9);g.rotate(progress<1?Math.sin(progress*Math.PI*3)*.24:Math.sin((frame-434)*.4)*Math.exp(-Math.max(0,frame-434)/7)*.12);g.beginPath();g.ellipse(0,10,5,9,0,0,Math.PI*2);g.stroke();g.restore();g.restore();
    }
    if(this.kind==='researcher')pen.poly([[330,chin+78],[365,chin+78],[363,chin+110],[332,chin+110]],'#9dafab',2);
   }
   this.texture.needsUpdate=true;this.key=key;
  }
  this.mesh.position.y=state.mode==='sit'?0:.008*Math.sin(frame*.055+this.seed);
 }
 face(camera:THREE.Camera,sun:THREE.Vector3){
  const p=new THREE.Vector3();this.root.getWorldPosition(p);this.mesh.rotation.y=this.fixedYaw??(Math.atan2(camera.position.x-p.x,camera.position.z-p.z)+this.viewYaw);
  this.proxy.rotation.y=this.root.userData.practicalShadow?this.mesh.rotation.y:Math.atan2(sun.x-p.x,sun.z-p.z);
 }
}
export function character(root:THREE.Object3D,kind:CharacterKind,x:number,y:number,z:number,seed=1){const actor=new Character(kind,seed);actor.root.position.set(x,y,z);root.add(actor.root);return actor;}
