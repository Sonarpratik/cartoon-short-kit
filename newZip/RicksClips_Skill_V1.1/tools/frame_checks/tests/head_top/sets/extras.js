// EXTRAS for "Armor Where Nobody Shot": the movable story props the sets do not hold. Owner: props-hero (fix round 2, 2026-11-13).
// Loaded by sets/airfield.js at its end:  buildExtras(THREE, scene, film, ctx, world) -> { update(f, t, state), anchors }
//   world = { anchors, holes, hero, hangar, TIME, placeName, stateAt, val, B2T }
//
// 1. THE CHIEF'S HAND TRUCK with his ARMOR plates (B5 / B6, lines 9-15; at dawn the three that are left).
//    state `hand_truck`: [x, y, z] (plan metres, the floor point under the toe plate) or false.   `hand_truck_yaw`: degrees, the way the plates face (90 = plan +Y).
//    `hand_truck_plates`: how many plates are on it (4; at dawn 3: number 1 is on the cowl).
//    Defaults (no key in the place state): `hangar` from the first word of script line 9 on and `hangar_night` always: [-14.95, 35.55, 0] facing +Y (into the hangar, to the lens);
//    `apron_dawn`: [9.3, 6.3, 0] with plates 2-4, facing the opening camera; every other place: none.
// 2. THE PIN MACRO HAND (line 7, station 11): a close-up ink fist of the cast (round black fist, curled fingers with creases, the thumb) pressing ONE red glass-head pin into the paper wing.
//    state `pin_hand` 0..1: 0-0.35 the hand comes in with the pin, 0.35-0.55 the thumb presses it into the paper, 0.55-0.8 a quarter turn, 0.8-1 the hand lets go and leaves; the pin stays.
//    `pin_hand_at`: [x, y, z] of the pin on the paper (default: the film prop `map_wing`, [-10.98, paper, 2.0]). Anchor `pin_hand` = that point.
// 3. CONTINUITY of the two props that exist both in the set and in a hand (the kit's held3d): while the Chief holds the lantern the set's lantern model is hidden and its light, with the
//    anchor `lantern`, sits in the held one; while Ladder carries his step ladder the set's ladder is hidden. Never two of either.
// 4. The broken mug halves: the heap of sets/hangar.js lies 5 to 20 cm under the barrel's rim, so a low lens sees only the rim. A crown of big halves is added ON the heap (rim height),
//    with bare clay break faces and two handles, so the barrel reads as "full of mug halves" the moment the lid lifts.
// Every mesh has a name, userData.role and userData.mat. No red anywhere but the pin.
import { buildPlate, buildMugHalf } from './props.js';

