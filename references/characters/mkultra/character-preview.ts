// Isolated drawing study: does not change Character, scene files or review frames.
import {Pen,bodyFront,headBlob,type Outfit,type Expr} from './engine/toon';
import {CharacterPen,FACE_COLOR} from './face-style';
import {CAST_DESIGNS,type CharacterKind} from './cast-design';
const cast=Object.entries(CAST_DESIGNS).map(([kind,design])=>({...design,kind:kind as CharacterKind}));
const version=document.querySelector<HTMLSelectElement>('#version')!,expression=document.querySelector<HTMLSelectElement>('#expression')!,direction=document.querySelector<HTMLSelectElement>('#direction')!,animate=document.querySelector<HTMLInputElement>('#animate')!;
const cards=cast.map(person=>{const figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption');canvas.width=600;canvas.height=1000;caption.textContent=person.name;figure.append(canvas,caption);document.querySelector('main')!.append(figure);return {...person,g:canvas.getContext('2d')!};});
function draw(now:number){
 try{
 const frame=Math.floor(now*30/1000),facing=Number(direction.value) as -1|0|1;
 for(const c of cards){
  const g=c.g;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,600,1000);
  const white=version.value==='white',p=white?new CharacterPen(g):new Pen(g);
  const tilt=animate.checked?1.8*Math.sin(frame*.035+c.seed):0;
  bodyFront(p,{...c.outfit,skin:white?FACE_COLOR:c.outfit.skin},{seed:c.seed,mode:'stand',expr:expression.value as Expr,facing,look:facing*.9,blink:animate.checked&&(frame+c.seed*39)%109<4,headTilt:tilt});
  const h=headBlob(c.seed,118,facing),hh=h.b*2,chin=975-2.5*hh,hc=chin-h.b,u=2*h.a/100,fx=300+7*u*facing;
  // Accessories follow the face's gaze offset and head tilt.
  p.rot=tilt?[tilt*Math.PI/180,300,chin]:null;
  if(c.kind==='researcher'||c.kind==='archivist'){
   for(const s of [-1,1])p.ell(fx+s*13*u,hc,26,23,null,4);
   p.stroke([[fx-6,hc],[fx+6,hc]],4);p.stroke([[fx-55,hc-3],[fx-65,hc-6]],3);p.stroke([[fx+55,hc-3],[fx+65,hc-6]],3);
  }
  p.rot=null;
  if(c.kind==='official'||c.kind==='investigator'){
   p.poly([[285,chin+15],[300,chin+30],[315,chin+15],[310,chin+53],[322,chin+111],[300,chin+135],[278,chin+111],[290,chin+53]],c.kind==='official'?'#a7554d':'#31495b',3);
   p.poly([[260,chin+10],[300,chin+30],[275,chin+66]],'#e3ddc9',2);p.poly([[340,chin+10],[300,chin+30],[325,chin+66]],'#e3ddc9',2);
  }
  if(c.kind==='researcher')p.poly([[330,chin+78],[365,chin+78],[363,chin+110],[332,chin+110]],'#9dafab',2);
 }
 (window as unknown as {characterPreviewReady:boolean}).characterPreviewReady=true;
 requestAnimationFrame(draw);
 }catch(error){document.querySelector('#error')!.textContent=String(error);console.error(error);}
}
requestAnimationFrame(draw);
