import { GameConfig } from '../state/GameState';

export class MockGameAPI {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async fetchGameConfig(): Promise<GameConfig> {
    // Simulate network delay
    await this.delay(500);
    
    return {
      towns: [
        { id: 'town_1', name: 'Riverside', position: { x: -30, y: 0, z: -30 } },
        { id: 'town_2', name: 'Hillcrest', position: { x: 25, y: 0, z: -20 } },
        { id: 'town_3', name: 'Oakwood', position: { x: 0, y: 0, z: 35 } }
      ],
      goldMines: [
        { id: 'mine_1', position: { x: -45, y: 0, z: -15 } }
      ],
      peasants: [
        { id: 'peasant_1', name: 'Aldric', townId: 'town_1', taskType: 'mine_gold' },
        { id: 'peasant_2', name: 'Bertram', townId: 'town_1', taskType: 'chop_wood' },
        { id: 'peasant_3', name: 'Cedric', townId: 'town_2', taskType: 'idle' },
        { id: 'peasant_4', name: 'Duncan', townId: 'town_2', taskType: 'chop_wood' },
        { id: 'peasant_5', name: 'Edgar', townId: 'town_3', taskType: 'idle' },
        { id: 'peasant_6', name: 'Finn', townId: 'town_3', taskType: 'chop_wood' },
        { id: 'peasant_7', name: 'Godwin', townId: 'town_1', taskType: 'idle' },
        { id: 'peasant_8', name: 'Harold', townId: 'town_3', taskType: 'idle' }
      ]
    };
  }
}

