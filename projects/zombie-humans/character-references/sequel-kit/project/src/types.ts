import type * as THREE from 'three';

export type V3 = [number, number, number];
export type Palette = 'siren' | 'lamp' | 'overcast' | 'rain' | 'sun' | 'moon' | 'storm' | 'flood' | 'dark' | 'lampnight' | 'day' | 'golden' | 'dusk' | 'dawn';
export type SceneInstance = {
  root: THREE.Group;
  palette: Palette;
  pose: (frame: number, local: number, seconds: number) => void;
  camera: (local: number) => { position: V3; target: V3; fov?: number; focus?: V3; blur?: number };
  /** 0..1 white overlay strength in front of the lens */
  flash?: (frame: number) => number;
  /** Portrait mode: k 0..1 eases in shallow depth of field locked on `focus`; `strength` = background blur (px at 1080p). */
  portrait?: (frame: number) => { k: number; focus: V3; strength?: number } | undefined;
  /** Rank card overlay (title card that slams in on "Number N"). */
  card?: (frame: number) => CardState | undefined;
  /** Extra lens overlays: name labels, day counters, the freeze question, rule cards. */
  overlays?: (frame: number) => Overlay[];
  /** Full-screen colour wash in front of the lens [r,g,b,alpha] (black-outs, freeze tint). Overrides flash colour. */
  tint?: (frame: number) => [number, number, number, number] | undefined;
};
export type Overlay =
  | { kind: 'name'; name: string; role: string; color: string; k: number; alpha?: number; x?: number; y?: number; side?: 'left' | 'right' }
  | { kind: 'day'; text: string; k: number; alpha?: number }
  | { kind: 'question'; text: string; sub?: string; k: number; alpha?: number }
  | { kind: 'rule'; n: number; text: string; k: number; alpha?: number }
  | { kind: 'title'; text: string; color: string; k: number; alpha?: number; y?: number }
  | { kind: 'tally'; n: number; x: number; y: number; k: number; alpha?: number };
export type RankIcon = 'cross' | 'warn' | 'dot' | 'anchor' | 'trophy' | 'question';
export type CardState = { rank: string; title: string; icon: RankIcon; color: string; k: number; alpha?: number; stamp?: number; y?: number };
export type SceneDefinition = {
  id: string; f0: number; f1: number; title: string; words: string;
  build: () => SceneInstance;
  review: number[];
};
export const FPS = 30;
export const TOTAL = 2711;
export const duration = 90.358;
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 over global frames a..b (eased) */
export const span = (f: number, a: number, b: number) => ease((f - a) / Math.max(1, b - a));
/** springy pop-in 0→1 with a small overshoot, starting at frame a */
export const pop = (f: number, a: number, len = 12) => {
  const t = clamp((f - a) / len);
  if (t <= 0) return 0;
  return 1 + Math.sin(t * Math.PI * 1.5) * (1 - t) * .35 - (1 - t) * (1 - t) * (1 - t);
};
