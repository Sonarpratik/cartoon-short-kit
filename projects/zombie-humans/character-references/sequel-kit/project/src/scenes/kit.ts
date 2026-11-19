// Part 3 scene kit: held props, overlay shorthands, the group of four.
import * as THREE from 'three';
import type { Character, CharacterKind } from '../characters';
import { character } from '../characters';
import { box, cylinder, ball } from '../props';
import { show } from '../hud';
import type { Overlay, V3 } from '../types';

export const COLORS = { jack: '#6f7d3c', milo: '#c8423b', tina: '#3d8fc0', brock: '#e8833a', troy: '#5a1f24', unknown: '#4a4458', slade: '#2b2430' } as const;
export const name = (f: number, a: number, b: number, n: string, role: string, color: string, side: 'left' | 'right' = 'left', y = 1380) =>
  show<Extract<Overlay, { kind: 'name' }>>(f, a, b, { kind: 'name', name: n, role, color, side, y });
export const day = (f: number, a: number, b: number, text: string) => show<Extract<Overlay, { kind: 'day' }>>(f, a, b, { kind: 'day', text });
export const rule = (f: number, a: number, b: number, n: number, text: string) => show<Extract<Overlay, { kind: 'rule' }>>(f, a, b, { kind: 'rule', n, text });
export const title = (f: number, a: number, b: number, text: string, color = '#e8b93c', y = 360) => show<Extract<Overlay, { kind: 'title' }>>(f, a, b, { kind: 'title', text, color, y }, 10);
export const tally = (f: number, a: number, b: number, n: number, x: number, y: number) => show<Extract<Overlay, { kind: 'tally' }>>(f, a, b, { kind: 'tally', n, x, y }, 8);
export const list = (...o: (Overlay | undefined)[]) => o.filter((x): x is Overlay => !!x);

/** Keep a prop at the actor's side and aim the card's right hand at it (projected through the current camera). */
export function hold(actor: Character, prop: THREE.Object3D, eye: V3, f: number, offset: V3 = [.42, .95, .12]) {
  const p = actor.root.position;
  prop.position.set(p.x + offset[0], p.y + offset[1], p.z + offset[2]);
  const w = new THREE.Vector3(); prop.getWorldPosition(w);
  return actor.handAt(w, eye, f);
}
// Small hand props.
export function bat() { const r = new THREE.Group(); const m = cylinder(r, .05, .95, 0, .3, 0, '#b5824f', .028, 12); m.castShadow = true; cylinder(r, .032, .2, 0, -.22, 0, '#2e2a30', .032, 10); return r; }
export function wrench() { const r = new THREE.Group(); box(r, .06, .5, .03, 0, .12, 0, '#9aa0a8'); const h = new THREE.Mesh(new THREE.TorusGeometry(.07, .025, 6, 14, Math.PI * 1.4), new THREE.MeshLambertMaterial({ color: '#9aa0a8' })); h.position.y = .4; h.rotation.z = -.6; r.add(h); return r; }
export function bowl() { const r = new THREE.Group(); const b = new THREE.Mesh(new THREE.SphereGeometry(.14, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#e8833a', side: THREE.DoubleSide })); r.add(b); ball(r, .12, 0, -.02, 0, '#f4efe0', 1, .3, 1); return r; }
export function crowbar() { const r = new THREE.Group(); const m = cylinder(r, .025, .9, 0, .45, 0, '#c8423b', .025, 8); m.castShadow = true; const h = new THREE.Mesh(new THREE.TorusGeometry(.07, .025, 6, 14, Math.PI), new THREE.MeshLambertMaterial({ color: '#c8423b' })); h.position.y = .9; h.rotation.z = Math.PI / 2; r.add(h); return r; }
export function bandage() { const r = new THREE.Group(); cylinder(r, .07, .1, 0, 0, 0, '#f4efe0', .07, 14).rotation.z = Math.PI / 2; return r; }

export type Group4 = { jack: Character; milo: Character; tina: Character; brock: Character };
export function four(root: THREE.Object3D, at: Record<'jack' | 'milo' | 'tina' | 'brock', V3>): Group4 {
  const make = (k: CharacterKind, p: V3) => character(root, k, p[0], p[1], p[2]);
  return { jack: make('jack', at.jack), milo: make('milo', at.milo), tina: make('tina', at.tina), brock: make('brock', at.brock) };
}
