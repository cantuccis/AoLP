import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { PeasantData, PropData } from './WorldData';
import { StateManager } from '../state/StateManager';
import { GoldMiningTask, WoodChoppingTask, Task } from '../tasks/TaskSystem';
import { NavigationGrid } from '../pathfinding/NavigationGrid';

/**
 * Handles peasant and prop placement
 */
export class PeasantSystem {
  private peasants: THREE.Group[] = [];
  private props: THREE.Group[] = [];
  private animationMixers: THREE.AnimationMixer[] = [];
  private selectedPeasant: THREE.Group | null = null;
  private peasantAnimations: Map<THREE.Group, {
    mixer: THREE.AnimationMixer;
    idle: THREE.AnimationAction;
    walk: THREE.AnimationAction;
    currentAction: THREE.AnimationAction;
  }> = new Map();
  private peasantMovement: Map<THREE.Group, {
    targetPosition: THREE.Vector3 | null;
    speed: number;
    currentPath: THREE.Vector3[] | null;
    currentWaypointIndex: number;
    pathRecalcTimer: number;
  }> = new Map();
  private selectionBoxes: Map<THREE.Group, THREE.Mesh> = new Map();
  private taskSystem: Map<string, Task> = new Map();
  private peasantIdMap: Map<THREE.Group, string> = new Map();
  private treePositions: Array<{ x: number; y: number; z: number }> = [];
  private taskIcons: Map<THREE.Group, THREE.Sprite> = new Map();
  private propBounds: THREE.Box3[] = [];
  private navigationGrid: NavigationGrid | null = null;

  constructor(
    private scene: THREE.Scene,
    private assetLoader: AssetLoader
  ) {}

  setNavigationGrid(grid: NavigationGrid): void {
    this.navigationGrid = grid;
  }

  createPeasant(peasantData: PeasantData): void {
    const peasantModel = this.assetLoader.cloneModel(peasantData.modelName);

    if (!peasantModel) {
      console.warn(`Peasant model not found: ${peasantData.modelName}`);
      // Create placeholder
      const geometry = new THREE.CapsuleGeometry(0.3, 1.5, 4, 8);
      const material = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.8,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.position.set(
        peasantData.position.x,
        peasantData.position.y + 1,
        peasantData.position.z
      );
      mesh.rotation.y = peasantData.rotation;
      this.peasants.push(mesh as unknown as THREE.Group);
      this.scene.add(mesh);
      return;
    }

    // Apply scale directly to the cloned model (like in RTS engine reference)
    // FBX models from this source are exported at ~100x scale (centimeters)
    const scale = 0.005; // Smaller scale for peasants
    peasantModel.scale.set(scale, scale, scale);
    
    peasantModel.position.set(
      peasantData.position.x,
      peasantData.position.y,
      peasantData.position.z
    );
    peasantModel.rotation.y = peasantData.rotation;
    
    console.log(`Peasant scaled to ${scale}x and positioned`);

    // Load animations (idle and walk)
    const idleModel = this.assetLoader.getModel('peasant_anim');
    const walkModel = this.assetLoader.getModel('peasant_walk');

    if (idleModel?.animations?.length && walkModel?.animations?.length) {
      const mixer = new THREE.AnimationMixer(peasantModel);
      const idleClip = idleModel.animations[0];
      const walkClip = walkModel.animations[0];
      
      const idleAction = mixer.clipAction(idleClip);
      const walkAction = mixer.clipAction(walkClip);
      
      idleAction.play();
      
      this.animationMixers.push(mixer);
      this.peasantAnimations.set(peasantModel, {
        mixer,
        idle: idleAction,
        walk: walkAction,
        currentAction: idleAction
      });
      
      console.log(`✓ Animations loaded: idle (${idleClip.duration.toFixed(2)}s), walk (${walkClip.duration.toFixed(2)}s)`);
    } else {
      console.warn('⚠️ No animations found for peasant');
    }

    // Initialize movement state
    this.peasantMovement.set(peasantModel, {
      targetPosition: null,
      speed: 2.5, // units per second
      currentPath: null,
      currentWaypointIndex: 0,
      pathRecalcTimer: 0,
    });

    // Add selection box
    this.addSelectionBox(peasantModel);

    // Verify final size after scaling
    const boxAfter = new THREE.Box3().setFromObject(peasantModel);
    const sizeAfter = boxAfter.getSize(new THREE.Vector3());
    console.log(`Peasant final size: ${sizeAfter.x.toFixed(2)} x ${sizeAfter.y.toFixed(2)} x ${sizeAfter.z.toFixed(2)}`);

    this.peasants.push(peasantModel);
    this.scene.add(peasantModel);

    console.log(`✓ Peasant (${peasantData.modelName}) created at (${peasantData.position.x}, ${peasantData.position.z})`);
  }

