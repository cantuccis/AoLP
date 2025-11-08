import { GameLoop } from './core/GameLoop';
import { GameScene } from './scene/GameScene';
import { Stats } from './debug/Stats';
import { WorldManager } from './world/WorldManager';
import { KeyboardControls } from './debug/KeyboardControls';
import { InputManager } from './input/InputManager';
import { ClickHandler } from './input/ClickHandler';
import { StateManager } from './state/StateManager';
import * as THREE from 'three';

/**
 * Main entry point for the game
 */
class Game {
  private gameLoop: GameLoop;
  private gameScene: GameScene;
  private stats: Stats;
  private worldManager: WorldManager;
  private keyboardControls: KeyboardControls;
  private inputManager: InputManager;
  private clickHandler: ClickHandler | null = null;
  private stateManager: StateManager;

  constructor() {
    console.log('Initializing Medieval Kingdom 3D...');

    // Get canvas element
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Initialize components
    this.stats = new Stats();
    this.gameScene = new GameScene(canvas);
    this.worldManager = new WorldManager(this.gameScene.scene);
    this.keyboardControls = new KeyboardControls();
    this.stateManager = new StateManager();

    // Initialize input system
    this.inputManager = new InputManager(this.gameScene.camera, canvas);

    // Setup keyboard controls
    this.setupKeyboardControls();
    
    // Setup peasant list click handling (event delegation)
    this.setupPeasantListClickHandling();

    // Initialize game loop
    this.gameLoop = new GameLoop(
      this.update.bind(this),
      this.render.bind(this)
    );

    console.log('Game initialized. Loading world...');
    this.initializeWorld();
  }

