// fx bolt proof set: a stone tower with a tiled pyramid roof, THE IRON SPEAR (lightning rod) on the peak, its wire with staples down the roof and the
// wall into the wet earth, two cypresses, night-storm sky. Two bolts from ctx.fx.bolt: a far one in the storm (frame 8) and the strike on the spear
// tip that runs down the wire with sparks at every staple (frame 26). Plan coordinates (x, y forward, z up), B2T to three.js.
export function build(THREE, scene, film, ctx) {
  const { B2T, pbr, relief, sky, trees, fx } = ctx, n = {};
  const add = (m, name, role, o = {}) => { n[name] = (n[name] || 0) + 1; m.name = n[name] > 1 ? `${name}_${String(n[name]).padStart(2, '0')}` : name; m.userData.role = role; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.parent || scene).add(m); return m; };
  const box = (name, role, w, d, h, at, mat, o = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const cyl = (name, role, r, h, at, mat, o = {}) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(o.r2 ?? r, r, h, o.seg ?? 24), mat); m.position.copy(B2T([at[0], at[1], at[2] + h / 2])); return add(m, name, role, o); };
  const iron = pbr.metal('iron'), stone = relief('stone', '#8f8a86', { seed: 3 }), tile = relief('tile', '#7a4a3a', { seed: 2 });

  box('ground_mud', 'ground', 220, 220, .2, [0, 60, -.2], relief('mud', '#4a4038', { scale: 3 }), { cast: false });
  box('tower_body', 'stone', 4, 4, 14, [0, 0, 0], stone);
  box('tower_cornice', 'stone', 4.5, 4.5, .35, [0, 0, 13.7], stone);
  for (const [x, y] of [[-1.2, -2.01], [1.2, -2.01]]) box('tower_window', 'stone', .7, .05, 1.6, [x, y, 9.5], relief('wood', '#2a2018', { seed: 5 }));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.25 * Math.SQRT2, 3, 4, 1), tile); roof.rotation.y = Math.PI / 4; roof.position.copy(B2T([0, 0, 15.55])); add(roof, 'tower_roof', 'tile');

  // THE SPEAR on the peak: shaft, two collars, a forged leaf head
  cyl('spear_shaft', 'metal', .05, 2.7, [0, 0, 16.9], iron, { r2: .04 });
  for (const z of [17.15, 18.6]) cyl('spear_collar', 'metal', .075, .09, [0, 0, z], iron);
  const head = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.08, .04], [.12, .2], [.09, .42], [.035, .6], [0, .68]].map(p => new THREE.Vector2(p[0], p[1])), 24), iron); head.scale.z = .35; head.position.copy(B2T([0, 0, 19.55])); add(head, 'spear_head', 'metal');
  const TIP = [0, 0, 20.23];

  // the wire: from the lower collar down the roof face, over the eave, down the wall into the earth; staples hold it
  const W = [[.07, -.07, 17.2], [.4, -.35, 16.7], [.4, -1.3, 15.3], [.4, -2.28, 14.05], [.4, -2.28, 13.7], [.4, -2.06, 13.6], [.4, -2.06, 10], [.4, -2.06, 6], [.4, -2.06, 2], [.4, -2.06, .15], [.7, -2.7, 0]];
  const cp = new THREE.CurvePath(); for (let i = 0; i < W.length - 1; i++) cp.add(new THREE.LineCurve3(B2T(W[i]), B2T(W[i + 1])));
  add(new THREE.Mesh(new THREE.TubeGeometry(cp, 160, .014, 6, false), pbr.metal('steel', { color: '#8a7462' })), 'spear_wire', 'metal');
  const STAPLES = [[.4, -1.3, 15.3], [.4, -2.06, 12.4], [.4, -2.06, 9.4], [.4, -2.06, 6.4], [.4, -2.06, 3.4], [.4, -2.06, .9]];
  for (const s of STAPLES) box('wire_staple', 'metal', .1, .04, .035, [s[0], s[1] - .015, s[2]], iron);

  trees.tree({ kind: 'cypress', at: [-5.2, -3, 0], height: 9, seed: 7 });
  trees.tree({ kind: 'cypress', at: [6.8, 5, 0], height: 11, seed: 9 });
  trees.tree({ kind: 'cypress', at: [-30, 40, 0], height: 10, seed: 12 });
  const clouds = sky.clouds({ kind: 'night-storm', seed: 4 });

  // BOLTS: the far one in the storm (counted to ten), then the strike on the spear tip and down the wire
  const far = fx.bolt({ plan: true, far: true, from: [-150, 250, 112], to: [-134, 242, 0], seed: 3, frame: 8, leader: 3, clouds });
  const main = fx.bolt({ plan: true, from: [9, 40, 64], path: [TIP, [0, 0, 19.4], [0, -.03, 18.1], ...W], sparks: [TIP, ...STAPLES], seed: 11, frame: 26, leader: 5, runFrames: 6, clouds, groundY: 0 });
  globalThis.__bolts = { far: far.timing, main: main.timing, mainVerts: main.vertices, farVerts: far.vertices, lines: main.lines, restrikes: main.restrikes };
  return { anchors: { spear: TIP } };
}
