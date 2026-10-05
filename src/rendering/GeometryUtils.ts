import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Bakes a flat colour into a geometry's vertices and normalises its attributes so it
 * can be merged with others. Lets a whole machine share one material and one draw call.
 */
export function paint(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation): THREE.BufferGeometry {
  const g = geometry.index ? geometry.toNonIndexed() : geometry;
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const count = g.getAttribute('position').count;
  if (!g.getAttribute('uv')) {
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2));
  }
  const c = new THREE.Color(color);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return g;
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  if (!merged) throw new Error('Failed to merge geometries');
  return merged;
}

/** A painted box centred at (x, y, z). */
export function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: THREE.ColorRepresentation,
): THREE.BufferGeometry {
  return paint(new THREE.BoxGeometry(w, h, d).translate(x, y, z), color);
}

/** A painted upright cylinder centred at (x, y, z). */
export function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number,
  x: number,
  y: number,
  z: number,
  color: THREE.ColorRepresentation,
): THREE.BufferGeometry {
  return paint(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments).translate(x, y, z), color);
}

/**
 * A gear lying in the XY plane, extruded along Z and centred on the origin.
 */
export function gearGeometry(outerRadius: number, teeth: number, thickness: number): THREE.BufferGeometry {
  const rootRadius = outerRadius * 0.76;
  const shape = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    // Each tooth is four points: two on the root circle, two on the tip circle.
    const phase = i % 4;
    const radius = phase === 1 || phase === 2 ? outerRadius : rootRadius;
    const angle = (i / steps) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, outerRadius * 0.28, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 8 });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

/**
 * A curved slab: the region between two radii and two angles around (cx, cz), from y0 to y1.
 * Angles are measured in the XZ plane (x = cos, z = sin). Used for conveyor corners.
 * Emits the top and both curved walls; the flat ends butt against neighbouring belts.
 * UVs run 0→1 along the arc (u) and 0→1 from inner to outer radius (v).
 */
export function sectorSlab(
  cx: number,
  cz: number,
  rInner: number,
  rOuter: number,
  angleStart: number,
  angleEnd: number,
  y0: number,
  y1: number,
  segments: number,
  topOnly = false,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[], uv: number[][]) => {
    positions.push(...a, ...b, ...c, ...a, ...c, ...d);
    uvs.push(...uv[0], ...uv[1], ...uv[2], ...uv[0], ...uv[2], ...uv[3]);
  };
  const point = (r: number, angle: number, y: number) => [cx + Math.cos(angle) * r, y, cz + Math.sin(angle) * r];

  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const a0 = angleStart + (angleEnd - angleStart) * t0;
    const a1 = angleStart + (angleEnd - angleStart) * t1;
    quad(point(rInner, a0, y1), point(rOuter, a0, y1), point(rOuter, a1, y1), point(rInner, a1, y1), [
      [t0, 0],
      [t0, 1],
      [t1, 1],
      [t1, 0],
    ]);
    if (topOnly) continue;
    const flat = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    quad(point(rOuter, a0, y0), point(rOuter, a1, y0), point(rOuter, a1, y1), point(rOuter, a0, y1), flat);
    quad(point(rInner, a0, y0), point(rInner, a1, y0), point(rInner, a1, y1), point(rInner, a0, y1), flat);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

// Scenery uses the same deterministic PRNG as the simulation, so it is identical on every load.
export { seededRandom } from '../core/game/Random';
