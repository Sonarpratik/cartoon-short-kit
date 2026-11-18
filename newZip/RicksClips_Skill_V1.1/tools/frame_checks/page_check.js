// page_check.js: runs INSIDE the film page (render_gpu.mjs --eval). check.mjs puts "window.__FC = {...};" in front of it.
// Reads the live scene per frame (camera, card matrices, card drawings, set meshes) and tests four things with numbers. Nothing in the kit is changed.
// While it scans, the renderer's draw call is switched off (this page only), so the graphics card stays free; it draws only the few crops at the end.
(async () => {
  const THREE = await import('/kit/vendor/three.module.js');
  const { CARD } = await import('/kit/puppets.mjs');
  const C = window.__FC, R = window.__R(), rd = R.renderer, cam = R.camera, W = R.W, H = R.H;
  const realRender = rd.render; rd.render = function () {};          // no drawing during the scan
  const log = { notes: [], skipped: {} };
  // ---------- the card drawing: silhouette, head with hat, eyes, feet (from the alpha of the drawing actually on the card) ----------
  const GW = 160, GH = 300, CS = CARD.W / GW, sc = document.createElement('canvas'); sc.width = GW; sc.height = GH; const sg = sc.getContext('2d', { willReadFrequently: true });
  const artCache = new Map();
  const art = (card, tex) => {
    const key = tex.uuid; if (artCache.has(key)) return artCache.get(key);
    sg.clearRect(0, 0, GW, GH); sg.drawImage(tex.image, 0, 0, GW, GH); const d = sg.getImageData(0, 0, GW, GH).data, a = new Uint8Array(GW * GH);
    let x0 = GW, x1 = -1, y0 = GH, y1 = -1; const rows = [];
    for (let y = 0; y < GH; y++) { let l = -1, r = -1; for (let x = 0; x < GW; x++) if (d[(y * GW + x) * 4 + 3] > 60) { a[y * GW + x] = 1; if (l < 0) l = x; r = x; } if (l >= 0) { rows.push([y, l, r]); x0 = Math.min(x0, l); x1 = Math.max(x1, r); y0 = Math.min(y0, y); y1 = y; } }
    const o = { ok: x1 >= 0, rows, box: [x0, y0, x1, y1], a };
    if (o.ok) {
      // head: the kit's head circle (metrics hy, headPx); if the pose moved the head, the best-covered circle near it
      const r = card.m.headPx / 2 / CS, cov = (cx, cy) => { let n = 0, t = 0; for (let y = Math.round(cy - r); y <= cy + r; y += 2) for (let x = Math.round(cx - r); x <= cx + r; x += 2) { if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) continue; t++; if (x >= 0 && x < GW && y >= 0 && y < GH && a[y * GW + x]) n++; } return t ? n / t : 0; };
      let hx = CARD.CX / CS, hy = card.m.hy / CS, best = cov(hx, hy); const def = best;
      if (best < .9) for (let dy = -1.6; dy <= 1.6; dy += .2) for (let dx = -1.6; dx <= 1.6; dx += .2) { const v = cov(CARD.CX / CS + dx * r, card.m.hy / CS + dy * r) - .04 * Math.hypot(dx, dy); if (v > best) { best = v; hx = CARD.CX / CS + dx * r; hy = card.m.hy / CS + dy * r; } }
      o.head = best >= .6 ? { x: hx * CS, y: hy * CS, r: r * CS, cov: +best.toFixed(2), moved: best !== def } : null;
      if (o.head) { const pts = []; let top = hy - r;
        for (let y = Math.max(0, Math.round(hy - 1.95 * r)); y <= Math.min(GH - 1, hy + r); y++) for (let x = Math.max(0, Math.round(hx - 1.2 * r)); x <= Math.min(GW - 1, hx + 1.2 * r); x++) { if (!a[y * GW + x]) continue; const inC = (x - hx) ** 2 + (y - hy) ** 2 <= r * r * 1.02; if (!inC && y > hy - .25 * r) continue; pts.push([(x + .5) * CS, (y + .5) * CS]); top = Math.min(top, y); }
        o.headPts = pts.filter((_, i) => i % 3 === 0); o.hatTop = top * CS; }
      // feet: the lowest band of the drawing, left and right group; tested on the card's ground line (so a drawn hop is not a fault, a wrong place is)
      const xs = []; for (const [y, l, rr] of rows) if (y >= y1 - 5) for (let x = l; x <= rr; x++) if (a[y * GW + x]) xs.push(x); xs.sort((p, q) => p - q);
      let cut = -1, gap = 3; for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i - 1] > gap) { gap = xs[i] - xs[i - 1]; cut = i; }
      const mean = v => v.reduce((s, x) => s + x, 0) / v.length; o.feet = (cut > 0 ? [xs.slice(0, cut), xs.slice(cut)] : [xs.slice(0, Math.ceil(xs.length / 2)), xs.slice(Math.floor(xs.length / 2))]).map(v => (mean(v) + .5) * CS);
      o.soleY = (y1 + 1) * CS;
      // body: every 3rd drawn pixel from the neck to just above the sole (torso, hips, thighs, legs), with its height share (0 = neck, 1 = sole)
      const bTop = o.head ? hy + r : y0 + .18 * (y1 - y0), bBot = y1 - Math.max(2, .02 * (y1 - y0)); o.body = [];
      for (let y = Math.ceil(bTop); y <= bBot; y += 3) for (let x = 1; x < GW; x += 3) if (a[y * GW + x]) o.body.push([(x + .5) * CS, (y + .5) * CS, (y - bTop) / Math.max(1, y1 - bTop), y]);
    }
    artCache.set(key, o); return o;
  };
  const v3 = new THREE.Vector3(), toWorld = (mesh, qx, qy, out = new THREE.Vector3()) => out.set((qx - CARD.CX) / CARD.W, (CARD.GY - qy) / CARD.H, 0).applyMatrix4(mesh.matrixWorld);
  const vp = new THREE.Matrix4(), toScreen = (w) => { v3.copy(w).applyMatrix4(cam.matrixWorldInverse); const z = -v3.z; v3.applyMatrix4(cam.projectionMatrix); return [(v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H, z]; };
  // ---------- set geometry that can cover a face or carry a foot ----------
  const cardSet = new Set(); for (const cd of Object.values(R.cards)) { cardSet.add(cd.mesh); cardSet.add(cd.blob); }
  const heldRoots = new Set(); for (const h of R.h3o || []) for (const k of ['main', 'flip']) { const v = h[k]; if (!v) continue; for (const q of [v, v.g, v.group, v.o && v.o.group]) if (q && q.isObject3D) heldRoots.add(q); }
  const SKIP_NAME = new RegExp(C.skipName, 'i'), HELD_NAME = C.heldNames.length ? new RegExp('(^|[^a-z])(' + C.heldNames.join('|') + ')([^a-z]|$)', 'i') : null;
  const seeThru = m => !m || m.visible === false || m.colorWrite === false || m.depthWrite === false || m.blending === THREE.AdditiveBlending || (m.transparent && m.opacity < .5);
  const nameOf = o => { const a = []; for (let p = o; p && !p.isScene; p = p.parent) if (p.name) a.push(p.name); return a.slice(0, 3).reverse().join('/') || (o.geometry && o.geometry.type) || 'mesh'; };
  const placeCache = new Map();
  const solids = (pl) => {
    if (placeCache.has(pl)) return placeCache.get(pl); const list = [], why = {}, st = { inst: 0 };
    const skip = (k) => { why[k] = (why[k] || 0) + 1; };
    pl.scene.traverse(o => { if (!o.isMesh || cardSet.has(o)) return; if (o.isSkinnedMesh) return skip('skinned');
      for (let p = o; p; p = p.parent) { if (heldRoots.has(p)) return skip('held3d'); if (p.userData && (p.userData.inHand || p.userData.held)) return skip('held'); }
      const m0 = Array.isArray(o.material) ? o.material[0] : o.material; if (seeThru(m0)) return skip('see-through'); if (/ShaderMaterial/.test(m0.type) && m0.transparent) return skip('effect shader');
      const nm = nameOf(o); if (SKIP_NAME.test(nm)) return skip('name'); if (HELD_NAME && HELD_NAME.test(nm)) return skip('held name');
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      if (m0.side === THREE.BackSide && o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) > 30) return skip('sky shell');
      if (o.isInstancedMesh) { if (o.count > 400 && o.geometry.boundingSphere.radius < .08) return skip('small scatter (rivets, grass)'); st.inst += o.count; }
      list.push(o); });
    const mats = new Set(); for (const o of list) for (const m of [].concat(o.material)) mats.add(m);
    const v = { list, mats: [...mats], why }; placeCache.set(pl, v); log.skipped[Object.keys(R.places).find(k => R.places[k] === pl) || '?'] = { solid: list.length, instances: st.inst, ...why }; return v;
  };
  const vis = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  const rc = new THREE.Raycaster(), box = new THREE.Box3(), cp = new THREE.Vector3();
  const wbox = o => { if (o.isInstancedMesh && !o.boundingBox) { if (!o.computeBoundingBox) return null; o.computeBoundingBox(); } const e = o.matrixWorld.elements, k = e[12] + e[13] * 3 + e[14] * 7 + e[0] * 11 + e[5] * 13 + e[10] * 17; let b = o.userData.__fcB; if (!b || b.k !== k) b = o.userData.__fcB = { k, box: new THREE.Box3().copy(o.isInstancedMesh ? o.boundingBox : o.geometry.boundingBox).applyMatrix4(o.matrixWorld) }; return b.box; };
  // instanced set parts (planks, panels, slabs): one box per copy, made once, so a ray only tests the copies it can reach
  const iMesh = new THREE.Mesh(), im4 = new THREE.Matrix4(), inst = o => { const k = o.instanceMatrix.version + ':' + o.count + ':' + o.matrixWorld.elements[12] + ':' + o.matrixWorld.elements[13] + ':' + o.matrixWorld.elements[14]; let I = o.userData.__fcI; if (I && I.k === k) return I;
    I = o.userData.__fcI = { k, n: o.count, boxes: [], mats: [] }; for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, im4); const m = new THREE.Matrix4().multiplyMatrices(o.matrixWorld, im4); I.mats.push(m); I.boxes.push(new THREE.Box3().copy(o.geometry.boundingBox).applyMatrix4(m)); } return I; };
  const hitsArr = [], cast = (S, from, dir, far) => { rc.set(from, dir); rc.near = 0; rc.far = far; hitsArr.length = 0; for (const o of S.list) { const b = wbox(o); if (b && !rc.ray.intersectsBox(b)) continue; if (!vis(o)) continue; if (!o.isInstancedMesh) { o.raycast(rc, hitsArr); continue; }
      const I = inst(o); for (let i = 0; i < I.n; i++) { if (!rc.ray.intersectsBox(I.boxes[i])) continue; iMesh.geometry = o.geometry; iMesh.material = o.material; iMesh.matrixWorld.copy(I.mats[i]); const n0 = hitsArr.length; iMesh.raycast(rc, hitsArr); for (let k = n0; k < hitsArr.length; k++) { hitsArr[k].object = o; hitsArr[k].instanceId = i; } } } return hitsArr.filter(h => h.distance <= far).sort((a, b) => a.distance - b.distance); };
  const RING = [[0, 0, 0]]; for (const q of [.33, .66, 1]) for (let i = 0; i < 8; i++) RING.push([Math.cos(i * Math.PI / 4) * q * C.footReach, Math.sin(i * Math.PI / 4) * q * C.footReach, q * C.footReach]);
  const footCache = new Map();   // a standing foot (same place to the centimetre) is measured once; the set under it does not move
  const DIRS = [[.31, .87, .38], [-.62, .21, .76], [.45, -.4, -.8]].map(d => new THREE.Vector3(...d).normalize());
  const insideOf = (S, p) => {   // closed mesh around the point: an odd number of walls crossed in three directions (both faces counted)
    const cands = []; for (const o of S.list) { if (o.isInstancedMesh || !vis(o)) continue; const box = wbox(o); if (box.containsPoint(p) && !box.containsPoint(cp)) cands.push(o); }
    if (!cands.length) return null; const sides = S.mats.map(m => m.side); for (const m of S.mats) m.side = THREE.DoubleSide; let found = null;
    for (const o of cands) { let odd = 0; for (const d of DIRS) { rc.set(p, d); rc.near = 0; rc.far = 1e4; const hs = rc.intersectObject(o, false); let n = 0, last = -1; for (const h of hs) { if (h.distance - last > 1e-4) n++; last = h.distance; } if (n % 2) odd++; } if (odd === 3) { found = o; break; } }
    S.mats.forEach((m, i) => { m.side = sides[i]; }); return found;
  };
  // ---------- body inside furniture: the card's body points that lie INSIDE a solid set part (counter, table top, tub, chair, cart) ----------
  // boxes first (world box of the body against each part's world box, then the part's own oriented box), then two rays per point along the card's normal:
  // an odd number of walls toward the camera AND away from it = inside; the first wall each way = how much of the part is in front of / behind the card.
  const nrm = new THREE.Vector3(), bbB = new THREE.Box3(), inv4 = new THREE.Matrix4(), lp = new THREE.Vector3(), nBack = new THREE.Vector3(), bc = new THREE.Vector3();
  const wallsAlong = (cd, p, d) => { rc.set(p, d); rc.near = 0; rc.far = 50; const hs = []; if (cd.i === undefined) cd.o.raycast(rc, hs); else { iMesh.geometry = cd.o.geometry; iMesh.material = cd.o.material; iMesh.matrixWorld.copy(cd.m); iMesh.raycast(rc, hs); }
    hs.sort((a, b) => a.distance - b.distance); let n = 0, last = -1; for (const h of hs) { if (h.distance - last > 1e-4) n++; last = h.distance; } return [n, hs.length ? hs[0].distance : null]; };
  const med = v => { const s = v.filter(x => x !== null).sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
  const SEAT = C.seatName ? new RegExp(C.seatName, 'i') : null;   // the part a character sits ON (chair seat, stool, bench) may pass through the hips of the card
  const bodyCheck = (S, mesh, A) => {
    const P = [], Q = []; for (const q of A.body) { const w = toWorld(mesh, q[0], q[1], new THREE.Vector3()), s = toScreen(w); if (s[2] <= .05 || s[0] < 0 || s[0] > W || s[1] < 0 || s[1] > H) continue; P.push(w); Q.push([q, s]); }
    if (P.length < 12) return null; bbB.setFromPoints(P); const hgt = bbB.max.y - bbB.min.y, lowY = bbB.min.y + C.bodyLowSkip * hgt; bbB.expandByScalar(.01); bbB.getCenter(bc);
    nrm.setFromMatrixColumn(mesh.matrixWorld, 2).normalize(); if (nrm.dot(lp.copy(cp).sub(bc)) < 0) nrm.negate(); nBack.copy(nrm).negate();
    const cands = [], seats = new Set(); const room = b => b.containsBox(bbB) && ((b.max.x - b.min.x > 2.5) + (b.max.y - b.min.y > 2.5) + (b.max.z - b.min.z > 2.5)) >= 2;   // a room shell or a hill around the whole figure is not furniture
    for (const o of S.list) { if (!vis(o)) continue; const b = wbox(o); if (!b || !b.intersectsBox(bbB) || b.containsPoint(cp)) continue; if (SEAT && SEAT.test(nameOf(o))) { seats.add(nameOf(o)); continue; }
      if (o.isInstancedMesh) { const I = inst(o); for (let i = 0; i < I.n; i++) { const ib = I.boxes[i]; if (ib.intersectsBox(bbB) && !ib.containsPoint(cp) && ib.max.y > lowY && !room(ib)) cands.push({ o, m: I.mats[i], box: ib, i }); } }
      else if (b.max.y > lowY && !room(b)) cands.push({ o, m: o.matrixWorld, box: b }); }
    const res = { n: P.length, inside: 0, up: 0, upN: 0, legs: 0, legsN: 0, band: 0, bandSc: 0, bandDb: 0, bandY: null, by: new Map(), seats: [...seats], sx0: 1e9, sy0: 1e9, sx1: -1e9, sy1: -1e9 };
    for (const [q] of Q) { if (q[2] < C.bodyUpper) res.upN++; else res.legsN++; }
    if (!cands.length) return res;
    for (const cd of cands) { cd.inv = new THREE.Matrix4().copy(cd.m).invert(); }
    // a point is IN a part when it is inside its oriented box, crosses an odd number of its walls toward the camera AND away from it,
    // and the part reaches at least bodyIn (1 cm) in front of and behind the card there (a card touching a face is not "in" it)
    const inPart = (cd, w) => { if (!cd.box.containsPoint(w)) return null; lp.copy(w).applyMatrix4(cd.inv); if (!cd.o.geometry.boundingBox.containsPoint(lp)) return null;
      const [nf, df] = wallsAlong(cd, w, nrm); if (!(nf % 2)) return null; const [nb, db] = wallsAlong(cd, w, nBack); if (!(nb % 2)) return null; return { cd, df, db, deep: df >= C.bodyIn && db >= C.bodyIn }; };
    const sides = S.mats.map(m => m.side); for (const m of S.mats) m.side = THREE.DoubleSide;
    const hit = P.map(w => { for (const cd of cands) { const h = inPart(cd, w); if (h) return h; } return null; });
    // the widest cut: on each drawn row (torso, hips, thighs) where a part is in the body, every pixel across the drawing is tested against that part
    const rowsDone = new Set(), rowLR = new Map(A.rows.map(r => [r[0], r])), wq = new THREE.Vector3();
    for (let j = 0; j < P.length; j++) { const h = hit[j], q = Q[j][0]; if (!h || !h.deep || q[2] >= C.bodyUpper || rowsDone.has(q[3])) continue; rowsDone.add(q[3]); const rr = rowLR.get(q[3]); if (!rr) continue;
      let t = 0, n = 0; const dbs = []; for (let x = rr[1]; x <= rr[2]; x++) { if (!A.a[q[3] * GW + x]) continue; t++; const g = inPart(h.cd, toWorld(mesh, (x + .5) * CS, q[1], wq)); if (g && g.deep) { n++; dbs.push(g.db); } }
      const sc = n / Math.max(1, t) * (med(dbs) >= C.bodyBehind ? 2 : 1); if (t >= 5 && sc > res.bandSc) { res.bandSc = sc; res.band = n / t; res.bandDb = med(dbs); res.bandY = q[3]; res.bandPart = nameOf(h.cd.o); } }
    S.mats.forEach((m, i) => { m.side = sides[i]; });
    for (let j = 0; j < P.length; j++) { const h = hit[j]; if (!h || !h.deep) continue; const [q, s] = Q[j]; res.inside++; if (q[2] < C.bodyUpper) res.up++; else res.legs++;
      const k = nameOf(h.cd.o) + (h.cd.i !== undefined ? '#' + h.cd.i : ''); let e = res.by.get(k); if (!e) res.by.set(k, e = { n: 0, up: 0, df: [], db: [] }); e.n++; if (q[2] < C.bodyUpper) e.up++; e.df.push(h.df); e.db.push(h.db);
      res.sx0 = Math.min(res.sx0, s[0]); res.sy0 = Math.min(res.sy0, s[1]); res.sx1 = Math.max(res.sx1, s[0]); res.sy1 = Math.max(res.sy1, s[1]); }
    res.graze = hit.filter(h => h && !h.deep).length;
    return res; };
  // ---------- the scan ----------
  const rows = [], perFrame = [], t0 = performance.now(); let nFrames = 0;
  const recs = [], posAt = {}, put = (who, rest, check, f, bad, value, detail, mark) => recs.push([who, rest, check, f, bad, value, detail, mark]);
  const agg = new Map(), put2 = (who, rest, check, f, bad, value, detail, mark) => { const k = who + '|' + rest + '|' + check; let a = agg.get(k); if (!a) agg.set(k, a = { who, rest, check, frames: 0, bad: 0, worst: null, f: null, detail: '', mark: null, sev: 0 });
    a.frames++; if (bad) a.bad++; const sev = bad || 0; if (a.worst === null || sev > a.sev || (sev === a.sev && value.score > a.worst.score)) { a.worst = value; a.f = f; a.detail = detail; a.mark = mark; a.sev = sev; } };
  const TM = { render: 0, art: 0, face: 0, inside: 0, feet: 0, body: 0 }; let tq = 0; const tk = k => { const n = performance.now(); TM[k] += n - tq; tq = n; };
  const edgeOf = (x0, y0, x1, y1) => [x0 < 0 && 'left', x1 > W && 'right', y0 < 0 && 'top', y1 > H && 'bottom'].filter(Boolean).join('+');
  const w0 = new THREE.Vector3(), dir = new THREE.Vector3(), down = new THREE.Vector3(0, -1, 0);
  for (const [f, rest, bodyOnly] of C.frames) {
    const tr = performance.now(); await window.renderFrame(f, { captions: false }); TM.render += performance.now() - tr; const pl = R.placeNow; pl.scene.updateMatrixWorld(true); cam.updateMatrixWorld(true); cam.matrixWorldInverse.copy(cam.matrixWorld).invert(); cp.setFromMatrixPosition(cam.matrixWorld);
    const S = solids(pl); nFrames++;
    for (const [who, card] of Object.entries(R.cards)) {
      if (!card.mesh.visible || card.mesh.parent !== pl.scene || !card.mesh.material.map) continue; (posAt[who] ||= {})[f] = card.mesh.position.toArray(); tq = performance.now(); const A = art(card, card.mesh.material.map); if (!A.ok) continue; const mesh = card.mesh;
      // silhouette on screen
      let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9, front = true;
      for (const [y, l, r] of A.rows) for (const x of [l, r + 1]) { const s = toScreen(toWorld(mesh, x * CS, (y + .5) * CS, w0)); if (s[2] <= .05) { front = false; continue; } bx0 = Math.min(bx0, s[0]); bx1 = Math.max(bx1, s[0]); by0 = Math.min(by0, s[1]); by1 = Math.max(by1, s[1]); }
      if (bx1 < bx0 || bx1 <= 0 || bx0 >= W || by1 <= 0 || by0 >= H) continue;   // not in shot
      const bw = bx1 - bx0, visW = (Math.min(bx1, W) - Math.max(bx0, 0)) / bw, sideCut = (bx0 < -1 || bx1 > W + 1);
      const lying = Math.abs(mesh.rotation.z) > .01 || Math.abs(mesh.rotation.x) > 1.2;
      // 5. body inside furniture (every tested frame, rests and moves; a walk through a counter is a fault too)
      if (C.body && A.body && A.body.length) { const tb = performance.now(), b = bodyCheck(S, mesh, A); TM.body += performance.now() - tb;
        if (b) { const share = b.inside / b.n, up = b.upN ? b.up / b.upN : 0, legs = b.legsN ? b.legs / b.legsN : 0, band = b.band;
          const main = [...b.by.entries()].sort((x, y) => y[1].n - x[1].n)[0], dF = main ? med(main[1].df) : 0, dB = main ? med(main[1].db) : 0, cm = v => (v * 100).toFixed(0);
          // FAIL: a solid part fills a large share of the torso-hips-thighs, or goes right through the card across a large share of the body width there
          const thru = band >= C.bodyBand && b.bandDb >= C.bodyBehind, bad = (up >= C.bodyFail || thru) ? 2 : (b.inside && (share >= C.bodyWarn || band >= C.bodyBandWarn)) ? 1 : 0;
          const mk = b.inside ? [Math.min(bx0, b.sx0), by0, Math.max(bx1, b.sx1), by1] : [bx0, by0, bx1, by1];   // the whole figure, so the crop shows him and the part
          put(who, rest, 'body_in_mesh', f, bad, { score: share + band, n: +(share * 100).toFixed(0), unit: '% of the body inside set geometry' },
            main ? `inside ${main[0]}: torso-hips-thighs ${cm(up)} %, legs ${cm(legs)} %, ${cm(dF)} cm of it in front of the card, ${cm(dB)} cm behind; cuts ${cm(band)} % of the body width` + (band ? ` with ${cm(b.bandDb)} cm of ${b.bandPart.split('/').pop()} running on behind the body` : '') + (b.by.size > 1 ? ` (+${b.by.size - 1} more parts)` : '') + (b.seats.length ? '; sits on ' + b.seats[0] : '')
              + (C.debug ? ' | ' + [...b.by.entries()].map(([k, e]) => `${k} n${e.n} up${e.up} f${cm(med(e.df))} b${cm(med(e.db))}`).join('; ') + ` | n${b.n} up${b.upN} graze${b.graze} band@${b.bandY} ${b.bandPart || ''}` : '')
              : (b.seats.length ? 'sits on ' + b.seats[0] : '') + (C.debug ? ` | graze${b.graze || 0}` : ''), mk); } }
      if (bodyOnly) continue;
      // 2. body cut by a side edge
      { const bad = sideCut && visW >= C.bodyLo && visW <= C.bodyHi ? 2 : 0; put(who, rest, 'body_side', f, bad, { score: sideCut ? 1 - Math.abs(visW - .5) : 0, n: +(visW * 100).toFixed(0), unit: '% of width in frame' }, sideCut ? 'cut by the ' + (bx0 < 0 ? 'left' : 'right') + ' edge' : '', [bx0, by0, bx1, by1]); }
      if (!A.head) { log.notes.push(`f${f} ${who}: head not found in the drawing (lying or a special pose), head checks skipped`); continue; }
      // 1. head (with hat) cut by the frame
      let inN = 0, hx0 = 1e9, hx1 = -1e9, hy0 = 1e9, hy1 = -1e9; for (const q of A.headPts) { const s = toScreen(toWorld(mesh, q[0], q[1], w0)); hx0 = Math.min(hx0, s[0]); hx1 = Math.max(hx1, s[0]); hy0 = Math.min(hy0, s[1]); hy1 = Math.max(hy1, s[1]); if (s[2] > .05 && s[0] >= 0 && s[0] <= W && s[1] >= 0 && s[1] <= H) inN++; }
      const share = inN / A.headPts.length, headIn = share > C.headOut;
      if (headIn) put(who, rest, 'head_cut', f, share < C.headFull ? 2 : 0, { score: 1 - share, n: +(share * 100).toFixed(0), unit: '% of head+hat in frame' }, share < C.headFull ? 'cut by the ' + edgeOf(hx0, hy0, hx1, hy1) + ' edge' : '', [hx0, hy0, hx1, hy1]);
      tk('art');
      // 3. face covered by set geometry, or the head inside a closed mesh
      if (headIn) { const h = A.head, pts = [[h.x, h.y], [h.x - .36 * h.r, h.y - .04 * h.r], [h.x + .36 * h.r, h.y - .04 * h.r]]; let blocked = 0, tested = 0, centre = false, name = '', depth = 0;
        pts.forEach((q, i) => { const w = toWorld(mesh, q[0], q[1], new THREE.Vector3()), s = toScreen(w); if (s[2] <= .05 || s[0] < 0 || s[0] > W || s[1] < 0 || s[1] > H) return; tested++;
          dir.copy(w).sub(cp); const dist = dir.length(); dir.normalize(); const hs = cast(S, cp, dir, dist - C.faceEps); if (hs.length) { blocked++; if (i === 0) centre = true; if (!name || i === 0) { name = nameOf(hs[0].object); depth = dist - hs[0].distance; } } });
        tk('face'); const hc = toWorld(mesh, h.x, h.y, new THREE.Vector3()), ins = insideOf(S, hc); tk('inside');
        const bad = ins || centre || blocked >= 2 ? 2 : blocked ? 1 : 0;
        if (tested || ins) put(who, rest, 'face_covered', f, bad, { score: (ins ? 10 : 0) + blocked, n: blocked, unit: `of ${tested} face rays blocked` }, ins ? 'head centre INSIDE ' + nameOf(ins) + (name ? '; in front: ' + name : '') : name ? `behind ${name} (${(depth * 100).toFixed(0)} cm in front of the face)` : '', [hx0, hy0, hx1, hy1]); }
      tq = performance.now();
      // 4. feet on a surface
      if (!lying) { const res = []; for (const fx of A.feet) { const w = toWorld(mesh, fx, CARD.GY, new THREE.Vector3()), s = toScreen(w); if (s[2] <= .05 || s[0] < 0 || s[0] > W || s[1] < 0 || s[1] > H) continue;
          const fk = pl.scene.uuid + [w.x, w.y, w.z].map(v => Math.round(v * 100)).join(','), hit = footCache.get(fk); if (hit) { res.push({ ...hit, s }); continue; }
          let best = null, nm = '', off = 0;   // straight below first; a flat card often stands a hand in FRONT of the step or box it is on, so a surface at foot height within footReach sideways also counts
          for (const [ox, oz, rr] of RING) { if (best !== null && Math.abs(best) <= C.footTol) break; w0.copy(w); w0.x += ox; w0.z += oz; w0.y += C.footUp; for (const hh of cast(S, w0, down, C.footUp + C.footDown)) { const gap = w.y - hh.point.y; if (best === null || Math.abs(gap) < Math.abs(best) - 1e-6) { best = gap; nm = nameOf(hh.object); off = rr; } } }
          footCache.set(fk, { gap: best, nm, off }); res.push({ gap: best, nm, s, off }); }
        if (res.length) { const st = r => r.gap === null ? 'none' : r.gap > C.footTol ? 'float' : r.gap < -C.footTol ? 'sunk' : 'ok', bads = res.filter(r => st(r) !== 'ok'), wr = res.reduce((p, q) => (Math.abs(q.gap ?? 9) > Math.abs(p.gap ?? 9) ? q : p));
          const bad = bads.length === 0 ? 0 : (bads.length === res.length && res.length === 2) ? 2 : 1;
          put(who, rest, 'feet', f, bad, { score: Math.abs(wr.gap ?? 9), n: wr.gap === null ? null : +(wr.gap * 100).toFixed(1), unit: 'cm foot above (+) or inside (-) the surface' }, bads.length ? `${bads.length} of ${res.length} feet ${st(wr) === 'none' ? 'with no surface below' : st(wr)}` + (wr.nm ? ', nearest ' + wr.nm : '') : 'on ' + wr.nm + (wr.off ? ' (' + (wr.off * 100).toFixed(0) + ' cm to the side)' : ''), [wr.s[0] - 30 * W / 1080, wr.s[1] - 40 * W / 1080, wr.s[0] + 30 * W / 1080, wr.s[1] + 12 * W / 1080]); } }
      tk('feet');
    }
  }
  const scanMs = performance.now() - t0;
  // a character whose place changes on this frame (walk, hop, carried) is in a move: an edge it crosses or a foot in the air is not a fault. Counted as 'moving', not as bad.
  const moving = (who, f) => { const p = posAt[who], a = p[f]; for (const q of [p[f - 1], p[f + 1]]) if (q && Math.hypot(a[0] - q[0], a[1] - q[1], a[2] - q[2]) > C.moveEps) return true; return false; };
  let nMoving = 0; for (const r of recs) { if (r[4] && r[2] !== 'body_in_mesh' && moving(r[0], r[3])) { nMoving++; r[4] = 0; r[5] = { ...r[5], score: -1 }; r[6] = 'moving: ' + r[6]; } put2(...r); }
  for (const a of agg.values()) rows.push({ who: a.who, rest: a.rest, check: a.check, status: a.sev === 2 ? (a.bad < C.minBad && a.frames >= C.minBad ? 'WARN' : 'FAIL') : a.sev === 1 ? 'WARN' : 'PASS', value: a.worst.n, unit: a.worst.unit, frame: a.f, bad_frames: a.bad, frames: a.frames, detail: a.detail + (a.sev === 2 && a.bad < C.minBad && a.frames >= C.minBad ? ' (only ' + a.bad + ' frames: WARN)' : ''), mark: a.mark.map(v => Math.round(v)) });
  // ---------- one small crop per FAIL (the only drawing this script does) ----------
  rd.render = realRender; const crops = [];
  if (C.crops > 0) { const fails = rows.filter(r => r.status === 'FAIL').slice(0, C.crops), st = document.getElementById('stage'), o = document.createElement('canvas'), g = o.getContext('2d');
    for (const r of fails) { await window.renderFrame(r.frame, { captions: false }); const cs = [...st.querySelectorAll('canvas')].filter(c => getComputedStyle(c).visibility !== 'hidden' && getComputedStyle(c).display !== 'none');
      const [mx0, my0, mx1, my1] = r.mark, cx = Math.max(0, Math.min(W, (mx0 + mx1) / 2)), cy = Math.max(0, Math.min(H, (my0 + my1) / 2)), half = Math.min(Math.max(W, H) / 2, Math.max(.3 * W, (mx1 - mx0) * .7, (my1 - my0) * .7));
      const cl = (v, L) => 2 * half >= L ? (L - 2 * half) / 2 : Math.max(0, Math.min(L - 2 * half, v)), sx = cl(cx - half, W), sy = cl(cy - half, H), z = Math.min(4, 400 / (2 * half)), out = Math.round(2 * half * z);
      o.width = out; o.height = out; g.fillStyle = '#ff00ff'; g.fillRect(0, 0, out, out); g.fillStyle = '#202020'; g.fillRect(-sx * z, -sy * z, W * z, H * z);
      for (const c of cs) g.drawImage(c, 0, 0, c.width, c.height, -sx * z, -sy * z, W * z, H * z);
      g.strokeStyle = '#ff2020'; g.lineWidth = 2; g.strokeRect((mx0 - sx) * z, (my0 - sy) * z, (mx1 - mx0) * z, (my1 - my0) * z); g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.strokeRect(-sx * z + .5, -sy * z + .5, W * z - 1, H * z - 1);
      crops.push({ who: r.who, rest: r.rest, check: r.check, frame: r.frame, jpg: o.toDataURL('image/jpeg', .85).split(',')[1] }); } }
  return { W, H, frames: nFrames, scan_ms: Math.round(scanMs), pose_ms: Math.round(TM.render), tm: TM, moving_exempt: nMoving, rows, crops, skipped: log.skipped, notes: [...new Set(log.notes)].slice(0, 40), cast: Object.keys(R.cards) };
})()
