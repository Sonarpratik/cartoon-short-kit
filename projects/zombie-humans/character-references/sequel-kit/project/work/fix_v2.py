# v1 -> v2 review fixes: cameras inside the fence, framing, overlay placement, staging.
import os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def sub(path, old, new):
    s = open(path, encoding='utf8').read()
    if new in s: return
    assert old in s, (path, old[:70]); s = s.replace(old, new, 1); open(path, 'w', encoding='utf8').write(s)
def cam(path, block, key='const camera=byFrame'):
    s = open(path, encoding='utf8').read()
    if block in s: return
    a = s.index(key); b = s.index(']);', a) + 3
    open(path, 'w', encoding='utf8').write(s[:a] + block + s[b:])

# HUD: titles auto-fit; rule card in the lower third with text clear of the badge.
sub('src/hud.ts', "inkText(o.text,0,0,o.text.length>9?118:150,o.color,22);", "inkText(o.text,0,0,o.text.length>9?118:150,o.color,22,'center',960);")
sub('src/hud.ts', "const s=slam(k);g.translate(W/2,330);g.scale(s,s);\n  g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=26;g.shadowOffsetY=10;\n  rounded(-490,-80,980,330,44);",
    "const s=slam(k);g.translate(W/2,1470);g.scale(s,s);\n  g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=26;g.shadowOffsetY=10;\n  rounded(-490,-80,980,340,44);")
sub('src/hud.ts', "g.font='900 76px Arial Black, Arial';let cur=''", "g.font='900 68px Arial Black, Arial';let cur=''")
sub('src/hud.ts', "g.fillText(l,0,85+(i-(lines.length-1)/2)*88,900);", "g.fillText(l,0,115+(i-(lines.length-1)/2)*80,900);")

# S01: bat by the gear crate inside the yard; Jack shots from inside the fence.
cam('src/scenes/S01.ts', """const camera=byFrame(F0,F1,[
 {f:0,position:[-3.7,1.0,-1.6],target:[-4.6,.62,-3.3],fov:40,blur:2.2},
 {f:8,position:[-3.95,.92,-2.2],target:[-4.6,.62,-3.3],fov:37,blur:2.4,ease:'snap'},
 {f:42,position:[-4.0,.9,-2.3],target:[-4.6,.62,-3.3],fov:36,blur:2.4,ease:'lin'},
 {f:50,position:[6,10,16],target:[0,1.5,-7],fov:46,blur:.4,ease:'snap'},
 {f:76,position:[5,9.4,15],target:[0,1.5,-7],fov:46,blur:.4,ease:'lin'},
 {f:84,position:[0,1.6,-1.6],target:[0,1.35,-5],fov:42,blur:1.2,ease:'snap'},
 {f:125,position:[0,4.6,-.9],target:[0,1.0,-5.4],fov:50,blur:.8,ease:'out'},
]);""")
sub('src/scenes/S01.ts', "const b=place(s.root,bat(),-3.05,.55,-1.05);", "const b=place(s.root,bat(),-4.6,.55,-3.3);")
# S02: final wide from inside.
sub('src/scenes/S02.ts', "{f:325,position:[0,1.9,1.4],target:[0,1.3,Z],fov:44,blur:1.1,ease:'io'},", "{f:325,position:[0,2.3,-.9],target:[0,1.25,Z],fov:52,blur:1.1,ease:'io'},")
# S03: staggered tight formation so all four fit a vertical frame.
sub('src/scenes/S03.ts', "const g=four(s.root,{milo:[-2.1,0,-5],jack:[-.7,0,-5.2],tina:[.7,0,-5.2],brock:[2.1,0,-5]});",
    "const g=four(s.root,{milo:[-1.15,0,-6.0],jack:[-.35,0,-5.5],tina:[.5,0,-5.8],brock:[1.25,0,-6.2]});")
