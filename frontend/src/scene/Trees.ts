import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * Populates the map with trees, avoiding town areas
 */
export class Trees {
  private trees: THREE.Group;
  private assetLoader: AssetLoader;
  private treeModels: string[] = ['tree1', 'tree2', 'pine_tree', 'tree_group', 'pine_tree_group'];
  private treePositions: Array<{ x: number; y: number; z: number }> = [];

  constructor(scene: THREE.Scene, assetLoader: AssetLoader) {
    this.trees = new THREE.Group();
    this.trees.name = 'Trees';
    this.assetLoader = assetLoader;
    scene.add(this.trees);
  }

  async initialize(): Promise<void> {
    // Load tree models
    console.log('Loading tree models...');
    await this.loadTreeModels();
    
    // Create trees across the map
    this.createTrees();
    console.log('✓ Trees created');
  }

  private async loadTreeModels(): Promise<void> {
    const loadPromises = this.treeModels.map(async (name) => {
      try {
        await this.assetLoader.loadModel(name, `/assets/models/${name}.fbx`);
      } catch (error) {
        console.warn(`Failed to load tree model ${name}:`, error);
      }
    });
    await Promise.all(loadPromises);
  }

  private createTrees(): void {
    // Fixed tree positions - no randomness
    // Format: { x, z, modelIndex, rotation, scale }
    const fixedTreePositions = [


      // Trees near Riverside (town at -30, -30) - pushed further out
      { x: -60, z: -20, modelIndex: 0, rotation: 0, scale: 0.9 },
      { x: -55, z: -50, modelIndex: 1, rotation: 1.5, scale: 1.0 },
      { x: -20, z: -60, modelIndex: 2, rotation: 3.0, scale: 1.1 },
      { x: -5, z: -45, modelIndex: 3, rotation: 0.5, scale: 0.95 },
      { x: -45, z: -5, modelIndex: 4, rotation: 2.0, scale: 1.05 },
      { x: -70, z: -40, modelIndex: 0, rotation: 4.0, scale: 0.85 },
      { x: -10, z: -15, modelIndex: 1, rotation: 1.0, scale: 1.0 },
      { x: -50, z: -65, modelIndex: 2, rotation: 2.5, scale: 0.9 },
      

      // Trees near Hillcrest (town at 25, -20) - pushed further out

      { x: 50, z: -10, modelIndex: 1, rotation: 0.7, scale: 1.0 },
      { x: 40, z: -40, modelIndex: 2, rotation: 2.2, scale: 0.95 },
      { x: 10, z: -35, modelIndex: 3, rotation: 3.5, scale: 1.1 },
      { x: 30, z: 0, modelIndex: 4, rotation: 1.8, scale: 0.9 },
      { x: 55, z: -30, modelIndex: 0, rotation: 0.3, scale: 1.05 },
      { x: 35, z: 5, modelIndex: 1, rotation: 4.5, scale: 0.85 },
      { x: 5, z: -5, modelIndex: 2, rotation: 1.2, scale: 1.0 },
      { x: 52, z: -45, modelIndex: 3, rotation: 2.8, scale: 0.95 },
      
      // Trees near Oakwood (town at 0, 35) - pushed further out
      { x: -20, z: 50, modelIndex: 2, rotation: 0.9, scale: 1.0 },
      { x: 20, z: 55, modelIndex: 3, rotation: 2.4, scale: 0.9 },
      { x: 0, z: 65, modelIndex: 4, rotation: 3.7, scale: 1.1 },
      { x: -25, z: 20, modelIndex: 0, rotation: 1.6, scale: 0.95 },
      { x: 25, z: 25, modelIndex: 1, rotation: 0.2, scale: 1.05 },
      { x: 10, z: 15, modelIndex: 2, rotation: 4.2, scale: 0.85 },
      { x: -15, z: 68, modelIndex: 3, rotation: 1.4, scale: 1.0 },
      { x: 22, z: 18, modelIndex: 4, rotation: 3.0, scale: 0.9 },
      
      // Trees scattered across the map (avoiding towns and mine)
      { x: -80, z: -50, modelIndex: 0, rotation: 0.5, scale: 1.0 },
      { x: -70, z: 10, modelIndex: 1, rotation: 1.8, scale: 0.95 },
      { x: -60, z: 40, modelIndex: 2, rotation: 3.2, scale: 1.05 },
      { x: -50, z: -80, modelIndex: 3, rotation: 0.9, scale: 0.9 },
      { x: -40, z: 60, modelIndex: 4, rotation: 2.5, scale: 1.1 },
      { x: -30, z: -90, modelIndex: 0, rotation: 4.1, scale: 0.85 },
      { x: -20, z: 80, modelIndex: 1, rotation: 1.3, scale: 1.0 },
      { x: -10, z: -70, modelIndex: 2, rotation: 2.9, scale: 0.95 },
      { x: 0, z: -100, modelIndex: 3, rotation: 0.4, scale: 1.05 },
      { x: 10, z: 90, modelIndex: 4, rotation: 3.6, scale: 0.9 },
      { x: 20, z: -60, modelIndex: 0, rotation: 1.7, scale: 1.0 },
      { x: 30, z: 70, modelIndex: 1, rotation: 2.1, scale: 0.95 },
      { x: 40, z: -90, modelIndex: 2, rotation: 4.4, scale: 1.1 },
      { x: 50, z: 50, modelIndex: 3, rotation: 0.8, scale: 0.85 },
      { x: 60, z: -40, modelIndex: 4, rotation: 3.3, scale: 1.0 },
      { x: 70, z: 20, modelIndex: 0, rotation: 1.9, scale: 0.9 },
      { x: 80, z: -70, modelIndex: 1, rotation: 2.7, scale: 1.05 },
      { x: 90, z: 30, modelIndex: 2, rotation: 0.6, scale: 0.95 },
      { x: -90, z: 60, modelIndex: 3, rotation: 4.0, scale: 1.0 },
      { x: -100, z: -20, modelIndex: 4, rotation: 1.5, scale: 0.9 },
      { x: -85, z: 90, modelIndex: 0, rotation: 3.1, scale: 1.1 },
      { x: 95, z: -10, modelIndex: 1, rotation: 0.7, scale: 0.85 },
      { x: 100, z: 80, modelIndex: 2, rotation: 2.3, scale: 1.0 },
      { x: -75, z: -100, modelIndex: 3, rotation: 4.5, scale: 0.95 },
      { x: 85, z: 60, modelIndex: 4, rotation: 1.1, scale: 1.05 },
      { x: -55, z: 100, modelIndex: 0, rotation: 2.8, scale: 0.9 },
      { x: 65, z: -80, modelIndex: 1, rotation: 0.3, scale: 1.0 },
      { x: -65, z: -60, modelIndex: 2, rotation: 3.9, scale: 0.95 },
      { x: 75, z: 90, modelIndex: 3, rotation: 1.6, scale: 1.1 },
      { x: -95, z: 30, modelIndex: 4, rotation: 2.4, scale: 0.85 },
      { x: 55, z: -100, modelIndex: 0, rotation: 4.2, scale: 1.0 },
      { x: -25, z: 110, modelIndex: 1, rotation: 0.9, scale: 0.9 },
      { x: 105, z: -30, modelIndex: 2, rotation: 3.5, scale: 1.05 },
      { x: -110, z: 40, modelIndex: 3, rotation: 1.4, scale: 0.95 },
      { x: 45, z: 100, modelIndex: 4, rotation: 2.9, scale: 1.0 },
      { x: -35, z: -110, modelIndex: 0, rotation: 0.5, scale: 0.9 },
      { x: 110, z: 50, modelIndex: 1, rotation: 4.3, scale: 1.1 },
      { x: -45, z: 85, modelIndex: 2, rotation: 1.8, scale: 0.85 },
      { x: 35, z: -85, modelIndex: 3, rotation: 3.2, scale: 1.0 },
      { x: -85, z: -40, modelIndex: 4, rotation: 0.4, scale: 0.95 },
      { x: 95, z: 95, modelIndex: 0, rotation: 2.6, scale: 1.05 },
      { x: -100, z: -90, modelIndex: 1, rotation: 1.2, scale: 0.9 },
      { x: 25, z: 115, modelIndex: 2, rotation: 4.1, scale: 1.0 },
      { x: -55, z: -95, modelIndex: 3, rotation: 0.8, scale: 0.95 },
      { x: 85, z: -55, modelIndex: 4, rotation: 3.4, scale: 1.1 },
      { x: -120, z: 10, modelIndex: 0, rotation: 1.7, scale: 0.85 },
      { x: 120, z: -20, modelIndex: 1, rotation: 2.5, scale: 1.0 },
      { x: -15, z: -120, modelIndex: 2, rotation: 0.6, scale: 0.9 },
      { x: 15, z: 120, modelIndex: 3, rotation: 3.8, scale: 1.05 },
      { x: -105, z: 75, modelIndex: 4, rotation: 1.3, scale: 0.95 },
      { x: 105, z: -75, modelIndex: 0, rotation: 4.4, scale: 1.0 },
      { x: -75, z: 105, modelIndex: 1, rotation: 0.9, scale: 0.9 },
      { x: 75, z: -105, modelIndex: 2, rotation: 2.7, scale: 1.1 },
      { x: -130, z: -30, modelIndex: 3, rotation: 1.5, scale: 0.85 },
      { x: 130, z: 35, modelIndex: 4, rotation: 3.1, scale: 1.0 },
      { x: -50, z: 130, modelIndex: 0, rotation: 0.7, scale: 0.95 },
      { x: 50, z: -130, modelIndex: 1, rotation: 4.0, scale: 1.05 },
      { x: -140, z: 50, modelIndex: 2, rotation: 1.9, scale: 0.9 },
      { x: 140, z: -50, modelIndex: 3, rotation: 2.3, scale: 1.0 },
      { x: -60, z: -130, modelIndex: 4, rotation: 0.5, scale: 0.95 },
      { x: 60, z: 130, modelIndex: 0, rotation: 3.6, scale: 1.1 },
    ];

    // Place all trees at fixed positions
    for (const treeData of fixedTreePositions) {
      const modelName = this.treeModels[treeData.modelIndex % this.treeModels.length];
      const treeModel = this.assetLoader.cloneModel(modelName);

      if (treeModel) {
        // Auto-scale trees to match world scale
        const box = new THREE.Box3().setFromObject(treeModel);
        const size = box.getSize(new THREE.Vector3());
        
        // Target height based on tree type
        let targetHeight = 8; // Default height for single trees
        if (modelName.includes('group')) {
          targetHeight = 10; // Tree groups are taller
        }
        
        if (size.y > 0.01) {
          const scaleFactor = targetHeight / size.y;
          treeModel.scale.multiplyScalar(scaleFactor);
          
          // Apply fixed scale variation
          treeModel.scale.multiplyScalar(treeData.scale);
        }

        treeModel.position.set(treeData.x, 0, treeData.z);
        treeModel.rotation.y = treeData.rotation;

        this.trees.add(treeModel);
        
        // Store tree position for task system
        this.treePositions.push({ x: treeData.x, y: 0, z: treeData.z });
      }
    }

    console.log(`✓ Placed ${fixedTreePositions.length} trees on the map (fixed positions)`);
  }

  getTrees(): THREE.Group {
    return this.trees;
  }

  getTreeObjects(): THREE.Group[] {
    return this.trees.children as THREE.Group[];
  }

  getTreePositions(): Array<{ x: number; y: number; z: number }> {
    return this.treePositions;
  }
}

