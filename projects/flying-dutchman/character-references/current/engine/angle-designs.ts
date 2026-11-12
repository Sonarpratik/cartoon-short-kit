/** Authored 12-angle vector turnarounds. Coordinates are fractions of head radii.
 * Each key specifies hairline/temple/nape and torso construction; intermediate
 * frames morph matching contours rather than sliding a front drawing sideways.
 */
export type Point=[number,number];
export type Patch={id:string;points:Point[];layer:'back'|'front';clip:boolean;alpha:number};
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
const cache=new Map<string,AngleDesign[]>();
export function characterAngleDesigns(style:string,hat='hair'):AngleDesign[]{
 const key=style+'|'+hat;if(cache.has(key))return cache.get(key)!;
 const designs=BODY_KEYS.map((body,i)=>{
  const right=i<=6,patches:Patch[]=[],patch=(id:string,points:Point[],layer:'back'|'front'='front',clip=true,alpha=1)=>patches.push({id,points:contour(id.startsWith('temple')?rounded(points):points),layer,clip,alpha});
  if(hat==='cap'||hat==='fedora'){
   const profile=[0,.12,.30,.42,.27,.1,0,.1,.27,.42,.30,.12][i],direction=i<6?1:-1;
   if(hat==='fedora'){
    patch('hat-crown',[[-.96,-.43],[-.8,-1.18],[-.23,-1.39],[.06,-1.22],[.65,-1.29],[.98,-.43]],'front',false);
    patch('hat-band',[[-.94,-.62],[.96,-.62],[.99,-.44],[-.97,-.44]],'front',false);
    patch('hat-brim',[[-1.31,-.47],[.05+profile*direction,-.38],[1.31,-.46],[1.18+profile*direction,-.26],[-1.15+profile*direction,-.26]],'front',false);
   }else{
    patch('hat-crown',[[-1.03,-.37],[-.82,-.85],[-.4,-1.04],[0,-1.08],[.55,-.93],[.93,-.61],[1.03,-.37]]);
    patch('hat-brim',[[-.85,-.38],[.9,-.38],[.9+profile*direction,-.2],[.15+profile*direction,-.18],[-.85+profile*direction,-.24]],'front',false);
   }
  }else if(style==='receding'){
   const locks=at(LOCKS,i),build=(side:'left'|'right')=>{const [shift,width,alpha]=locks[side],x=side==='left'?-.90:.90,source=side==='left'?LOCK:mirror(LOCK);return {points:source.map(([px,py])=>[x+(px-x)*width,py+shift] as Point),alpha};};
   const left=build(right?'left':'right'),r=build(right?'right':'left');
   patch('temple-left',right?left.points:mirror(left.points),'front',true,left.alpha);patch('temple-right',right?r.points:mirror(r.points),'front',true,r.alpha);
  }else{
   if(style==='spiky'){
    const spikes=(right?at(STARS,i):mirror(at(STARS,i))).map(([x,y])=>[Math.sign(x)*(Math.abs(x)>1?1+(Math.abs(x)-1)*.35:Math.abs(x)),y<-.65?-.65+(y+.65)*.48:y] as Point);
    patch('spikes',spikes,'back',false);
   }
   const line=at(style==='spiky'?SPIKE_LINES:LINES,i),points=[...CAP_TOP,...line];patch('scalp',right?points:mirror(points));
   if(style==='bob'){
    patch('bob-left',[[-.9,-.5],[-1.11,-.2],[-1.13,.55],[-.92,.95],[-.69,.75],[-.8,.2]]);
    patch('bob-right',mirror([[-.9,-.5],[-1.11,-.2],[-1.13,.55],[-.92,.95],[-.69,.75],[-.8,.2]]),'front',true,body.front*.85+.15);
   }
  }
  return {angle:i*30,body:{...body},hair:patches};
 });cache.set(key,designs);return designs;
}
export function angleDesign(style:string,hat:string,yaw:number):AngleDesign{
 const keys=characterAngleDesigns(style,hat),position=((yaw%360+360)%360)/30,i=Math.floor(position),f=position-i,t=f*f*(3-2*f),a=keys[i],b=keys[(i+1)%12];
 const body=Object.fromEntries(Object.keys(a.body).map(key=>[key,a.body[key as keyof BodyDesign]+(b.body[key as keyof BodyDesign]-a.body[key as keyof BodyDesign])*t])) as BodyDesign;
 const hair=a.hair.map(p=>{const q=b.hair.find(q=>q.id===p.id)!;return {...p,alpha:p.alpha+(q.alpha-p.alpha)*t,points:p.points.map((v,j)=>[v[0]+(q.points[j][0]-v[0])*t,v[1]+(q.points[j][1]-v[1])*t] as Point)};});
 return {angle:yaw,body,hair};
}