cam('src/scenes/S03.ts', """const camera=byFrame(F0,F1,[
 {f:326,position:[0,.7,-.8],target:[0,1.55,-6],fov:52,blur:1},
 {f:383,position:[0,.75,-1.2],target:[0,1.55,-6],fov:51,blur:1,ease:'lin'},
 {f:391,position:[0,1.0,-2.2],target:[0,1.5,-6],fov:50,blur:1.2,ease:'snap'},
 {f:417,position:[0,1.02,-2.35],target:[0,1.5,-6],fov:50,blur:1.2,ease:'lin'},
]);""")
# S04: pushers on the trailing edge, follow the leaf, padlock on the inner face at the latch.
cam('src/scenes/S04.ts', """const camera=byFrame(F0,F1,[
 {f:418,position:[2.6,2.0,-7.2],target:[3.4,1.3,-.4],fov:48,blur:.8},
 {f:440,position:[2.5,2.0,-7.0],target:[3.2,1.3,-.4],fov:48,blur:.8,ease:'lin'},
 {f:478,position:[.6,1.9,-6.4],target:[.4,1.3,-.4],fov:48,blur:.8,ease:'io'},
 {f:484,position:[-1.55,1.35,-1.25],target:[-2.0,1.15,-.28],fov:36,blur:2.4,ease:'snap'},
 {f:517,position:[-1.6,1.34,-1.15],target:[-2.0,1.15,-.28],fov:35,blur:2.5,ease:'lin'},
]);""")
sub('src/scenes/S04.ts', "const jack=character(s.root,'jack',0,0,-.7),brock=character(s.root,'brock',0,0,-.75);\n  const lock=place(s.root,padlock(),-2.2,1.05,-.16);",
    "const jack=character(s.root,'jack',0,0,-.55),brock=character(s.root,'brock',0,0,-.6);\n  const lock=place(s.root,padlock(),-2.0,1.15,-.28);")
sub('src/scenes/S04.ts', "jack.root.position.x=x+1.5;brock.root.position.x=x+.35;", "jack.root.position.x=x+1.0;brock.root.position.x=x+1.85;")
sub('src/scenes/S04.ts', "turn:-35,tilt:pushing?-.12:0", "turn:-40,tilt:pushing?.12:0")
sub('src/scenes/S04.ts', "turn:-30,tilt:pushing?-.14:0", "turn:-35,tilt:pushing?.14:0")
# S06: generator mid shot with Brock beside it; campfire group fits the frame.
cam('src/scenes/S06.ts', """const cam=byFrame(F0,F1,[
 {f:655,position:[2.1,1.6,-.6],target:[3.5,1.1,-4.3],fov:46,blur:1.4},
 {f:690,position:[2.2,1.6,-.8],target:[3.5,1.1,-4.3],fov:45,blur:1.4,ease:'lin'},
 {f:740,position:[.6,1.75,-1.6],target:[.6,1.15,-7.4],fov:48,blur:1.3,ease:'io'},
 {f:813,position:[.6,1.65,-2.2],target:[.6,1.15,-7.4],fov:46,blur:1.4,ease:'lin'},
]);""", key='const cam=byFrame')
sub('src/scenes/S06.ts', "const g=four(s.root,{brock:[3.0,0,-3.6],jack:[-.7,0,-6.7],milo:[1.9,0,-6.8],tina:[.6,0,-8.5]});",
    "const g=four(s.root,{brock:[2.75,0,-4.1],jack:[-.15,0,-6.5],milo:[1.35,0,-6.55],tina:[.15,0,-8.2]});")
sub('src/scenes/S06.ts', "if(f>=700)at(g.brock,-.4,-8.3);", "if(f>=700)at(g.brock,1.15,-8.3);")
# S07: Troy and the close-up camera centred between two bars.
sub('src/scenes/S07.ts', "const troy=character(s.root,'troy',.15,0,.85)", "const troy=character(s.root,'troy',.175,0,.85)")
sub('src/scenes/S07.ts', " {f:920,position:[.35,1.55,-2.5],target:[0,1.48,.9],fov:38,blur:1.6,ease:'snap'},\n {f:1007,position:[.3,1.54,-2.0],target:[0,1.48,.9],fov:36,blur:1.8,ease:'lin'},",
    " {f:920,position:[.175,1.55,-2.5],target:[.175,1.48,.9],fov:38,blur:1.6,ease:'snap'},\n {f:1007,position:[.175,1.54,-2.0],target:[.175,1.48,.9],fov:36,blur:1.8,ease:'lin'},")
