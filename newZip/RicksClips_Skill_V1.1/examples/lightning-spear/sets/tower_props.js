// hookA held prop (rough pitch frame): THE MASON'S HAMMER. Local +Y runs up the handle; grip = where the fist closes, tip = the striking face.
// Parts: turned ash handle with a swell at the butt, an iron wedge in the eye, a forged lump head with a flat face and a chamfered peen, a worn bright face.
export function buildHammer(THREE, opts = {}) {
  const toon = opts.toon || (c => new THREE.MeshLambertMaterial({ color: c })), g = new THREE.Group(); g.name = 'mason_hammer';
  const add = (geo, mat, name, p, role = 'metal') => { const m = new THREE.Mesh(geo, mat); m.name = name; m.userData.role = role; m.position.set(...p); m.castShadow = true; g.add(m); return m; };
  const wood = toon('#c98a48'), iron = toon('#4a5174'), bright = new THREE.MeshBasicMaterial({ color: '#ffd9a0' });
  add(new THREE.CylinderGeometry(.017, .021, .36, 10), wood, 'hammer_handle', [0, .18, 0], 'wood'); add(new THREE.SphereGeometry(.026, 10, 8), wood, 'hammer_butt', [0, .0, 0], 'wood');
  add(new THREE.BoxGeometry(.2, .085, .085), iron, 'hammer_head', [0, .375, 0]); add(new THREE.BoxGeometry(.012, .09, .09), bright, 'hammer_face', [.104, .375, 0]);
  add(new THREE.BoxGeometry(.05, .06, .06), iron, 'hammer_peen', [-.118, .375, 0]); add(new THREE.BoxGeometry(.03, .012, .02), bright, 'hammer_wedge', [0, .42, 0]);
  return { group: g, grip: new THREE.Vector3(0, .07, 0), tip: new THREE.Vector3(.11, .375, 0) };
}
