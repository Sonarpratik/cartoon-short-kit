/** Depth-tested triangle hair meshes, projected in head-local coordinates.
 * The skull is an ellipsoid occluder. No silhouette squeezing, yaw-specific sprites,
 * alpha cross-fades, or separate top-view hair asset are used here.
 */
type V=[number,number,number];
type Face={p:V[];color:string;gloss?:boolean};
export type HairDesign={hair:string;hairStyle:string;seed:number};
const meshes=new Map<string,Face[]>(),images=new Map<string,{canvas:HTMLCanvasElement;x:number;y:number;width:number;height:number}>();
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=(a:V):V=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l) as V;};
const add=(a:V,b:V,k=1):V=>a.map((x,i)=>x+b[i]*k) as V;
function geometry(d:HairDesign,a:number,b:number,c:number){
 const key=[d.hair,d.hairStyle,d.seed,a,b,c].join('|');if(meshes.has(key))return meshes.get(key)!;const faces:Face[]=[];
 const tri=(x:V,y:V,z:V,color=d.hair,gloss=false)=>faces.push({p:[x,y,z],color,gloss});
 const point=(lat:number,lon:number,r=1.045):V=>[a*Math.cos(lat)*Math.sin(lon)*r,b*Math.sin(lat)*r,c*Math.cos(lat)*Math.cos(lon)*r];
 const edge=(lon:number)=>{const front=(Math.cos(lon)+1)/2,sweep=d.hairStyle==='sidepart'?-.18*Math.sin(lon)*front:0;return .28-.91*front+sweep+.035*Math.cos(lon*9+d.seed);};
 const rows=16,cols=64;
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
  const lon=i/cols*Math.PI*2,next=(i+1)/cols*Math.PI*2,lat=(u:number,v:number)=>-Math.PI/2+(edge(v)+Math.PI/2)*u;
  if(d.hairStyle==='receding'&&(Math.abs(Math.sin(lon))<.81||j/rows<.68))continue;
  const p=point(lat(j/rows,lon),lon),q=point(lat((j+1)/rows,lon),lon),r=point(lat((j+1)/rows,next),next),s=point(lat(j/rows,next),next);tri(p,q,r);tri(p,r,s);
 }
 // Broad tapered clumps, each with a closed, six-sided base and true depth.
 function clump(base:V,tip:V,radius:number){const axis=unit(add(tip,base,-1)),u=unit(cross(axis,Math.abs(axis[1])>.8?[1,0,0]:[0,1,0])),v=cross(axis,u),ring:V[]=[];
  for(let i=0;i<6;i++){const t=i/6*Math.PI*2;ring.push(add(add(base,u,Math.cos(t)*radius),v,Math.sin(t)*radius));}
  for(let i=0;i<6;i++){tri(ring[i],ring[(i+1)%6],tip);tri(base,ring[(i+1)%6],ring[i]);}
 }
 if(d.hairStyle==='spiky'){
  // Preserve the inventor's broad irregular radial silhouette from the approved design.
  for(let i=0;i<11;i++){const t=(-.11+i/10*1.22)*Math.PI,variation=1+.08*Math.sin(i*2.3+d.seed),base:V=[a*.83*Math.cos(t),-b*.83*Math.sin(t),-c*.48],tip:V=[a*1.53*Math.cos(t)*variation,-b*1.83*Math.sin(t)*variation,-c*(.4+.12*Math.sin(i*1.7))];clump(base,tip,a*(.23+.025*Math.cos(i)));}
  // Rear crown clumps give the silhouette volume in profile and overhead views.
  for(let i=0;i<5;i++){const lon=Math.PI*.60+i/4*Math.PI*.80,base=point(-.85,lon),normal=unit([base[0]/a,base[1]/b,base[2]/c]);clump(base,add(base,normal,a*.42),a*.20);}
 }
 // A curved glossy ribbon is attached to the scalp surface and rotates with it.
 if(d.hairStyle!=='receding')for(let i=0;i<32;i++){
  const u=i/32,v=(i+1)/32,lon=(t:number)=>-.92+t*1.65,lat=(t:number)=>-1.05-.10*Math.sin(t*Math.PI),width=(t:number)=>.025*Math.pow(Math.sin(t*Math.PI),.7);
  const p=point(lat(u)-width(u),lon(u),1.065),q=point(lat(u)+width(u),lon(u),1.065),r=point(lat(v)+width(v),lon(v),1.065),s=point(lat(v)-width(v),lon(v),1.065);tri(p,q,r,'#fff9f3',true);tri(p,r,s,'#fff9f3',true);
 }
 meshes.set(key,faces);return faces;
}
export function hairMesh(d:HairDesign,a:number,b:number){return geometry(d,a,b,a*.85);}
export function projectHairPoint(p:V,yaw:number,pitch:number):V{
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),z=p[2]*cy-p[0]*sy;
 return [p[0]*cy+p[2]*sy,p[1]*cp+z*sp,z*cp-p[1]*sp];
}
/** Near ray/ellipsoid intersection in the same camera coordinates as the triangles. */
export function skullDepth(x:number,y:number,a:number,b:number,c:number,yaw:number,pitch:number){
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const origin:V=[cy*x-sy*sp*y,cp*y,sy*x+cy*sp*y],ray:V=[-sy*cp,-sp,cy*cp],r=[a,b,c];let A=0,B=0,C=-1;
 for(let i=0;i<3;i++){A+=ray[i]**2/r[i]**2;B+=origin[i]*ray[i]/r[i]**2;C+=origin[i]**2/r[i]**2;}
 const disc=B*B-A*C;return disc<0?-Infinity:(-B+Math.sqrt(disc))/A;
}
export function drawHair3D(g:CanvasRenderingContext2D,d:HairDesign,cx:number,cy:number,a:number,b:number,yaw:number,pitch:number){
 const c=a*.85,key=[d.hair,d.hairStyle,d.seed,a,b,yaw.toFixed(5),pitch.toFixed(5)].join('|');let entry=images.get(key);
 if(!entry){
  const faces=geometry(d,a,b,c),projected=faces.map(f=>({...f,q:f.p.map(p=>projectHairPoint(p,yaw,pitch))})),all=projected.flatMap(f=>f.q),left=Math.floor(Math.min(...all.map(p=>p[0])))-4,top=Math.floor(Math.min(...all.map(p=>p[1])))-4,right=Math.ceil(Math.max(...all.map(p=>p[0])))+4,bottom=Math.ceil(Math.max(...all.map(p=>p[1])))+4;
  const scale=1.5,width=right-left,height=bottom-top,w=Math.ceil(width*scale),h=Math.ceil(height*scale),depth=new Float32Array(w*h).fill(-Infinity),pixels=new Uint8ClampedArray(w*h*4),skull=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)skull[y*w+x]=skullDepth(left+(x+.5)/scale,top+(y+.5)/scale,a,b,c,yaw,pitch);
  for(const f of projected){const q=f.q.map(p=>[(p[0]-left)*scale,(p[1]-top)*scale,p[2]] as V),[p0,p1,p2]=q,den=(p1[1]-p2[1])*(p0[0]-p2[0])+(p2[0]-p1[0])*(p0[1]-p2[1]);if(Math.abs(den)<1e-7)continue;
   const normal=unit(cross(add(f.p[1],f.p[0],-1),add(f.p[2],f.p[0],-1))),light=f.gloss?1:.82+.18*Math.abs(normal[0]*-.45+normal[1]*-.75+normal[2]*.48),hex=parseInt(f.color.slice(1),16),rgb=[hex>>16&255,hex>>8&255,hex&255].map(v=>Math.round(v*light));
   const x0=Math.max(0,Math.floor(Math.min(...q.map(p=>p[0])))),x1=Math.min(w-1,Math.ceil(Math.max(...q.map(p=>p[0])))),y0=Math.max(0,Math.floor(Math.min(...q.map(p=>p[1])))),y1=Math.min(h-1,Math.ceil(Math.max(...q.map(p=>p[1]))));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const px=x+.5,py=y+.5,u=((p1[1]-p2[1])*(px-p2[0])+(p2[0]-p1[0])*(py-p2[1]))/den,v=((p2[1]-p0[1])*(px-p2[0])+(p0[0]-p2[0])*(py-p2[1]))/den;if(u<-.0001||v<-.0001||u+v>1.0001)continue;const z=u*p0[2]+v*p1[2]+(1-u-v)*p2[2],idx=y*w+x;if(z<skull[idx]-.65||z<=depth[idx])continue;depth[idx]=z;const off=idx*4;pixels[off]=rgb[0];pixels[off+1]=rgb[1];pixels[off+2]=rgb[2];pixels[off+3]=255;}
  }
  // Ink the actual visible surface boundary, not every triangle edge.
  const out=pixels.slice();for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const idx=y*w+x,off=idx*4;if(!pixels[off+3])continue;if(!pixels[(idx-1)*4+3]||!pixels[(idx+1)*4+3]||!pixels[(idx-w)*4+3]||!pixels[(idx+w)*4+3]){
   for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(dx*dx+dy*dy>10||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const target=((y+dy)*w+x+dx)*4;if(!pixels[target+3]||(dx===0&&dy===0)){out[target]=41;out[target+1]=35;out[target+2]=51;out[target+3]=255;}}
  }}
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d')!.putImageData(new ImageData(out,w,h),0,0);entry={canvas,x:left,y:top,width,height};images.set(key,entry);if(images.size>48)images.delete(images.keys().next().value!);
 }
 g.drawImage(entry.canvas,cx+entry.x,cy+entry.y,entry.width,entry.height);
}
