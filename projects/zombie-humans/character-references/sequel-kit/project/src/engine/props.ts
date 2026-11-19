// Reusable story props in metres, with the origin at the base centre.
// Selection and placement come from the scene plan, rather than random decoration.
import * as THREE from 'three';
import { beamHD, planksHD } from './paint';
import { twoTone } from './shade';

export type PropKind = 'crate' | 'barrel' | 'bench' | 'table' | 'desk' | 'shelf' | 'cabinet';
export type PropOptions = { position?: [number, number, number]; yaw?: number; scale?: number; wood?: string };

export function createProp(kind: PropKind, options: PropOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = `prop:${kind}`;
  const wood = twoTone(new THREE.MeshLambertMaterial({ map: beamHD(), color: options.wood ?? '#e4c5a2' }));
  const top = twoTone(new THREE.MeshLambertMaterial({ map: planksHD(), color: options.wood ?? '#e4c5a2' }));
  const iron = twoTone(new THREE.MeshLambertMaterial({ color: '#625d61' }));
  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) {
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z); part.castShadow = true; part.receiveShadow = true;
    group.add(part); return part;
  }
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, material = wood) =>
    mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z);

  switch (kind) {
    case 'crate':
      box(.76, .76, .76, 0, .38, 0, top);
      for (const s of [-1, 1]) {
        for (const y of [.08, .68]) box(.84, .12, .09, 0, y, s * .4);
        for (const x of [-.34, .34]) box(.12, .78, .09, x, .39, s * .4);
        const brace = box(.08, .88, .07, 0, .38, s * .455);
        brace.rotation.z = -.65;
      }
      break;
    case 'barrel': {
      const profile = [[.29, 0], [.34, .08], [.4, .42], [.37, .76], [.31, .88]].map(([r, y]) => new THREE.Vector2(r, y));
      mesh(new THREE.LatheGeometry(profile, 32), wood, 0, 0, 0);
      mesh(new THREE.CylinderGeometry(.31, .31, .035, 32), top, 0, .875, 0);
      for (const [y, r] of [[.12, .35], [.7, .383]]) {
        const ring = mesh(new THREE.TorusGeometry(r, .025, 8, 32), iron, 0, y, 0);
        ring.rotation.x = Math.PI / 2;
      }
      break;
    }
    case 'bench':
      for (const z of [-.17, 0, .17]) box(1.8, .075, .15, 0, .53, z, top);
      for (const x of [-.67, .67]) {
        for (const z of [-.18, .18]) box(.095, .5, .095, x, .25, z);
        box(.095, .85, .095, x, .69, .25);
      }
      for (const y of [.82, 1.02]) box(1.8, .15, .08, 0, y, .25);
      break;
    case 'desk':
    case 'table':
      box(1.6, .1, .9, 0, .85, 0, top);
      for (const x of [-.64, .64]) for (const z of [-.31, .31]) box(.11, .8, .11, x, .4, z);
      for (const z of [-.31, .31]) box(1.35, .15, .06, 0, .71, z);
      box(1.35,.065,.68,0,.22,0,top);
      if(kind==='desk')for(const x of [-.38,.38]){
        box(.68,.18,.035,x,.7,.46,top);
        box(.17,.025,.035,x,.7,.49,iron);
      }
      break;
    case 'shelf':
      for(const x of [-.85,.85])box(.08,2.4,.5,x,1.2,0);
      for(const y of [.12,.82,1.52,2.22])box(1.8,.07,.55,0,y,0,top);
      box(1.8,2.4,.04,0,1.2,-.26,top);
      break;
    case 'cabinet':
      box(1.2,1.7,.65,0,.85,0,iron);
      for(let i=0;i<4;i++){
        box(1.08,.36,.045,0,.24+i*.4,.35,wood);
        box(.26,.035,.05,0,.24+i*.4,.39,iron);
      }
      break;
    default:
      throw new Error(`Unknown prop: ${kind}`);
  }
  group.position.set(...(options.position ?? [0, 0, 0]));
  group.rotation.y = options.yaw ?? 0;
  group.scale.setScalar(options.scale ?? 1);
  return group;
}
