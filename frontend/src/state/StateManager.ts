import { GameState, GameConfig, PeasantState, TownState, GoldMineState } from './GameState';
import { MockGameAPI } from '../api/MockGameAPI';

export class StateManager {
  private state: GameState;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.state = {
      gold: 0,
      wood: 0,
      towns: [],
      goldMines: [],
      peasants: [],
      gameTime: 0
    };
  }

  async initialize(): Promise<void> {
    const config = await MockGameAPI.fetchGameConfig();
    this.state.towns = config.towns;
    this.state.goldMines = config.goldMines;
    
    // Initialize peasants with state
    this.state.peasants = config.peasants.map(p => {
      let taskState = undefined;
      if (p.taskType === 'mine_gold') {
        taskState = {
          phase: 'walking_to_mine' as const,
          startTime: 0,
          targetMineId: this.state.goldMines[0]?.id
        };
      } else if (p.taskType === 'chop_wood') {
        taskState = {
          phase: 'walking_to_tree' as const,
          startTime: 0,
          targetTreePosition: undefined // Will be set when task starts
        };
      }
      return { ...p, taskState };
    });
  }

  update(deltaTime: number): void {
    this.state.gameTime += deltaTime * 1000; // Convert to milliseconds
  }

  getState(): GameState {
    return this.state;
  }

  getPeasantById(id: string): PeasantState | undefined {
    return this.state.peasants.find(p => p.id === id);
  }

  updatePeasantTask(id: string, updates: Partial<PeasantState>): void {
    const peasant = this.state.peasants.find(p => p.id === id);
    if (peasant) {
      Object.assign(peasant, updates);
    }
  }

  getTownById(id: string): TownState | undefined {
    return this.state.towns.find(t => t.id === id);
  }

  getMineById(id: string): GoldMineState | undefined {
    return this.state.goldMines.find(m => m.id === id);
  }

  addGold(amount: number): void {
    this.state.gold += amount;
    console.log(`💰 Gold earned! Total: ${this.state.gold}`);
  }

  addWood(amount: number): void {
    this.state.wood += amount;
    console.log(`🪵 Wood collected! Total: ${this.state.wood}`);
  }

  assignTaskToPeasant(peasantId: string, taskType: 'idle' | 'mine_gold' | 'chop_wood', targetTreePosition?: { x: number; y: number; z: number }): void {
    const peasant = this.state.peasants.find(p => p.id === peasantId);
    if (!peasant) return;

    peasant.taskType = taskType;

    if (taskType === 'mine_gold') {
      peasant.taskState = {
        phase: 'walking_to_mine' as const,
        startTime: this.state.gameTime,
        targetMineId: this.state.goldMines[0]?.id
      };
      console.log(`✓ Peasant ${peasantId} assigned to mine gold`);
    } else if (taskType === 'chop_wood' && targetTreePosition) {
      peasant.taskState = {
        phase: 'walking_to_tree' as const,
        startTime: this.state.gameTime,
        targetTreePosition
      };
      console.log(`✓ Peasant ${peasantId} assigned to chop wood`);
    } else {
      peasant.taskState = undefined;
      console.log(`✓ Peasant ${peasantId} set to idle`);
    }
  }
}

