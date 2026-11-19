// Rank cards: a lens-attached overlay that slams in on "Number N" (big ink-outlined number badge, title, verdict icon).
// Drawn on a 1080x1920 canvas; the player sizes the quad to the frustum every frame, so it is resolution and FOV independent.
import * as THREE from 'three';
import type {CardState,RankIcon,Overlay} from './types';

const W=1080,H=1920,INK='#1d1824';
const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d')!;
const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;
const material=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,fog:false,toneMapped:false});
export const hudQuad=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);
hudQuad.position.z=-.3;hudQuad.renderOrder=1000;hudQuad.layers.set(3);hudQuad.visible=false;

function rounded(x:number,y:number,w:number,h:number,r:number){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function icon(kind:RankIcon,cx:number,cy:number,s:number,color:string){
 g.save();g.translate(cx,cy);g.lineJoin='round';g.lineCap='round';
 const ink=(w:number)=>{g.lineWidth=w;g.strokeStyle=INK;g.stroke();};
 if(kind==='cross'){for(const a of [1,-1]){g.save();g.rotate(a*Math.PI/4);rounded(-s*.17,-s*.62,s*.34,s*1.24,s*.12);g.fillStyle=color;g.fill();ink(10);g.restore();}
  g.save();g.rotate(Math.PI/4);rounded(-s*.17+3,-s*.62+6,s*.34-6,s*1.24-12,s*.1);g.fillStyle=color;g.fill();g.restore();}
 else if(kind==='warn'){g.beginPath();g.moveTo(0,-s*.62);g.lineTo(s*.66,s*.5);g.lineTo(-s*.66,s*.5);g.closePath();g.fillStyle=color;g.fill();ink(11);
  g.fillStyle=INK;rounded(-s*.07,-s*.25,s*.14,s*.46,s*.06);g.fill();g.beginPath();g.arc(0,s*.34,s*.08,0,7);g.fill();}
 else if(kind==='dot'){g.beginPath();g.arc(0,0,s*.55,0,7);g.fillStyle=color;g.fill();ink(11);g.beginPath();g.arc(-s*.18,-s*.2,s*.14,0,7);g.fillStyle='rgba(255,255,255,.7)';g.fill();}
 else if(kind==='anchor'){g.strokeStyle=INK;g.lineWidth=s*.2;const path=()=>{g.beginPath();g.moveTo(0,-s*.38);g.lineTo(0,s*.5);g.moveTo(-s*.5,s*.1);g.quadraticCurveTo(-s*.45,s*.55,0,s*.55);g.quadraticCurveTo(s*.45,s*.55,s*.5,s*.1);g.moveTo(-s*.28,-s*.15);g.lineTo(s*.28,-s*.15);};
  path();g.stroke();g.strokeStyle=color;g.lineWidth=s*.11;path();g.stroke();g.beginPath();g.arc(0,-s*.5,s*.13,0,7);g.fillStyle=color;g.fill();ink(9);}
 else if(kind==='trophy'){g.beginPath();g.moveTo(-s*.5,-s*.55);g.lineTo(s*.5,-s*.55);g.quadraticCurveTo(s*.5,s*.15,0,s*.2);g.quadraticCurveTo(-s*.5,s*.15,-s*.5,-s*.55);g.closePath();g.fillStyle=color;g.fill();ink(10);
  for(const side of [-1,1]){g.beginPath();g.arc(side*s*.52,-s*.3,s*.18,side>0?-Math.PI/2:Math.PI/2,side>0?Math.PI/2:Math.PI*1.5,side<0);ink(10);}
  rounded(-s*.1,s*.18,s*.2,s*.22,4);g.fillStyle=color;g.fill();ink(8);rounded(-s*.35,s*.4,s*.7,s*.18,8);g.fillStyle=color;g.fill();ink(9);
  g.beginPath();g.moveTo(-s*.28,-s*.45);g.lineTo(-s*.2,0);g.lineWidth=s*.07;g.strokeStyle='rgba(255,255,255,.65)';g.stroke();}
 else{g.font=`900 ${s*1.2}px Arial Black, Arial`;g.textAlign='center';g.textBaseline='middle';g.lineWidth=14;g.strokeStyle=INK;g.strokeText('?',0,s*.05);g.fillStyle=color;g.fillText('?',0,s*.05);}
 g.restore();
}
let last='';
/** Draw the card for this frame; returns false when nothing is shown. */
export function drawHud(c:CardState|undefined,overlays:Overlay[]=[]){
 const list=overlays.filter(o=>o.k>.001&&(o.alpha??1)>.001);
 const key=JSON.stringify([c??null,list]);if(key===last)return !!(c&&c.k>.001)||list.length>0;last=key;g.clearRect(0,0,W,H);
 for(const o of list)drawOverlay(o);
 const any=drawCardOnly(c);tex.needsUpdate=true;return any||list.length>0;
}
function drawCardOnly(c:CardState|undefined){
 if(!c||c.k<=.001)return false;
 // Slam: lands from 1.7x with a squash, settles by k=1.
 const k=Math.min(1,c.k),t=k<.55?k/.55:1,land=k<.55?1.7-.7*t*t:1+.06*Math.sin((k-.55)/.45*Math.PI*2)*(1-k)*2.2;
 const cy=c.y??300,cx=W/2;
 g.save();g.translate(cx,cy);g.scale(land,land*(k>.5&&k<.65?.9:1));g.globalAlpha=Math.min(1,k*3)*(c.alpha??1);
 // Banner: dark plate with the title, number badge on the left, icon on the right.
 g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=24;g.shadowOffsetY=10;
 rounded(-470,-95,940,190,46);g.fillStyle='#fdf6e6';g.fill();g.shadowColor='transparent';g.lineWidth=12;g.strokeStyle=INK;g.stroke();
 g.beginPath();g.arc(-380,0,128,0,7);g.fillStyle=c.color;g.fill();g.lineWidth=13;g.strokeStyle=INK;g.stroke();
 g.beginPath();g.arc(-410,-38,40,0,7);g.fillStyle='rgba(255,255,255,.35)';g.fill();
 g.font='900 150px Arial Black, Arial';g.textAlign='center';g.textBaseline='middle';g.lineWidth=16;g.strokeStyle=INK;g.strokeText(c.rank,-380,10);g.fillStyle='#ffffff';g.fillText(c.rank,-380,10);
 const size=c.title.length>11?84:c.title.length>8?98:112;g.font=`900 ${size}px Arial Black, Arial`;g.textAlign='left';g.fillStyle=INK;g.fillText(c.title,-225,8,670);
 g.restore();
 if(c.stamp!==undefined&&c.stamp>0){const s=Math.min(1,c.stamp),pop=s<.5?2.2-1.2*(s/.5):1+.08*Math.sin((s-.5)*12)*(1-s);
  g.save();g.translate(cx+360,cy+120);g.rotate(-.18*(1-s));g.scale(pop,pop);g.globalAlpha=Math.min(1,s*4)*(c.alpha??1);icon(c.icon,0,0,150,c.color);g.restore();}
 return true;
}
/** Card timing helper: slam-in at `a`, stamp at `stamp`, hold, slide away by `b`. */
export function cardAt(f:number,o:{a:number;b:number;stamp?:number;rank:string;title:string;icon:RankIcon;color:string;y?:number}):CardState|undefined{
 if(f<o.a||f>=o.b)return undefined;const inK=Math.min(1,(f-o.a)/14),outK=Math.min(1,(o.b-f)/8);
 const stamp=o.stamp!==undefined&&f>=o.stamp?Math.min(1,(f-o.stamp)/10):0;
 return {rank:o.rank,title:o.title,icon:o.icon,color:o.color,k:inK,alpha:outK,stamp,y:o.y};
}

// ---- Part 3 overlays ----
const slam=(k:number)=>{const t=Math.min(1,k/.55);return k<.55?1.6-.6*t*t:1+.05*Math.sin((k-.55)/.45*Math.PI*2)*(1-k)*2.2;};
function inkText(text:string,x:number,y:number,size:number,fill:string,stroke=14,align:CanvasTextAlign='center',maxW?:number){
 g.font=`900 ${size}px Arial Black, Arial`;g.textAlign=align;g.textBaseline='middle';g.lineJoin='round';g.lineWidth=stroke;g.strokeStyle=INK;g.strokeText(text,x,y,maxW);g.fillStyle=fill;g.fillText(text,x,y,maxW);}
function drawOverlay(o:Overlay){
 const k=Math.min(1,o.k),a=Math.min(1,k*3)*(o.alpha??1);g.save();g.globalAlpha=a;
 if(o.kind==='name'){
  // Lower-third tag: slides in from its side, coloured name plate + cream role strip.
  const left=(o.side??'left')==='left',x=o.x??(left?70:W-70),y=o.y??1380,slide=(1-Math.min(1,k/.6))**3*(left?-500:500);
  g.translate(x+slide,y);g.rotate(left?-.035:.035);
  g.font='900 92px Arial Black, Arial';const nw=Math.max(g.measureText(o.name).width,230)+70;g.font='800 40px Arial';const rw=g.measureText(o.role).width+56;
  const dx=left?0:-Math.max(nw,rw);
  g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=20;g.shadowOffsetY=8;
  rounded(dx,-64,nw,128,26);g.fillStyle=o.color;g.fill();g.shadowColor='transparent';g.lineWidth=10;g.strokeStyle=INK;g.stroke();
  inkText(o.name,dx+nw/2,4,92,'#ffffff',14);
  rounded(dx+24,58,rw,62,18);g.fillStyle='#fdf6e6';g.fill();g.lineWidth=8;g.strokeStyle=INK;g.stroke();
  g.font='800 40px Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle=INK;g.fillText(o.role,dx+24+rw/2,90);
 }else if(o.kind==='day'){
  const s=slam(k);g.translate(W/2,520);g.scale(s,s);g.rotate(-.04);
  g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=30;g.shadowOffsetY=12;
  rounded(-360,-150,720,300,40);g.fillStyle='#1d1824';g.fill();g.shadowColor='transparent';g.lineWidth=12;g.strokeStyle='#fdf6e6';g.stroke();
  for(let i=0;i<6;i++){g.fillStyle=i%2?'#e8b93c':'#1d1824';g.fillRect(-360+i*120,-150,120,26);}
  inkText(o.text,0,22,200,'#ffffff',0);
 }else if(o.kind==='question'){
  const s=slam(k);g.translate(W/2,1280);g.scale(s,s);
  g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=30;g.shadowOffsetY=12;
  rounded(-480,-170,960,340,50);g.fillStyle='#fdf6e6';g.fill();g.shadowColor='transparent';g.lineWidth=14;g.strokeStyle=INK;g.stroke();
  const lines=o.text.split('\n');lines.forEach((l,i)=>{g.font='900 92px Arial Black, Arial';g.textAlign='center';g.textBaseline='middle';g.fillStyle=INK;g.fillText(l,0,-60+i*112,880);});
  // Bouncing down-arrow (drawn, no emoji font): points at the comments.
  const b=12*Math.sin(k*40);g.translate(0,260+b);g.beginPath();g.moveTo(-70,-60);g.lineTo(-30,-60);g.lineTo(-30,-130);g.lineTo(30,-130);g.lineTo(30,-60);g.lineTo(70,-60);g.lineTo(0,20);g.closePath();
  g.fillStyle='#e8b93c';g.fill();g.lineWidth=12;g.strokeStyle=INK;g.stroke();
  if(o.sub){g.translate(0,110);inkText(o.sub,0,0,58,'#ffffff',12);}
 }else if(o.kind==='rule'){
  const s=slam(k);g.translate(W/2,1470);g.scale(s,s);
  g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=26;g.shadowOffsetY=10;
  rounded(-490,-80,980,340,44);g.fillStyle='#fdf6e6';g.fill();g.shadowColor='transparent';g.lineWidth=12;g.strokeStyle=INK;g.stroke();
  rounded(-300,-150,600,130,36);g.fillStyle='#c8423b';g.fill();g.lineWidth=12;g.strokeStyle=INK;g.stroke();inkText('RULE '+o.n,0,-84,96,'#ffffff',14);
  const words=o.text.split(' '),lines:string[]=[];g.font='900 68px Arial Black, Arial';let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(g.measureText(t).width>880&&cur){lines.push(cur);cur=w;}else cur=t;}if(cur)lines.push(cur);
  lines.forEach((l,i)=>{g.textAlign='center';g.textBaseline='middle';g.fillStyle=INK;g.fillText(l,0,115+(i-(lines.length-1)/2)*80,900);});
 }else if(o.kind==='title'){
  const s=slam(k);g.translate(W/2,o.y??360);g.scale(s,s);g.rotate(-.03);inkText(o.text,0,0,o.text.length>12?100:o.text.length>7?118:150,o.color,22,'center',880);
 }else if(o.kind==='tally'){
  // Hand-drawn count over a crate as Troy's eyes pass it.
  const s=slam(k);g.translate(o.x,o.y);g.scale(s,s);g.beginPath();g.arc(0,0,62,0,7);g.fillStyle='#c8423b';g.fill();g.lineWidth=9;g.strokeStyle=INK;g.stroke();inkText(String(o.n),0,4,80,'#ffffff',0);
 }
 g.restore();
}
/** Overlay timing helper: in at a (k 0→1 over `len`), out by b (alpha 1→0 over 8 frames). */
export function show<T extends Overlay>(f:number,a:number,b:number,o:Omit<T,'k'|'alpha'>,len=14):T|undefined{
 if(f<a||f>=b)return undefined;return {...o,k:Math.min(1,(f-a)/len),alpha:Math.min(1,(b-f)/8)} as T;}
