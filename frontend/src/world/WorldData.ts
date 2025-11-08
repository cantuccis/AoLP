/**
 * World data structures and schemas
 */

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface BuildingData {
  modelName: string;
  position: Vector3Data;
  rotation: number; // Y-axis rotation in radians
  scale?: number;
}

export interface TownData {
  id: string;
  name: string;
  position: Vector3Data;
  buildings: BuildingData[];
}

export interface RoadWaypoint {
  position: Vector3Data;
}

export interface RoadData {
  id: string;
  waypoints: RoadWaypoint[];
  width: number;
}

export interface PropData {
  modelName: string;
  position: Vector3Data;
  rotation: number;
  scale?: number;
}

export interface PeasantData {
  modelName: string;
  position: Vector3Data;
  rotation: number;
}

export interface WorldData {
  towns: TownData[];
  roads: RoadData[];
  props?: PropData[];
  peasants?: PeasantData[];
}

/**
 * Loads world data from JSON file
 */
export class WorldDataLoader {
  async load(path: string): Promise<WorldData> {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load world data: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('World data loaded:', data);
      return data as WorldData;
    } catch (error) {
      console.error('Error loading world data:', error);
      throw error;
    }
  }
}

