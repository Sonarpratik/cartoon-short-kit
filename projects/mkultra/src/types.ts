import type * as THREE from 'three';

export type V3 = [number, number, number];
export type Palette = 'warm' | 'lab' | 'night' | 'archive';
export type SceneInstance = {
  root: THREE.Group;
  palette: Palette;
  pose: (frame: number, local: number, seconds: number) => void;
  camera: (local: number) => { position: V3; target: V3; fov?: number; focus?: V3; blur?: number };
};
export type SceneDefinition = {
  id: string; f0: number; f1: number; title: string; words: string;
  build: () => SceneInstance;
  review: number[];
};
export const FPS = 30;
export const TOTAL = 1034;
export const duration = 34.4555;
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
