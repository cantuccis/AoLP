import * as THREE from 'three';

export class InputManager {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;

  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.camera = camera;
  }

  updateMousePosition(event: MouseEvent): void {
    // Convert mouse position to normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update raycaster with current mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  getIntersections(objects: THREE.Object3D[]): THREE.Intersection[] {
    return this.raycaster.intersectObjects(objects, true);
  }
}

