import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface AssetManifest {
  models: {
    [key: string]: string;
  };
  textures: {
    [key: string]: string;
  };
}

/**
 * Centralized asset loading with progress tracking
 */
export class AssetLoader {
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private textureLoader: THREE.TextureLoader;
  private loadingManager: THREE.LoadingManager;

  private models: Map<string, THREE.Group> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();

  private onProgressCallback?: (loaded: number, total: number) => void;
  private onCompleteCallback?: () => void;

  constructor() {
    // Create loading manager
    this.loadingManager = new THREE.LoadingManager();
    
    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log(`Loading: ${url} (${loaded}/${total})`);
      if (this.onProgressCallback) {
        this.onProgressCallback(loaded, total);
      }
    };

    this.loadingManager.onLoad = () => {
      console.log('All assets loaded');
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    };

    this.loadingManager.onError = (url) => {
      console.error(`Error loading: ${url}`);
    };

    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
  }

  setProgressCallback(callback: (loaded: number, total: number) => void): void {
    this.onProgressCallback = callback;
  }

  setCompleteCallback(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  async loadModel(name: string, path: string): Promise<THREE.Group> {
    // Determine loader based on file extension
    const extension = path.split('.').pop()?.toLowerCase();
    
    if (extension === 'fbx') {
      return this.loadFBXModel(name, path);
    } else {
      return this.loadGLTFModel(name, path);
    }
  }

  private async loadGLTFModel(name: string, path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          
          // Enable shadows on all meshes
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          this.models.set(name, model);
          console.log(`✓ GLTF Model loaded: ${name}`);
          resolve(model);
        },
        undefined,
        (error) => {
          console.error(`Failed to load GLTF model ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  private async loadFBXModel(name: string, path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.fbxLoader.load(
        path,
        (model) => {
          // Debug: Check what's in the model
          let meshCount = 0;
          let boneCount = 0;
          let animCount = 0;
          
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              meshCount++;
              child.castShadow = true;
              child.receiveShadow = true;
            }
            if (child instanceof THREE.Bone) {
              boneCount++;
            }
          });
          
          if (model.animations) {
            animCount = model.animations.length;
          }
          
          console.log(`✓ FBX Model loaded: ${name} - Meshes: ${meshCount}, Bones: ${boneCount}, Animations: ${animCount}`);
          
          if (meshCount === 0) {
            console.warn(`⚠️ FBX Model ${name} has NO meshes! This might be animation-only.`);
          }

          this.models.set(name, model);
          resolve(model);
        },
        undefined,
        (error) => {
          console.error(`Failed to load FBX model ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  async loadTexture(name: string, path: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          this.textures.set(name, texture);
          console.log(`Texture loaded: ${name}`);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Failed to load texture ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  getModel(name: string): THREE.Group | undefined {
    return this.models.get(name);
  }

  getTexture(name: string): THREE.Texture | undefined {
    return this.textures.get(name);
  }

  cloneModel(name: string): THREE.Group | undefined {
    const original = this.models.get(name);
    if (!original) return undefined;
    // Use SkeletonUtils.clone for proper skeleton/animation cloning
    return clone(original);
  }
}

