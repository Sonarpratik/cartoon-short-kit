/** The approved video cast, animated through the original toon/CharacterPen renderer.
 * Design space 600x1000, feet y975. Yaw 0 front, 90 right, 180 back, 270 left.
 */
import {bodyFront,headBlob,blobPts,mix,type Outfit,type Expr} from './toon.js';
import {CharacterPen} from './face-style.js';
export type CharacterDesign={id:string;name:string;project:string;identity:string;seed:number;jacket:string;pants:string;boots:string;hair:string;hairStyle:string;coat:boolean;skin:string;build?:string};
export type RigPose={yaw?:number;pitch?:number;time?:number;action?:string;expression?:string;micro?:boolean};
export const VIEWS=Array.from({length:12},(_,i)=>i*30);
export const ACTIONS=['idle','walk','run','sit','bend','reach','hammer','drill','wave','talk'];
export const EXPRESSIONS=['neutral','stern','grin','laugh','whistle','nervous','shock','relief','relief_open','dazed','pained','smile','smile_closed','lick'];
const rad=Math.PI/180;
export function relativeView(heading:number,cameraX:number,cameraZ:number,actorX=0,actorZ=0){return ((Math.atan2(cameraX-actorX,cameraZ-actorZ)/rad-heading)%360+360)%360;}
type V3=[number,number,number];
/** Shared sagittal walk. Both feet share one hip height; stance soles stay on the ground.
 * Positive z is forward. A world actor advances 2*stepLength per cycle.
 */
export function walkCycle(phase:number,legLength:number,stride=.45,lift=40){
 const stepLength=370*stride,ankleY=965.56;
 const legs=[-1,1].map(side=>{const c=((phase+(side===1?0:.5))%1+1)%1,stance=c<.5,u=stance?c*2:(c-.5)*2;return {side,stance,u,z:stance?stepLength/2-stepLength*u:-stepLength/2+stepLength*u-stepLength/Math.PI*Math.sin(2*Math.PI*u),y:ankleY-(stance?0:lift*Math.sin(Math.PI*u))};});
 const support=legs.find(l=>l.stance)!,effective=legLength*(1-.035*Math.sin(Math.PI*support.u)),hipY=ankleY-Math.sqrt(Math.max(1,effective**2-support.z**2));
 const pose=legs.map(l=>{const dy=l.y-hipY,dz=l.z,length=Math.min(legLength-.001,Math.hypot(dy,dz)),midY=(hipY+l.y)/2,midZ=l.z/2,bend=Math.sqrt(Math.max(0,(legLength/2)**2-(length/2)**2)),normalY=-dz/Math.max(1,length),normalZ=dy/Math.max(1,length),x=l.side*35;return {...l,points:[[x,hipY,30],[x,midY+normalY*bend,30+midZ+normalZ*bend],[x,l.y,30+l.z]] as V3[],pitch:l.stance?0:rad*35*Math.sin(Math.PI*l.u)*(1-1.6*l.u)};});
 return {hipY,stepLength,legs:pose};
}
/** Preserve the authored contours, head seed, proportions, paint and glossy hair.
 * Only camera-relative geometry and restrained micro movement change the drawing.
 */
