import * as THREE from 'three';
import { RoadData } from './WorldData';

/**
 * Handles road generation from waypoints
 */
export class RoadSystem {
  private roads: THREE.Group[] = [];

  constructor(private scene: THREE.Scene) {}

  createRoad(roadData: RoadData): void {
    const roadGroup = new THREE.Group();
    roadGroup.name = `Road_${roadData.id}`;

    // Convert waypoints to Vector3 array
    const points = roadData.waypoints.map(
      (wp) => new THREE.Vector3(wp.position.x, wp.position.y, wp.position.z)
    );

    if (points.length < 2) {
      console.warn(`Road ${roadData.id} has less than 2 waypoints, skipping`);
      return;
    }

    // Create spline curve
    const curve = new THREE.CatmullRomCurve3(points);
    curve.tension = 0.5; // Smoother curves

    // Generate road mesh along the spline
    const segments = Math.max(20, points.length * 10);
    const curvePoints = curve.getPoints(segments);

    // Create road geometry as a ribbon
    const roadWidth = roadData.width;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < curvePoints.length; i++) {
      const point = curvePoints[i];
      
      // Calculate tangent for road direction
      const tangent = curve.getTangent(i / (curvePoints.length - 1));
      
      // Calculate perpendicular vector for road width
      const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Create two vertices for road width
      const left = point.clone().add(perpendicular.clone().multiplyScalar(roadWidth / 2));
      const right = point.clone().sub(perpendicular.clone().multiplyScalar(roadWidth / 2));

      // Raise slightly above ground to prevent z-fighting
      left.y += 0.05;
      right.y += 0.05;

      vertices.push(left.x, left.y, left.z);
      vertices.push(right.x, right.y, right.z);

      // UV coordinates
      const u = i / (curvePoints.length - 1);
      uvs.push(0, u * 10);
      uvs.push(1, u * 10);

      // Create triangles (except for first point)
      if (i > 0) {
        const base = (i - 1) * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // Road material (dirt/packed earth)
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b7355, // Dirt brown
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide, // Render both sides so roads are visible from above
    });

    const roadMesh = new THREE.Mesh(geometry, material);
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    this.roads.push(roadGroup);
    this.scene.add(roadGroup);

    console.log(`Road created: ${roadData.id}`);
  }

  getRoads(): THREE.Group[] {
    return this.roads;
  }
}

