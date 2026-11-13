/** Authored 12-angle vector turnarounds. Coordinates are fractions of head radii.
 * Each key specifies hairline/temple/nape and torso construction; intermediate
 * frames morph matching contours rather than sliding a front drawing sideways.
 */
export type Point=[number,number];
/** kind selects the base colour (hair or outfit.cap); tone>0 darkens towards ink, tone<0 lightens; accent uses outfit.hatAccent. */
export type Patch={id:string;points:Point[];layer:'back'|'front';clip:boolean;alpha:number;kind?:'hair'|'hat';tone?:number;accent?:boolean};
export const HAIR_STYLES=['sidepart','receding','bob','spiky','curly','afro','bun','ponytail','long','buzz','braid'] as const;
export const HEADWEAR=['hair','cap','fedora','beanie','helmet','peaked','tricorn','bandana','tophat','headband','sheriff'] as const;
export type BodyDesign={width:number;front:number;shoulder:number;seam:number};
export type AngleDesign={angle:number;body:BodyDesign;hair:Patch[]};
export const BODY_KEYS:BodyDesign[]=[
 {width:1,front:1,shoulder:1,seam:0},
 {width:.97,front:.92,shoulder:.96,seam:0},
 {width:.84,front:.48,shoulder:.84,seam:0},
 {width:.72,front:0,shoulder:.72,seam:.35},
 {width:.84,front:0,shoulder:.84,seam:.85},
 {width:.97,front:0,shoulder:.96,seam:1},
 {width:1,front:0,shoulder:1,seam:1},
 {width:.97,front:0,shoulder:.96,seam:1},
 {width:.84,front:0,shoulder:.84,seam:.85},
 {width:.72,front:0,shoulder:.72,seam:.35},
 {width:.84,front:.48,shoulder:.84,seam:0},
 {width:.97,front:.92,shoulder:.96,seam:0},
];
const CAP_TOP:Point[]=[[-1.04,-.04],[-1.03,-.42],[-.82,-.86],[-.4,-1.04],[0,-1.08],[.48,-1.01],[.88,-.73],[1.04,-.36],[1.04,-.08]];
const LINES:Point[][]=[
 [[1.02,-.42],[.55,-.82],[.10,-.81],[-.23,-.49],[-.72,-.48],[-1.02,-.34]],
 [[1.02,-.46],[.75,-.77],[.43,-.8],[.02,-.54],[-.5,-.48],[-1.02,-.10]],
 [[1.02,-.58],[.8,-.73],[.57,-.65],[.3,-.53],[-.2,-.38],[-.65,.08],[-1.02,.15]],
 [[1.02,-.55],[.84,-.65],[.55,-.57],[.28,-.2],[.02,.15],[-.45,.42],[-1.02,.46]],
 [[1.02,-.02],[.6,.32],[0,.4],[-.55,.46],[-1.02,.44]],
 [[1.02,.32],[.55,.43],[0,.47],[-.55,.45],[-1.02,.36]],
 [[1.02,.37],[.55,.45],[0,.42],[-.55,.45],[-1.02,.37]],
];
const SPIKE_LINES:Point[][]=[
 [[1.02,-.46],[.58,-.62],[.32,-.52],[.06,-.66],[-.24,-.54],[-.56,-.66],[-1.02,-.5]],
 [[1.02,-.5],[.82,-.63],[.66,-.55],[.49,-.69],[.29,-.56],[.08,-.66],[-.18,-.5],[-.6,-.4],[-1.02,-.12]],
 [[1.02,-.58],[.82,-.68],[.68,-.58],[.54,-.65],[.36,-.51],[-.08,-.38],[-.58,.1],[-1.02,.2]],
 ...LINES.slice(3),
];
const STAR_FRONT:Point[]=[[-.94,.4],[-1.42,.24],[-1.08,-.16],[-1.54,-.5],[-1.04,-.64],[-1.28,-1.22],[-.68,-1.02],[-.58,-1.72],[-.24,-1.24],[.08,-1.92],[.36,-1.24],[.86,-1.66],[.78,-.96],[1.38,-1.14],[1.06,-.54],[1.54,-.34],[1.12,-.04],[1.4,.3],[.94,.38]];
const STARS:Point[][]=[STAR_FRONT,
 [[-1.02,.4],[-1.5,.22],[-1.2,-.12],[-1.57,-.45],[-1.13,-.63],[-1.32,-1.18],[-.83,-1.01],[-.67,-1.7],[-.3,-1.28],[-.02,-1.9],[.3,-1.25],[.68,-1.58],[.68,-.97],[1.12,-1.09],[.91,-.55],[1.25,-.36],[.98,-.08],[1.06,.22],[.7,.35]],
 [[-1.03,.42],[-1.52,.24],[-1.26,-.1],[-1.6,-.42],[-1.2,-.64],[-1.38,-1.14],[-.9,-1.02],[-.72,-1.65],[-.37,-1.27],[-.12,-1.85],[.18,-1.27],[.52,-1.5],[.53,-1.02],[.84,-1.06],[.69,-.57],[.85,-.3],[.6,-.12],[.43,.22],[.12,.38]],
 [[-.82,.42],[-1.4,.2],[-1.22,-.1],[-1.54,-.33],[-1.18,-.5],[-1.4,-.8],[-1.04,-.82],[-1.2,-1.21],[-.79,-1.03],[-.74,-1.64],[-.43,-1.28],[-.21,-1.72],[.08,-1.26],[.38,-1.39],[.44,-1.08],[.62,-.97],[.48,-.65],[.22,-.3],[-.25,.1]],
 [[-.85,.43],[-1.45,.22],[-1.23,-.13],[-1.5,-.44],[-1.17,-.61],[-1.34,-1.12],[-.82,-1.03],[-.66,-1.68],[-.34,-1.24],[-.01,-1.86],[.27,-1.26],[.58,-1.52],[.62,-.94],[.98,-1.08],[.89,-.54],[1.15,-.31],[.82,-.01],[.83,.3],[.4,.43]],
 [[-.94,.42],[-1.48,.23],[-1.15,-.15],[-1.56,-.47],[-1.08,-.63],[-1.3,-1.19],[-.72,-1.04],[-.61,-1.7],[-.26,-1.27],[.06,-1.89],[.34,-1.23],[.8,-1.61],[.77,-.97],[1.29,-1.12],[1.04,-.57],[1.46,-.32],[1.09,-.04],[1.3,.3],[.87,.4]],
 STAR_FRONT.map(([x,y])=>[x,y+.025*Math.cos(x*7)] as Point),
];
const LOCK:Point[]=[[-.88,-.34],[-1.005,-.20],[-1.035,.08],[-.99,.31],[-.88,.43],[-.78,.29],[-.81,.04],[-.78,-.16]];
const LOCKS:{left:[number,number,number];right:[number,number,number]}[]=[
 {left:[0,1,1],right:[0,1,1]},
 {left:[-.015,.94,1],right:[0,.18,.18]},
 {left:[-.015,.85,1],right:[0,0,0]},
 {left:[0,1.05,1],right:[0,0,0]},
 {left:[-.015,1.05,1],right:[0,.25,.25]},
 {left:[0,1,1],right:[0,.72,.72]},
 {left:[0,1,1],right:[0,1,1]},
];
const mirror=(points:Point[]):Point[]=>points.map(([x,y])=>[-x,y] as Point).reverse();
function rounded(points:Point[]):Point[]{const result:Point[]=[];for(let i=0;i<points.length;i++)for(let k=0;k<8;k++){const t=k/8,s=1-t,a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length],d=points[(i+2)%points.length];result.push([0,1].map(j=>(s*s*s*a[j]+(3*t*t*t-6*t*t+4)*b[j]+(-3*t*t*t+3*t*t+3*t+1)*c[j]+t*t*t*d[j])/6) as Point);}return result;}
function at<T>(items:T[],i:number){return items[i<=6?i:12-i];}
function contour(points:Point[],count=64):Point[]{
 const area=points.reduce((sum,p,i)=>sum+p[0]*points[(i+1)%points.length][1]-points[(i+1)%points.length][0]*p[1],0);
 points=area<0?[...points].reverse():[...points];let start=0;for(let i=1;i<points.length;i++)if(points[i][1]<points[start][1]||points[i][1]===points[start][1]&&points[i][0]<points[start][0])start=i;points=[...points.slice(start),...points.slice(0,start)];
 const lengths:number[]=[0];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];lengths.push(lengths.at(-1)!+Math.hypot(b[0]-a[0],b[1]-a[1]));}
 const result:Point[]=[];let segment=0;for(let i=0;i<count;i++){const distance=i/count*lengths.at(-1)!;while(segment<points.length-1&&lengths[segment+1]<distance)segment++;const a=points[segment],b=points[(segment+1)%points.length],t=(distance-lengths[segment])/Math.max(1e-8,lengths[segment+1]-lengths[segment]);result.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return result;
}