export async function buildExtras(THREE, scene, film, ctx, world) {
  const { B2T, TIME, placeName } = world, PI = Math.PI, HANGAR = /hangar/.test(placeName), toon = ctx.toon, V3 = THREE.Vector3;
  const shiny = (c, sh = 80, spec = '#fff1d0', op = {}) => new THREE.MeshPhongMaterial({ color: c, shininess: sh, specular: spec, ...op }), basic = (c, op = {}) => new THREE.MeshBasicMaterial({ color: c, ...op });
  const tag = (m, name, role, mat, cast = true) => { m.name = name; m.userData.role = role; if (mat) m.userData.mat = mat; m.castShadow = cast; m.receiveShadow = true; return m; };
  const UP = new V3(0, 1, 0), rod = (par, name, a, b, r, m, role = 'metal', mat = 'painted_steel', seg = 10) => { const A = new V3(...a), B = new V3(...b), d = B.clone().sub(A), L = d.length(), me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg), m); me.position.copy(A).addScaledVector(d, .5); me.quaternion.setFromUnitVectors(UP, d.normalize()); par.add(tag(me, name, role, mat)); return me; };
  const box = (par, name, size, at, m, role = 'metal', mat = 'painted_steel', rot) => { const me = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), m); me.position.set(at[0], at[1], at[2]); if (rot) me.rotation.set(rot[0], rot[1], rot[2]); par.add(tag(me, name, role, mat)); return me; };
  const shadow = (par, name, rx, rz, at, op = .34) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 20), basic('#120d08', { transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.rotation.x = -PI / 2; m.scale.set(rx, rz, 1); m.position.set(at[0], .004, at[1]); m.name = name; m.userData.role = 'ground'; m.userData.noExport = true; par.add(m); return m; };
  const anchors = {}, ups = [];

  // ------------------------------------------------------------------ 1. the hand truck (local three.js axes: Y up, the plates face +Z, origin on the floor under the middle of the toe plate's back edge)
  let truck = null, truckPlates = [];
  if (HANGAR || TIME === 'dawn') {
    const g = new THREE.Group(); g.name = 'hand_truck'; g.userData.role = 'prop'; scene.add(g); truck = g;
    const paint = toon('#56616a'), worn = shiny('#aab2b8', 70, '#ffffff'), tyre = toon('#1c1c20'), steel = shiny('#8d949a', 90, '#ffffff'), HW = .2, AY = .13, AZ = -.07;
    // two side rails in one bent tube each: up from the toe plate, back over the top into the handles; rubber grips; three cross straps and a centre strap welded on
    for (const s of [-1, 1]) { const pts = [[s * HW, .012, 0], [s * HW, .6, -.005], [s * HW, 1.12, -.01], [s * HW, 1.22, -.04], [s * HW, 1.27, -.11], [s * HW, 1.27, -.2]].map(p => new V3(...p));
      g.add(tag(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .3), 40, .015, 8), paint), 'hand_truck_side_rail', 'metal', 'painted_steel'));
      rod(g, 'hand_truck_handle_grip', [s * HW, 1.27, -.125], [s * HW, 1.27, -.235], .02, toon('#232326'), 'rubber', 'rubber', 12); for (const z of [-.14, -.165, -.19, -.215]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.0205, .003, 6, 14), toon('#141416')); r.position.set(s * HW, 1.27, z); g.add(tag(r, 'hand_truck_grip_rib', 'rubber', 'rubber', false)); }
      const cap = new THREE.Mesh(new THREE.SphereGeometry(.021, 10, 8), toon('#232326')); cap.position.set(s * HW, 1.27, -.236); cap.scale.z = .6; g.add(tag(cap, 'hand_truck_grip_end', 'rubber', 'rubber', false));
      // axle bracket: a plate welded to the rail, the axle through its eye; a gusset down to the toe plate
      box(g, 'hand_truck_axle_bracket', [.008, .19, .11], [s * (HW + .012), .13, -.04], paint); box(g, 'hand_truck_toe_gusset', [.006, .11, .11], [s * (HW - .012), .06, .05], paint, 'metal', 'painted_steel', [.75, 0, 0]);
      // wheel on the axle: solid rubber tyre with a tread groove, pressed-steel disc, five bolts, washer, split pin
      const w = new THREE.Group(); w.name = 'hand_truck_wheel'; w.position.set(s * (HW + .075), AY, AZ); w.rotation.z = PI / 2; g.add(w);
      w.add(tag(new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .05, 28), tyre), 'hand_truck_tyre', 'rubber', 'rubber_tyre')); for (const y of [-.014, .014]) { const gr = new THREE.Mesh(new THREE.TorusGeometry(.13, .0035, 6, 30), toon('#0c0c0e')); gr.rotation.x = PI / 2; gr.position.y = y; w.add(tag(gr, 'hand_truck_tyre_groove', 'rubber', 'rubber_tyre', false)); }
      w.add(tag(new THREE.Mesh(new THREE.CylinderGeometry(.086, .086, .054, 22), paint), 'hand_truck_wheel_disc', 'metal', 'painted_steel')); const hub = new THREE.Mesh(new THREE.CylinderGeometry(.03, .034, .07, 14), steel); w.add(tag(hub, 'hand_truck_hub', 'metal', 'steel'));
      for (let k = 0; k < 5; k++) { const a = k / 5 * PI * 2, b = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, .062, 6), steel); b.position.set(Math.cos(a) * .058, 0, Math.sin(a) * .058); w.add(tag(b, 'hand_truck_wheel_bolt', 'metal', 'steel', false)); }
      rod(g, 'hand_truck_axle_washer', [s * (HW + .104), AY, AZ], [s * (HW + .108), AY, AZ], .022, steel, 'metal', 'steel', 12); rod(g, 'hand_truck_split_pin', [s * (HW + .116), AY - .018, AZ], [s * (HW + .116), AY + .018, AZ], .003, steel, 'metal', 'steel', 5);
      shadow(g, 'hand_truck_wheel_contact', .1, .07, [s * (HW + .075), AZ]); }
    rod(g, 'hand_truck_axle', [-(HW + .125), AY, AZ], [HW + .125, AY, AZ], .012, steel, 'metal', 'steel', 10);
    for (const [y, bow] of [[.34, .012], [.7, .018], [1.06, .012]]) { const c = new THREE.CatmullRomCurve3([[-HW, y, 0], [0, y, -bow], [HW, y, 0]].map(p => new V3(...p))); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 12, .011, 6), paint); m.scale.z = 1; g.add(tag(m, 'hand_truck_cross_bar', 'metal', 'painted_steel')); for (const s of [-1, 1]) { const wd = new THREE.Mesh(new THREE.SphereGeometry(.017, 8, 6), toon('#4a545c')); wd.position.set(s * HW, y, 0); g.add(tag(wd, 'hand_truck_weld', 'metal', 'painted_steel', false)); } }
    box(g, 'hand_truck_centre_strap', [.035, 1.0, .006], [0, .56, -.012], paint);
    // toe plate: steel, its lip worn bright by years of sliding under loads, two countersunk rivets per rail
    box(g, 'hand_truck_toe_plate', [.5, .008, .27], [0, .008, .13], toon('#565f66'), 'metal', 'steel_plate'); box(g, 'hand_truck_toe_lip', [.5, .006, .022], [0, .0075, .262], toon('#8f989e'), 'metal', 'bare_steel', [.25, 0, 0]);
    for (const s of [-1, 1]) for (const z of [.03, .1]) rod(g, 'hand_truck_toe_rivet', [s * (HW - .012), .012, z], [s * (HW - .012), .0145, z], .008, steel, 'metal', 'steel', 8);
    shadow(g, 'hand_truck_toe_contact', .3, .17, [0, .12], .4);
    // the plates: on edge on the toe plate, leaning on the frame, number 1 in front (it is the one that goes on the cowl at dawn); each a hair off the next so four edges read
    const lean = new THREE.Group(); lean.name = 'hand_truck_plate_stack'; lean.position.set(0, .012, .024); lean.rotation.x = -.085; g.add(lean);
    [4, 3, 2, 1].forEach((n, i) => { const P = buildPlate(THREE, { ctx, n, upright: true }); P.group.position.set([.012, -.01, .008, -.004][i], 0, .017 + i * .0335); P.group.rotation.y = [.012, -.016, .01, -.006][i]; P.group.rotation.z = [.004, -.006, .003, 0][i]; lean.add(P.group); truckPlates.push({ n, g: P.group }); });
    // leather strap with a steel buckle round the stack; the Chief's work gloves over one handle; his chalk tally on the top bar
    const strap = toon('#6b4226'); for (const s of [-1, 1]) box(lean, 'hand_truck_strap_side', [.004, .03, .16], [s * .366, .458, .075], strap, 'cloth', 'leather');   // the strap runs ABOVE the word ARMOR: nothing hangs in front of lettering
    box(lean, 'hand_truck_strap_front', [.736, .03, .004], [0, .458, .157], strap, 'cloth', 'leather'); box(lean, 'hand_truck_strap_buckle', [.046, .04, .008], [.24, .458, .161], steel, 'metal', 'steel'); box(lean, 'hand_truck_strap_tongue', [.07, .022, .005], [.3, .455, .161], toon('#5a3620'), 'cloth', 'leather', [0, 0, -.12]);
    for (const [k, c] of [[0, '#b58b52'], [1, '#a57a44']]) { const gl = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), toon(c)); gl.scale.set(.75, 1.7, .32); gl.position.set(-HW + .004 + k * .018, 1.2 - k * .012, -.085 - k * .03); gl.rotation.set(.35, 0, .12 - k * .3); g.add(tag(gl, 'hand_truck_work_glove', 'cloth', 'leather')); const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.036, .03, .05, 10), toon('#8a6a3c')); cuff.scale.z = .4; cuff.position.set(-HW + .004 + k * .018, 1.115 - k * .012, -.06 - k * .03); cuff.rotation.x = .35; g.add(tag(cuff, 'hand_truck_glove_cuff', 'cloth', 'leather', false)); }
    const tally = document.createElement('canvas'); tally.width = 256; tally.height = 64; { const c = tally.getContext('2d'); c.strokeStyle = 'rgba(243,240,230,.9)'; c.lineWidth = 5; c.lineCap = 'round'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(40 + k * 22, 12 + (k % 2) * 3); c.lineTo(38 + k * 22, 52); c.stroke(); } c.font = 'bold 40px "Segoe Print", "Comic Sans MS", cursive'; c.fillStyle = 'rgba(243,240,230,.9)'; c.fillText('OK', 150, 46); }
    box(g, 'hand_truck_tag_plate', [.24, .07, .005], [0, 1.06, .014], toon('#4a545c'), 'metal', 'painted_steel'); for (const s of [-1, 1]) rod(g, 'hand_truck_tag_rivet', [s * .105, 1.06, .0165], [s * .105, 1.06, .019], .006, steel, 'metal', 'steel', 8);   // a tag plate riveted to the top cross bar; the Chief's chalk tally on it
    const tt = new THREE.CanvasTexture(tally); tt.colorSpace = THREE.SRGBColorSpace; const tm = new THREE.Mesh(new THREE.PlaneGeometry(.2, .05), toon('#ffffff', { map: tt, transparent: true, depthWrite: false })); tm.position.set(-.005, 1.06, .0172); g.add(tag(tm, 'hand_truck_chalk_tally', 'metal', 'chalk', false)); tm.userData.noExport = true; tm.userData.text = '|||| OK';
    { const nb = document.createElement('canvas'); nb.width = 512; nb.height = 160; const c = nb.getContext('2d'); c.fillStyle = '#d8c79a'; c.fillRect(0, 0, 512, 160); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(110,80,40,${.08 + (i % 5) * .04})`; c.lineWidth = 1 + (i % 3); c.beginPath(); c.moveTo(0, i * 4.1); c.lineTo(512, i * 4.1 + (i % 4) - 2); c.stroke(); }
      c.fillStyle = '#23201c'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 62px "Arial Black", Impact, sans-serif'; c.fillText("CHIEF'S", 256, 52); c.font = 'bold 44px "Arial Black", Impact, sans-serif'; c.fillText('HANDS OFF', 256, 116); c.strokeStyle = '#23201c'; c.lineWidth = 6; c.strokeRect(8, 8, 496, 144);
      const t = new THREE.CanvasTexture(nb); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const m = box(g, 'hand_truck_name_board', [.34, .105, .012], [0, .86, .012], [toon('#a8905e'), toon('#a8905e'), toon('#a8905e'), toon('#a8905e'), toon('#ffffff', { map: t }), toon('#8c7648')], 'wood', 'painted_plywood'); m.userData.text = "CHIEF'S HANDS OFF";
      for (const s of [-1, 1]) rod(g, 'hand_truck_name_board_wire', [s * .15, .9, .012], [s * HW, .93, 0], .0025, steel, 'metal', 'steel_wire', 5); }
    { const rope = toon('#c9b98a'); for (let k = 0; k < 5; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.075 + (k % 2) * .006, .0085, 6, 22), rope); r.position.set(HW + .012 + k * .004, 1.13 - k * .012, -.1 - (k % 2) * .008); r.rotation.set(.25, PI / 2 - .15 + k * .05, 0); g.add(tag(r, 'hand_truck_rope_coil', 'cloth', 'hemp_rope')); } rod(g, 'hand_truck_rope_tail', [HW + .02, 1.06, -.1], [HW + .035, .86, -.085], .0085, rope, 'cloth', 'hemp_rope', 6); }
    { const ch = new THREE.Shape(); ch.moveTo(0, 0); ch.lineTo(.16, 0); ch.lineTo(0, .075); ch.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(ch, { depth: .09, bevelEnabled: false }), toon('#c9a23f')); m.position.set(-.245, .013, .165); m.rotation.y = .2; g.add(tag(m, 'hand_truck_wheel_chock', 'wood', 'painted_wood')); const st = box(g, 'hand_truck_chock_stripe', [.03, .002, .091], [-.2, .05, .215], toon('#2a2a2e'), 'wood', 'painted_wood', [0, .2, -.44]); st.castShadow = false; }
    { const bag = new THREE.Mesh(new THREE.SphereGeometry(.06, 12, 10), toon('#b8a888')); bag.scale.set(.8, 1.15, .5); bag.position.set(-HW - .005, .98, .03); g.add(tag(bag, 'hand_truck_chalk_bag', 'cloth', 'canvas')); rod(g, 'hand_truck_chalk_bag_cord', [-HW, 1.045, .02], [-HW, 1.1, 0], .003, toon('#8a7a5a'), 'cloth', 'cord', 5);
      for (const [dx, a] of [[-.018, .2], [.004, -.1], [.022, .28]]) { const c = rod(g, 'hand_truck_chalk_stick', [-HW - .005 + dx, 1.03, .038], [-HW - .005 + dx + a * .06, 1.085, .045], .0095, toon('#f3f0e6'), 'chalk', 'chalk', 8); c.castShadow = false; }
      const dust = new THREE.Mesh(new THREE.CircleGeometry(.03, 12), basic('#f3f0e6', { transparent: true, opacity: .5, depthWrite: false })); dust.position.set(-HW - .005, .96, .0605); dust.name = 'hand_truck_chalk_bag_dust'; dust.userData.role = 'cloth'; dust.userData.noExport = true; g.add(dust); }
    // where it stands
    let f9 = 978; try { const W = await (await fetch(new URL('../' + (film.words || 'voice/words.json'), import.meta.url))).json(), s9 = (film.sentences || [])[8]; if (s9 && s9.words && W[s9.words[0]]) f9 = Math.round(W[s9.words[0]].s * (film.fps || 30)) - 4; } catch (e) {}
    const DEF = placeName === 'hangar' ? f => (f >= f9 ? [-14.95, 35.55, 0] : false) : /hangar/.test(placeName) ? () => [-14.95, 35.55, 0] : () => [9.3, 6.3, 0], DEFYAW = TIME === 'dawn' && !HANGAR ? -90 : 90, DEFN = TIME === 'dawn' && !HANGAR ? 3 : 4;
    ups.push((f, t, s) => { const at = s.hand_truck === undefined ? DEF(f) : s.hand_truck; g.visible = Array.isArray(at); if (!g.visible) return; g.position.copy(B2T(at)); g.rotation.y = ((s.hand_truck_yaw ?? DEFYAW) - 90) * PI / 180 + PI;   // local +Z (the plates' face) -> plan heading yaw
      const n = Math.round(s.hand_truck_plates ?? DEFN); for (const p of truckPlates) p.g.visible = p.n > 4 - n; });
    anchors.hand_truck = f => { const s = world.stateAt(f), at = s.hand_truck === undefined ? DEF(f) : s.hand_truck; return Array.isArray(at) ? [at[0], at[1], at[2] + .45] : [-14.95, 35.55, .45]; };
  }

  // ------------------------------------------------------------------ 2. the pin macro hand (local axes of the group: X = screen right for a lens facing the wall, Y = up, Z = out of the paper; the pin stands on the origin)
  if (HANGAR) {
    const MY = 34.372, pm = (film.props || {}).map_wing, DEFAT = pm && pm.pos ? [pm.pos[0], MY, pm.pos[2] + (pm.h ?? 1.2)] : [-10.98, MY, 2.0];
    const G = new THREE.Group(); G.name = 'pin_hand'; G.userData.role = 'prop'; G.rotation.y = PI; G.visible = false; scene.add(G);
    const INK = '#2a1a1f', ink = basic(INK), glove = basic('#30212a'), crease = basic('#594852'), shine = basic('#ffffff', { transparent: true, opacity: .2, depthWrite: false });   // the cast's ink; the fingers one step lighter so they read on the palm
    const cap = (par, name, a, b, r, m) => { const A = new V3(...a), B = new V3(...b), d = B.clone().sub(A), L = d.length(), me = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 6, 14), m); me.position.copy(A).addScaledVector(d, .5); me.quaternion.setFromUnitVectors(UP, d.normalize()); me.name = name; me.userData.role = 'cloth'; me.userData.mat = 'ink_hand'; me.castShadow = true; par.add(me); return me; };
    // the pin and its mark on the paper
    const pin = new THREE.Group(); pin.name = 'pin_hand_pin'; G.add(pin);
    const shank = new THREE.Mesh(new THREE.CylinderGeometry(.0011, .0011, .034, 6), shiny('#c9cdd0', 140, '#ffffff')); shank.rotation.x = PI / 2; shank.position.z = -.006; pin.add(tag(shank, 'pin_hand_pin_shank', 'metal', 'steel', false));
    const head = new THREE.Mesh(new THREE.SphereGeometry(.0125, 22, 16), new THREE.MeshPhongMaterial({ color: '#d0141f', specular: '#ffffff', shininess: 120, emissive: '#5a0509' })); head.position.z = .011; pin.add(tag(head, 'pin_hand_pin_head', 'glass', 'glass_red_pin'));
    const facet = new THREE.Mesh(new THREE.SphereGeometry(.0034, 8, 6), basic('#fff1ee', { transparent: true, opacity: .9 })); facet.position.set(-.0052, .0058, .0205); pin.add(tag(facet, 'pin_hand_pin_glint', 'glass', 'glass_red_pin', false));   // a bright fleck on the glass: it goes round with the quarter turn
    const dimple = new THREE.Mesh(new THREE.CircleGeometry(.016, 18), basic('#1a1206', { transparent: true, opacity: .3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); dimple.position.set(.006, -.009, .0012); dimple.name = 'pin_hand_pin_shadow'; dimple.userData.role = 'cloth'; dimple.userData.noExport = true; G.add(dimple);
    // the hand: palm, four curled fingers with a crease each, the thumb laid onto the pin's head, a shine streak on every finger, the arm as the cast's ink line
    const hand = new THREE.Group(); hand.name = 'pin_hand_fist'; G.add(hand); const wrist = new THREE.Group(); wrist.name = 'pin_hand_wrist'; hand.add(wrist);
    const PC = [.06, -.057, .05], R0 = .04, palm = new THREE.Mesh(new THREE.SphereGeometry(R0, 28, 20), ink); palm.position.set(...PC); palm.scale.set(1.05, 1, .8); palm.name = 'pin_hand_palm'; palm.userData.role = 'cloth'; palm.userData.mat = 'ink_hand'; palm.castShadow = true; wrist.add(palm);
    const FD = new V3(-.6, .8, 0).normalize(), FN = new V3(.8, .6, 0);   // the fingers lie across the palm; FN = along the knuckle row
    for (let i = 0; i < 4; i++) { const u = (i - 1.5) * .0195, c = new V3(...PC).addScaledVector(FN, u).add(new V3(0, 0, .026 - Math.abs(i - 1.5) * .003)), a = c.clone().addScaledVector(FD, -.02), b = c.clone().addScaledVector(FD, .02 - (i === 0 || i === 3 ? .004 : 0));
      cap(wrist, 'pin_hand_finger', [a.x, a.y, a.z], [b.x, b.y, b.z], .0096, glove); cap(wrist, 'pin_hand_finger_outline', [a.x, a.y, a.z - .004], [b.x, b.y, b.z - .004], .0114, ink);
      const k0 = c.clone().addScaledVector(FN, -.006).add(new V3(0, 0, .0102)), k1 = c.clone().addScaledVector(FN, .006).add(new V3(0, 0, .0102)); rod(wrist, 'pin_hand_knuckle_crease', [k0.x, k0.y, k0.z], [k1.x, k1.y, k1.z], .0012, crease, 'cloth', 'ink_hand', 5).castShadow = false;
 }
    { const sh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(PC[0] + .012, PC[1] + .03, PC[2] + .034), new V3(PC[0] + .03, PC[1] + .022, PC[2] + .03), new V3(PC[0] + .036, PC[1] + .002, PC[2] + .026)), 10, .0016, 5), shine); sh.name = 'pin_hand_shine'; sh.userData.role = 'cloth'; sh.userData.mat = 'ink_hand'; wrist.add(sh); }   // one soft shine arc over the knuckles, as on the cast's fists
    const thumb = new THREE.Group(); thumb.name = 'pin_hand_thumb'; wrist.add(thumb);
    cap(thumb, 'pin_hand_thumb_base', [.046, -.042, .05], [.026, -.024, .041], .0165, ink); cap(thumb, 'pin_hand_thumb_tip', [.026, -.024, .041], [.013, -.012, .0345], .0152, glove); cap(thumb, 'pin_hand_thumb_outline', [.027, -.025, .037], [.0135, -.0125, .0305], .0172, ink);
    const pad = new THREE.Mesh(new THREE.SphereGeometry(.0155, 16, 12), glove); pad.position.set(.0105, -.0095, .0335); pad.scale.set(1, 1, .78); pad.name = 'pin_hand_thumb_pad'; pad.userData.role = 'cloth'; pad.userData.mat = 'ink_hand'; thumb.add(pad);
    rod(thumb, 'pin_hand_thumb_shine', [.03, -.019, .0575], [.02, -.0095, .051], .001, shine, 'cloth', 'ink_hand', 5).castShadow = false; rod(thumb, 'pin_hand_thumb_crease', [.026, -.036, .0565], [.037, -.025, .0565], .0012, crease, 'cloth', 'ink_hand', 5).castShadow = false;
    const armM = new THREE.Mesh(new THREE.CylinderGeometry(.0155, .0155, 1, 12), ink); armM.name = 'pin_hand_arm'; armM.userData.role = 'cloth'; armM.userData.mat = 'ink_hand'; armM.castShadow = true; hand.add(armM);
    const ELBOW = new V3(.42, -.46, .3), sm = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }, Z = new V3(0, 0, 1);
    ups.push((f, t, s) => { const p = +(s.pin_hand || 0); G.visible = p > .001; if (!G.visible) return; const at = Array.isArray(s.pin_hand_at) ? s.pin_hand_at : DEFAT; G.position.copy(B2T([at[0], at[1] + .001, at[2]]));
      const a = sm(p / .35), b = sm((p - .35) / .2), c = sm((p - .55) / .25), d = sm((p - .8) / .2), out = .034 * (1 - b);   // out = how far the pin still stands out of the paper before the press
      pin.position.set((1 - a) * .2 * .72, -(1 - a) * .2 * .69, out + .012 + (1 - a) * .05); pin.rotation.z = -c * PI / 2; dimple.material.opacity = .3 * b; dimple.scale.setScalar(.4 + .6 * b); hand.visible = p < .999;   // the pin rides in under the thumb; at 1 the hand has left and the pin stays
      // the hand: comes in from the lower right, presses, rolls a quarter turn about the pin, then lifts off and leaves the way it came
      const away = (1 - a) * .2 + d * .3, lift = (1 - a) * .05 + d * .045 + out + (d > 0 ? 0 : -.0035 * Math.sin(b * PI));   // the thumb sinks a touch on the press
      hand.position.set(away * .72, -away * .69, lift); wrist.rotation.z = -(c * (1 - d * .4)) * PI / 2 * .62;   // the wrist rolls about the pin's own axis (the thumb pad stays on the head)
      pad.scale.set(1 + .14 * Math.sin(b * PI) + .06 * c, 1 + .14 * Math.sin(b * PI), .78 - .1 * Math.sin(b * PI));
      const pc = new V3(...PC).applyAxisAngle(Z, wrist.rotation.z), e = ELBOW.clone(), dv = e.clone().sub(pc), L = dv.length(); armM.position.copy(pc).addScaledVector(dv, .5); armM.scale.set(1, L, 1); armM.quaternion.setFromUnitVectors(UP, dv.normalize()); });
    { const pc = document.createElement('canvas'); pc.width = 768; pc.height = 1024; const c = pc.getContext('2d'), pen = 'rgba(52,56,70,.78)', mk = (x, y, n, done) => { c.strokeStyle = pen; c.lineWidth = 2.4; c.beginPath(); c.ellipse(x, y, 30 + (n % 3) * 2, 27 + (n % 2) * 3, n * .7, .25, 6.4); c.stroke(); c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 9, y); c.moveTo(x, y - 9); c.lineTo(x, y + 9); c.stroke(); c.fillStyle = pen; c.font = 'italic 34px "Segoe Print", "Comic Sans MS", cursive'; c.fillText(String(n), x + 34, y - 22); if (done) { c.beginPath(); c.moveTo(x + 70, y - 20); c.lineTo(x + 80, y - 8); c.lineTo(x + 100, y - 40); c.stroke(); } };
      // 1 px = 0.4 mm; the pin of the macro is number 17, in the middle; the marks round it still wait for their pins
      mk(384, 512, 17, 0); mk(150, 250, 14, 0); mk(560, 190, 15, 0); mk(170, 700, 16, 0); mk(610, 810, 18, 0); mk(330, 930, 19, 0);
      c.strokeStyle = 'rgba(52,56,70,.5)'; c.lineWidth = 1.6; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(384, 512); c.lineTo(610, 810); c.stroke(); c.setLineDash([]); c.font = 'italic 26px "Segoe Print", "Comic Sans MS", cursive'; c.fillStyle = 'rgba(52,56,70,.7)'; c.fillText('5 in', 520, 650);
      c.save(); c.translate(70, 470); c.rotate(-.06); c.font = 'italic 30px "Segoe Print", "Comic Sans MS", cursive'; c.fillText('L wing', 0, 0); c.fillText('40 holes', 0, 40); c.restore();
      for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(120,96,60,.07)'; c.beginPath(); c.arc(90 + i * 77, 60 + (i * 211) % 900, 16 + (i % 4) * 9, 0, 6.3); c.fill(); }   // thumb smudges
      const t = new THREE.CanvasTexture(pc); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; const pl = new THREE.Mesh(new THREE.PlaneGeometry(.3072, .4096), basic('#ffffff', { map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); pl.name = 'map_pencil_plot'; pl.userData.role = 'paper'; pl.userData.mat = 'pencil_on_paper'; pl.userData.noExport = true; pl.userData.text = '14 15 16 17 18 19, L wing 40 holes'; pl.rotation.y = PI; scene.add(pl);
      ups.push((f, t2, s) => { const at = Array.isArray(s.pin_hand_at) ? s.pin_hand_at : DEFAT; pl.visible = (s.map ?? 1) >= .999 && s.pencil_plot !== 0; pl.position.copy(B2T([at[0], at[1] + .0006, at[2]])); }); }
    anchors.pin_hand = f => { const s = world.stateAt(f), at = Array.isArray(s.pin_hand_at) ? s.pin_hand_at : DEFAT; return [at[0], at[1] + .012, at[2]]; };
  }

  // ------------------------------------------------------------------ 3. one lantern, one step ladder: the set's own model hides while the same thing is in a hand (kit held3d), and the lantern's light goes with it
  { const spot = scene.getObjectByName('lantern_spot'), setLan = spot && spot.children.find(o => !o.isLight), setLadder = scene.getObjectByName('step_ladder'), lanAnchor = world.anchors.lantern;
    let heldLan = null;
    let busy = false; const held = f => { if (busy || typeof window === 'undefined' || !window.held3dAll) return []; busy = true; try { return window.held3dAll(f); } catch (e) { return []; } finally { busy = false; } };   // busy: a tip_at that aims at the anchor "lantern" must not loop
    ups.push((f) => { const H = held(f), L = H.find(x => x.obj === 'lantern' && x.anchors && x.anchors.base), S = H.find(x => /ladder/.test(x.obj));
      heldLan = L ? { f, flame: L.anchors.flame_pos || L.anchors.base } : null;
      if (spot && setLan) { setLan.visible = !L; if (L) { spot.visible = true; spot.position.copy(B2T(L.anchors.base)); } }
      if (setLadder) setLadder.visible = !S; });
    if (typeof lanAnchor === 'function') anchors.lantern = f => { const L = held(f).find(x => x.obj === 'lantern' && x.anchors && x.anchors.base); return L ? (L.anchors.flame_pos || L.anchors.base) : lanAnchor(f); };
    anchors.lantern_held = f => { const L = held(f).find(x => x.obj === 'lantern' && x.anchors); return L ? (L.anchors.flame_pos || L.anchors.base) : null; };
  }

  // ------------------------------------------------------------------ 4. the crown of mug halves on the barrel's heap (hangar.js has the heap; these are the ones a lens above the rim reads first)
  if (HANGAR) {
    const BR = [-6.5, 34.95], g = new THREE.Group(); g.name = 'trash_barrel_top_halves'; g.userData.role = 'prop'; scene.add(g);
    const lay = [[0, 0, .862, .2, 0, 1], [.11, .05, .85, 1.9, 1, 0], [-.1, .07, .855, 3.4, 0, 0], [.02, -.12, .848, 4.6, 1, 1], [-.13, -.07, .842, 5.5, 0, 0], [.15, -.08, .84, .9, 0, 0], [-.03, .15, .842, 2.6, 1, 0], [.06, .1, .888, 5.0, 0, 1]];
    lay.forEach(([dx, dy, z, a, side, handle], i) => { const H = buildMugHalf(THREE, { ctx, lying: true, side: side ? PI : 0, handle: !!handle, seed: 40 + i, scale: .81 }); H.group.position.copy(B2T([BR[0] + dx, BR[1] + dy, z])); H.group.rotation.y = a; H.group.rotation.z = (i % 3 - 1) * .22; H.group.traverse(m => { if (m.isMesh && /mug_half_(body|rim)/.test(m.name)) m.castShadow = true; }); g.add(H.group); });
    ups.push((f, t, s) => { g.visible = s.mug_crown !== 0 && s.mug_crown !== false; });   // state mug_crown: 0 leaves only the set's own heap (before / after check)
  }

  // ------------------------------------------------------------------ 5. ROUND 3 (props-hero): REAL CHOCKS at the hero bomber's wheels and at the three empty spots (the airfield's plain yellow wedges stay only under the far planes).
  // Each real chock (sets/props.js buildChock) takes the place, turn and size of the airfield's wedge it replaces, so ropes, contact patches and staging stay where they were; the parking spot's number is stencilled on it.
  try { const { buildChock } = await import('./props.js'); let im = null; scene.traverse(m => { if (!im && m.isInstancedMesh && /^wheel_chock/.test(m.name)) im = m; });   // the hangar has plain meshes of the same name: take the airfield's instanced one
    if (im && im.isInstancedMesh && buildChock) { im.updateMatrixWorld(true); const M4 = new THREE.Matrix4(), p = new V3(), q = new THREE.Quaternion(), s = new V3(), SPOT = [[3, '6'], [25, '7'], [47, '8'], [69, '9']], g = new THREE.Group(); g.name = 'real_wheel_chocks'; g.userData.role = 'prop'; scene.add(g); let n = 0;
      for (let i = 0; i < im.count; i++) { im.getMatrixAt(i, M4); M4.premultiply(im.matrixWorld).decompose(p, q, s); const sp = SPOT.find(([xs]) => Math.abs(p.x - xs) < 8 && Math.abs(-p.z - 9) < 5); if (!sp || s.x < .01) continue;
        const C = buildChock(THREE, { ctx, toon, n: sp[1], col: n % 2 ? '#d8aa10' : '#f2c81c', seed: 3 + n }); C.group.position.copy(p); C.group.quaternion.copy(q); C.group.scale.copy(s); g.add(C.group); n++;
        im.setMatrixAt(i, M4.makeScale(0, 0, 0)); }
      im.instanceMatrix.needsUpdate = true; anchors.chocks_real = n; }
  } catch (e) { console.warn('extras.js: real chocks not built: ' + String(e.message).slice(0, 160)); }

  // LEAD 2026-11-13: the Mathematician's briefcase as a step. Place state key `briefcase`: [x, y, z, yaw_deg] (every place of film.json carries it;
  // the plan is baked with his soles on its top at z = 0.42). Guarded: a failure here never stops the other extras.
  try { const { buildBriefcase } = await import('./props.js'); const BC = buildBriefcase(THREE, { toon: ctx.toon, ctx }); const bh = new THREE.Group(); bh.name = 'briefcase_spot'; bh.add(BC.group); scene.add(bh); bh.visible = false;
    ups.push((f, t, s) => { const b = s && s.briefcase; bh.visible = Array.isArray(b); if (bh.visible) { bh.position.copy(world.B2T([b[0], b[1], b[2] || 0])); bh.rotation.y = (b[3] || 0) * Math.PI / 180; } });
  } catch (e) { console.warn('extras.js: briefcase not built: ' + String(e.message).slice(0, 120)); }
  // S1 2026-11-14 (stretch armor-s1-hook): THE CHIEF'S CHALK BOX. Place state key `chalk_box`: [x, y, z, yaw_deg] = a low wooden crate (0.56 x 0.36, top at 0.24) he stands on to reach the
  // last hole under the wing. No key = nothing is built (every other film draws as before).
  try { const hasBox = Object.values(film.places || {}).some(pl => pl && pl.state && Array.isArray(pl.state.chalk_box));
    if (hasBox) { const g = new THREE.Group(); g.name = 'chalk_box'; const W = .56, D = .36, Hh = .24;
      const tx = (w, h, fn) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
      const planks = (label) => tx(512, 256, (c, w, h) => { let sd = label.length * 7 + 3; const r = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        for (let k = 0; k < 3; k++) { const y0 = k * h / 3; c.fillStyle = ['#b98d54', '#c69a5e', '#b08349'][k]; c.fillRect(0, y0, w, h / 3 - 3); c.fillStyle = '#5a3d1e'; c.fillRect(0, y0 + h / 3 - 3, w, 3);
          for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(88,58,24,${.12 + r() * .25})`; c.lineWidth = 1 + r() * 1.5; const yy = y0 + 4 + r() * (h / 3 - 10); c.beginPath(); c.moveTo(0, yy); c.bezierCurveTo(w * .3, yy + r() * 8 - 4, w * .6, yy + r() * 8 - 4, w, yy + r() * 6 - 3); c.stroke(); }
          if (r() > .4) { const kx = 40 + r() * (w - 80), ky = y0 + h / 6; c.fillStyle = '#6b4520'; c.beginPath(); c.ellipse(kx, ky, 9, 6, 0, 0, 7); c.fill(); c.strokeStyle = '#8a6030'; c.beginPath(); c.ellipse(kx, ky, 14, 9, 0, 0, 7); c.stroke(); }
          for (const nx of [14, 34, w - 34, w - 14]) { c.fillStyle = '#3b3d40'; c.beginPath(); c.arc(nx, y0 + h / 6, 3.4, 0, 7); c.fill(); c.fillStyle = '#c9ccd0'; c.beginPath(); c.arc(nx - 1, y0 + h / 6 - 1, 1.2, 0, 7); c.fill(); } }
        if (label) { c.fillStyle = 'rgba(28,24,20,.86)'; c.font = 'bold 92px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, w / 2, h / 2 + 4); c.fillStyle = 'rgba(245,242,230,.5)'; for (let i = 0; i < 60; i++) c.fillRect(w * .2 + r() * w * .6, h * .3 + r() * h * .4, 2 + r() * 5, 1.5); }   // chalk dust on the stencil
        c.fillStyle = 'rgba(250,248,238,.35)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(r() * w, r() * h, 10 + r() * 22, 3 + r() * 6, r() * 3, 0, 7); c.fill(); } });
      const wood = (t) => toon('#ffffff', { map: t }), sideL = wood(planks('CHALK')), sideS = wood(planks('')), topT = wood(planks(''));
      const body = new THREE.Mesh(new THREE.BoxGeometry(W, Hh - .03, D), [sideS, sideS, topT, topT, sideL, sideL]); body.position.y = (Hh - .03) / 2 + .015; g.add(tag(body, 'chalk_box_body', 'wood', 'pine_boards'));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(g, 'chalk_box_batten', [.05, Hh, .022], [sx * (W / 2 - .04), Hh / 2, sz * (D / 2 + .011)], toon('#9a7240'), 'wood', 'pine_boards');   // the corner battens
      for (let k = 0; k < 4; k++) box(g, 'chalk_box_lid_slat', [W + .02, .016, D / 4 - .008], [0, Hh - .008, -D / 2 + D / 8 + k * D / 4], toon(['#c79c60', '#b98d54', '#cfa468', '#b58a50'][k]), 'wood', 'pine_boards');   // four lid slats with gaps
      for (const sx of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(.055, .009, 8, 16, Math.PI), toon('#d8c9a0')); h.position.set(sx * (W / 2 + .004), Hh * .62, 0); h.rotation.set(Math.PI, Math.PI / 2, 0); g.add(tag(h, 'chalk_box_rope_handle', 'cloth', 'hemp_rope')); }
      for (const [x, z] of [[-.2, -.1], [.21, .09], [-.05, .12]]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .07, 8), toon('#fbfbf4')); st.rotation.z = Math.PI / 2; st.rotation.y = x * 9; st.position.set(x, .008, D / 2 + .09 + z * .3); g.add(tag(st, 'chalk_stub_dropped', 'chalk', 'chalk', false)); }   // worn-down stubs he has dropped
      shadow(g, 'chalk_box_contact', W * .62, D * .78, [0, 0], .4); scene.add(g); g.visible = false;
      ups.push((f, t, s) => { const b = s && s.chalk_box; g.visible = Array.isArray(b); if (g.visible) { g.position.copy(world.B2T([b[0], b[1], b[2] || 0])); g.rotation.y = (b[3] || 0) * Math.PI / 180; } }); anchors.chalk_box = f => { const b = world.stateAt(f).chalk_box; return Array.isArray(b) ? [b[0], b[1], (b[2] || 0) + Hh] : null; }; } }
  catch (e) { console.warn('extras.js: chalk box not built: ' + String(e.message).slice(0, 160)); }
  // S1 fix round 3, 2026-11-14: DAYLIGHT THROUGH ONE HOLE. Place state key `hole_daylight`: [x, y, z, radius] = a through-hole of the wing underside seen from below in a close-up.
  // A pale sky disc sits 5 cm above the skin inside the wing (so the ragged hole shows day, not dark), with a soft thin shaft of light down from it. No key = nothing is built.
  try { const hd = Object.values(film.places || {}).map(pl => pl && pl.state && pl.state.hole_daylight).find(v => Array.isArray(v));
    if (hd) { const g = new THREE.Group(); g.name = 'hole_daylight'; const r = hd[3] || .14;
      const sky = new THREE.Mesh(new THREE.CircleGeometry(r * 1.5, 24), basic('#dff0ff', { fog: false, side: THREE.DoubleSide })); sky.rotation.x = Math.PI / 2; sky.position.y = .05; g.add(tag(sky, 'hole_daylight_sky', 'glass', 'sky', false)); sky.receiveShadow = false;
      const cv = document.createElement('canvas'); cv.width = 32; cv.height = 128; const c = cv.getContext('2d'), gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,244,214,.13)'); gr.addColorStop(1, 'rgba(255,244,214,0)'); c.fillStyle = gr; c.fillRect(0, 0, 32, 128);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      for (const ry of [0, Math.PI / 2]) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(r * 1.1, .9), basic('#ffffff', { map: tx, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false })); sh.position.y = -.45; sh.rotation.y = ry + .5; sh.userData.noExport = true; g.add(tag(sh, 'hole_daylight_shaft', 'glass', 'light', false)); sh.receiveShadow = false; }
      scene.add(g); g.visible = false; ups.push((f, t, s) => { const b = s && s.hole_daylight; g.visible = Array.isArray(b); if (g.visible) g.position.copy(world.B2T([b[0], b[1], b[2]])); }); } }
  catch (e) { console.warn('extras.js: hole daylight not built: ' + String(e.message).slice(0, 160)); }
  const update = (f, t, s) => { for (const u of ups) u(f, t, s || world.stateAt(f)); };
  update(0, 0, world.stateAt(0));
  return { update, anchors };
}
