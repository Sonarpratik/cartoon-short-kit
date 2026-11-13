// Character card shading (lighting.md 9.2 / 9.5). Replaces the flat emissive "pasted-on" look: the card takes the
// scene light colour as a tint, keeps a bright floor where a cast shadow falls on it (charShade ~.86), and gets a soft
// side gradient toward the real sun (head ~charGrad, torso ~bodyGrad) with a lavender far side.
// Contract with WORLD: LFB (sun shadow visibility inside three's light loop) and CHAR (uniforms world.ts updates from
// LIGHTS every frame) come from shade.ts; the sun direction is three's own directional light 0.
// The drawing already carries a painted crescent (toon.ts shadedFill / gradFill), so the shader adds GRAD_K of the
// preset gradient, and the preset tint (measured on WHITE heads) is applied at TINT_K so peach skin stays clean
// (lighting.md 9.1 note: golden ~[1, .88, .76], day ~[1, .97, .96] for peach skin).
import * as THREE from "three";
import {DIRECTOR} from "./director";
import { LFB, CHAR } from "./shade";
import { FACE_LIGHT } from "./lighting";

export const GRAD_K = 5.5;   // head: preset charGrad x5.5, capped at .4 linear: ~14 % on screen after the grade /
                             // tone-map highlight roll-off (faces sit at ~.96 there; review round 2)
export const GRAD_KB = 2.1;  // stronger coat modelling while retaining the face's bright floor
export const TINT_K = 0.55;