const HAT_IDS=new Set(['hat','cuff','pom','rim','stripe','visor','badge','brim','cockade','knot','dots','band']);
const NEW_STYLES=new Set(['curly','afro','bun','ponytail','long','buzz','braid']);
const NEW_HATS=new Set(['beanie','helmet','peaked','tricorn','bandana','tophat','sheriff']);
type PatchFn=(id:string,points:Point[],layer?:'back'|'front',clip?:boolean,alpha?:number,extra?:Partial<Patch>)=>void;
const ring=(cx:number,cy:number,rx:number,ry:number,n=16):Point[]=>Array.from({length:n},(_,k)=>{const a=k/n*Math.PI*2;return [cx+rx*Math.cos(a),cy+ry*Math.sin(a)] as Point;});
const shiftX=(points:Point[],dx:number):Point[]=>points.map(([x,y])=>[x+dx,y] as Point);
/** Insert a downward bump between hairline points: curly fringe. */
const scallop=(line:Point[],amp:number):Point[]=>line.flatMap((p,k)=>k===0?[p]:[[(line[k-1][0]+p[0])/2,(line[k-1][1]+p[1])/2+amp] as Point,p]);
/** Bumpy hair cloud over the top of the head (curly/afro), drawn behind the head contour. */
function cloud(cx:number,cy:number,rx:number,ry:number,bumps:number,bottom:number):Point[]{
 const points:Point[]=[];
 for(let k=0;k<=bumps*2;k++){const t=k/(bumps*2),a=Math.PI*(1.08-1.16*t),r=k%2?1.1:1;points.push([cx+rx*r*Math.cos(a),cy-ry*r*Math.sin(a)]);}
 points.push([cx+rx*.92,bottom],[cx-rx*.92,bottom]);return points;
}
const LONG_LOCK:Point[]=[[-.88,-.55],[-1.12,-.2],[-1.17,.6],[-1.08,1.25],[-.86,1.34],[-.72,.92],[-.78,.2]];
const LONG_BACK:Point[]=[[-1.08,-.55],[-1.2,.2],[-1.22,.95],[-1.06,1.48],[-.4,1.55],[.4,1.55],[1.06,1.48],[1.22,.95],[1.2,.2],[1.08,-.55],[.6,-1.08],[0,-1.14],[-.6,-1.08]];
/** Hair that stays visible under any headwear (volume, length, tails). */
function hairUnderHat(style:string,patch:PatchFn,sn:number,cs:number,body:BodyDesign){
 // The lock on the side the face turns towards falls behind the far cheek instead of ghosting over the face.
 if(style==='long'){patch('long-back',shiftX(LONG_BACK,-.22*sn),'back',false);patch('long-left',LONG_LOCK,sn<-.6?'back':'front',false);patch('long-right',mirror(LONG_LOCK),sn>.6?'back':'front',false);}
 if(style==='bob'){const lock:Point[]=[[-.9,-.5],[-1.11,-.2],[-1.13,.55],[-.92,.95],[-.69,.75],[-.8,.2]];patch('bob-left',lock,'front',false);patch('bob-right',mirror(lock),'front',false,body.front*.85+.15);}
 if(style==='curly'||style==='afro'){const big=style==='afro';patch('curls-back',cloud(-.1*sn,big?-.3:-.32,big?1.5:1.2,big?1.3:.98,big?9:8,big?.35:.12),'back',false);}
 if(style==='ponytail')ponytail(patch,sn,cs);
 if(style==='braid')braid(patch,sn,cs);
}
function ponytail(patch:PatchFn,sn:number,cs:number){
 const x0=-.95*sn,dir=sn>=0?-1:1,a=Math.abs(sn);
 patch('tail',[[x0-.13,-.58],[x0+.15,-.52],[x0+dir*.34*a+.1,.2],[x0+dir*.42*a+.02,.8],[x0+dir*.3*a-.1,.9],[x0+dir*.12*a-.14,.15]],cs<-.3?'front':'back',false);
}
/** Single plait on the character's right side: starts behind the ear and falls forward over the shoulder.
 * Each lobe is a 3D point (X side, Z forward) projected per view, so the braid never slides across the face. */
