import * as THREE from 'three';
import { InputManager } from './InputManager';
import { PeasantSystem } from '../world/PeasantSystem';
import { GameScene } from '../scene/GameScene';
import { StateManager } from '../state/StateManager';

export class ClickHandler {
  private inputManager: InputManager;
  private peasantSystem: PeasantSystem;
  private stateManager: StateManager;
  private ground: THREE.Mesh;
  private trees: THREE.Group[] = [];
  private props: THREE.Group[] = [];

  constructor(
    inputManager: InputManager,
    peasantSystem: PeasantSystem,
    gameScene: GameScene,
    stateManager: StateManager,
    trees: THREE.Group[],
    props: THREE.Group[]
  ) {
    this.inputManager = inputManager;
    this.peasantSystem = peasantSystem;
    this.stateManager = stateManager;
    this.trees = trees;
    this.props = props;
    
    // Create invisible ground plane for raycasting
    const groundGeometry = new THREE.PlaneGeometry(400, 400);
    const groundMaterial = new THREE.MeshBasicMaterial({ 
      visible: false 
    });
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.name = 'ClickGround';
    gameScene.scene.add(this.ground);
  }

  handleClick(event: MouseEvent): void {
    // Update raycaster with current mouse position
    this.inputManager.updateMousePosition(event);
    
    const peasants = this.peasantSystem.getPeasants();
    const clickableObjects = [...peasants, ...this.trees, ...this.props, this.ground];
    const intersections = this.inputManager.getIntersections(clickableObjects);
    
    if (intersections.length === 0) return;
    
    // Check if clicked on a peasant
    let clickedPeasant: THREE.Group | null = null;
    for (const peasant of peasants) {
      if (this.isIntersectedObject(intersections[0].object, peasant)) {
        clickedPeasant = peasant;
        break;
      }
    }
    
    if (clickedPeasant) {
      // Select peasant
      this.peasantSystem.selectPeasant(clickedPeasant);
      return;
    }
    
    // If a peasant is selected, check for task assignment
    const selectedPeasant = this.peasantSystem.getSelectedPeasant();
    if (selectedPeasant) {
      const peasantId = this.peasantSystem.getPeasantId(selectedPeasant);
      if (!peasantId) return;
      
      // Check if clicked on a tree
      let clickedTree: THREE.Group | null = null;
      for (const tree of this.trees) {
        if (this.isIntersectedObject(intersections[0].object, tree)) {
          clickedTree = tree;
          break;
        }
      }
      
      if (clickedTree) {
        // Assign wood chopping task
        const treePosition = clickedTree.position;
        this.stateManager.assignTaskToPeasant(peasantId, 'chop_wood', {
          x: treePosition.x,
          y: treePosition.y,
          z: treePosition.z
        });
        return;
      }
      
      // Check if clicked on a mine (prop with 'mine' in name)
      let clickedMine: THREE.Group | null = null;
      for (const prop of this.props) {
        if (prop.name.toLowerCase().includes('mine') && 
            this.isIntersectedObject(intersections[0].object, prop)) {
          clickedMine = prop;
          break;
        }
      }
      
      if (clickedMine) {
        // Assign gold mining task
        this.stateManager.assignTaskToPeasant(peasantId, 'mine_gold');
        return;
      }
      
      // If clicked on ground, move selected peasant
      if (intersections[0].object === this.ground) {
        this.peasantSystem.movePeasantTo(intersections[0].point);
      }
    }
  }

  private isIntersectedObject(obj: THREE.Object3D, target: THREE.Object3D): boolean {
    let current: THREE.Object3D | null = obj;
    while (current) {
      if (current === target) return true;
      current = current.parent;
    }
    return false;
  }
}

