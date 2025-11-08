import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';

/**
 * Ground plane with grass texture
 */
export class Ground {
  private mesh: THREE.Mesh;
  private readonly groundSize = 400;

  constructor(scene: THREE.Scene, textureLoader: THREE.TextureLoader) {
    // Create ground geometry
    const geometry = new THREE.PlaneGeometry(this.groundSize, this.groundSize);

    // Create material with procedural texture as fallback
    const proceduralTexture = ProceduralTextures.createGrassTexture(512);
    proceduralTexture.repeat.set(40, 40);

    const material = new THREE.MeshStandardMaterial({
      map: proceduralTexture,
      color: 0xa0a080, // Slightly darker tint for the ground
      roughness: 0.8,
      metalness: 0.2,
    });

    // Try to load a better texture if available
    textureLoader.load(
      '/assets/textures/grass.jpg',
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(40, 40); // Tile the texture
        texture.colorSpace = THREE.SRGBColorSpace;
        material.map = texture;
        material.needsUpdate = true;
        console.log('Custom grass texture loaded');
      },
      undefined,
      (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log('Using procedural grass texture (custom texture not found):', errorMessage);
      }
    );

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    this.mesh.receiveShadow = true;
    this.mesh.position.y = 0;

    scene.add(this.mesh);
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }
}

