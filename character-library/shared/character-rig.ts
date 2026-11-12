/** The approved video cast, animated through the original toon/CharacterPen renderer.
 * Design space 600x1000, feet y975. Yaw 0 front, 90 right, 180 back, 270 left.
 */
import {bodyFront,upperBodyRotations,headBlob,blobPts,mix,type Outfit,type Expr} from './toon.js';
import {CharacterPen} from './face-style.js';
import {angleDesign,type AngleDesign} from './angle-designs.js';
export type Accessory='glasses'|'sunglasses'|'eyepatch'|'freckles'|'blush';
export const ACCESSORIES:Accessory[]=['glasses','sunglasses','eyepatch','freckles','blush'];
export type CharacterDesign={id:string;name:string;project:string;identity:string;seed:number;jacket:string;pants:string;boots:string;hair:string;hairStyle:string;coat:boolean;skin:string;build?:string;outfit?:Outfit;accessory?:'researcher'|'archivist'|'official'|'investigator';accessories?:Accessory[];facing?:-1|0|1;light?:number};
export type RigPose={yaw?:number;pitch?:number;time?:number;action?:string;expression?:string;micro?:boolean;fromExpression?:string;expressionAge?:number;light?:number;
 /** Right-hand target in design space (600x1000). Overrides the action's right arm; scenes project world contact points onto the card. */
 hand?:[number,number]};
export const VIEWS=Array.from({length:12},(_,i)=>i*30);
export const ACTIONS=['idle','walk','run','sit','bend','reach','hammer','drill','wave','talk'];
export const EXPRESSIONS=['neutral','stern','grin','laugh','whistle','nervous','shock','relief','relief_open','dazed','pained','smile','smile_closed','lick'];
const rad=Math.PI/180;
const FLOWING=new Set(['long','bob','curls','tail','bun','pom','knot']);
const JAW:Record<string,[number,number,number]>={neutral:[0,0,0],stern:[1,-1,0],grin:[3,-2,0],laugh:[4,5,.5],whistle:[-2,1,0],nervous:[1,1,1.2],shock:[-4,6,0],relief:[2,0,0],relief_open:[3,3,0],dazed:[1,1,1],pained:[2,-2,-1],smile:[2,-1,0],smile_closed:[2,-1,0],lick:[1,1,.6]};
/** Timeline-driven lower-jaw response. Settle after a reaction instead of jittering at idle. */
export function reactionJaw(expression:string,micro:boolean,age?:number,from='neutral'):[number,number,number]{
 const target=JAW[expression]??JAW.neutral;if(!micro||age===undefined||age>=1)return [...target];
 const t=Math.max(0,age),start=JAW[from]??JAW.neutral,response=1-Math.exp(-8*t)*Math.cos(13*t);
 const pulse=3*Math.exp(-7*t)*Math.sin(17*t);
 return target.map((v,i)=>start[i]+(v-start[i])*response+(i===0?pulse:i===1?-pulse*.5:0)) as [number,number,number];
}
export function relativeView(heading:number,cameraX:number,cameraZ:number,actorX=0,actorZ=0){return ((Math.atan2(cameraX-actorX,cameraZ-actorZ)/rad-heading)%360+360)%360;}

// ---- On-screen view policy: no backs. ----
/** Past a pure profile the drawing shows the back of the head. Scenes must stay within this. */
export const MAX_SCREEN_YAW=90;
/** Preferred working range for staging: front, three-quarter and near-profile. */
export const PREFERRED_SCREEN_YAW=60;
/** Signed view in (-180,180]: 0 front, +90 facing screen-right, -90 facing screen-left. */
export const signedView=(yaw:number)=>{const y=((yaw%360)+360)%360;return y>180?y-360:y;};
export const isBackView=(yaw:number,limit=MAX_SCREEN_YAW)=>Math.abs(signedView(yaw))>limit;
/** Clamp a camera-relative view to the allowed front range, keeping the side the character faces. */
export function frontSafeYaw(yaw:number,limit=PREFERRED_SCREEN_YAW){const s=signedView(yaw);return ((Math.max(-limit,Math.min(limit,s)))+360)%360;}
/** Back-view draws since the last reset; the stills capture reads and clears this per frame. */
const backLog:{id:string;yaw:number}[]=((globalThis as any).__rigBackViews??=[]);

