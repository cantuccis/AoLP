import * as THREE from 'three';

/**
 * Generate procedural textures when assets are not available
 */
export class ProceduralTextures {
  /**
   * Generate a simple grass texture
   */
  static createGrassTexture(size = 256): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Base grass color
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(0, 0, size, size);

    // Add some variation
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const variation = Math.floor(Math.random() * 20) - 10;
      const brightness = 107 + variation;
      const green = 142 + variation;

      ctx.fillStyle = `rgb(${brightness}, ${green}, 35)`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Add some darker spots
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 3 + 1;

      ctx.fillStyle = 'rgba(50, 80, 20, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }

  /**
   * Generate a dirt road texture
   */
  static createDirtTexture(size = 256): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Base dirt color
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(0, 0, size, size);

    // Add variation
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const variation = Math.floor(Math.random() * 30) - 15;
      const r = 139 + variation;
      const g = 115 + variation;
      const b = 85 + variation;

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
  }
}

