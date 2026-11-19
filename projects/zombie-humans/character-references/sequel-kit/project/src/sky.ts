// Painted, realistic-leaning sky domes (equirectangular canvas on a camera-following sphere).
// Canvas x: azimuth (x = 0.75·W looks straight down -z, the direction most shots face); y: zenith (0) → horizon (H/2) → nadir.
import * as THREE from 'three';
import { NOINK } from './engine/ink';
import { addTick } from './atmosphere';

export type SkyKind='day'|'night'|'dawn'|'dusk';
type Look={stops:[number,string][];below:string;sun?:{u:number;elev:number;core:string;glow:string;size:number;glowSize:number};moon?:{u:number;elev:number};
 cloudLit:string;cloudMid:string;cloudShade:string;cloudCount:number;cirrus:string;stars:number;haze:string;hazeAlpha:number};
const LOOKS:Record<SkyKind,Look>={
 day:{stops:[[0,'#1f6fd1'],[.22,'#3d8ee6'],[.38,'#78b4ef'],[.47,'#b9d9f5'],[.5,'#e4eef6']],below:'#cfdce6',
  sun:{u:.69,elev:48,core:'#fffdf2',glow:'rgba(255,248,220,',size:26,glowSize:260},
  cloudLit:'#ffffff',cloudMid:'#eef2f8',cloudShade:'#b9c3d6',cloudCount:90,cirrus:'rgba(255,255,255,.55)',stars:0,haze:'#f4f1e8',hazeAlpha:.55},
 dusk:{stops:[[0,'#2c3f7a'],[.2,'#5b5d9c'],[.33,'#c47d8f'],[.43,'#f2a36b'],[.49,'#ffd08a'],[.5,'#ffe2a8']],below:'#8a6a6a',
  sun:{u:.62,elev:4,core:'#fff3c8',glow:'rgba(255,190,110,',size:34,glowSize:360},
  cloudLit:'#ffd2a0',cloudMid:'#e79a8e',cloudShade:'#7a5f8f',cloudCount:70,cirrus:'rgba(255,200,170,.5)',stars:0,haze:'#ffc98e',hazeAlpha:.5},
 dawn:{stops:[[0,'#3f5fa8'],[.22,'#7c8fc9'],[.34,'#d9a6b8'],[.43,'#ffbf98'],[.49,'#ffdca0'],[.5,'#fff0c8']],below:'#c9a49a',
  sun:{u:.8,elev:6,core:'#fffbe6',glow:'rgba(255,214,150,',size:30,glowSize:340},
  cloudLit:'#ffe3c0',cloudMid:'#f2b3a6',cloudShade:'#8f86b8',cloudCount:75,cirrus:'rgba(255,220,200,.55)',stars:0,haze:'#ffe0b8',hazeAlpha:.55},
 night:{stops:[[0,'#05081a'],[.25,'#0c1433'],[.4,'#1b2552'],[.48,'#2d3a6e'],[.5,'#3c4a80']],below:'#1a2040',
  moon:{u:.7,elev:32},cloudLit:'#5a6aa0',cloudMid:'#323e70',cloudShade:'#1a2248',cloudCount:40,cirrus:'rgba(150,170,230,.25)',stars:900,haze:'#3a4a8a',hazeAlpha:.35},
};
const rand=(seed:number)=>{let s=seed;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};};

