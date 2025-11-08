import * as THREE from 'three';
import { StateManager } from '../state/StateManager';
import { PeasantState } from '../state/GameState';
import { NavigationGrid } from '../pathfinding/NavigationGrid';

export interface Task {
  update(deltaTime: number, peasantGroup: THREE.Group, stateManager: StateManager, peasantId: string): void;
}

export class WoodChoppingTask implements Task {
  private readonly CHOPPING_DURATION = 5000; // 5 seconds in ms
  private readonly WAITING_DURATION = 5000; // 5 seconds in ms
  private readonly WALK_SPEED = 2.5;
  
  private currentPath: THREE.Vector3[] | null = null;
  private currentWaypointIndex: number = 0;
  private pathRecalcTimer: number = 0;
  
  constructor(private navigationGrid: NavigationGrid | null) {}

  update(deltaTime: number, peasantGroup: THREE.Group, stateManager: StateManager, peasantId: string): void {
    const peasantState = stateManager.getPeasantById(peasantId);
    if (!peasantState || !peasantState.taskState) return;

    const taskState = peasantState.taskState;
    const gameTime = stateManager.getState().gameTime;

    switch (taskState.phase) {
      case 'walking_to_tree':
        this.handleWalkingToTree(peasantGroup, stateManager, peasantState, deltaTime);
        break;
      
      case 'chopping':
        this.handleChopping(peasantGroup, stateManager, peasantState, gameTime);
        break;
      
      case 'returning_to_town':
        this.handleReturningToTown(peasantGroup, stateManager, peasantState, deltaTime);
        break;
      
      case 'waiting':
        this.handleWaiting(peasantGroup, stateManager, peasantState, gameTime);
        break;
    }
  }

  private handleWalkingToTree(peasantGroup: THREE.Group, stateManager: StateManager, peasantState: PeasantState, deltaTime: number): void {
    if (!peasantState.taskState?.targetTreePosition) return;

    const target = new THREE.Vector3(
      peasantState.taskState.targetTreePosition.x,
      peasantState.taskState.targetTreePosition.y,
      peasantState.taskState.targetTreePosition.z
    );

    // Calculate path on first entry to this phase
    if (!this.currentPath && this.navigationGrid) {
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        this.pathRecalcTimer = 0;
        console.log(`Path found: ${path.length} waypoints to tree`);
      } else {
        console.warn('No path to tree, using direct movement');
      }
    }

    // Recalculate path every 5 seconds
    this.pathRecalcTimer += deltaTime;
    if (this.pathRecalcTimer >= 5.0 && this.navigationGrid) {
      console.log('Recalculating path to tree...');
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        console.log(`Path recalculated: ${path.length} waypoints`);
      }
      this.pathRecalcTimer = 0;
    }

    // Determine current target (waypoint or final target)
    let currentTarget: THREE.Vector3;
    if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
      currentTarget = this.currentPath[this.currentWaypointIndex];
    } else {
      currentTarget = target;
    }

    const distance = peasantGroup.position.distanceTo(currentTarget);

    if (distance < 0.5) {
      // Reached waypoint or destination
      if (this.currentPath && this.currentWaypointIndex < this.currentPath.length - 1) {
        // Move to next waypoint
        this.currentWaypointIndex++;
      } else {
        // Check if reached final tree destination
        const finalDistance = peasantGroup.position.distanceTo(target);
        if (finalDistance < 1.0) {
          // Arrived at tree
          this.currentPath = null;
          this.currentWaypointIndex = 0;
          this.pathRecalcTimer = 0;
          peasantState.taskState.phase = 'chopping';
          peasantState.taskState.startTime = stateManager.getState().gameTime;
          console.log(`Peasant ${peasantState.id} arrived at tree, starting to chop`);
        }
      }
    } else {
      // Keep walking toward current target
      const direction = new THREE.Vector3().subVectors(currentTarget, peasantGroup.position).normalize();
      peasantGroup.position.addScaledVector(direction, this.WALK_SPEED * deltaTime);
      peasantGroup.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  private handleChopping(_peasantGroup: THREE.Group, _stateManager: StateManager, peasantState: PeasantState, gameTime: number): void {
    if (!peasantState.taskState) return;
    const elapsed = gameTime - peasantState.taskState.startTime;
    
    if (elapsed >= this.CHOPPING_DURATION) {
      // Finished chopping
      peasantState.taskState.phase = 'returning_to_town';
      console.log(`Peasant ${peasantState.id} finished chopping, returning to town`);
    }
    // Peasant stays at tree with idle animation
  }

  private handleReturningToTown(peasantGroup: THREE.Group, stateManager: StateManager, peasantState: PeasantState, deltaTime: number): void {
    const town = stateManager.getTownById(peasantState.townId);
    if (!town) return;

    const target = new THREE.Vector3(town.position.x, town.position.y, town.position.z);

    // Calculate path on first entry to this phase
    if (!this.currentPath && this.navigationGrid) {
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        this.pathRecalcTimer = 0;
        console.log(`Path found: ${path.length} waypoints back to town`);
      } else {
        console.warn('No path to town, using direct movement');
      }
    }

    // Recalculate path every 5 seconds
    this.pathRecalcTimer += deltaTime;
    if (this.pathRecalcTimer >= 5.0 && this.navigationGrid) {
      console.log('Recalculating path to town...');
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        console.log(`Path recalculated: ${path.length} waypoints`);
      }
      this.pathRecalcTimer = 0;
    }

    // Determine current target (waypoint or final target)
    let currentTarget: THREE.Vector3;
    if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
      currentTarget = this.currentPath[this.currentWaypointIndex];
    } else {
      currentTarget = target;
    }

    const distance = peasantGroup.position.distanceTo(currentTarget);

    if (distance < 0.5) {
      // Reached waypoint or destination
      if (this.currentPath && this.currentWaypointIndex < this.currentPath.length - 1) {
        // Move to next waypoint
        this.currentWaypointIndex++;
      } else {
        // Check if reached final town destination
        const finalDistance = peasantGroup.position.distanceTo(target);
        if (finalDistance < 2.0) {
          // Arrived at town - chopping cycle complete!
          this.currentPath = null;
          this.currentWaypointIndex = 0;
          this.pathRecalcTimer = 0;
          
          if (peasantState.taskState) {
            // Award wood for completing the chopping cycle (only once per cycle)
            stateManager.addWood(1);
            
            peasantState.taskState.phase = 'waiting';
            peasantState.taskState.startTime = stateManager.getState().gameTime;
          }
          
          console.log(`Peasant ${peasantState.id} returned to town with wood, waiting`);
        }
      }
    } else {
      // Keep walking toward current target
      const direction = new THREE.Vector3().subVectors(currentTarget, peasantGroup.position).normalize();
      peasantGroup.position.addScaledVector(direction, this.WALK_SPEED * deltaTime);
      peasantGroup.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  private handleWaiting(_peasantGroup: THREE.Group, _stateManager: StateManager, peasantState: PeasantState, gameTime: number): void {
    if (!peasantState.taskState) return;
    const elapsed = gameTime - peasantState.taskState.startTime;
    
    if (elapsed >= this.WAITING_DURATION) {
      // Start next cycle - go to tree again
      // Reset path for new cycle
      this.currentPath = null;
      this.currentWaypointIndex = 0;
      this.pathRecalcTimer = 0;
      
      peasantState.taskState.phase = 'walking_to_tree';
      console.log(`Peasant ${peasantState.id} finished waiting, going to chop wood again`);
    }
    // Peasant stays at town with idle animation
  }
}

