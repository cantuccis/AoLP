import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { TownData } from './WorldData';

/**
 * Handles town instantiation from data
 */
export class TownSystem {
  private townGroups: Map<string, THREE.Group> = new Map();
  private buildingLights: THREE.PointLight[] = [];
  private townLabels: THREE.Sprite[] = [];
  private buildingBounds: THREE.Box3[] = [];

  constructor(
    private scene: THREE.Scene,
    private assetLoader: AssetLoader
  ) {}

  createTown(townData: TownData): void {
    const townGroup = new THREE.Group();
    townGroup.name = `Town_${townData.id}`;
    townGroup.position.set(
      townData.position.x,
      townData.position.y,
      townData.position.z
    );

    // Add buildings to town
    for (const buildingData of townData.buildings) {
      const building = this.assetLoader.cloneModel(buildingData.modelName);
      
      if (!building) {
        console.warn(`Building model not found: ${buildingData.modelName}`);
        // Create placeholder cube
        const geometry = new THREE.BoxGeometry(
          buildingData.scale || 4,
          buildingData.scale || 6,
          buildingData.scale || 4
        );
        const material = new THREE.MeshStandardMaterial({
          color: 0x8b4513, // Brown
          roughness: 0.8,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(
          buildingData.position.x,
          buildingData.position.y + (buildingData.scale || 6) / 2,
          buildingData.position.z
        );
        mesh.rotation.y = buildingData.rotation;
        townGroup.add(mesh);
        continue;
      }

      building.position.set(
        buildingData.position.x,
        buildingData.position.y,
        buildingData.position.z
      );
      building.rotation.y = buildingData.rotation;

      // Calculate bounding box to see actual size
      const box = new THREE.Box3().setFromObject(building);
      const size = box.getSize(new THREE.Vector3());
      console.log(`Building (${buildingData.modelName}) size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);

      // Auto-scale buildings to reasonable size
      // Target: buildings should be around 4-8 units tall (typical house/tower height)
      let targetHeight = 5; // Default building height
      
      // Adjust target based on building type
      if (buildingData.modelName.includes('towncenter') || buildingData.modelName.includes('TownCenter')) {
        targetHeight = 8; // Town centers are large
      } else if (buildingData.modelName.includes('tower') || buildingData.modelName.includes('Tower')) {
        targetHeight = 10; // Towers taller
      } else if (buildingData.modelName.includes('barracks') || buildingData.modelName.includes('Barracks')) {
        targetHeight = 6; // Barracks medium-large
      } else if (buildingData.modelName.includes('market') || buildingData.modelName.includes('Market')) {
        targetHeight = 5; // Markets medium
      } else if (buildingData.modelName.includes('house') || buildingData.modelName.includes('House')) {
        targetHeight = 4; // Houses smaller
      }

      if (size.y > 0.01) {
        const scaleFactor = targetHeight / size.y;
        building.scale.multiplyScalar(scaleFactor);
        console.log(`Building auto-scaled by ${scaleFactor.toFixed(2)}x to reach ${targetHeight}m height`);
      } else {
        console.warn(`⚠️ Building has invalid size, using default scale`);
      }

      // Apply user-defined scale on top of auto-scale
      if (buildingData.scale) {
        building.scale.multiplyScalar(buildingData.scale);
        console.log(`Additional user scale: ${buildingData.scale}x`);
      }

      // Add small random variation
      const randomRotation = (Math.random() - 0.5) * 0.1;
      building.rotation.y += randomRotation;

      townGroup.add(building);

      // Calculate world-space bounding box for this building (for pathfinding)
      building.updateMatrixWorld(true);
      const buildingBox = new THREE.Box3().setFromObject(building);
      // Offset by town position
      buildingBox.translate(townGroup.position);
      this.buildingBounds.push(buildingBox);
    }

    // Add multiple warm lights spread around the town (5-6 lights)
    const lightPositions = [
      { x: 0, z: 0 },      // Center
      { x: -8, z: -8 },    // Northwest
      { x: 8, z: -8 },     // Northeast
      { x: -8, z: 8 },     // Southwest
      { x: 8, z: 8 },      // Southeast
      { x: 0, z: -12 },    // North
    ];

    for (const pos of lightPositions) {
      const townLight = new THREE.PointLight(0xffcc66, 7, 80); // Warm yellow
      townLight.position.set(pos.x, 4, pos.z); // 4 units above ground
      townLight.castShadow = false; // Performance optimization
      townLight.visible = false; // Start with lights off
      this.buildingLights.push(townLight);
      townGroup.add(townLight);
    }

    // Add floating town name label
    const labelSprite = this.createTownLabel(townData.name);
    labelSprite.position.set(0, 15, 0); // 15 units above town center
    townGroup.add(labelSprite);
    this.townLabels.push(labelSprite);

    this.townGroups.set(townData.id, townGroup);
    this.scene.add(townGroup);

    console.log(`Town created: ${townData.name} (${townData.id})`);
  }

  private createTownLabel(townName: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw semi-transparent background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
      ctx.fill();
      
      // Draw town name
      ctx.font = 'bold 64px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(townName, canvas.width / 2, canvas.height / 2);
      
      // Add subtle glow effect
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeText(townName, canvas.width / 2, canvas.height / 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(8, 2, 1); // 8 units wide, 2 units tall
    
    return sprite;
  }

  getTownGroup(townId: string): THREE.Group | undefined {
    return this.townGroups.get(townId);
  }

  getAllTowns(): Map<string, THREE.Group> {
    return this.townGroups;
  }

  setBuildingLights(enabled: boolean): void {
    for (const light of this.buildingLights) {
      light.visible = enabled;
    }
    console.log(`Building lights: ${enabled ? 'ON' : 'OFF'}`);
  }

  getBuildingBounds(): THREE.Box3[] {
    return this.buildingBounds;
  }
}