  private setupKeyboardControls(): void {
    // Toggle debug helpers (axes and grid)
    this.keyboardControls.registerKey('h', () => {
      const currentVisibility = this.gameScene.toggleHelpers(undefined);
      console.log(`Debug helpers: ${currentVisibility ? 'visible' : 'hidden'}`);
    });

    // Toggle stats
    this.keyboardControls.registerKey('s', () => {
      const statsElement = document.getElementById('stats');
      if (statsElement) {
        statsElement.style.display = 
          statsElement.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Deselect peasant with ESC
    this.keyboardControls.registerKey('Escape', () => {
      this.worldManager.getPeasantSystem().deselectPeasant();
    });

    // Time of day controls
    this.keyboardControls.registerKey('1', () => {
      this.gameScene.setTimeOfDay('morning');
    });
    this.keyboardControls.registerKey('2', () => {
      this.gameScene.setTimeOfDay('day');
    });
    this.keyboardControls.registerKey('3', () => {
      this.gameScene.setTimeOfDay('afternoon');
    });
    this.keyboardControls.registerKey('4', () => {
      this.gameScene.setTimeOfDay('night');
    });

    console.log('Keyboard controls:');
    console.log('  WASD - Move camera');
    console.log('  Mouse drag - Rotate camera angle');
    console.log('  Mouse wheel - Zoom in/out');
    console.log('  ESC - Deselect peasant');
    console.log('  1 - Morning lighting');
    console.log('  2 - Day lighting');
    console.log('  3 - Afternoon lighting');
    console.log('  4 - Night lighting');
    console.log('  H - Toggle debug helpers (axes/grid)');
    console.log('  S - Toggle stats display');
  }

  private setupPeasantListClickHandling(): void {
    // Wait for DOM to be ready
    const setupListener = () => {
      const peasantListElement = document.getElementById('peasant-list-items');
      if (!peasantListElement) {
        console.error('❌ Peasant list element (#peasant-list-items) not found!');
        return;
      }

      console.log('✓ Found peasant list element:', peasantListElement);

      // Use mousedown instead of click because OrbitControls consumes mouseup
      peasantListElement.addEventListener('mousedown', (event) => {
        event.preventDefault(); // Prevent OrbitControls from starting
        event.stopPropagation(); // Don't let it bubble to OrbitControls
        
        const target = event.target as HTMLElement;
        
        // Check if clicked on cancel button
        if (target.classList.contains('cancel-task-btn')) {
          // Don't process if button is disabled
          if ((target as HTMLButtonElement).disabled) {
            return;
          }
          
          const peasantId = target.getAttribute('data-peasant-id');
          if (peasantId) {
            this.stateManager.assignTaskToPeasant(peasantId, 'idle');
            console.log(`✓ Peasant ${peasantId} task cancelled (set to idle)`);
          }
          return; // Don't process camera centering
        }
        
        // Find the peasant-item ancestor
        let peasantItem = target;
        while (peasantItem && peasantItem !== peasantListElement) {
          if (peasantItem.classList.contains('peasant-item')) {
            break;
          }
          peasantItem = peasantItem.parentElement as HTMLElement;
        }
        
        if (peasantItem && peasantItem.classList.contains('peasant-item')) {
          const peasantId = peasantItem.getAttribute('data-peasant-id');
          
          if (peasantId) {
            const peasantSystem = this.worldManager.getPeasantSystem();
            const peasant = peasantSystem.getPeasantById(peasantId);
            const position = peasantSystem.getPeasantPosition(peasantId);
            
            if (peasant && position) {
              // Select the peasant (shows green selection box, enables task assignment)
              peasantSystem.selectPeasant(peasant);
              
              // Center camera on the peasant
              this.gameScene.centerCameraOn(position);
              console.log(`✓ Peasant ${peasantId} selected and camera centered`);
            }
          }
        }
      });
      
      console.log('✓ Peasant list click handler attached successfully');
    };

    // Call immediately if DOM is already loaded, or wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupListener);
    } else {
      setupListener();
    }
  }

  private async initializeWorld(): Promise<void> {
    const loadingElement = document.getElementById('loading');
    const loadingProgress = document.getElementById('loading-progress');
    
    try {
      // Initialize state first
      console.log('Loading game configuration from server...');
      if (loadingProgress) loadingProgress.style.width = '10%';
      
      await this.stateManager.initialize();
      
      if (loadingProgress) loadingProgress.style.width = '30%';
      
      // Then initialize world
      console.log('Loading world assets...');
      await this.worldManager.initialize();
      
      // Give GameScene access to WorldManager for controlling building lights
      this.gameScene.setWorldManager(this.worldManager);
      
      if (loadingProgress) loadingProgress.style.width = '60%';
      
      // Create peasants from state
      console.log('Spawning peasants from state...');
      const state = this.stateManager.getState();
      for (const peasantState of state.peasants) {
        const town = state.towns.find(t => t.id === peasantState.townId);
        if (town) {
          const pos = new THREE.Vector3(town.position.x, 0, town.position.z);
          // Add some random offset so they're not all stacked
          pos.x += (Math.random() - 0.5) * 4;
          pos.z += (Math.random() - 0.5) * 4;
          this.worldManager.getPeasantSystem().createPeasantFromState(peasantState.id, pos);
        }
      }
      
      // Pass tree positions to peasant system for wood chopping tasks
      const treePositions = this.worldManager.getTrees().getTreePositions();
      this.worldManager.getPeasantSystem().setTreePositions(treePositions);
      console.log(`✓ ${treePositions.length} tree positions available for wood chopping`);
      
      // Pass navigation grid to peasant system for pathfinding
      const navigationGrid = this.worldManager.getNavigationGrid();
      this.worldManager.getPeasantSystem().setNavigationGrid(navigationGrid);
      console.log('✓ Navigation grid connected to peasant system');
      
      if (loadingProgress) loadingProgress.style.width = '100%';
      
      console.log('World loaded. Starting game loop...');
      
      // Setup click handler after world is loaded
      const treeObjects = this.worldManager.getTrees().getTreeObjects();
      const props = this.worldManager.getPeasantSystem().getProps();
      
      this.clickHandler = new ClickHandler(
        this.inputManager,
        this.worldManager.getPeasantSystem(),
        this.gameScene,
        this.stateManager,
        treeObjects,
        props
      );
      
      // Listen for clicks on the canvas overlay (not the canvas itself)
      const canvasOverlay = document.getElementById('canvas-overlay');
      if (canvasOverlay) {
        canvasOverlay.addEventListener('click', (event: MouseEvent) => {
          if (this.clickHandler) {
            this.clickHandler.handleClick(event);
          }
        });
      } else {
        console.warn('Canvas overlay not found - click-to-move may not work');
      }
      
      this.gameLoop.start();
      
      // Hide loading screen
      setTimeout(() => {
        if (loadingElement) {
          loadingElement.classList.add('hidden');
        }
      }, 500);
    } catch (error) {
      console.error('Failed to initialize world:', error);
      if (loadingElement) {
        const loadingContent = loadingElement.querySelector('p');
        if (loadingContent) {
          loadingContent.textContent = 'Failed to load world. Check console for details.';
          loadingContent.style.color = '#ff5555';
        }
      }
    }
  }

  private update(deltaTime: number): void {
    // Update state
    this.stateManager.update(deltaTime);
    
    // Fixed timestep update (60Hz)
    this.gameScene.update(deltaTime);
    this.worldManager.updateWithState(deltaTime, this.stateManager);
    
    // Update UI
    this.updateGoldDisplay();
    this.updateWoodDisplay();
    this.updatePeasantList();
  }

  private updateGoldDisplay(): void {
    const goldAmountElement = document.getElementById('gold-amount');
    if (goldAmountElement) {
      const currentGold = this.stateManager.getState().gold;
      goldAmountElement.textContent = currentGold.toString();
    }
  }

  private updateWoodDisplay(): void {
    const woodAmountElement = document.getElementById('wood-amount');
    if (woodAmountElement) {
      const currentWood = this.stateManager.getState().wood;
      woodAmountElement.textContent = currentWood.toString();
    }
  }

  private updatePeasantList(): void {
    const peasantListElement = document.getElementById('peasant-list-items');
    if (!peasantListElement) return;

    const state = this.stateManager.getState();
    
    // Get currently selected peasant
    const selectedPeasant = this.worldManager.getPeasantSystem().getSelectedPeasant();
    const selectedPeasantId = selectedPeasant 
      ? this.worldManager.getPeasantSystem().getPeasantId(selectedPeasant) 
      : null;
    
    // Clear existing list
    peasantListElement.innerHTML = '';
    
    // Create list items for each peasant
    for (const peasant of state.peasants) {
      const item = document.createElement('div');
      item.className = 'peasant-item';
      
      // Add selected class if this peasant is currently selected
      if (selectedPeasantId && peasant.id === selectedPeasantId) {
        item.classList.add('selected');
      }
      
      // Add mining/chopping class if peasant is working
      if (peasant.taskType === 'mine_gold' || peasant.taskType === 'chop_wood') {
        item.classList.add('mining');
      }
      
      // Get task display text
      let taskText = 'Idle';
      let taskClass = 'idle';
      
      if (peasant.taskType === 'mine_gold' && peasant.taskState) {
        taskClass = 'mining';
        switch (peasant.taskState.phase) {
          case 'walking_to_mine':
            taskText = '⛏️ Going to mine';
            break;
          case 'mining':
            taskText = '⛏️ Mining gold';
            break;
          case 'walking_to_town':
            taskText = '🏠 Returning home';
            break;
          case 'waiting_at_town':
            taskText = '💤 Resting';
            break;
        }
      } else if (peasant.taskType === 'chop_wood' && peasant.taskState) {
        taskClass = 'mining';
        switch (peasant.taskState.phase) {
          case 'walking_to_tree':
            taskText = '🪓 Going to tree';
            break;
          case 'chopping':
            taskText = '🪓 Chopping wood';
            break;
          case 'returning_to_town':
            taskText = '🏠 Returning home';
            break;
          case 'waiting':
            taskText = '💤 Resting';
            break;
        }
      }
      
      // Determine if cancel button should be disabled
      const isIdle = peasant.taskType === 'idle';
      const disabledAttr = isIdle ? 'disabled' : '';
      const buttonTitle = isIdle ? 'Peasant is already idle' : 'Cancel current task';
      
      item.innerHTML = `
        <div class="peasant-info">
          <span class="peasant-name">${peasant.name}</span>
          <span class="peasant-task ${taskClass}">${taskText}</span>
        </div>
        <button class="cancel-task-btn" data-peasant-id="${peasant.id}" title="${buttonTitle}" ${disabledAttr}>✖</button>
      `;
      
      // Add data attribute AFTER innerHTML (so it doesn't get overwritten)
      item.setAttribute('data-peasant-id', peasant.id);
      
      peasantListElement.appendChild(item);
    }
  }

  private render(_alpha: number): void {
    // Variable framerate render
    this.gameScene.render();
    this.stats.update();
  }
}

// Start the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});

