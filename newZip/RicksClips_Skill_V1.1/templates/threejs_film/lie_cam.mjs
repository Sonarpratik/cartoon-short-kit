// LYING IN PERSPECTIVE (CB 2026-11-12 13:39Z "but the camera view angle. perpective").
// A lying body has a real direction on the floor (head -> feet). Every frame we ask where that line lands in the picture,
// then pick the drawing and turn the card in the picture plane so the body follows the floor in perspective. Never squashed:
//   camera high (looking down)          -> 'top'  : front view (on the back) / back view (on the belly), laid along the body line
//   camera level, body across the shot  -> 'side' : the side view lying drawing, turned to the body line on the floor
//   camera level, body points at the lens -> 'feet' (feet nearest: soles big in front, body and head behind) or 'head' (head nearest: the same short body turned upside down, head on the floor in front, toes far behind)
// Pure maths: no scene objects are made here. THREE is passed in so film.js and the test page share one copy.
//   lieLayout(THREE, camera, { centre: Vector3 on the floor, yaw: degrees (0 = head toward world -X in plan terms, see film.js), lie: 'back'|'front', len: body metres, H: picture px })
//   -> { art, dir, rotZ, e (camera elevation deg), ratio (on-screen length / full length) }
export function lieAxis(THREE, yawDeg) { const a = (yawDeg || 0) * Math.PI / 180; return new THREE.Vector3(-Math.cos(a), 0, Math.sin(a)); }   // head direction, three.js coords (Y up)

export function lieLayout(THREE, cam, o) {
  const ax = lieAxis(THREE, o.yaw), half = o.len / 2, C = o.centre.clone();
  const Hw = C.clone().addScaledVector(ax, half), Fw = C.clone().addScaledVector(ax, -half);
  const toS = p => { const q = p.clone().project(cam); return [q.x * cam.aspect, q.y]; };   // aspect-true screen units (y up)
  const hs = toS(Hw), fs = toS(Fw), v = [hs[0] - fs[0], hs[1] - fs[1]];
  const dist = cam.position.distanceTo(C), full = o.len / (dist * Math.tan(cam.fov * Math.PI / 360));   // the same body at the same distance, across the shot
  const ratio = Math.hypot(v[0], v[1]) / full;
  const up = cam.position.clone().sub(C).normalize(), e = Math.asin(Math.max(-1, Math.min(1, up.y))) * 180 / Math.PI;
  const rz = Math.atan2(-v[0], v[1]);                                   // card up (head) along the body line on screen
  let art, dir = 1, rotZ = rz;
  if (e > (o.topAt ?? 50)) art = 'top';
  else if (ratio < (o.endAt ?? .5)) { const feetNear = cam.position.distanceTo(Fw) < cam.position.distanceTo(Hw); art = feetNear ? 'feet' : 'head'; rotZ = feetNear ? 0 : Math.PI; }
  else { art = 'side'; const s = Math.sin(rz) || 1; dir = (o.lie === 'front' ? -1 : 1) * Math.sign(s); }   // face to the sky on the back, to the floor on the belly
  return { art, dir, rotZ, e, ratio, Hw, Fw };
}

// place a card (PlaneGeometry origin on its ground line, scaled to metres) for a layout: billboard to the lens, turned by rotZ,
// the body centre (hc metres above the card's ground line) on the floor centre, lifted, and slid toward the lens along its own ray
// if the turned card would dip under the floor (same picture, no clipping)
export function placeLying(THREE, cam, mesh, L, o) {
  mesh.rotation.order = 'YXZ'; mesh.rotation.set(0, 0, 0);
  if (L.art === 'feet') {   // standing up in the picture: soles on the floor at the feet end
    const p = L.Fw.clone(); mesh.position.copy(p);
    mesh.rotation.y = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    mesh.rotation.x = -Math.atan2(cam.position.y - (p.y + o.len * .3), Math.hypot(cam.position.x - p.x, cam.position.z - p.z)); return; }
  if (L.art === 'head') {   // upside down in the picture: the top of the head on the floor at the head end
    const p = L.Hw.clone(); mesh.position.copy(p); mesh.quaternion.copy(cam.quaternion); mesh.rotateZ(Math.PI); mesh.updateMatrixWorld(true);
    const t = new THREE.Vector3(0, o.topN ?? o.bodyN * .72, 0).applyMatrix4(mesh.matrixWorld); mesh.position.add(p.clone().setY(p.y + .03).sub(t)); return; }
  const C = o.centre.clone(); C.y += L.art === 'side' ? o.lift : .02;
  mesh.quaternion.copy(cam.quaternion); mesh.rotateZ(L.rotZ);                       // face the lens exactly, then turn in the picture plane
  mesh.updateMatrixWorld(true);
  const off = new THREE.Vector3(0, o.hc / mesh.scale.y, 0).applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(mesh.quaternion)).multiplyScalar(mesh.scale.y);
  mesh.position.copy(C).sub(off);
  // lowest point of the body inside the card (o.bodyN = body length, o.wN = half width, both in card units: 1 = card height / width): keep it above the floor
  mesh.updateMatrixWorld(true); let low = 0;
  for (const [x, y] of [[-o.wN, 0], [o.wN, 0], [-o.wN, o.bodyN], [o.wN, o.bodyN]]) { const w = new THREE.Vector3(x, y, 0).applyMatrix4(mesh.matrixWorld); low = Math.min(low, w.y - (o.floorY ?? 0) - .02); }
  if (low < 0) { const ray = cam.position.clone().sub(mesh.position), d0 = ray.length(), sinE = Math.max(.12, Math.sin(L.e * Math.PI / 180)), d = Math.min(d0 * .45, -low / sinE);
    mesh.position.addScaledVector(ray.normalize(), d); mesh.scale.multiplyScalar((d0 - d) / d0); }
}