export function paint(kind:SkyKind){
 const W=4096,H=2048,L=LOOKS[kind],c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d')!,r=rand(kind.length*7919+11);
 const yOf=(elev:number)=>H/2-(elev/90)*(H/2);
 // Base gradient (zenith → horizon), ground colour below.
 const gr=g.createLinearGradient(0,0,0,H/2);L.stops.forEach(([s,col])=>gr.addColorStop(s*2,col));g.fillStyle=gr;g.fillRect(0,0,W,H/2);g.fillStyle=L.stops[L.stops.length-1][1];g.fillRect(0,H/2,W,H/2);
 // Stars (night): varied size and brightness, a faint milky band.
 if(L.stars){for(let i=0;i<L.stars;i++){const x=r()*W,y=r()*H*.46,b=r();g.fillStyle=`rgba(255,255,${230+Math.round(25*r())},${.35+.65*b*b})`;const s=b>.97?2.6:b>.85?1.7:1;g.beginPath();g.arc(x,y,s,0,7);g.fill();}
  const band=g.createLinearGradient(0,H*.08,W,H*.4);band.addColorStop(0,'rgba(150,160,220,0)');band.addColorStop(.5,'rgba(150,160,220,.10)');band.addColorStop(1,'rgba(150,160,220,0)');g.fillStyle=band;g.fillRect(0,0,W,H/2);}
 // Sun / moon with layered glow.
 const glowAt=(x:number,y:number,rad:number,rgba:string,a:number)=>{for(const ox of [0,-W,W]){const gg=g.createRadialGradient(x+ox,y,0,x+ox,y,rad);gg.addColorStop(0,rgba+a+')');gg.addColorStop(.35,rgba+(a*.35)+')');gg.addColorStop(1,rgba+'0)');g.fillStyle=gg;g.fillRect(x+ox-rad,y-rad,2*rad,2*rad);}};
 if(L.sun){const x=L.sun.u*W,y=yOf(L.sun.elev);glowAt(x,y,L.sun.glowSize*2.4,L.sun.glow,.35);glowAt(x,y,L.sun.glowSize,L.sun.glow,.8);g.fillStyle=L.sun.core;g.beginPath();g.arc(x,y,L.sun.size,0,7);g.fill();}
 if(L.moon){const x=L.moon.u*W,y=yOf(L.moon.elev);glowAt(x,y,260,'rgba(200,215,255,',.35);g.fillStyle='#f1f0e6';g.beginPath();g.arc(x,y,30,0,7);g.fill();
  g.fillStyle='rgba(170,170,160,.45)';for(const [dx,dy,rr] of [[-8,-6,7],[9,4,5],[-2,11,4],[6,-12,3]])g.beginPath(),g.arc(x+dx,y+dy,rr,0,7),g.fill();}
 // Horizon haze band (atmospheric perspective).
 const hz=g.createLinearGradient(0,H/2-H*.09,0,H/2);hz.addColorStop(0,'rgba(0,0,0,0)');hz.addColorStop(1,L.haze);g.globalAlpha=L.hazeAlpha;g.fillStyle=hz;g.fillRect(0,H/2-H*.09,W,H*.09);g.globalAlpha=1;
 // High cirrus streaks.
 g.strokeStyle=L.cirrus;g.lineCap='round';for(let i=0;i<26;i++){const x=r()*W,y=yOf(18+r()*30),len=90+r()*220;g.lineWidth=1.5+r()*3;g.globalAlpha=.35+.4*r();g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+len*.3,y-8-r()*14,x+len*.7,y+6,x+len,y-4);g.stroke();}g.globalAlpha=1;
 // Cumulus: clusters of soft puffs — shaded base pass, mid body, then lit tops toward the light.
 const lightU=(L.sun?.u??L.moon?.u??.7)*W;
 const layer=()=>{const lc=document.createElement('canvas');lc.width=W;lc.height=H/2;return lc.getContext('2d')!;};
 const shadeL=layer(),bodyL=layer(),crownL=layer();
 const puffOn=(cx2:CanvasRenderingContext2D,x:number,y:number,rad:number,col:string,a:number)=>{for(const ox of (x<rad?[0,W]:x>W-rad?[0,-W]:[0])){const gg=cx2.createRadialGradient(x+ox,y,rad*.1,x+ox,y,rad);gg.addColorStop(0,col);gg.addColorStop(.45,col);gg.addColorStop(1,'rgba(255,255,255,0)');cx2.globalAlpha=a;cx2.fillStyle=gg;cx2.beginPath();cx2.arc(x+ox,y,rad,0,7);cx2.fill();}cx2.globalAlpha=1;};
 const puff=(x:number,y:number,rad:number,col:string,a:number)=>{for(const ox of [0,-W,W]){const gg=g.createRadialGradient(x+ox,y,rad*.1,x+ox,y,rad);gg.addColorStop(0,col);gg.addColorStop(.45,col);gg.addColorStop(1,'rgba(255,255,255,0)');g.globalAlpha=a;g.fillStyle=gg;g.beginPath();g.arc(x+ox,y,rad,0,7);g.fill();}g.globalAlpha=1;};
 for(let k=0;k<L.cloudCount;k++){
  const elev=2+Math.pow(r(),1.4)*28,cy=yOf(elev),cx=r()*W,scale=(0.35+elev/26)*(16+r()*22),flat=.55+.25*(elev/30);
  const blobs=10+Math.floor(r()*12),pts:[number,number,number][]=[];
  for(let i=0;i<blobs;i++){const t=i/(blobs-1)-.5;pts.push([cx+t*scale*5*(.8+.4*r()),cy-Math.abs(Math.cos(t*Math.PI))*scale*1.1*flat*r()-scale*.25,scale*(.55+.6*r())*(1-Math.abs(t)*.7)]);}
  const toLight=Math.sign(((lightU-cx+W*1.5)%W)-W/2);
  pts.forEach(([x,y,rr])=>puffOn(shadeL,x+toLight*-rr*.12,y+rr*.3,rr*1.1,L.cloudShade,.75));  // hazy shaded underside
  pts.forEach(([x,y,rr])=>puffOn(bodyL,x,y,rr*.9,L.cloudMid,.9));                            // soft body
  pts.forEach(([x,y,rr])=>puffOn(crownL,x+toLight*rr*.2,y-rr*.24,rr*.55,L.cloudLit,.85));    // sunlit crown
 }
 for(const [lc,blur] of [[shadeL,7],[bodyL,3],[crownL,1.2]] as const){g.filter=`blur(${blur}px)`;g.drawImage(lc.canvas,0,0);}g.filter='none';
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
const cache=new Map<SkyKind,THREE.CanvasTexture>();
/** Add a realistic sky dome that follows the camera; clouds drift slowly. */
export function realisticSky(root:THREE.Object3D,kind:SkyKind){
 const tex=cache.get(kind)??paint(kind);cache.set(kind,tex);const map=tex.clone();map.needsUpdate=true;
 const dome=new THREE.Mesh(new THREE.SphereGeometry(95,64,32),new THREE.MeshBasicMaterial({map,side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false}));
 dome.frustumCulled=false;dome.renderOrder=-1000;dome.layers.set(NOINK);
 dome.onBeforeRender=(_r,_s,cam)=>{dome.position.copy(cam.position);dome.updateMatrixWorld();};root.add(dome);
 addTick(root,f=>{map.offset.x=f*.000012;});
 return dome;
}
