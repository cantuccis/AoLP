import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { WorldDataLoader, WorldData } from './WorldData';
import { TownSystem } from './TownSystem';
import { RoadSystem } from './RoadSystem';
import { PeasantSystem } from './PeasantSystem';
import { Mountains } from '../scene/Mountains';
import { Trees } from '../scene/Trees';
import { StateManager } from '../state/StateManager';
import { NavigationGrid } from '../pathfinding/NavigationGrid';

/**
 * Manages the entire game world
 */
export class WorldManager {
  private assetLoader: AssetLoader;
  private worldDataLoader: WorldDataLoader;
  private townSystem: TownSystem;
  private roadSystem: RoadSystem;
  private peasantSystem: PeasantSystem;
  private mountains: Mountains;
  private trees: Trees;
  private navigationGrid: NavigationGrid;

  private isLoaded = false;

  constructor(private scene: THREE.Scene) {
    this.assetLoader = new AssetLoader();
    this.worldDataLoader = new WorldDataLoader();
    this.townSystem = new TownSystem(scene, this.assetLoader);
    this.roadSystem = new RoadSystem(scene);
    this.peasantSystem = new PeasantSystem(scene, this.assetLoader);
    this.mountains = new Mountains(scene, this.assetLoader);
    this.trees = new Trees(scene, this.assetLoader);
    this.navigationGrid = new NavigationGrid(400, 0.1); // 400x400 map, 0.1 resolution (4000x4000 grid)
  }

  async initialize(): Promise<void> {
    console.log('Initializing world...');

    // Load world data
    const worldData = await this.worldDataLoader.load('/assets/data/world.json');

    // Load models before creating world
    console.log('Loading models...');
    await this.loadModels();

    console.log('Creating mountains...');
    await this.mountains.initialize();

    console.log('Creating trees...');
    await this.trees.initialize();

    console.log('World data loaded, creating world...');

    await this.createWorld(worldData);

    // Initialize pathfinding navigation grid
    console.log('Initializing pathfinding navigation grid...');
    this.initializeNavigationGrid();

    this.isLoaded = true;
    console.log('World initialization complete!');
  }

  private async loadModels(): Promise<void> {
      const modelsToLoad = [
        { name: 'peasant', path: '/assets/models/T-Pose.fbx' },
        { name: 'peasant_anim', path: '/assets/models/HappyIdle.fbx' },
        { name: 'peasant_walk', path: '/assets/models/Walking.fbx' },
      { name: 'house', path: '/assets/models/house.fbx' },
      { name: 'house2', path: '/assets/models/house2.fbx' },
      { name: 'house3', path: '/assets/models/house3.fbx' },
      { name: 'tower', path: '/assets/models/tower.fbx' },
      { name: 'market', path: '/assets/models/market.fbx' },
      { name: 'towncenter', path: '/assets/models/towncenter.fbx' },
      { name: 'barracks', path: '/assets/models/barracks.fbx' },
      { name: 'storage', path: '/assets/models/storage.fbx' },
      { name: 'archery', path: '/assets/models/archery.fbx' },
      { name: 'port', path: '/assets/models/port.fbx' },
      { name: 'mine', path: '/assets/models/mine.fbx' },
    ];

    const loadPromises = modelsToLoad.map(async ({ name, path }) => {
      try {
        await this.assetLoader.loadModel(name, path);
        console.log(`✓ Loaded model: ${name}`);
      } catch (error) {
        console.log(`ℹ Model not found: ${name} (will use placeholder)`);
      }
    });

    await Promise.all(loadPromises);
  }

  private async createWorld(worldData: WorldData): Promise<void> {
    // Create towns
    for (const townData of worldData.towns) {
      this.townSystem.createTown(townData);
    }

    // Create roads
    for (const roadData of worldData.roads) {
      this.roadSystem.createRoad(roadData);
    }

    // Create peasants
    if (worldData.peasants) {
      for (const peasantData of worldData.peasants) {
        this.peasantSystem.createPeasant(peasantData);
      }
    }

    // Create props
    if (worldData.props) {
      for (const propData of worldData.props) {
        this.peasantSystem.createProp(propData);
      }
    }
  }

  update(deltaTime: number): void {
    // Update peasant animations
    this.peasantSystem.update(deltaTime);
  }

  updateWithState(deltaTime: number, stateManager: StateManager): void {
    // Update peasant system with state management
    this.peasantSystem.updateWithState(deltaTime, stateManager);
  }

  getAssetLoader(): AssetLoader {
    return this.assetLoader;
  }

  getPeasantSystem(): PeasantSystem {
    return this.peasantSystem;
  }

  getTownSystem(): TownSystem {
    return this.townSystem;
  }

  getTrees(): Trees {
    return this.trees;
  }

  isWorldLoaded(): boolean {
    return this.isLoaded;
  }

  private initializeNavigationGrid(): void {
    // Collect all building bounds from towns
    const buildingBounds = this.townSystem.getBuildingBounds();
    console.log(`Marking ${buildingBounds.length} buildings as obstacles...`);
    
    for (const bounds of buildingBounds) {
      this.navigationGrid.markObstacle(bounds);
    }

    // Collect all prop bounds (mines, etc.)
    const propBounds = this.peasantSystem.getPropBounds();
    console.log(`Marking ${propBounds.length} props as obstacles...`);
    
    for (const bounds of propBounds) {
      this.navigationGrid.markObstacle(bounds);
    }

    console.log('✓ Navigation grid initialized with all obstacles');
  }

  getNavigationGrid(): NavigationGrid {
    return this.navigationGrid;
  }
}

