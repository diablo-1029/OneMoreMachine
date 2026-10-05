import * as THREE from 'three';

/** Shared palette. Restrained and warm: slate metals, a few saturated accents. */
export const PALETTE = {
  slate: 0x3b4252,
  slateDark: 0x2e3440,
  slateLight: 0x566074,
  steel: 0x9aa3b2,
  steelLight: 0xcdd3dc,
  yellow: 0xf2b632,
  yellowDark: 0xd99a22,
  brick: 0xb9583c,
  brickDark: 0x8f4530,
  teal: 0x3d8f9c,
  tealDark: 0x2c6a75,
  cream: 0xefe2c4,
  red: 0xd9534f,
  redDark: 0xc04540,
  brass: 0xe0a83c,
  gold: 0xffcf40,
  wood: 0x7a5236,
  glass: 0x7ec8e3,
  inputGreen: 0x59c36a,
  outputOrange: 0xff9d3c,
  ore: 0x6f6a72,
  dirt: 0x6b5340,
} as const;

/**
 * One material for everything that carries baked vertex colours:
 * machines, conveyor bodies, items and scenery all batch under it.
 */
export const VERTEX_MATERIAL = new THREE.MeshLambertMaterial({ vertexColors: true });

/** Same, for curved hand-built geometry whose winding is not guaranteed. */
export const VERTEX_MATERIAL_DOUBLE = new THREE.MeshLambertMaterial({
  vertexColors: true,
  side: THREE.DoubleSide,
});

/** Unlit lamp colour for small indicator lights. */
export const LAMP_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xffa23a });