  /**
   * Update all animation mixers and peasant movement (call this from game loop)
   * @deprecated Use updateWithState instead when StateManager is available
   */
  update(deltaTime: number): void {
    // Update animation mixers
    for (const mixer of this.animationMixers) {
      mixer.update(deltaTime);
    }
    
    // Update peasant movement
    for (const [peasant, movement] of this.peasantMovement.entries()) {
      if (movement.targetPosition) {
        const currentPos = peasant.position;
        const direction = new THREE.Vector3()
          .subVectors(movement.targetPosition, currentPos);
        const distance = direction.length();
        
        if (distance < 0.5) {
          // Reached destination
          movement.targetPosition = null;
          
          // Switch to idle animation
          const anim = this.peasantAnimations.get(peasant);
          if (anim && anim.currentAction !== anim.idle) {
            anim.currentAction.fadeOut(0.2);
            anim.idle.reset().fadeIn(0.2).play();
            anim.currentAction = anim.idle;
          }
        } else {
          // Move toward target
          direction.normalize();
          const moveDistance = movement.speed * deltaTime;
          peasant.position.addScaledVector(direction, moveDistance);
          
          // Rotate to face direction
          const angle = Math.atan2(direction.x, direction.z);
          peasant.rotation.y = angle;
        }
      }
    }
  }

  /**
   * Create a peasant from state configuration
   */
  createPeasantFromState(peasantId: string, townPosition: THREE.Vector3): THREE.Group | null {
    const peasantModel = this.assetLoader.cloneModel('peasant');
    if (!peasantModel) {
      console.warn(`Peasant model not found for ${peasantId}`);
      return null;
    }

    const scale = 0.005;
    peasantModel.scale.set(scale, scale, scale);
    peasantModel.position.copy(townPosition);
    
    // Load animations (idle and walk)
    const idleModel = this.assetLoader.getModel('peasant_anim');
    const walkModel = this.assetLoader.getModel('peasant_walk');

    if (idleModel?.animations?.length && walkModel?.animations?.length) {
      const mixer = new THREE.AnimationMixer(peasantModel);
      const idleClip = idleModel.animations[0];
      const walkClip = walkModel.animations[0];
      
      const idleAction = mixer.clipAction(idleClip);
      const walkAction = mixer.clipAction(walkClip);
      
      idleAction.play();
      
      this.animationMixers.push(mixer);
      this.peasantAnimations.set(peasantModel, {
        mixer,
        idle: idleAction,
        walk: walkAction,
        currentAction: idleAction
      });
    }

    // Initialize movement state (for manual control)
    this.peasantMovement.set(peasantModel, {
      targetPosition: null,
      speed: 5.0,
      currentPath: null,
      currentWaypointIndex: 0,
      pathRecalcTimer: 0,
    });

    // Add selection box
    this.addSelectionBox(peasantModel);
    
    // Add task icon above head
    this.addTaskIcon(peasantModel);
    
    this.peasants.push(peasantModel);
    this.scene.add(peasantModel);
    this.peasantIdMap.set(peasantModel, peasantId);
    
    console.log(`✓ Peasant ${peasantId} created from state at (${townPosition.x.toFixed(1)}, ${townPosition.z.toFixed(1)})`);
    
    return peasantModel;
  }