class TurnPen extends CharacterPen{
 featureCenterX:number|undefined;
 yaw:number;pitch:number;hc:number;hb:number;ha:number;hip:number;t:number;micro:boolean;bend:boolean;
 constructor(g:CanvasRenderingContext2D,yaw:number,pitch:number,hc:number,hb:number,ha:number,chin:number,hip:number,t:number,micro:boolean,bend:boolean){super(g);this.yaw=yaw;this.pitch=pitch;this.hc=hc;this.hb=hb;this.ha=ha;this.hip=hip;this.t=t;this.micro=micro;this.bend=bend;}
 override P(x:number,y:number):[number,number]{
  if(!this.yaw&&!this.pitch&&!this.bend&&!this.micro)return super.P(x,y);
  let [px,py]=super.P(x,y);const dx=px-300,head=this.surface!=='body'&&this.surface!=='limb',feature=this.surface==='feature',cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
  const headWidth=Math.hypot(cy,.85*sy),bodyWidth=Math.hypot(cy,.65*sy);
  let depth=0;
  if(feature)depth=this.ha*.72*Math.sqrt(Math.max(0,1-(dx/this.ha)**2-((py-this.hc)/this.hb)**2));
  else if(!head)depth=30*Math.sqrt(Math.max(0,1-(dx/100)**2));
  let sx=300+dx*(feature?cy:head?headWidth:bodyWidth)+depth*sy;
  if(this.surface==='limb'){const along=Math.max(0,Math.min(1,(py-this.limbOriginY)/(this.hb*2)));depth=30+this.limbSwing*along;sx=300+dx*cy+depth*sy;}
  if(feature&&this.featureCenterX!==undefined){const center=this.featureCenterX-300,front=this.ha*(.72-.17*Math.abs(sy))*Math.sqrt(Math.max(0,1-(center/this.ha)**2-((py-this.hc)/this.hb)**2));sx=300+center*cy+front*sy+(dx-center)*(.65+.35*Math.abs(cy));}
  if(this.surface==='hair-back')sx=300+dx*(Math.abs(cy)+.32*Math.abs(sy))-this.ha*.68*sy;
  if(this.surface==='hair-front')sx=300+dx*(.32+.68*Math.abs(cy))+this.ha*.17*sy;
  if(this.micro&&head){const jaw=Math.max(0,Math.min(1,(py-this.hc)/this.hb));sx+=dx/this.ha*jaw*1.4*Math.sin(this.t*3.2);}
  let syy=500+(py-500)*cp+depth*sp;
  if(head&&!feature){const extent=Math.hypot(this.hb*cp,this.ha*.72*sp);syy=500+(this.hc-500)*cp+(py-this.hc)/this.hb*extent;}
  if(this.bend&&py<this.hip){const amount=(this.hip-py),b=.65;sx+=amount*Math.sin(b)*sy;syy+=amount*(1-Math.cos(b))*cp;}
  // Keep a leaning body within the reusable model-sheet canvas.
  if(this.bend)sx-=Math.sin(this.yaw)*85;
  return [sx,syy];
 }
 private hidden(points:[number,number][]){if(this.surface!=='feature'||!points.length)return false;const x=points.reduce((s,p)=>s+p[0],0)/points.length-300,y=points.reduce((s,p)=>s+p[1],0)/points.length-this.hc,z=Math.sqrt(Math.max(0,1-(x/this.ha)**2-(y/this.hb)**2));if(y>this.hb*.15&&Math.cos(this.yaw)>-.15)return false;return x/this.ha*Math.sin(this.yaw)*Math.cos(this.pitch)+z*Math.cos(this.yaw)*Math.cos(this.pitch)-y/this.hb*Math.sin(this.pitch)<-.02;}
 override path(points:[number,number][],close:boolean){if(this.hidden(points)){this.g.beginPath();return;}this.featureCenterX=points.length?points.reduce((s,p)=>s+p[0],0)/points.length:undefined;super.path(points,close);this.featureCenterX=undefined;}
 override dot(x:number,y:number,r:number,fill?:string){if(!this.hidden([[x,y]])){this.featureCenterX=x;super.dot(x,y,r,fill);this.featureCenterX=undefined;}}
}
export function drawCharacter(g:CanvasRenderingContext2D,d:CharacterDesign,o:RigPose={}){
 g.save();
 const t=o.time??0,micro=o.micro!==false,action=o.action??'idle',yaw=((o.yaw??0)%360+360)%360,pitch=(o.pitch??0)*rad,turn=yaw*rad,back=Math.cos(turn)<-.001;
 const facing=d.hairStyle==='spiky'?-1:1,build=d.build==='kid'?'kid':d.build==='stout'?'stout':'adult',H=headBlob(d.seed,build==='kid'?112:118,facing),HH=2*H.b,torso=build==='kid'?.85:build==='stout'?1.15:1.1,legs=build==='kid'?1:build==='stout'?1.32:1.4;
 const phase=t*(action==='run'?2.3:1.4),walking=action==='walk'||action==='run';
 const gait=walking?walkCycle(phase,(legs+.12)*HH-4*HH/100,action==='run'?.65:.45,action==='run'?65:40):undefined;
 const bottom=gait?gait.hipY+.12*HH:action==='sit'?975-.2*HH:975-legs*HH,chin=bottom-torso*HH,hc=chin-H.b,hip=bottom-.12*HH;
 const outfit:Outfit={jacket:d.jacket,pants:d.pants,boots:d.boots,skin:d.skin,hat:'hair',hair:d.hair,hairStyle:d.hairStyle as Outfit['hairStyle'],labCoat:d.coat,buttons:'#d4b57d',build,viewYaw:yaw,viewPitch:o.pitch??0};
 const pen=new TurnPen(g,turn,pitch,hc,H.b,H.a,chin,hip,t,micro,action==='bend');
 const expression=EXPRESSIONS.includes(o.expression??'')?o.expression as Expr:'neutral',expr=action==='talk'?(['neutral','relief_open','neutral','smile'] as Expr[])[Math.floor(t*6)%4]:expression;
 const blink=micro&&(t+d.seed*.37)%3.77>.13&&(t+d.seed*.37)%3.77<.25;
 if(action==='sit'||action==='bend'){g.translate(300,500);g.scale(.8,.8);g.translate(-300,-500);}
 if(gait){
  const cy=Math.cos(turn),sy=Math.sin(turn),cp=Math.cos(pitch),sp=Math.sin(pitch),project=(p:V3):[number,number]=>[300+p[0]*cy+p[2]*sy,500+(p[1]-500)*cp+(p[2]*cy-p[0]*sy)*sp];
  const legs=[...gait.legs].sort((a,b)=>(a.points[1][2]*cy-a.points[1][0]*sy)-(b.points[1][2]*cy-b.points[1][0]*sy));
  const p=new CharacterPen(g),u=HH/100;
  for(let i=0;i<legs.length;i++){const l=legs[i],points=l.points.map(project),col=mix(d.pants,'#241726',i===0?.72:.55);p.stroke(points,5.8*u,col);const foot=l.points[2],heel:V3=[foot[0],foot[1]-3*u*Math.sin(l.pitch),foot[2]-3*u*Math.cos(l.pitch)],toe:V3=[foot[0],foot[1]+13*u*Math.sin(l.pitch),foot[2]+13*u*Math.cos(l.pitch)];
   // A front-facing shoe retains its width, while the profile shows heel-to-toe roll.
   const h=project(heel),toe2=project(toe);h[0]-=Math.abs(cy)*5*u;toe2[0]+=Math.abs(cy)*6*u;p.stroke([h,toe2],7.5*u,d.boots);
  }
 }
 bodyFront(pen,outfit,{seed:d.seed,expr,blink,mode:action==='sit'?'sit':walking?'stroll':'stand',hideLegs:walking,hipHeight:gait?.hipY,walkYaw:walking?yaw:undefined,phase,light:-2.2,look:facing+(micro?Math.sin(t*.67+d.seed)*.15:0),facing,back,faceBack:Math.cos(turn)<-.25,headTilt:micro?.15*Math.sin(t*1.5):0,wave:['wave','reach'].includes(action)?.5+.5*Math.sin(t*(action==='wave'?5:1)):undefined,prop:action==='hammer'?['hammer',.5+.5*Math.sin(t*18)]:action==='drill'?['drill',.8+.02*Math.sin(t*45)]:null});

 // The user prefers the previous authored hair animation to the mesh experiment.
 const crownT=Math.max(0,Math.min(1,((o.pitch??0)-35)/40)),crown=crownT*crownT*(3-2*crownT);
 if(crown>0){
  pen.surface='head';const [cx,centerY]=pen.P(300,hc);pen.surface='body';
  const p=new CharacterPen(g),rx=H.a*Math.hypot(Math.cos(turn),.85*Math.sin(turn)),ry=Math.hypot(H.b*Math.cos(pitch),H.a*.72*Math.sin(pitch));
  const shape=blobPts(cx,centerY,{...H,a:rx,b:ry,rot:0,asym:0,noise:.003});
  g.save();g.globalAlpha*=crown;
  if(d.hairStyle==='spiky'){
   const spikes:[number,number][]=[];for(let i=0;i<30;i++){const a=i/30*Math.PI*2+turn,r=i%2?1.32:1.02;spikes.push([cx+Math.cos(a)*rx*r,centerY+Math.sin(a)*ry*r]);}p.shadedFill(spikes,d.hair,'#779ebd',-2.2,H.a*1.3);p.poly(spikes,null,5);
  }
  p.shadedFill(shape,d.hairStyle==='receding'?d.skin:d.hair,d.hairStyle==='receding'?'#d8d8dc':mix(d.hair,'#241726',.2),-2.2,H.a);p.poly(shape,null,5);
  if(d.hairStyle==='receding')p.clip(shape,()=>{for(const side of [-1,1])p.ell(cx+side*rx*.83,centerY,rx*.19,ry*.77,d.hair,3);});
  if(d.hairStyle!=='receding')p.arc(cx-rx*.06,centerY-ry*.1,rx*.72,ry*.67,205,285,5,'#fff9f3');
  g.restore();
 }
 g.restore();
}
