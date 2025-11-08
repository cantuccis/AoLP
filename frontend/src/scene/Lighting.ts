import * as THREE from 'three';
import { LightingPreset, LIGHTING_PRESETS, LightingTime } from './LightingConfig';

/**
 * Manages scene lighting (sun + ambient)
 */
export class Lighting {
  private directionalLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private currentPreset: LightingTime = 'afternoon';

  constructor(scene: THREE.Scene, initialPreset: LightingTime = 'afternoon') {
    // Create directional light (sun/moon)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.directionalLight.castShadow = true;

    // Shadow configuration
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 200;
    this.directionalLight.shadow.bias = -0.0001;

    // Create ambient light (fill)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    scene.add(this.directionalLight);
    scene.add(this.ambientLight);

    // Apply initial preset
    this.applyPreset(initialPreset);

    // Optional: Add helper for debugging
    // const helper = new THREE.DirectionalLightHelper(this.directionalLight, 5);
    // scene.add(helper);
  }

  applyPreset(time: LightingTime): void {
    const preset = LIGHTING_PRESETS[time];
    if (!preset) {
      console.warn(`Unknown lighting preset: ${time}`);
      return;
    }

    // Update directional light
    this.directionalLight.color.setHex(preset.directionalLight.color);
    this.directionalLight.intensity = preset.directionalLight.intensity;
    this.directionalLight.position.set(
      preset.directionalLight.position.x,
      preset.directionalLight.position.y,
      preset.directionalLight.position.z
    );

    // Update ambient light
    this.ambientLight.color.setHex(preset.ambientLight.color);
    this.ambientLight.intensity = preset.ambientLight.intensity;

    this.currentPreset = time;
    console.log(`✓ Lighting preset changed to: ${preset.name}`);
  }

  getCurrentPreset(): LightingTime {
    return this.currentPreset;
  }

  getPresetColors(time: LightingTime): { skyColor: number; fogColor: number } {
    const preset = LIGHTING_PRESETS[time];
    return {
      skyColor: preset.skyColor,
      fogColor: preset.fogColor,
    };
  }

  update(_deltaTime: number): void {
    // Can be used for daylight cycle later
  }

  getDirectionalLight(): THREE.DirectionalLight {
    return this.directionalLight;
  }

  getAmbientLight(): THREE.AmbientLight {
    return this.ambientLight;
  }
}