// Card zones in UV (v = 1 at the top of the 600 x 1000 design card): adult chin at y ~420 -> v .58, head centre
// y ~309 -> v .69, head half height ~111 -> .11. Head half width ~118 units -> .2 of the card, torso ~89 -> .15.
const CARD = /* glsl */ `
// Identify the off-white face pixels without brightening hair, ink or clothing.
vec2 fXY0 = (vMapUv-uFaceFrame.xy)/uFaceFrame.zw;                                          // rig head frame (per pose)
float faceZone = smoothstep( -1.12, -0.98, fXY0.y );
float vChin = uFaceFrame.y - uFaceFrame.w, torsoH = uFaceFrame.w * 2.2;
float faceMask = faceZone * smoothstep( 0.65, 0.82, min( diffuseColor.r, min( diffuseColor.g, diffuseColor.b * 1.45 ) ) );
vec3 tintK = mix( vec3( 1.0 ), uCharTint, uTintK * mix( 1.0, 0.24, faceMask ) );
tintK /= pow( max( dot( tintK, vec3( 0.2126, 0.7152, 0.0722 ) ), 0.2 ), uNorm );             // same face value day and golden
vec3 outgoingLight = diffuseColor.rgb * tintK;
#if NUM_DIR_LIGHTS > 0
{
  vec3 sunV = directionalLights[ 0 ].direction;                                          // view space, towards the sun
  vec3 upV = normalize( ( viewMatrix * vec4( 0.0, 1.0, 0.0, 0.0 ) ).xyz );
  float side = sign( sunV.x ) * smoothstep( 0.0, 0.35, abs( sunV.x ) );                     // saturates: even a near-frontal sun shades one side                                          // + = sun on screen right
  float head = faceZone;                                        // head zone vs body
  float hw = mix( uFaceFrame.z * 0.78, uFaceFrame.z, head );
  float uu = clamp( ( vMapUv.x - uFaceFrame.x ) / hw, -1.0, 1.0 ) * sign( dFdx( vMapUv.x ) + 1e-7 ); // -1..1 screen left..right
  float t = uu * side;                                                                     // +1 = edge facing the sun
  float g = mix( uBodyGrad * uGradKB, min( uGrad * uGradK, 0.4 ), head );
  g = mix( g, min( g, 0.055 ), faceMask );
  float dark = smoothstep( -0.15, 0.9, -t );                                                 // far side
  vec3 sideK = mix( vec3( 1.0 ), uSideTint, dark * clamp( g / max( min( uGrad * uGradK, 0.4 ), 1e-3 ), 0.0, 1.5 ) * 0.5 );
  float top = 1.0 + 0.05 * clamp( ( vMapUv.y - 0.69 ) / 0.11, -1.0, 1.0 ) * clamp( dot( sunV, upV ) * 2.0, 0.0, 1.0 ) * head;
  float lift = 1.0 + 0.04 * smoothstep( 0.0, 0.9, t );
  sideK = mix( sideK, vec3( 1.0 ), faceMask * 0.8 );
  outgoingLight *= mix( mix( uCharShade, 1.0, sunVis ), 1.0, faceMask ) * ( 1.0 - g * dark ) * sideK * top * lift * uGain;
  // Give the painted head a rounded lighting normal instead of shading it as a flat card.
  vec2 faceXY = (vMapUv-uFaceFrame.xy)/uFaceFrame.zw;
  faceXY.x *= sign(dFdx(vMapUv.x)+1e-7);
  float faceRadius = dot(faceXY,faceXY);
  vec3 faceNormal = normalize(vec3(faceXY, sqrt(max(.035,1.-faceRadius))));
  float faceLight = smoothstep(-.22,.62,dot(faceNormal,sunV));
  vec3 faceShade = vec3(.75,.76,.87);
  outgoingLight *= mix(vec3(1.),mix(faceShade,vec3(${DIRECTOR.character.faceLitGain.toFixed(3)}),faceLight),faceMask);
  // Practical key light (lamp, screen, doorway): sphere-shade the head toward it. Lit side warms to the light's colour,
  // far side falls into a cool blue shade; a light from above lights the brow and leaves the jaw in shade.
  vec3 keyV = normalize(uKey.xyz + vec3(1e-5));
  float keyLit = smoothstep(-.02,.26,dot(faceNormal,keyV));
  vec3 keyTone = mix(vec3(.56,.63,.88), mix(vec3(1.06),uKeyCol*1.12,.45), keyLit);
  outgoingLight *= mix(vec3(1.), keyTone, faceMask*uKey.w);
  float keyBody = (1.-head)*smoothstep(.04,.1,dot(diffuseColor.rgb,vec3(.2126,.7152,.0722)));
  float keyT = clamp(dot(vec3(uu*.9, (vMapUv.y-.45)*2.2, .45), keyV), -1., 1.);
  outgoingLight *= mix(vec3(1.), mix(vec3(.72,.76,.95), vec3(1.04), smoothstep(-.3,.5,keyT)), keyBody*uKey.w*.7);
  float pearlBand = faceMask*smoothstep(.69,.98,sqrt(faceRadius));
  outgoingLight = mix(outgoingLight,vec3(1.22,1.13,1.28),pearlBand*.38);
  // Face pixels keep a bright floor in cast shadow; the coat receives the full soft shadow map.
  outgoingLight *= mix(1.,mix(.94,1.,sunVis),faceMask);
  // Broad cloth light only; CharacterPen draws the pointed rim along the real silhouette.
  float clothLuma = dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
  float clothMask = (1.-head)*smoothstep(.025,.075,clothLuma)
    * smoothstep(vChin-torsoH,vChin-torsoH+.05,vMapUv.y)*(1.-smoothstep(vChin-.05,vChin,vMapUv.y));
  float clothWrap = exp(-pow((t-.55)/.38,2.));
  outgoingLight += mix(vec3(.85,.91,1.),uFaceRimColor,.2)*clothMask
    * ${DIRECTOR.character.clothWrap.toFixed(3)}*clothWrap*mix(.7,1.,sunVis);
  #ifdef USE_MAP
  {
    // INNER warm rim, golden only: the outermost ~2 px (at 1080 wide) of the HEAD skin / TORSO silhouette on the
    // sun-facing edge. No offset copy: we only test whether the next pixels toward the sun are outside the card.
    // Hats, legs, rifles and other thin parts are skipped (inner sample must be skin, or torso at least ~40 units thick).
    float warm = smoothstep( 0.2, 0.4, 1.0 - uCharTint.b );
    float sl = length( sunV.xy );
    vec2 d2 = sunV.xy / max( sl, 1e-4 );
    vec2 duv = 2.0 * uPx * ( d2.x * dFdx( vMapUv ) + d2.y * dFdy( vMapUv ) );
    // A broad inner highlight follows the alpha silhouette; the dark outline stays intact.
    vec2 rimStep = normalize(duv + vec2(1e-9)) * vec2(.083,.05);
    float innerEdge = 1.0-texture2D(map,vMapUv+rimStep).a;
    float softEdge = 1.0-texture2D(map,vMapUv+rimStep*.65).a;
    float roundedRim = smoothstep(.52,.96,sqrt(faceRadius))*smoothstep(.18,.78,dot(normalize(vec3(faceXY,.08)),sunV));
    float faceRim = faceMask * max((.65*innerEdge+.35*softEdge)*.15,roundedRim) * smoothstep(-.1,.5,t);
    outgoingLight = mix(outgoingLight, outgoingLight * mix(vec3(1.),uFaceRimColor / max(max(uFaceRimColor.r,uFaceRimColor.g),uFaceRimColor.b),.45), faceRim*.6);
    outgoingLight += uFaceRimColor * uFaceRimStrength * (faceRim*${DIRECTOR.character.faceRimBoost.toFixed(3)} + faceMask*.22*faceLight);
    float hairLuma = dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
    float hairMask = head*(1.-faceMask)*smoothstep(.025,.07,hairLuma)*(1.-smoothstep(.24,.42,hairLuma));
    outgoingLight += uFaceRimColor * hairMask * .11 * roundedRim;
    float edge = step( texture2D( map, vMapUv + duv ).a, 0.5 );
    vec2 dirU = normalize( duv + vec2( 1e-9 ) );
    vec4 c1 = texture2D( map, vMapUv - dirU * vec2( 0.027, 0.016 ) );   // ~16 design units inward (past the ink line)
    vec4 c2 = texture2D( map, vMapUv - dirU * vec2( 0.067, 0.04 ) );    // ~40 units inward: thick parts only
    float skin = step( 0.5, c1.a ) * step( 0.3, c1.r ) * step( c1.b + 0.12, c1.r ) * step( c1.g, c1.r + 0.02 );
    float torso = step( vChin-torsoH, vMapUv.y ) * step( vMapUv.y, vChin ) * step( 0.5, c1.a ) * step( 0.5, c2.a ) * step( 0.04, max( c1.r, max( c1.g, c1.b ) ) );
    float rim = warm * smoothstep( 0.1, 0.4, sl ) * edge * max( skin * head, torso ) * mix( 0.6, 1.0, sunVis );
    outgoingLight += vec3( 0.95, 0.52, 0.16 ) * rim;
  }
  #endif
}
#endif
`;

