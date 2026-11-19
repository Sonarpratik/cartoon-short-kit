# v2 -> v3: S04 padlock framing, S07 rail off Troy's mouth, S12 restage, title fit, S19 ground-level watch, S21 headlights.
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

# Titles: smaller size for anything over 7 characters, tighter fit width.
sub('src/hud.ts', "inkText(o.text,0,0,o.text.length>9?118:150,o.color,22,'center',960);", "inkText(o.text,0,0,o.text.length>12?100:o.text.length>7?118:150,o.color,22,'center',880);")
# S04: padlock close-up shows the lock body, not the chain.
sub('src/scenes/S04.ts', " {f:484,position:[-1.55,1.35,-1.25],target:[-2.0,1.15,-.28],fov:36,blur:2.4,ease:'snap'},\n {f:517,position:[-1.6,1.34,-1.15],target:[-2.0,1.15,-.28],fov:35,blur:2.5,ease:'lin'},",
    " {f:484,position:[-1.3,1.25,-2.0],target:[-2.0,.95,-.28],fov:40,blur:2,ease:'snap'},\n {f:517,position:[-1.4,1.22,-1.8],target:[-2.0,.95,-.28],fov:38,blur:2.1,ease:'lin'},")
# S07: look down on Troy so the mid rail sits under his chin.
sub('src/scenes/S07.ts', " {f:920,position:[.175,1.55,-2.5],target:[.175,1.48,.9],fov:38,blur:1.6,ease:'snap'},\n {f:1007,position:[.175,1.54,-2.0],target:[.175,1.48,.9],fov:36,blur:1.8,ease:'lin'},",
    " {f:920,position:[.175,2.15,-2.4],target:[.175,1.75,.85],fov:38,blur:1.6,ease:'snap'},\n {f:1007,position:[.175,2.12,-1.9],target:[.175,1.75,.85],fov:36,blur:1.8,ease:'lin'},")
# S12: wide on the dorm with Jack walking in, then a high angle on the empty middle cot.
cam('src/scenes/S12.ts', """const camera=byFrame(F0,F1,[
 {f:1231,position:[.2,2.3,4.6],target:[-.2,.9,-.6],fov:56,blur:.8},
 {f:1262,position:[.2,2.25,4.4],target:[-.2,.9,-.6],fov:56,blur:.8,ease:'lin'},
 {f:1269,position:[-.2,2.6,2.6],target:[.1,.5,-.3],fov:50,blur:1.2,ease:'snap'},
 {f:1294,position:[-.2,2.55,2.45],target:[.1,.5,-.3],fov:49,blur:1.3,ease:'lin'},
]);""")
sub('src/scenes/S12.ts', "const jack=character(s.root,'jack',-2.2,0,.9);", "const jack=character(s.root,'jack',-2.2,0,1.0);")
sub('src/scenes/S12.ts', "jack.root.position.x=lerp(-2.4,-1.0,t);", "jack.root.position.x=lerp(-2.6,-1.3,t);")
# S21: headlights glow, no wash-out.
sub('src/scenes/S21.ts', "t.power(f<2406+i*4?0:.3*clamp((f-2406-i*4)/3))", "t.power(f<2406+i*4?0:.12*clamp((f-2406-i*4)/3))")
print('ok')
