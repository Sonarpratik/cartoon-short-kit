import * as THREE from 'three';
import {EffectComposer,RenderPass,EffectPass,BloomEffect,BlendFunction,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,noInkFallback} from './engine/ink';
import {LensBlur} from './engine/lensblur';
import {GradeEffect,GRADE_DAY2} from './engine/grade';
import {CARD_K} from './engine/cardshade';
import {Character} from './characters';
import {SCENES,sceneAt} from './story';
import {FPS,TOTAL,duration,type SceneInstance} from './types';
import {setLight,PALETTES} from './world';

const screen=document.querySelector<HTMLDivElement>('#screen')!,status=document.querySelector<HTMLParagraphElement>('#status')!;
const slider=document.querySelector<HTMLInputElement>('#frame')!,select=document.querySelector<HTMLSelectElement>('#scene')!;
const play=document.querySelector<HTMLButtonElement>('#play')!,time=document.querySelector<HTMLOutputElement>('#time')!,voice=document.querySelector<HTMLAudioElement>('#voice')!;
const api=window as unknown as {ready:boolean;renderFrame:(f:number)=>void;frameMeta:unknown;totalFrames:number;fps:number;currentFrame:number;lastError?:string};
api.ready=false;
const scale=Number(new URLSearchParams(location.search).get('scale')||.5);
if(!Number.isFinite(scale)||scale<=0||scale>2)throw new Error('Invalid render scale');
const width=Math.round(1080*scale),height=Math.round(1920*scale);
const renderer=new THREE.WebGLRenderer({antialias:false,stencil:false,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(width,height);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;screen.append(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(39,9/16,.2,80);
const sun=new THREE.DirectionalLight('#ffe0ac',2.5);sun.castShadow=true;sun.position.set(-12,3.4,7.2);sun.target.position.set(0,1,0);sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;sun.shadow.normalBias=.025;
Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:45});sun.shadow.camera.updateProjectionMatrix();
const hemi=new THREE.HemisphereLight('#bacbd1','#6b665c',.6);scene.add(sun,sun.target,hemi);
const composer=new EffectComposer(renderer,{multisampling:4,frameBufferType:THREE.HalfFloatType});
const lens=new LensBlur({maxCoC:14,nearScale:1.0});
const grade=new GradeEffect({...GRADE_DAY2,sat:[1,1.02,1],vig:[.12,.45]},.72);
composer.addPass(new RenderPass(scene,camera));composer.addPass(new InkPass(scene,camera));composer.addPass(new EffectPass(camera,lens.pre));composer.addPass(new EffectPass(camera,lens.main));
composer.addPass(new EffectPass(camera,new BloomEffect({blendFunction:BlendFunction.ADD,intensity:.12,luminanceThreshold:1.2,mipmapBlur:true}),new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL}),grade));composer.setSize(width,height);CARD_K.uPx.value=height/1920;
const instances=new Map<string,SceneInstance>();let active:SceneInstance|undefined;
const forward=new THREE.Vector3(),focus=new THREE.Vector3();
slider.max=String(TOTAL-1);SCENES.forEach(s=>select.add(new Option(`${s.id} · ${s.title}`,s.id)));
api.frameMeta=SCENES.map(({build,...s})=>s);api.totalFrames=TOTAL;api.fps=FPS;
api.renderFrame=(f)=>{
 const def=sceneAt(f);let inst=instances.get(def.id);if(!inst){inst=def.build();instances.set(def.id,inst);}
 if(active!==inst){if(active)scene.remove(active.root);scene.add(inst.root);active=inst;}
 const local=(f-def.f0)/Math.max(1,def.f1-def.f0-1);inst.pose(f,local,f/FPS);setLight(inst.palette);
 const palette=PALETTES[inst.palette];sun.color.set(palette.key);hemi.color.set(palette.sky);scene.background=new THREE.Color(palette.fog);scene.fog=new THREE.Fog(palette.fog,15,40);
 const cam=inst.camera(local);camera.position.set(...cam.position);camera.up.set(0,1,0);camera.lookAt(...cam.target);camera.fov=cam.fov??39;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 inst.root.traverse(o=>{if(o.userData.actor instanceof Character)o.userData.actor.face(camera,sun.position);});noInkFallback(inst.root);
 camera.getWorldDirection(forward);focus.set(...(cam.focus??cam.target));lens.focus=Math.max(.3,focus.sub(camera.position).dot(forward));lens.cInf=cam.blur??0;
 composer.render(1/FPS);api.currentFrame=f;slider.value=String(f);select.value=def.id;time.value=`${(f/FPS).toFixed(2)} / ${duration.toFixed(2)} s`;
 status.textContent=`${def.id} · ${def.title} · ${def.words}`;
};
function showError(error:unknown){const message=error instanceof Error?error.stack||error.message:String(error);status.textContent=message;api.lastError=message;console.error(error);}
function pause(){voice.pause();play.textContent='Play narration';}
play.onclick=async()=>{if(!voice.paused)return pause();try{if(voice.ended)voice.currentTime=0;await voice.play();play.textContent='Pause';}catch(e){showError(e);}};
slider.oninput=()=>{pause();const f=Number(slider.value);voice.currentTime=Math.min(duration,f/FPS);api.renderFrame(f);};
select.onchange=()=>{pause();const def=SCENES.find(s=>s.id===select.value)!;voice.currentTime=def.f0/FPS;api.renderFrame(def.f0);};
voice.onended=pause;
function tick(){if(!voice.paused){try{api.renderFrame(Math.min(TOTAL-1,Math.floor(voice.currentTime*FPS)));}catch(e){pause();showError(e);}}requestAnimationFrame(tick);}
try{api.renderFrame(0);api.ready=true;requestAnimationFrame(tick);}catch(e){showError(e);}