sub('src/scenes/S07.ts', "focus:[.15,1.5,.85]", "focus:[.175,1.5,.85]")
# S10: Tina and Milo in frame either side of Troy.
sub('src/scenes/S10.ts', "tina=character(s.root,'tina',1.25,0,.1),milo=character(s.root,'milo',-1.2,0,.2);", "tina=character(s.root,'tina',.95,0,.05),milo=character(s.root,'milo',-.75,0,.15);")
cam('src/scenes/S10.ts', """const camera=byFrame(F0,F1,[
 {f:1089,position:[.1,1.6,4.0],target:[.1,1.0,-.2],fov:44,blur:1.2},
 {f:1100,position:[-.2,1.5,3.3],target:[-.3,1.05,-.2],fov:42,blur:1.4,ease:'out'},
 {f:1119,position:[-.15,1.5,3.2],target:[-.3,1.05,-.2],fov:42,blur:1.4,ease:'lin'},
 {f:1126,position:[.4,1.5,3.3],target:[.4,1.0,-.2],fov:42,blur:1.4,ease:'out'},
 {f:1134,position:[.4,1.5,3.2],target:[.4,1.0,-.2],fov:42,blur:1.4,ease:'lin'},
 {f:1156,position:[.1,2.0,4.4],target:[.1,.8,-.4],fov:46,blur:1.1,ease:'io'},
]);""")
# S11: count badges on the shelves, clear of Troy's face.
sub('src/scenes/S11.ts', "tally(f,1164,1231,1,170,760),tally(f,1184,1231,2,410,700),tally(f,1192,1231,3,670,700),tally(f,1198,1231,4,910,760)",
    "tally(f,1164,1231,1,120,620),tally(f,1184,1231,2,960,620),tally(f,1192,1231,3,120,1100),tally(f,1198,1231,4,960,1100)")
# S12: Jack in frame; high angle onto the empty cot.
cam('src/scenes/S12.ts', """const camera=byFrame(F0,F1,[
 {f:1231,position:[-.6,1.75,4.0],target:[-.6,1.05,-.4],fov:46,blur:1},
 {f:1262,position:[-.6,1.72,3.7],target:[-.6,1.05,-.4],fov:45,blur:1,ease:'lin'},
 {f:1269,position:[.3,2.4,2.0],target:[.2,.45,-.3],fov:44,blur:1.6,ease:'snap'},
 {f:1294,position:[.3,2.35,1.85],target:[.2,.45,-.3],fov:43,blur:1.7,ease:'lin'},
]);""")
sub('src/scenes/S12.ts', "const jack=character(s.root,'jack',-2.6,0,.6);", "const jack=character(s.root,'jack',-2.2,0,.9);")
sub('src/scenes/S12.ts', "jack.root.position.x=lerp(-3.4,-1.5,t);", "jack.root.position.x=lerp(-2.4,-1.0,t);")
# S15: opening wide from inside the yard.
sub('src/scenes/S15.ts', " {f:1586,position:[0,2.6,1.6],target:[0,1.4,-6],fov:46,blur:.8},\n {f:1680,position:[.6,2.4,.6],target:[0,1.4,-6],fov:45,blur:.8,ease:'lin'},",
    " {f:1586,position:[0,3.4,-.8],target:[0,1.2,-6],fov:52,blur:.7},\n {f:1680,position:[.6,3.2,-1.2],target:[0,1.2,-6],fov:51,blur:.7,ease:'lin'},")
# S16: title in the lower third, off Jack's face.
sub('src/scenes/S16.ts', "title(f,1837,1896,'3 RULES','#e8b93c',330)", "title(f,1837,1896,'3 RULES','#e8b93c',1600)")
# S17: see into the doorway; the stranger leans on the threshold.
sub('src/scenes/S17.ts', " {f:1896,position:[.6,1.6,4.6],target:[4.4,1.35,.6],fov:44,blur:1},\n {f:1997,position:[1.2,1.58,4.2],target:[4.4,1.35,.8],fov:42,blur:1.1,ease:'lin'},",
    " {f:1896,position:[1.6,2.2,5.6],target:[4.8,1.1,.9],fov:46,blur:.9},\n {f:1997,position:[2.0,2.15,5.2],target:[4.8,1.1,.9],fov:45,blur:1,ease:'lin'},")
