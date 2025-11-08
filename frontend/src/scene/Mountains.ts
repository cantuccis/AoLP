import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * Creates mountains around the perimeter of the map using rock models
 */
export class Mountains {
  private mountains: THREE.Group;
  private assetLoader: AssetLoader;
  private rockModels: string[] = ['rock1', 'rock2', 'rock3', 'rock_group'];

  constructor(scene: THREE.Scene, assetLoader: AssetLoader) {
    this.mountains = new THREE.Group();
    this.mountains.name = 'Mountains';
    this.assetLoader = assetLoader;
    scene.add(this.mountains);
  }

  async initialize(): Promise<void> {
    // Load rock models
    console.log('Loading mountain/rock models...');
    await this.loadRockModels();
    
    // Create mountains using the loaded models
    this.createMountains();
    console.log('✓ Mountains created');
  }

  private async loadRockModels(): Promise<void> {
    const loadPromises = this.rockModels.map(async (name) => {
      try {
        await this.assetLoader.loadModel(name, `/assets/models/${name}.fbx`);
      } catch (error) {
        console.warn(`Failed to load rock model ${name}:`, error);
      }
    });
    await Promise.all(loadPromises);
  }

  private createMountains(): void {
    const mountainRadius = 185; // Distance from center - at the edge of the map
    const mountainCount = 32; // Mountains around the perimeter

    // Town positions (from world.json)
    const townPositions = [
      { x: -30, z: -30 }, // Riverside
      { x: 25, z: -20 },  // Hillcrest
      { x: 0, z: 35 },    // Oakwood
    ];

    // Create mountains in a circle around the map using real models
    for (let i = 0; i < mountainCount; i++) {
      const angle = (i / mountainCount) * Math.PI * 2;
      const x = Math.cos(angle) * mountainRadius;
      const z = Math.sin(angle) * mountainRadius;

      // Pick rock model based on position index (deterministic)
      const modelIndex = i % this.rockModels.length;
      const modelName = this.rockModels[modelIndex];
      const rockModel = this.assetLoader.cloneModel(modelName);

      if (rockModel) {
        // No random offset - evenly spaced in a perfect circle
        const finalX = x;
        const finalZ = z;

        // Check distance to nearest town
        let minDistance = Infinity;
        for (const town of townPositions) {
          const distance = Math.sqrt(
            Math.pow(finalX - town.x, 2) + Math.pow(finalZ - town.z, 2)
          );
          minDistance = Math.min(minDistance, distance);
        }

        // Skip rocks that are too close to towns
        if (minDistance < 159) {
          continue;
        }
        
        const scale = 1.5; // Fixed base scale
        rockModel.scale.setScalar(scale);
        rockModel.position.set(finalX, 0, finalZ);

        // No random rotation - consistent orientation
        rockModel.rotation.y = 0;

        this.mountains.add(rockModel);
      }
    }

    // Add some extra larger mountains at corners
    this.addCornerMountains();

    console.log(`✓ Created ${this.mountains.children.length} mountains around the map`);
  }

  private addCornerMountains(): void {
    const cornerDistance = 190;
    const corners = [
      { x: cornerDistance, z: cornerDistance },
      { x: -cornerDistance, z: cornerDistance },
      { x: cornerDistance, z: -cornerDistance },
      { x: -cornerDistance, z: -cornerDistance },
    ];

    corners.forEach((corner) => {
      // Use rock_group for corners (larger formation)
      const rockModel = this.assetLoader.cloneModel('rock_group');
      
      if (rockModel) {
        // Fixed scale for corner mountains
        const scale = 2.0;
        rockModel.scale.setScalar(scale);
        rockModel.position.set(corner.x, 0, corner.z);
        rockModel.rotation.y = 0; // No random rotation
        this.mountains.add(rockModel);
      }
    });
  }

  getMountains(): THREE.Group {
    return this.mountains;
  }
}