export class GoldMiningTask implements Task {
  private readonly MINING_DURATION = 5000; // 5 seconds in ms
  private readonly WAITING_DURATION = 5000; // 5 seconds in ms
  private readonly WALK_SPEED = 2.5;
  
  private currentPath: THREE.Vector3[] | null = null;
  private currentWaypointIndex: number = 0;
  private pathRecalcTimer: number = 0;
  
  constructor(private navigationGrid: NavigationGrid | null) {}

  update(deltaTime: number, peasantGroup: THREE.Group, stateManager: StateManager, peasantId: string): void {
    const peasantState = stateManager.getPeasantById(peasantId);
    if (!peasantState || !peasantState.taskState) return;

    const taskState = peasantState.taskState;
    const gameTime = stateManager.getState().gameTime;

    switch (taskState.phase) {
      case 'walking_to_mine':
        this.handleWalkingToMine(peasantGroup, stateManager, peasantState, deltaTime);
        break;
      
      case 'mining':
        this.handleMining(peasantGroup, stateManager, peasantState, gameTime);
        break;
      
      case 'walking_to_town':
        this.handleWalkingToTown(peasantGroup, stateManager, peasantState, deltaTime);
        break;
      
      case 'waiting_at_town':
        this.handleWaitingAtTown(peasantGroup, stateManager, peasantState, gameTime);
        break;
    }
  }

  private handleWalkingToMine(peasantGroup: THREE.Group, stateManager: StateManager, peasantState: PeasantState, deltaTime: number): void {
    if (!peasantState.taskState) return;
    const mine = stateManager.getMineById(peasantState.taskState.targetMineId || '');
    if (!mine) return;

    const target = new THREE.Vector3(mine.position.x, mine.position.y, mine.position.z);

    // Calculate path on first entry to this phase
    if (!this.currentPath && this.navigationGrid) {
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        this.pathRecalcTimer = 0;
        console.log(`Path found: ${path.length} waypoints to mine`);
      } else {
        console.warn('No path to mine, using direct movement');
      }
    }

