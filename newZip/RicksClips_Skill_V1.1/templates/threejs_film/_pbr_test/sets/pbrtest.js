// kit3d proof set: iron spear in a bracket with a wire, bronze bell on a wheel, gold angel, stone floor, cobble path, trees, dusk storm sky.
// Every material goes through ctx.pbr / ctx.relief / ctx.trees / ctx.sky, so film.json "kit3d": false renders the old toon look of the same set.
export function build(THREE, scene, film, ctx) {
  const { B2T, toon, pbr, relief, sky, trees } = ctx, n = {};
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.parent || scene).add(m); return m; };
  const box = (name, role, w, d, h, at, mat, o = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); if (o.rot) m.rotation.y = o.rot; return add(m, name, role, o); };
  const cyl = (name, role, r, h, at, mat, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 32), mat); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const iron = pbr.metal('iron'), bronze = pbr.metal('bronze'), gold = pbr.metal('gold'), brass = pbr.metal('brass');

  // ground: stone flags, a cobble path to the bell, a low brick wall, grass beyond
  box('floor_stone', 'stone', 18, 18, .2, [0, 3, -.2], relief('stone', '#b9ab98', { scale: 2.6 }), { cast: false });
  box('path_cobble', 'stone', 2.2, 20, .04, [1.3, 3, 0], relief('cobble', '#8e8478', { scale: 1.3 }), { cast: false });
  box('grass_far', 'ground', 120, 80, .1, [0, 52, -.15], relief('grass', '#6f8a4a', { scale: 3 }), { cast: false });
  box('wall_brick', 'brick', 16, .4, .9, [0, 11.8, 0], relief('brick', '#a8654a', { scale: 1.4 }));

  // IRON SPEAR in a bracket on a stone post
  const sx = -1.7, sy = 1.2;
  box('spear_post', 'stone', .55, .55, 1.3, [sx, sy, 0], relief('stone', '#a89a88', { scale: 1.2, seed: 2 }));
  cyl('spear_shaft', 'metal', .05, 3.6, [sx, sy - .36, .1], iron);
  for (const z of [1.5, 3.2]) cyl('spear_collar', 'metal', .075, .08, [sx, sy - .36, z], iron);
  const head = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.09, .04], [.13, .22], [.1, .45], [.04, .62], [0, .7]].map(p => new THREE.Vector2(p[0], p[1])), 32), iron); head.scale.z = .35; head.position.copy(B2T([sx, sy - .36, 3.7])); add(head, 'spear_head', 'metal');
  cyl('spear_socket', 'metal', .065, .25, [sx, sy - .36, 3.48], iron, { r2: .055 });
  for (const z of [.55, 1.05]) { box('bracket_arm', 'metal', .1, .34, .06, [sx, sy - .2, z], iron); const band = new THREE.Mesh(new THREE.TorusGeometry(.075, .02, 10, 28), iron); band.rotation.x = Math.PI / 2; band.position.copy(B2T([sx, sy - .36, z + .03])); add(band, 'bracket_band', 'metal');
    for (const dx of [-.14, .14]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .04, 12), iron); b.rotation.x = Math.PI / 2; b.position.copy(B2T([sx + dx, sy - .29, z + .03])); add(b, 'bracket_bolt', 'metal'); } }
  box('bracket_plate', 'metal', .42, .03, .7, [sx, sy - .29, .45], iron);

  // BRONZE BELL on a timber frame, a bell wheel beside it
  const bx = 1.6, by = 3.2, bz = 3.0, wood = relief('wood', '#7a5638', { scale: 1.6 });
  for (const dx of [-1.05, 1.05]) box('frame_post', 'wood', .2, .2, bz + .3, [bx + dx, by, 0], wood);
  box('frame_beam', 'wood', 2.4, .24, .22, [bx, by, bz + .3], wood);
  const bell = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.16, 0], [.24, -.05], [.3, -.25], [.34, -.55], [.43, -.82], [.52, -.95], [.5, -1.0], [.0, -1.0]].map(p => new THREE.Vector2(p[0], p[1] + 1)), 48), bronze);
  bell.position.copy(B2T([bx, by, bz - 1.02])); add(bell, 'bell_body', 'metal');
  cyl('bell_lip', 'metal', .52, .05, [bx, by, bz - 1.04], bronze, { r2: .5 });
  cyl('bell_yoke', 'metal', .1, .18, [bx, by, bz - .05], iron);
  cyl('bell_clapper', 'metal', .02, .7, [bx, by, bz - 1.2], iron); const ball = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 12), iron); ball.position.copy(B2T([bx, by, bz - 1.2])); add(ball, 'bell_clapper_ball', 'metal');
  const wheel = new THREE.Group(); wheel.position.copy(B2T([bx + 1.25, by, bz - .4])); wheel.rotation.y = Math.PI / 2; scene.add(wheel);
  add(new THREE.Mesh(new THREE.TorusGeometry(.55, .035, 12, 48), brass), 'bell_wheel_rim', 'metal', { parent: wheel });
  for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.1, 8), brass); s.rotation.z = k * Math.PI / 6; add(s, 'bell_wheel_spoke', 'metal', { parent: wheel }); }
  add(new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .14, 16), iron), 'bell_wheel_hub', 'metal', { parent: wheel }).rotation.x = Math.PI / 2;

  // WIRE from the spear head down to the bell yoke (a sagging catenary)
  const a = B2T([sx, sy - .36, 3.62]), b = B2T([bx, by, bz + .45]), pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, p = a.clone().lerp(b, t); p.y -= Math.sin(Math.PI * t) * .45; pts.push(p); }
  add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, .014, 8), brass), 'spear_wire', 'metal');

  // GOLD ANGEL on a stone pedestal
  const ax = -.2, ay = 5.6; box('angel_pedestal', 'stone', .9, .9, 1.3, [ax, ay, 0], relief('stone', '#c2b4a0', { scale: 1.2, seed: 3 }));
  const robe = new THREE.Mesh(new THREE.LatheGeometry([[.34, 0], [.3, .25], [.2, .7], [.15, .95], [.12, 1.05], [0, 1.08]].map(p => new THREE.Vector2(p[0], p[1])), 40), gold); robe.position.copy(B2T([ax, ay, 1.3])); add(robe, 'angel_robe', 'metal');
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.15, 32, 24), gold); hd.position.copy(B2T([ax, ay, 2.55])); add(hd, 'angel_head', 'metal');
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.2, .018, 10, 40), gold); halo.position.copy(B2T([ax, ay + .12, 2.72])); halo.rotation.x = .3; add(halo, 'angel_halo', 'metal');
  const wingS = new THREE.Shape(); wingS.moveTo(0, 0); wingS.bezierCurveTo(.25, .35, .7, .75, .95, .9); wingS.bezierCurveTo(.8, .55, .75, .25, .55, .05); wingS.bezierCurveTo(.4, -.2, .2, -.35, 0, -.25); wingS.lineTo(0, 0);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ExtrudeGeometry(wingS, { depth: .04, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 4, curveSegments: 24 }), gold); w.scale.x = s; w.position.copy(B2T([ax + s * .08, ay + .12, 2.05])); w.rotation.y = -s * .35; add(w, 'angel_wing', 'metal');
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, .5, 16), gold); arm.position.copy(B2T([ax + s * .2, ay - .05, 2.05])); arm.rotation.z = s * .5; arm.rotation.x = -.6; add(arm, 'angel_arm', 'metal'); }
  const trumpet = new THREE.Mesh(new THREE.CylinderGeometry(.05, .012, .55, 20, 1, true), gold); trumpet.position.copy(B2T([ax + .3, ay - .35, 2.4])); trumpet.rotation.z = -1.1; add(trumpet, 'angel_trumpet', 'metal');

  // trees of northern Italy behind
  trees.tree({ kind: 'oak', at: [-5.2, 9.5, 0], seed: 3 }); trees.tree({ kind: 'cypress', at: [4.6, 8.8, 0], seed: 7 }); trees.tree({ kind: 'cypress', at: [6.4, 12.5, 0], seed: 9, height: 11 });
  trees.tree({ kind: 'olive', at: [-2.6, 13.5, 0], seed: 4 }); trees.tree({ kind: 'blossom', at: [2.4, 14.5, 0], seed: 6 });
  for (let i = 0; i < 9; i++) trees.tree({ kind: 'cypress', at: [-24 + i * 6, 34 + (i % 3) * 4, 0], seed: 20 + i, height: 8 + (i % 3) * 2 });

  sky.clouds({ kind: (ctx.place && ctx.place.sky_kind) || 'dusk-storm', seed: 5 });
  return { anchors: { spear: [sx, sy - .36, 3.7], bell: [bx, by, bz - .5], angel: [ax, ay, 2.3] } };
}
