import * as THREE from 'three';
import { cellCenterX, cellCenterZ } from './WorldMapping';

const TILE_COLORS = [0xb9bec6, 0xafb5be];

/** The buildable factory floor: a raised concrete foundation topped with instanced tiles. */
export class GridRenderer {
  private readonly group = new THREE.Group();
  private tiles: THREE.InstancedMesh | null = null;
  private readonly tileGeometry = new THREE.BoxGeometry(0.95, 0.06, 0.95);
  private readonly tileMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  private readonly foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x8d939c });
  private readonly trimMaterial = new THREE.MeshLambertMaterial({ color: 0x6f7682 });

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
  }

  /** (Re)builds the floor for a grid size. Called once per factory, and again on expansion. */
  build(width: number, height: number): void {
    for (const child of [...this.group.children]) {
      this.group.remove(child);
      if (child instanceof THREE.Mesh && child.geometry !== this.tileGeometry) child.geometry.dispose();
    }
    this.tiles?.dispose();

    // Foundation slab: its top sits just below the tiles so the gaps read as grout lines.
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.5, 0.5, height + 0.5),
      this.foundationMaterial,
    );
    foundation.position.y = -0.27;
    foundation.receiveShadow = true;
    foundation.castShadow = true;
    this.group.add(foundation);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(width + 0.9, 0.22, height + 0.9), this.trimMaterial);
    trim.position.y = -0.45;
    trim.receiveShadow = true;
    this.group.add(trim);

    const tiles = new THREE.InstancedMesh(this.tileGeometry, this.tileMaterial, width * height);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    let index = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        matrix.makeTranslation(cellCenterX(x), -0.03, cellCenterZ(y));
        tiles.setMatrixAt(index, matrix);
        tiles.setColorAt(index, color.setHex(TILE_COLORS[(x + y) % 2]));
        index++;
      }
    }
    tiles.instanceMatrix.needsUpdate = true;
    tiles.receiveShadow = true;
    tiles.frustumCulled = false;
    this.group.add(tiles);
    this.tiles = tiles;
  }
}
