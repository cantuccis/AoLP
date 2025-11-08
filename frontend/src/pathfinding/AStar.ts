/**
 * A* Pathfinding Algorithm Implementation
 */

export interface PathNode {
  x: number;
  z: number;
  g: number; // Cost from start
  h: number; // Heuristic cost to goal
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

export class AStar {
  /**
   * Find path using A* algorithm
   * @param startX Starting grid X coordinate
   * @param startZ Starting grid Z coordinate
   * @param goalX Goal grid X coordinate
   * @param goalZ Goal grid Z coordinate
   * @param isWalkable Function to check if a cell is walkable
   * @returns Array of grid coordinates representing the path, or null if no path found
   */
  static findPath(
    startX: number,
    startZ: number,
    goalX: number,
    goalZ: number,
    isWalkable: (x: number, z: number) => boolean
  ): { x: number; z: number }[] | null {
    const openSet: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: startX,
      z: startZ,
      g: 0,
      h: this.heuristic(startX, startZ, goalX, goalZ),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Get node with lowest f cost
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet[currentIndex];

      // Check if we reached the goal
      if (current.x === goalX && current.z === goalZ) {
        return this.reconstructPath(current);
      }

      // Move current from open to closed
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.z}`);

      // Check all neighbors (8 directions)
      const neighbors = this.getNeighbors(current.x, current.z);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.z}`;

        // Skip if in closed set
        if (closedSet.has(neighborKey)) continue;

        // Skip if not walkable
        if (!isWalkable(neighbor.x, neighbor.z)) continue;

        // Calculate costs
        const isDiagonal =
          neighbor.x !== current.x && neighbor.z !== current.z;
        const moveCost = isDiagonal ? 1.414 : 1.0; // sqrt(2) for diagonal
        const tentativeG = current.g + moveCost;

        // Check if neighbor is already in open set
        let neighborNode = openSet.find(
          (n) => n.x === neighbor.x && n.z === neighbor.z
        );

        if (!neighborNode) {
          // Add new node to open set
          neighborNode = {
            x: neighbor.x,
            z: neighbor.z,
            g: tentativeG,
            h: this.heuristic(neighbor.x, neighbor.z, goalX, goalZ),
            f: 0,
            parent: current,
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
        } else if (tentativeG < neighborNode.g) {
          // Update existing node with better path
          neighborNode.g = tentativeG;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Euclidean distance heuristic
   */
  private static heuristic(
    x1: number,
    z1: number,
    x2: number,
    z2: number
  ): number {
    const dx = x2 - x1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Get neighboring cells (8 directions)
   */
  private static getNeighbors(
    x: number,
    z: number
  ): { x: number; z: number }[] {
    return [
      { x: x - 1, z: z }, // West
      { x: x + 1, z: z }, // East
      { x: x, z: z - 1 }, // North
      { x: x, z: z + 1 }, // South
      { x: x - 1, z: z - 1 }, // Northwest
      { x: x + 1, z: z - 1 }, // Northeast
      { x: x - 1, z: z + 1 }, // Southwest
      { x: x + 1, z: z + 1 }, // Southeast
    ];
  }

  /**
   * Reconstruct path from goal to start
   */
  private static reconstructPath(node: PathNode): { x: number; z: number }[] {
    const path: { x: number; z: number }[] = [];
    let current: PathNode | null = node;

    while (current !== null) {
      path.unshift({ x: current.x, z: current.z });
      current = current.parent;
    }

    return path;
  }

  /**
   * Smooth path by removing unnecessary waypoints
   */
  static smoothPath(
    path: { x: number; z: number }[],
    isWalkable: (x: number, z: number) => boolean
  ): { x: number; z: number }[] {
    if (path.length <= 2) return path;

    const smoothed: { x: number; z: number }[] = [path[0]];
    let current = 0;

    while (current < path.length - 1) {
      let farthest = current + 1;

      // Try to find the farthest visible point
      for (let i = current + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[current], path[i], isWalkable)) {
          farthest = i;
        } else {
          break;
        }
      }

      smoothed.push(path[farthest]);
      current = farthest;
    }

    return smoothed;
  }

  /**
   * Check if there's a clear line of sight between two points
   */
  private static hasLineOfSight(
    from: { x: number; z: number },
    to: { x: number; z: number },
    isWalkable: (x: number, z: number) => boolean
  ): boolean {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const steps = Math.max(Math.abs(dx), Math.abs(dz));

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = Math.round(from.x + dx * t);
      const z = Math.round(from.z + dz * t);
      if (!isWalkable(x, z)) return false;
    }

    return true;
  }
}

