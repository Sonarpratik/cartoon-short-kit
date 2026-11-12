/** The approved video cast, animated through the original toon/CharacterPen renderer.
 * Design space 600x1000, feet y975. Yaw 0 front, 90 right, 180 back, 270 left.
 */
import {bodyFront,upperBodyRotations,headBlob,blobPts,mix,type Outfit,type Expr} from './toon.js';
import {CharacterPen} from './face-style.js';
import {angleDesign,type AngleDesign} from './angle-designs.js';
export type CharacterDesign={id:string;name:string;project:string;identity:string;seed:number;jacket:string;pants:string;boots:string;hair:string;hairStyle:string;coat:boolean;skin:string;build?:string;outfit?:Outfit;accessory?:'researcher'|'archivist'|'official'|'investigator';facing?:-1|0|1;light?:number};
export type RigPose={yaw?:number;pitch?:number;time?:number;action?:string;expression?:string;micro?:boolean;fromExpression?:string;expressionAge?:number;light?:number};
export const VIEWS=Array.from({length:12},(_,i)=>i*30);
export const ACTIONS=['idle','walk','run','sit','bend','reach','hammer','drill','wave','talk'];
export const EXPRESSIONS=['neutral','stern','grin','laugh','whistle','nervous','shock','relief','relief_open','dazed','pained','smile','smile_closed','lick'];
const rad=Math.PI/180;
const JAW:Record<string,[number,number,number]>={neutral:[0,0,0],stern:[1,-1,0],grin:[3,-2,0],laugh:[4,5,.5],whistle:[-2,1,0],nervous:[1,1,1.2],shock:[-4,6,0],relief:[2,0,0],relief_open:[3,3,0],dazed:[1,1,1],pained:[2,-2,-1],smile:[2,-1,0],smile_closed:[2,-1,0],lick:[1,1,.6]};
/** Timeline-driven lower-jaw response. Settle after a reaction instead of jittering at idle. */
export function reactionJaw(expression:string,micro:boolean,age?:number,from='neutral'):[number,number,number]{
 const target=JAW[expression]??JAW.neutral;if(!micro||age===undefined||age>=1)return [...target];
 const t=Math.max(0,age),start=JAW[from]??JAW.neutral,response=1-Math.exp(-8*t)*Math.cos(13*t);
 const pulse=3*Math.exp(-7*t)*Math.sin(17*t);
 return target.map((v,i)=>start[i]+(v-start[i])*response+(i===0?pulse:i===1?-pulse*.5:0)) as [number,number,number];
}
export function relativeView(heading:number,cameraX:number,cameraZ:number,actorX=0,actorZ=0){return ((Math.atan2(cameraX-actorX,cameraZ-actorZ)/rad-heading)%360+360)%360;}
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
 const pen=new TurnPen(g,turn,pitch,hc,H.b,H.a,chin,hip,t,micro,action==='bend');
 const view=angleDesign(d.hairStyle,outfit.hat??'hair',yaw);pen.view=view;
 const expression=EXPRESSIONS.includes(o.expression??'')?o.expression as Expr:'neutral',expr=action==='talk'?(['neutral','relief_open','neutral','smile'] as Expr[])[Math.floor(t*6)%4]:expression;
 const talkExpressions=['neutral','relief_open','neutral','smile'];
 pen.jaw=reactionJaw(expr,micro,action==='talk'?(t*6%1)/6:o.expressionAge,action==='talk'?talkExpressions[(Math.floor(t*6)+3)%4]:o.fromExpression);
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
 const headTilt=micro?.15*Math.sin(t*1.5):0,mode=action==='sit'?'sit':walking?'stroll':'stand',attachments=upperBodyRotations(phase,mode,0,headTilt,chin,hip);
 const headFrame=()=>{const saved=pen.rot;pen.rot=attachments.head;pen.surface='hair-front';const center=pen.P(300,hc),right=pen.P(300+H.a,hc),down=pen.P(300,hc+H.b);pen.rot=saved;pen.surface='body';return {center,right,down};};
 const crownT=Math.max(0,Math.min(1,((o.pitch??0)-35)/40)),crown=crownT*crownT*(3-2*crownT);
 const drawHair=(layer:'back'|'front')=>{
  const saved=pen.rot;pen.rot=attachments.head;pen.surface='head';const headContour=blobPts(300,hc,H).map(([x,y])=>pen.P(x,y));pen.rot=saved;pen.surface='body';
  const {center:[cx,cy],right,down}=headFrame();
  const rx=H.a*Math.hypot(Math.cos(turn),.85*Math.sin(turn)),ry=Math.hypot(H.b*Math.cos(pitch),H.a*.72*Math.sin(pitch)),p=new CharacterPen(g),color=outfit.hat==='cap'||outfit.hat==='fedora'?outfit.cap??d.hair:d.hair;
  for(const patch of view.hair){if(patch.layer!==layer||patch.alpha<.001)continue;const points=patch.points.map(([x,y])=>[cx+x*(right[0]-cx)+y*(down[0]-cx),cy+x*(right[1]-cy)+y*(down[1]-cy)] as [number,number]),fill=patch.id==='hat-band'?'#342d34':color;
   const paint=()=>{g.save();g.globalAlpha*=patch.alpha*(1-crown);p.shadedFill(points,fill,mix(fill,'#241726',.25),light,H.a);p.poly(points,null,patch.id.startsWith('temple')?3:5);g.restore();};
   if(patch.clip)p.clip(headContour,paint);else paint();
  }
 };
 drawHair('back');
 bodyFront(pen,outfit,{seed:d.seed,expr,blink,mode:action==='sit'?'sit':walking?'stroll':'stand',hideLegs:walking,hipHeight:gait?.hipY,walkYaw:walking?yaw:undefined,frontDetail:view.body.front,phase,light,look:facing+(micro?Math.sin(t*.67+d.seed)*.15:0),facing,back:view.body.front<.025,faceBack:Math.cos(turn)<-.25,headTilt,wave:['wave','reach'].includes(action)?.5+.5*Math.sin(t*(action==='wave'?5:1)):undefined,prop:action==='hammer'?['hammer',.5+.5*Math.sin(t*18)]:action==='drill'?['drill',.8+.02*Math.sin(t*45)]:null});
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
  const headwear=outfit.hat==='cap'||outfit.hat==='fedora',color=headwear?outfit.cap??d.hair:d.hair;
  if(outfit.hat==='fedora')p.ell(cx,centerY,rx*1.28,ry*1.18,color,5);
  p.shadedFill(shape,!headwear&&d.hairStyle==='receding'?d.skin:color,!headwear&&d.hairStyle==='receding'?'#d8d8dc':mix(color,'#241726',.2),light,H.a);p.poly(shape,null,5);
  if(!headwear&&d.hairStyle==='receding')p.clip(shape,()=>{for(const side of [-1,1])p.ell(cx+side*rx*.83,centerY,rx*.19,ry*.77,d.hair,3);});
  if(d.hairStyle!=='receding')p.arc(cx-rx*.06,centerY-ry*.1,rx*.72,ry*.67,205,285,5,'#fff9f3');
  g.restore();
 }
 g.restore();
}
