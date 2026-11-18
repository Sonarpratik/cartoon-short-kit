// S4 (the turn) held prop: the big enamel coffee pot as a real 3D prop for the Chief's fist. Used only by film.json held3d of episodes/armor-no-holes/stretches/armor-s4-turn.
// (THREE, opts) -> { group, grip, tip (the spout mouth), base, setLid, setFlame, flame, lid }. Y up, metres, origin on the base. opts.handleSide -1 mirrors it (kit "flip_opts").
const HAND_Y = 0.0259;
export function buildPot(THREE, opts = {}) {
  const toon = opts.toon || (opts.ctx && opts.ctx.toon) || ((c, o = {}) => new THREE.MeshToonMaterial({ color: c, ...o }));
  const root = new THREE.Group(); root.name = 'coffee_pot_held'; root.userData.role = 'prop'; const inner = new THREE.Group(); inner.name = 'coffee_pot_held_body'; root.add(inner);
  const hs = opts.handleSide === -1 ? -1 : 1, s = opts.scale ?? 1.25, V = (x, y, z) => new THREE.Vector3(x, y, z), UP = V(0, 1, 0);
  const enamel = new THREE.MeshPhongMaterial({ color: '#ece6d2', shininess: 90, specular: '#fff1d0', side: THREE.DoubleSide }), green = toon('#2f4a3a'), dark = toon('#1f2022');
  const add = (m, n, cast = true) => { m.name = 'coffee_pot_held_' + n; m.userData.role = 'metal'; m.userData.mat = 'enamel'; m.castShadow = cast; m.receiveShadow = true; inner.add(m); return m; };
  const lathe = (prof, mat, n) => add(new THREE.Mesh(new THREE.LatheGeometry(prof.map(q => new THREE.Vector2(q[0], q[1])), 28), mat), n);
  lathe([[0, 0], [.085, 0], [.09, .012], [.073, .2], [.078, .21], [.068, .21]], enamel, 'body'); lathe([[0, .25], [.026, .245], [.06, .225], [.075, .212]], enamel, 'lid');
  const knob = add(new THREE.Mesh(new THREE.SphereGeometry(.016, 12, 10), green), 'lid_knob'); knob.position.set(0, .262, 0);
  for (const [y, r] of [[.012, .089], [.21, .077]]) { const t = add(new THREE.Mesh(new THREE.TorusGeometry(r, .006, 7, 28), green), 'band'); t.rotation.x = Math.PI / 2; t.position.y = y; }
  // the spout on the side away from the handle, rising; its mouth is the "tip"
  const A = V(-hs * .072, .09, 0), B = V(-hs * .17, .205, 0), d = B.clone().sub(A), sp = add(new THREE.Mesh(new THREE.CylinderGeometry(.013, .024, d.length(), 12, 1, true), enamel), 'spout'); sp.position.copy(A).addScaledVector(d, .5); sp.quaternion.setFromUnitVectors(UP, d.clone().normalize());
  const lip = add(new THREE.Mesh(new THREE.TorusGeometry(.013, .003, 6, 14), green), 'spout_lip'); lip.position.copy(B); lip.quaternion.setFromUnitVectors(V(0, 0, 1), d.clone().normalize());
  // the handle: a half ring on the other side, with the two rivet plates
  const hd = add(new THREE.Mesh(new THREE.TorusGeometry(.058, .0095, 8, 20, Math.PI), green), 'handle'); hd.position.set(hs * .078, .125, 0); hd.rotation.z = -hs * Math.PI / 2;
  for (const y of [.068, .182]) { const p = add(new THREE.Mesh(new THREE.BoxGeometry(.012, .03, .026), green), 'handle_plate'); p.position.set(hs * .078, y, 0); }
  for (const [a, y] of [[2.2, .06], [1.5, .15], [2.9, .12], [.6, .1]]) { const c = add(new THREE.Mesh(new THREE.SphereGeometry(.009, 8, 6), dark), 'enamel_chip', false); c.position.set(Math.cos(a) * (.088 - y * .08), y, Math.sin(a) * (.088 - y * .08)); c.scale.set(1, 1.4, .5); }
  inner.scale.setScalar(s); const grip = V(hs * .136, .125, 0).multiplyScalar(s); if (opts.inHand) inner.position.set(-grip.x, HAND_Y - grip.y, -grip.z);
  const P = v => v.clone().multiplyScalar(s).add(inner.position), flame = new THREE.Group(); flame.visible = false; root.add(flame);
  return { group: root, grip: P(V(hs * .136, .125, 0)), tip: P(B), base: P(V(0, 0, 0)), lid: null, flame, setLid() {}, setFlame() {} };
}