// ---- Deterministic micro-motion (timeline seconds, never wall-clock). ----
const hash=(seed:number,k:number)=>{const x=Math.sin(seed*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};
/** Irregular seeded blinks (2.1-5.3 s apart, ~22% double blinks). Returns lid 0, .5 (half) or 1 (closed). */
export function blinkLid(t:number,seed:number){
 let start=.4+1.6*hash(seed,1),k=2;
 for(;;){const next=start+2.1+3.2*hash(seed,k);if(next>t)break;start=next;k++;}
 const one=(d:number)=>d<0||d>.16?0:d<.04?.5:d<.11?1:.5;
 return Math.max(one(t-start),hash(seed,k+500)<.22?one(t-start-.24):0);
}
/** Gaze holds on a target, then makes a quick ~3-frame saccade to the next one. */
export function gazeShift(t:number,seed:number,range=.22){
 let start=0,k=0,previous=0,current=(hash(seed,900)-.5)*2*range;
 for(;;){const hold=.9+1.6*hash(seed,1000+k);if(start+hold>t)break;start+=hold;previous=current;k++;current=(hash(seed,900+k)-.5)*2*range;}
 const u=Math.min(1,(t-start)/.09);return previous+(current-previous)*u*u*(3-2*u);
}
/** Standing weight shift about the hips, degrees. Two incommensurate periods so it never looks looped. */
export const idleSway=(t:number,seed:number)=>.7*Math.sin(2*Math.PI*t/5.3+seed)+.25*Math.sin(2*Math.PI*t/2.3+seed*1.7);
/** Head tilt, degrees, plus a damped nod whenever the expression changes. */
export function headMotion(t:number,seed:number,expressionAge?:number){
 const idle=.9*Math.sin(2*Math.PI*t/4.7+seed*.5)+.35*Math.sin(2*Math.PI*t/2.9+seed*1.3);
 const nod=expressionAge!==undefined&&expressionAge>=0&&expressionAge<1.2?2.2*Math.exp(-5*expressionAge)*Math.sin(9*expressionAge):0;
 return idle+nod;
}
/** Breathing: fraction of upper-body lift, ~3.6 s period. */
export const breath=(t:number,seed:number)=>.006*(.5-.5*Math.cos(2*Math.PI*t/3.6+seed*.9));
type V3=[number,number,number];
/** Shared sagittal walk. Both feet share one hip height; stance soles stay on the ground.
 * Positive z is forward. A world actor advances 2*stepLength per cycle.
 */
export function walkCycle(phase:number,legLength:number,stride=.45,lift=40){
 const stepLength=370*stride,ankleY=965.56;
 const legs=[-1,1].map(side=>{const c=((phase+(side===1?0:.5))%1+1)%1,stance=c<.5,u=stance?c*2:(c-.5)*2;return {side,stance,u,z:stance?stepLength/2-stepLength*u:-stepLength/2+stepLength*u-stepLength/Math.PI*Math.sin(2*Math.PI*u),y:ankleY-(stance?0:lift*Math.sin(Math.PI*u))};});
 const support=legs.find(l=>l.stance)!,effective=legLength*(1-.035*Math.sin(Math.PI*support.u)),hipY=ankleY-Math.sqrt(Math.max(1,effective**2-support.z**2));
 const pose=legs.map(l=>{const dy=l.y-hipY,dz=l.z,length=Math.min(legLength-.001,Math.hypot(dy,dz)),midY=(hipY+l.y)/2,midZ=l.z/2,bend=Math.sqrt(Math.max(0,(legLength/2)**2-(length/2)**2)),normalY=-dz/Math.max(1,length),normalZ=dy/Math.max(1,length),x=l.side*35;return {...l,points:[[x,hipY,0],[x,midY+normalY*bend,midZ+normalZ*bend],[x,l.y,l.z]] as V3[],pitch:l.stance?0:rad*35*Math.sin(Math.PI*l.u)*(1-1.6*l.u)};});
 return {hipY,stepLength,legs:pose};
}
/** Preserve the authored contours, head seed, proportions, paint and glossy hair.
 * Only camera-relative geometry and restrained micro movement change the drawing.
 */
class TurnPen extends CharacterPen{
 view:AngleDesign=angleDesign('sidepart','hair',0);
 jaw:[number,number,number]=[0,0,0];
 featureCenterX:number|undefined;
 breath=0;
 yaw:number;pitch:number;hc:number;hb:number;ha:number;hip:number;t:number;micro:boolean;bend:boolean;
 constructor(g:CanvasRenderingContext2D,yaw:number,pitch:number,hc:number,hb:number,ha:number,chin:number,hip:number,t:number,micro:boolean,bend:boolean){super(g);this.yaw=yaw;this.pitch=pitch;this.hc=hc;this.hb=hb;this.ha=ha;this.hip=hip;this.t=t;this.micro=micro;this.bend=bend;}
 override P(x:number,y:number):[number,number]{
  if(!this.yaw&&!this.pitch&&!this.bend&&!this.micro&&this.jaw.every(v=>v===0))return super.P(x,y);
  let [px,py]=super.P(x,y);const dx=px-300,head=this.surface==='head'||this.surface==='feature'||this.surface==='hair-back'||this.surface==='hair-front',feature=this.surface==='feature',cy=Math.cos(this.yaw),sy=Math.sin(this.yaw),cp=Math.cos(this.pitch),sp=Math.sin(this.pitch);
  const headWidth=Math.hypot(cy,.85*sy),bodyWidth=this.view.body.width;
  let depth=0;
  if(feature)depth=this.ha*.72*Math.sqrt(Math.max(0,1-(dx/this.ha)**2-((py-this.hc)/this.hb)**2));
  else if(this.surface==='costume')depth=58*Math.sqrt(Math.max(0,1-(dx/100)**2));
  let sx=300+dx*(feature?cy:head?headWidth:bodyWidth)+depth*sy;
  if(this.surface==='limb'){const along=Math.max(0,Math.min(1,(py-this.limbOriginY)/(this.hb*2)));depth=this.limbSwing*along;sx=300+dx*cy+depth*sy;}
  if(this.surface==='costume')sx=300+dx*cy+depth*sy;
  if(this.surface==='leg')sx=300+dx*cy;
  if(this.surface==='shoe')sx=300+dx*cy+(Math.abs(dx)-this.ha*.44)*sy;
  if(feature&&this.featureCenterX!==undefined){const center=this.featureCenterX-300,front=this.ha*(.72-.17*Math.abs(sy))*Math.sqrt(Math.max(0,1-(center/this.ha)**2-((py-this.hc)/this.hb)**2));sx=300+center*cy+front*sy+(dx-center)*(.65+.35*Math.abs(cy));}
  let syy=500+(py-500)*cp+depth*sp;
  if(head&&!feature){const extent=Math.hypot(this.hb*cp,this.ha*.72*sp);syy=500+(this.hc-500)*cp+(py-this.hc)/this.hb*extent;}
  if(this.surface==='head'||feature){const q=Math.max(0,Math.min(1,((py-this.hc)/this.hb-.12)/.88)),weight=q*q*(3-2*q);sx+=(dx/this.ha*this.jaw[0]+this.jaw[2])*weight;syy+=this.jaw[1]*weight*cp;}
  if(this.bend&&py<this.hip){const amount=(this.hip-py),b=.65;sx+=amount*Math.sin(b)*sy;syy+=amount*(1-Math.cos(b))*cp;}
  // Keep a leaning body within the reusable model-sheet canvas.
  if(this.bend)sx-=Math.sin(this.yaw)*85;
  // Breathing lifts the upper body and widens the chest slightly; legs and feet stay planted.
  if(this.breath&&py<this.hip){syy-=(this.hip-py)*this.breath;if(this.surface==='body'||this.surface==='costume')sx=300+(sx-300)*(1+this.breath*.6);}
  return [sx,syy];
 }
 private hidden(points:[number,number][]){if(this.surface==='costume')return this.view.body.front<.025;if(this.surface!=='feature'||!points.length)return false;const x=points.reduce((s,p)=>s+p[0],0)/points.length-300,y=points.reduce((s,p)=>s+p[1],0)/points.length-this.hc,z=Math.sqrt(Math.max(0,1-(x/this.ha)**2-(y/this.hb)**2));if(y>this.hb*.15&&Math.cos(this.yaw)>-.15)return false;return x/this.ha*Math.sin(this.yaw)*Math.cos(this.pitch)+z*Math.cos(this.yaw)*Math.cos(this.pitch)-y/this.hb*Math.sin(this.pitch)<-.02;}
 override path(points:[number,number][],close:boolean){if(this.hidden(points)){this.g.beginPath();return;}this.featureCenterX=points.length?points.reduce((s,p)=>s+p[0],0)/points.length:undefined;super.path(points,close);this.featureCenterX=undefined;}
 override dot(x:number,y:number,r:number,fill?:string){if(!this.hidden([[x,y]])){this.featureCenterX=x;super.dot(x,y,r,fill);this.featureCenterX=undefined;}}
}
export function drawCharacter(g:CanvasRenderingContext2D,d:CharacterDesign,o:RigPose={}){
 g.save();
 const t=o.time??0,micro=o.micro!==false,action=o.action??'idle',yaw=((o.yaw??0)%360+360)%360,pitch=(o.pitch??0)*rad,turn=yaw*rad,back=Math.cos(turn)<-.001;
 const facing=d.facing??(d.hairStyle==='spiky'?-1:1),light=o.light??d.light??-2.2,build=d.build==='kid'?'kid':d.build==='stout'?'stout':'adult',H=headBlob(d.seed,build==='kid'?112:118,facing),HH=2*H.b,torso=build==='kid'?.85:build==='stout'?1.15:1.1,legs=build==='kid'?1:build==='stout'?1.32:1.4;
 const phase=t*(action==='run'?2.3:1.4),walking=action==='walk'||action==='run';
 const gait=walking?walkCycle(phase,(legs+.12)*HH-4*HH/100,action==='run'?.65:.45,action==='run'?65:40):undefined;
 const bottom=gait?gait.hipY+.12*HH:action==='sit'?975-.2*HH:975-legs*HH,chin=bottom-torso*HH,hc=chin-H.b,hip=bottom-.12*HH;
 const outfit:Outfit={hat:'hair',buttons:d.outfit?d.outfit.buttons:'#d4b57d',...d.outfit,jacket:d.jacket,pants:d.pants,boots:d.boots,skin:d.skin,hair:d.hair,hairStyle:d.hairStyle as Outfit['hairStyle'],labCoat:d.coat,build,viewYaw:yaw,viewPitch:o.pitch??0,angleHair:true};
 if(isBackView(yaw)){backLog.push({id:d.id,yaw});if(backLog.length>500)backLog.shift();}
 const pen=new TurnPen(g,turn,pitch,hc,H.b,H.a,chin,hip,t,micro,action==='bend');
 pen.breath=micro&&!walking?breath(t,d.seed)*(action==='sit'?.6:1):0;
 const view=angleDesign(d.hairStyle,outfit.hat??'hair',yaw);pen.view=view;
 const expression=EXPRESSIONS.includes(o.expression??'')?o.expression as Expr:'neutral',expr=action==='talk'?(['neutral','relief_open','neutral','smile'] as Expr[])[Math.floor(t*6)%4]:expression;
 const talkExpressions=['neutral','relief_open','neutral','smile'];
 pen.jaw=reactionJaw(expr,micro,action==='talk'?(t*6%1)/6:o.expressionAge,action==='talk'?talkExpressions[(Math.floor(t*6)+3)%4]:o.fromExpression);
 const blink=micro?blinkLid(t,d.seed):0;
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
 // Standing weight shift, head drift/nod; hair and other loose pieces lag behind the head (follow-through).
 const still=!walking&&action!=='bend',swayAt=(time:number)=>micro&&still?idleSway(time,d.seed)*(action==='sit'?.4:1):0;
 const tiltAt=(time:number)=>micro?headMotion(time,d.seed,o.expressionAge===undefined?undefined:o.expressionAge-(t-time)):0;
 const totalAt=(time:number)=>swayAt(time)+tiltAt(time)+(walking?(action==='run'?1.6:1)*Math.sin(2*Math.PI*time*(action==='run'?2.3:1.4)):0);
 const sway=swayAt(t),headTilt=tiltAt(t),lag=(totalAt(t-.12)-totalAt(t))*1.4*rad;
 const mode=action==='sit'?'sit':walking?'stroll':'stand',attachments=upperBodyRotations(phase,mode,sway,headTilt,chin,hip);
 const headFrame=()=>{const saved=pen.rot;pen.rot=attachments.head;pen.surface='hair-front';const center=pen.P(300,hc),right=pen.P(300+H.a,hc),down=pen.P(300,hc+H.b);pen.rot=saved;pen.surface='body';return {center,right,down};};
 const crownT=Math.max(0,Math.min(1,((o.pitch??0)-35)/40)),crown=crownT*crownT*(3-2*crownT);
 const drawHair=(layer:'back'|'front')=>{
  const saved=pen.rot;pen.rot=attachments.head;pen.surface='head';const headContour=blobPts(300,hc,H).map(([x,y])=>pen.P(x,y));pen.rot=saved;pen.surface='body';
  const {center:[cx,cy],right,down}=headFrame();
  const topX=cx-(down[0]-cx),topY=cy-(down[1]-cy),cl=Math.cos(lag),sl=Math.sin(lag);
  const swing=([x,y]:[number,number]):[number,number]=>[topX+(x-topX)*cl-(y-topY)*sl,topY+(x-topX)*sl+(y-topY)*cl];
  const rx=H.a*Math.hypot(Math.cos(turn),.85*Math.sin(turn)),ry=Math.hypot(H.b*Math.cos(pitch),H.a*.72*Math.sin(pitch)),p=new CharacterPen(g),color=outfit.hat==='cap'||outfit.hat==='fedora'?outfit.cap??d.hair:d.hair;
  for(const patch of view.hair){if(patch.layer!==layer||patch.alpha<.001)continue;const points=patch.points.map(([x,y])=>[cx+x*(right[0]-cx)+y*(down[0]-cx),cy+x*(right[1]-cy)+y*(down[1]-cy)] as [number,number]).map(q=>!patch.clip&&FLOWING.has(patch.id.split('-')[0])?swing(q):q);
   const base=patch.accent?(outfit.hatAccent??'#e8c45a'):patch.id==='hat-band'?'#342d34':patch.kind==='hat'?(outfit.cap??d.hair):d.hair;
   const fill=patch.tone?(patch.tone>0?mix(base,'#241726',patch.tone):mix(base,'#ffffff',-patch.tone)):base;
   const paint=()=>{g.save();g.globalAlpha*=patch.alpha*(1-crown);p.shadedFill(points,fill,mix(fill,'#241726',.25),light,H.a);p.poly(points,null,patch.id.startsWith('temple')?3:5);g.restore();};
   if(patch.clip)p.clip(headContour,paint);else paint();
  }
 };
 drawHair('back');
 bodyFront(pen,outfit,{seed:d.seed,expr,blink,mode:action==='sit'?'sit':walking?'stroll':'stand',hideLegs:walking,hipHeight:gait?.hipY,walkYaw:walking?yaw:undefined,frontDetail:view.body.front,phase,light,look:facing+(micro?gazeShift(t,d.seed):0),facing,back:view.body.front<.025,faceBack:Math.cos(turn)<-.25,headTilt,tilt:sway,wave:['wave','reach'].includes(action)?.5+.5*Math.sin(t*(action==='wave'?5:1)):undefined,hand:o.hand,prop:action==='hammer'?['hammer',.5+.5*Math.sin(t*18)]:action==='drill'?['drill',.8+.02*Math.sin(t*45)]:null});
 drawHair('front');
 pen.rot=attachments.body;
 if(view.body.seam>.05){g.save();g.globalAlpha*=view.body.seam*.65;pen.stroke([[300,chin+HH*.14],[300,hip-HH*.05]],1.8,mix(d.jacket,'#241726',.45));if(d.coat)pen.stroke([[300,hip-HH*.05],[300,hip+HH*.34]],1.8,'#83969e');g.restore();}
 // Preserve the project-authored professional accessories in every shared-library copy.
 const glasses=d.accessory==='researcher'||d.accessory==='archivist';
 if(d.accessory&&(glasses?Math.cos(turn)>-.25:view.body.front>.025)){
  g.save();g.globalAlpha*=glasses?Math.max(0,Math.min(1,(Math.cos(turn)+.25)/.25)):view.body.front;
  const fx=300+7*(2*H.a/100)*facing;
  if(d.accessory==='researcher'||d.accessory==='archivist'){
   pen.rot=attachments.head;pen.surface='feature';
   for(const side of [-1,1])pen.ell(fx+side*13*(2*H.a/100),hc,26,23,null,4);
   pen.stroke([[fx-6,hc],[fx+6,hc]],4);pen.stroke([[fx-55,hc-3],[fx-65,hc-6]],3);pen.stroke([[fx+55,hc-3],[fx+65,hc-6]],3);pen.surface='body';pen.rot=attachments.body;
  }
  if(d.accessory==='official'||d.accessory==='investigator'){
   pen.surface='costume';
   pen.poly([[285,chin+15],[300,chin+30],[315,chin+15],[310,chin+53],[322,chin+111],[300,chin+135],[278,chin+111],[290,chin+53]],d.accessory==='official'?'#a7554d':'#31495b',3);
   pen.poly([[260,chin+10],[300,chin+30],[275,chin+66]],'#e3ddc9',2);pen.poly([[340,chin+10],[300,chin+30],[325,chin+66]],'#e3ddc9',2);
  }
  if(d.accessory==='researcher')pen.poly([[330,chin+78],[365,chin+78],[363,chin+110],[332,chin+110]],'#9dafab',2);
  pen.surface='body';g.restore();
 }
 drawAccessories(g,pen,d,attachments,turn,hc,H,facing);

 pen.rot=null;
 // The user prefers the previous authored hair animation to the mesh experiment.
 if(crown>0){
  pen.surface='head';const [cx,centerY]=pen.P(300,hc);pen.surface='body';
  const frame=headFrame();
  const p=new CharacterPen(g),rx=H.a*Math.hypot(Math.cos(turn),.85*Math.sin(turn)),ry=Math.hypot(H.b*Math.cos(pitch),H.a*.72*Math.sin(pitch));
  p.P=(x:number,y:number):[number,number]=>{const nx=(x-cx)/rx,ny=(y-centerY)/ry;return [frame.center[0]+nx*(frame.right[0]-frame.center[0])+ny*(frame.down[0]-frame.center[0]),frame.center[1]+nx*(frame.right[1]-frame.center[1])+ny*(frame.down[1]-frame.center[1])];};
  const shape=blobPts(cx,centerY,{...H,a:rx,b:ry,rot:0,asym:0,noise:.003});
  g.save();g.globalAlpha*=crown;
  if(d.hairStyle==='spiky'){
   const spikes:[number,number][]=[];for(let i=0;i<30;i++){const a=i/30*Math.PI*2+turn,r=i%2?1.32:1.02;spikes.push([cx+Math.cos(a)*rx*r,centerY+Math.sin(a)*ry*r]);}p.shadedFill(spikes,d.hair,'#779ebd',-2.2,H.a*1.3);p.poly(spikes,null,5);
  }
  const headwear=!!outfit.hat&&outfit.hat!=='hair',color=headwear?outfit.cap??d.hair:d.hair;
  if(outfit.hat==='fedora'||outfit.hat==='tricorn'||outfit.hat==='tophat')p.ell(cx,centerY,rx*1.28,ry*1.18,color,5);
  p.shadedFill(shape,!headwear&&d.hairStyle==='receding'?d.skin:color,!headwear&&d.hairStyle==='receding'?'#d8d8dc':mix(color,'#241726',.2),light,H.a);p.poly(shape,null,5);
  if(!headwear&&d.hairStyle==='receding')p.clip(shape,()=>{for(const side of [-1,1])p.ell(cx+side*rx*.83,centerY,rx*.19,ry*.77,d.hair,3);});
  if(d.hairStyle!=='receding')p.arc(cx-rx*.06,centerY-ry*.1,rx*.72,ry*.67,205,285,5,'#fff9f3');
  g.restore();
 }
 g.restore();
}

/** Story-chosen face accessories. Hidden as the face turns away, like the legacy glasses. */
function drawAccessories(g:CanvasRenderingContext2D,pen:TurnPen,d:CharacterDesign,attachments:{head:number[]|null;body:number[]|null},turn:number,hc:number,H:{a:number;b:number},facing:number){
 const list=new Set(d.accessories??[]);if(!list.size)return;
 const visible=Math.max(0,Math.min(1,(Math.cos(turn)+.25)/.25));if(visible<=0)return;
 g.save();g.globalAlpha*=visible;pen.rot=attachments.head;pen.surface='feature';
 const u=2*H.a/100,fx=300+7*u*facing,eye=(side:number)=>fx+side*13*u;
 if(list.has('blush'))for(const side of [-1,1])pen.ell(fx+side*.5*H.a,hc+.34*H.b,.15*H.a,.07*H.b,'rgba(236,128,128,.38)',0);
 if(list.has('freckles'))for(const side of [-1,1])for(const [dx,dy] of [[.36,.28],[.46,.33],[.41,.4],[.53,.27]])pen.dot(fx+side*dx*H.a,hc+dy*H.b,1.9*u,'#c48466');
 if(list.has('glasses')){for(const side of [-1,1])pen.ell(eye(side),hc,26,23,null,4);pen.stroke([[fx-6,hc],[fx+6,hc]],4);pen.stroke([[fx-55,hc-3],[fx-65,hc-6]],3);pen.stroke([[fx+55,hc-3],[fx+65,hc-6]],3);}
 if(list.has('sunglasses')){
  for(const side of [-1,1]){pen.ell(eye(side),hc+2,28,20,'#1f1c26',4);pen.stroke([[eye(side)-14,hc-6],[eye(side)-4,hc-11]],3,'rgba(255,255,255,.55)');}
  pen.stroke([[fx-8,hc-2],[fx+8,hc-2]],4);pen.stroke([[fx-58,hc-3],[fx-70,hc-6]],3);pen.stroke([[fx+58,hc-3],[fx+70,hc-6]],3);
 }
 if(list.has('eyepatch')){
  const ex=eye(-1);pen.stroke([[300-H.a*.97,hc+.08*H.b],[ex,hc],[300+H.a*.9,hc-.6*H.b]],3.2,'#1d1a20');
  pen.ell(ex,hc+2,25,21,'#1d1a20',3);
 }
 pen.surface='body';pen.rot=attachments.body;g.restore();
}
