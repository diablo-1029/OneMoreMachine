import * as THREE from 'three';

const PITCH = THREE.MathUtils.degToRad(50);
const DISTANCE = 60;
const MIN_VIEW_HEIGHT = 5;
const BASE_MAX_VIEW_HEIGHT = 34;
const DEFAULT_VIEW_HEIGHT = 17;

/**
 * Orthographic camera looking diagonally down at a point on the ground.
 * It can pan, zoom and rotate in 90° steps; it knows nothing about the game.
 */
export class CameraController {
  readonly camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 200);
  private readonly target = new THREE.Vector3();
  private viewHeight = DEFAULT_VIEW_HEIGHT;
  private aspect = 16 / 9;
  /** Quarter turns; the rendered yaw eases towards this. */
  private yawSteps = 0;
  private yaw = Math.PI / 4;
  /** Extra yaw from the slow idle orbit shown behind the main menu. */
  private driftAngle = 0;
  private panLimit = 12;
  private maxViewHeight = BASE_MAX_VIEW_HEIGHT;

  private readonly raycaster = new THREE.Raycaster();
  private readonly ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly ndc = new THREE.Vector2();

  constructor() {
    this.apply();
  }

  /** Sets how far the view may travel and zoom out, from the size of the factory floor. */
  setWorldSize(gridSize: number): void {
    this.panLimit = gridSize / 2 + 5;
    // Enough to see the whole floor corner to corner, plus some scenery.
    this.maxViewHeight = Math.max(BASE_MAX_VIEW_HEIGHT, gridSize * 1.25 + 10);
  }

  /** Keeps zoom and centre; only the horizontal extent follows the new aspect ratio. */
  setAspect(aspect: number): void {
    this.aspect = aspect;
    this.apply();
  }

  rotate(steps: number): void {
    this.yawSteps += steps;
  }

  center(): void {
    this.target.set(0, 0, 0);
    this.viewHeight = DEFAULT_VIEW_HEIGHT;
    this.apply();
  }

  /** Centres the view on a ground position, keeping the current zoom. */
  focus(x: number, z: number): void {
    this.target.x = THREE.MathUtils.clamp(x, -this.panLimit, this.panLimit);
    this.target.z = THREE.MathUtils.clamp(z, -this.panLimit, this.panLimit);
    this.apply();
  }

  /** Slowly orbits the scene; used while nothing is being played. */
  drift(dt: number): void {
    this.driftAngle += dt * 0.035;
  }

  /** Ends the idle orbit by easing to the nearest of the four fixed view angles. */
  settle(): void {
    this.yawSteps += Math.round(this.driftAngle / (Math.PI / 2));
    this.driftAngle = 0;
  }

  /** Pans by world units along the ground. */
  panWorld(dx: number, dz: number): void {
    this.target.x = THREE.MathUtils.clamp(this.target.x + dx, -this.panLimit, this.panLimit);
    this.target.z = THREE.MathUtils.clamp(this.target.z + dz, -this.panLimit, this.panLimit);
    this.apply();
  }

  /** Pans relative to the screen: +right moves the view right, +up moves it away from the viewer. */
  panScreen(right: number, up: number): void {
    // Ground-plane basis for the current yaw. The camera sits at +yaw looking back at the target.
    const rx = Math.sin(this.yaw);
    const rz = -Math.cos(this.yaw);
    const fx = -Math.cos(this.yaw);
    const fz = -Math.sin(this.yaw);
    this.panWorld(rx * right + fx * up, rz * right + fz * up);
  }

  /** Zooms by `factor`, keeping the ground point under the cursor fixed. */
  zoom(factor: number, ndcX: number, ndcY: number): void {
    const before = this.groundPoint(ndcX, ndcY, new THREE.Vector3());
    this.viewHeight = THREE.MathUtils.clamp(this.viewHeight * factor, MIN_VIEW_HEIGHT, this.maxViewHeight);
    this.apply();
    const after = this.groundPoint(ndcX, ndcY, new THREE.Vector3());
    if (before && after) this.panWorld(before.x - after.x, before.z - after.z);
  }

  /** World units per screen pixel at the current zoom, for keyboard pan speed. */
  get zoomScale(): number {
    return this.viewHeight / DEFAULT_VIEW_HEIGHT;
  }

  update(dt: number): void {
    const targetYaw = Math.PI / 4 + this.yawSteps * (Math.PI / 2) + this.driftAngle;
    const diff = targetYaw - this.yaw;
    if (Math.abs(diff) < 0.0005) {
      if (diff !== 0) {
        this.yaw = targetYaw;
        this.apply();
      }
      return;
    }
    this.yaw += diff * Math.min(1, dt * 12);
    this.apply();
  }

  /** Intersects the cursor ray with the ground plane (y = 0). */
  groundPoint(ndcX: number, ndcY: number, out: THREE.Vector3): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.ndc.set(ndcX, ndcY), this.camera);
    return this.raycaster.ray.intersectPlane(this.ground, out);
  }

  /** A raycaster aimed through the given cursor position, for picking meshes. */
  rayFrom(ndcX: number, ndcY: number): THREE.Raycaster {
    this.raycaster.setFromCamera(this.ndc.set(ndcX, ndcY), this.camera);
    return this.raycaster;
  }

  private apply(): void {
    const halfHeight = this.viewHeight / 2;
    const halfWidth = halfHeight * this.aspect;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();

    const horizontal = Math.cos(PITCH) * DISTANCE;
    this.camera.position.set(
      this.target.x + Math.cos(this.yaw) * horizontal,
      this.target.y + Math.sin(PITCH) * DISTANCE,
      this.target.z + Math.sin(this.yaw) * horizontal,
    );
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
  }
}
