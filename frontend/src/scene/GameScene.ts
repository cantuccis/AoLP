import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Lighting } from './Lighting';
import { Ground } from './Ground';
import { Mountains } from './Mountains';
import { LightingTime } from './LightingConfig';

/**
 * Main game scene with renderer, camera, and basic setup
 */
export class GameScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  // Scene components
  private lighting: Lighting;
  private mountains?: Mountains;
  private textureLoader: THREE.TextureLoader;
  private worldManager?: any; // Reference to WorldManager for controlling building lights

  // Development helpers
  private axesHelper: THREE.AxesHelper;
  private gridHelper: THREE.GridHelper;

  // WASD camera movement
  private keyPressed: Set<string> = new Set();
  private moveSpeed = 30; // Units per second

  constructor(canvas: HTMLCanvasElement) {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Initial lighting will be set after lighting is created
    this.scene.background = new THREE.Color(0xffb870); // Temporary, will be updated
    
    // Add fog for depth
    this.scene.fog = new THREE.Fog(0xffa060, 100, 350); // Temporary, will be updated

    // Create camera (RTS-style: perspective but higher angle)
    this.camera = new THREE.PerspectiveCamera(
      60, // FOV
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 30, 40);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Performance optimization
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Create orbit controls for RTS-style camera
    // Attach to canvas-overlay div instead of canvas to allow UI elements to receive clicks
    const canvasOverlay = document.getElementById('canvas-overlay') || this.renderer.domElement;
    this.controls = new OrbitControls(this.camera, canvasOverlay);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.5; // Don't go below horizon
    this.controls.minDistance = 10;
    this.controls.maxDistance = 150;
    this.controls.target.set(0, 0, 0);

    // Initialize texture loader
    this.textureLoader = new THREE.TextureLoader();

    // Add lighting (defaults to afternoon)
    this.lighting = new Lighting(this.scene, 'afternoon');

    // Apply initial sky and fog colors
    this.updateSkyAndFog('afternoon');

    // Add ground (no need to store reference)
    new Ground(this.scene, this.textureLoader);

    // Mountains will be initialized later (needs asset loader)

    // Development helpers
    this.axesHelper = new THREE.AxesHelper(50);
    this.gridHelper = new THREE.GridHelper(400, 80, 0x888888, 0x444444);
    this.scene.add(this.axesHelper);
    this.scene.add(this.gridHelper);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Setup WASD keyboard controls
    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        this.keyPressed.add(key);
        event.preventDefault(); // Prevent page scrolling
      }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      this.keyPressed.delete(key);
    });
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(deltaTime: number): void {
    // Handle WASD camera movement
    if (this.keyPressed.size > 0) {
      this.handleCameraMovement(deltaTime);
    }

    // Update controls
    this.controls.update();

    // Update lighting (for future daylight cycle)
    this.lighting.update(deltaTime);
  }

  private handleCameraMovement(deltaTime: number): void {
    const moveDistance = this.moveSpeed * deltaTime;
    
    // Get camera's forward and right vectors (in XZ plane)
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    // Calculate forward direction (where camera is looking, but only XZ plane)
    this.camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();
    
    // Calculate right direction
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    right.normalize();
    
    // Calculate movement vector
    const movement = new THREE.Vector3();
    
    if (this.keyPressed.has('w')) {
      movement.add(forward.clone().multiplyScalar(moveDistance));
    }
    if (this.keyPressed.has('s')) {
      movement.add(forward.clone().multiplyScalar(-moveDistance));
    }
    if (this.keyPressed.has('a')) {
      movement.add(right.clone().multiplyScalar(-moveDistance));
    }
    if (this.keyPressed.has('d')) {
      movement.add(right.clone().multiplyScalar(moveDistance));
    }
    
    // Apply movement to both camera and controls target
    this.camera.position.add(movement);
    this.controls.target.add(movement);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  toggleHelpers(visible?: boolean): boolean {
    if (visible === undefined) {
      // Toggle current state
      visible = !this.axesHelper.visible;
    }
    this.axesHelper.visible = visible;
    this.gridHelper.visible = visible;
    return visible;
  }

  centerCameraOn(position: { x: number; y: number; z: number }): void {
    // Move the OrbitControls target to the position
    this.controls.target.set(position.x, position.y, position.z);
    
    // Optionally, move the camera to a nice viewing angle
    const offset = 15; // Distance from target
    const height = 10; // Height above target
    this.camera.position.set(
      position.x + offset,
      position.y + height,
      position.z + offset
    );
    
    this.controls.update();
    console.log(`Camera centered on (${position.x.toFixed(1)}, ${position.z.toFixed(1)})`);
  }

  private updateSkyAndFog(time: LightingTime): void {
    const colors = this.lighting.getPresetColors(time);
    this.scene.background = new THREE.Color(colors.skyColor);
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.setHex(colors.fogColor);
    }
  }

  setTimeOfDay(time: LightingTime): void {
    this.lighting.applyPreset(time);
    this.updateSkyAndFog(time);
    
    // Toggle building lights for night
    if (this.worldManager) {
      const lightsOn = time === 'night';
      this.worldManager.getTownSystem().setBuildingLights(lightsOn);
    }
  }

  getCurrentTimeOfDay(): LightingTime {
    return this.lighting.getCurrentPreset();
  }

  setWorldManager(worldManager: any): void {
    this.worldManager = worldManager;
  }

  dispose(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.controls.dispose();
    this.renderer.dispose();
  }
}