  /**
   * Update peasants with state management
   */
  updateWithState(deltaTime: number, stateManager: StateManager): void {
    // Update animation mixers
    for (const mixer of this.animationMixers) {
      mixer.update(deltaTime);
    }
    
    // Update task-based peasants
    for (const peasant of this.peasants) {
      const peasantId = this.peasantIdMap.get(peasant);
      if (!peasantId) continue;
      
      const peasantState = stateManager.getPeasantById(peasantId);
      if (!peasantState) continue;
      
      // Update task icon based on current task
      this.updateTaskIcon(peasant, peasantState.taskType);
      
      if (peasantState.taskType === 'mine_gold') {
        let task = this.taskSystem.get(peasantId);
        if (!task || !(task instanceof GoldMiningTask)) {
          // Create new task if doesn't exist or wrong type (task reassignment)
          task = new GoldMiningTask(this.navigationGrid);
          this.taskSystem.set(peasantId, task);
        }
        task.update(deltaTime, peasant, stateManager, peasantId);
        
        // Update animation based on phase
        this.updateAnimationForTask(peasant, peasantState);
      } else if (peasantState.taskType === 'chop_wood') {
        let task = this.taskSystem.get(peasantId);
        if (!task || !(task instanceof WoodChoppingTask)) {
          // Create new task if doesn't exist or wrong type (task reassignment)
          // If no target tree position set, find closest tree
          if (!peasantState.taskState?.targetTreePosition) {
            const closestTree = this.findClosestTree(peasant.position);
            if (closestTree && peasantState.taskState) {
              peasantState.taskState.targetTreePosition = closestTree;
            }
          }
          task = new WoodChoppingTask(this.navigationGrid);
          this.taskSystem.set(peasantId, task);
        }
        task.update(deltaTime, peasant, stateManager, peasantId);
        
        // Update animation based on phase
        this.updateAnimationForTask(peasant, peasantState);
      } else if (peasantState.taskType === 'idle') {
        // Remove task if peasant is idle
        this.taskSystem.delete(peasantId);
      }
    }
    
    // Update manual movement (existing click-to-move) with pathfinding
    for (const [peasant, movement] of this.peasantMovement.entries()) {
      const peasantId = this.peasantIdMap.get(peasant);
      const peasantState = peasantId ? stateManager.getPeasantById(peasantId) : null;
      
      // Only allow manual movement if not assigned to task
      if (!peasantState || peasantState.taskType === 'idle') {
        if (movement.targetPosition) {
          // Update path recalculation timer
          movement.pathRecalcTimer += deltaTime;
          
          // Recalculate path every 5 seconds
          if (movement.pathRecalcTimer >= 5.0 && this.navigationGrid) {
            console.log('Recalculating path...');
            const startPos = peasant.position;
            const path = this.navigationGrid.findPath(startPos, movement.targetPosition);
            
            if (path && path.length > 0) {
              movement.currentPath = path;
              movement.currentWaypointIndex = 0;
              console.log(`Path recalculated: ${path.length} waypoints`);
            } else {
              console.warn('No path to target, using direct movement');
              movement.currentPath = null;
            }
            
            movement.pathRecalcTimer = 0;
          }
          
          // Determine current target (waypoint or final target)
          let currentTarget: THREE.Vector3;
          if (movement.currentPath && movement.currentWaypointIndex < movement.currentPath.length) {
            currentTarget = movement.currentPath[movement.currentWaypointIndex];
          } else {
            currentTarget = movement.targetPosition;
          }
          
          const currentPos = peasant.position;
          const direction = new THREE.Vector3()
            .subVectors(currentTarget, currentPos);
          const distance = direction.length();
          
          if (distance < 0.5) {
            // Reached waypoint or destination
            if (movement.currentPath && movement.currentWaypointIndex < movement.currentPath.length - 1) {
              // Move to next waypoint
              movement.currentWaypointIndex++;
            } else {
              // Reached final destination
              movement.targetPosition = null;
              movement.currentPath = null;
              movement.currentWaypointIndex = 0;
              
              // Switch to idle animation
              const anim = this.peasantAnimations.get(peasant);
              if (anim && anim.currentAction !== anim.idle) {
                anim.currentAction.fadeOut(0.2);
                anim.idle.reset().fadeIn(0.2).play();
                anim.currentAction = anim.idle;
              }
            }
          } else {
            // Move toward current target
            direction.normalize();
            const moveDistance = movement.speed * deltaTime;
            peasant.position.addScaledVector(direction, moveDistance);
            
            // Rotate to face direction
            const angle = Math.atan2(direction.x, direction.z);
            peasant.rotation.y = angle;
            
            // Switch to walk animation
            const anim = this.peasantAnimations.get(peasant);
            if (anim && anim.currentAction !== anim.walk) {
              anim.currentAction.fadeOut(0.2);
              anim.walk.reset().fadeIn(0.2).play();
              anim.currentAction = anim.walk;
            }
          }
        }
      }
    }
  }

