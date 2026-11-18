// DEMO SET: a railway platform. Simple toon set for the storyboard / animatic stage (no textures, no final look).
// A set module exports build(THREE, scene, film, ctx) and may return { update(f, t), anchors: { name: [x, y, z] | f => [x, y, z] } }.
// Coordinates are the plan's: metres, Z up, Y away from the opening camera. ctx.B2T converts, ctx.toon(colour) is the shared toon material.
// Every mesh gets a NAME and a ROLE (ground, wood, metal, cloth, glass, stone, brick, plaster, roof, water, foliage, lamp), or an exact
// library material with { mat: 'wood_grain' }. --export-lock writes both into the .glb, so the Blender look pass knows what each surface is.
export function build(THREE, scene, film, ctx) {
  const { B2T, toon } = ctx, n = {};
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; if (o.mat) m.userData.mat = o.mat; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.parent || scene).add(m); return m; };
  const box = (name, role, w, d, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); if (o.rot) m.rotation.y = o.rot; return add(m, name, role, o); };
  const cyl = (name, role, r, h, at, col, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 16), toon(col)); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const flat = (name, role, geo, col, at, o = {}) => { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col })); if (at) m.position.copy(at); return add(m, name, role, { cast: false, ...o }); };
  // ground far below, platform slab (top at z = 0), yellow safety line, track bed, rails, sleepers
  box('ground_far', 'ground', 400, 400, .2, [0, 100, -1.3], '#9aa58a', { cast: false, mat: 'turf' });
  box('platform_slab', 'stone', 120, 14, 1.1, [0, -4.2, -1.1], '#cfc6b4', { cast: false, mat: 'cobble' });
  box('platform_safety_line', 'stone', 120, .22, .012, [0, 2.2, 0], '#e9c53a', { cast: false, mat: 'matte' }); box('platform_edge', 'stone', 120, .5, .1, [0, 2.6, -.1], '#a79d8c', { cast: false });
  box('track_bed', 'ground', 120, 3.4, .25, [0, 4.4, -1.1], '#6f6a66', { cast: false, mat: 'gravel' });
  for (const y of [3.7, 5.1]) box('rail', 'metal', 120, .1, .14, [0, y, -.85], '#4a4a52', { mat: 'metal' });
  for (let x = -40; x <= 40; x += 1.1) box('sleeper', 'wood', .28, 2.2, .1, [x, 4.4, -.86], '#7a5a3e', { cast: false });
  // the train: a boxy engine and two carriages standing on the track
  const car = (x, len, col) => { box('carriage_body', 'metal', len, 2.3, 2.5, [x, 4.4, -.45], col); box('carriage_roof', 'metal', len + .1, 2.4, .25, [x, 4.4, 2.05], '#2c2f3a'); box('carriage_frame', 'metal', len, 2.34, .35, [x, 4.4, -.7], '#2a2a30');
    for (let k = -len / 2 + .9; k < len / 2 - .4; k += 1.5) box('carriage_window', 'glass', .9, .06, .8, [x + k, 3.22, .9], '#bfe3f2', { cast: false });
    for (const k of [-len / 2 + 1, len / 2 - 1]) for (const y of [3.5, 5.3]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .16, 16), toon('#22222a')); w.rotation.x = Math.PI / 2; w.position.copy(B2T([x + k, y, -.42])); add(w, 'wheel', 'metal', { mat: 'metal' }); } };
  car(-9.4, 8.6, '#a8323a'); car(-.2, 8.6, '#a8323a');
  box('engine_body', 'metal', 6.2, 2.3, 2.1, [8, 4.4, -.45], '#2f4f3f'); cyl('engine_boiler', 'metal', .95, 4.4, [9.6, 4.4, .55], '#2f4f3f').rotation.z = Math.PI / 2; cyl('engine_chimney', 'metal', .28, 1.0, [10.9, 4.4, 2.0], '#22222a'); box('engine_cab', 'metal', 2.2, 2.4, 1.3, [5.9, 4.4, 1.65], '#3b6350'); box('engine_window', 'glass', .9, .06, .7, [5.9, 3.2, 2.0], '#bfe3f2', { cast: false });
  // far side: a low wall, houses and trees so every sweep of the camera has a background
  box('far_wall', 'brick', 120, .3, 1.6, [0, 7.4, -1.1], '#b7ab98');
  const cols = ['#d9b08c', '#c9d6c2', '#e3c9a0', '#b9c4d6', '#d8a7a0'];
  for (let i = -9; i <= 9; i++) { const h = 4 + ((i * 7 + 13) % 5) * 1.3, x = i * 6.5 + ((i * 3) % 2); box('house', 'plaster', 5.2, 5, h, [x, 14 + (i % 3) * 2, -1.1], cols[(i + 9) % 5], { cast: false }); const roof = new THREE.Mesh(new THREE.ConeGeometry(4, 1.8, 4), toon('#8a4b3c')); roof.rotation.y = Math.PI / 4; roof.position.copy(B2T([x, 14 + (i % 3) * 2, h - .2])); add(roof, 'house_roof', 'roof', { cast: false }); }
  for (let i = -6; i <= 6; i++) { const t = new THREE.Mesh(new THREE.SphereGeometry(1.5 + (i % 3) * .3, 10, 8), toon('#6f9a5a')); t.position.copy(B2T([i * 7.3 + 3, 9.5, 1.6])); add(t, 'tree_crown', 'foliage', { cast: false }); cyl('tree_trunk', 'wood', .16, 2.6, [i * 7.3 + 3, 9.5, -1.1], '#6a4a35'); }
  // platform dressing: lamps, benches, crates, a trunk, a sign. Kept off the camera arc and off the actors' marks.
  for (const x of [-7.5, -3.6, 4.6, 8.6]) { cyl('lamp_post', 'metal', .06, 3.2, [x, 1.7, 0], '#2b2d3a'); box('lamp_arm', 'metal', .5, .16, .05, [x, 1.5, 3.15], '#2b2d3a'); flat('lamp_globe', 'lamp', new THREE.SphereGeometry(.16, 12, 8), '#fff1c2', B2T([x, 1.3, 3.05])); }
  for (const x of [-5.4, 6.4]) { box('bench_seat', 'wood', 1.6, .45, .08, [x, 1.5, .42], '#7a5a3e'); box('bench_back', 'wood', 1.6, .08, .5, [x, 1.72, .5], '#7a5a3e'); for (const k of [-.7, .7]) box('bench_leg', 'metal', .08, .4, .42, [x + k, 1.5, 0], '#2b2d3a'); }
  box('crate', 'wood', .8, .6, .6, [3.3, 1.3, 0], '#b98a52', { rot: .3, mat: 'plywood' }); box('crate', 'wood', .6, .5, .5, [3.9, 1.0, 0], '#a87a45', { rot: -.2, mat: 'plywood' }); box('crate', 'wood', .55, .45, .45, [3.4, 1.3, .6], '#c79a62', { rot: .5, mat: 'plywood' });
  box('trunk', 'cloth', .9, .45, .5, [-3.3, 1.2, 0], '#5a3a2a', { rot: .15 }); cyl('milk_churn', 'metal', .3, .8, [-4.2, 1.9, 0], '#6d7b8a', { mat: 'metal' });
  cyl('sign_post', 'metal', .05, 2.5, [-6.6, 1.9, 0], '#2b2d3a'); box('sign_board', 'metal', 1.5, .06, .45, [-6.6, 1.88, 2.15], '#26356a');
  // the post clock (hero prop): two faces, hands that the film can stop
  const cp = (film.props && film.props.clock && film.props.clock.pos) || [1.5, .6, 0], hands = [];
  cyl('clock_post', 'metal', .09, 2.1, cp, '#2b2d3a'); cyl('clock_foot', 'metal', .16, .14, cp, '#2b2d3a'); box('clock_neck', 'metal', .34, .34, .12, [cp[0], cp[1], 2.02], '#2b2d3a');
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(.52, .52, .26, 28), toon('#2b2d3a')); drum.rotation.x = Math.PI / 2; drum.position.copy(B2T([cp[0], cp[1], 2.62])); add(drum, 'clock_drum', 'metal');
  for (const s of [-1, 1]) {
    const d = flat('clock_face', 'glass', new THREE.CircleGeometry(.45, 28), '#fbf6e8', B2T([cp[0], cp[1] + s * .135, 2.62]), { mat: 'clock_face' }); if (s > 0) d.rotation.y = Math.PI;
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, t = flat('clock_tick', 'metal', new THREE.PlaneGeometry(.03, k % 3 ? .06 : .11), '#2a1a1f', null, { parent: d, mat: 'ink_flat' }); t.position.set(Math.sin(a) * .37, Math.cos(a) * .37, .002); t.rotation.z = -a; }
    const hg = new THREE.PlaneGeometry(.045, .24); hg.translate(0, .1, 0); const hh = flat('clock_hand_hour', 'metal', hg, '#2a1a1f', null, { parent: d, mat: 'ink_flat' }); hh.position.z = .004; hh.rotation.z = -1.0;
    const mg = new THREE.PlaneGeometry(.03, .36); mg.translate(0, .16, 0); const mh = flat('clock_hand_minute', 'metal', mg, '#2a1a1f', null, { parent: d, mat: 'ink_flat' }); mh.position.z = .006; hands.push(mh);
  }
  return {
    anchors: { clock: [cp[0], cp[1], 2.62], train: [-.2, 3.2, 1.2] },
    update: (f, t) => { for (const m of hands) m.rotation.z = -t * .9; },      // something always moves in the set (secondary motion)
  };
}
