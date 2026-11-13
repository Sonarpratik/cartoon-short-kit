import * as T from 'three';
import {CharacterPen} from './engine/face-style';
import {bodyFront,bodySide,type Expr,type Outfit} from './engine/toon';
export class Actor{
 age=0;
 cv=document.createElement('canvas');tex:T.CanvasTexture;mesh:T.Mesh;shadow:T.Mesh;
 constructor(root:T.Object3D,public older=false){this.cv.width=900;this.cv.height=1500;this.tex=new T.CanvasTexture(this.cv);this.tex.colorSpace=T.SRGBColorSpace;
 const geo=new T.PlaneGeometry(1.5,2.5);geo.translate(0,1.1875,0);this.mesh=new T.Mesh(geo,new T.MeshBasicMaterial({map:this.tex,transparent:true,alphaTest:.15,side:T.DoubleSide}));this.mesh.castShadow=true;
 this.mesh.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:this.tex,alphaTest:.3,side:T.DoubleSide});root.add(this.mesh);
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!,gr=g.createRadialGradient(64,64,1,64,64,60);gr.addColorStop(0,'rgba(19,20,37,.5)');gr.addColorStop(1,'rgba(19,20,37,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);
 this.shadow=new T.Mesh(new T.PlaneGeometry(1,.55),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.shadow.position.y=.012;root.add(this.shadow);}
 update(camera:T.Camera,f:number,expr:Expr='neutral',side=false,grip?:T.Vector3,working=false,direction?:-1|1,walking=false){
 this.mesh.rotation.y=Math.atan2(camera.position.x-this.mesh.position.x,camera.position.z-this.mesh.position.z);this.shadow.position.x=this.mesh.position.x;this.shadow.position.z=this.mesh.position.z;
 const g=this.cv.getContext('2d')!;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,900,1500);g.scale(1.5,1.5);const pen=new CharacterPen(g);
 const age=this.older?1:T.MathUtils.clamp(this.age,0,1),coat=age>=.82;
 const hair=new T.Color('#634331').lerp(new T.Color('#a9b2b1'),Math.min(1,age/.5));if(age>.5)hair.lerp(new T.Color('#b9d9ef'),(age-.5)*2);
 const outfit:Outfit={jacket:coat?'#eef1eb':'#397d7e',pants:'#344653',boots:'#322d39',hat:'hair',hair:'#'+hair.getHexString(),hairStyle:age>=.7?'spiky':age>=.33?'receding':'sidepart',buttons:'#d4b57d',labCoat:coat};
 const blink=f%113>=109;const look=direction??(this.older?-1:1);
 if(side)bodySide(pen,outfit,{mode:walking?'march':'stand',phase:f/18,stride:.45,seed:3,expr,blink,light:-2.2});else bodyFront(pen,outfit,{mode:walking?'stroll':'stand',phase:f/18,seed:3,expr,blink,look,facing:look,light:-2.2,headTilt:expr==='nervous'?-.08:0,prop:working?['hammer',.5+.5*Math.sin(f*1.7)]:null,tilt:working?3*Math.sin(f*.7):0});
 if(grip){this.mesh.updateMatrixWorld(true);const normal=new T.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);const plane=new T.Plane().setFromNormalAndCoplanarPoint(normal,this.mesh.position);const ray=new T.Ray(camera.position.clone(),grip.clone().sub(camera.position).normalize());const hit=new T.Vector3();ray.intersectPlane(plane,hit);const q=this.mesh.worldToLocal(hit);const x=300+q.x/1.5*600,y=975-q.y/2.5*1000;pen.stroke([[this.older?243:357,585],[x,y]],9,'#292532');pen.ell(x,y,10,10,'#faf9f5',3);}
 this.tex.needsUpdate=true;}
 visible(v:boolean){this.mesh.visible=v;this.shadow.visible=v;}
}