  private updateAnimationForTask(peasant: THREE.Group, peasantState: { taskState?: { phase: string } }): void {
    const anim = this.peasantAnimations.get(peasant);
    if (!anim) return;
    
    const isWalking = peasantState.taskState?.phase === 'walking_to_mine' || 
                      peasantState.taskState?.phase === 'walking_to_town' ||
                      peasantState.taskState?.phase === 'walking_to_tree' ||
                      peasantState.taskState?.phase === 'returning_to_town';
    
    if (isWalking && anim.currentAction !== anim.walk) {
      anim.currentAction.fadeOut(0.2);
      anim.walk.reset().fadeIn(0.2).play();
      anim.currentAction = anim.walk;
    } else if (!isWalking && anim.currentAction !== anim.idle) {
      anim.currentAction.fadeOut(0.2);
      anim.idle.reset().fadeIn(0.2).play();
      anim.currentAction = anim.idle;
    }
  }

  setTreePositions(positions: Array<{ x: number; y: number; z: number }>): void {
    this.treePositions = positions;
  }

  private findClosestTree(position: THREE.Vector3): { x: number; y: number; z: number } | null {
    if (this.treePositions.length === 0) return null;

    let closestTree = this.treePositions[0];
    let minDistance = Infinity;

    for (const tree of this.treePositions) {
      const distance = Math.sqrt(
        Math.pow(position.x - tree.x, 2) +
        Math.pow(position.z - tree.z, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestTree = tree;
      }
    }

    return closestTree;
  }

  private addSelectionBox(peasant: THREE.Group): void {
    // Since peasant is scaled to 0.005, we need to make the box much larger
    // to compensate (divide by scale factor: 1 / 0.005 = 200)
    const scaleFactor = 0.005;
    const worldSize = 0.6; // Target size in world space (width/depth)
    const worldHeight = 0.1; // Much shorter height in world space
    const boxSize = worldSize / scaleFactor; // Convert to local space
    const boxHeight = worldHeight / scaleFactor;
    
    const geometry = new THREE.BoxGeometry(boxSize, boxHeight, boxSize);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.2, // Less visible
      transparent: true,
      wireframe: false
    });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(0, boxHeight / 2, 0); // Just above ground level
    box.name = 'SelectionBox';
    peasant.add(box);
    this.selectionBoxes.set(peasant, box);
  }

  private addTaskIcon(peasant: THREE.Group): void {
    // Create a sprite for the task icon
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        transparent: true,
        opacity: 0, // Start hidden
      })
    );
    
    // Position above peasant's head (in local space, accounting for 0.005 scale)
    const heightAboveHead = 240; // In local space (1.2 units in world space)
    sprite.position.set(0, heightAboveHead, 0);
    
    // Size in local space (0.2 units in world space)
    const iconSize = 40;
    sprite.scale.set(iconSize, iconSize, 1);
    
    sprite.name = 'TaskIcon';
    peasant.add(sprite);
    this.taskIcons.set(peasant, sprite);
  }

  private createIconTexture(emoji: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw dark circular background for better visibility
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 62, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw emoji
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private updateTaskIcon(peasant: THREE.Group, taskType: 'idle' | 'mine_gold' | 'chop_wood'): void {
    const sprite = this.taskIcons.get(peasant);
    if (!sprite) return;
    
    const material = sprite.material as THREE.SpriteMaterial;
    
    if (taskType === 'idle') {
      // Hide icon when idle
      material.opacity = 0;
    } else {
      // Show icon with appropriate emoji
      let emoji = '';
      if (taskType === 'mine_gold') {
        emoji = '⛏️'; // Pickaxe for mining
      } else if (taskType === 'chop_wood') {
        emoji = '🪓'; // Axe for wood chopping
      }
      
      if (emoji) {
        material.map = this.createIconTexture(emoji);
        material.opacity = 1;
        material.needsUpdate = true;
      }
    }
  }

  selectPeasant(peasant: THREE.Group): void {
    // Deselect previous
    if (this.selectedPeasant) {
      const prevBox = this.selectionBoxes.get(this.selectedPeasant);
      if (prevBox) {
        (prevBox.material as THREE.MeshBasicMaterial).opacity = 0.2;
      }
    }
    
    // Select new
    this.selectedPeasant = peasant;
    const box = this.selectionBoxes.get(peasant);
    if (box) {
      (box.material as THREE.MeshBasicMaterial).opacity = 0.5;
    }
    
    console.log('Peasant selected');
  }

  deselectPeasant(): void {
    if (this.selectedPeasant) {
      const box = this.selectionBoxes.get(this.selectedPeasant);
      if (box) {
        (box.material as THREE.MeshBasicMaterial).opacity = 0.2;
      }
      this.selectedPeasant = null;
      console.log('Peasant deselected');
    }
  }

  movePeasantTo(position: THREE.Vector3): void {
    if (!this.selectedPeasant) return;
    
    const movement = this.peasantMovement.get(this.selectedPeasant);
    if (movement) {
      movement.targetPosition = position.clone();
      movement.targetPosition.y = 0; // Keep on ground
      
      // Calculate path using navigation grid
      if (this.navigationGrid) {
        const startPos = this.selectedPeasant.position;
        const path = this.navigationGrid.findPath(startPos, movement.targetPosition);
        
        if (path && path.length > 0) {
          movement.currentPath = path;
          movement.currentWaypointIndex = 0;
          movement.pathRecalcTimer = 0;
          console.log(`Path found: ${path.length} waypoints`);
        } else {
          console.warn('No path to target, using direct movement');
          movement.currentPath = null;
        }
      } else {
        // Fallback if no navigation grid
        movement.currentPath = null;
      }
      
      // Switch to walk animation
      const anim = this.peasantAnimations.get(this.selectedPeasant);
      if (anim && anim.currentAction !== anim.walk) {
        anim.currentAction.fadeOut(0.2);
        anim.walk.reset().fadeIn(0.2).play();
        anim.currentAction = anim.walk;
      }
      
      console.log('Peasant moving to', position);
    }
  }

  getSelectedPeasant(): THREE.Group | null {
    return this.selectedPeasant;
  }

  createProp(propData: PropData): void {
    const prop = this.assetLoader.cloneModel(propData.modelName);

    if (!prop) {
      console.warn(`Prop model not found: ${propData.modelName}`);
      return;
    }

    prop.position.set(
      propData.position.x,
      propData.position.y,
      propData.position.z
    );
    prop.rotation.y = propData.rotation;
    prop.name = propData.modelName; // Set name for identification

    // Auto-scale props like buildings (FBX models are typically 100x too large)
    const box = new THREE.Box3().setFromObject(prop);
    const size = box.getSize(new THREE.Vector3());
    
    // Target size based on prop type
    let targetHeight = 8; // Default height for props like mines
    if (propData.modelName.includes('mine')) {
      targetHeight = 6; // Mines are medium-sized structures
    }
    
    if (size.y > 0.01) {
      const scaleFactor = targetHeight / size.y;
      prop.scale.multiplyScalar(scaleFactor);
      console.log(`Prop (${propData.modelName}) auto-scaled by ${scaleFactor.toFixed(2)}x to ${targetHeight}m height`);
    }
    
    // Apply additional scale if specified in data
    if (propData.scale && propData.scale !== 1.0) {
      prop.scale.multiplyScalar(propData.scale);
    }

    this.props.push(prop);
    this.scene.add(prop);

    // Calculate bounding box for pathfinding (but skip mines - peasants need to walk into them)
    if (!propData.modelName.includes('mine')) {
      prop.updateMatrixWorld(true);
      const propBox = new THREE.Box3().setFromObject(prop);
      this.propBounds.push(propBox);
      console.log(`✓ Prop marked as obstacle for pathfinding: ${propData.modelName}`);
    } else {
      console.log(`✓ Mine is walkable - not marked as obstacle for pathfinding`);
    }

    console.log(`✓ Prop created: ${propData.modelName} at (${propData.position.x}, ${propData.position.z})`);
  }

  getPeasants(): THREE.Group[] {
    return this.peasants;
  }

  getPeasantId(peasant: THREE.Group): string | undefined {
    return this.peasantIdMap.get(peasant);
  }

  getPeasantPosition(peasantId: string): THREE.Vector3 | null {
    for (const [peasant, id] of this.peasantIdMap.entries()) {
      if (id === peasantId) {
        return peasant.position.clone();
      }
    }
    return null;
  }

  getPeasantById(peasantId: string): THREE.Group | null {
    for (const [peasant, id] of this.peasantIdMap.entries()) {
      if (id === peasantId) {
        return peasant;
      }
    }
    return null;
  }

  getProps(): THREE.Group[] {
    return this.props;
  }

  getPropBounds(): THREE.Box3[] {
    return this.propBounds;
  }
}

