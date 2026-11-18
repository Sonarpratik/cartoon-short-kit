// LIVE CLOTH for the motion library (2026-11-12, CB: "we need to work on the character motion again since we add long cloth to it").
// The rig draws its own legs (S.noLegs), so char2d never saw them and a long cloth stayed a stiff tube. This passes the rig's legs to char2d
// (S.legsLive in body coords) with world-down (S.clothG), the floor (S.clothFloor) and a follow-through offset (S.clothLag).
// clothLag is stateless: it looks back 14 frames at the hips' world motion through a damped spring, so the cloth trails a move, overshoots a little,
// settles in about 8-12 frames and is DEAD STILL in a hold (CB_RULES 5: cloth moves only during a move and its settle).
const rotP = (p, deg, c) => { const r = deg * Math.PI / 180, s = Math.sin(r), k = Math.cos(r), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * k - dy * s, c[1] + dx * s + dy * k]; };
export const hipWorld = (P, ch) => { const x = P.x || 0, y = P.y || 0, piv = P.pivot || [x, ch.hipY + y]; return rotP([x, ch.hipY + y], P.rot || 0, piv); };
export function clothLag(poseAt, t, ch, { fps = 30, n = 14, damp = .3, freq = .45, gain = 1, max = 34, dc = .25, gainY = .35 } = {}) {
  const dt = 1 / fps, pos = u => { let P = poseAt(Math.max(0, u)); if (P && P.poses) P = P.poses[0]; return hipWorld(P, ch); };
  // spring kernel, mostly high-pass: a steady walk only trails a little (dc share), starts, stops and bounces swing the cloth
  const K = [...Array(n)].map((_, i) => Math.exp(-damp * i) * Math.cos(freq * i)), mean = K.reduce((a, b) => a + b, 0) / n;
  let prev = pos(t), dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { const q = pos(t - (i + 1) * dt), w = (K[i] - mean * (1 - dc)) * gain; dx -= (prev[0] - q[0]) * w; dy -= (prev[1] - q[1]) * w * gainY; prev = q; }
  const c = v => Math.max(-max, Math.min(max, v));
  return [c(dx), c(dy)];
}
// legsW = [{ H, K, A }] in WORLD; toLocal = world -> body coords; ox = body coords x offset (film card: CARD.CX)
export function applyLive(S, legsW, toLocal, rot, G, lagW = [0, 0], ox = 0) {
  if (!S.skirt && !S.behind) return S;
  const L = p => { const q = toLocal(p); return [q[0] + ox, q[1]]; }, r = (rot || 0) * Math.PI / 180;
  S.legsLive = legsW.map(l => ({ H: L(l.H), K: L(l.K), A: L(l.A) }));
  S.clothG = [Math.sin(r), Math.cos(r)];
  const hx = legsW.length ? legsW.reduce((a, l) => a + l.H[0], 0) / legsW.length : 0; S.clothFloor = L([hx, G]);
  S.clothLag = rotP(lagW, -(rot || 0), [0, 0]); if (S.legLen == null && legsW.legL) S.legLen = legsW.legL;
  return S;
}