function braid(patch:PatchFn,sn:number,cs:number){
 const lobes=6,X=-.86,proj=(z:number)=>({x:X*cs+z*sn,depth:-X*sn+z*cs});
 for(let k=0;k<lobes;k++){const t=k/(lobes-1),y=.16+t*1.32,{x,depth}=proj(-.32+.6*t),r=.2-.05*t,cx=x+(k%2?.05:-.05);
  patch('braid-'+k,ring(cx,y,r,r*.82,14).map(([px,py])=>[px+(py-y)*(k%2?.17:-.17),py] as Point),depth>-.05?'front':'back',false);}
 const {x,depth}=proj(.3),ty=1.66,layer=depth>-.05?'front':'back';
 patch('braid-tie',ring(x,ty,.1,.07,10),layer,false,1,{tone:.5});
 patch('braid-tuft',[[x-.1,ty+.04],[x+.1,ty+.04],[x+.14,ty+.3],[x,ty+.22],[x-.14,ty+.3]],layer,false);
}
function newHair(style:string,patch:PatchFn,i:number,right:boolean,sn:number,cs:number,body:BodyDesign){
 const line=at(LINES,i);
 if(style==='buzz'){const points=[...CAP_TOP,...line.map(([x,y])=>[x,y-.12] as Point)];patch('scalp',right?points:mirror(points),'front',true,1,{tone:-.08});return;}
 if(style==='curly'||style==='afro'){
  hairUnderHat(style,patch,sn,cs,body);
  const points=[...CAP_TOP,...scallop(line,.09)];patch('scalp',right?points:mirror(points));return;
 }
 const points=[...CAP_TOP,...line];patch('scalp',right?points:mirror(points));
 if(style==='bun')patch('bun',ring(-.4*sn,-1.08,.38,.32),cs<-.3?'front':'back',false);
 if(style==='ponytail')ponytail(patch,sn,cs);
 if(style==='braid')braid(patch,sn,cs);
 if(style==='long')hairUnderHat(style,patch,sn,cs,body);
}
/** Headwear built from per-view projections of a few 3D anchor points. */
function newHat(hat:string,patch:PatchFn,sn:number,cs:number,hw:number,front:number){
 const fwd=.42*sn;
 if(hat==='beanie'){
  patch('hat-crown',[[-1.07,-.25],[-1.1,-.7],[-.85-.1*sn,-1.12],[-.4-.12*sn,-1.32],[-.12*sn,-1.37],[.4-.12*sn,-1.32],[.85-.1*sn,-1.12],[1.1,-.7],[1.07,-.25]],'front',false);
  patch('cuff',[[-1.11,-.5],[1.11,-.5],[1.13,-.2],[-1.13,-.2]],'front',false,1,{tone:.2});
  patch('pom',ring(-.14*sn,-1.43,.22,.2),'front',false,1,{accent:true});
 }else if(hat==='helmet'){
  patch('hat-crown',[[-1.13,-.28],[-1.14,-.75],[-.82,-1.18],[0,-1.33],[.82,-1.18],[1.14,-.75],[1.13,-.28]],'front',false);
  patch('stripe',[[-1.14,-.66],[1.14,-.66],[1.14,-.54],[-1.14,-.54]],'front',false,1,{accent:true});
  patch('rim',[[-1.2,-.38],[1.2+.25*Math.max(0,sn),-.38],[1.24+.25*Math.max(0,sn),-.24],[-1.24+.25*Math.min(0,sn),-.24]],'front',false,1,{tone:.28});
 }else if(hat==='peaked'){
  patch('hat-crown',[[-1.02,-.4],[-1.2+.15*sn,-.95],[-.72+.15*sn,-1.32],[.72+.15*sn,-1.32],[1.2+.15*sn,-.95],[1.02,-.4]],'front',false);
  patch('cuff',[[-1.04,-.64],[1.04,-.64],[1.04,-.4],[-1.04,-.4]],'front',false,1,{tone:.42});
  patch('visor',[[-.85,-.42],[.9,-.42],[.9+fwd,-.27],[.15+fwd,-.2],[-.85+fwd,-.29]],'front',false,1,{tone:.6});
  const bx=.85*sn/hw;patch('badge',[[bx,-1.0],[bx+.16,-.84],[bx,-.68],[bx-.16,-.84]],'front',false,front,{accent:true});
 }else if(hat==='tricorn'){
  patch('hat-crown',[[-.95,-.5],[-.9,-.95],[-.45,-1.27],[.45,-1.27],[.9,-.95],[.95,-.5]],'front',false);
  const fp=.9*sn;patch('brim',[[-1.52,-.32],[-1.36,-1.02],[-.85,-.64],[.85,-.64],[1.36,-1.02],[1.52,-.32],[fp+.48,-.42],[fp,-.2],[fp-.48,-.42]],'front',false,1,{tone:.12});
  patch('cockade',ring((-.7*cs+.6*sn)/hw,-.72,.13,.13,12),'front',false,Math.max(0,Math.min(1,(cs+.3)/.6)),{accent:true});
 }else if(hat==='bandana'){
  patch('hat-crown',[...CAP_TOP,[1.04,-.36],[.5,-.47],[0,-.5],[-.5,-.47],[-1.04,-.36]]);
  const x0=-1.0*sn/hw,dir=sn>=0?-1:1;
  patch('knot',[[x0,-.52],[x0+dir*.48,-.7],[x0+dir*.52,-.38],[x0+dir*.18,-.36],[x0+dir*.58,-.04],[x0+dir*.36,.1],[x0,-.3]],'back',false);
  patch('dots-a',ring(-.45+.3*sn,-.78,.07,.07,8),'front',true,front,{accent:true});
  patch('dots-b',ring(.08+.3*sn,-.88,.07,.07,8),'front',true,front,{accent:true});
  patch('dots-c',ring(.55+.3*sn,-.72,.07,.07,8),'front',true,front,{accent:true});
 }else if(hat==='sheriff'){
  // Western sheriff hat: tall crown pinched at the top, dark band with a star, wide brim with upturned ends.
  // The brim leans toward the facing side and thins in profile, like the fedora brim.
  const tilt=.18*sn,thin=.55+.45*Math.abs(cs);
  patch('hat-crown',[[-.82,-.42],[-.84,-1.05],[-.7,-1.42],[-.38,-1.5],[-.12,-1.36],[0,-1.3],[.12,-1.36],[.38,-1.5],[.7,-1.42],[.84,-1.05],[.82,-.42]].map(([x,y])=>[x+tilt*(y+.4)*-.3,y] as Point),'front',false);
  patch('band',[[-.83,-.66],[.83,-.66],[.83,-.48],[-.83,-.48]],'front',false,1,{tone:.55});
  const bx=-.42*sn;patch('badge',[[bx,-.8],[bx+.07,-.66],[bx+.2,-.64],[bx+.1,-.55],[bx+.13,-.42],[bx,-.49],[bx-.13,-.42],[bx-.1,-.55],[bx-.2,-.64],[bx-.07,-.66]].map(([x,y])=>[x,y+.1] as Point),'front',false,front,{accent:true});
  const w=1.62,lip=.28*thin;
  patch('brim',[[-w,-.78],[-w+.18,-.56],[-1.05,-.47],[0,-.44],[1.05,-.47],[w-.18,-.56],[w,-.78],[w+.04,-.6],[w-.2,-.4],[1.05,-.44+lip*.25],[0,-.44+lip*.4],[-1.05,-.44+lip*.25],[-w+.2,-.4],[-w-.04,-.6]].map(([x,y])=>[x*(.62+.38*Math.abs(cs))+fwd*.35,y] as Point),'front',false,1,{tone:.06});
 }else if(hat==='tophat'){
  patch('hat-crown',[[-.7,-.92],[-.75,-2.0],[.75,-2.0],[.7,-.92]],'front',false);
  patch('band',[[-.71,-1.2],[.71,-1.2],[.71,-.98],[-.71,-.98]],'front',false,1,{tone:.5});
  patch('brim',[[-1.25,-.98],[0,-1.03],[1.25,-.98],[1.2,-.83],[0,-.79],[-1.2,-.83]],'front',false,1,{tone:.2});
 }
}
const cache=new Map<string,AngleDesign[]>();
export function characterAngleDesigns(style:string,hat='hair'):AngleDesign[]{
 const key=style+'|'+hat;if(cache.has(key))return cache.get(key)!;
 const designs=BODY_KEYS.map((body,i)=>{
  const right=i<=6,patches:Patch[]=[],patch=(id:string,points:Point[],layer:'back'|'front'='front',clip=true,alpha=1,extra:Partial<Patch>={})=>patches.push({id,points:contour(id.startsWith('temple')?rounded(points):points),layer,clip,alpha,kind:hat!=='hair'&&HAT_IDS.has(id.split('-')[0])?'hat':'hair',...extra});
  const ang=i*30*Math.PI/180,sn=Math.sin(ang),cs=Math.cos(ang),hw=Math.hypot(cs,.85*sn),front=Math.max(0,Math.min(1,(cs+.2)/.5));
  const band=hat==='headband';
  if(hat!=='hair'&&!band)hairUnderHat(style,patch,sn,cs,body);
  if(NEW_HATS.has(hat))newHat(hat,patch,sn,cs,hw,front);
  else if(hat==='cap'||hat==='fedora'){
   const profile=[0,.12,.30,.42,.27,.1,0,.1,.27,.42,.30,.12][i],direction=i<6?1:-1;
   if(hat==='fedora'){
    patch('hat-crown',[[-.96,-.43],[-.8,-1.18],[-.23,-1.39],[.06,-1.22],[.65,-1.29],[.98,-.43]],'front',false);
    patch('hat-band',[[-.94,-.62],[.96,-.62],[.99,-.44],[-.97,-.44]],'front',false);
    patch('hat-brim',[[-1.31,-.47],[.05+profile*direction,-.38],[1.31,-.46],[1.18+profile*direction,-.26],[-1.15+profile*direction,-.26]],'front',false);
   }else{
    patch('hat-crown',[[-1.03,-.37],[-.82,-.85],[-.4,-1.04],[0,-1.08],[.55,-.93],[.93,-.61],[1.03,-.37]]);
    patch('hat-brim',[[-.85,-.38],[.9,-.38],[.9+profile*direction,-.2],[.15+profile*direction,-.18],[-.85+profile*direction,-.24]],'front',false);
   }
  }else if(NEW_STYLES.has(style)){
   newHair(style,patch,i,right,sn,cs,body);
  }else if(style==='receding'){
   const locks=at(LOCKS,i),build=(side:'left'|'right')=>{const [shift,width,alpha]=locks[side],x=side==='left'?-.90:.90,source=side==='left'?LOCK:mirror(LOCK);return {points:source.map(([px,py])=>[x+(px-x)*width,py+shift] as Point),alpha};};
   const left=build(right?'left':'right'),r=build(right?'right':'left');
   patch('temple-left',right?left.points:mirror(left.points),'front',true,left.alpha);patch('temple-right',right?r.points:mirror(r.points),'front',true,r.alpha);
  }else{
   if(style==='spiky')patch('spikes',right?at(STARS,i):mirror(at(STARS,i)),'back',false);
   const line=at(style==='spiky'?SPIKE_LINES:LINES,i),points=[...CAP_TOP,...line];patch('scalp',right?points:mirror(points));
   if(style==='bob'){
    patch('bob-left',[[-.9,-.5],[-1.11,-.2],[-1.13,.55],[-.92,.95],[-.69,.75],[-.8,.2]]);
    patch('bob-right',mirror([[-.9,-.5],[-1.11,-.2],[-1.13,.55],[-.92,.95],[-.69,.75],[-.8,.2]]),'front',true,body.front*.85+.15);
   }
  }
  // Headband: full hair stays, a fabric band wraps the head across the upper forehead (clipped to the head contour).
  if(band)patch('band-head',[[-1.15,-.6],[-.5,-.7],[0,-.72],[.5,-.7],[1.15,-.6],[1.15,-.42],[.5,-.52],[0,-.54],[-.5,-.52],[-1.15,-.42]],'front',true);
  return {angle:i*30,body:{...body},hair:patches};
 });cache.set(key,designs);return designs;
}
export function angleDesign(style:string,hat:string,yaw:number):AngleDesign{
 const keys=characterAngleDesigns(style,hat),position=((yaw%360+360)%360)/30,i=Math.floor(position),f=position-i,t=f*f*(3-2*f),a=keys[i],b=keys[(i+1)%12];
 const body=Object.fromEntries(Object.keys(a.body).map(key=>[key,a.body[key as keyof BodyDesign]+(b.body[key as keyof BodyDesign]-a.body[key as keyof BodyDesign])*t])) as BodyDesign;
 const hair=a.hair.map(p=>{const q=b.hair.find(q=>q.id===p.id)!;return {...p,alpha:p.alpha+(q.alpha-p.alpha)*t,points:p.points.map((v,j)=>[v[0]+(q.points[j][0]-v[0])*t,v[1]+(q.points[j][1]-v[1])*t] as Point)};});
 return {angle:yaw,body,hair};
}
