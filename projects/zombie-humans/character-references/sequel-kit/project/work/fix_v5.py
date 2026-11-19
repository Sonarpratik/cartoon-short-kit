# v4 -> v5: cinematic low-key grade, tents out of the walls, compound detailing, S01 crowbar + gear, S09 gate path, weapon flare.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def sub(path, old, new):
    s = open(path, encoding='utf8').read()
    if new in s: return
    assert old in s, (path, old[:70]); s = s.replace(old, new, 1); open(path, 'w', encoding='utf8').write(s)

# 1 · Cinematic low-key grade: crushed blacks, lower mids, desaturated, cool shadows / warm highlights, heavy vignette.
sub('src/player.ts', "const grade=new GradeEffect({...GRADE_DAY2,sat:[1,1.02,1],vig:[.12,.45]},.72);",
    "const grade=new GradeEffect({ky:[0,.045,.17,.44,.74,.9,1],sat:[.62,.8,.88],tintS:[.035,-.008],tintM:[.006,0],tintH:[-.012,.014],vig:[.5,.3]},.95);")
sub('src/player.ts', "bloom.intensity=palette.night?.42:.16;", "bloom.intensity=palette.night?.55:.2;")

# 2 · Tents move forward into the yard (they were cutting into the police-station and school fronts); bench out of the school.
sub('src/world.ts', "const tents=[place(root,tent('#3d7cc0'),-1.5,0,-9.6,.2),place(root,tent('#e2564b'),1.8,0,-10.2,-.3),place(root,tent('#5fae6a'),4.6,0,-9.2,-.6)];void tents;",
    "const tents=[place(root,tent('#3d6a9a'),-3.4,0,-7.6,.3),place(root,tent('#a8483f'),3.3,0,-8.0,-.3),place(root,tent('#4f7a52'),6.2,0,-7.4,-.6)];void tents;")
sub('src/world.ts', "for(const [x,z,yaw] of [[-2.8,-5.6,.2],[2.6,-12,-.2]] as const)place(root,bench(),x,0,z,yaw);",
    "for(const [x,z,yaw] of [[-2.8,-5.6,.2],[1.4,-9.2,-.1]] as const)place(root,bench(),x,0,z,yaw);\n detailCompound(root);")
sub('src/world.ts', "import { addTick,dust,shaft,rain,moths,birds,leaves,embers,mist,sparkles } from './atmosphere';",
    "import { addTick,dust,shaft,rain,moths,birds,leaves,embers,mist,sparkles } from './atmosphere';\nimport { tireStack,riceSack,canStack,lantern } from './world3';")
# Detail pass: razor wire on the fence and walls, oil drums, crate stacks, tyre stacks, cones, string lights, sandbag nest, stencilled signs.
s = open('src/world.ts', encoding='utf8').read()
if 'function detailCompound' not in s:
    s += r"""
/** Lived-in survival camp: razor wire, drums, crates, tyres, cones, string lights, painted warnings. */
function detailCompound(root:THREE.Object3D){
 const wire=(x0:number,x1:number,y:number,z:number,alongZ=false)=>{const n=Math.round(Math.abs(x1-x0)/.32);for(let i=0;i<n;i++){const t=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,4,14),mat('#9aa0a8'));const p=x0+(x1-x0)*(i+.5)/n;
  if(alongZ){t.position.set(x,y,p);t.rotation.y=Math.PI/2;}else t.position.set(p,y,z);t.rotation.z=i*.6;root.add(t);}};
 wire(-19,-2.3,2.95,0);wire(2.3,19,2.95,0);wire(-25,1,3.35,-19.5,true);wire(-25,1,3.35,19.5,true);
 const drum=(x:number,z:number,c:string)=>{cylinder(root,.3,.9,x,.45,z,c,.3,16);for(const y of [.2,.7])cylinder(root,.31,.035,x,y,z,'#2e2a30',.31,16);};
 drum(-6.6,-3.2,'#3d6a5a');drum(-6.0,-3.0,'#7a3a2a');drum(5.6,-3.2,'#3d4a6a');drum(9.2,-7.2,'#6a5a2a');drum(-9.4,-2.4,'#5a3a3a');
 for(const [x,z,r] of [[5.5,-4.2,.2],[-7.4,-6.8,-.3],[8.6,-8.4,.5]] as const){place(root,crate(),x,0,z,r);place(root,crate(),x+.05,.62,z,r+.4);}
 place(root,riceSack(),-7.0,0,-6.0,.3);place(root,canStack(6,'#c8423b'),6.2,0,-3.6);
 place(root,tireStack(3),-11.6,0,-2.2);place(root,tireStack(2),11.8,0,-2.6);
 for(const [x,z] of [[-1.4,1.2],[1.5,1.4],[-2.6,2.2]] as const){const c=new THREE.Mesh(new THREE.ConeGeometry(.16,.5,12),mat('#e8833a'));c.position.set(x,.25,z);c.castShadow=true;root.add(c);box(root,.36,.04,.36,x,.02,z,'#2e2a30');}
 // String lights between the lamp posts over the camp (warm bulbs, gentle sag).
 const bulbs:THREE.Mesh[]=[];const string=(a:[number,number,number],b:[number,number,number],n=9)=>{for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t-.6*Math.sin(Math.PI*t);
  const m=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),glow(2.4,1.6,.7));m.position.set(x,y,z);m.layers.set(NOINK);root.add(m);bulbs.push(m);}
  cable(root,a,b,.6,'#1d1824');};
 string([-8,4,-6.5],[0,4,-12.5]);string([0,4,-12.5],[8,4,-7.2]);string([-8,4,-6.5],[8,4,-7.2],14);
 place(root,lantern(),-2.6,.5,-5.6);
 // Painted warnings on the walls.
 for(const [t,x,y,z,ry] of [['NO ENTRY',-19.15,2,-6,Math.PI/2],['SURVIVORS INSIDE',19.15,2,-9,-Math.PI/2],['DAY 1 2 3 ...',-6,2.2,-24.65,0]] as const){const s2=signBoard(root,t,3.6,.7,[x,y,z],{bg:'#bdb8ae',ink:'#8a2f2f'});s2.rotation.y=ry;}
 addTick(root,f=>bulbs.forEach((b,i)=>{const k=.75+.25*Math.sin(f*.21+i*1.7)*(i%5===0?1.6:1);(b.material as THREE.MeshBasicMaterial).color.setRGB(2.4*k,1.6*k,.7*k);}));
}
"""
    open('src/world.ts', 'w', encoding='utf8').write(s)

