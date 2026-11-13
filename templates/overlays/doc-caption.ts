// Documentary place/date caption ("HIROSHIMA" with "AUGUST 6, 1945 · 8:14 AM" above it).
// User-approved on "The Man Who Survived Two Atomic Bombs" (2026-11-13): reuse it for every place / date / year / name card.
// See references/caption-guide.md for when and how to use it.
//
// Look: big white Arial Black title, small letter-spaced caps line above, soft dark drop shadow, a thin rule under the title
// that draws out left→right. Motion: title types on letter by letter (typewriter), fades in over 12 frames, fades out over
// the last 8, and can optionally push in slowly (zoom).
//
// Drop-in: call drawDocCaption() on your 1080×1920 HUD canvas each frame with the state from docCaption().

export type DocCaptionState = {
  text: string;        // the title, e.g. 'HIROSHIMA'
  sub?: string;        // small line above, e.g. 'AUGUST 6, 1945 · 8:14 AM'
  k: number;           // 0..1 fade-in progress (also draws the rule)
  alpha?: number;      // 0..1 fade-out
  reveal?: number;     // 0..1 typewriter progress (fraction of letters shown)
  zoom?: number;       // scale (1 = none); animate 1 → 1.3 for a slow push-in
  y?: number;          // baseline centre in canvas px (default 1500 = lower third)
  size?: number;       // title px (default 86; 110–130 for a hero place name)
  color?: string;      // title colour (default white)
};

const clamp = (x: number) => Math.max(0, Math.min(1, x));

/** Timing helper: visible from frame a to b. `type` = frames for the full typewriter reveal (1 = instant). */
export function docCaption(f: number, a: number, b: number, text: string,
  o: { sub?: string; y?: number; size?: number; type?: number; zoom?: [number, number]; color?: string; fadeIn?: number } = {}): DocCaptionState | undefined {
  if (f < a || f >= b) return undefined;
  return {
    text, sub: o.sub, y: o.y, size: o.size, color: o.color,
    k: clamp((f - a) / (o.fadeIn ?? 12)),
    alpha: clamp((b - f) / 8),
    reveal: clamp((f - a) / (o.type ?? 18)),
    zoom: o.zoom ? o.zoom[0] + (o.zoom[1] - o.zoom[0]) * clamp((f - a) / Math.max(1, b - a)) : undefined,
  };
}

/** Draw onto a 1080-wide HUD canvas context. Saves/restores its own state. */
export function drawDocCaption(g: CanvasRenderingContext2D, o: DocCaptionState, W = 1080) {
  const k = Math.min(1, o.k), a = Math.min(1, k * 3) * (o.alpha ?? 1);
  if (a <= 0.001) return;
  const size = o.size ?? 86, z = o.zoom ?? 1;
  const n = Math.ceil(o.text.length * Math.min(1, o.reveal ?? 1)), txt = o.text.slice(0, n);
  g.save(); g.globalAlpha = a;
  g.translate(W / 2, o.y ?? 1500); g.scale(z, z);
  g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 26;
  if (o.sub) {
    g.font = '700 40px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,.85)';
    g.fillText(o.sub.split('').join(String.fromCharCode(8202)), 0, -size * .95);   // hair-space letter spacing
  }
  g.font = `900 ${size}px Arial Black, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = o.color ?? '#ffffff'; g.fillText(txt, 0, 0, 980);
  const full = Math.min(g.measureText(o.text).width, 980);
  g.shadowBlur = 0; g.globalAlpha *= .8; g.fillRect(-full / 2 * k, size * .62, full * k, 5);   // rule draws out from the centre
  g.restore();
}