const DECL = "#include <common>\nuniform vec3 uCharTint; uniform float uCharShade; uniform float uGrad; uniform float uBodyGrad; uniform vec3 uSideTint;"
  + " uniform float uGradK; uniform float uGradKB; uniform float uTintK; uniform float uNorm; uniform float uGain; uniform float uPx; uniform vec3 uFaceRimColor; uniform float uFaceRimStrength; uniform vec4 uFaceFrame; uniform vec4 uKey; uniform vec3 uKeyCol;";
/** card-only constants (not per light): gradient share, tint share, overall gain (calibrated: faces ~.93 V) */
export const CARD_K = { uGradK: { value: GRAD_K }, uGradKB: { value: GRAD_KB }, uTintK: { value: TINT_K }, uNorm: { value: 0.7 }, uGain: { value: 1.03 }, uPx: { value: 0.5 } }; // uPx = render height / 1920 (set per draw in cast.ts)

/** MeshLambertMaterial -> lit card: no emissive, scene tint, bright floor, side gradient toward the sun. */
export function cardShade(m: THREE.MeshLambertMaterial, faceFrame = {value:new THREE.Vector4(.5,.691,.197,.111)}, key = {value:new THREE.Vector4(0,1,0,0)}, keyCol = {value:new THREE.Color(1,1,1)}) {
  m.emissive.set(0x000000); m.emissiveIntensity = 0; m.emissiveMap = null;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, CHAR, CARD_K, FACE_LIGHT);
    sh.uniforms.uFaceFrame = faceFrame; sh.uniforms.uKey = key; sh.uniforms.uKeyCol = keyCol;
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", DECL)
      .replace("#include <lights_fragment_begin>", "float sunVis = 1.0;\n" + LFB)
      .replace("vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;", CARD);
  };
  m.customProgramCacheKey = () => "pointed-cloth-edge-v13-frame";
  return m;
}

/** ground contact blob: multiplies what is already drawn (the ground); drawn after the ground and before the cards */
export const blobMaterial = (map: THREE.Texture) => new THREE.MeshBasicMaterial({
  map, transparent: false, depthWrite: false, fog: false, toneMapped: false,
  blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
});