sub('src/scenes/S17.ts', "const peek=character(s.root,'rCapB',6.0,0,1.05),jack=character(s.root,'jack',2.6,0,1.4);", "const peek=character(s.root,'rCapB',5.5,0,1.05),jack=character(s.root,'jack',2.9,0,1.9);")
sub('src/scenes/S17.ts', "jack.root.position.set(2.6+1.6*t,0,1.4-.2*t);", "jack.root.position.set(2.9+1.5*t,0,1.9-.3*t);")
# S18: each stash shot includes the person hiding it.
cam('src/scenes/S18.ts', """const camera=byFrame(F0,F1,[
 {f:1998,position:[0,2.6,4.6],target:[0,.9,-.8],fov:50,blur:.8},
 {f:2024,position:[0,2.55,4.4],target:[0,.9,-.8],fov:50,blur:.8,ease:'lin'},
 {f:2030,position:[-1.5,2.0,3.0],target:[-2.4,.75,.4],fov:44,blur:1.3,ease:'snap'},
 {f:2049,position:[-1.5,2.0,2.95],target:[-2.4,.75,.4],fov:44,blur:1.3,ease:'lin'},
 {f:2054,position:[1.9,1.8,2.4],target:[4.0,1.1,-1.2],fov:44,blur:1.3,ease:'snap'},
 {f:2068,position:[1.9,1.8,2.35],target:[4.0,1.1,-1.2],fov:44,blur:1.3,ease:'lin'},
 {f:2073,position:[.3,1.8,3.0],target:[.7,.75,-.1],fov:44,blur:1.3,ease:'snap'},
 {f:2084,position:[.3,1.8,2.95],target:[.7,.75,-.1],fov:44,blur:1.3,ease:'lin'},
 {f:2100,position:[.6,3.2,5.4],target:[.6,.8,-.6],fov:52,blur:.6,ease:'out'},
]);""")
# S19: from inside the fence, up to Milo's face above the railing.
cam('src/scenes/S19.ts', """const camera=byFrame(F0,F1,[
 {f:2101,position:[-12.6,1.6,-6.4],target:[-16.4,5.2,-2.2],fov:50,blur:.8},
 {f:2160,position:[-14.4,7.4,-4.6],target:[-16.7,7.0,-1.2],fov:42,blur:1.4,ease:'io'},
 {f:2227,position:[-14.7,7.4,-4.2],target:[-16.7,7.0,-1.2],fov:40,blur:1.6,ease:'lin'},
]);""")
sub('src/scenes/S19.ts', "const milo=character(s.root,'milo',T[0]+.3,5.675,T[2]+.6);const lamp=place(s.root,lantern(),T[0]-.6,5.68,T[2]+.7);",
    "const milo=character(s.root,'milo',T[0]+.3,5.675,T[2]+.2);const lamp=place(s.root,lantern(),T[0]+.95,5.68,T[2]-.2);")
# S20: zombie walks left-to-right straight into the post.
cam('src/scenes/S20.ts', """const camera=byFrame(F0,F1,[
 {f:2228,position:[-.3,1.6,9.8],target:[.5,1.35,5.3],fov:42,blur:1.2},
 {f:2320,position:[-.2,1.58,9.4],target:[.6,1.35,5.3],fov:41,blur:1.3,ease:'lin'},
]);""")
sub('src/scenes/S20.ts', "place(s.root,streetLamp(4),1.3,0,5.2,Math.PI);", "place(s.root,streetLamp(4),1.32,0,5.4,Math.PI);")
sub('src/scenes/S20.ts', "const z=character(s.root,'zOffice',-1.6,0,5.4),z2=character(s.root,'zChef',-.4,0,3.2);", "const z=character(s.root,'zOffice',-1.4,0,5.45),z2=character(s.root,'zChef',-1.6,0,3.0);")
sub('src/scenes/S20.ts', "z.root.position.x=lerp(-1.6,.95,t)-bounce;", "z.root.position.x=lerp(-1.4,1.0,t)-bounce;")
sub('src/scenes/S20.ts', "tilt:f>=2276&&f<2300?.18:.06*Math.sin(f*.05)", "tilt:f>=2276&&f<2300?-.3*Math.exp(-(f-2276)*.08):.06*Math.sin(f*.05)")
sub('src/scenes/S20.ts', "center:[1.05,2.4,5.3]", "center:[1.0,2.3,5.5]")
# S21: headlights glow without blinding the camera.
sub('src/scenes/S21.ts', "s.trucks.forEach((t,i)=>t.power(f<2406+i*4?0:clamp((f-2406-i*4)/3)));", "s.trucks.forEach((t,i)=>t.power(f<2406+i*4?0:.3*clamp((f-2406-i*4)/3)));")
# S23: end cards in the lower third.
sub('src/scenes/S23.ts', "stamp:2632,rank:'4',title:'PART 4',icon:'question',color:'#c8423b'}", "stamp:2632,rank:'4',title:'PART 4',icon:'question',color:'#c8423b',y:1560}")
sub('src/scenes/S23.ts', "rank:'4',title:'SUBSCRIBE',icon:'question',color:'#c8423b'}", "rank:'4',title:'SUBSCRIBE',icon:'question',color:'#c8423b',y:1560}")
print('ok')
