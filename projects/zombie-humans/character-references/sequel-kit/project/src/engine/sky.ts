import * as T from 'three';
import {NOINK} from './ink';
import {TONE} from './shade';
import {WINDOW_LIGHT} from './lighting';
// Shared procedural day/night sky and scene atmosphere; activate per scene root.
export function attachSky(root:T.Object3D,night=false){
 const sky=new T.Mesh(new T.SphereGeometry(500,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:{night:{value:night?1:0}},vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=vec4(p.xy,p.w*.99999,p.w);}`,fragmentShader:`
 varying vec3 vDir;uniform float night;
 float ellipse(vec2 p,vec2 c,vec2 s){return length((p-c)/s);}
 float cloud(vec2 p,vec2 c,float s){vec2 q=p-c;q.x=mod(q.x+.5,1.)-.5;p=q/(s*.52);float d=ellipse(p,vec2(0.,0.),vec2(.19,.044));d=min(d,ellipse(p,vec2(-.06,.03),vec2(.085,.062)));d=min(d,ellipse(p,vec2(.025,.05),vec2(.09,.072)));d=min(d,ellipse(p,vec2(.11,.01),vec2(.1,.042)));return 1.-smoothstep(.97,1.025,d);}
 void main(){vec3 d=normalize(vDir);float h=smoothstep(0.,.9,max(0.,d.y));vec3 col=mix(vec3(.30588,.63922,.92941),vec3(.025,.44,.92),sqrt(h));vec2 p=vec2(atan(d.x,d.z)/6.283185+.5,d.y);float c=0.;float shadow=0.;
 for(int i=0;i<9;i++){float a=float(i);vec2 cp=vec2(fract(a*.371+.12),.12+mod(a,3.)*.13);float s=.45+mod(a,2.)*.24;c=max(c,cloud(p,cp,s));shadow=max(shadow,cloud(p,cp+vec2(.006,-.012),s));}
 c=max(c,cloud(p,vec2(.99,.18),.62));c=max(c,cloud(p,vec2(.045,.36),.48));col=mix(col,vec3(.57,.71,.86),shadow*.72);col=mix(col,mix(vec3(.72,.82,.94),vec3(.98,.99,1.),smoothstep(.08,.4,d.y)),c);
 vec3 noct=mix(vec3(.12549,.21569,.32549),vec3(.025,.075,.17),sqrt(h));noct=mix(noct,vec3(.25,.34,.47),c*.5);col=mix(col,noct,night);gl_FragColor=vec4(pow(col,vec3(2.2)),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));
 sky.frustumCulled=false;sky.renderOrder=-1000;sky.layers.set(NOINK);sky.onBeforeRender=(_r,_s,c)=>{sky.position.copy(c.position);sky.updateMatrixWorld();};root.add(sky);
 root.userData.environment={fog:night?'#203753':'#4ea3ed',fogNear:45,fogFar:155,sun:night?[-12,12,7.2]:[-18,24,16],sunIntensity:night?2:2.7,apply(){WINDOW_LIGHT.uWindowStrength.value=0;if(!night){TONE.uLitCol.value.set(1.22,1.22,1.17);TONE.uShadeCol.value.set(.49,.61,.71);}}};
 return sky;
}