# 3 · S01: crowbar next to the bat, by the GEAR crate.
sub('src/scenes/kit.ts', "export function bandage()", """export function crowbar() { const r = new THREE.Group(); const m = cylinder(r, .025, .9, 0, .45, 0, '#c8423b', .025, 8); m.castShadow = true; const h = new THREE.Mesh(new THREE.TorusGeometry(.07, .025, 6, 14, Math.PI), new THREE.MeshLambertMaterial({ color: '#c8423b' })); h.position.y = .9; h.rotation.z = Math.PI / 2; r.add(h); return r; }
export function bandage()""")
sub('src/scenes/S01.ts', "import { name,list,bat,COLORS } from './kit';", "import { name,list,bat,crowbar,COLORS } from './kit';")
sub('src/scenes/S01.ts', "const b=place(s.root,bat(),-4.6,.55,-3.3);b.rotation.z=.32;",
    "const b=place(s.root,bat(),-4.6,.55,-3.3);b.rotation.z=.32;const cb=place(s.root,crowbar(),-4.95,0,-3.45);cb.rotation.z=-.28;")
sub('src/scenes/S01.ts', " {f:0,position:[-3.7,1.0,-1.6],target:[-4.6,.62,-3.3],fov:40,blur:2.2},\n {f:8,position:[-3.95,.92,-2.2],target:[-4.6,.62,-3.3],fov:37,blur:2.4,ease:'snap'},\n {f:42,position:[-4.0,.9,-2.3],target:[-4.6,.62,-3.3],fov:36,blur:2.4,ease:'lin'},",
    " {f:0,position:[-3.5,1.15,-1.3],target:[-4.95,.6,-3.6],fov:44,blur:1.8},\n {f:8,position:[-3.8,1.05,-1.9],target:[-4.95,.6,-3.6],fov:41,blur:2,ease:'snap'},\n {f:42,position:[-3.85,1.02,-2.0],target:[-4.95,.6,-3.6],fov:40,blur:2,ease:'lin'},")

# 4 · S09: Troy walks through the opening (the leaf only slides 1.6 m, so the gap is x ∈ [-2.1,-0.5]).
sub('src/scenes/S09.ts', "const troy=character(s.root,'troy',.15,0,.85)", "const troy=character(s.root,'troy',-1.3,0,.95)")
sub('src/scenes/S09.ts', "troy.root.position.set(lerp(.15,.1,t),0,lerp(.85,-1.6,t));", "troy.root.position.set(lerp(-1.3,-1.15,t),0,lerp(.95,-1.7,t));")
sub('src/scenes/S09.ts', " {f:1051,position:[2.2,1.7,-6.2],target:[.4,1.35,.2],fov:42,blur:1},\n {f:1088,position:[1.9,1.68,-5.6],target:[.3,1.35,-.4],fov:41,blur:1,ease:'lin'},",
    " {f:1051,position:[1.4,1.75,-6.4],target:[-.9,1.35,.2],fov:44,blur:1},\n {f:1088,position:[1.1,1.72,-5.8],target:[-1.0,1.35,-.6],fov:43,blur:1,ease:'lin'},")
print('ok')
