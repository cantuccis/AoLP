import * as THREE from 'three';
import { AStar } from './AStar';

/**
 * Navigation grid for pathfinding
 * Uses a grid of cells to represent walkable/blocked areas
 */
export class NavigationGrid {
  private grid: boolean[][]; // true = walkable, false = blocked
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;
  private mapOffset: number; // Offset to center the grid

  constructor(mapSize: number = 400, cellSize: number = 0.5) {
    this.cellSize = cellSize;
    this.mapOffset = mapSize / 2; // Map goes from -200 to 200

    // Calculate grid dimensions
    this.gridWidth = Math.ceil(mapSize / cellSize);
    this.gridHeight = Math.ceil(mapSize / cellSize);

    // Initialize grid with all cells walkable
    this.grid = [];
    for (let x = 0; x < this.gridWidth; x++) {
      this.grid[x] = [];
      for (let z = 0; z < this.gridHeight; z++) {
        this.grid[x][z] = true; // All cells start as walkable
      }
    }

    console.log(
      `NavigationGrid initialized: ${this.gridWidth}x${this.gridHeight} cells (${cellSize} unit resolution)`
    );
  }

  /**
   * Convert world coordinates to grid coordinates
   */
  worldToGrid(worldX: number, worldZ: number): { x: number; z: number } {
    const gridX = Math.floor((worldX + this.mapOffset) / this.cellSize);
    const gridZ = Math.floor((worldZ + this.mapOffset) / this.cellSize);
    return { x: gridX, z: gridZ };
  }

  /**
   * Convert grid coordinates to world coordinates (center of cell)
   */
  gridToWorld(gridX: number, gridZ: number): { x: number; z: number } {
    const worldX = gridX * this.cellSize - this.mapOffset + this.cellSize / 2;
    const worldZ = gridZ * this.cellSize - this.mapOffset + this.cellSize / 2;
    return { x: worldX, z: worldZ };
  }

  /**
   * Check if a grid cell is walkable
   */
  isWalkable(gridX: number, gridZ: number): boolean {
    // Out of bounds = not walkable
    if (
      gridX < 0 ||
      gridX >= this.gridWidth ||
      gridZ < 0 ||
      gridZ >= this.gridHeight
    ) {
      return false;
    }
    return this.grid[gridX][gridZ];
  }

  /**
   * Mark cells within a bounding box as blocked (obstacle)
   */
  markObstacle(bounds: THREE.Box3, padding: number = 0.5): void {
    const min = bounds.min;
    const max = bounds.max;

    // Add padding
    const paddedMin = new THREE.Vector3(
      min.x - padding,
      min.y,
      min.z - padding
    );
    const paddedMax = new THREE.Vector3(
      max.x + padding,
      max.y,
      max.z + padding
    );

    // Convert to grid coordinates
    const gridMin = this.worldToGrid(paddedMin.x, paddedMin.z);
    const gridMax = this.worldToGrid(paddedMax.x, paddedMax.z);

    // Mark all cells in the bounding box as blocked
    for (let x = gridMin.x; x <= gridMax.x; x++) {
      for (let z = gridMin.z; z <= gridMax.z; z++) {
        if (
          x >= 0 &&
          x < this.gridWidth &&
          z >= 0 &&
          z < this.gridHeight
        ) {
          this.grid[x][z] = false;
        }
      }
    }
  }

  /**
   * Find a path from start to goal using A* algorithm
   */
  findPath(start: THREE.Vector3, goal: THREE.Vector3): THREE.Vector3[] | null {
    // Convert world coordinates to grid coordinates
    const startGrid = this.worldToGrid(start.x, start.z);
    const goalGrid = this.worldToGrid(goal.x, goal.z);

    // Check if start and goal are valid
    if (!this.isWalkable(startGrid.x, startGrid.z)) {
      console.warn('Start position is not walkable, finding nearest walkable cell...');
      // Try to find a nearby walkable cell
      const nearbyStart = this.findNearestWalkable(startGrid.x, startGrid.z);
      if (nearbyStart) {
        startGrid.x = nearbyStart.x;
        startGrid.z = nearbyStart.z;
        console.log('✓ Found walkable start position');
      } else {
        console.warn('✗ No walkable start position found within search radius');
        return null;
      }
    }

    if (!this.isWalkable(goalGrid.x, goalGrid.z)) {
      console.warn('Goal position is not walkable, finding nearest walkable cell...');
      // Try to find a nearby walkable cell
      const nearbyGoal = this.findNearestWalkable(goalGrid.x, goalGrid.z);
      if (nearbyGoal) {
        goalGrid.x = nearbyGoal.x;
        goalGrid.z = nearbyGoal.z;
        console.log('✓ Found walkable goal position');
      } else {
        console.warn('✗ No walkable goal position found within search radius');
        return null;
      }
    }

    // Find path using A*
    const gridPath = AStar.findPath(
      startGrid.x,
      startGrid.z,
      goalGrid.x,
      goalGrid.z,
      (x, z) => this.isWalkable(x, z)
    );

    if (!gridPath) {
      return null;
    }

    // Smooth the path
    const smoothedPath = AStar.smoothPath(gridPath, (x, z) =>
      this.isWalkable(x, z)
    );

    // Convert grid path back to world coordinates
    const worldPath: THREE.Vector3[] = smoothedPath.map((point) => {
      const worldPos = this.gridToWorld(point.x, point.z);
      return new THREE.Vector3(worldPos.x, 0, worldPos.z);
    });

    return worldPath;
  }

  /**
   * Find nearest walkable cell to a given grid position
   */
  private findNearestWalkable(
    gridX: number,
    gridZ: number,
    maxRadius: number = 200
  ): { x: number; z: number } | null {
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) !== radius && Math.abs(dz) !== radius) continue;
          const x = gridX + dx;
          const z = gridZ + dz;
          if (this.isWalkable(x, z)) {
            return { x, z };
          }
        }
      }
    }
    return null;
  }

  /**
   * Get all blocked cells (for debugging/visualization)
   */
  getBlockedCells(): { x: number; z: number }[] {
    const blocked: { x: number; z: number }[] = [];
    for (let x = 0; x < this.gridWidth; x++) {
      for (let z = 0; z < this.gridHeight; z++) {
        if (!this.grid[x][z]) {
          const worldPos = this.gridToWorld(x, z);
          blocked.push(worldPos);
        }
      }
    }
    return blocked;
  }
}

