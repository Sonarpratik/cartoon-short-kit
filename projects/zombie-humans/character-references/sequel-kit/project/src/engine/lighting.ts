import * as THREE from 'three';

// World-space window projector. Configure once per scene, never in screen coordinates.
export const WINDOW_LIGHT = {
  uWindowOrigin: {value: new THREE.Vector3(-5.46, 2.7, .8)},
  uWindowDir: {value: new THREE.Vector3(1, -.2, -.6).normalize()},
  uWindowSize: {value: new THREE.Vector2(6, 3)},
  uWindowColor: {value: new THREE.Color('#ffe6ad')},
  uWindowStrength: {value: 0},
};
export const FACE_LIGHT = {
  uFaceRimColor: {value: new THREE.Color('#ffdf9c')},
  uFaceRimStrength: {value: .22},
};
export function setInteriorLight(night = false, strength = .7) {
  WINDOW_LIGHT.uWindowStrength.value = night ? .26 : strength;
  WINDOW_LIGHT.uWindowColor.value.set(night ? '#b4d5ff' : '#ffe6ad');
  FACE_LIGHT.uFaceRimColor.value.set(night ? '#bddaff' : '#ffdf9c');
  FACE_LIGHT.uFaceRimStrength.value = night ? .28 : .24;
}

export const WINDOW_DECL = /* glsl */ `
varying vec3 vWindowWorld;
uniform vec3 uWindowOrigin, uWindowDir, uWindowColor;
uniform vec2 uWindowSize;
uniform float uWindowStrength;
float windowPattern() {
  float distanceFromWindow = (vWindowWorld.x-uWindowOrigin.x)/uWindowDir.x;
  vec3 hit = vWindowWorld-uWindowDir*distanceFromWindow-uWindowOrigin;
  vec2 uv = vec2(hit.z,hit.y)/uWindowSize+.5;
  vec2 boundary = smoothstep(vec2(0.),vec2(.025),uv)*smoothstep(vec2(0.),vec2(.025),1.-uv);
  vec2 cell = abs(fract(uv*vec2(3.,4.))-.5);
  vec2 pane = 1.-smoothstep(vec2(.43),vec2(.49),cell);
  return boundary.x*boundary.y*pane.x*pane.y*step(0.,distanceFromWindow);
}
`;