    // Recalculate path every 5 seconds
    this.pathRecalcTimer += deltaTime;
    if (this.pathRecalcTimer >= 5.0 && this.navigationGrid) {
      console.log('Recalculating path to mine...');
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        console.log(`Path recalculated: ${path.length} waypoints`);
      }
      this.pathRecalcTimer = 0;
    }

    // Determine current target (waypoint or final target)
    let currentTarget: THREE.Vector3;
    if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
      currentTarget = this.currentPath[this.currentWaypointIndex];
    } else {
      currentTarget = target;
    }

    const distance = peasantGroup.position.distanceTo(currentTarget);

    if (distance < 0.5) {
      // Reached waypoint or destination
      if (this.currentPath && this.currentWaypointIndex < this.currentPath.length - 1) {
        // Move to next waypoint
        this.currentWaypointIndex++;
      } else {
        // Check if reached final mine destination
        const finalDistance = peasantGroup.position.distanceTo(target);
        if (finalDistance < 1.0) {
          // Arrived at mine
          this.currentPath = null;
          this.currentWaypointIndex = 0;
          this.pathRecalcTimer = 0;
          peasantState.taskState.phase = 'mining';
          peasantState.taskState.startTime = stateManager.getState().gameTime;
          console.log(`Peasant ${peasantState.id} arrived at mine, starting to mine`);
        }
      }
    } else {
      // Keep walking toward current target
      const direction = new THREE.Vector3().subVectors(currentTarget, peasantGroup.position).normalize();
      peasantGroup.position.addScaledVector(direction, this.WALK_SPEED * deltaTime);
      peasantGroup.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  private handleMining(_peasantGroup: THREE.Group, _stateManager: StateManager, peasantState: PeasantState, gameTime: number): void {
    if (!peasantState.taskState) return;
    const elapsed = gameTime - peasantState.taskState.startTime;
    
    if (elapsed >= this.MINING_DURATION) {
      // Finished mining
      peasantState.taskState.phase = 'walking_to_town';
      console.log(`Peasant ${peasantState.id} finished mining, returning to town`);
    }
    // Peasant stays at mine with idle animation
  }

  private handleWalkingToTown(peasantGroup: THREE.Group, stateManager: StateManager, peasantState: PeasantState, deltaTime: number): void {
    const town = stateManager.getTownById(peasantState.townId);
    if (!town) return;

    const target = new THREE.Vector3(town.position.x, town.position.y, town.position.z);

    // Calculate path on first entry to this phase
    if (!this.currentPath && this.navigationGrid) {
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        this.pathRecalcTimer = 0;
        console.log(`Path found: ${path.length} waypoints back to town`);
      } else {
        console.warn('No path to town, using direct movement');
      }
    }

    // Recalculate path every 5 seconds
    this.pathRecalcTimer += deltaTime;
    if (this.pathRecalcTimer >= 5.0 && this.navigationGrid) {
      console.log('Recalculating path to town...');
      const path = this.navigationGrid.findPath(peasantGroup.position, target);
      if (path && path.length > 0) {
        this.currentPath = path;
        this.currentWaypointIndex = 0;
        console.log(`Path recalculated: ${path.length} waypoints`);
      }
      this.pathRecalcTimer = 0;
    }

    // Determine current target (waypoint or final target)
    let currentTarget: THREE.Vector3;
    if (this.currentPath && this.currentWaypointIndex < this.currentPath.length) {
      currentTarget = this.currentPath[this.currentWaypointIndex];
    } else {
      currentTarget = target;
    }

    const distance = peasantGroup.position.distanceTo(currentTarget);

    if (distance < 0.5) {
      // Reached waypoint or destination
      if (this.currentPath && this.currentWaypointIndex < this.currentPath.length - 1) {
        // Move to next waypoint
        this.currentWaypointIndex++;
      } else {
        // Check if reached final town destination
        const finalDistance = peasantGroup.position.distanceTo(target);
        if (finalDistance < 2.0) {
          // Arrived at town - mining cycle complete!
          this.currentPath = null;
          this.currentWaypointIndex = 0;
          this.pathRecalcTimer = 0;
          
          if (peasantState.taskState) {
            // Award gold for completing the mining cycle (only once per cycle)
            stateManager.addGold(1);
            
            peasantState.taskState.phase = 'waiting_at_town';
            peasantState.taskState.startTime = stateManager.getState().gameTime;
          }
          
          console.log(`Peasant ${peasantState.id} returned to town with gold, waiting`);
        }
      }
    } else {
      // Keep walking toward current target
      const direction = new THREE.Vector3().subVectors(currentTarget, peasantGroup.position).normalize();
      peasantGroup.position.addScaledVector(direction, this.WALK_SPEED * deltaTime);
      peasantGroup.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  private handleWaitingAtTown(_peasantGroup: THREE.Group, _stateManager: StateManager, peasantState: PeasantState, gameTime: number): void {
    if (!peasantState.taskState) return;
    const elapsed = gameTime - peasantState.taskState.startTime;
    
    if (elapsed >= this.WAITING_DURATION) {
      // Start next cycle
      // Reset path for new cycle
      this.currentPath = null;
      this.currentWaypointIndex = 0;
      this.pathRecalcTimer = 0;
      
      peasantState.taskState.phase = 'walking_to_mine';
      console.log(`Peasant ${peasantState.id} finished waiting, going to mine again`);
    }
    // Peasant stays at town with idle animation
  }
}

